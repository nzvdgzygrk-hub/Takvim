const CITY = "Velbert";
const COUNTRY = "Germany";
// 13 = Turkish Diyanet
const METHOD = 13;

const CURRENT_YEAR = new Date().getFullYear();

const prayerData = {}; // { [year]: { year: [..] } }

const modeButtons = document.querySelectorAll(".mode-btn");
const tableBody = document.getElementById("times-body");
const tableTitle = document.getElementById("table-title");
const monthSelect = document.getElementById("month-select");

const ayAr = document.getElementById("ayah-ar");
const ayTr = document.getElementById("ayah-tr");
const ayRef = document.getElementById("ayah-ref");

const nowDateEl = document.getElementById("now-date");
const nowTimeEl = document.getElementById("now-time");

const weekdayMap = {
  Sunday: "Pazar",
  Monday: "Pazartesi",
  Tuesday: "Salı",
  Wednesday: "Çarşamba",
  Thursday: "Perşembe",
  Friday: "Cuma",
  Saturday: "Cumartesi",
};

const monthNamesTr = {
  1: "Ocak",
  2: "Şubat",
  3: "Mart",
  4: "Nisan",
  5: "Mayıs",
  6: "Haziran",
  7: "Temmuz",
  8: "Ağustos",
  9: "Eylül",
  10: "Ekim",
  11: "Kasım",
  12: "Aralık",
};

const ayatList = [
  {
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Şüphesiz zorlukla beraber bir kolaylık vardır.",
    ref: "İnşirah Suresi, 94:6",
  },
  {
    ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    tr: "Şüphesiz Allah sabredenlerle beraberdir.",
    ref: "Bakara Suresi, 2:153",
  },
  {
    ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    tr: "Bana dua edin, size cevap vereyim.",
    ref: "Mümin Suresi, 40:60",
  },
];

let currentMode = "month"; // "month" oder "ramadan"
let currentMonth = new Date().getMonth() + 1; // 1–12

function cleanTime(str) {
  return String(str).split(" ")[0];
}

function setActiveMode(mode) {
  modeButtons.forEach((btn) => {
    if (btn.dataset.mode === mode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

async function loadYearData(year) {
  if (prayerData[year]) return;

  const yearRows = [];
  const ramadanRows = [];

  for (let month = 1; month <= 12; month++) {
    const url =
      "https://api.aladhan.com/v1/calendarByCity?" +
      `city=${encodeURIComponent(CITY)}` +
      `&country=${encodeURIComponent(COUNTRY)}` +
      `&method=${METHOD}` +
      `&month=${month}` +
      `&year=${year}`;

    const res = await fetch(url);
    const json = await res.json();

    if (json.code !== 200 || !Array.isArray(json.data)) {
      console.error("API error", json);
      throw new Error("Namaz vakti API hatası.");
    }

    json.data.forEach((dayObj) => {
      const g = dayObj.date.gregorian;
      const h = dayObj.date.hijri;
      const t = dayObj.timings;

      const [dayStr, monthStr, yearStr] = g.date.split("-");
      const d = parseInt(dayStr, 10);
      const m = parseInt(monthStr, 10);
      const y = parseInt(yearStr, 10);

      const dateStr = `${dayStr}.${monthStr}.${yearStr}`;
      const weekdayEn = g.weekday.en;
      const weekdayTr = weekdayMap[weekdayEn] || weekdayEn;

      const row = {
        date: dateStr,
        day: weekdayTr,
        dayNum: d,
        monthNum: m,
        yearNum: y,
        sabah: cleanTime(t.Fajr),
        gunes: cleanTime(t.Sunrise),
        ogle: cleanTime(t.Dhuhr),
        ikindi: cleanTime(t.Asr),
        aksam: cleanTime(t.Maghrib),
        yatsi: cleanTime(t.Isha),
        isRamadan: h.month.number === 9,
      };

      yearRows.push(row);
      if (row.isRamadan) {
        ramadanRows.push(row);
      }
    });
  }

  prayerData[year] = {
    year: yearRows,
    ramadan: ramadanRows,
  };
}

function isInFutureOrToday(row, today) {
  const rowDate = new Date(row.yearNum, row.monthNum - 1, row.dayNum);
  return rowDate >= today;
}

async function renderTable() {
  tableBody.innerHTML =
    '<tr><td colspan="8" style="padding:0.8rem;">Yükleniyor...</td></tr>';

  try {
    await loadYearData(CURRENT_YEAR);
    const yearData = prayerData[CURRENT_YEAR];
    const allRows = yearData.year;
    const ramadanRows = yearData.ramadan;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let rowsToShow = [];

    if (currentMode === "month") {
      rowsToShow = allRows.filter((row) => {
        if (row.monthNum !== currentMonth) return false;

        // Nur aktuelle + zukünftige Tage zeigen
        return isInFutureOrToday(row, today);
      });

      const monthName = monthNamesTr[currentMonth] || "";
      tableTitle.textContent = `Velbert – ${monthName} ${CURRENT_YEAR} (bugünden itibaren)`;
    } else {
      // Ramazan-Modus
      rowsToShow = ramadanRows.filter((row) =>
        isInFutureOrToday(row, today)
      );
      tableTitle.textContent = `Velbert – Ramazan Günleri ${CURRENT_YEAR} (bugünden itibaren)`;
    }

    tableBody.innerHTML = "";

    if (rowsToShow.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="8" style="padding:0.8rem;">Gösterilecek gün bulunamadı (ya Ramazan başlamadı ya da yıl sonuna geldik).</td>';
      tableBody.appendChild(tr);
      return;
    }

    rowsToShow.forEach((row) => {
      const tr = document.createElement("tr");
      if (row.isRamadan) {
        tr.classList.add("ramadan-row");
      }

      tr.innerHTML = `
        <td class="date-cell">${row.date}</td>
        <td class="day-cell">${row.day}</td>
        <td>${row.sabah}</td>
        <td>${row.gunes}</td>
        <td>${row.ogle}</td>
        <td>${row.ikindi}</td>
        <td>${row.aksam}</td>
        <td>${row.yatsi}</td>
      `;

      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      '<tr><td colspan="8" style="padding:0.8rem;color:#fca5a5;">Namaz vakitleri alınırken bir hata oluştu. Lütfen sayfayı yenile veya daha sonra tekrar dene.</td></tr>';
  }
}

function renderRandomAyah() {
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

function pad2(n) {
  return n.toString().padStart(2, "0");
}

function updateClock() {
  const now = new Date();
  const d = pad2(now.getDate());
  const m = pad2(now.getMonth() + 1);
  const y = now.getFullYear();
  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());

  nowDateEl.textContent = `${d}.${m}.${y}`;
  nowTimeEl.textContent = `${hh}:${mm}:${ss}`;
}

/* Event-Listener */

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    currentMode = mode;
    setActiveMode(mode);
    renderTable();
  });
});

monthSelect.addEventListener("change", () => {
  currentMonth = Number(monthSelect.value);
  if (currentMode !== "month") {
    currentMode = "month";
    setActiveMode("month");
  }
  renderTable();
});

/* Initialisierung */

// aktuellen Monat im Select setzen
monthSelect.value = String(currentMonth);

renderRandomAyah();
updateClock();
setInterval(updateClock, 1000);
renderTable();
