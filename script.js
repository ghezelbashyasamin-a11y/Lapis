/* ============================================================
   ✏️  YOUR IMAGES GO HERE
   Put a link OR a file path between the quotes. Examples:
     "https://example.com/photos/ring.jpg"   (direct link to the image file)
     "images/ring.jpg"                        (file inside an "images" folder next to index.html)
   Leave "" to keep the lapis gradient placeholder.
   "img" = main photo, "img2" = photo shown on hover (optional).
   ============================================================ */
const SETTINGS = {
  imageFolder: "img/",          // your local folder (next to index.html). Below, just write the file name: "ring1.jpg"
  respectReducedMotion: false   // true = calmer page for people with "reduce motion" turned on
};

const IMAGES = {
  storyImage: "",
  categories: {
    Bracelets: "braz.jfif",
    Necklaces: "nec.jfif",
    Rings:     "ring1.jfif",
    Earrings:  "ear.jfif"
  }
};

const PRODUCTS = [
  { name:"Midnight Cuff",        type:"Bracelets", note:"Silver cuff, 12mm lapis",    price:89,  badge:"Bestseller", img:"braz1.jpeg", img2:"" },
  { name:"Pyrite Bead Bracelet", type:"Bracelets", note:"8mm beads, gold spacers",    price:64,  badge:"",           img:"braz2.jfif", img2:"" },
  { name:"Nile Pendant",         type:"Necklaces", note:"Teardrop stone, 18\" chain", price:118, badge:"New",        img:"nec1.jpeg", img2:"" },
  { name:"Celestia Choker",      type:"Necklaces", note:"Raw-cut lapis, gold fill",   price:96,  badge:"",           img:"nec2.jfif", img2:"" },
  { name:"Sultan Ring",          type:"Rings",     note:"Oval cabochon, 925 silver",  price:79,  badge:"Bestseller", img:"ring.jfif", img2:"" },
  { name:"Orbit Stack Ring",     type:"Rings",     note:"Set of three, mixed cuts",   price:72,  badge:"",           img:"ring2.jfif", img2:"" },
  { name:"Starfall Drops",       type:"Earrings",  note:"Lapis drops, hook backs",    price:58,  badge:"New",        img:"ear1.jpeg", img2:"" },
  { name:"Dusk Studs",           type:"Earrings",  note:"6mm round, everyday wear",   price:38,  badge:"",           img:"ear2.jfif", img2:"" }
];
/* ============================================================
   Below this line you don't need to change anything.
   ============================================================ */

const $ = (s, el = document) => el.querySelector(s);

if (SETTINGS.respectReducedMotion && matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.documentElement.classList.add("calm");
}

// builds a real <img>; if the link is broken it removes itself and the gradient shows
function pic(url, cls, alt) {
  const i = new Image();
  i.className = "pic " + (cls || "");
  i.alt = alt || "";
  i.onerror = () => i.remove();
  url = String(url).trim();
  i.src = /^(https?:|\/|data:|\.\.?\/)/i.test(url) ? url : SETTINGS.imageFolder + url;
  return i;
}
function fillSlot(slot, url, cls, alt) {
  if (url && String(url).trim()) slot.replaceWith(pic(url, cls, alt)); else slot.remove();
}

// categories
$("#cats").innerHTML = Object.keys(IMAGES.categories).map(k =>
  `<div class="cat rv" data-f="${k}" tabindex="0" role="button"><span class="slot" data-c="${k}"></span><h3>${k}</h3></div>`).join("");
document.querySelectorAll("[data-c]").forEach(s => fillSlot(s, IMAGES.categories[s.dataset.c], "", s.dataset.c));
if (IMAGES.storyImage && IMAGES.storyImage.trim()) $("#storyArt").appendChild(pic(IMAGES.storyImage, "", "Lapis lazuli jewelry"));

// filters + products
const types = ["All", ...new Set(PRODUCTS.map(p => p.type))];
$("#filters").innerHTML = types.map((t, i) => `<button class="chip ${i ? "" : "on"}" data-f="${t}">${t}</button>`).join("");
$("#grid").innerHTML = PRODUCTS.map((p, i) => `
  <article class="card rv" data-t="${p.type}" style="transition-delay:${(i % 4) * 80}ms">
    <div class="frame">
      <div class="gem">✦</div>
      ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
      <span class="slot" data-p="${i}" data-w="a"></span>
      <span class="slot" data-p="${i}" data-w="b"></span>
      <button class="quick" data-add="${p.name}">Add to bag</button>
    </div>
    <div class="info"><div><h3>${p.name}</h3><small>${p.note}</small></div><span class="price">$${p.price}</span></div>
  </article>`).join("");
document.querySelectorAll("[data-p]").forEach(s => {
  const p = PRODUCTS[s.dataset.p];
  if (s.dataset.w === "a") fillSlot(s, p.img, "", p.name);
  else fillSlot(s, p.img2 || p.img, "b", p.name + " worn");
});

function filter(f) {
  document.querySelectorAll(".chip").forEach(c => c.classList.toggle("on", c.dataset.f === f));
  document.querySelectorAll(".card").forEach(c => c.classList.toggle("hide", f !== "All" && c.dataset.t !== f));
}
document.addEventListener("click", e => {
  const c = e.target.closest("[data-f]");
  if (c) { filter(c.dataset.f); if (c.classList.contains("cat")) $("#shop").scrollIntoView({ behavior: "smooth" }); }
  const a = e.target.closest("[data-add]");
  if (a) { $("#count").textContent = +$("#count").textContent + 1; toast(a.dataset.add + " added to your bag ✦"); }
});
document.addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("cat")) e.target.click(); });

// toast
let tt;
function toast(m) {
  const t = $("#toast"); t.textContent = m; t.classList.add("show");
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove("show"), 2400);
}

// nav + scroll reveal
addEventListener("scroll", () => $("#nav").classList.toggle("solid", scrollY > 40), { passive: true });
const rv = document.querySelectorAll(".rv");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .15 });
  rv.forEach(el => io.observe(el));
} else rv.forEach(el => el.classList.add("in"));

// golden pyrite specks, brighter near the cursor
const cv = $("#specks"), cx = cv.getContext("2d");
let W, H, dots = [], mx = -999, my = -999;
function size() {
  W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight;
  dots = Array.from({ length: Math.min(140, Math.max(30, W / 9)) }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + .3, s: Math.random() * .25 + .05, p: Math.random() * 6 }));
}
size(); addEventListener("resize", size); addEventListener("load", size);
$(".hero").addEventListener("mousemove", e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
(function loop(t) {
  cx.clearRect(0, 0, W, H);
  for (const d of dots) {
    d.y -= d.s; d.x += Math.sin(t / 2000 + d.p) * .15;
    if (d.y < -5) { d.y = H + 5; d.x = Math.random() * W; }
    const near = Math.max(0, 1 - Math.hypot(d.x - mx, d.y - my) / 180);
    const a = .35 + .35 * Math.sin(t / 700 + d.p) + near * .6;
    cx.beginPath(); cx.arc(d.x, d.y, d.r + near * 2, 0, 7);
    cx.fillStyle = `rgba(216,180,90,${Math.min(a, 1)})`; cx.shadowColor = "#D8B45A"; cx.shadowBlur = 6 + near * 14; cx.fill();
  }
  requestAnimationFrame(loop);
})(0);
