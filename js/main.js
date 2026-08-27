/* ═══════════════════════════════════════════════════════════════
   CONFIG — datele reale se completează o singură dată, aici
   ═══════════════════════════════════════════════════════════════ */
const CONFIG = {
  phone:     '0759 838 748',
  phoneDial: '+40759838748',
  whatsapp:  '40759838748',
  email:     'contact@sergiu-iveco.ro',
  address:   'Iași — adresa exactă la telefon'
};
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

$$('[data-phone]').forEach(e => e.textContent = CONFIG.phone);
$$('[data-email]').forEach(e => e.textContent = CONFIG.email);
$$('[data-address]').forEach(e => e.textContent = CONFIG.address);
$$('[data-tel]').forEach(e => { e.href = 'tel:' + CONFIG.phoneDial.replace(/\s/g, ''); });
$$('.nav-phone').forEach(e => e.textContent = CONFIG.phone);
$$('[data-mail]').forEach(e => e.href = 'mailto:' + CONFIG.email);
$('#fab').href = 'https://wa.me/' + CONFIG.whatsapp;

/* ═══ utilitare ═══ */
const NS      = 'http://www.w3.org/2000/svg';
const clamp   = (v, a, b) => v < a ? a : v > b ? b : v;
const ease    = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* reevaluat la resize/rotire ⇒ filtrul scump se dezactivează corect pe mobil */
const mqCoarse = matchMedia('(max-width: 980px)');
let COARSE = mqCoarse.matches;
mqCoarse.addEventListener('change', e => { COARSE = e.matches; });
const el      = (n, a) => { const x = document.createElementNS(NS, n); for (const k in a) x.setAttribute(k, a[k]); return x; };

/* ═══ câmp de stele: se întinde de la vârful paginii până la linia de sub hero ═══ */
(function () {
  const box = $('#topStars');
  const line = $('.strip');
  if (!box || !line) return;
  let raf2 = 0;
  function size() {
    raf2 = 0;
    box.style.height = Math.round(line.getBoundingClientRect().top + scrollY) + 'px';
  }
  const queue = () => { if (!raf2) raf2 = requestAnimationFrame(size); };
  size();                       // valoare corectă imediat, nu doar la primul rAF
  addEventListener('load', size);
  addEventListener('resize', queue);
  new ResizeObserver(queue).observe(document.querySelector('.hero-simple'));
})();

/* ═══ meniu mobil ═══ */
const tgl = $('#navToggle'), menu = $('#mobileMenu');
tgl.addEventListener('click', () => tgl.setAttribute('aria-expanded', String(menu.classList.toggle('open'))));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open'); tgl.setAttribute('aria-expanded', 'false');
}));

/* ═══ reveal la scroll ═══ */
const rvIO = new IntersectionObserver((es) => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); rvIO.unobserve(e.target); }
}), { threshold: .1, rootMargin: '0px 0px -6% 0px' });
$$('.rv').forEach((e, i) => { e.style.transitionDelay = (i % 3) * 60 + 'ms'; rvIO.observe(e); });

/* ═══ intro hero: intrare etajată, o singură dată la încărcare ═══ */
if (typeof anime === 'function' && !REDUCED) {
  const intro = $$('.hero-simple .eyebrow, .hero-simple h1, .hero-simple .lead, .hero-simple .hero-actions, .hero-simple .scroll-cue');
  anime.set(intro, { opacity: 0, translateY: 22 });
  anime({ targets: intro, opacity: 1, translateY: 0,
          duration: 900, delay: anime.stagger(110, { start: 120 }), easing: 'easeOutExpo' });
}

