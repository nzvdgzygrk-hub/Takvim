const CITY = "Velbert";
const COUNTRY = "Germany";
const METHOD = 13; // Turkish Diyanet

// dein Cloudflare-Worker
const API_BASE = "https://orange-sunset-ee02.5wyxcfngx6.workers.dev";

// Startpunkt für die Ansicht (365 Tage ab diesem Datum)
let viewStartDate = new Date();

const prayerData = {}; // { [year]: { year:[..], ramadan:[..] } }

const tableBody = document.getElementById("times-body");
const tableTitle = document.getElementById("table-title");
const tableHintEl = document.getElementById("table-hint");
const ramadanBanner = document.getElementById("ramadan-banner");
const modeButtons = document.querySelectorAll(".mode-btn");
const refreshBtn = document.getElementById("refresh-btn");
const tableCard = document.querySelector(".table-card");

const ayAr = document.getElementById("ayah-ar");
const ayTr = document.getElementById("ayah-tr");
const ayRef = document.getElementById("ayah-ref");
const nextAyahBtn = document.getElementById("next-ayah-btn");

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
  Saturday: "Cumartesi"
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
  "Aralık"
];

// Ayet-Liste (gekürzt, Fokus auf Namaz)
const ayatList = [
  { ar: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا", tr: "Namaz, müminler üzerine vakitleri belirlenmiş bir farzdır.", ref: "Nisa, 4:103" },
  { ar: "وَأَقِمِ الصَّلَاةَ لِذِكْرِي", tr: "Beni anmak için namaz kıl.", ref: "Taha, 20:14" },
  { ar: "أَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ", tr: "Namazı kıl; çünkü namaz hayasızlıktan alıkoyar.", ref: "Ankebut, 29:45" },
  { ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", tr: "Sabır ve namazla yardım isteyin.", ref: "Bakara, 2:45" },
  { ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ", tr: "Ey iman edenler! Sabır ve namazla yardım isteyin.", ref: "Bakara, 2:153" },
  { ar: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ", tr: "Namazlara ve orta namaza devam edin.", ref: "Bakara, 2:238" },
  { ar: "إِنَّ اللّهَ مَعَ الصَّابِرِينَ", tr: "Şüphesiz Allah sabredenlerle beraberdir.", ref: "Bakara, 2:153" },
  { ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", tr: "Allah bize yeter, O ne güzel vekildir.", ref: "Al-i İmran, 3:173" }
];

let currentMode = "normal"; // "normal" oder "ramadan"
let kerahatIntervalId = null;

// Hilfsfunktionen

function cleanTime(str) {
  return String(str).split(" ")[0];
}

function pad2(n) {
  return String(n).toString().padStart(2, "0");
}

// YEAR-Daten laden + in localStorage cachen
async function loadYearData(year) {
  if (prayerData[year]) return;

  const storageKey = "velbert-prayer-" + year;

  // aus localStorage lesen
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (
        parsed &&
        Array.isArray(parsed.yearRows) &&
        Array.isArray(parsed.ramadanRows)
      ) {
        prayerData[year] = {
          year: parsed.yearRows,
          ramadan: parsed.ramadanRows
        };
        return;
      }
    }
  } catch (e) {
    console.warn("localStorage read error", e);
  }

  const yearRows = [];
  const ramadanRows = [];

  for (let month = 1; month <= 12; month++) {
    const url =
      API_BASE +
      "/v1/calendarByCity?" +
      "city=" +
      encodeURIComponent(CITY) +
      "&country=" +
      encodeURIComponent(COUNTRY) +
      "&method=" +
      METHOD +
      "&month=" +
      month +
      "&year=" +
      year;

    const res = await fetch(url);
    const json = await res.json();

    if (json.code !== 200 || !Array.isArray(json.data)) {
      console.error("API error", json);
      throw new Error("Namaz vakti API hatası.");
    }

    json.data.forEach(function (dayObj) {
      const g = dayObj.date.gregorian;
      const h = dayObj.date.hijri;
      const t = dayObj.timings;

      const parts = g.date.split("-");
      const dayStr = parts[0];
      const monthStr = parts[1];
      const yearStr = parts[2];

      const d = parseInt(dayStr, 10);
      const m = parseInt(monthStr, 10);
      const y = parseInt(yearStr, 10);

      const dateStr = dayStr + "." + monthStr + "." + yearStr;
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
        isRamadan: h.month.number === 9
      };

      yearRows.push(row);
      if (row.isRamadan) {
        ramadanRows.push(row);
      }
    });
  }

  prayerData[year] = { year: yearRows, ramadan: ramadanRows };

  // im localStorage speichern
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ yearRows: yearRows, ramadanRows: ramadanRows })
    );
  } catch (e) {
    console.warn("localStorage write error", e);
  }
}

