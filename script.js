// Konfiguration
const CITY = "Velbert";
const COUNTRY = "Germany";
const METHOD = 13;

// Dein Cloudflare-Worker
const API_BASE = "https://api.aladhan.com";

// Startdatum für 365 Tage
let viewStartDate = new Date();

// DOM-Elemente
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

// Daten-Cache im Speicher (kein localStorage – erstmal stabil)
const prayerData = {}; // { [year]: {year:[..], ramadan:[..]} }

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

// Viele verschiedene Ayet (du kannst beliebig erweitern)
const ayatList = [
  { ar: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    tr: "Namaz, müminler üzerine vakitleri belirlenmiş bir farzdır.",
    ref: "Nisa, 4:103" },
  { ar: "وَأَقِمِ الصَّلَاةَ لِذِكْرِي",
    tr: "Beni anmak için namaz kıl.",
    ref: "Taha, 20:14" },
  { ar: "أَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ",
    tr: "Namazı kıl; çünkü namaz hayasızlıktan ve kötülükten alıkoyar.",
    ref: "Ankebut, 29:45" },
  { ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    tr: "Sabır ve namazla Allah’tan yardım isteyin.",
    ref: "Bakara, 2:45" },
  { ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    tr: "Ey iman edenler! Sabır ve namazla yardım isteyin.",
    ref: "Bakara, 2:153" },
  { ar: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ",
    tr: "Namazlara ve orta namaza devam edin.",
    ref: "Bakara, 2:238" },
  { ar: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Şüphesiz zorlukla beraber bir kolaylık vardır.",
    ref: "İnşirah, 94:6" },
  { ar: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
    tr: "Gerçekten güçlükle beraber bir kolaylık vardır.",
    ref: "İnşirah, 94:5" },
  { ar: "ادْعُونِي أَسْتَجِبْ لَكُمْ",
    tr: "Bana dua edin, size icabet edeyim.",
    ref: "Mümin, 40:60" },
  { ar: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    tr: "Kalpler ancak Allah’ı zikretmekle huzur bulur.",
    ref: "Ra’d, 13:28" },
  { ar: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    tr: "Kim Allah’a tevekkül ederse, O ona yeter.",
    ref: "Talak, 65:3" },
  { ar: "لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ",
    tr: "Allah’ın rahmetinden ümit kesmeyin.",
    ref: "Zümer, 39:53" },
  { ar: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ",
    tr: "Allah’ın rahmeti iyilik yapanlara yakındır.",
    ref: "A’raf, 7:56" },
  { ar: "نَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ",
    tr: "Biz insana şah damarından daha yakınız.",
    ref: "Kaf, 50:16" },
  { ar: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ",
    tr: "Siz nerede olursanız olun O sizinle beraberdir.",
    ref: "Hadid, 57:4" },
  { ar: "وَعَسَى أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ",
    tr: "Hoşunuza gitmeyen bir şeyde sizin için hayır olabilir.",
    ref: "Bakara, 2:216" },
  { ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    tr: "Allah bize yeter, O ne güzel vekildir.",
    ref: "Al-i İmran, 3:173" },
  { ar: "رَبِّ زِدْنِي عِلْمًا",
    tr: "Rabbim, ilmimi artır.",
    ref: "Taha, 20:114" },
  { ar: "رَبِّ اشْرَحْ لِي صَدْرِي",
    tr: "Rabbim, göğsümü genişlet.",
    ref: "Taha, 20:25" },
  { ar: "رَبَّنَا تَقَبَّلْ مِنَّا",
    tr: "Rabbimiz, bizden (ibadetimizi) kabul eyle.",
    ref: "Bakara, 2:127" },
  { ar: "إِنَّ اللّهَ يُحِبُّ الْمُتَوَكِّلِينَ",
    tr: "Allah tevekkül edenleri sever.",
    ref: "Al-i İmran, 3:159" },
  { ar: "إِنَّ اللّهَ يُحِبُّ الْمُحْسِنِينَ",
    tr: "Allah iyilik yapanları sever.",
    ref: "Bakara, 2:195" },
  { ar: "إِنَّ اللّهَ يُحِبُّ الْتَّوَّابِينَ",
    tr: "Allah çokça tevbe edenleri sever.",
    ref: "Bakara, 2:222" },
  { ar: "إِنَّ اللّهَ غَفُورٌ رَّحِيمٌ",
    tr: "Şüphesiz Allah çok bağışlayandır, çok merhamet edendir.",
    ref: "Bakara, 2:173" }
  // → hier kannst du einfach in gleicher Form weitere Ayet anhängen
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

function toDateFromRow(row) {
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum);
}

function parseTimeOnDate(row, timeStr) {
  const [hh, mm] = timeStr.split(":").map((v) => parseInt(v, 10));
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum, hh, mm, 0, 0);
}