/* ═══ contoare: numără o singură dată, când banda intră în ecran ═══ */
(function () {
  /* anii de fabricaţie nu se numără de la zero — rămân aşa cum sunt scrişi */
  const cells = $$('.strip-cell .n:not([data-nocount])');
  if (!cells.length) return;
  if (typeof anime !== 'function' || REDUCED) return;
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    const m = /^(\d+)(.*)$/.exec(e.target.textContent.trim());
    if (!m) return;
    const to = +m[1], suffix = m[2], o = { v: 0 };
    anime({ targets: o, v: to, round: 1, duration: 1500, easing: 'easeOutExpo',
            update: () => { e.target.textContent = o.v + suffix; } });
  }), { threshold: .5 });
  cells.forEach(c => io.observe(c));
})();

/* ═══ carduri cu lumină care urmăreşte cursorul (efect uiverse-style) ═══ */
(function () {
  const cards = $$('.svc, .card');
  if (!cards.length || matchMedia('(hover: none)').matches) return;
  let queued = false, pending = [];
  const flush = () => {
    queued = false;
    for (const [c, x, y] of pending) { c.style.setProperty('--mx', x + 'px'); c.style.setProperty('--my', y + 'px'); }
    pending.length = 0;
  };
  cards.forEach(c => c.addEventListener('pointermove', ev => {
    const r = c.getBoundingClientRect();
    pending.push([c, ev.clientX - r.left, ev.clientY - r.top]);
    if (!queued) { queued = true; requestAnimationFrame(flush); }
  }, { passive: true }));
})();

/* ═══════════════════════════════════════════════════════════════
   CONSTRUCȚIE GEOMETRIE (o singură dată, la încărcare)
   ═══════════════════════════════════════════════════════════════ */

/* --- traseul celor DOUĂ lanțuri de distribuție ---------------------
   Ca la F1C: lanț primar (arbore cotit → pinion intermediar) și lanț
   secundar (pinion intermediar → axele cu came). Pinionul intermediar
   are două coroane pe același ax (62 și 42) ⇒ aceeași turație, dar
   viteze de lanț diferite: v2 = v1 × 42/62.                          */
const CH = {
  A: [{ x: 330, y: 480, r: 46 }, { x: 300, y: 330, r: 62 }],
  B: [{ x: 140, y: 120, r: 58 }, { x: 400, y: 128, r: 54 }, { x: 300, y: 330, r: 42 }]
};
const V2 = 42 / 62;

/* unghiul punctului de tangență dintre două roți, pe exteriorul lanțului */
function tangentAngle(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
  return Math.atan2(dy, dx) - Math.acos(clamp((a.r - b.r) / d, -1, 1));
}
/* traseul închis al unui lanț înfășurat pe exteriorul roților date */
function beltPath(cs) {
  const N = cs.length, seg = [];
  for (let i = 0; i < N; i++) {
    const a = cs[i], b = cs[(i + 1) % N], t = tangentAngle(a, b);
    seg.push({ t,
      out: [a.x + a.r * Math.cos(t), a.y + a.r * Math.sin(t)],
      in:  [b.x + b.r * Math.cos(t), b.y + b.r * Math.sin(t)] });
  }
  const f = pt => pt.map(v => v.toFixed(1)).join(' ');
  let d = 'M' + f(seg[0].out);
  for (let i = 0; i < N; i++) {
    const cur = seg[i], nxt = seg[(i + 1) % N], c = cs[(i + 1) % N];
    let sw = nxt.t - cur.t; while (sw < 0) sw += Math.PI * 2;
    d += ' L' + f(cur.in) + ` A${c.r} ${c.r} 0 ${sw > Math.PI ? 1 : 0} 1 ` + f(nxt.out);
  }
  return d + ' Z';
}
for (const k in CH) $('#chain' + k).setAttribute('d', beltPath(CH[k]));

