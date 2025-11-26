const CITY = "Velbert";
const COUNTRY = "Germany";
const METHOD = 13; // Turkish Diyanet

const CURRENT_YEAR = new Date().getFullYear();
const NEXT_YEAR = CURRENT_YEAR + 1;

const prayerData = {}; // { [year]: { year:[..] } }

const tableBody = document.getElementById("times-body");
const tableTitle = document.getElementById("table-title");

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

function cleanTime(str) {
  return String(str).split(" ")[0];
}

async function loadYearData(year) {
  if (prayerData[year]) return;

  const yearRows = [];

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
      };

      yearRows.push(row);
    });
  }

  prayerData[year] = {
    year: yearRows,
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
  // timeStr "HH:MM"
  const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10));
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum, hh, mm, 0, 0);
}

function renderTodayBlock(allRows) {
  if (
    !todayImsakEl ||
    !todayGunesEl ||
    !todayOgleEl ||
    !todayIkindiEl ||
    !todayAksamEl ||
    !todayYatsiEl ||
    !todayDateLabel
  )
    return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRow = allRows.find((row) => {
    const rd = toDateFromRow(row);
    return rd.getTime() === today.getTime();
  });

  if (!todayRow) {
    todayDateLabel.textContent = "Bugünkü vakitler bulunamadı.";
    return;
  }

  const d = pad2(todayRow.dayNum);
  const m = monthNamesTr[todayRow.monthNum] || "";
  todayDateLabel.textContent = `${todayRow.day} • ${d} ${m} ${todayRow.yearNum}`;

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
      const diffMs = aksamTime - now;
      const diffMin = diffMs / (1000 * 60);
      if (diffMin <= 45) {
        kerahatStatusEl.textContent = "Kerahat: İkindi ile Akşam arası (son 45 dakika).";
        return;
      }
    }

    kerahatStatusEl.textContent = "Kerahat: –";
  } catch (e) {
    console.error(e);
    kerahatStatusEl.textContent = "Kerahat: –";
  }
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

    const allRows = [...rowsCurrent, ...rowsNext];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30); // heute + 30 = 31 Tage total

    const rowsToShow = allRows
      .filter((row) => {
        const rd = toDateFromRow(row);
        return rd >= today && rd <= limit;
      })
      .sort((a, b) => {
        const da = toDateFromRow(a);
        const db = toDateFromRow(b);
        return da - db;
      });

    tableTitle.textContent = "Velbert – Namaz Takvimi (Bugünden 31 Gün)";

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

    // Heute-Block
    renderTodayBlock(allRows);

    // Kerahat jede Minute prüfen
    setInterval(() => {
      const todayRow = allRows.find((row) => {
        const rd = toDateFromRow(row);
        const t = new Date();
        t.setHours(0, 0, 0, 0);
        return rd.getTime() === t.getTime();
      });
      if (todayRow) updateKerahat(todayRow);
    }, 60 * 1000);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      '<tr><td colspan="8" style="padding:0.8rem;color:#fca5a5;">Namaz vakitleri alınırken bir hata oluştu. Lütfen sayfayı yenile veya daha sonra tekrar dene.</td></tr>';
  }
}

/* Initialisierung */
renderRandomAyah();
updateClock();
setInterval(updateClock, 1000);
renderTableAndToday();