// Jahr laden (ohne localStorage, nur im RAM)
async function loadYearData(year) {
  if (prayerData[year]) return;

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
      throw new Error("Namaz vakti API hatası: " + json.status);
    }

    json.data.forEach((dayObj) => {
      const g = dayObj.date.gregorian;
      const h = dayObj.date.hijri;
      const t = dayObj.timings;

      const [dayStr, monthStr, yearStr] = g.date.split("-");
      const d = parseInt(dayStr, 10);
      const m = parseInt(monthStr, 10);
      const y = parseInt(yearStr, 10);

      const weekdayEn = g.weekday.en;
      const weekdayTr = weekdayMap[weekdayEn] || weekdayEn;

      const row = {
        date: `${dayStr}.${monthStr}.${yearStr}`,
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
      if (row.isRamadan) ramadanRows.push(row);
    });
  }

  prayerData[year] = { year: yearRows, ramadan: ramadanRows };
}

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
    allRows.push(...data.year);
    allRamadan.push(...data.ramadan);
  }

  return { start, end, rows: allRows, ramadanRows: allRamadan };
}

// UI-Funktionen

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
  if (!ayAr || !ayTr || !ayRef || ayatList.length === 0) return;
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

function updateActivePrayer(todayRow) {
  const boxes = document.querySelectorAll(".today-item");
  boxes.forEach((b) => b.classList.remove("active-prayer"));

  if (!todayRow) return;

  const slots = [
    { key: "imsak", el: todayImsakEl, time: todayRow.imsak },
    { key: "gunes", el: todayGunesEl, time: todayRow.gunes },
    { key: "ogle", el: todayOgleEl, time: todayRow.ogle },
    { key: "ikindi", el: todayIkindiEl, time: todayRow.ikindi },
    { key: "aksam", el: todayAksamEl, time: todayRow.aksam },
    { key: "yatsi", el: todayYatsiEl, time: todayRow.yatsi },
  ];

  const now = new Date();
  const times = slots.map((s) => ({
    key: s.key,
    el: s.el,
    date: parseTimeOnDate(todayRow, s.time),
  }));

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

  const activeSlot = slots.find((s) => s.key === activeKey);
  if (activeSlot && activeSlot.el) {
    const box = activeSlot.el.closest(".today-item");
    if (box) box.classList.add("active-prayer");
  }
}

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

function renderTodayBlock(todayRow) {
  if (!todayRow || !todayDateLabel) return;

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
  updateActivePrayer(todayRow);
}

function setMode(newMode) {
  currentMode = newMode;

  modeButtons.forEach((btn) => {
    if (btn.dataset.mode === newMode) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  if (ramadanBanner) {
    if (newMode === "ramadan") ramadanBanner.classList.add("visible");
    else ramadanBanner.classList.remove("visible");
  }

  if (tableCard) {
    if (newMode === "ramadan") tableCard.classList.add("table-card-ramadan");
    else tableCard.classList.remove("table-card-ramadan");
  }

  if (tableHintEl) {
    if (newMode === "normal") {
      tableHintEl.innerHTML =
        "Bugünden itibaren sonraki <strong>365 gün</strong> gösterilir.";
    } else {
      tableHintEl.textContent =
        "Bugünden itibaren 365 gün içinde Ramazan günleri gösterilir.";
    }
  }

  renderTableAndToday();
}

async function renderTableAndToday() {
  if (!tableBody || !tableTitle) return;

  tableBody.innerHTML =
    '<tr><td colspan="8" style="padding:0.8rem;">Yükleniyor...</td></tr>';

  try {
    const rangeInfo = await loadRangeData(viewStartDate, 365);
    const { start, end, rows, ramadanRows } = rangeInfo;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRow = rows.find(
      (row) => toDateFromRow(row).getTime() === today.getTime()
    );

    if (todayRow) {
      renderTodayBlock(todayRow);

      if (kerahatIntervalId) clearInterval(kerahatIntervalId);
      kerahatIntervalId = setInterval(() => {
        updateKerahat(todayRow);
        updateActivePrayer(todayRow);
      }, 60000);
    }

    let rowsToShow = [];
    if (currentMode === "normal") {
      rowsToShow = rows
        .filter((row) => {
          const d = toDateFromRow(row);
          return d >= start && d <= end;
        })
        .sort((a, b) => toDateFromRow(a) - toDateFromRow(b));

      tableTitle.textContent = "Velbert – Namaz Takvimi (365 Gün)";
    } else {
      rowsToShow = ramadanRows
        .filter((row) => {
          const d = toDateFromRow(row);
          return d >= start && d <= end;
        })
        .sort((a, b) => toDateFromRow(a) - toDateFromRow(b));

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

    rowsToShow.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td class="date-cell">${row.date}</td>` +
        `<td class="day-cell">${row.day}</td>` +
        `<td>${row.imsak}</td>` +
        `<td>${row.gunes}</td>` +
        `<td>${row.ogle}</td>` +
        `<td>${row.ikindi}</td>` +
        `<td>${row.aksam}</td>` +
        `<td>${row.yatsi}</td>`;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      '<tr><td colspan="8" style="padding:0.8rem;color:#fca5a5;">Namaz vakitleri alınırken bir hata oluştu. (CORS / ağ problemi olabilir.)</td></tr>';
  }
}

// Event-Listener
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    viewStartDate = new Date();
    renderTableAndToday();
  });
}

if (nextAyahBtn) {
  nextAyahBtn.addEventListener("click", () => {
    renderRandomAyah();
  });
}

// Init
renderRandomAyah();
updateClock();
setInterval(updateClock, 1000);
renderTableAndToday();