/* patine de ghidaj: urmăresc exact ramura lanțului, ușor bombate */
(function () {
  const rails = $('#rails');
  const shoe = (cs, i, off, w, ex) => {
    const N = cs.length, a = cs[i], b = cs[(i + 1) % N], t = tangentAngle(a, b);
    const nx = Math.cos(t), ny = Math.sin(t);
    const p1 = [a.x + (a.r + off) * nx, a.y + (a.r + off) * ny];
    const p2 = [b.x + (b.r + off) * nx, b.y + (b.r + off) * ny];
    const vx = p2[0] - p1[0], vy = p2[1] - p1[1], k = 0.14;
    const q1 = [p1[0] + vx * k, p1[1] + vy * k], q2 = [p2[0] - vx * k, p2[1] - vy * k];
    const c  = [(q1[0] + q2[0]) / 2 + nx * 9, (q1[1] + q2[1]) / 2 + ny * 9];
    const d  = `M${q1[0].toFixed(1)} ${q1[1].toFixed(1)} Q${c[0].toFixed(1)} ${c[1].toFixed(1)} ${q2[0].toFixed(1)} ${q2[1].toFixed(1)}`;
    const g  = el('g', { class: 'part', 'data-ex': ex });
    g.appendChild(el('path', { d, fill: 'none', stroke: '#47433C', 'stroke-width': w, 'stroke-linecap': 'round' }));
    g.appendChild(el('path', { d, fill: 'none', stroke: '#BE8A52', 'stroke-width': w * .34,
                               'stroke-linecap': 'round', opacity: '.42' }));
    rails.appendChild(g);
  };
  shoe(CH.B, 2, 9, 13, '-84,-16');   // patină fixă pe ramura lungă din stânga
  shoe(CH.A, 1, 9, 12, '-56,44');    // întinzător pe ramura liberă a lanțului primar
})();

/* --- pinioane de distribuție --- */
const sprockets = $$('#mechScene .spin').map(g => {
  const [cx, cy] = g.dataset.c.split(',').map(Number);
  const r = +g.dataset.r, t = +g.dataset.t, v = +(g.dataset.v || 1);
  if (t) {
    for (let i = 0; i < t; i++) {
      g.appendChild(el('rect', { x: -3.2, y: -(r + 6.5), width: 6.4, height: 9.5, rx: 1.5, fill: '#8A7355',
        transform: `translate(${cx} ${cy}) rotate(${(i / t) * 360})` }));
    }
    g.appendChild(el('circle', { cx, cy, r, fill: '#232320', stroke: '#8A7355', 'stroke-width': 2.4 }));
    g.appendChild(el('circle', { cx, cy, r: r * .34, fill: 'none', stroke: '#47433C', 'stroke-width': 2.4 }));
    for (let i = 0; i < 5; i++) {
      g.appendChild(el('circle', { cx, cy: cy - r * .62, r: r * .1, fill: '#18191D',
        transform: `rotate(${i * 72} ${cx} ${cy})` }));
    }
  }
  return { g, cx, cy, r, v };
});

/* --- coroană + pinion de atac --- */
(function () {
  const tG = $('#crownTeeth'), bG = $('#crownBolts'), cx = 256, cy = 214, R = 96;
  for (let i = 0; i < 34; i++) {
    tG.appendChild(el('path', { d: `M-5 ${-(R + 1)} L5 ${-(R + 1)} L3.4 ${-(R + 13)} L-3.4 ${-(R + 13)} Z`,
      fill: i % 2 ? '#8A7355' : '#BE8A52', transform: `translate(${cx} ${cy}) rotate(${(i / 34) * 360})` }));
  }
  /* bolţuri de prindere: gaură lamată + umbră în interior + capul şurubului,
     ca să se citească înfipte în coroană, nu lipite peste ea */
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bx = cx + Math.cos(a) * 52, by = cy + Math.sin(a) * 52;
    bG.appendChild(el('circle', { cx: bx, cy: by, r: 8.4, fill: '#141312' }));
    bG.appendChild(el('path', {
      d: `M${(bx - 8.4).toFixed(1)} ${by.toFixed(1)} A8.4 8.4 0 0 1 ${(bx + 8.4).toFixed(1)} ${by.toFixed(1)}`,
      fill: 'none', stroke: '#000', 'stroke-width': 2.6, opacity: '.6' }));
    bG.appendChild(el('circle', { cx: bx, cy: by, r: 5.1, fill: '#2B2823',
      stroke: '#8A7355', 'stroke-width': 1.2 }));
    bG.appendChild(el('circle', { cx: bx, cy: by, r: 2.1, fill: 'none',
      stroke: '#5B564E', 'stroke-width': 1 }));
  }
  const pr = $('#pinionRoll');
  for (let i = -2; i < 8; i++) {
    const y = 176 + i * 14.4;
    pr.appendChild(el('path', { d: `M137 ${(y + 5).toFixed(1)} L171 ${y.toFixed(1)}`,
      stroke: '#BE8A52', 'stroke-width': 2.6, 'stroke-linecap': 'round' }));
  }
})();

