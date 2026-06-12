/* VIDEO */

const playlist = document.getElementById("playlist");
const player = document.getElementById("player");

const VIDEO_API =
"https://raw.githubusercontent.com/ginanjarachmad4-del/youtube-json/main/videos.json?v=" + Date.now();

fetch(VIDEO_API)
.then(r => r.json())
.then(data => {

playlist.innerHTML = "";

data.forEach((v,i)=>{

const item = document.createElement("div");

item.className = "playlist-item";
item.textContent = v.nama;

item.onclick = ()=>{

document.querySelectorAll(".playlist-item")
.forEach(x=>x.classList.remove("active"));

item.classList.add("active");

player.src = v.file;

};

if(i===0){
item.classList.add("active");
player.src = v.file;
}

playlist.appendChild(item);

});

});

/* PDF LIST */

fetch("data/pdf.json")
.then(r=>r.json())
.then(data=>{

const list=document.getElementById("pdfList");

list.innerHTML="";

data.forEach(p=>{

const d=document.createElement("div");

d.className="pdf-item";
d.textContent="📄 " + p.nama;

d.onclick=()=>openPDF(p.file);

list.appendChild(d);

});

});

/* PDF VIEWER */

let currentPdf="";

function openPDF(url){

currentPdf=url;

const viewer=
"https://mozilla.github.io/pdf.js/web/viewer.html?file="
+ encodeURIComponent(url);

document.getElementById("pdfFrame").src=viewer;

document.getElementById("pdfModal").style.display="block";

}

function closePDF(){

document.getElementById("pdfModal").style.display="none";

document.getElementById("pdfFrame").src="";

}

function downloadPdf(){

window.open(currentPdf);

}

/* TABS */

document.querySelectorAll(".tab").forEach(tab=>{

tab.onclick=()=>{

document.querySelectorAll(".tab")
.forEach(t=>t.classList.remove("active"));

document.querySelectorAll(".tab-content")
.forEach(c=>c.classList.remove("active"));

tab.classList.add("active");

document
.getElementById(tab.dataset.tab)
.classList.add("active");

};

});

/* LANDING LOGIN */

document.getElementById("enterBtn").onclick=()=>{

const landing=document.getElementById("landing");

landing.classList.add("hidden");

setTimeout(()=>{

landing.style.display="none";

},700);

};

function updateClock(){
  const now = new Date();
  const time = now.toLocaleTimeString("id-ID", {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById("clock").innerText = time + " WIB";
}

setInterval(updateClock, 1000);
updateClock();


/* ================================
   KPI – JUMLAH KA DATANG
================================ */

const DATA_URL =
"https://script.google.com/macros/s/AKfycbyN-IIdNIOkSs4UNTgg0d8h7Wulffs1UGYGNvlBfE1BcjOifvW6KefjC6-SMkHNd1Z67g/exec";

async function loadKelkaDatang() {
  try {
    const res = await fetch(DATA_URL + "?type=datang");
    const json = await res.json();

    document.getElementById("kelkaDatang").innerText =
      json.jumlah ?? 0;

  } catch (err) {
    console.error("Gagal fetch KPI KA datang", err);
    document.getElementById("kelkaDatang").innerText = "-";
  }
}

loadKelkaDatang();
setInterval(loadKelkaDatang, 60000);
/* ================================
   TABLE – KELKA DATANG REALTIME
================================ */

async function loadKelkaDatangTable() {
  const tbody = document.getElementById("kelkaDatangTable");

  try {
    const res = await fetch(DATA_URL + "?type=datang");
    const json = await res.json();

    tbody.innerHTML = "";

    if (!json.data || json.data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;opacity:.6">
            Tidak ada data KA datang
          </td>
        </tr>`;
      return;
    }

    json.data.forEach(row => {
      if (!row.datang) return; // safety

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${row.nomorKA ?? "-"}</td>
        <td>${row.jenisKA ?? "-"}</td>
        <td>${row.namaKA ?? "-"}</td>
        <td>${row.lintas ?? "-"}</td>
        <td>${row.jamDat ?? "-"}</td>
        <td>
          <span class="badge ${row.kelambatan > 10 ? "danger" : "warning"}">
            ${row.kelambatan} menit
          </span>
        </td>
      `;

      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error("Gagal load tabel KELKA datang", err);
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:red">
          Gagal memuat data
        </td>
      </tr>`;
  }
}

loadKelkaDatangTable();
setInterval(loadKelkaDatangTable, 60000);

/* ================================
   KPI – JUMLAH KA BERANGKAT
================================ */
async function loadKelkaBerangkat() {
  try {
    const res = await fetch(DATA_URL + "?type=berangkat");
    const json = await res.json();

    document.getElementById("kelkaBerangkat").innerText =
      json.jumlah ?? 0;

  } catch (err) {
    console.error("Gagal fetch KPI KA berangkat", err);
    document.getElementById("kelkaBerangkat").innerText = "-";
  }
}

loadKelkaBerangkat();
setInterval(loadKelkaBerangkat, 60000);
