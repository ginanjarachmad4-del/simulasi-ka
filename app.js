/*************************************************
 * ROCC – FRONTEND MAIN JS (CLEAN VERSION)
 * Pusdalopka 2 Bandung
 * Stable Production – 2026
 *************************************************/


/* ===============================================
   GLOBAL CHART
================================================ */
let chartAtas = null;
let chartBawah = null;
let chartTambahan = null;
let chartGangguan = null;

// data chart terakhir (dipakai kalau perlu redraw manual)
let lastChartAtasData = null;

// nilai PROGRAM (statis, sama persis dengan angka di card gauge PROGRAM)
// diisi otomatis oleh loadProgramOperasi()
let programData = {
  pnpBerangkat: 0,
  pnpDatang: 0,
  brgBerangkat: 0,
  brgDatang: 0
};

// register plugin (aman dipanggil walau plugin belum sempat attach otomatis)
if (window.ChartDataLabels) Chart.register(ChartDataLabels);

// cocokin label baris chart (misal "KA PNP Dat", "KA BRG Ber") ke salah satu dari 4 nilai programData
function getProgramForLabel(label) {
  const l = (label || "").toUpperCase();

  const isBarang = l.includes("BARANG") || l.includes("BRG");
  const isDatang = l.includes("DATANG") || l.includes("DAT"); // nangkep singkatan "Dat"

  if (isBarang && isDatang) return programData.brgDatang;
  if (isBarang && !isDatang) return programData.brgBerangkat;
  if (!isBarang && isDatang) return programData.pnpDatang;
  return programData.pnpBerangkat; // default: penumpang berangkat
}

/* ===============================================
   WARNA TRAFFIC LIGHT
================================================ */
// KETEPATAN (%) — makin tinggi makin bagus
function getColorKetepatan(value, target) {
  if (value >= target) return "#22c55e";       // hijau = capai target
  if (value >= target - 10) return "#f59e0b";  // kuning = mendekati target
  return "#ef4444";                             // merah = jauh di bawah target
}

// KELAMBATAN (menit) — makin tinggi makin jelek
function getColorKelambatan(menit) {
  if (menit <= 5) return "#22c55e";   // hijau = nyaris tepat waktu
  if (menit <= 15) return "#f59e0b";  // kuning = waspada
  return "#ef4444";                    // merah = lambat parah
}

/* ===============================================
   CHART RENDER
================================================ */
function updateChartAtas(data) {

  lastChartAtasData = data;

  const ctx = document.getElementById("ketepatanChart");
  if (!ctx) return;

  if (chartAtas) chartAtas.destroy();

  const realisasi = data.map(x => Number(x.persen) || 0);
  const program = data.map(x => getProgramForLabel(x.label));

  chartAtas = new Chart(ctx, {
    type: "bar",

    data: {
      labels: data.map(x => x.label),

      datasets: [
        {
          label: "Program",
          data: program,

          backgroundColor: "#2563eb",
          borderRadius: 4,
          barThickness: 16
        },
        {
          label: "Realisasi",
          data: realisasi,

          // hijau kalau realisasi >= program baris itu sendiri, merah kalau di bawah
          backgroundColor: realisasi.map((v, i) => getColorKetepatan(v, program[i])),
          borderRadius: 4,
          barThickness: 16
        }
      ]
    },

    options: {
      indexAxis: "y",

      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: {
          display: false // legend custom di bawah chart (HTML)
        },
       title: {
          display: false // judul sudah pakai header HTML modern di atas canvas
        },

        // label angka di ujung tiap bar (program & realisasi)
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#374151",
          font: { weight: "bold", size: 10 },
          formatter: value => value.toFixed(2).replace(".", ",") + "%"
        }
      },

      scales: {
        x: {
          min: 0,
          max: 100,

          ticks: {
            callback: value => value + "%"
          }
        },

        y: {
          grid: {
            display: false
          }
        }
      }
    }
  });

}

function updateChartBawah(data) {

  const ctx = document.getElementById("kelambatanChart");
  if (!ctx) return;

  if (chartBawah) chartBawah.destroy();

  // NOTE: field data dibiarin sesuai existing (x.persen), belum diganti ke x.menit/x.kelambatan
  const values = data.map(x => Number(x.persen) || 0);

  chartBawah = new Chart(ctx, {
    type: "bar",

     data: {
      labels: data.map(x => x.label),

      datasets: [{
        data: values,

        backgroundColor: values.map(v => getColorKelambatan(v)),
        borderRadius: 4,
        barThickness: 20
      }]
    },


    options: {

      indexAxis: "y",

      responsive: true,
      maintainAspectRatio: false,

      plugins: {

        legend: {
          display: false
        },

        title: {
          display: false // judul sudah pakai header HTML modern di atas canvas
        },

        // label angka di ujung bar
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#374151",
          font: { weight: "bold", size: 11 },
          formatter: value => value + " mnt"
        }

      },

      scales: {

        x: {

          beginAtZero: true,

          suggestedMax: 25,

          grid: {
            color: "#d1d5db"
          },

          ticks: {
            color: "#4b5563"
          }
        },

        y: {

          grid: {
            display: false
          },

          ticks: {
            color: "#374151",
            font: {
              size: 11,
              weight: "bold"
            }
          }
        }
      }
    }
  });
}


function updateChartTambahan(data){

  const ctx = document.getElementById("chartTambahan");
  if(!ctx) return;

  if(chartBawah) chartBawah.destroy();

  chartTambahan = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(x => x.label),
      datasets: [{
        data: data.map(x => Number(x.value) || 0),
        backgroundColor: "#2563eb",
        borderRadius: 4,
        barThickness: 18
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "CHART TAMBAHAN",
          align: "start",
          color: "#374151",
          font: { size: 16, weight: "bold" }
        }
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true }
      }
    }
  });
}

/* ===============================================
   GANGGUAN OPERASIONAL (DOUGHNUT CHART)
================================================ */