/* ═══════════════════════════════════════════════════════════════
   MOTOR DE ANIMAŢIE — anime.js
   Fiecare scenă are un timeline PAUZAT; scroll-ul îl parcurge cu
   .seek(progres × durată). Rezultatul rămâne o funcţie pură de
   poziţia scroll-ului ⇒ perfect reversibil la derulare în sus.
   Rotaţiile continue (lanţ, coroană) rămân calculate direct, ca să
   păstreze coerenţa mecanică ω = v / r.
   ═══════════════════════════════════════════════════════════════ */
const HAS_ANIME = typeof anime === 'function';
const TL_DUR = 1000;                       // unităţi de timeline (arbitrare)

/* construieşte timeline-ul de asamblare pentru o scenă SVG */
function buildAssembly(rootSel) {
  const nodes = $$(rootSel + ' .part');
  const items = nodes.map(n => {
    const [dx, dy] = n.dataset.ex.split(',').map(Number);
    return { n, dx, dy };
  });
  if (!HAS_ANIME) return { seek: p => items.forEach(({ n, dx, dy }) => {
    const e = ease(p);
    n.setAttribute('transform', `translate(${(dx * (1 - e)).toFixed(1)} ${(dy * (1 - e)).toFixed(1)})`);
    n.setAttribute('opacity', (0.3 + 0.7 * e).toFixed(3));
  }) };

  const tl = anime.timeline({ autoplay: false, easing: 'easeOutQuart' });
  items.forEach(({ n, dx, dy }, i) => {
    anime.set(n, { translateX: dx, translateY: dy, opacity: 0.26 });
    /* decalaj mic per piesă ⇒ se aşază una după alta, nu toate deodată */
    tl.add({ targets: n, translateX: 0, translateY: 0, opacity: 1,
             duration: TL_DUR * 0.7, easing: 'easeOutQuart' }, i * (TL_DUR * 0.035));
  });
  return { seek: p => tl.seek(p * tl.duration) };
}

/* ── SCENA · LANŢ DE DISTRIBUŢIE ── */
const mech = { scene: $('#mechScene'), state: $('#mechState'), steps: $$('#steps .step') };

/* cele două lanțuri, cu lungimea reală citită din traseul desenat */
const chains = ['A', 'B'].map((k, i) => {
  const g = $(`.chain[data-chain="${k}"]`);
  const c = { i, k,
    body:  g.querySelector('.cBody'),
    plate: g.querySelector('.cPlate'),
    link:  g.querySelector('.cLink'),
    len:   $('#chain' + k).getTotalLength(),
    v:     i === 0 ? 1 : V2 };
  c.body.setAttribute('stroke-dasharray', c.len);
  c.plate.setAttribute('stroke-dasharray', c.len);
  return c;
});

const mechAssembly = buildAssembly('#mechScene');

