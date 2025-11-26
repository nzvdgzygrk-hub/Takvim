// Basis-Konfiguration
const CITY = "Velbert";
const COUNTRY = "Germany";
const METHOD = 13;
const API_BASE = "https://api.aladhan.com";

// Offsets in Minuten (werden aus localStorage geladen)
const OFFSET_STORAGE_KEY = "velbert-offsets";

let OFFSETS = {
  imsak: 0,
  gunes: 0,
  ogle: 0,
  ikindi: 0,
  aksam: 0,
  yatsi: 0
};

// Startdatum für 365-Tage-Ansicht
let viewStartDate = new Date();
let currentMode = "normal"; // "normal" | "ramadan"
let kerahatIntervalId = null;

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

// Offset-Inputs
const offsetInputs = {
  imsak: document.getElementById("offset-imsak"),
  gunes: document.getElementById("offset-gunes"),
  ogle: document.getElementById("offset-ogle"),
  ikindi: document.getElementById("offset-ikindi"),
  aksam: document.getElementById("offset-aksam"),
  yatsi: document.getElementById("offset-yatsi")
};
const offsetSaveBtn = document.getElementById("offset-save-btn");
const offsetSavedMsg = document.getElementById("offset-saved-msg");

// Daten-Cache im RAM
const prayerData = {}; // { year: {year:[rows], ramadan:[rows]} }

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

