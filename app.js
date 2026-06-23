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

/* ===============================================
   CHART RENDER
================================================ */
function updateChartAtas(data) {

  const ctx = document.getElementById("ketepatanChart");
  if (!ctx) return;

  if (chartAtas) chartAtas.destroy();

  chartAtas = new Chart(ctx, {
    type: "bar",

    data: {
      labels: data.map(x => x.label),

      datasets: [{
        data: data.map(x => Number(x.persen) || 0),

        backgroundColor: "#f59e0b",
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
          display: true,
          text: "KETEPATAN KA (%)"
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

  chartBawah = new Chart(ctx, {
    type: "bar",

     data: {
      labels: data.map(x => x.label),

      datasets: [{
        data: data.map(x => Number(x.persen) || 0),

        backgroundColor: "#f59e0b",
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
          display: true,
          align: "start",
          text: "KELAMBATAN KA (Menit)",
          color: "#374151",
          font: {
            size: 18,
            weight: "bold"
          }
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
   API CONFIG
================================================ */
const API_KELKA = "https://script.google.com/macros/s/AKfycbxpMWC0T4O90ZEfQvLsqM8k8bLgmNhZmLItf0M0SuJqZAIVVKeY-6TiEb0EougTHXAljg/exec";

const API_OPERASI = "https://script.google.com/macros/s/AKfycbxpMWC0T4O90ZEfQvLsqM8k8bLgmNhZmLItf0M0SuJqZAIVVKeY-6TiEb0EougTHXAljg/exec";

const API_PROGRAM = "https://script.google.com/macros/s/AKfycbxpMWC0T4O90ZEfQvLsqM8k8bLgmNhZmLItf0M0SuJqZAIVVKeY-6TiEb0EougTHXAljg/exec";

const API_STAMFORMASI = "https://script.google.com/macros/s/AKfycbzzWiI1JmawlYXsVjCVs9b9t3LdgvEl3Tw_pwQGSpRcdz99xuRoxhxfXW160DKvCbkd/exec";

const API_SARANA = "https://script.google.com/macros/s/AKfycbz50G5lqeAfklW_sUZiD0IZh1uMTMkQGJAEp6kJMLC2EezdH8DNE_LOIPE35lLuElh35Q/exec";


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
});


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

  const gauge = valueEl.closest('.gauge');
  if(!gauge) return;

  // FIX: jangan ambil .gauge-arc (karena kamu pakai color class)
  const path = gauge.querySelector('path.gauge-blue, path.gauge-green, path.gauge-orange, path.gauge-yellow');
  if(!path) return;

  const v = Math.max(0, Math.min(Number(percent) || 0, 100));

  // FIX: cache length (jangan hitung ulang tiap update)
  let length = path.getTotalLength();

  if(!path.dataset.init){
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;
    path.dataset.init = "true";
  }

  // animate
  requestAnimationFrame(() => {
    path.style.transition = "stroke-dashoffset .6s ease";
    path.style.strokeDashoffset = length - (length * v / 100);
  });

  valueEl.textContent = v.toFixed(1) + "%";
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
          <div class="ka-item">
            <div class="ka-header">
              <div class="ka-icon">🚆</div>
              <div>Gagal memuat data</div>
            </div>
          </div>
        `;
      });
  }
}


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
      <div class="ka-item">
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
}


/* ===============================================
   FILTER KA (UPDATED)
================================================ */
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

        <div class="kelka-left">

          <div class="kelka-icon ${Number(x.kelambatan) > 0 ? "lambat" : "tepat"}">
            🚆
          </div>

          <div class="kelka-info">

            <div class="kelka-nomor">
              KA ${x.nomorKA ?? "-"}
            </div>

            <div class="kelka-nama">
              ${x.namaKA ?? "-"}
            </div>

            <div class="kelka-jam">
              🕒 ${x.jam ?? "-"}
            </div>

          </div>

        </div>

        <div class="kelka-delay ${Number(x.kelambatan) > 0 ? "lambat" : "tepat"}">
          ${x.kelambatan ?? 0} Menit
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
async function loadSarana(kategori) {
  try {
    if (kategori === "peralatan") kategori = "peralatan khusus";

    const j = await fetch(
      API_SARANA + "?type=sarana&kategori=" + encodeURIComponent(kategori)
    ).then(r => r.json());

    if (!j?.status) return showPeralatanError("Gagal ambil data");

    if (kategori === "peralatan khusus") {
      const noteBox = document.getElementById("peralatan-note");
      const card = document.getElementById("peralatanCard");
      card.style.display = "block";

      const p = j.data?.PERALATAN_KHUSUS || j.data?.PERALATAN || j.data?.peralatan;

      if (!p?.catatan?.length) {
        noteBox.innerHTML = `<div style="opacity:.6;text-align:center">Tidak ada data</div>`;
        return;
      }

      noteBox.innerHTML = p.catatan.map(v => `<div>${v}</div>`).join("");
      return;
    }

    document.querySelectorAll(".sarana-card").forEach(card => {
      const key = card.dataset.key?.toUpperCase();
      const item = j.data?.[key];
      if (!item) return;

      card.querySelector(".card-number").innerText = item.jumlah ?? 0;
      card.querySelector(".card-note").innerHTML =
        (item.catatan || []).map(v => `<div>${v}</div>`).join("");
    });

  } catch {
    showPeralatanError("Kesalahan koneksi");
  }
}

function showPeralatanError(msg) {
  const box = document.getElementById("peralatan-note");
  if (box) box.innerHTML = `<div style="color:#ffb4b4;text-align:center">${msg}</div>`;
}

function toggleNote(card) {
  document.querySelectorAll(".sarana-card")
    .forEach(c => c !== card && c.classList.remove("active"));

  card.classList.toggle("active");
}


/* ===============================================
   SARANA TAB SWITCH
================================================ */
document.querySelectorAll(".sarana-tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".sarana-tab")
      .forEach(t => t.classList.remove("active"));

    tab.classList.add("active");

    const k = tab.dataset.type;
    loadSarana(k);

    document.getElementById("saranaCards").style.display =
      k === "peralatan" ? "none" : "grid";

    document.getElementById("peralatanCard").style.display =
      k === "peralatan" ? "block" : "none";
  };
});