// Urutan sumbu X tetap, sesuai urutan baris B6:B17 di sheet
const GANGGUAN_CATEGORIES = [
  "Angkutan Penumpang",
  "Angkutan Barang",
  "Fasilitas Penumpang",
  "Operasi",
  "Jalan & Jembatan",
  "Sintelis",
  "Sarana",
  "Kamtib",
  "SDM dan Umum",
  "IT",
  "Anak Perusahaan & Eksternal",
  "Alam"
];

function normalizeLabel_(s) {
  return String(s || "").trim().toLowerCase();
}

// Susun ulang data dari API supaya urutannya selalu ikut GANGGUAN_CATEGORIES,
// walau urutan baris di sheet berubah / ada yang kosong.
function orderGangguanData_(data) {

  const map = {};
  data.forEach(x => {
    map[normalizeLabel_(x.label)] = x;
  });

  const ordered = GANGGUAN_CATEGORIES.map(cat => {
    const found = map[normalizeLabel_(cat)];
    return {
      label: cat,
      value: found ? (Number(found.value) || 0) : 0,
      andil: found ? (Number(found.andil) || 0) : 0
    };
  });

  return ordered;
}

function updateGangguanChart(rawData) {

  const ctx = document.getElementById("gangguanChart");
  if (!ctx) return;

  if (chartGangguan) chartGangguan.destroy();

  const data = orderGangguanData_(rawData);

  const labels = data.map(x => x.label);
  const values = data.map(x => x.value);
  const andil  = data.map(x => x.andil);

  chartGangguan = new Chart(ctx, {
    type: "bar",

    data: {
      labels,
      datasets: [{
        label: "Jumlah Gangguan",
        data: values,

        backgroundColor: "#2563eb",
        hoverBackgroundColor: "#1d4ed8",
        borderRadius: 5,
        maxBarThickness: 34
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { display: false },

        tooltip: {
          callbacks: {
            label: (ctx) => {
              const i = ctx.dataIndex;
              return [
                ` Jumlah: ${values[i]} kejadian`,
                ` Andil: ${andil[i]} menit`
              ];
            }
          }
        },

        // keterangan di atas bar = andil (menit), bukan jumlah gangguannya
        datalabels: {
          anchor: "end",
          align: "end",
          color: "#f97316",
          font: { weight: "800", size: 10 },
          formatter: (_, ctx) => `${andil[ctx.dataIndex]}m`
        }
      },

      scales: {
        x: {
          grid: { display: false },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
            font: { size: 10.5, weight: "600" },
            color: "#4b5563"
          }
        },

        y: {
          beginAtZero: true,
          grid: { color: "#f1f5f9" },
          title: {
            display: true,
            text: "Jumlah Gangguan",
            font: { size: 11, weight: "700" },
            color: "#6b7280"
          },
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

function renderGangguanLegend(rawData) {

  const wrap = document.getElementById("gangguanLegend");
  if (!wrap) return;

  const data = orderGangguanData_(rawData);

  const totalKejadian = data.reduce((a, x) => a + x.value, 0);
  const totalAndil    = data.reduce((a, x) => a + x.andil, 0);

  // legend HTML disederhanakan jadi ringkasan total,
  // karena rincian per kategori sudah tampil langsung di sumbu X bar chart
  wrap.innerHTML = `
    <div class="legend-item">
      <span class="legend-label">
        <span class="legend-dot" style="background:#2563eb"></span>
        Total Kejadian
      </span>
      <span class="legend-value">${totalKejadian}</span>
    </div>
    <div class="legend-item">
      <span class="legend-label">
        <span class="legend-dot" style="background:#f97316"></span>
        Total Andil
      </span>
      <span class="legend-value">${totalAndil} <small>menit</small></span>
    </div>
  `;

  const totalBadge = document.getElementById("gangguanTotal");
  if (totalBadge) totalBadge.textContent = `${totalKejadian} Kejadian`;
}

// Endpoint gangguan pakai project Apps Script terpisah (API_GANGGUAN)
async function loadGangguanOperasional() {
  try {
    const j = await fetch(API_GANGGUAN + "?mode=gangguan").then(r => r.json());
    const list = j.data; // endpoint bungkus hasil di { serverTime, mode, data: [...] }

    if (!Array.isArray(list) || list.length === 0) {
      throw new Error("Data gangguan kosong / format tidak sesuai");
    }

    updateGangguanChart(list);
    renderGangguanLegend(list);
    syncGangguanPanelHeight();

  } catch (err) {
    console.error("Gagal load data gangguan operasional:", err);

    // fallback dummy biar chart tidak kosong kalau API belum siap / error
    const dummyData = [
      { label: "Angkutan Penumpang",           value: 6,  andil: 22 },
      { label: "Angkutan Barang",              value: 3,  andil: 15 },
      { label: "Fasilitas Penumpang",          value: 2,  andil: 8  },
      { label: "Operasi",                      value: 5,  andil: 30 },
      { label: "Jalan & Jembatan",             value: 4,  andil: 40 },
      { label: "Sintelis",                     value: 3,  andil: 25 },
      { label: "Sarana",                       value: 8,  andil: 55 },
      { label: "Kamtib",                       value: 1,  andil: 5  },
      { label: "SDM dan Umum",                 value: 2,  andil: 10 },
      { label: "IT",                           value: 1,  andil: 6  },
      { label: "Anak Perusahaan & Eksternal",  value: 2,  andil: 12 },
      { label: "Alam",                         value: 3,  andil: 20 }
    ];

    updateGangguanChart(dummyData);
    renderGangguanLegend(dummyData);
    syncGangguanPanelHeight();
  }
}



const API_KELKA = "https://script.google.com/macros/s/AKfycbwmcMD95Pmk4VviCiivhlVOPgu_X2jQ4TlZBBxnoTYotob3oCLMNj8hP-D8bHDQX1fYPQ/exec";

const API_OPERASI = "https://script.google.com/macros/s/AKfycbwmcMD95Pmk4VviCiivhlVOPgu_X2jQ4TlZBBxnoTYotob3oCLMNj8hP-D8bHDQX1fYPQ/exec";

const API_GANGGUAN = "https://script.google.com/macros/s/AKfycbwmbWtaYiSgt2fLeHTgPp1qyOMUbzrzlj7kCKG_CJ0LHmI-6yAPj1q9Av0LbxiLIyWPMw/exec";

const API_PROGRAM = "https://script.google.com/macros/s/AKfycbwmcMD95Pmk4VviCiivhlVOPgu_X2jQ4TlZBBxnoTYotob3oCLMNj8hP-D8bHDQX1fYPQ/exec";

const API_NORMA =
"https://script.google.com/macros/s/AKfycbxNlvWIltPVHOo5mjg9bwyt76uChTjafGl8zAwvqTOWgrMlNWUhXqJBvpeA0jnwFywy-Q/exec";

const API_STAMFORMASI = "https://script.google.com/macros/s/AKfycbzzWiI1JmawlYXsVjCVs9b9t3LdgvEl3Tw_pwQGSpRcdz99xuRoxhxfXW160DKvCbkd/exec";

const API_SARANA = "https://script.google.com/macros/s/AKfycbz50G5lqeAfklW_sUZiD0IZh1uMTMkQGJAEp6kJMLC2EezdH8DNE_LOIPE35lLuElh35Q/exec";

const API_REGULASI =
  "https://raw.githubusercontent.com/ginanjarachmad4-del/simulasi-ka/main/data/pdf.json";


/* ===============================================
   DOM READY
================================================ */
document.addEventListener("DOMContentLoaded", () => {

  const enterBtn = document.getElementById("enterBtn");
  const landing = document.getElementById("landing");

  if (enterBtn && landing) {
    enterBtn.onclick = () => {
      landing.classList.add("hidden");
      setTimeout(() => landing.style.display = "none", 600);
    };
  }

  const clock = document.getElementById("clock");
  if (clock) {
    const tick = () => {
      clock.innerText = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }) + " WIB";
    };
    tick();
    setInterval(tick, 1000);
  }

  document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = () => {
      const target = document.getElementById(tab.dataset.tab);
      if (!target) return;

      document.querySelectorAll(".tab,.tab-content")
        .forEach(x => x.classList.remove("active"));

      tab.classList.add("active");
      target.classList.add("active");

      window.scrollTo({ top: 0, behavior: "smooth" });
    };
  });

  // INIT LOAD
  loadKinerjaOperasi();
  loadKelkaDatang();
  loadKelkaBerangkat();
  loadKelkaDatangList();
  loadKelkaBerangkatList();
  loadJumlahKA();
  loadStamformasi();
  loadSarana("lokomotif");
  loadOperasiDashboard();
  loadProgramOperasi();
  loadNormakendali();
  loadRegulasi();
  loadGangguanOperasional();

  // samain tinggi card GANGGUAN OPERASIONAL dengan card KELKA (kiri)
  syncGangguanPanelHeight();
  window.addEventListener("resize", debounce(syncGangguanPanelHeight, 200));
});

/* ===============================================
   SYNC TINGGI CARD GANGGUAN OPERASIONAL
   (samain persis dengan tinggi frame KELKA berangkat+datang)
================================================ */
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

function syncGangguanPanelHeight() {

  const leftFrame  = document.querySelector(".kelka-frame-left");
  const rightPanel = document.querySelector(".kelka-frame-right .panel");

  if (!leftFrame || !rightPanel) return;

  // di layar sempit, layout jadi 1 kolom (lihat @media ops-split-grid) —
  // biar card gak dipaksa ketinggian gede sisa dari layout desktop, reset dulu
  if (window.innerWidth <= 1200) {
    rightPanel.style.height = "";
    if (chartGangguan) requestAnimationFrame(() => chartGangguan.resize());
    return;
  }

  const targetHeight = leftFrame.getBoundingClientRect().height;
  if (targetHeight > 0) {
    rightPanel.style.height = targetHeight + "px";
  }

  // kasih waktu browser reflow dulu sebelum resize chart,
  // biar canvas ke-render dengan ukuran container yang sudah final
  requestAnimationFrame(() => {
    if (chartGangguan) chartGangguan.resize();
  });
}


/* ===============================================
   KELKA SUMMARY
================================================ */
async function loadKelkaDatang() {
  try {
    const j = await fetch(API_KELKA + "?type=datang").then(r => r.json());
    document.getElementById("kelkaDatang").innerText = j.jumlah ?? 0;
  } catch {
    document.getElementById("kelkaDatang").innerText = "-";
  }
}

async function loadKelkaBerangkat() {
  try {
    const j = await fetch(API_KELKA + "?type=berangkat").then(r => r.json());
    document.getElementById("kelkaBerangkat").innerText = j.jumlah ?? 0;
  } catch {
    document.getElementById("kelkaBerangkat").innerText = "-";
  }
}

setInterval(() => {
  loadKelkaDatangList();
  loadKelkaBerangkatList();
}, 60000);

/* ===============================================
   HELPER PERCENT
================================================ */
function toPercent(v){
  return (Number(v) || 0) * 100;
}


/* ===============================================
   GAUGE SYSTEM (FINAL FIX - ROCC DASHBOARD)
================================================ */

function setGauge(idValue, percent){
  const valueEl = document.getElementById(idValue);
  if(!valueEl) return;

  const dial = valueEl.closest('.gauge-dial');
  if(!dial) return;

  const progress = dial.querySelector('.gauge-progress');
  if(!progress) return;

  const v = Math.max(0, Math.min(Number(percent) || 0, 100));

  // panjang total arc setengah lingkaran (radius 50)
  const total = progress.getTotalLength();

  requestAnimationFrame(() => {
    progress.style.strokeDasharray = total;
    progress.style.strokeDashoffset = total * (1 - v / 100);
  });

  valueEl.textContent =
  v === 100
    ? "100%"
    : v.toFixed(2).replace(".", ",") + "%";
}

/* ===============================================
   PROGRAM OPERASI
================================================ */
async function loadProgramOperasi() {
  try {
    const r = await fetch(API_PROGRAM + "?mode=program");
    const j = await r.json();

    if (!j || j.mode !== "program") return;

    // KA PENUMPANG
    setGauge("kpi-berangkat-prog", toPercent(j.berangkatpnp));
    setGauge("kpi-datang-prog", toPercent(j.datangpnp));

    // KA BARANG
    setGauge("kpi-barang-berangkat-prog", toPercent(j.berangkatbrg));
    setGauge("kpi-barang-datang-prog", toPercent(j.datangbrg));

    // simpan nilai program yang sama persis dgn angka di card gauge di atas,
    // dipakai buat bar "Program" di chart KETEPATAN KA (%)
    programData.pnpBerangkat = toPercent(j.berangkatpnp);
    programData.pnpDatang = toPercent(j.datangpnp);
    programData.brgBerangkat = toPercent(j.berangkatbrg);
    programData.brgDatang = toPercent(j.datangbrg);

    // kalau chart ketepatan udah pernah digambar, redraw biar bar program-nya ke-update
    if (lastChartAtasData) updateChartAtas(lastChartAtasData);

  } catch (err) {
    console.error("loadProgramOperasi error:", err);
  }
}

/* ===============================================
   KINERJA OPERASI
================================================ */
async function loadKinerjaOperasi() {
  try {
    const r = await fetch(API_KELKA + "?mode=kinerja");
    const d = await r.json();

    // KA PENUMPANG
    setGauge("kpi-berangkat", toPercent (d.berangkatpnp));
    setGauge("kpi-datang", toPercent (d.datangpnp));

    // KA BARANG
    setGauge("kpi-barang-berangkat", toPercent (d.berangkatbrg));
    setGauge("kpi-barang-datang", toPercent (d.datangbrg));

  } catch (e) {
    console.error("Kinerja error:", e);
  }
}


/* ===============================================
   INIT + AUTO REFRESH
================================================ */

function initDashboard(){
  loadProgramOperasi();
  loadKinerjaOperasi();

  setInterval(loadProgramOperasi, 30000);
  setInterval(loadKinerjaOperasi, 30000);
}

initDashboard();

/* ===============================================
   JUMLAH KA
================================================ */
async function loadJumlahKA() {
  try {
    const r = await fetch(API_KELKA + "?mode=jumlahka");
    const j = await r.json();

    document.getElementById("kpi-realisasi").innerText = j.realisasi ?? 0;
    document.getElementById("kpi-antarkota").innerText = j.antarkota ?? 0;
    document.getElementById("kpi-perkotaan").innerText = j.perkotaan ?? 0;
    document.getElementById("kpi-barang").innerText = j.barang ?? 0;

  } catch (e) {
    console.error(e);
  }
}

setInterval(loadJumlahKA, 60000);


/* ===============================================
   OPERASI DASHBOARD
================================================ */
async function loadOperasiDashboard() {
  try {
    const r = await fetch(API_OPERASI + "?mode=operasi");
    const j = await r.json();

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    // TOTAL
    setText("penumpangBerangkat", j.penumpangBerangkat ?? 0);
    setText("penumpangDatang", j.penumpangDatang ?? 0);
    setText("barangBerangkat", j.barangBerangkat ?? 0);
    setText("barangDatang", j.barangDatang ?? 0);

    // MENIT
    setText("menitPenumpangBerangkat", j.menitPenumpangBerangkat ?? 0);
    setText("menitPenumpangDatang", j.menitPenumpangDatang ?? 0);
    setText("menitBarangBerangkat", j.menitBarangBerangkat ?? 0);
    setText("menitBarangDatang", j.menitBarangDatang ?? 0);

   // =========================
// CHART ATAS
// =========================
if (j.chartAtas?.length) {

  const avgAtas =
    j.chartAtas.reduce(
      (sum, item) => sum + (Number(item.persen) || 0),
      0
    ) / j.chartAtas.length;

 
  updateChartAtas(j.chartAtas);
}


// =========================
// CHART BAWAH
// =========================
if (j.chartBawah?.length) {

  const avgBawah =
    j.chartBawah.reduce(
      (sum, item) => sum + (Number(item.persen) || 0),
      0
    ) / j.chartBawah.length;

  updateChartBawah(j.chartBawah);

  setTimeout(() => {
  if (chartBawah) {
    chartBawah.resize();
    chartBawah.update();
  }
}, 100);
}


  } catch (err) {
    console.error("Operasi Dashboard Error:", err);
  }
}

setInterval(loadOperasiDashboard, 60000);


/* ===============================================
   STAMFORMASI
================================================ */
async function loadStamformasi() {
  try {
    const j = await fetch(API_STAMFORMASI).then(r => r.json());

    renderStam("stamformasiJJ", j.jarakJauh, "countJJ");
    renderStam("stamformasiLokal", j.lokal, "countLokal");
    renderStam("stamformasiTambahan", j.tambahan, "countTambahan");

  } catch (err) {
    console.error(err);

    ["stamformasiJJ", "stamformasiLokal", "stamformasiTambahan"]
      .forEach(id => {
        document.getElementById(id).innerHTML = `
          <div class="ka-item ka-placeholder">
            <div class="ka-header">
              <div class="ka-icon">⚠️</div>
              <div>Gagal memuat data</div>
            </div>
            <button type="button" class="sarana-retry ka-retry" onclick="loadStamformasi()">Coba lagi</button>
          </div>
        `;
      });
  }
}

// refresh otomatis tiap 60 detik, konsisten dengan panel realtime lain
setInterval(loadStamformasi, 60000);


/* ===============================================
   RENDER STAM (FINAL FIX - NO MODAL)
================================================ */
function renderStam(id, data, countId) {

  const container = document.getElementById(id);
  const counter = document.getElementById(countId);

  if (!container) return;

  container.innerHTML = "";

  if (!data || data.length === 0) {

    container.innerHTML = `
      <div class="ka-item ka-placeholder">
        <div class="ka-header">
          <div class="ka-icon">🚆</div>
          <div>Tidak ada data</div>
        </div>
      </div>
    `;

    if (counter) counter.textContent = "0 KA";
    return;
  }

  if (counter) counter.textContent = `${data.length} KA`;

  let html = "";

  data.forEach(x => {

    html += `
      <div class="ka-item">

        <div class="ka-header">
          <div class="ka-icon">🚆</div>
          <div>${x.ka ?? "-"}</div>
        </div>

        <div class="ka-detail">

          <div class="ka-field">
            <div class="ka-label">Lokomotif</div>
            <div class="ka-value">
              ${x.lokomotif ?? "-"}
            </div>
          </div>

          <div class="ka-field">
            <div class="ka-label">Stamformasi</div>
            <div class="ka-value">
              ${x.stamformasi ?? "-"}
            </div>
          </div>

          <div class="ka-field">
            <div class="ka-label">Keterangan</div>
            <div class="ka-value">
              ${x.keterangan ?? "-"}
            </div>
          </div>

        </div>

      </div>
    `;
  });

  container.innerHTML = `
    <div class="ka-list-inner">
      ${html}
    </div>
  `;

  // kalau user lagi ngetik pencarian pas data ini di-refresh otomatis,
  // filter langsung diterapkan ulang biar hasil pencarian nggak ilang
  const searchInput = container.closest(".stam-category")?.querySelector(".ka-search");
  if (searchInput && searchInput.value.trim()) {
    filterKA(searchInput, id);
  }
}


/* ===============================================
   AUTO-SCROLL LIST KA (JJ / Lokal / Tambahan)
   — geser scrollTop pelan-pelan, bukan CSS transform,
     jadi otomatis pas sama tinggi konten asli (nggak nyentak)
     dan berhenti pas di-hover / lagi dipakai nyari
================================================ */
function initKaAutoScroll() {
  document.querySelectorAll(".stam-category").forEach(category => {
    const list = category.querySelector(".ka-list");
    const input = category.querySelector(".ka-search");
    if (!list) return;

    let hovering = false;
    list.addEventListener("mouseenter", () => hovering = true);
    list.addEventListener("mouseleave", () => hovering = false);

    setInterval(() => {
      const isSearching = input && input.value.trim() !== "";
      if (hovering || isSearching) return;

      // konten belum lebih tinggi dari kotaknya, nggak perlu discroll
      if (list.scrollHeight <= list.clientHeight) return;

      if (list.scrollTop + list.clientHeight >= list.scrollHeight - 1) {
        list.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        list.scrollTop += 1;
      }
    }, 60);
  });
}
initKaAutoScroll();


/* ===============================================
   FILTER KA — DATA STAMFORMASI (JJ / Lokal / Tambahan)
================================================ */
function filterKA(input, id) {
  const container = document.getElementById(id);
  if (!container) return;

  // kalau lagi nggak ada data beneran (placeholder "tidak ada"/"gagal memuat"),
  // nggak usah difilter
  if (container.querySelector(".ka-placeholder")) return;

  const keyword = input.value.trim().toLowerCase();
  const items = container.querySelectorAll(".ka-item:not(.ka-empty-search)");

  let visibleCount = 0;
  items.forEach(item => {
    const match = item.innerText.toLowerCase().includes(keyword);
    item.style.display = match ? "" : "none";
    if (match) visibleCount++;
  });

  let emptyMsg = container.querySelector(".ka-empty-search");

  if (visibleCount === 0 && keyword) {
    if (!emptyMsg) {
      emptyMsg = document.createElement("div");
      emptyMsg.className = "ka-item ka-empty-search";
      emptyMsg.innerHTML = `
        <div class="ka-header">
          <div class="ka-icon">🔍</div>
          <div>Tidak ditemukan untuk "${input.value.trim()}"</div>
        </div>`;
      container.querySelector(".ka-list-inner")?.appendChild(emptyMsg);
    } else {
      emptyMsg.querySelector(".ka-header div:last-child").textContent =
        `Tidak ditemukan untuk "${input.value.trim()}"`;
      emptyMsg.style.display = "";
    }
  } else if (emptyMsg) {
    emptyMsg.style.display = "none";
  }
}

// filter list KELKA (Datang/Berangkat) — beda struktur dari filterKA di atas
function filterKelka(input, id) {

  const keyword = input.value.toLowerCase();

  document.querySelectorAll(`#${id} .kelka-item`).forEach(item => {

    const text = item.innerText.toLowerCase();

    item.style.display = text.includes(keyword) ? "" : "none";
  });
}


/* ===============================================
   KELKA LIST
================================================ */
async function loadKelkaDatangList() {
  try {
    const j = await fetch(API_KELKA + "?type=datang").then(r => r.json());
    renderKelka("kelkaDatangList", j.data, "countKelkaDatang");
  } catch (err) {
    console.error(err);
  }
}

async function loadKelkaBerangkatList() {
  try {
    const j = await fetch(API_KELKA + "?type=berangkat").then(r => r.json());
    renderKelka("kelkaBerangkatList", j.data, "countKelkaBerangkat");
  } catch (err) {
    console.error(err);
  }
}


/* ===============================================
   RENDER KELKA
================================================ */
function renderKelka(id, data, countId) {

  const container = document.getElementById(id);
  const counter = document.getElementById(countId);

  if (!container) return;

  const inner = container.querySelector(".kelka-list-inner");

  if (!data || data.length === 0) {

    if (inner) {
      inner.innerHTML = `<div class="kelka-item"><div class="kelka-nama">Tidak ada data</div></div>`;
    }

    if (counter) counter.textContent = "0 KA";
    return;
  }

  if (counter) counter.textContent = `${data.length} KA`;

  let html = "";

  data.forEach(x => {

    const payload = encodeURIComponent(JSON.stringify(x));

    html += `
      <div class="kelka-item" onclick='showKelkaDetail("${payload}")'>

        <div class="kelka-icon ${Number(x.kelambatan) > 0 ? "lambat" : "tepat"}">
          🚆
        </div>

        <div class="kelka-body">

          <div class="kelka-row1">
            <span class="kelka-nomor">KA ${x.nomorKA ?? "-"}</span>
            <span class="kelka-nama">${x.namaKA ?? "-"}</span>
          </div>

          <div class="kelka-row2">
            <span class="kelka-jam">🕒 ${x.jam ?? "-"}</span>
            <span class="kelka-delay ${Number(x.kelambatan) > 0 ? "lambat" : "tepat"}">
              ${x.kelambatan ?? 0} Menit
            </span>
          </div>

        </div>

      </div>
    `;
  });

  if (inner) {
    inner.innerHTML = html;
  }
}


/* ===============================================
   KELKA DETAIL MODAL
================================================ */
function showKelkaDetail(data) {
  data = JSON.parse(decodeURIComponent(data));

  document.getElementById("modalNamaKA").textContent = `🚆 ${data.namaKA || "-"}`;

  document.getElementById("modalContent").innerHTML = `
    <div style="margin-bottom:14px">
      <b style="color:#38bdf8">Nomor KA</b>
      <div>${data.nomorKA || "-"}</div>
    </div>
    <div style="margin-bottom:14px">
      <b style="color:#38bdf8">Jenis KA</b>
      <div>${data.jenisKA || "-"}</div>
    </div>
    <div style="margin-bottom:14px">
      <b style="color:#38bdf8">Lintas</b>
      <div>${data.lintas || "-"}</div>
    </div>
    <div style="margin-bottom:14px">
      <b style="color:#38bdf8">Jam</b>
      <div>${data.jam || "-"}</div>
    </div>
    <div>
      <b style="color:#ef4444">Kelambatan</b>
      <div>${data.kelambatan || 0} Menit</div>
    </div>
  `;

  document.getElementById("kaModal").classList.add("show");
}


/* ===============================================
   AUTO REFRESH KELKA LIST
================================================ */
setInterval(loadKelkaDatangList, 60000);
setInterval(loadKelkaBerangkatList, 60000);


/* ===============================================
   SARANA
================================================ */

// state global buat cegah race condition & tau tab mana yang lagi aktif
let saranaCurrentKategori = "lokomotif";
let saranaAbortController = null;

// parse baris mentah dari API (">> BANDUNG : 25", "1. K1 PRIO ... (F)", "- K1 PNC : 11")
// jadi HTML yang lebih rapi & konsisten, tanpa dot/dash mentah dari sheet
function renderCatatanList(lines) {
  if (!lines || !lines.length) {
    return `<div class="catatan-empty">Tidak ada catatan</div>`;
  }

  return lines.map(raw => {
    const v = String(raw).trim();

    // baris ringkasan lokasi, misal ">> BANDUNG : 25"
    const header = v.match(/^>>\s*(.+)$/);
    if (header) {
      return `<div class="catatan-header">📍 ${header[1]}</div>`;
    }

    // baris bernomor, misal "1. K1 PRIO 0 82 12 (F) - (JAKK) PRIORITY"
    const numbered = v.match(/^(\d+)\.\s*(.+)$/);
    if (numbered) {
      return `
        <div class="catatan-item">
          <span class="catatan-num">${numbered[1]}</span>
          <span class="catatan-text">${numbered[2]}</span>
        </div>`;
    }

    // baris dash, misal "- K1 PNC : 11" — disamakan gayanya dengan baris bernomor
    const dashed = v.match(/^-+\s*(.+)$/);
    if (dashed) {
      return `
        <div class="catatan-item">
          <span class="catatan-dash">•</span>
          <span class="catatan-text">${dashed[1]}</span>
        </div>`;
    }

    // fallback: baris biasa
    return `<div class="catatan-line">${v}</div>`;
  }).join("");
}

async function loadSarana(kategori) {
  saranaCurrentKategori = kategori;

  // request sebelumnya (misal dari tab yang buru-buru ditinggalkan) dibatalkan
  // supaya response yang telat tidak menimpa data tab yang sedang aktif sekarang
  if (saranaAbortController) saranaAbortController.abort();
  const controller = new AbortController();
  saranaAbortController = controller;

  setSaranaLoading(true);
  showSaranaStatus("Memuat data sarana…", "info");

  try {
    let apiKategori = kategori;
    if (apiKategori === "peralatan") apiKategori = "peralatan khusus";

    const res = await fetch(
      API_SARANA + "?type=sarana&kategori=" + encodeURIComponent(apiKategori),
      { signal: controller.signal }
    );
    const j = await res.json();

    if (!j?.status) {
      showSaranaStatus("Gagal mengambil data sarana", "error");
      return;
    }

    if (apiKategori === "peralatan khusus") {
      const noteBox = document.getElementById("peralatan-note");
      const card = document.getElementById("peralatanCard");
      card.style.display = "block";

      const p = j.data?.PERALATAN_KHUSUS || j.data?.PERALATAN || j.data?.peralatan;
      noteBox.innerHTML = renderCatatanList(p?.catatan);
      hideSaranaStatus();
      return;
    }

    document.querySelectorAll(".sarana-card").forEach(card => {
      const key = card.dataset.key?.toUpperCase();
      const item = j.data?.[key];
      if (!item) return;

      // ambil angka dari jumlah; kalau kosong/"-"/bukan angka,
      // fallback hitung total dari baris catatan (misal "- K1 PNC : 11")
      const rawJumlah = item.jumlah;
      const parsedJumlah = Number(rawJumlah);
      const isValidNumber =
        rawJumlah !== null &&
        rawJumlah !== undefined &&
        rawJumlah !== "" &&
        !isNaN(parsedJumlah);

      let total;
      if (isValidNumber) {
        total = parsedJumlah;
      } else {
        total = (item.catatan || []).reduce((sum, line) => {
          const m = String(line).match(/:\s*(-?\d+)\s*$/);
          return sum + (m ? parseInt(m[1], 10) : 0);
        }, 0);
      }

      card.querySelector(".card-number").innerText = total;
      card.querySelector(".card-note").innerHTML =
        renderCatatanList(item.catatan);
    });

    hideSaranaStatus();

  } catch (err) {
    if (err.name === "AbortError") return; // dibatalkan karena ganti tab, bukan error beneran
    showSaranaStatus("Kesalahan koneksi ke server sarana", "error");
  } finally {
    setSaranaLoading(false);
  }
}

// dim + nonaktifkan interaksi sesaat selama fetch, biar ada sinyal visual "lagi update"
function setSaranaLoading(isLoading) {
  [document.getElementById("saranaCards"), document.getElementById("peralatanCard")]
    .forEach(el => el && el.classList.toggle("sarana-loading", isLoading));
}

// banner status di atas grid card: info (memuat) / error (gagal + tombol coba lagi)
function showSaranaStatus(msg, type = "info") {
  const box = document.getElementById("saranaStatus");
  if (!box) return;

  if (type === "info") {
    box.innerHTML = `⏳ ${msg}`;
  } else {
    box.innerHTML = `⚠️ ${msg}
      <button type="button" class="sarana-retry" onclick="loadSarana('${saranaCurrentKategori}')">Coba lagi</button>`;
  }

  box.className = "sarana-status " + type;
  box.style.display = "flex";
}

function hideSaranaStatus() {
  const box = document.getElementById("saranaStatus");
  if (box) box.style.display = "none";
}

function toggleNote(card) {
  document.querySelectorAll(".sarana-card").forEach(c => {
    if (c !== card) {
      c.classList.remove("active");
      c.setAttribute("aria-expanded", "false");
    }
  });

  const isActive = card.classList.toggle("active");
  card.setAttribute("aria-expanded", isActive ? "true" : "false");
}

// dukungan keyboard (Enter/Space) buat card yang bisa expand, biar accessible
document.querySelectorAll(".sarana-card").forEach(card => {
  card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleNote(card);
    }
  });
});

