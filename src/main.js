/* ---------------------------------------------------------------------------
   Hub: unendliches Brett mit drei Zoomstufen (Übersicht → Ordner/Schublade → Karte).
   Übertragen aus portfolio-hub-final.html; Inhalte kommen jetzt aus projects/.
   --------------------------------------------------------------------------- */
import './style.css';
import { buildItems } from './data.js';
import { U, reduced, cssVar, esc, inkFor } from './util.js';
import { openRoom as showRoom, closeRoom, roomOpen } from './room.js';

const ITEMS = buildItems();
const byId = {}; ITEMS.forEach(it => byId[it.id] = it);
const KIND = { haupt: 'Main project', klein: 'Project', probe: 'Work sample', about: 'About', drawer: 'Drawer', slot: 'Open slot' };
const openable = it => ['haupt', 'klein', 'probe', 'about'].includes(it.kind);
const stripes = s => `repeating-linear-gradient(${s}, transparent 0 .12em, rgba(0,0,0,.18) .12em calc(.12em + 1px))`;

const stage = document.getElementById('stage'), world = document.getElementById('world');
const els = {};

/* ---------- Elemente bauen ---------- */
function folderHTML(it) {
  const label = it.ph ? 'Project · Placeholder' : KIND[it.kind];
  const tab = it.kind === 'probe' ? '' : `<div class="tab"><span>${label}</span>${it.cur ? '<span class="tk">Curated</span>' : ''}</div>`;
  const bg = it.cover ? `background-image:url('${it.cover}')` : it.stripes ? `background-image:${stripes(it.stripes)}` : '';
  return `${tab}<div class="lifted"><div class="body"><div class="cover" style="${bg}">${it.cover ? '' : `<span class="glyph">${it.code}</span>`}</div>
    <div class="meta"><div class="title">${esc(it.title)}</div><div class="tagl">${esc(it.tag)}</div>
    <div class="foot"><div class="chapters">${it.chapters.map(c => `<span class="chip">${esc(c.name)}</span>`).join('')}</div>
    <button class="open" type="button" tabindex="-1">Open file</button></div></div></div></div>`;
}
const drawerCount = ITEMS.find(i => i.kind === 'drawer')?.count ?? 0;
ITEMS.forEach(it => {
  const el = document.createElement('div');
  const inset = it.parent ? 12 : 7;
  el.className = 'item ' + it.kind + (it.cur ? ' cur' : '');
  el.dataset.id = it.id;
  el.style.cssText = `--w:${it.w};left:${it.x * U + inset}px;top:${it.y * U + inset}px;width:${it.w * U - 2 * inset}px;height:${it.h * U - 2 * inset}px;` +
    `z-index:${it.kind === 'drawer' ? 0 : it.parent ? 2 : 1}`;
  if (it.cv) { el.style.setProperty('--cv', it.cv); el.style.setProperty('--ci', inkFor(it.cv)); }
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', (KIND[it.kind] || '') + ': ' + it.title);
  if (['haupt', 'klein', 'probe'].includes(it.kind)) el.innerHTML = folderHTML(it);
  else if (it.kind === 'drawer') el.innerHTML = `<div class="dhead"><span>Work Samples</span><span>${drawerCount} · 1×1</span></div><div class="dsub">Skills and ideas that don't need a whole project</div>`;
  else if (it.kind === 'slot') el.innerHTML = `<div><div class="plus">+</div><div class="stxt">${it.parent ? 'Room for samples' : 'Room for the<br>next project'}</div></div>`;
  else if (it.kind === 'about') el.innerHTML = `<span class="ph">About</span><b>${esc(it.title)}</b><p>${esc(it.tag)}</p>`;
  world.appendChild(el);
  els[it.id] = el;
});

/* ---------- Ansicht ---------- */
let view = { s: 1, tx: 0, ty: 0 }, s0 = 1, logoH = 76;
let focus = null, free = false, anim = null;
const chain = id => !id ? [] : (byId[id].parent ? [byId[id].parent, id] : [id]);