// Ausgewählte Ayet (du kannst weitere hinzufügen)
const ayatList = [
  { ar: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا",
    tr: "Namaz, müminler üzerine vakitleri belirlenmiş bir farzdır.",
    ref: "Nisa, 4:103" },
  { ar: "وَأَقِمِ الصَّلَاةَ لِذِكْرِي",
    tr: "Beni anmak için namaz kıl.",
    ref: "Taha, 20:14" },
  { ar: "أَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ",
    tr: "Namazı kıl; çünkü namaz hayasızlıktan alıkoyar.",
    ref: "Ankebut, 29:45" },
  { ar: "حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَىٰ",
    tr: "Namazlara ve orta namaza devam edin.",
    ref: "Bakara, 2:238" },
  { ar: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    tr: "Sabır ve namazla Allah’tan yardım isteyin.",
    ref: "Bakara, 2:45" },
  { ar: "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    tr: "Ey iman edenler! Sabır ve namazla yardım isteyin.",
    ref: "Bakara, 2:153" },
  { ar: "إِنَّ اللّهَ مَعَ الصَّابِرِينَ",
    tr: "Şüphesiz Allah sabredenlerle beraberdir.",
    ref: "Bakara, 2:153" },
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
  { ar: "وَعَسَى أَن تُحِبُّوا شَيْئًا وَهُوَ شَرٌّ لَّكُمْ",
    tr: "Sevdiğiniz bir şey de sizin için şer olabilir.",
    ref: "Bakara, 2:216" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْمُتَوَكِّلِينَ",
    tr: "Allah tevekkül edenleri sever.",
    ref: "Al-i İmran, 3:159" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ",
    tr: "Allah iyilik yapanları sever.",
    ref: "Bakara, 2:195" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْتَّوَّابِينَ",
    tr: "Allah çokça tevbe edenleri sever.",
    ref: "Bakara, 2:222" },
  { ar: "إِنَّ اللَّهَ يُحِبُّ الْمُتَطَهِّرِينَ",
    tr: "Allah temizlenenleri sever.",
    ref: "Bakara, 2:222" },
  { ar: "إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ",
    tr: "Allah iyilik yapanların ecrini zayi etmez.",
    ref: "Tevbe, 9:120" },
  { ar: "إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ",
    tr: "Şüphesiz Allah çok bağışlayandır, çok merhamet edendir.",
    ref: "Bakara, 2:173" },
  { ar: "فَاسْتَقِمْ كَمَا أُمِرْتَ",
    tr: "Emrolunduğun gibi dosdoğru ol.",
    ref: "Hud, 11:112" },
  { ar: "وَبَشِّرِ الصَّابِرِينَ",
    tr: "Sabredenleri müjdele.",
    ref: "Bakara, 2:155" },
  { ar: "رَّبِّ زِدْنِي عِلْمًا",
    tr: "Rabbim, ilmimi artır.",
    ref: "Taha, 20:114" },
  { ar: "رَبِّ اشْرَحْ لِي صَدْرِي",
    tr: "Rabbim göğsümü genişlet.",
    ref: "Taha, 20:25" },
  { ar: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا",
    tr: "Rabbimiz, biz kendimize zulmettik.",
    ref: "A’raf, 7:23" },
  { ar: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا",
    tr: "Rabbimiz, günahlarımızı bağışla.",
    ref: "Al-i İmran, 3:16" },
  { ar: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً",
    tr: "Rabbimiz, bize dünyada iyilik ver.",
    ref: "Bakara, 2:201" },
  { ar: "وَفِي الْآخِرَةِ حَسَنَةً",
    tr: "Ahirette de iyilik ver.",
    ref: "Bakara, 2:201" },
  { ar: "رَبَّنَا تَقَبَّلْ مِنَّا",
    tr: "Rabbimiz, bizden (ibadetimizi) kabul eyle.",
    ref: "Bakara, 2:127" },
  { ar: "رَبِّ اغْفِرْ وَارْحَمْ",
    tr: "Rabbim, bağışla ve merhamet et.",
    ref: "Müminun, 23:118" },
  { ar: "فَاذْكُرُونِي أَذْكُرْكُمْ",
    tr: "Beni anın ki ben de sizi anayım.",
    ref: "Bakara, 2:152" },
  { ar: "لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
    tr: "Onlara korku yoktur, onlar mahzun olmayacaklardır.",
    ref: "Yunus, 10:62" },
  { ar: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ",
    tr: "Allah’ın rahmetinden ümidinizi kesmeyin.",
    ref: "Yusuf, 12:87" },
  { ar: "إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ",
    tr: "Allah katında en değerliniz, en takvalı olanınızdır.",
    ref: "Hucurat, 49:13" },
  { ar: "إِنَّ اللّهَ لاَ يُغَيِّرُ مَا بِقَوْمٍ",
    tr: "Allah, bir kavim kendini değiştirmedikçe durumlarını değiştirmez.",
    ref: "Ra’d, 13:11" },
  { ar: "اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ",
    tr: "Allah göklerin ve yerin nurudur.",
    ref: "Nur, 24:35" },
  { ar: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    tr: "Allah bize yeter, O ne güzel vekildir.",
    ref: "Al-i İmran, 3:173" },
  { ar: "نِعْمَ الْمَوْلَى وَنِعْمَ النَّصِيرُ",
    tr: "O ne güzel Mevlâ, ne güzel yardımcıdır.",
    ref: "Enfal, 8:40" },
  { ar: "إِنَّ رَبِّي لَطِيفٌ لِّمَا يَشَاءُ",
    tr: "Rabbim dilediğine karşı lütuf sahibidir.",
    ref: "Yusuf, 12:100" },
  { ar: "إِنَّ رَبَّكَ غَفُورٌ رَّحِيمٌ",
    tr: "Şüphesiz Rabbin çok bağışlayan, çok merhamet edendir.",
    ref: "Kehf, 18:58" },
  { ar: "إِنَّ رَبَّكَ وَاسِعُ الرَّحْمَةِ",
    tr: "Şüphesiz Rabbin rahmet sahibidir, rahmeti geniştir.",
    ref: "En’am, 6:147" },
  { ar: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    tr: "Kim Allah’tan sakınırsa, O ona bir çıkış yolu verir.",
    ref: "Talak, 65:2" },
  { ar: "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    tr: "Onu ummadığı yerden rızıklandırır.",
    ref: "Talak, 65:3" },
  { ar: "إِنَّ اللَّهَ لَطِيفٌ بِعِبَادِهِ",
    tr: "Allah kullarına karşı lütuf sahibidir.",
    ref: "Şura, 42:19" },
  { ar: "فَاللَّهُ خَيْرٌ حَافِظًا",
    tr: "Allah, en hayırlı koruyucudur.",
    ref: "Yusuf, 12:64" },
  { ar: "إِنَّ اللَّهَ مَعَنَا",
    tr: "Şüphesiz Allah bizimle beraberdir.",
    ref: "Tevbe, 9:40" },
  { ar: "وَمَا الْحَيَاةُ الدُّنْيَا إِلَّا مَتَاعُ الْغُرُورِ",
    tr: "Dünya hayatı aldatıcı bir metadan ibarettir.",
    ref: "Al-i İmran, 3:185" },
  { ar: "مَا عِندَ اللَّهِ خَيْرٌ وَأَبْقَى",
    tr: "Allah katındaki daha hayırlı ve daha kalıcıdır.",
    ref: "Kasas, 28:60" },
  { ar: "وَاتَّقُواْ اللّهَ لَعَلَّكُمْ تُفْلِحُونَ",
    tr: "Allah’tan sakının ki kurtuluşa eresiniz.",
    ref: "Bakara, 2:189" },
  { ar: "إِنَّ اللّهَ يُحِبُّ الْمُقْسِطِينَ",
    tr: "Allah adaletli davrananları sever.",
    ref: "Maide, 5:42" },
  { ar: "اللَّهُ خَالِقُ كُلِّ شَيْءٍ",
    tr: "Allah her şeyin yaratıcısıdır.",
    ref: "Zümer, 39:62" },
  { ar: "وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    tr: "O, her şeye güç yetirendir.",
    ref: "Mülk, 67:1" },
  { ar: "وَهُوَ عَلَى كُلِّ شَيْءٍ وَكِيلٌ",
    tr: "O, her şeyin üzerinde vekildir.",
    ref: "Şura, 42:6" },
  { ar: "إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ",
    tr: "Şüphesiz O işitendir, görendir.",
    ref: "İsra, 17:1" },
  { ar: "إِنَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ",
    tr: "O her şeyi hakkıyla bilendir.",
    ref: "Şura, 42:12" },
  { ar: "وَهُوَ الْغَفُورُ الرَّحِيمُ",
    tr: "O, çok bağışlayan, çok merhamet edendir.",
    ref: "Yunus, 10:107" },
  { ar: "وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ",
    tr: "Başarım yalnızca Allah’ın yardımı iledir.",
    ref: "Hud, 11:88" },
  { ar: "وَمَن يَغْفِرُ الذُّنُوبَ إِلَّا اللَّهُ",
    tr: "Günahları Allah’tan başka kim bağışlayabilir?",
    ref: "Al-i İmran, 3:135" },
  { ar: "إِنَّ رَبِّي قَرِيبٌ مُّجِيبٌ",
    tr: "Şüphesiz Rabbim yakındır, duaları kabul edendir.",
    ref: "Hud, 11:61" },
  { ar: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ",
    tr: "Rahmetim her şeyi kuşatmıştır.",
    ref: "A’raf, 7:156" },
  { ar: "إِنَّ اللَّهَ يُدَافِعُ عَنِ الَّذِينَ آمَنُوا",
    tr: "Allah, iman edenleri savunur.",
    ref: "Hac, 22:38" },
  { ar: "سَلَامٌ قَوْلًا مِّن رَّبٍّ رَّحِيمٍ",
    tr: "Onlara, çok merhametli Rab’den bir söz olarak 'Selâm' vardır.",
    ref: "Yasin, 36:58" },
  { ar: "إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ",
    tr: "Şüphesiz iyiler nimet içindedir.",
    ref: "İnfitâr, 82:13" },
  { ar: "إِنَّ الْفُجَّارَ لَفِي جَحِيمٍ",
    tr: "Şüphesiz günahkârlar cehennem içindedir.",
    ref: "İnfitâr, 82:14" },
  { ar: "وَأَنَّ إِلَى رَبِّكَ الْمُنتَهَى",
    tr: "Son varış Rabbinedir.",
    ref: "Necm, 53:42" }
];


