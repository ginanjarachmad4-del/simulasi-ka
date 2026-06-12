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

const DATA_URL = "https://script.google.com/macros/s/AKfycbwKMRADQKxmWFzqUlqkt0mYlQiwnMf0MPlgujLpBRnaduuBPSoZf0kG_wrJdN0XUYXiVQ/exec";

async function loadKelkaDatang() {
  try {
    const res = await fetch(DATA_URL);
    const json = await res.json();

    document.getElementById("kelkaDatang").innerText = json.jumlahKaDatang ?? 0;

  } catch (err) {
    console.error("Gagal fetch KPI KA datang", err);
    document.getElementById("kelkaDatang").innerText = "-";
  }
}

loadKelkaDatang();
setInterval(loadKelkaDatang, 60000);


