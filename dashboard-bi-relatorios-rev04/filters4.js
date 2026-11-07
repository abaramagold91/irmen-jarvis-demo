/*
 * REV04 · Regra de filtros de todas as telas (Dashboard, BI e, depois, Relatórios).
 * 1. Filtro mestre no topo: período, filial, gerência, vendedor e comparativo.
 * 2. Cada painel tem o seu mini filtro com os mesmos campos. Campo do painel sem seleção segue o filtro mestre.
 * 3. Período padrão: dentro do mês, 30, 90, 180, 360 dias e período completo.
 * 4. Comparativo: mesma duração da janela atual, começando na data escolhida (calendário) ou no período anterior.
 * 5. Todo painel tem pelo menos duas formas de ver, numa chave.
 * 6. Toda faixa de KPIs deixa a pessoa escolher quais indicadores ver.
 */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV;
  const { D, F, esc, icon, S, SELLER_LOCK } = C;
  const DAY = 86400000;
  const MASTER = { p: "period", b: "branch", g: "mgr", s: "seller", c: "cmp", cf: "cmpf" };
  const PKEYS = Object.keys(MASTER);
  const iso = d => d.toISOString().slice(0, 10);
  const addDays = (ymd, n) => iso(new Date(Date.parse(ymd + "T12:00:00Z") + n * DAY));
  const diffDays = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / DAY);
  const TODAY = C.localDate(D.NOW.toISOString());
  const FIRST = (() => { const m = [...D.opportunities.map(o => o.createdAt)].sort()[0]; return C.localDate(m); })();
  let OPEN = null;

  // ---------- filtro efetivo de um painel ----------
  function eff(q, pid, o = {}) {
    const f = { pid, own: 0, ownKeys: [] };
    PKEYS.forEach(k => {
      const v = pid ? q[pid + "." + k] : undefined;
      if (v != null && v !== "") { f[MASTER[k]] = v; f.own++; f.ownKeys.push(MASTER[k]); }
      else f[MASTER[k]] = q[MASTER[k]] || "";
    });
    if (!f.period) f.period = o.defPeriod || "90d";
    if (S.profile === "seller") f.seller = SELLER_LOCK;
    f.modality = q.modality || ""; f.bank = q.bank || "";
    return f;
  }
  function range(f) {
    const r = C.periodRange(f.period); const from = r.from || FIRST;
    return { from, to: r.to, days: diffDays(from, r.to) + 1, all: !r.from, label: C.dmy(from) + " a " + C.dmy(r.to), id: f.period };
  }
  function cmpRange(f) {
    if (!f.cmp) return null; const r = range(f); if (r.all) return null;
    let from;
    if (f.cmpf) from = f.cmpf;
    else if (f.period === "mes") { const d = new Date(Date.parse(r.from + "T12:00:00Z")); d.setUTCMonth(d.getUTCMonth() - 1); from = iso(d); }
    else from = addDays(r.from, -r.days);
    let to = addDays(from, r.days - 1); if (to > TODAY) to = TODAY;
    return { from, to, days: diffDays(from, to) + 1, label: C.dmy(from) + " a " + C.dmy(to), custom: !!f.cmpf };
  }
  // Consulta no formato do modelo (M.opps, M.ops...) para uma janela.
  const mq = (f, r) => ({ period: f.period, branch: f.branch, mgr: f.mgr, seller: f.seller, modality: f.modality, bank: f.bank, __range: r ? { from: r.from, to: r.to } : undefined });
  const inR = (isoStr, r) => { if (!isoStr) return false; const d = C.localDate(isoStr); return d >= r.from && d <= r.to; };
  const matchF = (x, f) => (!f.branch || x.branch === f.branch) && (!f.mgr || x.manager === f.mgr) && (!f.seller || x.seller === f.seller) && (!f.modality || x.modality === f.modality) && (!f.bank || !x.banks || x.banks.some(l => l.bank === f.bank));
  const scope = (arr, f) => M.scoped(S.scenario === "empty" ? [] : arr).filter(x => matchF(x, f));

  // Faixas de tempo de uma janela: dia até 31 dias, semana até 180, mês acima.
  function buckets(r, gran) {
    const g = gran || (r.days <= 31 ? "day" : r.days <= 180 ? "week" : "month");
    const out = [];
    if (g === "day") { for (let d = r.from; d <= r.to; d = addDays(d, 1)) out.push({ id: d, from: d, to: d, label: d.slice(8) + "/" + d.slice(5, 7) }); }
    else if (g === "week") { for (let d = r.from; d <= r.to; d = addDays(d, 7)) { const to = addDays(d, 6) > r.to ? r.to : addDays(d, 6); out.push({ id: d, from: d, to, label: d.slice(8) + "/" + d.slice(5, 7) }); } }
    else { let d = r.from.slice(0, 7); const end = r.to.slice(0, 7); while (d <= end) { const from = d + "-01" < r.from ? r.from : d + "-01"; const nx = new Date(Date.UTC(+d.slice(0, 4), +d.slice(5, 7), 1)); const last = addDays(iso(nx), -1); out.push({ id: d, from, to: last > r.to ? r.to : last, label: F.month(d) }); d = iso(nx).slice(0, 7); } }
    out.gran = g; return out;
  }
  function series(list, dateFn, r, valFn = () => 1, gran) {
    const b = buckets(r, gran);
    b.forEach(x => { x.v = 0; x.items = []; });
    list.forEach(it => { const dt = dateFn(it); if (!dt) return; const d = C.localDate(dt); if (d < r.from || d > r.to) return; const x = b.find(y => d >= y.from && d <= y.to); if (x) { x.v += valFn(it); x.items.push(it); } });
    return b;
  }

  // ---------- registro de conjuntos para o detalhamento ----------
  const SETS = {};
  function SET(key, def) { SETS[key] = def; return `data-drill="set" data-dv="${esc(key)}"`; }

  // ---------- peças de interface ----------
  const delta = (cur, prev, o = {}) => {
    if (prev == null || cur == null) return "";
    if (!prev) return cur ? `<span class="dl4" data-up="true">novo</span>` : `<span class="dl4" data-flat="true">=</span>`;
    const d = (cur - prev) / Math.abs(prev); const up = d >= 0; const good = o.invert ? !up : up;
    if (Math.abs(d) < 0.005) return `<span class="dl4" data-flat="true">= ${o.vs || ""}</span>`;
    return `<span class="dl4" data-up="${up}" data-good="${good}" title="${esc(o.title || "Comparado com o período escolhido")}">${up ? "▲" : "▼"} ${F.int(Math.abs(d) * 100)}%${o.vs ? ` <small>${o.vs}</small>` : ""}</span>`;
  };
  function periodSeg(key, val, o = {}) {
    const free = !!val && val.startsWith("d:"); const r = o.r;
    const seed = r && !r.all ? `d:${r.from}:${r.to}` : `d:${addDays(TODAY, -29)}:${TODAY}`;
    const seg = `<div class="pseg" role="group" aria-label="${esc(o.aria || "Período")}">${C.PERIODS4.map(([id, short, long]) => `<button type="button" data-q="${key}" data-v="${id === o.def ? (o.keepDef ? id : "") : id}" aria-pressed="${val === id}" title="${long}">${short}</button>`).join("")}<button type="button" data-q="${key}" data-v="${free ? val : seed}" aria-pressed="${free}" title="Escolher no calendário de uma data até outra">${icon("calendar")}Livre</button></div>`;
    if (!free) return seg;
    const [, a, b] = val.split(":");
    return seg + `<div class="pfree" role="group" aria-label="Período livre"><label><span>De</span><input type="date" data-qr="${key}" data-end="a" value="${a}" min="${FIRST}" max="${TODAY}"></label><label><span>até</span><input type="date" data-qr="${key}" data-end="b" value="${b}" min="${FIRST}" max="${TODAY}"></label>${r ? `<small class="mono dim">${F.int(r.days)} ${r.days === 1 ? "dia" : "dias"}</small>` : ""}</div>`;
  }
  const sel = (key, val, kind, label) => `<label class="jv-field pf__f"><span>${label}</span><select class="jv-select" data-q="${key}" data-active="${!!val}" ${kind === "seller" && S.profile === "seller" ? "disabled" : ""}>${V.OPTS[kind]().map(([id, l]) => `<option value="${esc(id)}" ${id === (val || "") ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
  function cmpBlock(prefix, f, r, cr, o = {}) {
    const k = prefix ? prefix + "." : "";
    const ck = prefix ? k + "c" : "cmp", fk = prefix ? k + "cf" : "cmpf";
    const disabled = r.all;
    const lastYear = r.all ? "" : addDays(r.from, -364);
    const prevM = (() => { const d = new Date(Date.parse(r.from + "T12:00:00Z")); d.setUTCMonth(d.getUTCMonth() - 1); return iso(d); })();
    return `<div class="cmp4${f.cmp ? " is-on" : ""}">
      <label class="cmp4__sw"><input type="checkbox" data-q="${ck}" ${f.cmp ? "checked" : ""} ${disabled ? "disabled" : ""}><span class="cmp4__knob" aria-hidden="true"></span><span>Iniciar comparativo</span></label>
      ${disabled ? `<span class="dim cmp4__hint">Escolha um período com início para comparar.</span>` : f.cmp ? `<div class="cmp4__opts">
        <span class="cmp4__lab">Comparar ${F.int(r.days)} ${r.days === 1 ? "dia" : "dias"} com</span>
        <div class="pseg pseg--sm" role="group" aria-label="Período comparado">
          <button type="button" data-q="${fk}" data-v="" aria-pressed="${!f.cmpf}">${f.period === "mes" ? "Mês anterior" : "Anterior"}</button>
          ${f.period === "mes" ? "" : `<button type="button" data-q="${fk}" data-v="${prevM}" aria-pressed="${f.cmpf === prevM}">1 mês antes</button>`}
          <button type="button" data-q="${fk}" data-v="${lastYear}" aria-pressed="${f.cmpf === lastYear}">Ano anterior</button>
        </div>
        <label class="cmp4__cal">${icon("calendar")}<span>ou começar em</span><input type="date" data-q="${fk}" value="${f.cmpf || (cr ? cr.from : "")}" min="${FIRST}" max="${addDays(TODAY, -1)}" aria-label="Início do período comparado"></label>
        ${cr ? `<span class="cmp4__now"><i class="cmp4__dash" aria-hidden="true"></i>${cr.label}</span>` : ""}
      </div>` : ""}
    </div>`;
  }
  // Mini filtro do painel (abre sobre o painel; não empurra o layout).
  function panelFilter(pid, q, f, r, cr, o = {}) {
    const own = k => q[pid + "." + k] || "";
    const count = f.own;
    const open = OPEN === pid;
    const fields = o.fields || ["b", "g", "s"];
    return `<details class="pf" data-pf="${pid}" ${open ? "open" : ""}>
      <summary class="pf__btn" aria-label="Filtros deste painel${count ? `: ${count} próprios` : ": segue o filtro geral"}">${icon("filter")}<span class="pf__txt">${count ? "Filtro do painel" : "Filtros"}</span>${count ? `<b class="pf__n">${count}</b>` : ""}${f.cmp ? `<i class="pf__cmp" title="Comparativo ligado"></i>` : ""}</summary>
      <div class="pf__pop" role="dialog" aria-label="Filtros do painel">
        <div class="pf__head"><b>Filtros deste painel</b><span class="dim">Campo vazio segue o filtro geral</span></div>
        ${o.period === false ? `<p class="dim pf__note">${icon("info")} ${o.periodNote || "Este painel mostra a situação atual; o período não se aplica."}</p>` : `<span class="pf__l">Período ${own("p") ? "" : `<small class="dim">· geral: ${esc(C.periodLong(q.period || o.defPeriod || "90d"))}</small>`}</span>
        ${periodSeg(pid + ".p", own("p") || "", { aria: "Período do painel", r })}
        <span class="pf__range mono">${r.label}</span>`}
        <div class="pf__grid">${fields.includes("b") ? sel(pid + ".b", own("b"), "branch", "Filial") : ""}${fields.includes("g") ? sel(pid + ".g", own("g"), "mgr", "Gerência") : ""}${fields.includes("s") ? sel(pid + ".s", own("s"), "seller", "Vendedor") : ""}</div>
        ${fields.includes("g") ? `<p class="dim pf__note">${icon("info")} Gerência: hoje há uma gerência. Vincular vendedores a gerentes é dependência futura (DASH-DEP-G1).</p>` : ""}
        ${o.cmp === false || o.period === false ? "" : cmpBlock(pid, f, r, cr)}
        <div class="pf__foot"><button type="button" class="ds-button ds-button--ghost ds-button--sm" data-act="pclear" data-pid="${pid}" ${count ? "" : "disabled"}>${icon("x")}Limpar filtros do painel</button><button type="button" class="ds-button ds-button--sm" data-act="pclose">Fechar</button></div>
      </div></details>`;
  }
  function viewSeg(pid, views, cur) {
    if (!views || views.length < 2) return "";
    return `<div class="vseg" role="group" aria-label="Forma de visualizar">${views.map(([id, label, ic], i) => `<button type="button" data-q="${pid}.v" data-v="${i === 0 ? "" : id}" aria-pressed="${cur === id}" title="${esc(label)}" aria-label="${esc(label)}">${ic ? icon(ic) : ""}<span>${esc(label)}</span></button>`).join("")}</div>`;
  }
  // Painel REV04: cabeçalho com chave de visões + mini filtro; corpo recebe o contexto efetivo.
  function P(o) {
    const q = o.mq; const pid = o.id;
    const f = eff(q, pid, o); const r = range(f); const cr = o.cmp === false || o.period === false ? null : cmpRange(f);
    const views = o.views || [];
    const view = (views.find(v => v[0] === q[pid + ".v"]) || views[0] || [""])[0];
    const ctx = { f, r, cr, q: mq(f, r), cq: cr ? mq(f, cr) : null, view, pid, vs: cr ? "vs " + cr.label : "" };
    const body = C.scenarioBody(o.source === "none" ? "none" : "canonical", () => o.body(ctx));
    const tools = `${o.tools ? o.tools(ctx) : ""}${viewSeg(pid, views, view)}${o.filter === false ? "" : panelFilter(pid, q, f, r, cr, o)}`;
    const ft = filterText(f);
    const periodTxt = o.period === false ? (o.periodText || "Situação atual") : `<span class="hl">${esc(C.periodLong(f.period))}</span> · ${r.label}${f.ownKeys.includes("period") ? ' <span class="own4">do painel</span>' : ""}`;
    const strip = cr && o.cmpSummary ? cmpStrip(o.cmpSummary(ctx), r, cr) : "";
    return C.panel({ id: pid, title: o.title, q: o.q, unit: typeof o.unit === "function" ? o.unit(ctx) : o.unit, period: periodTxt, basis: o.basis, filters: ft + (f.own ? ' <span class="own4">filtro do painel</span>' : ' <span class="dim">· segue o geral</span>'), source: o.source || "canonical", sourceId: o.sourceId, hud: o.hud, cls: o.cls, tools, body: strip + body, foot: o.foot });
  }
  function filterText(f) {
    const parts = [];
    if (f.branch) parts.push(V.valueLabel("branch", f.branch));
    if (f.mgr) parts.push(V.valueLabel("mgr", f.mgr));
    if (f.seller) parts.push(V.valueLabel("seller", f.seller) + (S.profile === "seller" ? " (seu escopo)" : ""));
    if (f.modality) parts.push(V.valueLabel("modality", f.modality));
    if (f.bank) parts.push(V.valueLabel("bank", f.bank));
    return parts.length ? `<span class="hl">${parts.map(esc).join(" · ")}</span>` : "nenhum além do seu escopo";
  }
  function cmpStrip(s, r, cr) {
    if (!s) return "";
    const list = Array.isArray(s) ? s : [s];
    return `<div class="cstrip" role="note"><span class="cstrip__l">${icon("calendar")}Comparativo</span><span class="cstrip__w"><i class="cstrip__cur"></i>${r.label}</span><span class="cstrip__w"><i class="cstrip__prev"></i>${cr.label}</span>
      ${list.map(x => `<span class="cstrip__m"><small>${esc(x.label)}</small><b>${x.fmt(x.cur)}</b><span class="dim">vs ${x.fmt(x.prev)}</span>${delta(x.cur, x.prev, { invert: x.invert })}</span>`).join("")}</div>`;
  }

  // ---------- filtro mestre ----------
  function master(q, keys, o = {}) {
    const f = eff(q, null, o); const r = range(f); const cr = cmpRange(f);
    const extra = keys.filter(k => ["modality", "bank"].includes(k));
    const n = ["branch", "mgr", "seller", "modality", "bank"].filter(k => keys.includes(k) && q[k]).length + (q.period && q.period !== (o.defPeriod || "90d") ? 1 : 0) + (q.cmp ? 1 : 0);
    return `<section class="recorte mf" aria-label="Filtro geral desta tela" data-recorte>
      <div class="mf__row">
        ${(() => { const pv = q.period || o.defPeriod || "90d", html = periodSeg("period", pv, { def: o.defPeriod || "90d", aria: "Período geral", r }); const i = html.indexOf('<div class="pfree"'); const seg = i < 0 ? html : html.slice(0, i);
          // Período livre: as datas ficam na linha do rótulo, editáveis, para o período caber na mesma linha das listas.
          const rng = i < 0 ? `<span class="mf__range mono">${r.label}</span>` : `<span class="mf__range mf__range--free pfree" role="group" aria-label="Período livre"><input type="date" data-qr="period" data-end="a" value="${r.from}" min="${FIRST}" max="${TODAY}" aria-label="De"><span>a</span><input type="date" data-qr="period" data-end="b" value="${r.to}" min="${FIRST}" max="${TODAY}" aria-label="Até"><small>${F.int(r.days)} ${r.days === 1 ? "dia" : "dias"}</small></span>`;
          return `<div class="mf__per"><span class="mf__l">${icon("calendar")}Período${rng}</span>${seg}</div>`; })()}
        <div class="mf__sel">${V.recorte ? "" : ""}${sel("branch", q.branch, "branch", "Filial")}${sel("mgr", q.mgr, "mgr", "Gerência")}${sel("seller", S.profile === "seller" ? SELLER_LOCK : q.seller, "seller", "Vendedor")}${extra.map(k => sel(k, q[k], k, V.LABEL[k])).join("")}</div>
      </div>
      <div class="mf__row mf__row--2">${cmpBlock(null, f, r, cr)}
        <span class="mf__rule">${icon("layers")}Painéis sem filtro próprio seguem este filtro geral</span>
        <button type="button" class="ds-button ds-button--ghost ds-button--sm" data-act="clear" ${n ? "" : "disabled"}>${icon("x")}Limpar filtro geral</button>
        <span class="recorte__status" role="status" data-recorte-status>${icon("check")}Recorte aplicado</span>
        <span class="recorte__fp" data-fp title="Impressão digital do recorte">${C.fingerprint(Object.fromEntries(keys.map(k => [k, q[k] || ""])))}</span>
      </div>
      <div class="recorte__chips" data-chips hidden></div>
      <div class="recorte__progress" aria-hidden="true"><i></i></div>
    </section>`;
  }

  // ---------- seletor de KPIs ----------
  const KS_KEY = sid => "irmen-kpis-" + sid;
  function chosen(sid, catalog, defaults) {
    let ids = null; try { ids = JSON.parse(localStorage.getItem(KS_KEY(sid)) || "null"); } catch (e) { ids = null; }
    if (!Array.isArray(ids)) ids = defaults; ids = ids.filter(id => catalog.some(c => c.id === id));
    return ids.length ? ids : defaults;
  }
  function kpiStrip(sid, mqAll, catalog, defaults, o = {}) {
    const pid = "ks-" + sid; const f = eff(mqAll, pid, o); const r = range(f); const cr = cmpRange(f);
    const ctx = { f, r, cr, q: mq(f, r), cq: cr ? mq(f, cr) : null, vs: cr ? "vs " + cr.label : "", pid };
    const ids = chosen(sid, catalog, defaults); const open = OPEN === "pick-" + sid;
    const items = ids.map(id => catalog.find(c => c.id === id)).filter(Boolean);
    return `<section class="ks" data-ks="${sid}" aria-label="Indicadores">
      <div class="ks__bar"><span class="ks__t">${icon("signal")}${o.title || "Indicadores"} <span class="dim">· ${items.length} de ${catalog.length} · ${esc(C.periodLong(f.period))}${cr ? " · " + ctx.vs : ""}</span></span>
        <div class="ks__tools">
          <details class="pf ks__pick" data-pf="pick-${sid}" ${open ? "open" : ""}><summary class="pf__btn">${icon("gear")}<span class="pf__txt">Escolher indicadores</span></summary>
            <div class="pf__pop" role="dialog" aria-label="Escolher indicadores"><div class="pf__head"><b>Quais indicadores mostrar</b><span class="dim">A escolha fica salva para você (como no Dashboard do Portal).</span></div>
              <div class="ks__list">${catalog.map(c => `<label class="ks__opt"><input type="checkbox" data-kpick="${sid}" value="${c.id}" ${ids.includes(c.id) ? "checked" : ""}><span><b>${esc(c.label)}</b><small>${esc(c.hint || "")}</small></span>${c.dep ? `<span class="jv-x-source" data-s="none">${icon("plug")}${esc(c.dep)}</span>` : ""}</label>`).join("")}</div>
              <div class="pf__foot"><button type="button" class="ds-button ds-button--ghost ds-button--sm" data-act="kreset" data-sid="${sid}">Voltar ao padrão</button><button type="button" class="ds-button ds-button--sm" data-act="pclose">Fechar</button></div></div></details>
          ${panelFilter(pid, mqAll, f, r, cr, o)}
        </div></div>
      <div class="kpis kpis--auto" style="--n:${Math.min(items.length, o.max || 6)}">${C.scenarioBody("canonical", () => items.map(c => c.render(ctx)).join(""))}</div></section>`;
  }

  // ---------- eventos próprios (popover e seletor de KPIs) ----------
  document.addEventListener("toggle", e => { const d = e.target; if (!d.matches || !d.matches("details.pf")) return; if (d.open) { OPEN = d.dataset.pf; document.querySelectorAll("details.pf[open]").forEach(x => { if (x !== d) x.open = false; }); } else if (OPEN === d.dataset.pf) OPEN = null; }, true);
  document.addEventListener("click", e => {
    const inside = e.target.closest("details.pf");
    if (!inside) document.querySelectorAll("details.pf[open]").forEach(x => { x.open = false; });
    const a = e.target.closest("[data-act]"); if (!a) return;
    if (a.dataset.act === "pclose") { const d = a.closest("details.pf"); if (d) d.open = false; OPEN = null; }
    if (a.dataset.act === "kreset") { try { localStorage.removeItem(KS_KEY(a.dataset.sid)); } catch (err) { /* opcional */ } window.IRAPP && window.IRAPP.refresh(); }
  });
  document.addEventListener("change", e => {
    const k = e.target.closest("input[data-kpick]"); if (!k) return;
    const sid = k.dataset.kpick; const ids = [...document.querySelectorAll(`input[data-kpick="${sid}"]:checked`)].map(x => x.value);
    if (!ids.length) { k.checked = true; C.toast("Mantenha pelo menos um indicador.", "warn"); return; }
    try { localStorage.setItem(KS_KEY(sid), JSON.stringify(ids)); } catch (err) { /* opcional */ }
    window.IRAPP && window.IRAPP.refresh();
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") { const d = document.querySelector("details.pf[open]"); if (d) { d.open = false; OPEN = null; const s = d.querySelector("summary"); s && s.focus(); } } });

  window.IRF = { isOpen: id => OPEN === id, eff, range, cmpRange, mq, inR, matchF, scope, buckets, series, SETS, SET, delta, P, master, kpiStrip, filterText, periodSeg, addDays, diffDays, TODAY, FIRST, panelFilter, viewSeg };
})();