// Hilfsfunktionen
function cleanTime(str) {
  return String(str).split(" ")[0];
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function applyOffsetToTime(timeStr, offsetMinutes) {
  if (!timeStr) return "--:--";
  const [hhStr, mmStr] = timeStr.split(":");
  let hh = parseInt(hhStr, 10);
  let mm = parseInt(mmStr, 10);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return timeStr;

  if (offsetMinutes) {
    let total = hh * 60 + mm + offsetMinutes;
    total = ((total % 1440) + 1440) % 1440;
    hh = Math.floor(total / 60);
    mm = total % 60;
  }
  return `${pad2(hh)}:${pad2(mm)}`;
}

function getAdjustedTime(row, key) {
  const base = row[key];
  const off = OFFSETS[key] || 0;
  return applyOffsetToTime(base, off);
}

function toDateFromRow(row) {
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum);
}

function parseTimeOnDate(row, key) {
  const timeStr = getAdjustedTime(row, key);
  const [hhStr, mmStr] = timeStr.split(":");
  const hh = parseInt(hhStr, 10);
  const mm = parseInt(mmStr, 10);
  return new Date(row.yearNum, row.monthNum - 1, row.dayNum, hh, mm, 0, 0);
}

// Offsets Laden/Speichern
function loadOffsetsFromStorage() {
  try {
    const raw = localStorage.getItem(OFFSET_STORAGE_KEY);
    if (!raw) return;
    const obj = JSON.parse(raw);
    ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"].forEach((k) => {
      if (typeof obj[k] === "number") {
        OFFSETS[k] = obj[k];
      }
    });
  } catch (e) {
    console.warn("offset load error", e);
  }
}