/* lanțurile se „trag” pe pinioane unul după altul: întâi primarul, apoi secundarul */
const chainDraw = HAS_ANIME ? (() => {
  const tl = anime.timeline({ autoplay: false });
  chains.forEach((c, i) => {
    tl.add({ targets: [c.body, c.plate], strokeDashoffset: [c.len, 0],
             duration: TL_DUR * 0.44, easing: 'easeInOutQuart' }, TL_DUR * (0.26 + i * 0.16));
    tl.add({ targets: c.link, opacity: [0, 1],
             duration: TL_DUR * 0.22, easing: 'linear' }, TL_DUR * (0.46 + i * 0.16));
  });
  return p => tl.seek(p * tl.duration);
})() : p => {
  chains.forEach((c, i) => {
    const e = ease(clamp((p - i * 0.14) / 0.86, 0, 1));
    c.body.setAttribute('stroke-dashoffset', (c.len * (1 - e)).toFixed(1));
    c.plate.setAttribute('stroke-dashoffset', (c.len * (1 - e)).toFixed(1));
    c.link.setAttribute('opacity', clamp((p - 0.46 - i * 0.14) / 0.3, 0, 1).toFixed(3));
  });
};

let idle = 0, lastStep = -1, lastMechState = '';
function renderMech(a, s) {
  mechAssembly.seek(a);
  chainDraw(a);
  /* fiecare lanț curge cu viteza lui; zalele se rostogolesc pe traseu */
  for (const c of chains) c.link.setAttribute('stroke-dashoffset', (-s * c.v).toFixed(1));

  /* ω = v / r ⇒ pinioanele de pe același lanț au viteze tangențiale egale,
     iar cele două coroane ale pinionului intermediar au aceeași turație */
  for (const sp of sprockets) {
    sp.g.setAttribute('transform', `rotate(${((s * sp.v / sp.r) * 57.2958).toFixed(2)} ${sp.cx} ${sp.cy})`);
  }

  const step = a > 0.9 ? 2 : a > 0.12 ? 1 : 0;
  if (step !== lastStep) { setStep(mech.steps, step); lastStep = step; }
  const st = a > 0.98 ? 'ÎN FUNCȚIUNE' : a > 0.05 ? 'SE ASAMBLEAZĂ ' + Math.round(a * 100) + '%' : 'DEMONTAT';
  if (st !== lastMechState) { mech.state.textContent = st; lastMechState = st; }
  mech.state.classList.toggle('done', a > 0.98);
}

/* ── SCENA · GRUP SPATE (aceeaşi mecanică de scroll) ── */
const diffScene = $('#diffScene'), diffSvg = $('#diffSvg'), diffState = $('#diffState');
const crownRot = $('#crownRot'), pinionRoll = $('#pinionRoll');
const diffSteps = $$('#diffSteps .step');
const diffAssembly = buildAssembly('#diffSvg');
let lastDiffState = '', lastDiffStep = -1;

function renderDiff(a, s) {
  diffAssembly.seek(a);
  const done = a > 0.96;
  /* aplicate mereu (nu doar când e asamblat), altfel rămâne o rotaţie blocată
     din ultima stare la derulare înapoi. Coroana r=96; pinionul conic e văzut
     din lateral ⇒ dinţii se rostogolesc cu pasul 14.4. */
  crownRot.setAttribute('transform', `rotate(${(-(s / 96) * 57.2958).toFixed(2)} 256 214)`);
  pinionRoll.setAttribute('transform', `translate(0 ${(s % 14.4).toFixed(2)})`);
  const step = a > 0.9 ? 2 : a > 0.12 ? 1 : 0;
  if (step !== lastDiffStep) { setStep(diffSteps, step); lastDiffStep = step; }
  const st = done ? 'ASAMBLAT · ÎN PROBĂ' : a > 0.05 ? 'SE ASAMBLEAZĂ ' + Math.round(a * 100) + '%' : 'DEMONTAT';
  if (st !== lastDiffState) { diffState.textContent = st; lastDiffState = st; }
  diffState.classList.toggle('done', done);
}

/* evidenţierea pasului activ, cu un mic puls pe numărul lui */
function setStep(list, active) {
  list.forEach((n, i) => n.classList.toggle('on', i === active));
  const k = list[active] && list[active].querySelector('.k');
  if (k && HAS_ANIME && !REDUCED) {
    anime.remove(k);
    anime({ targets: k, opacity: [0.35, 1], translateX: [-5, 0], duration: 420, easing: 'easeOutQuad' });
  }
}

