/*
 * Dashboard REV04 · centro de comando para leitura rápida; o BI é o lugar de investigar.
 * Regras desta revisão:
 *  - Filtro geral no topo (período, filial, gerência, vendedor, comparativo). Cada painel tem o seu mini filtro; campo vazio segue o geral.
 *  - Seletor de área claro: Visão geral, Comercial, Operações de crédito, Documentação, Faturamento.
 *  - Todo painel tem ao menos duas formas de ver, numa chave. Toda faixa de KPIs deixa escolher os indicadores.
 *  - Faturado = operação que entrou em Encerrada. Volume financiado = encerrada com desembolso registrado (banco canônico).
 *  - Grade de fundo só dentro do radar.
 */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV, FX = window.FX, X3 = window.FX3, X4 = window.FX4, IRF = window.IRF, A = window.IRA;
  const { D, L, F, esc, icon, unitTag, sourceTag, scenarioBody, S } = C;
  const KEYS = ["period", "branch", "mgr", "seller", "cmp", "cmpf"];
  const STAGE = FX.STAGE;
  const { sum } = A;
  const plural = C.plural;
  const SET = IRF.SET;

  const AREAS = [
    { id: "", label: "Visão geral", sub: "as quatro áreas", ic: "home", c: "var(--jv-arc)" },
    { id: "com", label: "Comercial", sub: "oportunidades", ic: "users", c: "var(--jv-arc)" },
    { id: "ops", label: "Operações de crédito", sub: "operações e decisões", ic: "shield", c: "var(--jv-violet)" },
    { id: "doc", label: "Documentação", sub: "checklist das operações", ic: "doc", c: "var(--jv-teal)" },
    { id: "fat", label: "Faturamento", sub: "encerradas e financiado", ic: "coins", c: "var(--jv-x-money-billed)" }
  ];

  // ---------- utilitários ----------
  const seg = (key, cur, opts, aria) => `<div class="jv-seg jv-seg--xs" role="group" aria-label="${esc(aria)}">${opts.map(([v, l], i) => `<button type="button" data-q="${key}" data-v="${i === 0 ? "" : v}" aria-pressed="${cur === v}">${l}</button>`).join("")}</div>`;
  const pick = (q, key, ids) => ids.includes(q[key]) ? q[key] : ids[0];
  const months6 = r => { const out = []; const end = new Date(Date.parse(r.to + "T12:00:00Z")); for (let i = 5; i >= 0; i--) { const x = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - i, 1)); out.push(x.toISOString().slice(0, 7)); } return out; };
  const pts = (b, f = x => x.v) => b.map(x => ({ id: x.id, label: x.label, long: x.from === x.to ? C.dmy(x.from) : C.dmy(x.from) + " a " + C.dmy(x.to), v: f(x), items: x.items }));
  const tele = items => `<dl class="tm-line">${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}<div><dt>Atualizado</dt><dd><span class="live" aria-hidden="true"></span>${F.time(S.lastUpdate)}</dd></div></dl>`;
  const opsOfDims = f => IRF.scope(D.operations, f);
  const note = (t, ic = "info") => `<p class="note4">${icon(ic)}<span>${t}</span></p>`;

  function head(q) {
    const role = S.profile === "seller" ? "Vendedora" : "Coordenadora de crédito";
    return `<div class="hero hero--slim"><div class="hero__row">
        <div><p class="jv-eyebrow">${role} · sábado, 7 de novembro de 2026</p><h1 class="jv-h1 jv-h1--xl">Bom dia, Marina<span class="caret" aria-hidden="true"></span></h1>
          <p class="jv-lead">Escolha a área, ajuste o filtro geral e, se quiser, filtre cada painel. Todo número abre os registros que o compõem.</p></div>
        <div class="page-head__actions">
          <div class="refresh" data-refresh><svg class="refresh__ring" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="10" fill="none" stroke="var(--jv-bg-2)" stroke-width="3"/><circle data-refresh-ring cx="13" cy="13" r="10" fill="none" stroke="var(--jv-arc)" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0" transform="rotate(-90 13 13)"/></svg>
            <div><b data-refresh-at>Atualizado às ${F.time(S.lastUpdate)}</b><span data-refresh-next>Atualização automática a cada 60 s</span></div>
            <button type="button" class="jv-icon-btn" data-act="refresh" aria-label="Atualizar agora" style="width:34px;height:34px">${icon("refresh")}</button></div>
          <a class="ds-button ds-button--primary" href="#/fora?tela=nova-operacao">${icon("file")}Nova operação</a>
        </div></div></div>`;
  }
  const recorte = q => IRF.master(q, KEYS);

  // ---------- seletor de área ----------
  function areaTabs(q) {
    const cur = AREAS.some(a => a.id === q.area) ? q.area || "" : "";
    return `<nav class="ar4" aria-label="Área do Dashboard">${AREAS.map(a => `<a href="${V.href("/dashboard", { ...q, area: a.id })}" style="--c:${a.c}" ${a.id === cur ? 'aria-current="page"' : ""}><span class="ar4__ico">${icon(a.ic)}</span><b>${a.label}</b><small>${a.sub}</small></a>`).join("")}</nav>`;
  }
  const areaHead = (a, text) => { const x = AREAS.find(y => y.id === a); return `<div class="area-h" style="--c:${x.c}"><span class="area-h__tag">${icon(x.ic)}${x.label}</span><p>${text}</p><span class="area-h__rule"></span></div>`; };

  // ---------- 1. Pulso: métricas escolhidas + radar ----------
  const PULSE = [
    { id: "pipe", label: "Pipeline aberto", hint: "R$ das oportunidades abertas criadas no período", m: ctx => { const a = M.commercialMetrics(A.opps(ctx.q)), b = ctx.cq && M.commercialMetrics(A.opps(ctx.cq)); return { unit: unitTag("pipeline", "R$ pipeline"), v: a.pipeline, f: "brlc", text: F.brlc(a.pipeline), sub: `${F.int(a.openCount)} oportunidades abertas`, nohist: true, color: "var(--jv-x-money-pipeline)", set: { title: "Oportunidades abertas", unit: "oportunidade", kind: "opp", rows: a.open, money: ["pipeline", o => o.amount] }, spark: ["Criadas por mês", "criadas", (mk) => mk.map(m => A.oppsAll(ctx.q).filter(o => C.monthKey(o.createdAt) === m).length), "var(--jv-arc)"] }; } },
    { id: "new", label: "Novas oportunidades", hint: "Criadas no período", m: ctx => { const a = A.opps(ctx.q), b = ctx.cq && A.opps(ctx.cq); return { unit: unitTag("count", "qtd"), v: a.length, f: "int", text: F.int(a.length), sub: `${F.brlc(sum(a, o => o.amount))} em valor`, cur: a.length, prev: b && b.length, color: "var(--jv-arc)", set: { title: "Oportunidades criadas", unit: "oportunidade", kind: "opp", rows: a }, spark: ["Criadas por mês", "criadas", (mk) => mk.map(m => A.oppsAll(ctx.q).filter(o => C.monthKey(o.createdAt) === m).length), "var(--jv-arc)"] }; } },
    { id: "act", label: "Operações em andamento", hint: "Situação atual", m: ctx => { const a = A.activeOps(ctx.q); return { unit: unitTag("count", "qtd"), v: a.length, f: "int", text: F.int(a.length), sub: `${F.brlc(sum(a, o => o.equipmentValue))} em equipamento · agora`, color: "var(--jv-stage-review)", set: { title: "Operações em andamento", unit: "operação", kind: "op", rows: a, money: ["equipment", o => o.equipmentValue] }, spark: ["Abertas por mês", "abertas", (mk) => mk.map(m => A.opsNow(ctx.q).filter(o => C.monthKey(o.createdAt) === m).length), "var(--jv-indigo)"] }; } },
    { id: "rate", label: "Aprovação no período", hint: "Aprovadas ÷ decididas", m: ctx => { const a = A.decidedIn(ctx.q, ctx.r), b = ctx.cq && A.decidedIn(ctx.cq, ctx.cr); const ap = a.filter(o => o.decision !== "REJECTED").length, r = a.length ? ap / a.length : null, rb = b && b.length ? b.filter(o => o.decision !== "REJECTED").length / b.length : null; return { unit: unitTag("count", "%"), v: r == null ? null : r * 100, f: "int", suffix: "%", text: F.pct(r), sub: `${ap} aprovadas de ${a.length} decididas`, cur: r, prev: rb, color: "var(--jv-good)", set: { title: "Decididas no período", unit: "operação decidida", kind: "op", rows: a } }; } },
    { id: "hot", label: "Prazos vencidos ou de hoje", hint: "Pendências registradas", m: ctx => { const p = A.pend(ctx.q), l = p.overdue.concat(p.today); return { unit: unitTag("count", "pendências"), v: l.length, f: "int", text: F.int(l.length), sub: `${p.overdue.length} vencidas · ${p.today.length} vencem hoje`, color: l.length ? "var(--jv-crit)" : "var(--jv-fg-3)", set: { title: "Pendências vencidas ou de hoje", unit: "pendência", kind: "pend", rows: l } }; } },
    { id: "billed", label: "Faturado", hint: "Operações que entraram em Encerrada", m: ctx => { const a = A.closedOps(ctx.q, ctx.r), b = ctx.cq && A.closedOps(ctx.cq, ctx.cr); const v = sum(a, o => o.equipmentValue); return { unit: unitTag("billed", "R$ faturado"), v, f: "brlc", text: F.brlc(v), sub: `${a.length} operações encerradas`, cur: v, prev: b && sum(b, o => o.equipmentValue), color: "var(--jv-x-money-billed)", set: { title: "Operações encerradas (faturadas)", unit: "operação", kind: "op", rows: a, money: ["billed", o => o.equipmentValue] }, spark: ["Faturado por mês", "R$", (mk) => mk.map(m => sum(opsOfDims(ctx.f).filter(o => o.closedAt && C.monthKey(o.closedAt) === m), o => o.equipmentValue)), "var(--jv-x-money-billed)", "brlc"] }; } },
    { id: "units", label: "Máquinas faturadas", hint: "Unidades nas encerradas", m: ctx => { const a = A.sales(ctx.q, ctx.r), b = ctx.cq && A.sales(ctx.cq, ctx.cr); const u = sum(a, s => s.qty); return { unit: unitTag("count", "unid."), v: u, f: "int", text: F.int(u), sub: `${new Set(a.map(s => s.model)).size} modelos`, cur: u, prev: b && sum(b, s => s.qty), color: "var(--jv-violet)", set: { title: "Itens faturados", unit: "item de equipamento", kind: "sale", rows: a } }; } },
    { id: "fin", label: "Volume financiado", hint: "Encerradas com desembolso registrado", m: ctx => { const a = A.financed(ctx.q, ctx.r), b = ctx.cq && A.financed(ctx.cq, ctx.cr); const v = sum(a, x => x.op.equipmentValue); return { unit: unitTag("received", "R$ financiado"), v, f: "brlc", text: F.brlc(v), sub: `${a.length} desembolsos`, cur: v, prev: b && sum(b, x => x.op.equipmentValue), color: "var(--jv-x-money-received)", set: { title: "Operações financiadas", unit: "operação", kind: "op", rows: a.map(x => x.op), money: ["financed", o => o.equipmentValue] } }; } },
    { id: "docs", label: "Documentos a validar", hint: "Enviados aguardando a Mesa", m: ctx => { const x = A.docs(ctx.q).rows.filter(y => y.state === "RECEIVED"); return { unit: unitTag("count", "requisitos"), v: x.length, f: "int", text: F.int(x.length), sub: "enviados · aguardando validação", color: "var(--jv-indigo)", set: { title: "Documentos a validar", unit: "requisito por operação", kind: "doc", rows: x } }; } }
  ];
  const PULSE_DEF = ["pipe", "act", "rate", "billed"];
  function chosenPulse() { let ids = null; try { ids = JSON.parse(localStorage.getItem("irmen-kpis-pulse") || "null"); } catch (e) { ids = null; } if (!Array.isArray(ids)) ids = PULSE_DEF; ids = ids.filter(i => PULSE.some(p => p.id === i)); return ids.length ? ids : PULSE_DEF; }

  function deck(q) {
    const pid = "dash-cmd", f = IRF.eff(q, pid), r = IRF.range(f), cr = IRF.cmpRange(f);
    const ctx = { f, r, cr, q: IRF.mq(f, r), cq: cr ? IRF.mq(f, cr) : null };
    const active = A.activeOps(ctx.q);
    const view = pick(q, pid + ".v", ["radar", "panel"]);
    const ids = chosenPulse(); const mk = months6(r);
    const met = (p) => { const x = p.m(ctx); const k = "m-" + p.id; const dv = SET("pulse-" + p.id, x.set);
      return `<button type="button" class="hm kpi" ${dv} style="--k:${x.color}" aria-label="${esc(p.label)}: ${esc(x.text)}. ${esc(x.sub)}. Abrir registros">
        <span class="hm__l">${p.label}${x.unit}</span>
        <span class="hm__v"><span data-k="${k}" data-v="${x.v == null ? "" : x.v}" data-f="${x.f}" ${x.suffix ? `data-suffix="${x.suffix}"` : ""}>${x.text}</span>${cr && x.nohist ? `<span class="dl4" data-flat="true" title="Fotografia de hoje, sem histórico diário para comparar">sem histórico</span>` : cr && x.prev !== undefined ? IRF.delta(x.cur, x.prev, { invert: x.invert }) : ""}</span>
        <span class="hm__s">${x.sub}</span>${x.spark ? X3.trend(mk, x.spark[2](mk), { caption: x.spark[0], unit: x.spark[1], color: x.spark[3], f: x.spark[4] }) : ""}<span class="kpi__was" aria-hidden="true"></span></button>`; };
    const open = IRF.isOpen("pick-pulse");
    const picker = `<details class="pf ks__pick" data-pf="pick-pulse" ${open ? "open" : ""}><summary class="pf__btn">${icon("gear")}<span class="pf__txt">Escolher indicadores</span></summary>
      <div class="pf__pop" role="dialog" aria-label="Escolher indicadores do pulso"><div class="pf__head"><b>Indicadores do pulso</b><span class="dim">Escolha até 6. A escolha fica salva para você.</span></div>
        <div class="ks__list">${PULSE.map(p => `<label class="ks__opt"><input type="checkbox" data-kpick="pulse" value="${p.id}" ${ids.includes(p.id) ? "checked" : ""}><span><b>${esc(p.label)}</b><small>${esc(p.hint)}</small></span></label>`).join("")}</div>
        <div class="pf__foot"><button type="button" class="ds-button ds-button--ghost ds-button--sm" data-act="kreset" data-sid="pulse">Voltar ao padrão</button><button type="button" class="ds-button ds-button--sm" data-act="pclose">Fechar</button></div></div></details>`;
    const body = () => `<div class="cmd__grid">
      <div class="cmd__left">
        <div class="cmd__metrics" style="--n:${Math.min(ids.length, 6)}">${ids.slice(0, 6).map(id => met(PULSE.find(p => p.id === id))).join("")}</div>
        <div class="cmd__read">
          ${view === "radar" ? `<p class="cmd__h">${icon("target")}Como ler o radar</p>
          <ul><li><b>Anel</b> = etapa atual da operação</li><li><b>Ângulo</b> = horas na etapa, a partir do topo</li><li><b>Tamanho</b> = ${unitTag("equipment", "R$ equipamento")}</li><li><b>Clique</b> em um ponto para abrir o registro</li></ul>` : `<p class="cmd__h">${icon("grid")}Como ler o painel</p>
          <ul><li><b>Linha</b> = etapa atual da operação</li><li><b>Coluna</b> = horas na etapa</li><li><b>Cor mais forte</b> = mais operações</li><li><b>Clique</b> em uma célula para abrir os registros</li></ul>`}
          <div class="cmd__stages">${M.ACTIVE.map(s => { const l = active.filter(o => o.state === s); return `<button type="button" class="cmd__st" style="--c:${STAGE[s]}" ${SET("cmd-st-" + s, { title: "Em andamento · " + L.lc[s].label, unit: "operação", kind: "op", rows: l })}><i></i>${esc(L.lc[s].label)}<b data-k="st-${s}" data-v="${l.length}" data-f="int">${l.length}</b></button>`; }).join("")}</div>
        </div>
      </div>
      <div class="cmd__viz" data-view="${view}">
        ${!active.length ? C.state("empty", "Nenhuma operação em andamento", "Quando houver operações no recorte, elas aparecem aqui.") : view === "radar" ? `<div class="cmd__radar">${FX.radar(active, { k: "radar", center: "em andamento", label: "Radar das operações em andamento" })}</div>` : X3.matrix(active, { label: "Operações em andamento por etapa e horas na etapa" })}
      </div>
    </div>`;
    return `<section class="cmd cp" data-panel="${pid}" aria-labelledby="cmd-t"><div class="cp__scan" aria-hidden="true"></div><i class="hud-c" aria-hidden="true"></i>
      <div class="cmd__head"><div><p class="jv-eyebrow">Pulso da operação</p><h2 class="jv-h2" id="cmd-t">Visão geral agora</h2></div>
        <div class="cp__tools">${picker}${IRF.viewSeg(pid, [["radar", "Radar", "target"], ["panel", "Painel", "grid"]], view)}${IRF.panelFilter(pid, q, f, r, cr)}${sourceTag("canonical")}</div></div>
      ${tele([["Indicadores", "escolhidos por você"], ["Período", C.periodLong(f.period) + " · " + r.label + (cr ? " · " + "vs " + cr.label : "")], ["Radar", "situação atual"], ["Filtros", IRF.filterText(f) + (f.own ? ' <span class="own4">filtro do painel</span>' : "")]])}
      <div class="cp__body">${scenarioBody("canonical", body)}</div></section>`;
  }

  // ---------- 2. Atenção (painel único: prazos + decisão + documentos) ----------
  const PT = { DOCUMENT: ["doc", "Documento"], CLIENT: ["user", "Cliente"], BANK: ["bank", "Banco"], INTERNAL: ["home", "Interna"], OPERATIONAL: ["workflow", "Operacional"], OTHER: ["inbox", "Outra"] };
  function attention(q) {
    return IRF.P({ mq: q, id: "dash-attn", title: "Precisa da sua atenção", q: "O que venceu, o que vence hoje, o que espera decisão e o que espera validação?", unit: "pendência registrada · operação · requisito (cada quadro com a sua)", period: false, periodText: "Situação atual · prazo comparado a hoje (São Paulo)", periodNote: "Este painel mostra a situação de agora; o período não se aplica.",
      source: "canonical", sourceId: "irmen_dashboard_registered_pending", hud: true,
      views: [["baldes", "Baldes de prazo", "layers"], ["linha", "Linha do prazo", "calendar"]],
      body: ctx => {
        const p = A.pend(ctx.q);
        const tab = ["overdue", "today", "week", "none"].includes(q.ptab) ? q.ptab : (p.overdue.length ? "overdue" : p.today.length ? "today" : "week");
        const TAB = { overdue: "Vencidas", today: "Vencem hoje", week: "Próximos dias", none: "Sem prazo" };
        const list = p[tab].slice(0, 5);
        const waiting = A.opsNow(ctx.q).filter(o => o.state === "in_review" && o.decision === "PENDING");
        const dv = A.docs(ctx.q), toVal = dv.rows.filter(y => y.state === "RECEIVED");
        const bankPend = A.opsNow(ctx.q).reduce((s, o) => s + o.banks.filter(l => l.current === "PENDING").length, 0);
        const main = ctx.view === "linha"
          ? `<div class="sub-head"><span class="h3">Pendências pelo prazo · 7 dias antes e depois de hoje</span><span class="dim mono" style="font-size:11px">${F.int(p.all.length)} abertas</span></div>${X4.dueline(p.all, { span: 7, color: x => { const d = C.localDate(x.dueAt), t = C.localDate(D.NOW.toISOString()); return d < t ? "var(--jv-crit)" : d === t ? "var(--jv-warn)" : "var(--jv-arc)"; }, attrs: x => `data-drill="op_one" data-dv="${esc(x.operation)}"` })}`
          : `${X3.buckets(p, tab)}
            <div class="pl3__head"><span class="h3">${TAB[tab]} · ${F.int(p[tab].length)}</span><span class="dim mono" style="font-size:11px">ordenadas pelo prazo</span></div>
            ${list.length ? `<ul class="pl3" data-tab="${tab}">${list.map(it => { const r = X3.relDue(it.dueAt); const t = PT[it.type] || PT.OTHER; return `<li><span class="pl3__type" title="${t[1]}">${icon(t[0])}</span>
              <div class="pl3__main"><b>${esc(it.title)}</b><span class="list__sub"><span class="mono">${it.operation}</span> · ${esc(L.seller[it.seller].label)} · ${t[1]}</span></div>
              <span class="pl3__due" data-tone="${r.tone}">${r.t}</span></li>`; }).join("")}</ul>` : C.state("empty", "Nenhuma pendência aqui", "Pendências registradas aparecem conforme o prazo.")}
            ${p[tab].length > 5 ? `<button type="button" class="linkbtn" ${SET("attn-" + tab, { title: "Pendências · " + TAB[tab], unit: "pendência", kind: "pend", rows: p[tab] })}>${icon("arrow")} Ver as ${p[tab].length} pendências</button>` : ""}`;
        const card = (o) => `<button type="button" class="at4__x" style="--c:${o.c}" ${o.attrs}><span class="ico">${icon(o.ic)}</span><span><b>${o.label}</b><small>${o.sub}</small></span><span class="v" data-k="at-${o.id}" data-v="${o.v}" data-f="int">${F.int(o.v)}</span></button>`;
        return `<div class="at4"><div>${main}</div>
          <div class="at4__side">
            ${card({ id: "wait", label: "Aguardando decisão de crédito", sub: "em análise, sem decisão consolidada", v: waiting.length, ic: "shield", c: "var(--jv-arc)", attrs: SET("attn-wait", { title: "Aguardando decisão de crédito", unit: "operação", kind: "op", rows: waiting }) })}
            ${card({ id: "val", label: "Documentos a validar", sub: "enviados, aguardando a Mesa · DASH-DEP-A1", v: toVal.length, ic: "doc", c: "var(--jv-indigo)", attrs: SET("attn-val", { title: "Documentos a validar", unit: "requisito por operação", kind: "doc", rows: toVal }) })}
            <div class="other"><a class="other__a" href="${V.href("/bi/documentacao", V.carry(q))}"><span class="other__tag">Outra visão</span><b>${F.int(dv.rows.filter(y => y.state === "MISSING").length)}</b><span>requisitos pendentes no checklist</span>${icon("arrow")}</a>
              <a class="other__a" href="${V.href("/bi/operacoes", V.carry(q))}"><span class="other__tag">Outra visão</span><b>${F.int(bankPend)}</b><span>vínculos com banco em Pendente</span>${icon("arrow")}</a></div>
          </div></div>`;
      },
      foot: "Pendências são registradas manualmente no cockpit da operação. Status Pendente no banco não cria pendência (decisão do Owner). Filtrar pendências por vendedor, filial e gerência pede esses campos no read model (DASH-DEP-P1)." });
  }

  // ---------- 3. Comercial ----------
  const SHORT = { OPPORTUNITY: "Oportun.", SERVICE: "Atendim.", PROPOSAL: "Proposta", FOLLOW_UP: "Acomp.", NEGOTIATION: "Negoc.", CREDIT_ANALYSIS: "Crédito", FORMALIZATION: "Formaliz.", BILLING: "Faturam." };
  // Funil clássico: abertas que chegaram pelo menos até cada etapa (sempre decrescente).
  function funnelOf(open, m) {
    return D.STAGES.map((s, i) => { const l = open.filter(o => D.STAGES.findIndex(x => x.id === o.stage) >= i), here = open.filter(o => o.stage === s.id); const v = m === "amount" ? sum(l, o => o.amount) : l.length;
      return { label: s.label, full: s.label + " ou adiante", v, text: m === "amount" ? F.brlc(v) : F.int(v), sub: `${F.int(here.length)} nesta etapa`, color: `color-mix(in oklab, var(--jv-arc) ${100 - i * 11}%, var(--jv-violet))`, attrs: SET(`com-fn-${s.id}`, { title: "Abertas em " + s.label + " ou adiante", unit: "oportunidade", kind: "opp", rows: l, money: ["pipeline", o => o.amount] }) }; });
  }
  function commercial(q) {
    const pid = "dash-com", m = pick(q, pid + ".m.v", ["count", "amount"]);
    return IRF.P({ mq: q, id: pid, title: "Resumo comercial", q: "Como está o pipeline que ainda pode virar venda?", unit: m === "amount" ? unitTag("pipeline", "R$ pipeline") : "oportunidade aberta", basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_OPEN_PIPELINE",
      views: [["escada", "Escada", "signal"], ["funil", "Funil", "funnel"]],
      tools: () => seg(pid + ".m.v", m, [["count", "Qtd"], ["amount", "R$"]], "Medida"),
      cmpSummary: ctx => { const a = M.commercialMetrics(A.opps(ctx.q)), b = M.commercialMetrics(A.opps(ctx.cq)); return [{ label: "Venda ganha", cur: a.wonAmount, prev: b.wonAmount, fmt: F.brlc }, { label: "Conversão", cur: a.conversion, prev: b.conversion, fmt: F.pct }]; },
      body: ctx => {
        const cm = M.commercialMetrics(A.opps(ctx.q)), pm = ctx.cq && M.commercialMetrics(A.opps(ctx.cq));
        if (!cm.population) return C.state("empty", "Nenhuma oportunidade no recorte", "Nenhuma oportunidade criada no período e filtros escolhidos.");
        const stages = D.STAGES.map((s, i) => { const l = cm.open.filter(o => o.stage === s.id), amt = sum(l, o => o.amount); const key = SET(`com-st-${s.id}`, { title: "Abertas em " + s.label, unit: "oportunidade", kind: "opp", rows: l, money: ["pipeline", o => o.amount] }); return { id: `com-st-${s.id}`, attrs: key, label: ctx.view === "funil" ? s.label : SHORT[s.id], full: s.label, v: m === "amount" ? amt : l.length, text: m === "amount" ? F.brlc(amt) : F.int(l.length), sub: m === "amount" ? plural(l.length, "aberta", "abertas") : F.brlc(amt), color: `color-mix(in oklab, var(--jv-arc) ${100 - i * 11}%, var(--jv-violet))` }; });
        const mini = (k, label, unit, v, f, text, sub, set, d) => `<button type="button" class="mini kpi" ${set} aria-label="${esc(label)}: ${esc(text)}. ${esc(sub)}. Abrir registros" style="--k:transparent"><span class="mini__l"><span>${label}</span>${unit}</span><span class="mini__v"><span ${v == null ? "" : `data-k="${k}" data-v="${v}" data-f="${f}"`}>${text}</span>${d || ""}</span><span class="mini__s">${sub}</span><span class="kpi__was" aria-hidden="true"></span></button>`;
        const dd = (a, b, inv) => pm ? IRF.delta(a, b, { invert: inv }) : "";
        return `<div class="dual__kpis">
            ${mini("dc-open", "Abertas", unitTag("count", "qtd"), cm.openCount, "int", F.int(cm.openCount), `de ${F.int(cm.population)} criadas`, SET("dc-open", { title: "Oportunidades abertas", unit: "oportunidade", kind: "opp", rows: cm.open }), pm ? `<span class="dl4" data-flat="true" title="Fotografia de hoje, sem histórico diário para comparar">sem histórico</span>` : "")}
            ${mini("dc-won", "Venda ganha", unitTag("won", "R$ venda ganha"), cm.wonAmount, "brlc", F.brlc(cm.wonAmount), `${cm.wonCount} ganhas`, SET("dc-won", { title: "Oportunidades ganhas", unit: "oportunidade", kind: "opp", rows: cm.won, money: ["won", o => o.amount] }), dd(cm.wonAmount, pm && pm.wonAmount))}
            ${mini("dc-conv", "Conversão", unitTag("count", "%"), null, "int", F.pct(cm.conversion), cm.conversion == null ? "sem concluídas" : `${cm.wonCount} ÷ ${cm.wonCount + cm.lostCount} concluídas`, SET("dc-conv", { title: "Concluídas", unit: "oportunidade", kind: "opp", rows: cm.won.concat(cm.lost) }), dd(cm.conversion, pm && pm.conversion))}
          </div>
          <div class="sub-head"><span class="h3">Pipeline aberto por etapa atual · ${m === "amount" ? unitTag("pipeline", "R$ pipeline") : unitTag("count", "qtd")}</span></div>
          ${ctx.view === "funil" ? X4.funnel(funnelOf(cm.open, m), { f: m === "amount" ? "brlc" : "int", label: "Funil do pipeline aberto" }) + note("Funil clássico: cada faixa soma as abertas que já chegaram pelo menos até aquela etapa. Por isso só diminui de cima para baixo.") : X3.ladder(stages, { k: "dc-ld", drill: "set", f: m === "amount" ? "brlc" : "int", label: "Pipeline aberto por etapa" })}`;
      },
      foot: `<a href="${V.href("/bi/comercial", V.carry(q))}">${icon("chart")} Abrir no BI · Comercial com este recorte</a>` });
  }
  function newOpps(q) {
    const pid = "dash-new", m = pick(q, pid + ".m.v", ["count", "amount"]);
    return IRF.P({ mq: q, id: pid, title: "Novas oportunidades", q: "Quantas oportunidades entraram e em que ritmo?", unit: m === "amount" ? unitTag("pipeline", "R$ criado") : "oportunidade criada", basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_CREATED",
      views: [["area", "Área", "area"], ["cols", "Colunas", "bars"], ["cum", "Acumulado", "cum"]],
      tools: () => seg(pid + ".m.v", m, [["count", "Qtd"], ["amount", "R$"]], "Medida"),
      cmpSummary: ctx => { const a = A.opps(ctx.q), b = A.opps(ctx.cq); return m === "amount" ? { label: "Criado", cur: sum(a, o => o.amount), prev: sum(b, o => o.amount), fmt: F.brlc } : { label: "Criadas", cur: a.length, prev: b.length, fmt: F.int }; },
      body: ctx => {
        const val = m === "amount" ? (o => o.amount) : (() => 1);
        const b = IRF.series(A.opps(ctx.q), o => o.createdAt, ctx.r, val);
        const sets = [{ label: "Período atual", color: "var(--jv-arc)", pts: pts(b) }];
        if (ctx.cq) { const pb = IRF.series(A.opps(ctx.cq), o => o.createdAt, ctx.cr, val, b.gran); sets.push({ label: "Comparado", dash: true, color: "var(--jv-fg-2)", pts: pts(pb) }); }
        return `${X4.ts(sets, { mode: ctx.view === "cum" ? "cum" : ctx.view === "cols" ? "cols" : "area", f: m === "amount" ? "brlc" : "int", h: 190, label: "Oportunidades criadas no período", drill: (p) => SET(`new-${p.id}`, { title: "Criadas em " + p.long, unit: "oportunidade", kind: "opp", rows: p.items || [] }) })}
          ${note(`Uma faixa = ${b.gran === "day" ? "um dia" : b.gran === "week" ? "uma semana" : "um mês"}. ${ctx.cq ? "Tracejado: período comparado, alinhado pelo início." : "Ligue o comparativo para sobrepor outro período."}`)}`;
      } });
  }

  // ---------- 4. Operações de crédito ----------
  function operational(q) {
    const pid = "dash-ops";
    return IRF.P({ mq: q, id: pid, title: "Resumo operacional", q: "Onde estão as operações agora e o que passou por cada etapa no período?", unit: "operação", basis: "trilho: agora · saídas e entradas: data da transição", source: "canonical", sourceId: "OPERATION_LIFECYCLE_STATE",
      views: [["trilho", "Trilho", "workflow"], ["entradas", "Entradas no período", "hbars"]],
      cmpSummary: ctx => { const ev = evIn(ctx.f, ctx.r), pev = evIn(ctx.f, ctx.cr); return { label: "Entradas em etapas", cur: ev.filter(e => M.ACTIVE.includes(e.state)).length, prev: pev.filter(e => M.ACTIVE.includes(e.state)).length, fmt: F.int }; },
      body: ctx => {
        const now = A.opsNow(ctx.q);
        if (!now.length) return C.state("empty", "Nenhuma operação no recorte", "Quando houver operações, a distribuição por etapa aparece aqui.");
        if (ctx.view === "entradas") {
          const ev = evIn(ctx.f, ctx.r), pev = ctx.cr ? evIn(ctx.f, ctx.cr) : null;
          const st = [...M.ACTIVE, "closed", "cancelled", "credit_rejected"];
          const items = st.map(s => { const l = ev.filter(e => e.state === s); return { id: s, label: L.lc[s].label, sub: L.lc[s].step, v: l.length, prev: pev ? pev.filter(e => e.state === s).length : null, color: STAGE[s], attrs: SET("ops-in-" + s, { title: "Entraram em " + L.lc[s].label, unit: "evento de transição", kind: "ev", rows: l }) }; });
          return `<div class="sub-head"><span class="h3">Quantas operações entraram em cada etapa no período</span><span class="dim mono" style="font-size:11px">data da transição</span></div>${X4.hb(items, { dense: true, cmpLegend: !!pev })}`;
        }
        const res = l => l.length ? "média " + Math.round(sum(l, o => o.residenceHours) / l.length) + " h na etapa" : "sem operações";
        const stages = M.ACTIVE.map(s => { const l = now.filter(o => o.state === s); return { id: s, label: L.lc[s].label, step: L.lc[s].step.toUpperCase(), v: l.length, color: STAGE[s], money: F.brlc(sum(l, o => o.equipmentValue)) + " equip.", res: res(l), attrs: SET("ops-st-" + s, { title: "Em " + L.lc[s].label + " agora", unit: "operação", kind: "op", rows: l, money: ["equipment", o => o.equipmentValue] }) }; });
        const termIn = (s, r) => opsOfDims(ctx.f).filter(o => o.state === s && IRF.inR(s === "closed" ? o.closedAt : o.stateEnteredAt, r));
        const term = s => { const l = termIn(s, ctx.r), pl = ctx.cr ? termIn(s, ctx.cr) : null, d = L.lc[s]; return `<button type="button" class="term" data-tone="${s}" style="--c:${STAGE[s]}" ${SET("ops-t-" + s, { title: d.label + " no período", unit: "operação", kind: "op", rows: l })} aria-label="${esc(d.label)}: ${l.length} operações no período. Abrir registros"><span class="term__ico">${icon(C.LC_ICON[s])}</span><span class="term__l">${esc(d.label)}${d.pending ? `<small class="jv-x-source" data-s="lifecycle" title="Depende do Lifecycle · ${d.pending}">${icon("workflow")}${d.pending}</small>` : ""}</span><b data-k="t-${s}" data-v="${l.length}" data-f="int">${F.int(l.length)}</b>${pl ? IRF.delta(l.length, pl.length, { invert: s !== "closed" }) : ""}</button>`; };
        return `<div class="sub-head"><span class="h3">Em andamento agora · ${F.int(sum(stages, s => s.v))} operações</span><span class="dim mono" style="font-size:11px">${unitTag("equipment", "R$ equipamento")}</span></div>
          ${X4.rail(stages, { k: "rl", label: "Operações em andamento por etapa" })}
          <div class="sub-head" style="margin-top:6px"><span class="h3">Saíram do fluxo no período</span></div><div class="terms terms--row">${["closed", "cancelled", "credit_rejected"].map(term).join("")}</div>`;
      },
      foot: `<a href="${V.href("/fora", V.carry(q, { tela: "centro-operacoes", estado: "em-andamento" }))}">${icon("archive")} Centro de Operações</a> · <a href="${V.href("/bi/operacoes", V.carry(q))}">${icon("chart")} BI · Operações e Crédito</a>` });
  }
  // Eventos de transição de operações dentro do filtro e da janela.
  function evIn(f, r) { if (!r) return []; const ids = new Set(opsOfDims(f).map(o => o.id)); return (S.scenario === "empty" ? [] : D.events).filter(e => ids.has(e.operation) && IRF.inR(e.at, r)); }

  const DCAT = X3.DCAT;
  function creditPanel(q) {
    const pid = "dash-credit";
    const mv = pick(q, pid + ".m.v", ["medidor", "radial"]), wv = pick(q, pid + ".w.v", ["mosaico", "barra"]), cv = pick(q, pid + ".c.v", ["velas", "taxa"]);
    return IRF.P({ mq: q, id: pid, title: "Decisões de crédito", q: "De cada 100 operações decididas, quantas foram aprovadas, e como?", unit: "operação decidida", basis: "criação da operação · meses pela data da decisão", source: "canonical", sourceId: "OPERATION_DECIDED_APPROVAL_V2", hud: true,
      cmpSummary: ctx => { const a = M.credit(ctx.q), b = M.credit(ctx.cq); return [{ label: "Aprovação", cur: a.rate, prev: b.rate, fmt: F.pct }, { label: "Decididas", cur: a.decided.length, prev: b.decided.length, fmt: F.int }]; },
      body: ctx => {
        const cr = M.credit({ ...ctx.q, cat: q.cat });
        if (!cr.decided.length) return C.state("empty", "Nenhuma decisão no período", "Nenhuma operação criada no período teve decisão de crédito consolidada.");
        const selKey = SET("cr-sel", { title: "Decisões · destaque atual", unit: "operação decidida", kind: "op", rows: cr.sel });
        const fix = html => html.replace(/data-drill="credit_sel"/g, selKey).replace(/data-drill="credit_cat" data-dv="([A-Z_]+)"/g, (_, k) => SET("cr-cat-" + k, { title: "Aprovadas · " + DCAT.find(d => d[0] === k)[1], unit: "operação decidida", kind: "op", rows: cr.approved.filter(o => o.category === k) }));
        const keyOf = x => x.decision === "REJECTED" ? "REJECTED" : x.category;
        const counts = Object.fromEntries(DCAT.map(([k]) => [k, cr.decided.filter(x => keyOf(x) === k).length]));
        const on = k => cr.cat === "ALL" || DCAT.find(d => d[0] === k)[3] === cr.cat;
        const dec = cr.decided.length;
        // bloco 1
        const b1 = mv === "radial"
          ? X4.radial([
            { label: "Aprovadas", v: cr.approved.length / dec, text: F.pct(cr.approved.length / dec), sub: `${cr.approved.length} de ${dec}`, color: "var(--jv-arc)", attrs: `data-q="cat" data-v=""` },
            { label: "Integral", v: (counts.BANK_FULL + counts.INTERNAL_FULL) / dec, text: F.pct((counts.BANK_FULL + counts.INTERNAL_FULL) / dec), sub: `${counts.BANK_FULL + counts.INTERNAL_FULL} operações`, color: "var(--jv-indigo)", attrs: `data-q="cat" data-v="FULL"` },
            { label: "Parcial", v: (counts.BANK_PARTIAL + counts.INTERNAL_PARTIAL) / dec, text: F.pct((counts.BANK_PARTIAL + counts.INTERNAL_PARTIAL) / dec), sub: `${counts.BANK_PARTIAL + counts.INTERNAL_PARTIAL} operações`, color: "var(--jv-teal)", attrs: `data-q="cat" data-v="PARTIAL"` },
            { label: "Reprovadas", v: cr.rejected.length / dec, text: F.pct(cr.rejected.length / dec), sub: `${cr.rejected.length} operações`, color: "var(--jv-brand)", attrs: `data-q="cat" data-v="REJECTED"` }], { size: 176, max: 1, center: `<b>${F.pct(cr.rate)}</b><small>aprovação</small>`, label: "Aprovação em barras radiais" })
          : fix(X3.meter(cr, { k: "rate" }));
        // bloco 2
        const catSeg = ["ALL", "FULL", "PARTIAL", "REJECTED"].map(c => `<button type="button" data-q="cat" data-v="${c === "ALL" ? "" : c}" aria-pressed="${cr.cat === c}">${{ ALL: "Todas", FULL: "Integral", PARTIAL: "Parcial", REJECTED: "Reprovadas" }[c]}</button>`).join("");
        const b2 = wv === "barra"
          ? X4.segbar(DCAT.map(([k, l, col]) => ({ id: k, label: l, v: counts[k], color: col, dim: !on(k), attrs: k === "REJECTED" ? `data-q="cat" data-v="REJECTED"` : SET("cr-cat-" + k, { title: "Aprovadas · " + l, unit: "operação decidida", kind: "op", rows: cr.approved.filter(o => o.category === k) }) })), [{ label: "Aprovadas", ids: ["BANK_FULL", "BANK_PARTIAL", "INTERNAL_FULL", "INTERNAL_PARTIAL"] }, { label: "Reprovadas", ids: ["REJECTED"] }])
          : fix(X3.waffle(cr));
        // bloco 3: 6 meses até o fim da janela, data da decisão
        const mk = months6(ctx.r), decAll = opsOfDims(ctx.f).filter(o => o.decidedAt && o.state !== "cancelled");
        const pmk = ctx.cr ? months6(ctx.cr) : null;
        const grp = (m, l) => ({ up: l.filter(o => C.monthKey(o.decidedAt) === m && ["APPROVED", "APPROVED_WITH_CONDITIONS"].includes(o.decision)), down: l.filter(o => C.monthKey(o.decidedAt) === m && o.decision === "REJECTED") });
        const groups = mk.map((m, i) => { const g = grp(m, decAll), pg = pmk ? grp(pmk[i], decAll) : null; return { id: m, label: F.month(m), long: F.month(m), up: g.up.length, down: g.down.length, pup: pg ? pg.up.length : null, pdown: pg ? pg.down.length : null, upAttrs: SET("cr-up-" + m, { title: "Aprovadas em " + F.month(m), unit: "operação decidida", kind: "op", rows: g.up }), downAttrs: SET("cr-dn-" + m, { title: "Reprovadas em " + F.month(m), unit: "operação decidida", kind: "op", rows: g.down }) }; });
        const rateSets = [{ label: "Aprovação", color: "var(--jv-arc)", pts: groups.map(g => ({ id: g.id, label: g.label, long: g.long, v: g.up + g.down ? g.up / (g.up + g.down) * 100 : 0 })) }];
        if (pmk) rateSets.push({ label: "Comparado", dash: true, color: "var(--jv-fg-2)", pts: groups.map((g, i) => ({ id: pmk[i], label: F.month(pmk[i]), long: F.month(pmk[i]), v: g.pup + g.pdown ? g.pup / (g.pup + g.pdown) * 100 : 0 })) });
        const b3 = cv === "taxa" ? X4.ts(rateSets, { mode: "line", f: v => F.int(v) + "%", h: 150, yMax: 100, ticks: 6, peak: false, label: "Taxa de aprovação por mês" }) : X4.candles(groups, { h: 150, label: "Decisões de crédito por mês" });
        return `<div class="cr4">
          <div><div class="cr4__h"><span class="h3">Taxa geral</span>${IRF.viewSeg(pid + ".m", [["medidor", "Medidor", "target"], ["radial", "Radial", "pie"]], mv)}</div>${b1}
            <div class="out out--stack"><span class="recorte__label">Fora do cálculo</span><span class="jv-pill">${icon("clock")}${plural(cr.pending.length, "pendente de decisão", "pendentes de decisão")}</span><span class="jv-pill">${icon("ban")}${plural(cr.cancelled.length, "cancelada", "canceladas")}</span></div></div>
          <div><div class="cr4__h"><span class="h3">Composição das ${F.int(dec)} decisões</span>${IRF.viewSeg(pid + ".w", [["mosaico", "Mosaico", "grid"], ["barra", "Barra", "hbars"]], wv)}</div>
            <div class="jv-seg jv-seg--xs" role="group" aria-label="Destacar categoria">${catSeg}</div>${b2}
            <p class="dim note">O destaque muda só a composição e o detalhamento. A taxa geral continua ${F.pct(cr.rate)}, sempre sobre as ${F.int(dec)} decididas.</p></div>
          <div><div class="cr4__h"><span class="h3">Por mês · data da decisão</span>${IRF.viewSeg(pid + ".c", [["velas", "Velas", "candle"], ["taxa", "Taxa", "line"]], cv)}</div>${b3}</div>
        </div>`;
      } });
  }

  const EVC = { ...STAGE, bank_rejected: "var(--jv-brand)", bank_approved: "var(--jv-teal)", disbursed: "var(--jv-violet)" };
  const EVL = { received: "Recebida", in_review: "Em análise", formalization: "Formalização", billing: "Faturamento", closed: "Encerrada", cancelled: "Cancelada", credit_rejected: "Reprovada por crédito", bank_rejected: "Reprovada por banco", bank_approved: "Aprovada por banco", disbursed: "Desembolsada" };
  function activity(q) {
    const pid = "dash-activity";
    return IRF.P({ mq: q, id: pid, title: "Atividade recente", q: "O que mudou nas operações que eu acompanho?", unit: "fato registrado na operação", basis: "data do registro", source: "canonical", sourceId: "OPERATION_TIMELINE", defPeriod: "30d",
      views: [["linha", "Linha do tempo", "list"], ["dia", "Por dia", "grid"]],
      cmpSummary: ctx => ({ label: "Fatos registrados", cur: evIn(ctx.f, ctx.r).length, prev: evIn(ctx.f, ctx.cr).length, fmt: F.int }),
      body: ctx => {
        const all = evIn(ctx.f, ctx.r).sort((a, b) => b.at.localeCompare(a.at));
        if (!all.length) return C.state("empty", "Sem atividade no período", "Nenhum fato registrado no recorte.");
        const dayKey = e => C.localDate(e.at);
        const days = []; const n = Math.min(14, ctx.r.days); for (let i = n - 1; i >= 0; i--) days.push(IRF.addDays(ctx.r.to, -i));
        const cnt = Object.fromEntries(days.map(d => [d, all.filter(e => dayKey(e) === d).length])); const mx = Math.max(1, ...Object.values(cnt));
        const sel = days.includes(q[pid + ".d"]) ? q[pid + ".d"] : "";
        const strip = `<div class="dayst" role="group" aria-label="Filtrar por dia">${days.map(d => `<button type="button" data-q="${pid}.d" data-v="${sel === d ? "" : d}" aria-pressed="${sel === d}" title="${C.dmy(d)}: ${cnt[d]} fatos"><i style="height:${Math.max(3, cnt[d] / mx * 28).toFixed(0)}px"></i>${d.slice(8)}</button>`).join("")}</div>`;
        const list = sel ? all.filter(e => dayKey(e) === sel) : all;
        if (ctx.view === "dia") {
          const byDay = {}; list.forEach(e => { (byDay[dayKey(e)] = byDay[dayKey(e)] || []).push(e); });
          const dk = Object.keys(byDay).sort().reverse().slice(0, 6);
          return `${strip}<div class="dayg">${dk.map(d => { const g = {}; byDay[d].forEach(e => { (g[e.state] = g[e.state] || []).push(e); }); return `<div><div class="dayg__d">${C.dmy(d)} · ${byDay[d].length} fatos</div><div class="dayg__row">${Object.entries(g).sort((a, b) => b[1].length - a[1].length).map(([s, l]) => `<button type="button" class="dayg__c" style="--c:${EVC[s] || "var(--jv-arc)"}" ${SET(`ev-${d}-${s}`, { title: `${EVL[s] || s} · ${C.dmy(d)}`, unit: "fato registrado", kind: "ev", rows: l })}><b>${l.length}</b><span>${esc(EVL[s] || s)}</span></button>`).join("")}</div></div>`; }).join("")}</div>`;
        }
        const show = list.slice(0, 9);
        return `${strip}<ol class="feed">${show.map((e, i) => `<li style="--o:${EVC[e.state] || "var(--jv-arc)"};--i:${i}"><span class="feed__dot"></span><div class="feed__main"><b>${esc(e.title)}</b><span class="list__sub"><span class="mono">${e.operation}</span> · ${esc(e.actor)}</span></div><time>${F.dt(e.at)}</time></li>`).join("")}</ol>
          ${list.length > show.length ? `<button type="button" class="linkbtn" ${SET("ev-all", { title: sel ? "Fatos de " + C.dmy(sel) : "Fatos do período", unit: "fato registrado", kind: "ev", rows: list })}>${icon("arrow")} Ver os ${list.length} fatos${sel ? " de " + C.dmy(sel) : ""}</button>` : ""}`;
      } });
  }

  // ---------- 5. Documentação ----------
  const DS = [["VALIDATED", "Validado", "var(--jv-good)", "ACCEPTED"], ["RECEIVED", "Enviado · a validar", "var(--jv-indigo)", "PROVIDED"], ["MISSING", "Pendente", "var(--jv-warn)", "PENDING"], ["REJECTED", "Rejeitado", "var(--jv-crit)", "REJECTED"]];
  function documentation(q) {
    const pid = "dash-doc";
    return IRF.P({ mq: q, id: pid, title: "Checklist documental", q: "Quanto da documentação das operações em andamento já está validada?", unit: "requisito por operação", period: false, periodText: "Situação atual · operações em andamento", source: "canonical", sourceId: "OPERATION_DOCUMENT_CHECKLIST",
      views: [["anel", "Estados", "pie"], ["doc", "Por documento", "hbars"]],
      body: ctx => {
        const x = A.docs(ctx.q);
        if (!x.applicable) return C.state("empty", "Nenhum requisito aplicável", "As operações em andamento do recorte não têm checklist.");
        if (ctx.view === "doc") {
          const rows = D.REQUIREMENTS.map(rq => { const l = x.rows.filter(y => y.req === rq.id); return { label: rq.label, sub: `${l.length} aplicáveis`, segs: Object.fromEntries(DS.map(([k]) => [k, l.filter(y => y.state === k).length])), total: F.pct(l.length ? l.filter(y => y.state === "VALIDATED").length / l.length : null) + " ok", rq: rq.id }; }).sort((a, b) => (b.segs.VALIDATED + b.segs.RECEIVED) - (a.segs.VALIDATED + a.segs.RECEIVED));
          return X4.stackRows(rows, DS.map(([id, label, color]) => ({ id, label, color })), { pct: true, segAttr: (r, p) => SET(`doc-${r.rq}-${p.id}`, { title: `${r.label} · ${p.label}`, unit: "requisito por operação", kind: "doc", rows: x.rows.filter(y => y.req === r.rq && y.state === p.id) }) });
        }
        const sent = x.rows.filter(y => y.by), ava = sent.filter(y => y.by === "AVA");
        return `${X4.ring(DS.map(([k, label, color, code]) => { const l = x.rows.filter(y => y.state === k); return { label, v: l.length, color, note: code, attrs: SET("doc-" + k, { title: "Requisitos · " + label, unit: "requisito por operação", kind: "doc", rows: l }) }; }), { center: "aplicáveis", label: "Estados do checklist" })}
          <div class="eqk" style="margin-top:12px"><div style="--c:var(--jv-good)"><span>Checklists completos</span><b>${F.int(x.complete.length)}</b><small>de ${F.int(x.observable.length)} operações observáveis</small></div><div style="--c:var(--jv-violet)"><span>Classificados pela AVA</span><b>${F.pct(sent.length ? ava.length / sent.length : null)}</b><small>${ava.length} de ${sent.length} enviados · resto manual</small></div></div>`;
      },
      foot: "Estados reais do checklist: pendente, enviado, validado, rejeitado. Não aplicável fica fora da conta. Dispensa não aparece: existe só no back-end, sem tela que a use." });
  }

  // ---------- 6. Faturamento ----------
  function billed(q) {
    const pid = "dash-billed", m = pick(q, pid + ".m.v", ["value", "units"]);
    const val = m === "units" ? (o => o.units) : (o => o.equipmentValue), fmt = m === "units" ? "int" : "brlc";
    return IRF.P({ mq: q, id: pid, title: "Faturado no período", q: "Quanto foi faturado e quantas máquinas saíram?", unit: m === "units" ? "máquina faturada" : unitTag("billed", "R$ faturado"), basis: "data da transição para Encerrada", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED",
      views: [["cols", "Colunas", "bars"], ["linha", "Linha", "line"], ["acum", "Acumulado", "cum"]],
      tools: () => seg(pid + ".m.v", m, [["value", "R$"], ["units", "Máquinas"]], "Medida"),
      cmpSummary: ctx => { const a = A.closedOps(ctx.q, ctx.r), b = A.closedOps(ctx.cq, ctx.cr); return [{ label: "Faturado", cur: sum(a, o => o.equipmentValue), prev: sum(b, o => o.equipmentValue), fmt: F.brlc }, { label: "Máquinas", cur: sum(a, o => o.units), prev: sum(b, o => o.units), fmt: F.int }]; },
      body: ctx => {
        const list = A.closedOps(ctx.q, ctx.r);
        const b = IRF.series(list, o => o.closedAt, ctx.r, val);
        const sets = [{ label: "Período atual", color: "var(--jv-x-money-billed)", pts: pts(b) }];
        if (ctx.cq) sets.push({ label: "Comparado", dash: true, color: "var(--jv-fg-2)", pts: pts(IRF.series(A.closedOps(ctx.cq, ctx.cr), o => o.closedAt, ctx.cr, val, b.gran)) });
        const tot = sum(list, val);
        return `<div class="eqk"><div style="--c:var(--jv-x-money-billed)"><span>Faturado</span><b>${F.brlc(sum(list, o => o.equipmentValue))}</b><small>${plural(list.length, "operação encerrada", "operações encerradas")}</small></div><div style="--c:var(--jv-violet)"><span>Máquinas</span><b>${F.int(sum(list, o => o.units))}</b><small>${new Set(list.flatMap(o => o.items.map(i => i.model))).size} modelos</small></div></div>
          ${X4.ts(sets, { mode: ctx.view === "acum" ? "cum" : ctx.view === "linha" ? "line" : "cols", f: fmt, h: 180, label: "Faturado no período", drill: p => SET(`bil-${p.id}`, { title: "Encerradas em " + p.long, unit: "operação", kind: "op", rows: p.items || [], money: ["billed", o => o.equipmentValue] }) })}
          ${tot ? "" : note("Nenhuma operação entrou em Encerrada nesta janela.")}`;
      },
      foot: "Faturado = operação que entrou em Encerrada no lifecycle (sem API fiscal). Entrada na etapa Faturamento é evento operacional e fica no BI." });
  }
  function financedPanel(q) {
    const pid = "dash-fin", showOff = q[pid + ".i.v"] === "on";
    return IRF.P({ mq: q, id: pid, title: "Volume financiado", q: "Quanto cada instituição financiou nas operações faturadas?", unit: unitTag("received", "R$ financiado · valor do equipamento"), basis: "data da Encerrada · banco do desembolso", source: "canonical", sourceId: "BANK_LINK_DISBURSED",
      views: [["barras", "Por banco", "hbars"], ["anel", "Participação", "pie"]],
      tools: () => seg(pid + ".i.v", showOff ? "on" : "off", [["off", "Ativas"], ["on", "Todas"]], "Instituições"),
      cmpSummary: ctx => { const a = A.financed(ctx.q, ctx.r), b = A.financed(ctx.cq, ctx.cr); return { label: "Financiado", cur: sum(a, x => x.op.equipmentValue), prev: sum(b, x => x.op.equipmentValue), fmt: F.brlc }; },
      body: ctx => {
        const a = A.financed(ctx.q, ctx.r), b = ctx.cq ? A.financed(ctx.cq, ctx.cr) : null;
        const banks = D.BANKS.filter(k => k.active || showOff);
        const items = banks.map((k, i) => { const l = a.filter(x => x.link.bank === k.id); return { id: k.id, label: k.label + (k.active ? "" : " · inativa"), sub: plural(l.length, "desembolso", "desembolsos"), v: sum(l, x => x.op.equipmentValue), prev: b ? sum(b.filter(x => x.link.bank === k.id), x => x.op.equipmentValue) : null, logo: k.logo, color: k.active ? X4.CAT[i % 6] : "var(--jv-fg-3)", attrs: SET("fin-" + k.id, { title: "Financiadas · " + k.label, unit: "operação", kind: "op", rows: l.map(x => x.op), money: ["financed", o => o.equipmentValue] }) }; }).sort((x, y) => y.v - x.v);
        if (!a.length) return C.state("empty", "Nenhum desembolso no período", "Nenhuma operação encerrada nesta janela teve vínculo desembolsado.");
        return (ctx.view === "anel" ? X4.ring(items.filter(i => i.v).map(i => ({ label: i.label, v: i.v, color: i.color, attrs: i.attrs, note: i.sub })), { f: "brlc", centerText: F.brlc(sum(items, i => i.v)), center: "financiado", label: "Participação por banco" }) : X4.hb(items, { f: "brlc", cmpLegend: !!b })) +
          note("R$ = valor do equipamento das operações encerradas cujo vínculo com o banco foi Desembolsado. O valor contratado por banco pede um campo novo (FAT-DEP-FIN).");
      } });
  }
  function goalPanel(q) {
    const pid = "dash-goal", mode = q.dep === "off" ? "off" : "preview", m = pick(q, pid + ".m.v", ["value", "units"]);
    return IRF.P({ mq: q, id: pid, title: "Meta do período", q: "Vamos bater a meta?", unit: m === "units" ? "máquina · meta de unidades" : unitTag("billed", "R$ faturado × meta"), basis: "metas mensais somadas nos meses do período", source: "none", sourceId: "FAT-DEP-META",
      views: [["vend", "Por vendedor", "hbars"], ["emp", "Empresa e filiais", "target"], ["proj", "Projeção", "line"]],
      tools: () => seg(pid + ".m.v", m, [["value", "R$"], ["units", "Unidades"]], "Meta") + seg("dep", mode, [["preview", "Prévia"], ["off", "Sem fonte"]], "Como mostrar"),
      body: ctx => {
        if (mode === "off") return `<div class="dep3__off"><span class="dep__v">—</span><p>Metas por vendedor (valor total e unidades por modelo ou categoria), somadas por filial, gerência e empresa. Sem cadastro de metas, o painel fica assim.</p><span class="dep__id">${icon("plug")}Aguardando FAT-DEP-META</span></div>`;
        const closed = A.closedOps(ctx.q, ctx.r), goals = A.goalsIn(ctx.q, ctx.r);
        const act = l => m === "units" ? sum(l, o => o.units) : sum(l, o => o.equipmentValue);
        const gol = l => m === "units" ? sum(l, g => sum(Object.values(g.units), x => x)) : sum(l, g => g.value);
        const end = new Date(Date.parse(ctx.r.to + "T12:00:00Z")); const eom = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
        const left = IRF.diffDays(ctx.r.to, eom); const proj = v => v + v / ctx.r.days * left;
        const f = m === "units" ? "int" : "brlc";
        const badge = `<div class="dep3__badge">${icon("flask")}Prévia do desenho · metas ilustrativas · sem fonte até FAT-DEP-META</div>`;
        if (ctx.view === "emp") {
          const rows = [{ label: "Empresa", l: closed, g: goals }, ...D.BRANCHES.map(b => ({ label: b.label, l: closed.filter(o => o.branch === b.id), g: goals.filter(x => x.branch === b.id) }))].filter(x => gol(x.g));
          return badge + X4.radial(rows.slice(0, 4).map((x, i) => { const v = act(x.l), g = gol(x.g); return { label: x.label, v: g ? v / g : 0, text: F.pct(g ? v / g : null), sub: `${C.fmt(f, v)} de ${C.fmt(f, g)}`, color: i === 0 ? "var(--jv-x-money-billed)" : X4.CAT[i] }; }), { size: 200, max: 1, center: `<b>${F.pct(gol(goals) ? act(closed) / gol(goals) : null)}</b><small>empresa</small>` });
        }
        if (ctx.view === "proj") {
          const b = IRF.series(closed, o => o.closedAt, ctx.r, m === "units" ? (o => o.units) : (o => o.equipmentValue));
          const G = gol(goals); let acc = 0; const n = b.length;
          const sets = [{ label: "Realizado", color: "var(--jv-x-money-billed)", pts: pts(b) }, { label: "Meta linear", dash: true, color: "var(--jv-warn)", pts: b.map((x, i) => ({ id: x.id, label: x.label, v: G / n })) }];
          void acc;
          return badge + X4.ts(sets, { mode: "cum", f, h: 180, label: "Realizado acumulado e meta" }) + note(`No ritmo atual, o período fecha em ${C.fmt(f, proj(act(closed)))} para uma meta de ${C.fmt(f, G)} (${F.pct(G ? proj(act(closed)) / G : null)}).`);
        }
        const rows = D.SELLERS.filter(s => !ctx.f.seller || s.id === ctx.f.seller).map(s => { const l = closed.filter(o => o.seller === s.id), g = goals.filter(x => x.seller === s.id), v = act(l); return { label: s.label, sub: L.branch[s.branch] ? L.branch[s.branch].label : "", avatar: A.initials(s.label), color: A.SELLER_COLOR[s.id], actual: v, goal: gol(g), proj: proj(v) }; }).filter(r => r.goal).sort((a, b) => b.actual / b.goal - a.actual / a.goal);
        return badge + X4.bullet(rows, { f });
      } });
  }

  // ---------- montagem ----------
  const AREA_DEF = { com: ["c_pipe", "c_new", "c_won", "c_conv", "c_lost", "c_units"], ops: ["o_act", "o_new", "o_rate", "o_wait", "o_closed", "o_bankrej"], doc: ["d_app", "d_val", "d_rec", "d_miss", "d_rej", "d_comp"], fat: ["f_billed", "f_units", "f_ticket", "f_fin", "f_ops", "f_goal"] };
  const AREA_CAT = { com: "comercial", ops: "operacoes", doc: "documentacao", fat: "faturamento" };
  const strip = (q, a) => IRF.kpiStrip("dash-" + a, q, A.CATALOG[AREA_CAT[a]], AREA_DEF[a], { title: "Indicadores · " + AREAS.find(x => x.id === a).label });
  const sec = h => `<section class="section">${h}</section>`;
  const blocks = {
    com: q => sec(`<div class="grid split-6-4">${commercial(q)}${newOpps(q)}</div>`),
    ops: q => `${sec(`<div class="grid split-6-4">${operational(q)}${activity(q)}</div>`)}${sec(creditPanel(q))}`,
    doc: q => sec(documentation(q)),
    fat: q => `${sec(`<div class="grid split-6-4">${billed(q)}${financedPanel(q)}</div>`)}${sec(goalPanel(q))}`
  };
  const TEXT = { com: "unidade: oportunidade · base: criação", ops: "unidade: operação · etapas, decisões e atividade", doc: "unidade: requisito por operação · situação atual", fat: "faturado = entrou em Encerrada · financiado = desembolso registrado" };
  function content(q) {
    const area = AREAS.some(a => a.id === q.area) ? q.area || "" : "";
    if (!area) return `${areaTabs(q)}${deck(q)}<section class="section">${attention(q)}</section>
      ${["com", "ops", "doc", "fat"].map(a => areaHead(a, TEXT[a]) + blocks[a](q)).join("")}`;
    return `${areaTabs(q)}${strip(q, area)}${area === "ops" ? sec(attention(q)) : ""}${areaHead(area, TEXT[area])}${blocks[area](q)}`;
  }
  window.VIEW_DASH = { keys: KEYS, local: ["area", "cat", "ptab", "dep"], head, recorte, content, eyebrow: "Operação", name: "Dashboard" };
})();