// auto-refresh data sarana tiap 60 detik, konsisten dengan panel realtime lain
setInterval(() => loadSarana(saranaCurrentKategori), 60000);


/* ===============================================
   SARANA TAB SWITCH
================================================ */
document.querySelectorAll(".sarana-tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".sarana-tab").forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });

    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");

    // tutup card yang lagi expand, soalnya angka & catatannya bakal ganti kategori
    document.querySelectorAll(".sarana-card.active").forEach(c => {
      c.classList.remove("active");
      c.setAttribute("aria-expanded", "false");
    });

    const k = tab.dataset.type;
    loadSarana(k);

    document.getElementById("saranaCards").style.display =
      k === "peralatan" ? "none" : "grid";

    document.getElementById("peralatanCard").style.display =
      k === "peralatan" ? "block" : "none";
  };

  tab.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tab.click();
    }
  });
});

/* ===============================================
  NORMA KENDALI
================================================ */

function loadNormakendali(){
  fetch(API_NORMA + '?mode=normakendali')
    .then(res => res.json())
    .then(d => {

      console.log('NORMA:', d);

      const map = {
        'norma-pnp-ber': d.pnpber,
        'norma-pnp-dat': d.pnpdat,
        'norma-brg-ber': d.brgber,
        'norma-brg-dat': d.brgdat
      };

      Object.keys(map).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = map[id] || '-';
      });

    })
    .catch(err => console.error('Norma Kendali:', err));
}


