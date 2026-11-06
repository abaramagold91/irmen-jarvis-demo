/* Núcleo do protótipo: ícones, formatação, rota, recorte, painéis e transições. Sem framework e sem rede. */
(function () {
  "use strict";
  const D = window.IRD;
  const P = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 3.5 6"/>',
    package: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
    shieldx: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9.5 9.5 5 5m0-5-5 5"/>',
    shieldcheck: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    workflow: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M7 10v4a3 3 0 0 0 3 3h4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 17v-6M13 17V7M18 17v-4"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 4v4M9 14h.01M15 14h.01"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    logout: '<path d="M15 4h4v16h-4M10 17l5-5-5-5M15 12H3"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 4v4h4M4 13a8 8 0 0 0 14.9 3M20 20v-4h-4"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
    printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="1"/><path d="M7 14h10v7H7z"/>',
    pdf: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8.5 16v-4h1.2a1.2 1.2 0 0 1 0 2.4H8.5M13 12v4h1a2 2 0 0 0 0-4z"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    plug: '<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0zM12 17v5"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="1"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    inbox: '<path d="M3 13h5l1 3h6l1-3h5"/><path d="M5 5h14l2 8v6H3v-6z"/>',
    doc: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 12l2 2 4-4"/>',
    bank: '<path d="M3 10h18L12 4zM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    coins: '<circle cx="9" cy="9" r="6"/><path d="M15.5 9.5a6 6 0 1 1-6 6"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    signal: '<path d="M4 18v-2M9 18v-6M14 18V8M19 18V4"/>'
  };
  const icon = (n, cls = "i") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ""}</svg>`;
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- formatação ----------
  const nf0 = new Intl.NumberFormat("pt-BR");
  const nf1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const brlFull = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const F = {
    int: v => nf0.format(Math.round(v)),
    dec1: v => nf1.format(v),
    pct: v => v == null ? "—" : nf0.format(Math.round(v * 100)) + "%",
    brl: v => v == null ? "—" : brlFull.format(Math.round(v)),
    brlc: v => {
      if (v == null) return "—"; const a = Math.abs(v);
      if (a >= 1e6) return "R$ " + nf1.format(v / 1e6).replace(/,0$/, "") + " mi";
      if (a >= 1e3) return "R$ " + nf0.format(Math.round(v / 1e3)) + " mil";
      return brlFull.format(v);
    },
    date: iso => iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—",
    dt: iso => iso ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—",
    time: d => d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    month: key => { const [y, m] = key.split("-"); return ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][+m - 1] + "/" + y.slice(2); }
  };
  const fmt = (kind, v) => (F[kind] || F.int)(v);
  const plural = (n, one, many) => F.int(n) + " " + (n === 1 ? one : many);
  const localDate = iso => new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 10);
  const monthKey = iso => localDate(iso).slice(0, 7);

  // ---------- lookups ----------
  const by = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));
  const L = { branch: by(D.BRANCHES), seller: by(D.SELLERS), modality: by(D.MODALITIES), bank: by(D.BANKS), stage: by(D.STAGES), loss: by(D.LOSS_REASONS), lc: by(D.LIFECYCLE), bs: by(D.BANK_STATES), req: by(D.REQUIREMENTS) };
  const LC_ICON = { received: "inbox", in_review: "eye", formalization: "file", billing: "coins", closed: "check", cancelled: "ban", credit_rejected: "shieldx" };
  const lcChip = (state) => { const s = L.lc[state]; return `<span class="jv-status" data-tone="${s.tone}" title="${esc(s.label)}">${icon(LC_ICON[state])}${esc(s.label)}</span>`; };
  const OPP_STATUS = { OPEN: ["Aberta", "opp_open", "target"], WON: ["Ganha", "opp_won", "check"], LOST: ["Perdida", "opp_lost", "x"], CANCELLED: ["Cancelada (adm.)", "opp_cancelled", "ban"] };
  const oppChip = (st) => { const [l, t, i] = OPP_STATUS[st]; return `<span class="jv-status" data-tone="${t}">${icon(i)}${l}</span>`; };
  const BS_ICON = { PENDING: "clock", RECEIVED: "inbox", IN_REVIEW: "eye", APPROVED: "check", CONDITIONAL: "check", REJECTED: "x", INELIGIBLE: "ban", DISBURSED: "coins" };
  const bsChip = (id) => { const s = L.bs[id]; return `<span class="jv-status" data-tone="${s.tone}">${icon(BS_ICON[id])}${esc(s.label)}</span>`; };
  const unitTag = (u, label) => `<span class="jv-x-unit" data-u="${u}">${esc(label)}</span>`;
  const SOURCE_LABEL = { canonical: "Fonte canônica", proposal: "Proposta", none: "Sem fonte", lifecycle: "Depende do Lifecycle" };
  const sourceTag = (s, id) => `<span class="jv-x-source" data-s="${s}" title="${esc(SOURCE_LABEL[s])}${id ? " · " + id : ""}">${icon(s === "canonical" ? "signal" : s === "none" ? "plug" : s === "lifecycle" ? "workflow" : "flask")}${SOURCE_LABEL[s]}${id ? " · " + id : ""}</span>`;

  // ---------- rota (hash) ----------
  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/dashboard";
    const [path, qs] = raw.split("?");
    const q = Object.fromEntries(new URLSearchParams(qs || ""));
    return { path: path.replace(/\/$/, "") || "/dashboard", q };
  }
  function buildHash(path, q) {
    const qs = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== "" && v != null)).toString();
    return "#" + path + (qs ? "?" + qs : "");
  }
  function go(path, q = {}, opts = {}) { const h = buildHash(path, q); if (opts.replace) history.replaceState(null, "", h), window.dispatchEvent(new HashChangeEvent("hashchange")); else location.hash = h; }

  // ---------- período ----------
  const PERIODS = [
    { id: "30d", label: "Últimos 30 dias", days: 30 }, { id: "90d", label: "Últimos 90 dias", days: 90 },
    { id: "180d", label: "Últimos 180 dias", days: 180 }, { id: "ytd", label: "Ano de 2026" }, { id: "all", label: "Todo o histórico" }
  ];
  function periodRange(id) {
    const now = D.NOW; const to = localDate(now.toISOString());
    if (id === "all" || !id) return { from: null, to, label: "Todo o histórico autorizado" };
    if (id === "ytd") return { from: "2026-01-01", to, label: "01/01/2026 a " + F.date(now.toISOString()) };
    const p = PERIODS.find(x => x.id === id); const from = localDate(new Date(now.getTime() - (p.days - 1) * 86400000).toISOString());
    return { from, to, label: from.split("-").reverse().join("/") + " a " + to.split("-").reverse().join("/") };
  }
  const inRange = (iso, r) => { if (!iso) return false; const d = localDate(iso); return (!r.from || d >= r.from) && d <= r.to; };
  const periodLabel = id => (PERIODS.find(p => p.id === id) || PERIODS[4]).label;

  // ---------- estado global do protótipo ----------
  const S = {
    theme: "dark", motion: "auto", scenario: "normal", profile: "coord",
    lastUpdate: new Date(D.NOW.getTime()), lastHash: null
  };
  try { const t = localStorage.getItem("irmen-dbr-theme"); if (t) S.theme = t; } catch (e) { /* armazenamento opcional */ }
  const reduced = () => S.motion === "reduced" || (S.motion === "auto" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const SELLER_LOCK = "s-01";

  // ---------- painéis ----------
  /*
   * panel(): cartão de pergunta (jv-x-chart-panel). Toda visualização declara pergunta, unidade, período, base de data,
   * filtros aplicados, fonte e última atualização. O corpo vem pronto (string HTML).
   */
  function panel(o) {
    const meta = [];
    meta.push(`<div><dt>Unidade</dt><dd class="hl">${o.unit}</dd></div>`);
    meta.push(`<div><dt>Período</dt><dd>${o.period || "Situação atual · sem recorte de data"}</dd></div>`);
    if (o.basis) meta.push(`<div><dt>Base de data</dt><dd>${o.basis}</dd></div>`);
    meta.push(`<div><dt>Filtros</dt><dd>${o.filters || "nenhum"}</dd></div>`);
    return `<section class="jv-panel cp${o.hud ? " hud" : ""}" data-panel="${o.id}" aria-labelledby="t-${o.id}" ${o.cls ? `style="${o.cls}"` : ""}>
      <div class="cp__scan" aria-hidden="true"></div>
      <div class="cp__head"><div class="cp__title"><h2 class="jv-h2" id="t-${o.id}">${o.title}</h2>${o.q ? `<p class="cp__q"><span class="sr-only">Pergunta: </span>${o.q}</p>` : ""}</div>
        <div class="cp__tools">${o.tools || ""}${sourceTag(o.source || "canonical", o.sourceId)}</div></div>
      <dl class="cp__meta">${meta.join("")}<div><dt>Atualizado</dt><dd><span class="cp__status"><span class="live" aria-hidden="true"></span>${o.updated || F.time(S.lastUpdate)}</span></dd></div></dl>
      <div class="cp__body">${o.body}</div>
      ${o.foot ? `<div class="cp__foot">${o.foot}</div>` : ""}
    </section>`;
  }
  const state = (k, title, text, action) => `<div class="state" data-k="${k}" role="${k === "error" ? "alert" : "status"}"><span class="state__ico">${icon(k === "error" ? "alert" : k === "nosource" ? "plug" : k === "denied" ? "shield" : k === "loading" ? "refresh" : "inbox")}</span><b>${title}</b><p>${text}</p>${action || ""}</div>`;
  const skeleton = (n = 4) => `<div class="stack-v" aria-hidden="true">${Array.from({ length: n }, (_, i) => `<span class="skel" style="width:${90 - i * 12}%"></span>`).join("")}</div>`;
  // Cenário do laboratório aplicado a painéis de fonte canônica.
  function scenarioBody(src, fn) {
    if (src !== "canonical" && src !== "lifecycle") return fn();
    if (S.scenario === "error") return state("error", "Não foi possível carregar este painel", "A fonte respondeu com erro. Nenhum total parcial é exibido.", `<button class="ds-button ds-button--sm" data-act="retry">${icon("refresh")}Tentar novamente</button>`);
    if (S.scenario === "nosource") return state("nosource", "Fonte indisponível no momento", "O read model deste painel está fora do ar. Os números voltam quando a fonte responder; nada é estimado.");
    if (S.scenario === "denied") return state("denied", "Sem acesso a este painel", "O seu perfil não tem a permissão exigida pela fonte. Peça acesso ao administrador.");
    return fn();
  }

  // KPI (pilar) com número animável. data-k identifica o número entre recortes para a transição.
  function kpi(o) {
    const tag = o.drill ? "button" : "div";
    const attrs = o.drill ? `type="button" data-drill="${o.drill}" ${o.dv ? `data-dv="${esc(o.dv)}"` : ""} aria-label="${esc(o.label)}: ${esc(o.text)}. Abrir os registros que compõem este número"` : "";
    return `<${tag} class="kpi${o.pending ? " kpi--pending" : ""}" style="--k:${o.color || "var(--jv-arc)"}" ${attrs} data-kpi="${o.k}">
      <span class="kpi__label"><span>${o.label}</span>${o.unit || ""}</span>
      <span class="kpi__value" data-k="${o.k}" data-v="${o.v == null ? "" : o.v}" data-f="${o.f || "int"}">${o.text}</span>
      ${o.sub ? `<span class="kpi__sub">${o.sub}</span>` : ""}
      ${o.ctx ? `<span class="kpi__ctx">${o.ctx}</span>` : ""}
      ${o.drill ? `<span class="kpi__open">${icon("arrow")}Ver registros</span>` : ""}
      <span class="kpi__was" aria-hidden="true"></span>
    </${tag}>`;
  }
  // Barras horizontais clicáveis (cada barra abre os registros do recorte).
  function bars(items, o = {}) {
    const max = Math.max(1, ...items.map(i => i.v));
    return `<div class="bars" role="list">${items.map(i => {
      const w = (i.v / max) * 100; const tag = o.drill ? "button" : "div";
      return `<${tag} class="bar" role="listitem" ${o.drill ? `type="button" data-drill="${o.drill}" data-dv="${esc(i.id)}" aria-label="${esc(i.label)}: ${esc(i.text)}${i.sub ? ", " + esc(i.sub) : ""}. Abrir registros"` : ""} data-tip="${esc(i.label)}|${esc(i.text)}${i.sub ? " · " + esc(i.sub) : ""}">
        <span class="bar__label">${esc(i.label)}</span>
        <span class="bar__track"><span class="bar__fill" data-k="${o.k}-${esc(i.id)}" data-w="${w.toFixed(2)}" style="width:${w.toFixed(2)}%;--b:${i.color || o.color || "var(--jv-arc)"}"></span></span>
        <span class="bar__val"><span data-k="${o.k}-${esc(i.id)}-v" data-v="${i.v}" data-f="${o.f || "int"}">${i.text}</span>${i.sub ? `<small>${esc(i.sub)}</small>` : ""}</span>
      </${tag}>`;
    }).join("")}</div>`;
  }
  // Colunas (série temporal), empilhadas quando houver mais de uma série. Legenda sempre presente com 2+ séries.
  function cols(groups, series, o = {}) {
    const totals = groups.map(g => series.reduce((s, se) => s + (g.v[se.id] || 0), 0));
    const max = Math.max(1, ...totals);
    const body = `<div class="cols" role="list">${groups.map((g, gi) => `<button type="button" class="col" role="listitem" ${o.drill ? `data-drill="${o.drill}" data-dv="${g.id}"` : ""} aria-label="${esc(g.label)}: ${series.map(se => esc(se.label) + " " + F.int(g.v[se.id] || 0)).join(", ")}" data-tip="${esc(g.label)}|${series.map(se => esc(se.label) + ": " + F.int(g.v[se.id] || 0)).join(" · ")}">
        <span class="col__v" data-k="${o.k}-${g.id}-t" data-v="${totals[gi]}">${F.int(totals[gi])}</span>
        <span class="col__stack">${series.map(se => { const h = ((g.v[se.id] || 0) / max) * 130; return `<span class="col__seg" data-k="${o.k}-${g.id}-${se.id}" data-h="${h.toFixed(1)}" style="height:${h.toFixed(1)}px;--c:${se.color}"></span>`; }).join("")}</span>
      </button>`).join("")}</div><div class="col-x" aria-hidden="true">${groups.map(g => `<span>${esc(g.label)}</span>`).join("")}</div>`;
    const legend = series.length > 1 ? `<div class="legend">${series.map(se => `<span><i style="--c:${se.color}"></i>${esc(se.label)}</span>`).join("")}</div>` : "";
    return body + legend;
  }
  const stackBar = (parts, k) => { const total = parts.reduce((s, p) => s + p.v, 0) || 1; return `<div class="stack" role="img" aria-label="${parts.map(p => esc(p.label) + " " + F.int(p.v)).join(", ")}">${parts.map(p => `<i data-tip="${esc(p.label)}|${F.int(p.v)} (${F.pct(p.v / total)})" style="flex-grow:${p.v};--c:${p.color}" data-k="${k}-${p.id}"></i>`).join("")}</div>`; };
  function gauge(rate, k) {
    const v = rate == null ? 0 : rate * 100;
    return `<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M10 62a50 50 0 0 1 100 0" pathLength="100" fill="none" stroke="var(--jv-bg-2)" stroke-width="10" stroke-linecap="round"/>
      <path d="M10 62a50 50 0 0 1 100 0" pathLength="100" fill="none" stroke="var(--jv-arc)" stroke-width="10" stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset="${(100 - v).toFixed(1)}" data-k="${k}" data-o="${(100 - v).toFixed(1)}"/></svg>`;
  }

  // ---------- transição de recorte ----------
  function captureValues(root) {
    const m = new Map();
    root.querySelectorAll("[data-k]").forEach(el => m.set(el.dataset.k, { v: el.dataset.v, w: el.dataset.w, h: el.dataset.h, o: el.dataset.o, text: el.textContent }));
    return m;
  }
  function tween(el, from, to, kind) {
    if (reduced() || from === to || isNaN(from) || isNaN(to)) return;
    const t0 = performance.now(), dur = 650;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(kind, from + (to - from) * e); if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(kind, to); };
    el.textContent = fmt(kind, from); requestAnimationFrame(step);
  }
  function animateFrom(root, prev) {
    if (!prev) return;
    const changed = [];
    root.querySelectorAll("[data-k]").forEach(el => {
      const old = prev.get(el.dataset.k); if (!old) { if (el.dataset.w != null && !reduced()) { el.style.width = "0%"; void el.offsetWidth; el.style.width = el.dataset.w + "%"; } return; }
      if (el.dataset.w != null && old.w != null && !reduced()) { el.style.width = old.w + "%"; void el.offsetWidth; el.style.width = el.dataset.w + "%"; }
      if (el.dataset.h != null && old.h != null && !reduced()) { el.style.height = old.h + "px"; void el.offsetWidth; el.style.height = el.dataset.h + "px"; }
      if (el.dataset.o != null && old.o != null && !reduced()) { el.style.strokeDashoffset = old.o; void el.getBoundingClientRect(); el.style.strokeDashoffset = el.dataset.o; }
      if (el.dataset.v !== "" && el.dataset.v != null && old.v !== "" && old.v != null && el.dataset.f) {
        const a = parseFloat(old.v), b = parseFloat(el.dataset.v);
        if (a !== b) { tween(el, a, b, el.dataset.f); const k = el.closest(".kpi"); if (k) changed.push([k, old.text]); }
      }
    });
    changed.forEach(([k, text]) => { const w = k.querySelector(".kpi__was"); if (!w) return; w.textContent = "antes: " + text; k.dataset.changed = "true"; setTimeout(() => { k.dataset.changed = "false"; }, 4200); });
  }

  // ---------- tooltip ----------
  const tip = document.createElement("div"); tip.className = "tip"; tip.setAttribute("role", "presentation"); document.addEventListener("DOMContentLoaded", () => document.body.appendChild(tip));
  document.addEventListener("pointerover", e => { const t = e.target.closest("[data-tip]"); if (!t) { tip.dataset.on = "false"; return; } const [a, b] = t.dataset.tip.split("|"); tip.innerHTML = `<b>${a}</b>${b || ""}`; tip.dataset.on = "true"; });
  document.addEventListener("pointermove", e => { if (tip.dataset.on !== "true") return; const x = Math.min(window.innerWidth - 300, e.clientX + 14), y = Math.min(window.innerHeight - 80, e.clientY + 14); tip.style.left = x + "px"; tip.style.top = y + "px"; });
  document.addEventListener("scroll", () => { tip.dataset.on = "false"; }, { passive: true });

  // ---------- anúncio e toast ----------
  function announce(text) { const n = document.getElementById("live"); if (!n) return; n.textContent = ""; setTimeout(() => { n.textContent = text; }, 30); }
  let toastTimer = null;
  function toast(text, tone = "good") { const t = document.getElementById("toast"); t.style.setProperty("--t", `var(--jv-${tone})`); t.innerHTML = icon(tone === "crit" ? "alert" : tone === "arc" ? "refresh" : "check") + `<span>${text}</span>`; t.dataset.on = "true"; clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.dataset.on = "false"; }, 3800); }

  // ---------- CSV ----------
  function csv(columns, rows) {
    const cell = v => { let t = v == null ? "" : String(v); if (/^[\s﻿]*[=+@-]/u.test(t)) t = "'" + t; return '"' + t.replaceAll('"', '""') + '"'; };
    return "﻿" + [columns.map(c => cell(c.label)).join(";"), ...rows.map(r => columns.map(c => cell(c.csv ? c.csv(r) : r[c.id])).join(";"))].join("\r\n");
  }
  function download(name, text, type = "text/csv;charset=utf-8") { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 400); }
  // Impressão digital do recorte: a mesma na prévia e na exportação.
  function fingerprint(obj) { const s = JSON.stringify(Object.keys(obj).sort().map(k => [k, obj[k]])); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return "REC-" + (h >>> 0).toString(16).toUpperCase().padStart(8, "0").slice(0, 6); }

  window.IRC = { tip, D, icon, esc, F, fmt, plural, localDate, monthKey, L, lcChip, oppChip, bsChip, unitTag, sourceTag, LC_ICON, parseHash, buildHash, go, PERIODS, periodRange, inRange, periodLabel, S, reduced, SELLER_LOCK, panel, state, skeleton, scenarioBody, kpi, bars, cols, stackBar, gauge, captureValues, animateFrom, tween, announce, toast, csv, download, fingerprint };
})();