/* ═══════════════════════════════════════════════════════════════
   BUCLA — porneşte doar când o scenă e vizibilă, se opreşte altfel.
   Măsurare separată de scriere ⇒ fără layout thrashing.
   ═══════════════════════════════════════════════════════════════ */
const mechSticky = mech.scene.querySelector('.scene-sticky');
const diffSticky = diffScene.querySelector('.scene-sticky');

let raf = 0;

/* Progres 0→1 pe un container sticky.
   Intervalul real de „lipire” este H − h (înălţime container − înălţime panou sticky),
   NU H − viewport: pe ecrane joase panoul e mai înalt decât fereastra şi
   animaţia s-ar desincroniza de scroll. */
function sceneProgress(rect, stickyH) {
  const range = rect.height - stickyH;
  return range <= 0 ? 1 : clamp(-rect.top / range, 0, 1);
}
/* vizibilitatea o deducem din rect, nu dintr-un IntersectionObserver:
   e auto-corectivă şi nu depinde de momentul în care observatorul livrează */
const near = r => r.bottom > -240 && r.top < innerHeight + 240;

function tick() {
  /* ---- MĂSURARE (toate citirile de layout întâi, fără scrieri intercalate) ---- */
  const rMech = mech.scene.getBoundingClientRect();
  const rDiff = diffScene.getBoundingClientRect();
  const okMech = near(rMech), okDiff = near(rDiff);
  const hMech = okMech ? mechSticky.offsetHeight : 0;
  const hDiff = okDiff ? diffSticky.offsetHeight : 0;

  /* ---- SCRIERE ---- */
  if (okMech) {
    const a = sceneProgress(rMech, hMech);
    if (a > 0.98) idle += 26 / 60;      // rotaţie subtilă continuă, doar asamblat şi vizibil
    renderMech(a, a * 150 + idle);
  }
  if (okDiff) {
    const a = sceneProgress(rDiff, hDiff);
    if (a > 0.96) idle += 18 / 60;
    renderDiff(a, a * 90 + idle * 0.6);
  }

  /* nicio scenă în apropiere ⇒ oprim bucla; scroll-ul o reporneşte */
  raf = (okMech || okDiff) ? requestAnimationFrame(tick) : 0;
}
function start() { if (!raf && !REDUCED) raf = requestAnimationFrame(tick); }

addEventListener('scroll', start, { passive: true });
addEventListener('resize', start, { passive: true });

if (REDUCED) { renderMech(1, 0); renderDiff(1, 0); }
else start();

/* ═══════════════════════════════════════════════════════════════
   FORMULAR → WhatsApp
   ═══════════════════════════════════════════════════════════════ */
$('#bookForm').addEventListener('submit', function (ev) {
  ev.preventDefault();
  const f = new FormData(this), g = k => (f.get(k) || '').toString().trim();
  const missing = [...this.elements].find(x => x.required && !x.value);
  if (missing) { missing.focus(); if (missing.reportValidity) missing.reportValidity(); return; }

  const msg = [
    'Bună ziua! Aș vrea o programare pentru reparație.', '',
    'Nume: '              + g('nume'),
    'Telefon: '           + g('telefon'),
    'Nr. înmatriculare: ' + g('numar').toUpperCase(),
    'Km la bord: '        + g('km'), '',
    'Problema: '          + g('problema')
  ].join('\n');

  window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  $('#formOk').style.display = 'block';
});