function saveOffsetsToStorage() {
  try {
    localStorage.setItem(OFFSET_STORAGE_KEY, JSON.stringify(OFFSETS));
  } catch (e) {
    console.warn("offset save error", e);
  }
}

function syncOffsetInputsFromState() {
  Object.keys(offsetInputs).forEach((k) => {
    if (offsetInputs[k]) {
      offsetInputs[k].value = OFFSETS[k] ?? 0;
    }
  });
}

// Jahr-Daten holen
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
      const weekdayTr = weekdayMap[g.weekday.en] || g.weekday.en;

      const row = {
        date: `${dayStr}.${monthStr}.${yearStr}`,
        day: weekdayTr,
        dayNum: d,
        monthNum: m,
        yearNum: y,
        // Basiszeiten (ohne Offset)
        imsak: cleanTime(t.Imsak),
        gunes: cleanTime(t.Sunrise),
        ogle: cleanTime(t.Dhuhr),
        ikindi: cleanTime(t.Asr),
        aksam: cleanTime(t.Maghrib),
        yatsi: cleanTime(t.Isha),
        isRamadan: h.month.number === 9
      };

      yearRows.push(row);
      if (row.isRamadan) ramadanRows.push(row);
    });
  }

  prayerData[year] = { year: yearRows, ramadan: ramadanRows };
}

// Bereich laden
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
    const d = prayerData[y];
    if (!d) continue;
    allRows.push(...d.year);
    allRamadan.push(...d.ramadan);
  }

  return { start, end, rows: allRows, ramadanRows: allRamadan };
}

// Uhr
function updateClock() {
  if (!nowDateEl || !nowTimeEl) return;
  const now = new Date();
  nowDateEl.textContent =
    pad2(now.getDate()) +
    "." +
    pad2(now.getMonth() + 1) +
    "." +
    now.getFullYear();
  nowTimeEl.textContent =
    pad2(now.getHours()) +
    ":" +
    pad2(now.getMinutes()) +
    ":" +
    pad2(now.getSeconds());
}

