// ⚠️ HIER kommen deine echten Zeiten rein.
// Hole sie z.B. aus Diyanet/DİTİB Ramazan imsakiyesi oder
// einer Diyanet-basierten Seite für Velbert und trage sie in dieses Format ein.

const data = {
  2025: {
    year: [
      // Beispiel-Einträge – Datum + Wochentag + Placeholder für die Zeiten
      {
        date: "01.01.2025",
        day: "Çarşamba",
        sabah: "--:--",
        ogle: "--:--",
        ikindi: "--:--",
        aksam: "--:--",
        yatsi: "--:--",
        isRamadan: false,
      },
      {
        date: "02.01.2025",
        day: "Perşembe",
        sabah: "--:--",
        ogle: "--:--",
        ikindi: "--:--",
        aksam: "--:--",
        yatsi: "--:--",
        isRamadan: false,
      },
      // ...
    ],
    ramadan: [
      // Beispiel: 1.–3. Ramazan 1446 in Velbert
      // Datum + Wochentag; Zeiten aus offizieller Ramazan İmsakiyesi übernehmen!
      {
        date: "01.03.2025",
        day: "Cumartesi",
        sabah: "--:--", // Sabah / Fecir
        ogle: "--:--",
        ikindi: "--:--",
        aksam: "--:--", // İftar
        yatsi: "--:--",
        isRamadan: true,
      },
      {
        date: "02.03.2025",
        day: "Pazar",
        sabah: "--:--",
        ogle: "--:--",
        ikindi: "--:--",
        aksam: "--:--",
        yatsi: "--:--",
        isRamadan: true,
      },
      {
        date: "03.03.2025",
        day: "Pazartesi",
        sabah: "--:--",
        ogle: "--:--",
        ikindi: "--:--",
        aksam: "--:--",
        yatsi: "--:--",
        isRamadan: true,
      },
      // … bis Ramazan sonuna kadar
    ],
  },
  2026: {
    year: [
      {
        date: "01.01.2026",
        day: "Perşembe",
        sabah: "--:--",
        ogle: "--:--",
        ikindi: "--:--",
        aksam: "--:--",
        yatsi: "--:--",
        isRamadan: false,
      },
      // ...
    ],
    ramadan: [
      // Ramazan 1447 – in Deutschland ungefähr 18.02.–19.03.2026
      // Zeiten aus Ramazan-İmsakiyesi für Velbert übernehmen
      {
        date: "19.02.2026",
        day: "Perşembe",
        sabah: "--:--",
        ogle: "--:--",
        ikindi: "--:--",
        aksam: "--:--",
        yatsi: "--:--",
        isRamadan: true,
      },
      // ...
    ],
  },
};

// Kurze, bekannte Ayetler (Arabisch + Türkçe anlam)
// (Bis 25 Wörter – unkritisch in Bezug auf Urheberrecht)

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

// DOM-Elemente

const yearButtons = document.querySelectorAll(".year-btn");
const modeButtons = document.querySelectorAll(".mode-btn");
const tableBody = document.getElementById("times-body");
const tableTitle = document.getElementById("table-title");

const ayAr = document.getElementById("ayah-ar");
const ayTr = document.getElementById("ayah-tr");
const ayRef = document.getElementById("ayah-ref");

let currentYear = 2025;
let currentMode = "year";

function renderTable() {
  const yearData = data[currentYear];
  if (!yearData) return;

  const rows = yearData[currentMode] || [];
  tableBody.innerHTML = "";

  tableTitle.textContent =
    currentYear +
    " – " +
    (currentMode === "year" ? "Tüm Yıl (örnek veri)" : "Ramazan Günleri");

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

  if (rows.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td colspan="7" style="padding: 0.8rem;">
        Henüz veri eklenmedi. Lütfen resmi DİTİB/Diyanet takviminden
        saatleri alıp <code>script.js</code> dosyasına ekle.
      </td>
    `;
    tableBody.appendChild(tr);
  }
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

// Event-Listener für Jahr- und Modus-Umschaltung

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

// Zufällige Ayet anzeigen

function renderRandomAyah() {
  const idx = Math.floor(Math.random() * ayatList.length);
  const ay = ayatList[idx];
  ayAr.textContent = ay.ar;
  ayTr.textContent = ay.tr;
  ayRef.textContent = ay.ref;
}

// Initial

renderTable();
renderRandomAyah();
