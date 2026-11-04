/* ---------------------------------------------------------------------------
   Sortiermodus – nur bei "npm run dev", nie auf der veröffentlichten Seite.

   Pille "Edit" in der Leiste schaltet ihn ein.
   - Ordner ziehen und auf einem anderen Ordner loslassen: nimmt dessen Platz ein.
     Landet er dabei in einer anderen Gruppe (z. B. Project → Main), ändert sich sein Typ.
   - Auf einem freien Platz loslassen: ans Ende dieser Gruppe.
   - Doppelklick: kuratiert an/aus.
   Gespeichert wird sofort in die project.json-Dateien; der Hub lädt danach neu.
   --------------------------------------------------------------------------- */
import { TYPE_OF_KIND } from './data.js';

const MOVABLE = ['haupt', 'klein', 'probe'];
const SLOT_TYPE = { slot: 'project', pslot: 'sample' };

export function init({ ITEMS, els, scale }) {
  const byId = Object.fromEntries(ITEMS.map(i => [i.id, i]));
  const body = document.body, hint = document.querySelector('.legend .hint');
  const normalHint = hint.textContent;

  // Pille in der Leiste
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'pill'; btn.textContent = 'Edit';
  btn.title = 'Sort mode (local only)';
  document.getElementById('listBtn').before(btn);

  const setEditing = on => {
    body.classList.toggle('editing', on);
    btn.classList.toggle('on', on);
    btn.textContent = on ? 'Done' : 'Edit';
    hint.textContent = on ? 'Drag a folder onto another to swap places · onto an open slot: move to the end · double-click: curated on/off' : normalHint;
  };
  btn.onclick = () => setEditing(!body.classList.contains('editing'));
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && body.classList.contains('editing')) { e.stopImmediatePropagation(); setEditing(false); }
  }, true);

  ITEMS.filter(i => MOVABLE.includes(i.kind)).forEach(i => els[i.id].classList.add('draggable'));

  // Aktuelle Reihenfolge je Typ, so wie der Hub sie zeigt
  const lists = () => {
    const L = { main: [], project: [], sample: [] };
    ITEMS.filter(i => MOVABLE.includes(i.kind)).forEach(i => L[TYPE_OF_KIND[i.kind]].push(i.id));
    return L;
  };

  async function save(updates) {
    hint.textContent = 'Saving…';
    try {
      const r = await fetch('/__portfolio/save', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ updates }) });
      const j = await r.json();
      if (!j.ok) throw new Error(j.error);
      sessionStorage.setItem('portfolio-editing', '1');      // nach dem Neuladen im Sortiermodus bleiben
      if (j.written === 0) setEditing(true);
    } catch (e) {
      hint.textContent = 'Could not save: ' + e.message;
    }
  }

  function move(id, targetId) {
    const L = lists(), from = TYPE_OF_KIND[byId[id].kind];
    const to = SLOT_TYPE[targetId] || TYPE_OF_KIND[byId[targetId].kind];
    const oldIndex = L[from].indexOf(id);
    L[from].splice(oldIndex, 1);
    let at = SLOT_TYPE[targetId] ? L[to].length : L[to].indexOf(targetId);
    if (from === to && !SLOT_TYPE[targetId] && oldIndex <= at) at++;   // nach hinten gezogen: hinter das Ziel
    L[to].splice(at, 0, id);
    const updates = [];
    for (const [type, ids] of Object.entries(L)) ids.forEach((x, i) => updates.push({ id: x, type, order: i + 1 }));
    save(updates);
  }

  // Ziehen
  let drag = null;
  const targetAt = (x, y) => {
    for (const n of document.elementsFromPoint(x, y)) {
      const el = n.closest?.('.item'); if (!el || el.dataset.id === drag.id) continue;
      const it = byId[el.dataset.id];
      if (MOVABLE.includes(it.kind) || SLOT_TYPE[it.id]) return el;
    }
    return null;
  };
  document.getElementById('stage').addEventListener('pointerdown', e => {
    if (!body.classList.contains('editing') || e.button !== 0) return;
    const el = e.target.closest('.item.draggable'); if (!el) return;
    e.stopPropagation();
    drag = { id: el.dataset.id, el, x: e.clientX, y: e.clientY, moved: false, over: null, pid: e.pointerId };
  }, true);
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;
    drag.moved = true;
    drag.el.classList.add('dragging');
    const s = scale();
    drag.el.style.translate = `${dx / s}px ${dy / s}px`;
    const over = targetAt(e.clientX, e.clientY);
    if (over !== drag.over) { drag.over?.classList.remove('drop'); over?.classList.add('drop'); drag.over = over; }
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    const { el, over, id, moved } = drag; drag = null;
    el.classList.remove('dragging'); el.style.translate = '';
    over?.classList.remove('drop');
    if (moved && over) move(id, over.dataset.id);
    if (moved) swallowClick = true;
  });
  // Nach dem Ziehen feuert der Browser noch einen Klick – der soll nicht herauszoomen
  let swallowClick = false;
  document.getElementById('stage').addEventListener('click', e => {
    if (swallowClick) { swallowClick = false; e.stopImmediatePropagation(); }
  }, true);

  // Doppelklick: kuratiert umschalten
  document.getElementById('world').addEventListener('dblclick', e => {
    if (!body.classList.contains('editing')) return;
    const el = e.target.closest('.item.draggable'); if (!el) return;
    save([{ id: el.dataset.id, curated: !byId[el.dataset.id].cur }]);
  });

  if (sessionStorage.getItem('portfolio-editing')) { sessionStorage.removeItem('portfolio-editing'); setEditing(true); }
}