// Ayet
function renderRandomAyah() {
  if (!ayAr || !ayTr || !ayRef || ayatList.length === 0) return;
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

// Aktive Gebetszeit
function updateActivePrayer(todayRow) {
  const boxes = document.querySelectorAll(".today-item");
  boxes.forEach((b) => b.classList.remove("active-prayer"));

  if (!todayRow) return;

  const slots = ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"];
  const now = new Date();
  const times = slots.map((key) => ({
    key,
    el:
      key === "imsak"
        ? todayImsakEl
        : key === "gunes"
        ? todayGunesEl
        : key === "ogle"
        ? todayOgleEl
        : key === "ikindi"
        ? todayIkindiEl
        : key === "aksam"
        ? todayAksamEl
        : todayYatsiEl,
    date: parseTimeOnDate(todayRow, key)
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
  const active = times.find((t) => t.key === activeKey);
  if (active && active.el) {
    const box = active.el.closest(".today-item");
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
    const ikindiTime = parseTimeOnDate(todayRow, "ikindi");
    const aksamTime = parseTimeOnDate(todayRow, "aksam");

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
  if (!todayRow) return;

  const d = pad2(todayRow.dayNum);
  const mName = monthNamesTr[todayRow.monthNum] || "";
  todayDateLabel.textContent =
    todayRow.day + " • " + d + " " + mName + " " + todayRow.yearNum;

  todayImsakEl.textContent = getAdjustedTime(todayRow, "imsak");
  todayGunesEl.textContent = getAdjustedTime(todayRow, "gunes");
  todayOgleEl.textContent = getAdjustedTime(todayRow, "ogle");
  todayIkindiEl.textContent = getAdjustedTime(todayRow, "ikindi");
  todayAksamEl.textContent = getAdjustedTime(todayRow, "aksam");
  todayYatsiEl.textContent = getAdjustedTime(todayRow, "yatsi");

  updateKerahat(todayRow);
  updateActivePrayer(todayRow);
}

// Modus setzen
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

// Haupt-Render
async function renderTableAndToday() {
  if (!tableBody || !tableTitle) return;

  tableBody.innerHTML =
    '<tr><td colspan="8" style="padding:0.8rem;">Yükleniyor...</td></tr>';

  try {
    const info = await loadRangeData(viewStartDate, 365);
    const { start, end, rows, ramadanRows } = info;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRow = rows.find(
      (r) => toDateFromRow(r).getTime() === today.getTime()
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
        .filter((r) => {
          const d = toDateFromRow(r);
          return d >= start && d <= end;
        })
        .sort((a, b) => toDateFromRow(a) - toDateFromRow(b));
      tableTitle.textContent = "Velbert – Namaz Takvimi (365 Gün)";
    } else {
      rowsToShow = ramadanRows
        .filter((r) => {
          const d = toDateFromRow(r);
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
        `<td>${getAdjustedTime(row, "imsak")}</td>` +
        `<td>${getAdjustedTime(row, "gunes")}</td>` +
        `<td>${getAdjustedTime(row, "ogle")}</td>` +
        `<td>${getAdjustedTime(row, "ikindi")}</td>` +
        `<td>${getAdjustedTime(row, "aksam")}</td>` +
        `<td>${getAdjustedTime(row, "yatsi")}</td>`;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tableBody.innerHTML =
      '<tr><td colspan="8" style="padding:0.8rem;color:#fca5a5;">Namaz vakitleri alınırken bir hata oluştu. (CORS / ağ problemi olabilir.)</td></tr>';
  }
}

// Events
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

if (offsetSaveBtn) {
  offsetSaveBtn.addEventListener("click", () => {
    ["imsak", "gunes", "ogle", "ikindi", "aksam", "yatsi"].forEach((k) => {
      const inp = offsetInputs[k];
      if (!inp) return;
      const val = parseInt(inp.value, 10);
      OFFSETS[k] = Number.isNaN(val) ? 0 : val;
    });
    saveOffsetsToStorage();
    if (offsetSavedMsg) {
      offsetSavedMsg.textContent = "Ayarlar kaydedildi ✔";
      setTimeout(() => {
        offsetSavedMsg.textContent = "";
      }, 3000);
    }
    renderTableAndToday();
  });
}

// Init
loadOffsetsFromStorage();
syncOffsetInputsFromState();
renderRandomAyah();
updateClock();
setInterval(updateClock, 1000);
renderTableAndToday();