/* ===============================================
   REGULASI (TAB PDF) — versi inline sama seperti standalone
================================================ */
let regulasiData = [];
let regCurrentPdfDoc = null;
let regSearchMatches = [];
let regCurrentMatchIndex = -1;

async function loadRegulasi() {
  const list = document.getElementById("regList");
  if (!list) return;

  list.innerHTML = `
    <div class="reg-state-box">
      <div class="reg-state-icon">🚆</div>
      <div class="reg-state-title">Memuat regulasi…</div>
      <div class="reg-state-sub">Mohon tunggu sebentar.</div>
    </div>`;

  try {
    const res = await fetch(API_REGULASI);
    const data = await res.json();

    regulasiData = Array.isArray(data) ? data : [];
    renderRegulasi(regulasiData);

    const searchInput = document.getElementById("regSearch");
    if (searchInput) {
      searchInput.oninput = e => {
        const q = e.target.value.toLowerCase();
        renderRegulasi(
          regulasiData.filter(p => (p.nama || "").toLowerCase().includes(q))
        );
      };
    }

  } catch (err) {
    console.error("Regulasi:", err);
    list.innerHTML = `
      <div class="reg-state-box">
        <div class="reg-state-icon">⚠️</div>
        <div class="reg-state-title">Gagal memuat data</div>
        <div class="reg-state-sub">Periksa koneksi internet lalu muat ulang halaman.</div>
      </div>`;
  }
}