function contentRect() {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  ITEMS.forEach(it => { x0 = Math.min(x0, it.x); y0 = Math.min(y0, it.y); x1 = Math.max(x1, it.x + it.w); y1 = Math.max(y1, it.y + it.h); });
  return { x: x0 * U - 30, y: y0 * U - 50, w: (x1 - x0) * U + 60, h: (y1 - y0) * U + 80 };
}
function rectOf(id) {
  if (!id) return contentRect();
  const it = byId[id], tabRoom = (it.kind === 'haupt' || it.kind === 'klein') ? 26 : 0;
  return { x: it.x * U, y: it.y * U - tabRoom, w: it.w * U, h: it.h * U + tabRoom };
}
function frame() {
  const vw = stage.clientWidth, vh = stage.clientHeight, narrow = vw < 700;
  const r = parseFloat(cssVar('--rule'));
  return { left: r + (narrow ? 8 : 22), right: narrow ? 8 : 22, top: r + Math.max(54, logoH + 6) + 10, bottom: narrow ? 36 : 48, vw, vh };
}
function fit(rect) {
  const f = frame(), aw = f.vw - f.left - f.right, ah = f.vh - f.top - f.bottom;
  let s = Math.min(aw / rect.w, ah / rect.h);
  if (focus) s *= (f.vw < 700 ? 0.97 : 0.9);
  return { s, tx: f.left + (aw - rect.w * s) / 2 - rect.x * s, ty: f.top + (ah - rect.h * s) / 2 - rect.y * s };
}

/* Raster der Bühne folgt der Ansicht; es endet nie. */
function drawGrid(v) {
  let major = U * v.s; while (major < 14) major *= 4;
  const minor = major / 4, showMinor = minor >= 7;
  const m = `${major}px ${major}px`, n = showMinor ? `${minor}px ${minor}px` : m;
  stage.style.backgroundSize = `${m},${m},${n},${n}`;
  stage.style.backgroundPosition = `${v.tx}px ${v.ty}px`;
}

/* Lineale: Koordinate in Feldern, Teilung passt sich dem Zoom an, Zahlen nur bei ganzen Feldern */
const rT = document.getElementById('ruleTop'), rL = document.getElementById('ruleLeft'), corner = document.getElementById('ruleCorner');
function pickStep(s) { for (const st of [0.25, 0.5, 1, 2, 4, 8, 16, 32]) if (st * U * s >= 56) return st; return 64; }
function drawRuler(cv, v, horizontal) {
  const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const cMajor = cssVar('--muted'), cMinor = cssVar('--grid-major');
  ctx.font = '700 10px "Tw Cen MT", Jost, Arial, sans-serif';
  const step = pickStep(v.s), minor = step / 4, px = U * v.s;
  const len = horizontal ? w : h, off = horizontal ? v.tx : v.ty, thick = horizontal ? h : w;
  const skip = parseFloat(cssVar('--rule'));
  const a = Math.floor((-off / px) / minor), b = Math.ceil(((len - off) / px) / minor);
  for (let i = a; i <= b; i++) {
    const p = off + i * minor * px;
    if (p < skip + 2) continue;
    const major = i % 4 === 0, t = major ? 11 : 5;
    ctx.fillStyle = major ? cMajor : cMinor;
    if (horizontal) ctx.fillRect(Math.round(p), thick - t, 1, t);
    else ctx.fillRect(thick - t, Math.round(p), t, 1);
    const val = i * minor;
    if (major && Math.abs(val - Math.round(val)) < 1e-6) {
      const label = String(Math.round(val));
      if (horizontal) ctx.fillText(label, Math.round(p) + 3, thick - 13);
      else { ctx.save(); ctx.translate(thick - 13, Math.round(p) + 3); ctx.rotate(Math.PI / 2); ctx.fillText(label, 0, 0); ctx.restore(); }
    }
  }
}
function render(v) {
  view = v;
  world.style.transform = `translate(${v.tx}px,${v.ty}px) scale(${v.s})`;
  drawGrid(v);
  drawRuler(rT, v, true); drawRuler(rL, v, false);
  corner.textContent = '×' + (v.s / s0).toFixed(1);
  updateLOD(v.s);
}
/* Semantischer Zoom: Details nach tatsächlicher Bildschirmbreite des Elements */
function updateLOD(s) {
  const path = chain(focus);
  ITEMS.forEach(it => {
    const el = els[it.id], px = it.w * U * s, f = it.id === focus;
    el.classList.toggle('lod1', px >= 110 || f);
    el.classList.toggle('lod2', px >= 230 || f);
    el.classList.toggle('lod3', px >= 420 || f);
    el.classList.toggle('dim', !!focus && !(path.includes(it.id) || it.parent === focus));
    el.classList.toggle('focused', f);
    const btn = el.querySelector('.open'); if (btn) btn.tabIndex = (px >= 420 || f) ? 0 : -1;
  });
}

