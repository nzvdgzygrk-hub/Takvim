const CITY = "Velbert";
const COUNTRY = "Germany";
const METHOD = 13; // Turkish Diyanet

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const NEXT_YEAR = CURRENT_YEAR + 1;

const prayerData = {}; // { [year]: { year:[..], ramadan:[..] } }

const tableBody = document.getElementById("times-body");
const tableTitle = document.getElementById("table-title");
const tableHintEl = document.getElementById("table-hint");
const ramadanBanner = document.getElementById("ramadan-banner");
const modeButtons = document.querySelectorAll(".mode-btn");

const ayAr = document.getElementById("ayah-ar");
const ayTr = document.getElementById("ayah-tr");
const ayRef = document.getElementById("ayah-ref");

const nowDateEl = document.getElementById("now-date");
const nowTimeEl = document.getElementById("now-time");

const todayDateLabel = document.getElementById("today-date-label");
const todayImsakEl = document.getElementById("today-imsak");
const todayGunesEl = document.getElementById("today-gunes");
const todayOgleEl = document.getElementById("today-ogle");
const todayIkindiEl = document.getElementById("today-ikindi");
const todayAksamEl = document.getElementById("today-aksam");
const todayYatsiEl = document.getElementById("today-yatsi");
const kerahatStatusEl = document.getElementById("kerahat-status");

const weekdayMap = {
  Sunday: "Pazar",
  Monday: "Pazartesi",
  Tuesday: "Salı",
  Wednesday: "Çarşamba",
  Thursday: "Perşembe",
  Friday: "Cuma",
  Saturday: "Cumartesi",
};

const monthNamesTr = [
  "",
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

// viele verschiedene kurze Ayetler
const ayatList = [
  {
    ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Şüphesiz zorlukla beraber bir kolaylık vardır.",
    ref: "İnşirah, 94:6",
  },
  {
    ar: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    tr: "Şüphesiz Allah sabredenlerle beraberdir.",
    ref: "Bakara, 2:153",
  },
  {
    ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    tr: "Bana dua edin, size cevap vereyim.",
    ref: "Mümin, 40:60",
  },
  {
    ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    tr: "Siz nerede olursanız olun, O sizinle beraberdir.",
    ref: "Hadid, 57:4",
  },
  {
    ar: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    tr: "Allah’ın rahmetinden ümidinizi kesmeyin.",
    ref: "Zümer, 39:53",
  },
  {
    ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    tr: "Kalpler ancak Allah’ı zikretmekle huzur bulur.",
    ref: "Ra’d, 13:28",
  },
  {
    ar: "وَعَسَى أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ",
    tr: "Hoşunuza gitmeyen bir şeyde sizin için hayır olabilir.",
    ref: "Bakara, 2:216",
  },
  {
    ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    tr: "Kim Allah’a tevekkül ederse, O ona yeter.",
    ref: "Talak, 65:3",
  },
  {
    ar: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
    tr: "Başarım ancak Allah’ın yardımı iledir.",
    ref: "Hud, 11:88",
  },
  {
    ar: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ",
    tr: "Şüphesiz Allah’ın rahmeti iyilik yapanlara yakındır.",
    ref: "A’raf, 7:56",
  },
];

let currentMode = "normal"; // "normal" oder "ramadan"
let kerahatIntervalId = null;

function cleanTime(str) {
  return String(str).split(" ")[0];
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
        imsak: cleanTime(t.Imsak),
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

function pad2(n) {
  return String(n).padStart(2, "0");
}

function updateClock() {
  if (!nowDateEl || !nowTimeEl) return;
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

function renderRandomAyah() {
  if (!ayAr || !ayTr || !ayRef) return;
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

function toDateFromRow(row) {
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum);
}

function parseTimeOnDate(row, timeStr) {
  const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10));
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum, hh, mm, 0, 0);
}

function renderTodayBlock(todayRow) {
  if (
    !todayRow ||
    !todayImsakEl ||
    !todayGunesEl ||
    !todayOgleEl ||
    !todayIkindiEl ||
    !todayAksamEl ||
    !todayYatsiEl ||
    !todayDateLabel
  )
    return;

  const d = pad2(todayRow.dayNum);
  const mName = monthNamesTr[todayRow.monthNum] || "";
  todayDateLabel.textContent = `${todayRow.day} • ${d} ${mName} ${todayRow.yearNum}`;

  todayImsakEl.textContent = todayRow.imsak;
  todayGunesEl.textContent = todayRow.gunes;
  todayOgleEl.textContent = todayRow.ogle;
  todayIkindiEl.textContent = todayRow.ikindi;
  todayAksamEl.textContent = todayRow.aksam;
  todayYatsiEl.textContent = todayRow.yatsi;

  updateKerahat(todayRow);
}