/* ═══════════════════════════════════════════════════════════════
   GALERIE — swipe pe orizontală, pozele intră din dreapta
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const box = $('#gal'), items = $$('#gal .gal-item');
  if (!box || !items.length) return;
  const prev = $('#galPrev'), next = $('#galNext'), bar = $('#galBar');

  /* fiecare poză intră din dreapta când ajunge în ecran (vertical sau la swipe) */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.style.transitionDelay = (items.indexOf(e.target) % 3) * 90 + 'ms';
    e.target.classList.add('in');
  }), { threshold: .18 });
  items.forEach(i => io.observe(i));

  const step = () => items[0].getBoundingClientRect().width + 16;
  const max  = () => box.scrollWidth - box.clientWidth;

  function sync() {
    const m = max();
    bar.style.width = (m > 0 ? clamp(box.scrollLeft / m, 0, 1) * 100 : 100) + '%';
    prev.disabled = box.scrollLeft < 4;
    next.disabled = box.scrollLeft > m - 4;
  }
  prev.addEventListener('click', () => box.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => box.scrollBy({ left:  step(), behavior: 'smooth' }));
  box.addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync, { passive: true });
  sync();

  /* tragere cu mouse-ul pe desktop (pe telefon merge swipe-ul nativ) */
  let down = false, x0 = 0, l0 = 0, moved = 0;
  box.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch') return;
    down = true; moved = 0; x0 = e.clientX; l0 = box.scrollLeft;
    box.classList.add('drag'); box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', e => {
    if (!down) return;
    const d = e.clientX - x0;
    moved = Math.max(moved, Math.abs(d));
    box.scrollLeft = l0 - d;
  });
  const up = e => {
    if (!down) return;
    down = false; box.classList.remove('drag');
    /* dupa o tragere reala, anulam click-ul care ar urma */
    if (moved > 6) box.addEventListener('click', ev => ev.preventDefault(), { once: true, capture: true });
  };
  box.addEventListener('pointerup', up);
  box.addEventListener('pointercancel', up);
})();

/* ═══════════════════════════════════════════════════════════════
   RECENZII SCRISE DE CLIENȚI
   Pagina e statică ⇒ recenzia se salvează în browserul clientului
   (ca s-o vadă imediat pe pagină) și pleacă pe WhatsApp la Sergiu.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  const form = $('#revForm'), grid = $('#revGrid'), rate = $('#rate'), num = $('#rateNum');
  if (!form || !grid) return;
  const KEY = 'sergiu-recenzii';
  let score = 5;

  const btns = [...rate.querySelectorAll('button')];
  const paint = () => {
    btns.forEach(b => b.classList.toggle('on', +b.dataset.v <= score));
    num.textContent = score + '/5';
  };
  btns.forEach(b => b.addEventListener('click', () => { score = +b.dataset.v; paint(); }));
  paint();

  const esc   = t => String(t).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const stars = k => '★'.repeat(k) + '☆'.repeat(5 - k);

  function card(r) {
    const d = document.createElement('div');
    d.className = 'card rev in';
    d.innerHTML =
      '<div class="stars">' + stars(r.n) + '</div>' +
      '<p class="q">„' + esc(r.t) + '”</p>' +
      '<div class="rev-who"><div class="av">' + esc((r.name.trim()[0] || 'C').toUpperCase()) + '</div>' +
      '<div><strong>' + esc(r.name) + '</strong><span>' + esc(r.d) + '</span></div></div>';
    return d;
  }
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };

  load().forEach(r => grid.prepend(card(r)));

  form.addEventListener('submit', ev => {
    ev.preventDefault();
    const name = $('#rvn').value.trim(), txt = $('#rvt').value.trim();
    if (!name) { $('#rvn').focus(); return; }
    if (!txt)  { $('#rvt').focus(); return; }

    const r = { name, t: txt, n: score,
                d: new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) };
    const all = load(); all.push(r);
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
    grid.prepend(card(r));

    const msg = ['Recenzie nouă de pe site:', '', 'Nume: ' + name, 'Notă: ' + score + '/5', '', '„' + txt + '”'].join('\n');
    window.open('https://wa.me/' + CONFIG.whatsapp + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');

    form.reset(); score = 5; paint();
    $('#revOk').style.display = 'block';
  });
})();