/* Zoom-Flug: Mitte linear, Maßstab logarithmisch, 760 ms */
function flyTo(t) {
  if (anim) cancelAnimationFrame(anim.raf);
  if (reduced) { render(t); return; }
  const f = frame(), cx = f.vw / 2, cy = f.vh / 2;
  const from = { ...view };
  const c0 = { x: (cx - from.tx) / from.s, y: (cy - from.ty) / from.s }, c1 = { x: (cx - t.tx) / t.s, y: (cy - t.ty) / t.s };
  const l0 = Math.log(from.s), l1 = Math.log(t.s), t0 = performance.now(), D = 760;
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  anim = { raf: 0 };
  const step = now => {
    const k = Math.min(1, (now - t0) / D), e = ease(k);
    const s = Math.exp(l0 + (l1 - l0) * e), x = c0.x + (c1.x - c0.x) * e, y = c0.y + (c1.y - c0.y) * e;
    render(k < 1 ? { s, tx: cx - x * s, ty: cy - y * s } : t);
    if (k < 1) anim.raf = requestAnimationFrame(step); else anim = null;
  };
  anim.raf = requestAnimationFrame(step);
}
function zoomTo(id, animate = true) {
  focus = id || null; free = false;
  const t = fit(rectOf(focus));
  updateUI();
  if (animate) flyTo(t); else render(t);
}
function zoomOut() {
  if (free) { zoomTo(focus); return; }
  if (!focus) return;
  zoomTo(byId[focus].parent || null);
}
function nextTarget(id) {
  const P = chain(focus);
  for (const c of chain(id)) if (!P.includes(c)) return c;
  return null;
}
function openRoom(id) { const it = byId[id]; if (openable(it)) showRoom(it, els[id]); }
function activate(id) {
  if (id === focus && !free) { openRoom(id); return; }
  if (focus && chain(focus).includes(id)) { zoomTo(id); return; }
  const t = nextTarget(id); if (t) zoomTo(t);
}

/* ---------- Leiste: Pfad als Pillen ---------- */
const crumbs = document.getElementById('crumbs');
function updateUI() {
  const path = chain(focus);
  crumbs.innerHTML = '';
  const mk = (label, id, on) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pill' + (on ? ' on' : ''); b.textContent = label;
    b.onclick = () => zoomTo(id); if (on) b.setAttribute('aria-current', 'location'); crumbs.appendChild(b);
  };
  mk('Overview', null, path.length === 0);
  path.forEach((id, i) => mk(byId[id].title, id, i === path.length - 1));
}

