/* Dashboard REV02 · "O que precisa da minha atenção", em formato de centro de comando. */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV, CH = window.IRCH, FX = window.FX;
  const { D, L, F, esc, icon, panel, lcChip, unitTag, sourceTag, scenarioBody, S } = C;
  const KEYS = ["period", "branch", "seller"];
  const STAGE = FX.STAGE;
  const plural = C.plural;

  function head(q) {
    const role = S.profile === "seller" ? "Vendedora" : "Coordenadora de crédito";
    return `<div class="hero hero--slim"><div class="hero__row">
        <div><p class="jv-eyebrow">${role} · sexta-feira, 6 de novembro de 2026</p><h1 class="jv-h1 jv-h1--xl">Bom dia, Marina<span class="caret" aria-hidden="true"></span></h1>
          <p class="jv-lead">O que precisa da sua atenção agora. Comercial e operação separados; cada número abre os registros que o compõem.</p></div>
        <div class="page-head__actions">
          <div class="refresh" data-refresh><svg class="refresh__ring" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="10" fill="none" stroke="var(--jv-bg-2)" stroke-width="3"/><circle data-refresh-ring cx="13" cy="13" r="10" fill="none" stroke="var(--jv-arc)" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0" transform="rotate(-90 13 13)"/></svg>
            <div><b data-refresh-at>Atualizado às ${F.time(S.lastUpdate)}</b><span data-refresh-next>Atualização automática a cada 60 s</span></div>
            <button type="button" class="jv-icon-btn" data-act="refresh" aria-label="Atualizar agora" style="width:34px;height:34px">${icon("refresh")}</button></div>
          <a class="ds-button ds-button--primary" href="#/fora?tela=nova-operacao">${icon("file")}Nova operação</a>
        </div></div></div>`;
  }
  const recorte = (q) => V.recorte(q, KEYS, { base: ["Operações e pendências: situação atual, sem período"], custom: { period: { label: "Período comercial" } } });
  const telemetry = (items) => `<dl class="tm-line">${items.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}<div><dt>Atualizado</dt><dd><span class="live" aria-hidden="true"></span>${F.time(S.lastUpdate)}</dd></div></dl>`;

  // ---------- 1. Pulso: métricas de cabeçalho + radar orbital ----------
  function deck(q) {
    const ops = M.ops(q), active = ops.filter(o => M.ACTIVE.includes(o.state)), cm = M.commercialMetrics(M.opps(q)), cr = M.credit(q), p = M.pendings(q);
    const trend = M.months(6).map(m => M.opps({ ...q, period: "all" }).filter(o => C.monthKey(o.createdAt) === m).length);
    const opTrend = M.months(6).map(m => ops.filter(o => C.monthKey(o.createdAt) === m).length);
    const eq = active.reduce((s, o) => s + o.equipmentValue, 0);
    const hot = p.overdue.length + p.today.length;
    const met = (o) => `<button type="button" class="hm kpi" data-drill="${o.drill}" ${o.dv ? `data-dv="${o.dv}"` : ""} style="--k:${o.color}" aria-label="${esc(o.label)}: ${esc(o.text)}. ${esc(o.sub)}. Abrir registros">
        <span class="hm__l">${o.label}${o.unit}</span>
        <span class="hm__v"><span data-k="${o.k}" data-v="${o.v}" data-f="${o.f}" ${o.suffix ? `data-suffix="${o.suffix}"` : ""}>${o.text}</span></span>
        <span class="hm__s">${o.sub}</span>${o.spark || ""}<span class="kpi__was" aria-hidden="true"></span></button>`;
    const body = () => `<div class="cmd__grid">
      <div class="cmd__left">
        <div class="cmd__metrics">
          ${met({ k: "m-pipe", label: "Pipeline aberto", unit: unitTag("pipeline", "R$ pipeline"), v: cm.pipeline, f: "brlc", text: F.brlc(cm.pipeline), sub: `${F.int(cm.openCount)} oportunidades abertas · criadas no período`, drill: "opp_open", color: "var(--jv-x-money-pipeline)", spark: CH.spark(trend, "var(--jv-arc)") })}
          ${met({ k: "m-ops", label: "Operações em andamento", unit: unitTag("count", "qtd"), v: active.length, f: "int", text: F.int(active.length), sub: `${F.brlc(eq)} em valor de equipamento`, drill: "ops_active", color: "var(--jv-stage-review)", spark: CH.spark(opTrend, "var(--jv-indigo)") })}
          ${met({ k: "m-rate", label: "Aprovação no período", unit: unitTag("count", "%"), v: (cr.rate || 0) * 100, f: "int", suffix: "%", text: F.pct(cr.rate), sub: `${F.int(cr.approved.length)} aprovadas de ${F.int(cr.decided.length)} decididas`, drill: "credit_sel", color: "var(--jv-good)" })}
          ${met({ k: "m-hot", label: "Prazos vencidos ou de hoje", unit: unitTag("count", "pendências"), v: hot, f: "int", text: F.int(hot), sub: `${p.overdue.length} vencidas · ${p.today.length} vencem hoje`, drill: hot && !p.overdue.length ? "pend_today" : "pend_overdue", color: hot ? "var(--jv-crit)" : "var(--jv-fg-3)" })}
        </div>
        <div class="cmd__read">
          <p class="cmd__h">${icon("target")}Como ler o radar</p>
          <ul><li><b>Anel</b> = etapa atual da operação</li><li><b>Ângulo</b> = horas na etapa, a partir do topo</li><li><b>Tamanho</b> = ${unitTag("equipment", "R$ equipamento")}</li><li><b>Clique</b> em um ponto para abrir o registro</li></ul>
          <div class="cmd__stages">${M.ACTIVE.map(s => `<button type="button" class="cmd__st" style="--c:${STAGE[s]}" data-drill="ops_state" data-dv="${s}"><i></i>${esc(L.lc[s].label)}<b data-k="st-${s}" data-v="${active.filter(o => o.state === s).length}" data-f="int">${active.filter(o => o.state === s).length}</b></button>`).join("")}</div>
        </div>
      </div>
      <div class="cmd__radar">${active.length ? FX.radar(active, { k: "radar", center: "em andamento", label: "Radar das operações em andamento" }) : C.state("empty", "Nenhuma operação em andamento", "Quando houver operações no seu escopo, elas aparecem no radar.")}</div>
    </div>`;
    return `<section class="cmd cp" data-panel="dash-cmd" aria-labelledby="cmd-t"><div class="cp__scan" aria-hidden="true"></div><i class="hud-c" aria-hidden="true"></i>
      <div class="cmd__head"><div><p class="jv-eyebrow">Pulso da operação</p><h2 class="jv-h2" id="cmd-t">Visão geral agora</h2></div>${sourceTag("canonical")}</div>
      ${telemetry([["Unidade", "por métrica"], ["Comercial", V.periodText(q) + " · criação"], ["Operação", "situação atual"], ["Filtros", V.filterText(q, KEYS)]])}
      <div class="cp__body">${scenarioBody("canonical", body)}</div></section>`;
  }

  // ---------- 2. Atenção ----------
  function attention(q) {
    const p = M.pendings(q), ops = M.ops(q), waiting = ops.filter(o => o.state === "in_review" && o.decision === "PENDING"), dw = M.docs(q).received;
    const opsOf = list => new Set(list.map(x => x.operation)).size;
    const sevBar = (n, max) => `<span class="attn__sev" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i data-on="${i < Math.ceil((n / Math.max(1, max)) * 10)}"></i>`).join("")}</span>`;
    const max = Math.max(p.overdue.length, p.today.length, waiting.length, dw, 1);
    const card = (o) => `<button type="button" class="attn__card" data-drill="${o.drill}" data-hot="${o.v > 0}" style="--a:${o.color}" aria-label="${esc(o.label)}: ${o.v} ${esc(o.unit)}. Abrir registros">
      <span class="attn__top"><span class="attn__icon">${icon(o.icon)}</span><span class="attn__lab">${o.label}</span><span class="attn__pri mono">${o.pri}</span></span>
      <span class="attn__v"><span data-k="attn-${o.drill}" data-v="${o.v}" data-f="int">${F.int(o.v)}</span><small>${o.unit}</small></span>
      ${sevBar(o.v, max)}
      <span class="kpi__ctx">${o.ctx}</span><span class="kpi__open">${icon("arrow")}Ver registros</span></button>`;
    return `<section class="section" aria-labelledby="attn-t"><div class="section__title"><p class="jv-eyebrow" id="attn-t">Precisa da sua atenção</p><span class="section__rule"></span></div>
      ${S.scenario === "empty" ? C.state("empty", "Nada pede atenção agora", "Nenhuma pendência vencida, prazo para hoje ou decisão aguardando no seu escopo.") : ["error", "nosource", "denied"].includes(S.scenario) ? scenarioBody("canonical", () => "") : `<div class="attn">
        ${card({ drill: "pend_overdue", label: "Pendências vencidas", v: p.overdue.length, unit: "pendências", ctx: `em ${opsOf(p.overdue)} operações · prazo anterior a hoje`, icon: "alert", color: "var(--jv-crit)", pri: "P1" })}
        ${card({ drill: "pend_today", label: "Vencem hoje", v: p.today.length, unit: "pendências", ctx: `em ${opsOf(p.today)} operações · ${F.date(D.NOW.toISOString())}`, icon: "clock", color: "var(--jv-warn)", pri: "P2" })}
        ${card({ drill: "credit_waiting", label: "Aguardando decisão de crédito", v: waiting.length, unit: "operações", ctx: "em análise, sem decisão consolidada", icon: "shield", color: "var(--jv-arc)", pri: "P2" })}
        ${card({ drill: "docs_waiting", label: "Documentos a validar", v: dw, unit: "requisitos", ctx: "recebidos, aguardando validação da Mesa", icon: "doc", color: "var(--jv-indigo)", pri: "P3" })}
      </div>`}</section>`;
  }

  // ---------- 3. Comercial × Operação ----------
  function commercial(q) {
    const cm = M.commercialMetrics(M.opps(q));
    const pm = q.dpm === "amount" ? "amount" : "count";
    const stages = D.STAGES.map(s => { const l = cm.open.filter(o => o.stage === s.id), amt = l.reduce((a, o) => a + o.amount, 0); return { id: s.id, label: ({ OPPORTUNITY: "Oportun.", SERVICE: "Atendim.", PROPOSAL: "Proposta", FOLLOW_UP: "Acomp.", NEGOTIATION: "Negoc.", CREDIT_ANALYSIS: "Crédito", FORMALIZATION: "Formaliz.", BILLING: "Faturam." })[s.id], full: s.label, v: pm === "amount" ? amt : l.length, text: pm === "amount" ? F.brlc(amt) : F.int(l.length), sub: pm === "amount" ? plural(l.length, "abertas", "abertas") : F.brlc(amt) }; });
    const mini = (k, label, unit, v, f, text, sub, drill) => `<button type="button" class="mini kpi" data-drill="${drill}" aria-label="${esc(label)}: ${esc(text)}. ${esc(sub)}. Abrir registros" style="--k:transparent"><span class="mini__l"><span>${label}</span>${unit}</span><span class="mini__v" ${v == null ? "" : `data-k="${k}" data-v="${v}" data-f="${f}"`}>${text}</span><span class="mini__s">${sub}</span><span class="kpi__was" aria-hidden="true"></span></button>`;
    const body = () => cm.population === 0 ? C.state("empty", "Nenhuma oportunidade no recorte", "Nenhuma oportunidade criada no período e filtros escolhidos.") : `
      <div class="dual__kpis">
        ${mini("dc-open", "Abertas", unitTag("count", "qtd"), cm.openCount, "int", F.int(cm.openCount), `de ${F.int(cm.population)} criadas`, "opp_open")}
        ${mini("dc-won", "Venda ganha", unitTag("won", "R$ venda ganha"), cm.wonAmount, "brlc", F.brlc(cm.wonAmount), `${cm.wonCount} ganhas · operação encerrada`, "opp_won")}
        ${mini("dc-conv", "Conversão", unitTag("count", "%"), null, "int", F.pct(cm.conversion), cm.conversion == null ? "sem concluídas" : `${cm.wonCount} ÷ ${cm.wonCount + cm.lostCount} concluídas`, "opp_closed")}
      </div>
      <div class="sub-head"><span class="h3">Pipeline aberto por etapa</span><div class="jv-seg jv-seg--xs" role="group" aria-label="Medida"><button type="button" data-q="dpm" data-v="" aria-pressed="${pm === "count"}">Qtd</button><button type="button" data-q="dpm" data-v="amount" aria-pressed="${pm === "amount"}">R$</button></div></div>
      ${FX.ribbon(stages, { k: "dc-rb", drill: "opp_stage", f: pm === "amount" ? "brlc" : "int", h: 210, w: 620, label: "Pipeline aberto por etapa" })}`;
    return `<section class="jv-panel dual__side cp" data-panel="dash-com" aria-labelledby="dc-t"><div class="cp__scan" aria-hidden="true"></div><i class="hud-c" aria-hidden="true"></i>
      <div class="dual__head"><div><p class="jv-eyebrow">Comercial · unidade: oportunidade</p><h2 class="jv-h2" id="dc-t">Resumo comercial</h2><p class="cp__q">Como está o pipeline que ainda pode virar venda?</p></div>${sourceTag("canonical")}</div>
      ${telemetry([["Período", V.periodText(q)], ["Base", "criação da oportunidade"], ["Filtros", V.filterText(q, KEYS)]])}
      <div class="cp__body">${scenarioBody("canonical", body)}</div>
      <div class="cp__foot cp__foot--links"><a href="${V.href("/bi/comercial", V.carry(q))}">${icon("chart")} Abrir no BI · Comercial com este recorte</a></div></section>`;
  }
  function operational(q) {
    const ops = M.ops(q), n = s => ops.filter(o => o.state === s);
    const res = s => { const l = n(s); return l.length ? Math.round(l.reduce((a, o) => a + o.residenceHours, 0) / l.length) + " h médias na etapa" : "sem operações"; };
    const stages = M.ACTIVE.map(s => ({ id: s, label: L.lc[s].label, step: L.lc[s].step.toUpperCase(), v: n(s).length, color: STAGE[s], money: F.brlc(n(s).reduce((a, o) => a + o.equipmentValue, 0)) + " equip.", res: res(s) }));
    const term = s => { const l = n(s), d = L.lc[s]; return `<button type="button" class="term" data-tone="${s}" style="--c:${STAGE[s]}" data-drill="ops_state" data-dv="${s}" aria-label="${esc(d.label)}: ${l.length} operações. Abrir registros"><span class="term__ico">${icon(C.LC_ICON[s])}</span><span class="term__l">${esc(d.label)}${d.pending ? `<small class="jv-x-source" data-s="lifecycle" title="Depende do Lifecycle · ${d.pending}">${icon("workflow")}Lifecycle</small>` : ""}</span><b data-k="t-${s}" data-v="${l.length}" data-f="int">${F.int(l.length)}</b></button>`; };
    const body = () => ops.length === 0 ? C.state("empty", "Nenhuma operação no seu escopo", "Quando houver operações, a distribuição por etapa aparece aqui.") : `
      <p class="h3" style="margin:4px 0 0">Em andamento · ${unitTag("equipment", "R$ equipamento")}</p>
      ${FX.conduit(stages, { k: "cd", drill: "ops_state", label: "Operações em andamento por etapa" })}
      <p class="h3" style="margin:6px 0 8px">Terminais</p><div class="terms">${["closed", "cancelled", "credit_rejected"].map(term).join("")}</div>`;
    return `<section class="jv-panel dual__side cp" data-panel="dash-ops" aria-labelledby="do-t"><div class="cp__scan" aria-hidden="true"></div><i class="hud-c" aria-hidden="true"></i>
      <div class="dual__head"><div><p class="jv-eyebrow">Operação · unidade: operação</p><h2 class="jv-h2" id="do-t">Resumo operacional</h2><p class="cp__q">Onde estão as operações agora e quanto valor de equipamento está em cada etapa?</p></div>${sourceTag("canonical")}</div>
      ${telemetry([["Período", "situação atual · sem recorte de data"], ["Filtros", V.filterText(q, ["branch", "seller"])], ["Valor", "equipamento, não financiamento"]])}
      <div class="cp__body">${scenarioBody("canonical", body)}</div>
      <div class="cp__foot cp__foot--links"><a href="${V.href("/fora", V.carry(q, { tela: "centro-operacoes", estado: "em-andamento" }))}">${icon("archive")} Centro de Operações com este recorte</a><a href="${V.href("/bi/operacoes", V.carry(q))}">${icon("chart")} BI · Operações e Crédito</a></div></section>`;
  }

  // ---------- 4. Crédito ----------
  function creditPanel(q) {
    const cr = M.credit(q);
    const catLabel = { ALL: "Todas as decisões", FULL: "Aprovadas integralmente", PARTIAL: "Aprovadas parcialmente", REJECTED: "Reprovadas" }[cr.cat];
    const seg = ["ALL", "FULL", "PARTIAL", "REJECTED"].map(c => `<button type="button" data-q="cat" data-v="${c === "ALL" ? "" : c}" aria-pressed="${cr.cat === c}">${{ ALL: "Todas", FULL: "Integral", PARTIAL: "Parcial", REJECTED: "Reprovadas" }[c]}</button>`).join("");
    const share = cr.decided.length ? cr.sel.length / cr.decided.length : null;
    const mk = M.months(4);
    const dec = M.ops(q).filter(o => o.decidedAt);
    const groups = mk.map(m => ({ id: m, label: F.month(m), up: dec.filter(o => C.monthKey(o.decidedAt) === m && o.decision !== "REJECTED" && o.decision !== "PENDING").length, down: dec.filter(o => C.monthKey(o.decidedAt) === m && o.decision === "REJECTED").length }));
    const CATS = [["BANK_FULL", "Bancária integral", "var(--jv-good)"], ["BANK_PARTIAL", "Bancária parcial", "var(--jv-teal)"], ["INTERNAL_FULL", "Interna integral", "var(--jv-arc)"], ["INTERNAL_PARTIAL", "Interna parcial", "var(--jv-indigo)"]];
    const body = () => cr.decided.length === 0 ? C.state("empty", "Nenhuma decisão no período", "Nenhuma operação criada no período teve decisão de crédito consolidada.") : `
      <div class="credit2">
        <div class="credit2__rx">${FX.reactor(cr, { k: "rate" })}
          <ul class="rx__leg"><li><i style="--c:var(--jv-good)"></i>Anel externo: aprovadas × <span style="color:var(--jv-crit)">reprovadas</span></li><li><i style="--c:var(--jv-teal)"></i>Anel médio: como foram aprovadas</li><li><i style="--c:var(--jv-violet)"></i>Anel interno: categoria selecionada</li></ul></div>
        <div class="credit2__side">
          <div class="credit__block credit__sel"><div class="sub-head"><h3>Categoria selecionada · ${catLabel}</h3><div class="jv-seg jv-seg--xs" role="group" aria-label="Categoria de decisão">${seg}</div></div>
            <div class="ratio ratio--xl"><b data-k="cat-n" data-v="${cr.sel.length}" data-f="int">${F.int(cr.sel.length)}</b><span class="of">de ${F.int(cr.decided.length)} decisões</span><span class="pct">${F.pct(share)} do denominador</span></div>
            ${C.stackBar([{ id: "sel", label: catLabel, v: cr.sel.length, color: "var(--jv-violet)" }, { id: "rest", label: "Demais decisões", v: cr.decided.length - cr.sel.length, color: "var(--jv-bg-2)" }], "cat")}
            <p class="dim note">A categoria muda só este bloco, o anel interno e o detalhamento. A taxa geral continua <b>${F.pct(cr.rate)}</b>.</p>
            <button type="button" class="linkbtn" data-drill="credit_sel">${icon("arrow")} Ver as ${F.int(cr.sel.length)} operações desta categoria</button></div>
          <div class="credit2__grid">
            <div class="credit__block"><h3>Como foram aprovadas</h3>${C.bars(CATS.map(([id, l, col]) => ({ id, label: l, v: cr.cats[id], text: F.int(cr.cats[id]), color: col })), { k: "cats", drill: "credit_cat" })}</div>
            <div class="credit__block"><h3>Decisões por mês <span class="dim mono" style="font-size:10px">· data da decisão</span></h3>${FX.diverge(groups.map(g => ({ ...g })), { drill: "credit_month", h: 170, label: "Decisões por mês" }).replace(/Ganhas<\/span>/, "Aprovadas</span>").replace(/Perdidas<\/span>/, "Reprovadas</span>").replace(/Saldo \(ganhas − perdidas\)/, "Saldo")}</div>
          </div>
        </div>
      </div>
      <div class="out"><span class="recorte__label">Fora do cálculo</span><span class="jv-pill">${icon("clock")}${plural(cr.pending.length, "pendente de decisão", "pendentes de decisão")}</span><span class="jv-pill">${icon("ban")}${plural(cr.cancelled.length, "cancelada", "canceladas")}</span><span class="dim">Cada operação conta uma vez, pela decisão consolidada.</span></div>`;
    return panel({ id: "dash-credit", title: "Decisões de crédito", q: "Quantas operações decididas foram aprovadas, e como se compõe a categoria que estou olhando?", unit: "operação decidida", period: V.periodText(q), basis: "criação da operação", filters: V.filterText(q, KEYS), source: "canonical", sourceId: "OPERATION_DECIDED_APPROVAL_V2", body: scenarioBody("canonical", body), hud: true });
  }

  // ---------- 5. Pendências e atividade ----------
  function pendingPanel(q) {
    const p = M.pendings(q), tab = q.ptab || "overdue";
    const tabs = [["overdue", "Vencidas", p.overdue.length, "var(--jv-crit)"], ["today", "Hoje", p.today.length, "var(--jv-warn)"], ["week", "Próximas", p.week.length, "var(--jv-arc)"], ["none", "Sem prazo", p.none.length, "var(--jv-fg-3)"]];
    const list = p[tab].slice(0, 5);
    const docsInfo = M.docs(q), banksPending = M.ops(q).reduce((s, o) => s + o.banks.filter(l => l.current === "PENDING").length, 0);
    const body = () => `${FX.timeline(p)}
      <div class="jv-seg" role="tablist" aria-label="Prazo">${tabs.map(([id, l, n, c]) => `<button type="button" role="tab" data-q="ptab" data-v="${id}" aria-selected="${tab === id}" style="--c:${c}"><i class="seg-dot"></i>${l}<span class="count">${n}</span></button>`).join("")}</div>
      ${list.length ? `<ul class="list list--pend">${list.map(it => `<li style="--a:${tabs.find(t => t[0] === tab)[3]}"><span class="attn__icon">${icon(it.type === "DOCUMENT" ? "doc" : it.type === "BANK_RETURN" ? "bank" : it.type === "SIGNATURE" ? "file" : "users")}</span>
        <div class="list__main"><div class="list__title">${esc(it.title)}</div><div class="list__sub"><span class="mono">${it.operation}</span> · ${esc(L.seller[it.seller].label)}</div></div>
        <div class="list__right"><span class="due">${it.dueAt ? F.dt(it.dueAt) : "sem prazo"}</span></div></li>`).join("")}</ul>` : C.state("empty", "Nenhuma pendência nesta aba", "Pendências registradas aparecem aqui conforme o prazo.")}
      ${p[tab].length > 5 ? `<button type="button" class="linkbtn" data-drill="pend_${tab}">${icon("arrow")} Ver as ${p[tab].length} pendências</button>` : ""}
      <div class="other"><a class="other__a" href="${V.href("/bi/documentacao", V.carry(q))}"><span class="other__tag">Outra visão</span><b>${F.int(docsInfo.missing)}</b><span>requisitos faltantes no checklist documental</span>${icon("arrow")}</a>
        <a class="other__a" href="${V.href("/bi/operacoes", V.carry(q, { ivw: "current" }))}"><span class="other__tag">Outra visão</span><b>${F.int(banksPending)}</b><span>tentativas bancárias em Pendente</span>${icon("arrow")}</a></div>`;
    return panel({ id: "dash-pend", title: "Pendências registradas", q: "O que venceu, o que vence hoje e o que vem a seguir?", unit: "pendência registrada na operação", period: "Situação atual · prazo comparado a hoje (São Paulo)", filters: V.filterText(q, ["branch", "seller"]), source: "canonical", sourceId: "irmen_dashboard_registered_pending", body: scenarioBody("canonical", body), foot: "Visão própria: não é o checklist documental nem as tentativas bancárias, que têm unidade e fonte diferentes." });
  }
  function activity(q) {
    const ops = M.ops(q); const ids = new Set(ops.map(o => o.id));
    const ev = (S.scenario === "empty" ? [] : D.events.filter(e => ids.has(e.operation))).slice(0, 8);
    const color = s => ({ ...STAGE, bank_rejected: "var(--jv-crit)" }[s]);
    return panel({ id: "dash-activity", title: "Atividade recente", q: "O que mudou nas operações que eu acompanho?", unit: "fato registrado na operação", period: "Últimos registros", filters: V.filterText(q, ["branch", "seller"]), source: "canonical",
      body: scenarioBody("canonical", () => ev.length ? `<ol class="feed">${ev.map((e, i) => `<li style="--o:${color(e.state)};--i:${i}"><span class="feed__dot"></span><div class="feed__main"><b>${esc(e.title)}</b><span class="list__sub"><span class="mono">${e.operation}</span> · ${esc(e.actor)}</span></div><time>${F.dt(e.at)}</time></li>`).join("")}</ol>` : C.state("empty", "Sem atividade recente", "Nenhum fato registrado no recorte.")) });
  }
  function pendingIntegrations() {
    const dep = (title, unit, id, text) => `<div class="dep dep--sig"><span class="dep__scan" aria-hidden="true"></span><span class="kpi__label"><span>${title}</span>${unit}</span><span class="dep__v">—</span><p>${text}</p><span class="dep__id">${icon("plug")}Aguardando ${id}</span></div>`;
    return `<section class="section" aria-labelledby="dep-t"><div class="section__title"><p class="jv-eyebrow" id="dep-t">Aguardando integração · sem número até haver fonte</p><span class="section__rule"></span></div>
      <div class="grid g3">${dep("Meta do período", unitTag("billed", "R$ meta"), "DASH-INT-03", "Metas versionadas por perfil, calendário de dias úteis e projeção no servidor.")}
      ${dep("Faturado no período", unitTag("billed", "R$ faturados"), "DASH-INT-04 · FAT-DEP-01", "Fatos de faturamento fiscal por item. Aprovação e pedido não contam como faturado.")}
      ${dep("Volume financiado", unitTag("received", "R$ financiado"), "DASH-INT-12", "Fatos de desembolso e condições contratadas. Valor de equipamento não é volume financiado.")}</div></section>`;
  }

  function content(q) {
    return `${deck(q)}${attention(q)}
      <section class="section"><div class="section__title"><p class="jv-eyebrow">Resumo · comercial e operação lado a lado, nunca somados</p><span class="section__rule"></span></div><div class="dual">${commercial(q)}${operational(q)}</div></section>
      <section class="section">${creditPanel(q)}</section>
      <section class="section"><div class="grid split-6-4">${pendingPanel(q)}${activity(q)}</div></section>
      ${pendingIntegrations()}`;
  }
  window.VIEW_DASH = { keys: KEYS, local: ["cat", "ptab", "dpm"], head, recorte, content, eyebrow: "Operação", name: "Dashboard" };
})();