function updateKerahat(todayRow) {
  if (!kerahatStatusEl || !todayRow) return;

  try {
    const now = new Date();
    const ikindiTime = parseTimeOnDate(todayRow, todayRow.ikindi);
    const aksamTime = parseTimeOnDate(todayRow, todayRow.aksam);

    if (now >= ikindiTime && now < aksamTime) {
      const diffMin = (aksamTime - now) / (1000 * 60);
      if (diffMin <= 45) {
        kerahatStatusEl.textContent =
          "Kerahat: İkindi ile Akşam arası son 45 dakika.";
        return;
      }
    }

    kerahatStatusEl.textContent = "Kerahat: –";
  } catch (e) {
    console.error(e);
    kerahatStatusEl.textContent = "Kerahat: –";
  }
}

function setMode(newMode) {
  currentMode = newMode;
  modeButtons.forEach((btn) => {
    if (btn.dataset.mode === newMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (ramadanBanner) {
    ramadanBanner.classList.toggle("visible", newMode === "ramadan");
  }

  if (tableHintEl) {
    if (newMode === "normal") {
      tableHintEl.innerHTML =
        'Bugünden itibaren sonraki <strong>31 gün</strong> için vakitler.';
    } else {
      tableHintEl.textContent =
        "Bugünden itibaren Ramazan günleri (birinci günden son güne kadar) gösterilir.";
    }
  }

  renderTableAndToday();
}

async function renderTableAndToday() {
  if (!tableBody || !tableTitle) return;

  tableBody.innerHTML =
    '<tr><td colspan="8" style="padding:0.8rem;">Yükleniyor...</td></tr>';

  try {
    await loadYearData(CURRENT_YEAR);
    await loadYearData(NEXT_YEAR);

    const rowsCurrent = prayerData[CURRENT_YEAR].year;
    const rowsNext = prayerData[NEXT_YEAR].year;
    const ramadanCurrent = prayerData[CURRENT_YEAR].ramadan;
    const ramadanNext = prayerData[NEXT_YEAR].ramadan;

    const allRows = [...rowsCurrent, ...rowsNext];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Heute-Row finden für oben
    const todayRow = allRows.find((row) => {
      const rd = toDateFromRow(row);
      return rd.getTime() === today.getTime();
    });
    if (todayRow) renderTodayBlock(todayRow);

    // Kerahat-Interval nur einmal setzen
    if (kerahatIntervalId) clearInterval(kerahatIntervalId);
    if (todayRow) {
      kerahatIntervalId = setInterval(() => updateKerahat(todayRow), 60_000);
    }

    let rowsToShow = [];

    if (currentMode === "normal") {
      const limit = new Date(today);
      limit.setDate(limit.getDate() + 30); // heute + 30 => 31 Tage

      rowsToShow = allRows
        .filter((row) => {
          const rd = toDateFromRow(row);
          return rd >= today && rd <= limit;
        })
        .sort((a, b) => toDateFromRow(a) - toDateFromRow(b));

      tableTitle.textContent =
        "Velbert – Namaz Takvimi (Bugünden 31 Gün)";
    } else {
      const allRamadan = [...ramadanCurrent, ...ramadanNext].sort(
        (a, b) => toDateFromRow(a) - toDateFromRow(b)
      );

      rowsToShow = allRamadan.filter((row) => {
        const rd = toDateFromRow(row);
        return rd >= today;
      });

      tableTitle.textContent =
        "Velbert – Ramazan Günleri (birinci günden son güne kadar)";
    }

    tableBody.innerHTML = "";

    if (rowsToShow.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="8" style="padding:0.8rem;">Gösterilecek gün bulunamadı.</td>';
      tableBody.appendChild(tr);
      return;
    }

    rowsToShow.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="date-cell">${row.date}</td>
        <td class="day-cell">${row.day}</td>
        <td>${row.imsak}</td>
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

/* Event-Listener */

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    setMode(mode);
  });
});

/* Initialisierung */

renderRandomAyah();
updateClock();
setInterval(updateClock, 1000);
renderTableAndToday();
