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
   ROCC – REALTIME JAM FILTER
================================ */

const DATA_URL = "https://script.google.com/macros/s/AKfycbx-j09qBiFmt5kSA_PKQVX9b6jDj1ucM5m6idDzCf89O_fXQmVmIKPLbSsDmUnt9OHFVw/exec";
const container = document.getElementById("dashboard");

/* Ambil jam realtime */
function getCurrentHour() {
  return new Date().getHours().toString().padStart(2, "0");
}

/* Render posisi KA */
function renderKA(data) {
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = `<div style="opacity:.6;text-align:center;padding:20px">
      Tidak ada KA pada jam ini
    </div>`;
    return;
  }

  const table = document.createElement("table");
  table.className = "rocc-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>KA</th>
        <th>Relasi</th>
        <th>Jam</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  data.forEach(row => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${row.ka}</td>
      <td>${row.relasi}</td>
      <td>${row.jam}:00</td>
      <td class="${row.status === 'Tepat' ? 'status-ok' : 'status-delay'}">
        ${row.status}
      </td>
    `;

    tbody.appendChild(tr);
  });

  container.appendChild(table);
}

/* Fetch + filter jam */
async function loadRealtimeKA() {
  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();

    const currentHour = getCurrentHour();

    const filtered = data.filter(row => {
      return row.jam.toString().padStart(2, "0") === currentHour;
    });

    renderKA(filtered);
  } catch (err) {
    container.innerHTML = `<div style="color:red;text-align:center">
      Gagal load data
    </div>`;
    console.error(err);
  }
}

/* Auto refresh */
loadRealtimeKA();
setInterval(loadRealtimeKA, 60000); // update tiap 1 menit