// Bereich [start, start+days) vorbereiten
async function loadRangeData(startDate, days) {
  const start = new Date(startDate.getTime());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start.getTime());
  end.setDate(end.getDate() + (days - 1));
  end.setHours(0, 0, 0, 0);

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  for (let y = startYear; y <= endYear; y++) {
    await loadYearData(y);
  }

  const allRows = [];
  const allRamadan = [];

  for (let y = startYear; y <= endYear; y++) {
    const data = prayerData[y];
    if (!data) continue;
    allRows.push.apply(allRows, data.year);
    allRamadan.push.apply(allRamadan, data.ramadan);
  }

  return { start: start, end: end, rows: allRows, ramadanRows: allRamadan };
}

// Uhr

function updateClock() {
  if (!nowDateEl || !nowTimeEl) return;
  const now = new Date();
  const d = pad2(now.getDate());
  const m = pad2(now.getMonth() + 1);
  const y = now.getFullYear();
  const hh = pad2(now.getHours());
  const mm = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());

  nowDateEl.textContent = d + "." + m + "." + y;
  nowTimeEl.textContent = hh + ":" + mm + ":" + ss;
}

// Ayet

function renderRandomAyah() {
  if (!ayAr || !ayTr || !ayRef) return;
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

// Datum von Row

function toDateFromRow(row) {
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum);
}

function parseTimeOnDate(row, timeStr) {
  const parts = timeStr.split(":");
  const hh = parseInt(parts[0], 10);
  const mm = parseInt(parts[1], 10);
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum, hh, mm, 0, 0);
}

// aktive Gebetszeit markieren

function updateActivePrayer(todayRow) {
  const allBoxes = document.querySelectorAll(".today-item");
  allBoxes.forEach(function (el) {
    el.classList.remove("active-prayer");
  });

  if (!todayRow) return;

  const slots = [
    { key: "imsak", el: todayImsakEl, time: todayRow.imsak },
    { key: "gunes", el: todayGunesEl, time: todayRow.gunes },
    { key: "ogle", el: todayOgleEl, time: todayRow.ogle },
    { key: "ikindi", el: todayIkindiEl, time: todayRow.ikindi },
    { key: "aksam", el: todayAksamEl, time: todayRow.aksam },
    { key: "yatsi", el: todayYatsiEl, time: todayRow.yatsi }
  ];

  const now = new Date();
  const times = slots.map(function (s) {
    return {
      key: s.key,
      el: s.el,
      date: parseTimeOnDate(todayRow, s.time)
    };
  });

  let activeKey = null;

  for (let i = 0; i < times.length; i++) {
    const cur = times[i];
    const next = times[i + 1];
    if (now >= cur.date && (!next || now < next.date)) {
      activeKey = cur.key;
      break;
    }
  }

  if (!activeKey) return;

  const activeSlot = slots.find(function (s) {
    return s.key === activeKey;
  });
  if (activeSlot && activeSlot.el) {
    const box = activeSlot.el.closest(".today-item");
    if (box) box.classList.add("active-prayer");
  }
}

// Kerahat

function updateKerahat(todayRow) {
  if (!kerahatStatusEl || !todayRow) return;

  kerahatStatusEl.classList.remove("kerahat-active", "kerahat-visible");
  kerahatStatusEl.textContent = "";

  try {
    const now = new Date();
    const ikindiTime = parseTimeOnDate(todayRow, todayRow.ikindi);
    const aksamTime = parseTimeOnDate(todayRow, todayRow.aksam);

    if (now >= ikindiTime && now < aksamTime) {
      const diffMin = (aksamTime - now) / (1000 * 60);
      if (diffMin <= 45) {
        kerahatStatusEl.textContent =
          "Kerahat vakti: İkindi ile Akşam arası son 45 dakika.";
        kerahatStatusEl.classList.add("kerahat-active", "kerahat-visible");
      }
    }
  } catch (e) {
    console.error(e);
  }
}

// Heute-Block

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
  ) {
    return;
  }

  const d = pad2(todayRow.dayNum);
  const mName = monthNamesTr[todayRow.monthNum] || "";
  todayDateLabel.textContent =
    todayRow.day + " • " + d + " " + mName + " " + todayRow.yearNum;

  todayImsakEl.textContent = todayRow.imsak;
  todayGunesEl.textContent = todayRow.gunes;
  todayOgleEl.textContent = todayRow.ogle;
  todayIkindiEl.textContent = todayRow.ikindi;
  todayAksamEl.textContent = todayRow.aksam;
  todayYatsiEl.textContent = todayRow.yatsi;

  updateKerahat(todayRow);
  updateActivePrayer(todayRow);
}

