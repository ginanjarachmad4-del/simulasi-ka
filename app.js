/*************************************************
 * ROCC – FRONTEND MAIN JS (FINAL CLEAN VERSION)
 * Pusdalopka 2 Bandung
 * Stable Production – 2026
 *************************************************/

/* ===============================================
   API CONFIG (JANGAN DIUBAH)
================================================ */
const API_KELKA =
  "https://script.google.com/macros/s/AKfycbxPH9EpBosGqwNeXpp_re4gfqCjn-LXUTjiUulFafkpwMk_G3GbcgYkl5e7I6D993CP/exec";

const API_STAMFORMASI =
  "https://script.google.com/macros/s/AKfycbzzWiI1JmawlYXsVjCVs9b9t3LdgvEl3Tw_pwQGSpRcdz99xuRoxhxfXW160DKvCbkd/exec";

const API_SARANA =
  "https://script.google.com/macros/s/AKfycbz50G5lqeAfklW_sUZiD0IZh1uMTMkQGJAEp6kJMLC2EezdH8DNE_LOIPE35lLuElh35Q/exec";

/* ===============================================
   DOM READY
================================================ */
document.addEventListener("DOMContentLoaded", () => {

  const enterBtn = document.getElementById("enterBtn");
  const landing  = document.getElementById("landing");

  if (enterBtn && landing) {
    enterBtn.onclick = () => {
      landing.classList.add("hidden");
      setTimeout(() => landing.style.display = "none", 600);
    };
  }

  const clock = document.getElementById("clock");
  if (clock) {
    const tick = () => {
      clock.innerText =
        new Date().toLocaleTimeString("id-ID", {
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

  loadKinerjaOperasi();
  loadKelkaDatang();
  loadKelkaBerangkat();
  loadKelkaDatangTable();
  loadKelkaBerangkatTable();
  loadJumlahKA();
  loadStamformasi();
  loadSarana("lokomotif");
});

/* ===============================================
   KELKA
================================================ */
async function loadKelkaDatang(){
  try {
    const j = await fetch(API_KELKA + "?type=datang").then(r=>r.json());
    document.getElementById("kelkaDatang").innerText = j.jumlah ?? 0;
  } catch {
    document.getElementById("kelkaDatang").innerText = "-";
  }
}

async function loadKelkaBerangkat(){
  try {
    const j = await fetch(API_KELKA + "?type=berangkat").then(r=>r.json());
    document.getElementById("kelkaBerangkat").innerText = j.jumlah ?? 0;
  } catch {
    document.getElementById("kelkaBerangkat").innerText = "-";
  }
}

setInterval(loadKelkaDatang, 60000);
setInterval(loadKelkaBerangkat, 60000);

/* ===============================================
   TABLE
================================================ */
async function renderKelkaTable(type, tableId){
  const tbody = document.getElementById(tableId);

  try {
    const j = await fetch(API_KELKA + "?type=" + type).then(r=>r.json());
    tbody.innerHTML = "";

    if (!j.data?.length) {
      tbody.innerHTML =
        `<tr><td colspan="6" style="text-align:center;opacity:.6">Tidak ada data</td></tr>`;
      return;
    }

    j.data.forEach(x => {
      const telat = Number(x.kelambatan) || 0;

      tbody.innerHTML += `
        <tr>
          <td>${x.nomorKA ?? "-"}</td>
          <td>${x.jenisKA ?? "-"}</td>
          <td>${x.namaKA ?? "-"}</td>
          <td>${x.lintas ?? "-"}</td>
          <td>${x.jam ?? "-"}</td>
          <td>${telat} menit</td>
        </tr>`;
    });

  } catch {
    tbody.innerHTML =
      `<tr><td colspan="6" style="color:red;text-align:center">Gagal load data</td></tr>`;
  }
}

function loadKelkaDatangTable(){ renderKelkaTable("datang","kelkaDatangTable"); }
function loadKelkaBerangkatTable(){ renderKelkaTable("berangkat","kelkaBerangkatTable"); }

setInterval(loadKelkaDatangTable, 60000);
setInterval(loadKelkaBerangkatTable, 60000);

/* ===============================================
   GAUGE FIX (INI KUNCI)
================================================ */
function updateGauge(gaugeEl, percent) {
  if (!gaugeEl) return;

  const value = Math.max(0, Math.min(percent, 100));

  const arc = gaugeEl.querySelector(".gauge-blue, .gauge-orange");
  if (!arc) return;

  // progress saja
  arc.style.strokeDasharray = "100";
  arc.style.strokeDashoffset = 100 - value;

  // 🔥 FIX WARNA STATIC PER TIPE GAUGE
  if (arc.classList.contains("gauge-blue")) {
    arc.style.stroke = "#2563eb"; // BERANGKAT = BIRU SELALU
  }

  if (arc.classList.contains("gauge-orange")) {
    arc.style.stroke = "#f97316"; // DATANG = ORANGE SELALU
  }
}


/* ===============================================
   KINERJA OPERASI (FIXED)
================================================ */
async function loadKinerjaOperasi() {
  try {
    const r = await fetch(API_KELKA + "?mode=kinerja");
    const d = await r.json();

    const berangkat = Number(d.berangkat) || 0;
    const datang    = Number(d.datang) || 0;

    const persenBerangkat = berangkat <= 1 ? berangkat * 100 : berangkat;
    const persenDatang    = datang <= 1 ? datang * 100 : datang;

    document.getElementById("kpi-berangkat").textContent =
      persenBerangkat.toFixed(1) + "%";

    document.getElementById("kpi-datang").textContent =
      persenDatang.toFixed(1) + "%";

    updateGauge(
      document.querySelector("#kpi-berangkat").closest(".gauge"),
      persenBerangkat
    );

    updateGauge(
      document.querySelector("#kpi-datang").closest(".gauge"),
      persenDatang
    );

  } catch (e) {
    console.error("Kinerja error:", e);
  }
}

loadKinerjaOperasi();
setInterval(loadKinerjaOperasi, 30000);

/* ===============================================
   JUMLAH KA
================================================ */
async function loadJumlahKA(){
  try{
    const r = await fetch(API_KELKA + "?mode=jumlahka");
    const j = await r.json();

    document.getElementById("kpi-realisasi").innerText = j.realisasi ?? 0;
    document.getElementById("kpi-antarkota").innerText = j.antarkota ?? 0;
    document.getElementById("kpi-perkotaan").innerText = j.perkotaan ?? 0;
    document.getElementById("kpi-barang").innerText = j.barang ?? 0;

  } catch(e){
    console.error(e);
  }
}

loadJumlahKA();
setInterval(loadJumlahKA, 60000);




/* ===============================================
   STAMFORMASI V3
   ROCC AUTO SCROLL
================================================ */

async function loadStamformasi(){

  try{

    const j = await fetch(API_STAMFORMASI)
      .then(r => r.json());

    renderStam(
      "stamformasiJJ",
      j.jarakJauh,
      "countJJ"
    );

    renderStam(
      "stamformasiLokal",
      j.lokal,
      "countLokal"
    );

    renderStam(
      "stamformasiTambahan",
      j.tambahan,
      "countTambahan"
    );

  }catch(err){

    console.error(err);

    [
      "stamformasiJJ",
      "stamformasiLokal",
      "stamformasiTambahan"
    ].forEach(id=>{

      document.getElementById(id).innerHTML = `
        <div class="ka-item">
          <span class="ka-title">
            Gagal memuat data
          </span>
        </div>
      `;

    });

  }

}

/* ===============================================
   RENDER LIST KA
================================================ */

function renderStam(id,data,countId){

  const container =
    document.getElementById(id);

  const counter =
    document.getElementById(countId);

  container.innerHTML = "";

  if(!data || data.length === 0){

    container.innerHTML = `
      <div class="ka-item">
        <span class="ka-title">
          Tidak ada data
        </span>
      </div>
    `;

    if(counter){
      counter.textContent = "0 KA";
    }

    return;
  }

  if(counter){
    counter.textContent =
      `${data.length} KA`;
  }

  let html = "";

  data.forEach(x=>{

    html += `

      <div
        class="ka-item"
        onclick='showKADetail(${JSON.stringify(x)})'
      >

        <span class="ka-icon">
          🚆
        </span>

        <span class="ka-title">
          ${x.ka ?? "-"}
        </span>

      </div>

    `;

  });

  /* DUPLIKASI AGAR LOOP HALUS */

  container.innerHTML = `
    <div class="ka-list-inner">
      ${html}
      ${html}
    </div>
  `;

}

/* ===============================================
   SEARCH
================================================ */

function filterKA(input,id){

  const keyword =
    input.value.toLowerCase();

  document
    .querySelectorAll(`#${id} .ka-item`)
    .forEach(item=>{

      const nama =
        item.querySelector(".ka-title")
          .textContent
          .toLowerCase();

      item.style.display =
        nama.includes(keyword)
          ? ""
          : "none";

    });

}

/* ===============================================
   DETAIL KA MODAL
================================================ */

function showKADetail(data){

  document.getElementById(
    "modalNamaKA"
  ).textContent = `🚆 ${data.ka || "-"}`;

  document.getElementById(
    "modalContent"
  ).innerHTML = `

    <div style="margin-bottom:16px">

      <b style="color:#38bdf8">
        Lokomotif
      </b>

      <div>
        ${data.lokomotif || "-"}
      </div>

    </div>

    <div style="margin-bottom:16px">

      <b style="color:#38bdf8">
        Stamformasi
      </b>

      <div>
        ${data.stamformasi || "-"}
      </div>

    </div>

    <div>

      <b style="color:#38bdf8">
        Keterangan
      </b>

      <div>
        ${data.keterangan || "-"}
      </div>

    </div>

  `;

  document
    .getElementById("kaModal")
    .classList.add("show");

}

function closeKAModal(){

  document
    .getElementById("kaModal")
    .classList.remove("show");

}

/* klik area gelap untuk menutup */

document.addEventListener("click",function(e){

  const modal =
    document.getElementById("kaModal");

  if(e.target === modal){
    closeKAModal();
  }

});

document.addEventListener("click", function(e){

  const modal =
    document.getElementById("kaModal");

  if(e.target === modal){
    closeKAModal();
  }

});


/* ===============================================
   SARANA
================================================ */
async function loadSarana(kategori){
  try {
    if (kategori === "peralatan") kategori = "peralatan khusus";

    const j = await fetch(
      API_SARANA + "?type=sarana&kategori=" + encodeURIComponent(kategori)
    ).then(r=>r.json());

    if (!j?.status) return showPeralatanError("Gagal ambil data");

    if (kategori === "peralatan khusus") {
      const noteBox = document.getElementById("peralatan-note");
      const card = document.getElementById("peralatanCard");
      card.style.display = "block";

      const p =
        j.data?.PERALATAN_KHUSUS ||
        j.data?.PERALATAN ||
        j.data?.peralatan;

      if (!p?.catatan?.length) {
        noteBox.innerHTML =
          `<div style="opacity:.6;text-align:center">Tidak ada data</div>`;
        return;
      }

      noteBox.innerHTML = p.catatan.map(v=>`<div>• ${v}</div>`).join("");
      return;
    }

    document.querySelectorAll(".sarana-card").forEach(card=>{
      const key = card.dataset.key?.toUpperCase();
      const item = j.data?.[key];
      if (!item) return;

      card.querySelector(".card-number").innerText = item.jumlah ?? 0;
      card.querySelector(".card-note").innerHTML =
        (item.catatan||[]).map(v=>`<div>${v}</div>`).join("");
    });

  } catch {
    showPeralatanError("Kesalahan koneksi");
  }
}

function showPeralatanError(msg){
  const box = document.getElementById("peralatan-note");
  if (box) box.innerHTML =
    `<div style="color:#ffb4b4;text-align:center">${msg}</div>`;
}

function toggleNote(card){
  document.querySelectorAll(".sarana-card")
    .forEach(c=>c!==card&&c.classList.remove("active"));
  card.classList.toggle("active");
}

document.querySelectorAll(".sarana-tab").forEach(tab=>{
  tab.onclick = ()=>{
    document.querySelectorAll(".sarana-tab").forEach(t=>t.classList.remove("active"));
    tab.classList.add("active");

    const k = tab.dataset.type;
    loadSarana(k);

    document.getElementById("saranaCards").style.display =
      k==="peralatan" ? "none" : "grid";
    document.getElementById("peralatanCard").style.display =
      k==="peralatan" ? "block" : "none";
  };
});
