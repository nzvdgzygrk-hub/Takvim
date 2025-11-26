// Stadt + Methode einstellen
const CITY = "Velbert";
const COUNTRY = "Germany";

// 13 = Turkish Diyanet (Diyanet'e göre ayarlı) :contentReference[oaicite:1]{index=1}
const METHOD = 13;

// Cache für 2025 / 2026, damit nicht ständig neu geladen wird
const prayerData = {}; // { 2025: { year: [...], ramadan: [...] }, 2026: {...} }

// DOM-Elemente
const yearButtons = document.querySelectorAll(".year-btn");
const modeButtons = document.querySelectorAll(".mode-btn");
const tableBody = document.getElementById("times-body");
const tableTitle = document.getElementById("table-title");

const ayAr = document.getElementById("ayah-ar");
const ayTr = document.getElementById("ayah-tr");
const ayRef = document.getElementById("ayah-ref");

// Türkische Wochentage
const weekdayMap = {
  Sunday: "Pazar",
  Monday: "Pazartesi",
  Tuesday: "Salı",
  Wednesday: "Çarşamba",
  Thursday: "Perşembe",
  Friday: "Cuma",
  Saturday: "Cumartesi",
};

// Kurze, beliebte Ayetler (Türkisch + Arabisch)
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

// Hilfsfunktionen

function cleanTime(str) {
  // Aladhan schickt oft z.B. "06:07 (CET)" – wir nehmen nur die Uhrzeit
  return String(str).split(" ")[0];
}

function setActiveButton(buttons, value, key) {
  buttons.forEach((btn) => {
    const v = btn.dataset[key];
    if (String(v) === String(value)) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

// Holt für ein Jahr alle Monate und baut year + ramadan Arrays
async function loadYearData(year) {
  if (prayerData[year]) return; // schon geladen

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
      console.error("API-Fehler", json);
      throw new Error("Namaz vakti API hat ein Problem.");
    }

    json.data.forEach((dayObj) => {
      const g = dayObj.date.gregorian;
      const h = dayObj.date.hijri;
      const t = dayObj.timings;

      const dateStr = g.date.replace(/-/g, "."); // 01-03-2025 → 01.03.2025
      const weekdayEn = g.weekday.en;
      const weekdayTr = weekdayMap[weekdayEn] || weekdayEn;

      const row = {
        date: dateStr,
        day: weekdayTr,
        sabah: cleanTime(t.Fajr), // Sabah namazı
        ogle: cleanTime(t.Dhuhr), // Öğle
        ikindi: cleanTime(t.Asr), // İkindi
        aksam: cleanTime(t.Maghrib), // Akşam
        yatsi: cleanTime(t.Isha), // Yatsı
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

// Tabelle rendern

let currentYear = 2025;
let currentMode = "year";

async function renderTable() {
  tableBody.innerHTML =
    '<tr><td colspan="7" style="padding:0.8rem;">Yükleniyor...</td></tr>';

  try {
    await loadYearData(currentYear);
    const yearData = prayerData[currentYear];
    const rows = yearData[currentMode] || [];

    tableTitle.textContent =
      currentYear +
      " – " +
      (currentMode === "year" ? "Tüm Yıl" : "Ramazan Günleri");

    tableBody.innerHTML = "";

    if (rows.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML =
        '<td colspan="7" style="padding:0.8rem;">Bu mod için henüz veri yok.</td>';
      tableBody.appendChild(tr);
      return;
    }

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      if (row.isRamadan) {
        tr.classList.add("ramadan-row");
      }

      tr.innerHTML = `
        <td class="date-cell">${row.date}</td>
        <td class="day-cell">${row.day}</td>
        <td>${row.sabah}</td>
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
      '<tr><td colspan="7" style="padding:0.8rem;color:#fca5a5;">Namaz vakitleri alınırken bir hata oluştu. Lütfen sayfayı yenile veya daha sonra tekrar dene.</td></tr>';
  }
}

// Ayet anzeigen

function renderRandomAyah() {
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

// Event-Listener

yearButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const year = Number(btn.dataset.year);
    currentYear = year;
    setActiveButton(yearButtons, year, "year");
    renderTable();
  });
});

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    currentMode = mode;
    setActiveButton(modeButtons, mode, "mode");
    renderTable();
  });
});

// Initial

renderRandomAyah();
renderTable();