function renderRegulasi(data) {
  const list = document.getElementById("regList");
  const count = document.getElementById("regListCount");
  if (!list) return;

  if (count) count.textContent = data.length;

  if (!data.length) {
    list.innerHTML = `
      <div class="reg-state-box">
        <div class="reg-state-icon">🔍</div>
        <div class="reg-state-title">Tidak ditemukan</div>
        <div class="reg-state-sub">Coba kata kunci lain untuk mencari regulasi.</div>
      </div>`;
    return;
  }

  list.innerHTML = "";

  data.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "reg-item";
    div.innerHTML = `
      <div class="reg-item-icon">📄</div>
      <div class="reg-item-body">
        <div class="reg-item-code">REG · ${String(i + 1).padStart(3, "0")}</div>
        <div class="reg-item-title">${p.nama}</div>
      </div>
      <div class="reg-item-arrow">›</div>
    `;
    div.onclick = () => openRegViewer(p);
    list.appendChild(div);
  });
}

/* =========================
   VIEWER
========================= */
async function openRegViewer(p) {
  const viewer = document.getElementById("regViewer");
  const title = document.getElementById("regViewerTitle");
  const btnDownload = document.getElementById("regBtnDownload");
  const pagesEl = document.getElementById("regPdfPages");
  const searchInput = document.getElementById("regPdfSearch");

  viewer.style.display = "block";
  title.innerText = p.nama;
  btnDownload.href = p.file;

  searchInput.value = "";
  resetRegSearch();

  pagesEl.innerHTML = `
    <div class="reg-state-box">
      <div class="reg-state-icon">🚆</div>
      <div class="reg-state-title">Memuat dokumen…</div>
    </div>`;

  viewer.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    regCurrentPdfDoc = await pdfjsLib.getDocument(p.file).promise;
    await renderAllRegPages(regCurrentPdfDoc, pagesEl);
  } catch (err) {
    pagesEl.innerHTML = `
      <div class="reg-state-box">
        <div class="reg-state-icon">⚠️</div>
        <div class="reg-state-title">Gagal memuat dokumen</div>
        <div class="reg-state-sub">File PDF tidak bisa dibuka dari sumbernya.</div>
      </div>`;
  }
}