// Modus

function setMode(newMode) {
  currentMode = newMode;

  modeButtons.forEach(function (btn) {
    if (btn.dataset.mode === newMode) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  if (ramadanBanner) {
    if (newMode === "ramadan") {
      ramadanBanner.classList.add("visible");
    } else {
      ramadanBanner.classList.remove("visible");
    }
  }

  if (tableCard) {
    if (newMode === "ramadan") {
      tableCard.classList.add("table-card-ramadan");
    } else {
      tableCard.classList.remove("table-card-ramadan");
    }
  }

  if (tableHintEl) {
    if (newMode === "normal") {
      tableHintEl.innerHTML =
        'Bugünden itibaren sonraki <strong>365 gün</strong> gösterilir.';
    } else {
      tableHintEl.textContent =
        "Bugünden itibaren 365 gün içinde Ramazan günleri gösterilir.";
    }
  }

  renderTableAndToday();
}

// Haupt-Render (Tabelle + Heute)

async function renderTableAndToday() {
  if (!tableBody || !tableTitle) return;

  tableBody.innerHTML =
    '<tr><td colspan="8" style="padding:0.8rem;">Yükleniyor...</td></tr>';

  try {
    const rangeInfo = await loadRangeData(viewStartDate, 365);
    const rangeStart = rangeInfo.start;
    const rangeEnd = rangeInfo.end;
    const allRows = rangeInfo.rows;
    const allRamadanRows = rangeInfo.ramadanRows;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRow = allRows.find(function (row) {
      const rd = toDateFromRow(row);
      return rd.getTime() === today.getTime();
    });

    if (todayRow) {
      renderTodayBlock(todayRow);
      if (kerahatIntervalId) {
        clearInterval(kerahatIntervalId);
      }
      kerahatIntervalId = setInterval(function () {
        updateKerahat(todayRow);
        updateActivePrayer(todayRow);
      }, 60000);
    }

    let rowsToShow = [];

    if (currentMode === "normal") {
      rowsToShow = allRows
        .filter(function (row) {
          const d = toDateFromRow(row);
          return d >= rangeStart && d <= rangeEnd;
        })
        .sort(function (a, b) {
          return toDateFromRow(a) - toDateFromRow(b);
        });

      tableTitle.textContent = "Velbert – Namaz Takvimi (365 Gün)";
    } else {
      rowsToShow = allRamadanRows
        .filter(function (row) {
          const d = toDateFromRow(row);
          return d >= rangeStart && d <= rangeEnd;
        })
        .sort(function (a, b) {
          return toDateFromRow(a) - toDateFromRow(b);
        });

      tableTitle.textContent =
        "Velbert – Ramazan Günleri (365 Günlük aralık içinde)";
    }

    tableBody.innerHTML = "";

    if (rowsToShow.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="8" style="padding:0.8rem;">Gösterilecek gün bulunamadı.</td>';
      tableBody.appendChild(tr);
      return;
    }

    rowsToShow.forEach(function (row) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="date-cell">' +
        row.date +
        "</td>" +
        '<td class="day-cell">' +
        row.day +
        "</td>" +
        "<td>" +
        row.imsak +
        "</td>" +
        "<td>" +
        row.gunes +
        "</td>" +
        "<td>" +
        row.ogle +
        "</td>" +
        "<td>" +
        row.ikindi +
        "</td>" +
        "<td>" +
        row.aksam +
        "</td>" +
        "<td>" +
        row.yatsi +
        "</td>";
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      '<tr><td colspan="8" style="padding:0.8rem;color:#fca5a5;">Namaz vakitleri alınırken bir hata oluştu. (CORS / ağ problemi olabilir.)</td></tr>';
  }
}

/* Event-Listener */

modeButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    const mode = btn.dataset.mode;
    setMode(mode);
  });
});

if (refreshBtn) {
  refreshBtn.addEventListener("click", function () {
    viewStartDate = new Date();
    renderTableAndToday();
  });
}

if (nextAyahBtn) {
  nextAyahBtn.addEventListener("click", function () {
    renderRandomAyah();
  });
}

/* Initialisierung */

renderRandomAyah();
updateClock();
setInterval(updateClock, 1000);
renderTableAndToday();