/* ---------- Eingaben ---------- */
let drag = null, moved = false;
const editing = () => document.body.classList.contains('editing');
stage.addEventListener('pointerdown', e => {
  if (e.button !== 0) return;
  drag = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, id: e.pointerId }; moved = false;
});
stage.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!moved) {
    if (Math.hypot(dx, dy) < 6) return;
    moved = true; free = true;
    if (anim) { cancelAnimationFrame(anim.raf); anim = null; }
    try { stage.setPointerCapture(drag.id); } catch (_) {}
    stage.classList.add('dragging');
  }
  render({ s: view.s, tx: drag.tx + dx, ty: drag.ty + dy });
});
const endDrag = () => { drag = null; stage.classList.remove('dragging'); };
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);

stage.addEventListener('click', e => {
  if (moved) { moved = false; return; }
  const el = e.target.closest('.item');
  if (!el) { zoomOut(); return; }
  if (editing()) return;                         // im Sortiermodus öffnen Klicks nichts
  if (e.target.closest('.open')) { openRoom(el.dataset.id); return; }
  activate(el.dataset.id);
});
world.addEventListener('keydown', e => {
  const el = e.target.closest('.item');
  if (el && !editing() && (e.key === 'Enter' || e.key === ' ') && !e.target.closest('.open')) { e.preventDefault(); activate(el.dataset.id); }
});
let lock = 0;
stage.addEventListener('wheel', e => {
  e.preventDefault();
  const now = performance.now();
  if (now < lock || Math.abs(e.deltaY) < 3) return;
  lock = now + 780;
  if (e.deltaY < 0) {
    const el = e.target.closest && e.target.closest('.item');
    if (!el) return;
    const t = nextTarget(el.dataset.id) || (free ? el.dataset.id : null);
    if (t) zoomTo(t);
  } else zoomOut();
}, { passive: false });
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (roomOpen()) closeRoom();
  else if (!list.hidden) toggleList(false);
  else zoomOut();
});

/* Logo = ein Rasterfeld der Übersicht. Leiste hängt am Logo, Übersicht an der Leiste: wenige Durchläufe genügen. */
function sizeLogo() {
  const f0 = focus; focus = null;
  for (let k = 0; k < 3; k++) { s0 = fit(contentRect()).s; logoH = Math.round(U * s0); }
  focus = f0;
  document.getElementById('brand').style.setProperty('--logo-h', logoH + 'px');
}
addEventListener('resize', () => {
  sizeLogo();
  if (free) render(view); else render(fit(rectOf(focus)));
});
document.getElementById('brand').onclick = () => { closeRoom(); zoomTo(null); };

/* ---------- Index ---------- */
const list = document.getElementById('list'), listBody = document.getElementById('listBody'), listBtn = document.getElementById('listBtn');
function toggleList(show) { list.hidden = !show; listBtn.setAttribute('aria-expanded', String(show)); }
const groups = [['Main projects', 'haupt'], ['Projects', 'klein'], ['Work samples', 'probe'], ['About', 'about']];
listBody.innerHTML = groups.map(([h, k]) => {
  const rows = ITEMS.filter(i => i.kind === k);
  return rows.length ? `<h3>${h}</h3><ul>${rows.map(i =>
    `<li><button type="button" data-id="${i.id}"><i style="--c:${i.cv || 'var(--label)'}"></i><b>${esc(i.title)}</b><span>${i.cur ? '<span class="k" title="Curated" aria-label="Curated">● </span>' : ''}${i.code}</span></button></li>`).join('')}</ul>` : '';
}).join('');
listBody.addEventListener('click', e => {
  const b = e.target.closest('button[data-id]'); if (!b) return;
  toggleList(false);
  zoomTo(b.dataset.id, false);
  requestAnimationFrame(() => openRoom(b.dataset.id));
});
listBtn.onclick = () => toggleList(list.hidden);
document.getElementById('listClose').onclick = () => toggleList(false);

sizeLogo();
zoomTo(null, false);
// Sortiermodus nur lokal: wird beim Bauen komplett weggelassen
if (import.meta.env.DEV) import('./editor.js').then(m => m.init({ ITEMS, els, scale: () => view.s }));
document.fonts && document.fonts.ready.then(() => render(view));
