/* ---------------------------------------------------------------------------
   Projektkartei. Zwei Arten:
   - Layout:     der Hub setzt die Seite selbst aus den Unterordnern und Bildern
                 des Projekts (src/layout.js), auf dem gewählten Hintergrund.
   - Einbetten:  eigene HTML-Seite, PDF oder Adresse des Projekts in einem
                 eigenen Raum (iframe).
   Links liegt der orange Seitenstreifen. Mit "strip": false ist er versteckt
   und erscheint, sobald man an den linken Rand kommt.
   --------------------------------------------------------------------------- */
import { esc, reduced } from './util.js';
import { layoutHTML } from './layout.js';

const room = document.getElementById('room');
const roomBody = document.getElementById('roomBody');
const roomBack = document.getElementById('roomBack');
const roomCode = document.getElementById('roomCode');
const roomNav = document.getElementById('roomNav');
const roomEdge = room.querySelector('.room-edge');
const roomHot = document.getElementById('roomHot');
const pdfLink = document.getElementById('roomPdf');

let current = null;   // { it, el, view, secs, win }

/* ---------- Kapitel-Navigation ---------- */
function setOn(k) {
  roomNav.querySelectorAll('button').forEach((b, j) => {
    b.classList.toggle('on', j === k);
    if (j === k) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
  });
}
function buildNav(names) {
  roomNav.innerHTML = names.map((c, i) => `<button type="button" data-ch="${i}">${i + 1} · ${esc(c)}</button>`).join('');
  setOn(-1);
}
/* Aktives Kapitel = letztes, dessen Oberkante die obere Bildschirmhälfte erreicht hat */
function tracker(secs, height, atEnd) {
  return () => {
    let k = -1; secs.forEach((s, i) => { if (s.getBoundingClientRect().top < height() * .45) k = i; });
    if (secs.length && atEnd()) k = secs.length - 1;     // ganz unten: letztes Kapitel, auch wenn es kurz ist
    setOn(k);
  };
}
const bottom = el => el.scrollTop > 0 && el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

roomNav.addEventListener('click', e => {
  const b = e.target.closest('button[data-ch]'), c = current;
  if (!b || !c) return;
  const i = +b.dataset.ch;
  if (c.it.page.mode === 'pdf') {                 // PDF: zur Seite springen, wenn in project.json angegeben
    const p = c.it.chapters[i]?.page; if (!p) return;
    c.view.src = `${c.it.page.src}#page=${p}`; setOn(i); return;
  }
  const sec = c.secs[i]; if (!sec) return;
  const box = c.win ? null : c.view;              // Layout scrollt im eigenen Container, HTML im Fenster der Seite
  const top = box ? sec.offsetTop - 24 : sec.getBoundingClientRect().top + c.win.scrollY - 24;
  (box || c.win).scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
});

/* ---------- Inhalt aufbauen ---------- */
function mountLayout(c) {
  const view = document.createElement('div');
  view.className = 'layout';
  view.innerHTML = layoutHTML(c.it);
  roomBody.appendChild(view);
  c.view = view;
  c.secs = [...view.querySelectorAll('[data-chapter]')];
  buildNav(c.secs.map(s => s.dataset.chapter));
  const track = tracker(c.secs, () => view.clientHeight, () => bottom(view));
  view.addEventListener('scroll', track, { passive: true });
  view.addEventListener('click', e => { const img = e.target.closest('.lo-img'); if (img) lightbox(img.dataset.full || img.src); });
  track();
}

function mountFrame(c) {
  const frame = document.createElement('iframe');
  frame.title = c.it.title;
  frame.src = c.it.page.src;
  c.view = frame;
  buildNav(c.it.chapters.map(ch => ch.name));
  frame.addEventListener('load', () => {
    if (current !== c) return;
    frame.classList.add('ready');
    if (c.it.page.mode !== 'html') return;        // PDF und fremde Adressen: kein Zugriff auf den Inhalt
    let doc; try { doc = frame.contentDocument; } catch (_) { return; }
    if (!doc) return;
    c.win = frame.contentWindow;
    c.secs = [...doc.querySelectorAll('[data-chapter]')];
    if (c.secs.length) buildNav(c.secs.map(s => s.dataset.chapter));
    const track = tracker(c.secs, () => c.win.innerHeight, () => bottom(doc.scrollingElement));
    c.win.addEventListener('scroll', track, { passive: true });
    doc.addEventListener('keydown', e => { if (e.key === 'Escape') closeRoom(); });
    // Mausbewegung im iframe erreicht den Hub nicht – darum den Rand auch von innen melden
    doc.addEventListener('pointermove', e => { if (!c.it.strip) peek(e.clientX < 14 || (room.classList.contains('peek') && e.clientX < 80)); });
    track();
  });
  roomBody.appendChild(frame);
}

/* ---------- Seitenstreifen ausblendbar ---------- */
function peek(on) { room.classList.toggle('peek', on); }
roomHot.addEventListener('pointerenter', () => peek(true));
roomHot.addEventListener('click', () => peek(!room.classList.contains('peek')));   // Touch: Antippen
roomEdge.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') peek(false); });

/* ---------- Bild groß ansehen ---------- */
const lb = document.getElementById('lightbox');
function lightbox(src) {
  lb.querySelector('img').src = src;
  lb.hidden = false;
  lb.focus();
}
lb.addEventListener('click', () => { lb.hidden = true; });

/* ---------- Öffnen / Schließen ---------- */
function clipFor(el) {
  const target = el.querySelector('.body') || el;
  const r = target.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
  return `inset(${Math.max(0, r.top)}px ${Math.max(0, vw - r.right)}px ${Math.max(0, vh - r.bottom)}px ${Math.max(0, r.left)}px round 12px)`;
}

export function openRoom(it, el) {
  if (current) teardown();
  const c = current = { it, el, view: null, secs: [], win: null };
  room.classList.toggle('nostrip', !it.strip);
  peek(false);
  roomBody.style.setProperty('--r-bg', it.kind === 'about' ? 'var(--ground)' : it.page.mode === 'layout' ? it.layout.background : it.cv);
  roomCode.textContent = it.code;
  // PDF: zusätzlich direkt öffnen (Handys zeigen eingebettete PDFs oft nur als erste Seite)
  pdfLink.hidden = it.page.mode !== 'pdf';
  if (it.page.mode === 'pdf') pdfLink.href = it.page.src;
  if (it.page.mode === 'layout') mountLayout(c); else mountFrame(c);

  room.classList.remove('anim');
  room.style.clipPath = clipFor(el);
  room.hidden = false;
  void room.offsetWidth;
  room.classList.add('anim');
  room.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
  // Ohne Streifen: Fokus auf den Inhalt, sonst würde der Fokus den Streifen sofort einblenden
  (it.strip ? roomBack : roomBody).focus({ preventScroll: true });
}

function teardown() {
  if (!current) return;
  current.view?.remove();
  current = null;
}

export function closeRoom() {
  if (!lb.hidden) { lb.hidden = true; return; }
  if (room.hidden || !current) return;
  const { el } = current;
  const done = () => { room.hidden = true; room.classList.remove('anim'); teardown(); el.focus({ preventScroll: true }); };
  if (reduced) { done(); return; }
  room.style.clipPath = clipFor(el);
  setTimeout(done, 620);
}

export const roomOpen = () => !room.hidden;
roomBack.addEventListener('click', closeRoom);