async function renderAllRegPages(pdfDoc, container) {
  container.innerHTML = "";

  const targetWidth = Math.min(container.clientWidth - 4, 860);

  for (let n = 1; n <= pdfDoc.numPages; n++) {
    const page = await pdfDoc.getPage(n);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const wrap = document.createElement("div");
    wrap.className = "reg-pdf-page-wrap";
    wrap.style.width = viewport.width + "px";
    wrap.style.height = viewport.height + "px";

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;

    const textLayerDiv = document.createElement("div");
    textLayerDiv.className = "reg-textLayer";
    textLayerDiv.style.width = viewport.width + "px";
    textLayerDiv.style.height = viewport.height + "px";

    const textContent = await page.getTextContent();
    pdfjsLib.renderTextLayer({
      textContent,
      container: textLayerDiv,
      viewport,
      textDivs: [],
    });

    wrap.appendChild(canvas);
    wrap.appendChild(textLayerDiv);
    container.appendChild(wrap);
  }
}

function closeRegViewer() {
  document.getElementById("regViewer").style.display = "none";
  document.getElementById("regPdfPages").innerHTML = "";
  regCurrentPdfDoc = null;
  resetRegSearch();
}

function printRegulasi() {
  window.print();
}

/* =========================
   SEARCH DALAM ISI PDF
========================= */
function resetRegSearch() {
  clearRegHighlights();
  regSearchMatches = [];
  regCurrentMatchIndex = -1;
  updateRegSearchCount();
}

