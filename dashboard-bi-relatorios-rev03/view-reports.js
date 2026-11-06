/* Relatórios · Central de consultas: consultar, conferir e exportar o mesmo recorte. */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV, CH = window.IRCH;
  const { D, L, F, esc, icon, lcChip, oppChip, bsChip, unitTag, sourceTag, S } = C;
  const opt = (arr) => arr.map(x => [x.id, x.label]);
  const LCO = [["", "Todas as etapas"], ...opt(D.LIFECYCLE)];
  const REPORTS = [
    { id: "carteira", prio: true, title: "Carteira de operações", q: "Quais operações estão em cada etapa, com que valor de equipamento e qual decisão de crédito?", unit: "1 linha = 1 operação", source: "canonical", sourceId: "listOperations",
      formats: { print: true, pdf: true, csv: true }, basis: "data de abertura da operação",
      keys: ["period", "state", "credit", "branch", "seller"], dist: ["state", o => o.state],
      custom: { period: { label: "Abertura" }, state: { label: "Etapa", options: LCO }, credit: { label: "Crédito", options: [["", "Todas as decisões"], ["APPROVED", "Aprovada"], ["APPROVED_WITH_CONDITIONS", "Aprovada c/ condições"], ["REJECTED", "Reprovada"], ["PENDING", "Sem decisão"]] } },
      rows: q => M.ops(q, "createdAt").filter(o => (!q.state || o.state === q.state) && (!q.credit || o.decision === q.credit)),
      cols: [
        { id: "id", label: "Operação · cliente", html: o => `<span class="code">${o.id}</span><span class="sub">${esc(o.client)}</span>`, csv: o => o.id },
        { id: "client", label: "Cliente", hidden: true },
        { id: "seller", label: "Vendedor · filial", html: o => `${esc(L.seller[o.seller].label)}<span class="sub">${esc(L.branch[o.branch].label)}</span>`, csv: o => L.seller[o.seller].label + " / " + L.branch[o.branch].label },
        { id: "state", label: "Etapa", html: o => lcChip(o.state), csv: o => L.lc[o.state].label },
        { id: "decision", label: "Crédito", html: o => ({ APPROVED: "Aprovada", APPROVED_WITH_CONDITIONS: "Aprovada c/ condições", REJECTED: "Reprovada", PENDING: "Sem decisão" })[o.decision], csv: o => o.decision },
        { id: "equipmentValue", label: "Valor de equipamento", r: true, html: o => `${F.brl(o.equipmentValue)}<span class="vbar"><i style="width:${Math.min(100, o.equipmentValue / 25000).toFixed(0)}%;--c:var(--jv-indigo)"></i></span>`, csv: o => o.equipmentValue },
        { id: "createdAt", label: "Abertura", html: o => F.date(o.createdAt), csv: o => F.date(o.createdAt) }
      ],
      totals: rows => [["Operações", F.int(rows.length)], ["Valor de equipamento", F.brlc(rows.reduce((s, o) => s + o.equipmentValue, 0)) + " " + unitTag("equipment", "R$ equip.")], ["Em andamento", F.int(rows.filter(o => M.ACTIVE.includes(o.state)).length)]] },
    { id: "comercial", prio: true, title: "Resultados comerciais", q: "Quais oportunidades foram ganhas, perdidas ou seguem abertas, e por quê?", unit: "1 linha = 1 oportunidade (ciclo atual)", source: "canonical", sourceId: "ReadCanonicalCommercial · includeCsv",
      formats: { print: true, pdf: true, csv: true }, basis: "criação da oportunidade",
      keys: ["period", "outcome", "modality", "branch", "seller"], dist: ["outcome", o => o.status],
      custom: { period: { label: "Criação" }, outcome: { label: "Resultado", options: [["", "Todos os resultados"], ["OPEN", "Aberta"], ["WON", "Ganha"], ["LOST", "Perdida"], ["CANCELLED", "Cancelada (adm.)"]] } },
      rows: q => M.opps(q).filter(o => !q.outcome || o.status === q.outcome),
      cols: [
        { id: "id", label: "Oportunidade", html: o => `<span class="code">${o.id}</span><span class="sub">${esc(o.client)}</span>`, csv: o => o.id },
        { id: "client", label: "Cliente", hidden: true },
        { id: "seller", label: "Vendedor", html: o => esc(L.seller[o.seller].label), csv: o => L.seller[o.seller].label },
        { id: "stage", label: "Etapa · resultado", html: o => `${esc(L.stage[o.stage].label)}<span class="sub">${oppChip(o.status)}</span>`, csv: o => L.stage[o.stage].label + " / " + o.status },
        { id: "lossReason", label: "Motivo da perda", html: o => o.lossReason ? esc(L.loss[o.lossReason].label) : '<span class="dim">—</span>', csv: o => o.lossReason ? L.loss[o.lossReason].label : "" },
        { id: "amount", label: "Valor atual", r: true, html: o => F.brl(o.amount), csv: o => o.amount },
        { id: "createdAt", label: "Criação", html: o => F.date(o.createdAt), csv: o => F.date(o.createdAt) },
        { id: "operation", label: "Operação vinculada", html: o => o.operation ? `<span class="code">${o.operation}</span>` : '<span class="dim">Sem operação</span>', csv: o => o.operation || "" }
      ],
      totals: rows => { const m = M.commercialMetrics(rows); return [["Oportunidades", F.int(rows.length)], ["Pipeline aberto", F.brlc(m.pipeline) + " " + unitTag("pipeline", "R$ pipeline")], ["Venda ganha", F.brlc(m.wonAmount) + " " + unitTag("won", "R$ venda ganha")], ["Conversão", F.pct(m.conversion)]]; } },
    { id: "decisoes", prio: true, title: "Decisões por instituição", q: "Como cada instituição decidiu as propostas enviadas?", unit: "1 linha = 1 vínculo operação-banco", source: "canonical", sourceId: "outcomeFacts.banks", exportDep: "REL-DEP-03",
      formats: { print: true, pdf: false, csv: true }, basis: "data da última transição do vínculo",
      keys: ["period", "bank", "bstate", "branch", "seller"], dist: ["bstate", x => x.current],
      custom: { period: { label: "Última transição" }, bstate: { label: "Estado atual", options: [["", "Todos os estados"], ...opt(D.BANK_STATES)] } },
      rows: q => { const r = C.periodRange(q.period || "90d"); return M.ops({ ...q, bank: "" }).flatMap(o => o.banks.map(l => ({ ...l, op: o, last: l.transitions[l.transitions.length - 1].at }))).filter(x => (!q.bank || x.bank === q.bank) && (!q.bstate || x.current === q.bstate) && C.inRange(x.last, r)); },
      cols: [
        { id: "bank", label: "Instituição", html: x => esc(L.bank[x.bank].label), csv: x => L.bank[x.bank].label },
        { id: "op", label: "Operação", html: x => `<span class="code">${x.op.id}</span><span class="sub">${esc(x.op.client)}</span>`, csv: x => x.op.id },
        { id: "current", label: "Estado atual do vínculo", html: x => bsChip(x.current), csv: x => L.bs[x.current].label },
        { id: "path", label: "Transições registradas", html: x => `<span class="trans">${x.transitions.map(t => `<span>${esc(L.bs[t.to].label)}</span>`).join("")}</span>`, csv: x => x.transitions.map(t => L.bs[t.to].label).join(" > ") },
        { id: "opstate", label: "Estado da operação", html: x => lcChip(x.op.state), csv: x => L.lc[x.op.state].label },
        { id: "last", label: "Última transição", html: x => F.dt(x.last), csv: x => F.dt(x.last) }
      ],
      totals: rows => [["Vínculos", F.int(rows.length)], ["Operações distintas", F.int(new Set(rows.map(x => x.op.id)).size)], ["Aprovados", F.int(rows.filter(x => ["APPROVED", "CONDITIONAL", "DISBURSED"].includes(x.current)).length)], ["Reprovados", F.int(rows.filter(x => x.current === "REJECTED").length)]] },
    { id: "pendencias", prio: false, title: "Pendências com prazo", q: "O que vence hoje e o que já venceu, por operação e responsável?", unit: "1 linha = 1 pendência registrada", source: "canonical", sourceId: "irmen_dashboard_registered_pending", exportDep: "REL-DEP-04", proposal: true,
      formats: { print: true, pdf: false, csv: false }, basis: "prazo da pendência",
      keys: ["due", "branch", "seller"], custom: { due: { label: "Prazo", options: [["", "Todos"], ["overdue", "Vencidas"], ["today", "Vencem hoje"], ["week", "Próximas"], ["none", "Sem prazo"]] } },
      rows: q => { const p = M.pendings(q); return q.due ? p[q.due] : [...p.overdue, ...p.today, ...p.week, ...p.none]; },
      cols: [
        { id: "operation", label: "Operação", html: x => `<span class="code">${x.operation}</span>` },
        { id: "title", label: "Pendência", html: x => esc(x.title) },
        { id: "seller", label: "Responsável", html: x => esc(L.seller[x.seller].label), csv: x => L.seller[x.seller].label },
        { id: "dueAt", label: "Prazo", html: x => x.dueAt ? F.dt(x.dueAt) : '<span class="dim">sem prazo</span>', csv: x => x.dueAt ? F.dt(x.dueAt) : "" }
      ],
      totals: rows => [["Pendências", F.int(rows.length)], ["Operações", F.int(new Set(rows.map(x => x.operation)).size)]] },
    { id: "documentacao", prio: false, title: "Completude documental", q: "Quais requisitos faltam ou aguardam validação em cada operação?", unit: "1 linha = 1 requisito por operação", source: "canonical", sourceId: "checklist documental", exportDep: "REL-DEP-05", proposal: true,
      formats: { print: true, pdf: false, csv: false }, basis: "situação atual",
      keys: ["req", "dstate", "branch", "seller"], dist: ["dstate", r => r.state], custom: { req: { label: "Requisito", options: [["", "Todos os requisitos"], ...opt(D.REQUIREMENTS)] }, dstate: { label: "Situação", options: [["", "Todas"], ["VALIDATED", "Validado"], ["RECEIVED", "Aguardando validação"], ["WAIVED", "Dispensado"], ["MISSING", "Faltante"]] } },
      rows: q => M.docs(q).rows.filter(r => !q.dstate || r.state === q.dstate),
      cols: [
        { id: "op", label: "Operação", html: r => `<span class="code">${r.op.id}</span><span class="sub">${esc(r.op.client)}</span>`, csv: r => r.op.id },
        { id: "req", label: "Requisito", html: r => esc(L.req[r.req].label), csv: r => L.req[r.req].label },
        { id: "state", label: "Situação", html: r => ({ VALIDATED: bsChip("APPROVED").replace("Aprovada", "Validado"), RECEIVED: bsChip("RECEIVED").replace("Recebida", "Aguardando validação"), WAIVED: bsChip("INELIGIBLE").replace("Inelegível", "Dispensado"), MISSING: bsChip("PENDING").replace("Pendente", "Faltante") })[r.state], csv: r => r.state }
      ],
      totals: rows => [["Requisitos", F.int(rows.length)], ["Operações", F.int(new Set(rows.map(r => r.op.id)).size)], ["Faltantes", F.int(rows.filter(r => r.state === "MISSING").length)]] },
    { id: "faturamento", prio: false, title: "Faturamento e recebimento", q: "O que foi faturado e o que já foi recebido em cada operação?", unit: "1 linha = 1 nota fiscal", source: "none", sourceId: "FAT-DEP-01 · FAT-DEP-03", proposal: true,
      formats: { print: false, pdf: false, csv: false }, basis: "data de emissão da NF", keys: ["period", "branch"], rows: () => null, cols: [], totals: () => [] }
  ];
  const repOf = id => REPORTS.find(r => r.id === id);

  const DIST_COLORS = { received: "var(--jv-stage-received)", in_review: "var(--jv-stage-review)", formalization: "var(--jv-stage-formalization)", billing: "var(--jv-stage-billing)", closed: "var(--jv-good)", cancelled: "var(--jv-x-stage-cancelled-hc)", credit_rejected: "var(--jv-crit)",
    OPEN: "var(--jv-arc)", WON: "var(--jv-good)", LOST: "var(--jv-warn)", CANCELLED: "var(--jv-fg-3)", PENDING: "var(--jv-warn)", RECEIVED: "var(--jv-indigo)", IN_REVIEW: "var(--jv-arc)", APPROVED: "var(--jv-good)", CONDITIONAL: "var(--jv-teal)", REJECTED: "var(--jv-crit)", INELIGIBLE: "var(--jv-fg-3)", DISBURSED: "var(--jv-violet)", VALIDATED: "var(--jv-good)", WAIVED: "var(--jv-fg-3)", MISSING: "var(--jv-warn)" };
  function thumb(r, q) {
    if (r.source === "none") return `<div class="thumb thumb--none"><span>${icon("plug")}Sem fonte</span></div>`;
    const rows = r.rows(q) || [];
    if (r.id === "comercial") { const v = M.months(8).map(m => M.opps({ ...q, period: "all" }).filter(o => C.monthKey(o.createdAt) === m).length); return `<div class="thumb">${CH.spark(v, "var(--jv-arc)")}<span class="thumb__n">${F.int(rows.length)} linhas</span></div>`; }
    if (r.id === "pendencias") { const p = M.pendings(q); return `<div class="thumb thumb--dots">${[["var(--jv-crit)", p.overdue.length], ["var(--jv-warn)", p.today.length], ["var(--jv-arc)", p.week.length], ["var(--jv-fg-3)", p.none.length]].map(([c, n]) => Array.from({ length: n }, () => `<i style="--c:${c}"></i>`).join("")).join("")}<span class="thumb__n">${F.int(rows.length)} linhas</span></div>`; }
    if (!r.dist) return `<div class="thumb"><span class="thumb__n">${F.int(rows.length)} linhas</span></div>`;
    const cnt = {}; rows.forEach(x => { const k = r.dist[1](x); cnt[k] = (cnt[k] || 0) + 1; });
    const max = Math.max(1, ...Object.values(cnt));
    return `<div class="thumb thumb--bars">${Object.entries(cnt).map(([k, n]) => `<i style="height:${(n / max * 100).toFixed(0)}%;--c:${DIST_COLORS[k] || "var(--jv-arc)"}"></i>`).join("")}<span class="thumb__n">${F.int(rows.length)} linhas</span></div>`;
  }
  function card(r, q) {
    const f = r.formats;
    return `<a class="rep rep--pro" href="${V.href("/relatorios/" + r.id, V.carry(q))}" data-prop="${!!r.proposal}" data-text="${esc((r.title + " " + r.q + " " + r.unit).toLowerCase())}">
      <div class="rep__top"><span class="rep__badge" data-prio="${!!r.prio}">${r.prio ? "Prioritário" : "Proposto"}</span>${sourceTag(r.source, r.source === "none" ? r.sourceId : null)}</div>
      ${thumb(r, q)}
      <p class="rep__q">${esc(r.title)}</p><p class="muted rep__d">${esc(r.q)}</p>
      <dl><dt>Linha</dt><dd>${esc(r.unit)}</dd><dt>Data</dt><dd>${esc(r.basis)}</dd><dt>Filtros</dt><dd>${r.keys.map(k => (r.custom && r.custom[k] && r.custom[k].label) || V.LABEL[k]).join(", ")}</dd></dl>
      <div class="rep__formats">${[["print", "Imprimir"], ["pdf", "PDF"], ["csv", "CSV"]].map(([k, l]) => `<span class="fmt" data-on="${f[k]}" title="${f[k] ? "Disponível" : "Sem contrato de exportação"}">${l}</span>`).join("")}<span style="margin-left:auto" class="kpi__open">${icon("arrow")}Abrir consulta</span></div></a>`;
  }
  function headCentral() {
    return `<div class="hero hero--slim"><div class="hero__row"><div><p class="jv-eyebrow">Análise · Relatórios</p><h1 class="jv-h1 jv-h1--xl">Central de consultas<span class="caret" aria-hidden="true"></span></h1>
      <p class="jv-lead">Escolha a pergunta. Cada consulta diz o que responde, o que é uma linha e quais filtros aceita. A prévia e o arquivo saem do mesmo recorte, com a mesma impressão digital.</p></div></div>
      <div class="rsearch"><span class="rsearch__ico">${icon("search")}</span><input type="search" class="rsearch__in" data-search placeholder="Buscar consulta: carteira, banco, pendência…" aria-label="Buscar consulta"><span class="rsearch__k mono">${REPORTS.length} consultas</span></div></div>`;
  }
  function central(q) {
    const avail = REPORTS.filter(r => r.formats.csv).length;
    return `<div class="rstats"><div><b>${REPORTS.length}</b><span>consultas no catálogo</span></div><div><b>${REPORTS.filter(r => r.prio).length}</b><span>prioritárias</span></div><div><b>${avail}</b><span>com CSV contratado</span></div><div><b>1</b><span>recorte = 1 impressão digital REC</span></div></div>
      <section class="section"><div class="section__title"><p class="jv-eyebrow">Prioritários</p><span class="section__rule"></span></div><div class="catalog">${REPORTS.filter(r => r.prio).map(r => card(r, q)).join("")}</div></section>
      <section class="section"><div class="section__title"><p class="jv-eyebrow">Propostos · dependem de contrato de exportação ou de fonte</p><span class="section__rule"></span></div><div class="catalog">${REPORTS.filter(r => !r.prio).map(r => card(r, q)).join("")}</div></section>
      <p class="rsearch__empty" hidden>${icon("search")} Nenhuma consulta corresponde à busca.</p>`;
  }
  document.addEventListener("input", e => { const i = e.target.closest("[data-search]"); if (!i) return; const t = i.value.trim().toLowerCase(); let n = 0; document.querySelectorAll(".rep--pro").forEach(c => { const on = !t || c.dataset.text.includes(t); c.hidden = !on; if (on) n++; }); const em = document.querySelector(".rsearch__empty"); if (em) em.hidden = n > 0; const k = document.querySelector(".rsearch__k"); if (k) k.textContent = n + (n === 1 ? " consulta" : " consultas"); });
  function headConsulta(q, id) {
    const r = repOf(id);
    return `<div class="hero"><a class="linkbtn" href="${V.href("/relatorios", V.carry(q))}" style="font-size:12px;display:inline-flex;align-items:center;gap:6px">${icon("back")}Central de consultas</a>
      <div class="hero__row" style="margin-top:6px"><div><p class="jv-eyebrow">Relatórios · ${r.prio ? "prioritário" : "proposto"}</p><h1 class="jv-h1">${esc(r.title)}</h1><p class="jv-lead">${esc(r.q)}</p></div>
      <div class="page-head__actions">${sourceTag(r.source, r.sourceId)}<span class="jv-pill">${icon("layers")}${esc(r.unit)}</span></div></div></div>`;
  }
  const recorteConsulta = (q, id) => { const r = repOf(id); return V.recorte(q, r.keys, { custom: r.custom || {}, base: ["Data de referência: " + F.dt(S.lastUpdate.toISOString()), "Base: " + r.basis] }); };
  function filterText(q, r) { const parts = r.keys.filter(k => k !== "period" && q[k]).map(k => { const c = r.custom && r.custom[k]; const o = c && c.options ? c.options.find(x => x[0] === q[k]) : null; return (c && c.label || V.LABEL[k]) + ": " + (o ? o[1] : V.valueLabel(k, q[k])); }); if (r.keys.includes("period")) parts.unshift(((r.custom && r.custom.period && r.custom.period.label) || "Período") + ": " + C.periodLabel(q.period || "90d")); return parts; }

  function consulta(q, id) {
    const r = repOf(id);
    if (r.source === "none") return `<div class="consulta"><div>${C.state("nosource", "Consulta indisponível: sem fonte canônica", "Faturamento fiscal e recebimento dependem de integração própria (FAT-DEP-01, FAT-DEP-03). Quando a fonte existir, a prévia e a exportação aparecem aqui com o mesmo recorte. Nenhum dado é estimado.", `<a class="ds-button ds-button--sm" href="${V.href("/bi/faturamento", V.carry(q))}">${icon("chart")}Ver o que já existe no BI · Faturamento</a>`)}</div>${exportPanel(q, r, null)}</div>`;
    if (S.scenario === "error") return `<div class="consulta">${C.state("error", "Não foi possível carregar a prévia", "A consulta respondeu com erro. A exportação fica bloqueada até a prévia carregar, para não gerar um arquivo diferente do que você conferiu.", `<button class="ds-button ds-button--sm" data-act="retry">${icon("refresh")}Tentar novamente</button>`)}${exportPanel(q, r, null)}</div>`;
    if (S.scenario === "nosource") return `<div class="consulta">${C.state("nosource", "Fonte indisponível no momento", "A fonte desta consulta está fora do ar. Tente novamente em instantes.")}${exportPanel(q, r, null)}</div>`;
    if (S.scenario === "denied") return `<div class="consulta">${C.state("denied", "Sem acesso a esta consulta", "O seu perfil não tem a permissão exigida.")}${exportPanel(q, r, null)}</div>`;
    const rows = r.rows(q), cols = r.cols.filter(c => !c.hidden);
    const per = 12, page = Math.max(1, +(q.pg || 1)), pages = Math.max(1, Math.ceil(rows.length / per)), slice = rows.slice((page - 1) * per, page * per);
    const table = rows.length ? `<div class="tbl-wrap"><table class="tbl tbl--cards tbl--pro"><thead><tr>${cols.map(c => `<th class="${c.r ? "r" : ""}">${c.label}</th>`).join("")}</tr></thead><tbody>${slice.map(x => `<tr>${cols.map(c => `<td data-l="${c.label}" class="${c.r ? "r" : ""}">${c.html ? c.html(x) : esc(x[c.id])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
      <div class="pager"><span>Linhas ${F.int((page - 1) * per + 1)}–${F.int(Math.min(rows.length, page * per))} de ${F.int(rows.length)} · ${per} por página</span><span><button class="ds-button ds-button--sm" data-q="pg" data-v="${page - 1}" ${page <= 1 ? "disabled" : ""}>Anterior</button> Página ${page} de ${pages} <button class="ds-button ds-button--sm" data-q="pg" data-v="${page + 1}" ${page >= pages ? "disabled" : ""}>Próxima</button></span></div>`
      : C.state("empty", "Nenhum registro neste recorte", "A consulta respondeu sem linhas para estes filtros. Amplie o período ou limpe os filtros.", `<button class="ds-button ds-button--sm" data-act="clear">Limpar recorte</button>`);
    return `<div class="consulta"><section class="jv-panel cp" data-panel="rel-prev" aria-labelledby="rp-t"><div class="cp__scan" aria-hidden="true"></div>
        <div class="cp__head"><div class="cp__title"><h2 class="jv-h2" id="rp-t">Prévia do recorte</h2><p class="cp__q">${esc(r.unit)} · ${filterText(q, r).map(esc).join(" · ")}</p></div><span class="recorte__fp">${V.chips && C.fingerprint(Object.fromEntries(r.keys.map(k => [k, q[k] || (k === "period" ? "90d" : "")])))}</span></div>
        <div class="totals totals--pro">${r.totals(rows).map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join("")}<div class="totals__all"><small>Total do recorte</small><b data-k="rel-total" data-v="${rows.length}" data-f="int">${F.int(rows.length)}</b><span>linhas · todas as páginas</span></div></div>
        ${distStrip(q, r, rows)}
        <div class="cp__body">${table}</div></section>
      ${exportPanel(q, r, rows)}</div>`;
  }
  function distStrip(q, r, rows) {
    if (!r.dist || !rows.length) return "";
    const [key, fn] = r.dist, opts = (r.custom[key].options || []).filter(o => o[0]);
    const cnt = {}; rows.forEach(x => { const k = fn(x); cnt[k] = (cnt[k] || 0) + 1; });
    const items = opts.map(([id, l]) => ({ id, l, n: cnt[id] || 0 })).filter(x => x.n || q[key] === x.id);
    return `<div class="dist" role="group" aria-label="Distribuição por ${esc(r.custom[key].label)}. Clique para filtrar"><span class="dist__l">${esc(r.custom[key].label)} · clique para filtrar</span><div class="dist__bar">${items.map(x => `<button type="button" data-q="${key}" data-v="${q[key] === x.id ? "" : x.id}" aria-pressed="${q[key] === x.id}" style="flex-grow:${Math.max(x.n, 0.0001)};--c:${DIST_COLORS[x.id] || "var(--jv-arc)"}" data-tip="${esc(x.l)}|${x.n} linhas · ${F.pct(x.n / rows.length)}${q[key] === x.id ? " · clique para remover o filtro" : ""}" aria-label="${esc(x.l)}: ${x.n} linhas"><span>${esc(x.l)}</span><b>${x.n}</b></button>`).join("")}</div></div>`;
  }
  function exportPanel(q, r, rows) {
    const fp = C.fingerprint(Object.fromEntries(r.keys.map(k => [k, q[k] || (k === "period" ? "90d" : "")])));
    const ok = rows && rows.length, f = r.formats;
    const btn = (k, l, ic, cls = "") => `<button type="button" class="ds-button ${cls}" data-export="${k}" ${f[k] && ok ? "" : 'aria-disabled="true"'} title="${!f[k] ? "Sem contrato de exportação" + (r.exportDep ? " (" + r.exportDep + ")" : "") : !ok ? "Sem linhas para exportar" : ""}">${icon(ic)}${l}</button>`;
    return `<aside class="jv-panel export hud" aria-labelledby="ex-t"><p class="jv-eyebrow">Preparar exportação</p><h2 class="jv-h2" id="ex-t" style="margin-top:4px">O arquivo terá exatamente a prévia</h2>
      <ol>
        <li>Recorte <span class="recorte__fp">${fp}</span>, o mesmo da prévia.</li>
        <li>${filterText(q, r).map(esc).join(" · ") || "Sem filtros"}.</li>
        <li>Data de referência: <b>${F.dt(S.lastUpdate.toISOString())}</b> (São Paulo).</li>
        <li>${rows ? `<b>${F.int(rows.length)}</b> linhas · ${r.cols.length} colunas` : "Sem linhas disponíveis"} · todas as páginas.</li>
      </ol>
      <div class="export__console" data-console aria-live="polite"><span class="dim mono">&gt; aguardando comando de exportação_</span></div>
      <div class="export__btns">${btn("print", "Imprimir", "printer")}${btn("pdf", "PDF", "pdf")}${btn("csv", "Exportar CSV", "download", "ds-button--primary wide")}</div>
      ${r.exportDep ? `<p class="dim" style="font-size:11.5px;margin:10px 0 0">${icon("info")} ${!f.csv || !f.pdf ? "Formatos riscados aguardam contrato de exportação autorizado" : "Exportação depende de contrato"} (${r.exportDep}).</p>` : `<p class="dim" style="font-size:11.5px;margin:10px 0 0">${icon("shield")} A exportação respeita o mesmo escopo autorizado do seu perfil.</p>`}
    </aside>`;
  }
  function doExport(kind, q, id) {
    const r = repOf(id); const rows = r.rows(q); if (!rows || !rows.length || !r.formats[kind]) return;
    const fp = C.fingerprint(Object.fromEntries(r.keys.map(k => [k, q[k] || (k === "period" ? "90d" : "")])));
    if (kind === "csv") {
      const con = document.querySelector("[data-console]"); const name = `irmen-sintetico-${r.id}-${fp}.csv`;
      const steps = [`recorte normalizado · ${fp}`, `escopo autorizado do perfil aplicado`, `${F.int(rows.length)} linhas × ${r.cols.length} colunas (todas as páginas)`, `data de referência ${F.dt(S.lastUpdate.toISOString())}`, `arquivo pronto · ${name}`];
      const gap = C.reduced() ? 0 : 260;
      if (con) { con.innerHTML = ""; con.dataset.run = "true"; }
      steps.forEach((t, i) => setTimeout(() => { if (con) con.insertAdjacentHTML("beforeend", `<span class="ln" style="--i:${i}"><b>${i === steps.length - 1 ? "✓" : "›"}</b>${esc(t)}</span>`); }, gap * (i + 1)));
      setTimeout(() => { C.download(name, C.csv(r.cols, rows)); if (con) con.dataset.run = "done"; C.toast(`CSV gerado: ${F.int(rows.length)} linhas · recorte ${fp} · dados sintéticos`); C.announce(`CSV gerado com ${rows.length} linhas.`); }, gap * (steps.length + 1));
    }
    else { C.toast(kind === "pdf" ? "Abrindo impressão: escolha \"Salvar como PDF\"" : "Abrindo impressão do recorte", "arc"); setTimeout(() => window.print(), 400); }
  }
  window.VIEW_REL = { REPORTS, repOf, headCentral, central, headConsulta, recorteConsulta, consulta, doExport, local: ["pg"] };
})();