function clearRegHighlights() {
  document.querySelectorAll("#regPdfPages mark.reg-search-hit").forEach(mark => {
    const parent = mark.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function runRegPdfSearch(query) {
  clearRegHighlights();
  regSearchMatches = [];
  regCurrentMatchIndex = -1;

  const q = query.trim().toLowerCase();
  if (!q) { updateRegSearchCount(); return; }

  const spans = document.querySelectorAll("#regPdfPages .reg-textLayer > span");

  spans.forEach(span => {
    const original = span.textContent;
    const lower = original.toLowerCase();
    if (!lower.includes(q)) return;

    const frag = document.createDocumentFragment();
    let cursor = 0;
    let idx;

    while ((idx = lower.indexOf(q, cursor)) !== -1) {
      if (idx > cursor) frag.appendChild(document.createTextNode(original.slice(cursor, idx)));
      const mark = document.createElement("mark");
      mark.className = "reg-search-hit";
      mark.textContent = original.slice(idx, idx + q.length);
      frag.appendChild(mark);
      regSearchMatches.push(mark);
      cursor = idx + q.length;
    }
    if (cursor < original.length) frag.appendChild(document.createTextNode(original.slice(cursor)));

    span.innerHTML = "";
    span.appendChild(frag);
  });

  if (regSearchMatches.length) {
    regCurrentMatchIndex = 0;
    focusRegMatch();
  }
  updateRegSearchCount();
}

function focusRegMatch() {
  regSearchMatches.forEach(m => m.classList.remove("active"));
  const active = regSearchMatches[regCurrentMatchIndex];
  if (!active) return;
  active.classList.add("active");
  active.scrollIntoView({ behavior: "smooth", block: "center" });
}

function goToNextRegMatch() {
  if (!regSearchMatches.length) return;
  regCurrentMatchIndex = (regCurrentMatchIndex + 1) % regSearchMatches.length;
  focusRegMatch();
}

function goToPrevRegMatch() {
  if (!regSearchMatches.length) return;
  regCurrentMatchIndex = (regCurrentMatchIndex - 1 + regSearchMatches.length) % regSearchMatches.length;
  focusRegMatch();
}

function updateRegSearchCount() {
  const countEl = document.getElementById("regSearchCount");
  const prevBtn = document.getElementById("regBtnSearchPrev");
  const nextBtn = document.getElementById("regBtnSearchNext");
  if (!countEl) return;

  if (!regSearchMatches.length) {
    countEl.textContent = "";
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }
  countEl.textContent = `${regCurrentMatchIndex + 1}/${regSearchMatches.length}`;
  prevBtn.disabled = false;
  nextBtn.disabled = false;
}

/* wiring toolbar pencarian isi PDF (debounce ringan) */
(() => {
  const input = document.getElementById("regPdfSearch");
  const prevBtn = document.getElementById("regBtnSearchPrev");
  const nextBtn = document.getElementById("regBtnSearchNext");
  if (!input || !prevBtn || !nextBtn) return;

  let debounceTimer;

  input.addEventListener("input", e => {
    clearTimeout(debounceTimer);
    const value = e.target.value;
    debounceTimer = setTimeout(() => runRegPdfSearch(value), 250);
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.shiftKey ? goToPrevRegMatch() : goToNextRegMatch();
    }
  });

  prevBtn.addEventListener("click", goToPrevRegMatch);
  nextBtn.addEventListener("click", goToNextRegMatch);
})();

/* pdf.js worker setup */
if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}
