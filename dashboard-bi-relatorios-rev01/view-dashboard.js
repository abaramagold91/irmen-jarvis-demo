/* Dashboard · "O que precisa da minha atenção". */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV, CH = window.IRCH;
  const { D, L, F, esc, icon, panel, kpi, lcChip, unitTag, sourceTag, scenarioBody, S } = C;
  const KEYS = ["period", "branch", "seller"];
  const STAGE_COLORS = { received: "var(--jv-stage-received)", in_review: "var(--jv-stage-review)", formalization: "var(--jv-stage-formalization)", billing: "var(--jv-stage-billing)", closed: "var(--jv-good)", cancelled: "var(--jv-x-stage-cancelled-hc)", credit_rejected: "var(--jv-crit)" };

  function head(q) {
    const role = S.profile === "seller" ? "Vendedor" : "Coordenador de crédito";
    return `<div class="hero">
      <div class="hero__row">
        <div><p class="jv-eyebrow">${role} · novembro de 2026</p><h1 class="jv-h1">Bom dia, Marina</h1>
          <p class="jv-lead">O que precisa da sua atenção agora. Comercial e operação aparecem separados, cada número com unidade, período e o caminho até os registros.</p></div>
        <div class="page-head__actions">
          <div class="refresh" data-refresh><svg class="refresh__ring" viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="10" fill="none" stroke="var(--jv-bg)" stroke-width="3"/><circle data-refresh-ring cx="13" cy="13" r="10" fill="none" stroke="var(--jv-arc)" stroke-width="3" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="0" transform="rotate(-90 13 13)"/></svg>
            <div><b data-refresh-at>Atualizado às ${F.time(S.lastUpdate)}</b><span data-refresh-next>Atualização automática a cada 60 s</span></div>
            <button type="button" class="jv-icon-btn" data-act="refresh" aria-label="Atualizar agora" style="width:34px;height:34px">${icon("refresh")}</button></div>
          <a class="ds-button ds-button--primary" href="#/fora?tela=nova-operacao">${icon("file")}Nova operação</a>
        </div>
      </div>
    </div>`;
  }
  const recorte = (q) => V.recorte(q, KEYS, { base: ["Operações e pendências: situação atual, sem período"], custom: { period: { label: "Período comercial" } } });

  function attention(q) {
    const p = M.pendings(q), ops = M.ops(q), waiting = ops.filter(o => o.state === "in_review" && o.decision === "PENDING"), dw = M.docs(q).received;
    const opsOf = list => new Set(list.map(x => x.operation)).size;
    const card = (o) => `<button type="button" class="attn__card" data-drill="${o.drill}" data-hot="${o.v > 0}" style="--a:${o.color}" aria-label="${esc(o.label)}: ${o.v}. ${esc(o.unit)}. Abrir registros">
      <span class="attn__top"><span class="attn__icon">${icon(o.icon)}</span>${o.label}</span>
      <span class="attn__v"><span data-k="attn-${o.drill}" data-v="${o.v}" data-f="int">${F.int(o.v)}</span><small>${o.unit}</small></span>
      <span class="kpi__ctx">${o.ctx}</span><span class="kpi__open">${icon("arrow")}Ver registros</span></button>`;
    return `<section class="section" aria-labelledby="attn-t"><div class="section__title"><p class="jv-eyebrow" id="attn-t">Precisa da sua atenção</p></div>
      ${S.scenario === "empty" ? C.state("empty", "Nada pede atenção agora", "Nenhuma pendência vencida, prazo para hoje ou decisão aguardando no seu escopo.") : S.scenario === "error" || S.scenario === "nosource" || S.scenario === "denied" ? scenarioBody("canonical", () => "") : `<div class="attn">
        ${card({ drill: "pend_overdue", label: "Pendências vencidas", v: p.overdue.length, unit: "pendências", ctx: `em ${opsOf(p.overdue)} operações · prazo anterior a hoje`, icon: "alert", color: "var(--jv-crit)" })}
        ${card({ drill: "pend_today", label: "Vencem hoje", v: p.today.length, unit: "pendências", ctx: `em ${opsOf(p.today)} operações · ${F.date(D.NOW.toISOString())}`, icon: "clock", color: "var(--jv-warn)" })}
        ${card({ drill: "credit_waiting", label: "Aguardando decisão de crédito", v: waiting.length, unit: "operações", ctx: "em análise, sem decisão consolidada", icon: "shield", color: "var(--jv-arc)" })}
        ${card({ drill: "docs_waiting", label: "Documentos a validar", v: dw, unit: "requisitos", ctx: "recebidos, aguardando validação da Mesa", icon: "doc", color: "var(--jv-indigo)" })}
      </div>`}</section>`;
  }

  function commercial(q) {
    const cm = M.commercialMetrics(M.opps(q));
    const byStage = D.STAGES.map(s => ({ id: s.id, label: s.label, v: cm.open.filter(o => o.stage === s.id).length, color: "var(--jv-arc)" }));
    const trend = M.months(6).map(m => M.opps({ ...q, period: "all" }).filter(o => C.monthKey(o.createdAt) === m).length);
    return `<section class="jv-panel dual__side cp" data-panel="dash-com" aria-labelledby="dc-t"><div class="cp__scan" aria-hidden="true"></div>
      <div class="dual__head"><div><p class="jv-eyebrow">Comercial · unidade: oportunidade</p><h2 class="jv-h2" id="dc-t">Resumo comercial</h2>
        <p class="cp__q">Como está o pipeline que ainda pode virar venda?</p></div>${sourceTag("canonical")}</div>
      <dl class="cp__meta"><div><dt>Período</dt><dd>${V.periodText(q)}</dd></div><div><dt>Base</dt><dd>criação da oportunidade</dd></div><div><dt>Filtros</dt><dd>${V.filterText(q, KEYS)}</dd></div></dl>
      <div class="cp__body">${scenarioBody("canonical", () => cm.population === 0 ? C.state("empty", "Nenhuma oportunidade no recorte", "Nenhuma oportunidade criada no período e filtros escolhidos.") : `
        <div class="dual__kpis">
          ${mini("dc-open", "Oportunidades abertas", unitTag("count", "qtd"), cm.openCount, "int", `${F.int(cm.population)} criadas no período`, "opp_open", CH.spark(trend))}
          ${mini("dc-pipe", "Pipeline aberto", unitTag("pipeline", "R$ pipeline"), cm.pipeline, "brlc", "soma do valor atual das abertas", "opp_open")}
          ${mini("dc-won", "Ganhas", unitTag("won", "R$ venda ganha"), cm.wonCount, "int", `${F.brlc(cm.wonAmount)} em venda ganha`, "opp_won")}
          ${mini("dc-conv", "Conversão", unitTag("count", "%"), cm.conversion == null ? null : cm.conversion * 100, "int", cm.conversion == null ? "sem negócios concluídos" : `${cm.wonCount} ganhas de ${cm.wonCount + cm.lostCount} concluídas`, "opp_closed", "", "%")}
        </div>
        <p class="h3" style="margin:14px 0 6px">Abertas por etapa <span class="dim mono" style="font-size:10px;letter-spacing:.1em">· QTD</span></p>
        ${CH.funnel(byStage.map(s => ({ ...s, text: F.int(s.v) })), { k: "dc-f", drill: "opp_stage" })}`)}
      </div>
      <div class="cp__foot" style="display:flex;flex-wrap:wrap;gap:8px 16px"><a href="${V.href("/bi/comercial", V.carry(q))}">${icon("chart")} Abrir no BI · Comercial com este recorte</a></div>
    </section>`;
  }
  function mini(k, label, unit, v, f, sub, drill, extra = "", suffix = "") {
    const text = v == null ? "—" : f === "brlc" ? F.brlc(v) : F.int(v) + suffix;
    return `<button type="button" class="mini kpi" data-drill="${drill}" aria-label="${esc(label)}: ${esc(text)}. ${esc(sub)}. Abrir registros" style="--k:transparent">
      <span class="mini__l"><span>${label}</span>${unit}</span>
      <span class="mini__v" ${v == null ? "" : `data-k="${k}" data-v="${v}" data-f="${f}"`}>${text}</span><span class="mini__s">${sub}</span>${extra}<span class="kpi__was" aria-hidden="true"></span></button>`;
  }

  function operational(q) {
    const ops = M.ops(q), active = ops.filter(o => M.ACTIVE.includes(o.state));
    const n = s => ops.filter(o => o.state === s);
    const lc = (s) => { const l = n(s), d = L.lc[s]; return `<button type="button" class="lc" data-tone="${s}" data-drill="ops_state" data-dv="${s}" aria-label="${esc(d.label)}: ${l.length} operações. Abrir registros">
      ${d.pending ? `<span class="lc__tag"><span class="jv-x-source" data-s="lifecycle" title="Depende do Lifecycle · ${d.pending}">${icon("workflow")}Lifecycle</span></span>` : ""}
      <span class="lc__step">${d.step}</span><span class="lc__name"><span class="lc__ico">${icon(C.LC_ICON[s])}</span>${esc(d.label)}</span>
      <span class="lc__v" data-k="lc-${s}" data-v="${l.length}" data-f="int">${F.int(l.length)}</span>
      <span class="lc__s">${F.brlc(l.reduce((a, o) => a + o.equipmentValue, 0))} equip.</span></button>`; };
    return `<section class="jv-panel dual__side cp" data-panel="dash-ops" aria-labelledby="do-t"><div class="cp__scan" aria-hidden="true"></div>
      <div class="dual__head"><div><p class="jv-eyebrow">Operação · unidade: operação</p><h2 class="jv-h2" id="do-t">Resumo operacional</h2>
        <p class="cp__q">Onde estão as operações agora e quanto valor de equipamento está em cada etapa?</p></div>${sourceTag("canonical")}</div>
      <dl class="cp__meta"><div><dt>Período</dt><dd>Situação atual · sem recorte de data</dd></div><div><dt>Filtros</dt><dd>${V.filterText(q, ["branch", "seller"])}</dd></div><div><dt>Valor</dt><dd>${unitTag("equipment", "R$ equipamento")} não é financiamento nem faturamento</dd></div></dl>
      <div class="cp__body">${scenarioBody("canonical", () => ops.length === 0 ? C.state("empty", "Nenhuma operação no seu escopo", "Quando houver operações, a distribuição por etapa aparece aqui.") : `
        <div class="pulse">
          ${CH.ring(M.ACTIVE.map(s => ({ id: s, label: L.lc[s].label, v: n(s).length, color: STAGE_COLORS[s] })), { k: "ring-active", center: "operações em andamento", drill: "ops_state", unit: "operações", label: "Operações em andamento por etapa" })}
          <div class="lc-strip lc-strip--2">${M.ACTIVE.map(lc).join("")}</div>
        </div>
        <p class="h3" style="margin:14px 0 0">Terminais</p><div class="lc-terms">${["closed", "cancelled", "credit_rejected"].map(lc).join("")}</div>`)}
      </div>
      <div class="cp__foot" style="display:flex;flex-wrap:wrap;gap:8px 16px"><a href="${V.href("/fora", V.carry(q, { tela: "centro-operacoes", estado: "em-andamento" }))}">${icon("archive")} Abrir Centro de Operações com este recorte</a><a href="${V.href("/bi/operacoes", V.carry(q))}">${icon("chart")} BI · Operações e Crédito</a></div>
    </section>`;
  }

  function creditPanel(q) {
    const cr = M.credit(q);
    const catLabel = { ALL: "Todas as decisões", FULL: "Aprovadas integralmente", PARTIAL: "Aprovadas parcialmente", REJECTED: "Reprovadas" }[cr.cat];
    const seg = ["ALL", "FULL", "PARTIAL", "REJECTED"].map(c => `<button type="button" data-q="cat" data-v="${c === "ALL" ? "" : c}" aria-pressed="${cr.cat === c}">${{ ALL: "Todas", FULL: "Integral", PARTIAL: "Parcial", REJECTED: "Reprovadas" }[c]}</button>`).join("");
    const share = cr.decided.length ? cr.sel.length / cr.decided.length : null;
    const body = () => cr.decided.length === 0 ? C.state("empty", "Nenhuma decisão no período", "Nenhuma operação criada no período teve decisão de crédito consolidada.") : `
      <div class="credit">
        <div class="credit__block" style="text-align:center"><h3>Taxa geral do período</h3>
          <div class="gauge">${CH ? C.gauge(cr.rate, "gauge-rate") : ""}<div class="gauge__v"><b data-k="rate" data-v="${(cr.rate || 0) * 100}" data-f="int">${F.pct(cr.rate)}</b></div></div>
          <p class="ratio" style="justify-content:center"><span class="of">${F.int(cr.approved.length)} aprovadas de ${F.int(cr.decided.length)} decididas</span></p>
          <p class="dim" style="margin:0;font-size:11.5px">Operações criadas de ${cr.range.label}</p></div>
        <div class="stack-v">
          <div class="credit__block credit__sel"><div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:center"><h3>Categoria selecionada · ${catLabel}</h3><div class="jv-seg" role="group" aria-label="Categoria de decisão">${seg}</div></div>
            <div class="ratio"><b data-k="cat-n" data-v="${cr.sel.length}" data-f="int">${F.int(cr.sel.length)}</b><span class="of">de ${F.int(cr.decided.length)} decisões</span><span>· ${F.pct(share)} do denominador</span></div>
            ${C.stackBar([{ id: "sel", label: catLabel, v: cr.sel.length, color: "var(--jv-violet)" }, { id: "rest", label: "Demais decisões", v: cr.decided.length - cr.sel.length, color: "var(--jv-bg-2)" }], "cat")}
            <p class="dim" style="margin:8px 0 0;font-size:11.5px">A categoria muda só este bloco e o detalhamento. A taxa geral ao lado continua ${F.pct(cr.rate)}.</p>
            <button type="button" class="linkbtn" style="margin-top:6px;font-size:12px" data-drill="credit_sel">${icon("arrow")} Ver as ${F.int(cr.sel.length)} operações desta categoria</button></div>
          <div class="credit__block"><h3>Como foram aprovadas</h3>
            ${C.bars([["BANK_FULL", "Bancária integral"], ["BANK_PARTIAL", "Bancária parcial"], ["INTERNAL_FULL", "Interna integral"], ["INTERNAL_PARTIAL", "Interna parcial"]].map(([id, l]) => ({ id, label: l, v: cr.cats[id], text: F.int(cr.cats[id]), color: id.endsWith("FULL") ? "var(--jv-good)" : "var(--jv-teal)" })), { k: "cats", drill: "credit_cat" })}</div>
        </div>
      </div>
      <div class="out"><span class="recorte__label">Fora do cálculo</span><span class="jv-pill">${icon("clock")}${plural(cr.pending.length, "pendente de decisão", "pendentes de decisão")}</span><span class="jv-pill">${icon("ban")}${plural(cr.cancelled.length, "cancelada", "canceladas")}</span><span class="dim">Cada operação conta uma vez, pela decisão consolidada.</span></div>`;
    return panel({ id: "dash-credit", title: "Decisões de crédito", q: "Quantas operações decididas foram aprovadas, e como se compõe a categoria que estou olhando?", unit: "operação decidida", period: V.periodText(q), basis: "criação da operação", filters: V.filterText(q, KEYS), source: "canonical", sourceId: "OPERATION_DECIDED_APPROVAL_V2", body: scenarioBody("canonical", body), hud: true });
  }
  const plural = C.plural;

  function pendingPanel(q) {
    const p = M.pendings(q), tab = q.ptab || "overdue";
    const tabs = [["overdue", "Vencidas", p.overdue.length], ["today", "Hoje", p.today.length], ["week", "Próximas", p.week.length], ["none", "Sem prazo", p.none.length]];
    const list = p[tab].slice(0, 6);
    const docsInfo = M.docs(q), banksPending = M.ops(q).reduce((s, o) => s + o.banks.filter(l => l.current === "PENDING").length, 0);
    const body = () => `<div class="jv-seg" role="tablist" aria-label="Prazo">${tabs.map(([id, l, n]) => `<button type="button" role="tab" data-q="ptab" data-v="${id}" aria-selected="${tab === id}">${l}<span class="count">${n}</span></button>`).join("")}</div>
      ${list.length ? `<ul class="list" style="margin-top:8px">${list.map(it => `<li><span class="attn__icon" style="--a:${tab === "overdue" ? "var(--jv-crit)" : tab === "today" ? "var(--jv-warn)" : "var(--jv-fg-3)"};color:var(--a)">${icon(it.type === "DOCUMENT" ? "doc" : it.type === "BANK_RETURN" ? "bank" : it.type === "SIGNATURE" ? "file" : "users")}</span>
        <div class="list__main"><div class="list__title">${esc(it.title)}</div><div class="list__sub"><span class="mono">${it.operation}</span> · ${esc(L.seller[it.seller].label)}</div></div>
        <div class="list__right"><span class="due" data-k="${tab}">${it.dueAt ? F.dt(it.dueAt) : "sem prazo"}</span></div></li>`).join("")}</ul>` : C.state("empty", "Nenhuma pendência nesta aba", "Pendências registradas aparecem aqui conforme o prazo.")}
      ${p[tab].length > 6 ? `<button type="button" class="linkbtn" style="font-size:12px" data-drill="pend_${tab}">${icon("arrow")} Ver as ${p[tab].length} pendências</button>` : ""}
      <div class="grid g2" style="margin-top:12px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))">
        <a class="mini" style="text-decoration:none" href="${V.href("/bi/documentacao", V.carry(q))}"><span class="mini__l"><span>Checklist documental</span>${unitTag("count", "requisitos")}</span><span class="mini__v">${F.int(docsInfo.missing)}</span><span class="mini__s">faltantes em ${new Set(docsInfo.rows.filter(r => r.state === "MISSING").map(r => r.op.id)).size} operações · outra visão</span></a>
        <a class="mini" style="text-decoration:none" href="${V.href("/bi/operacoes", V.carry(q, { ivw: "current" }))}"><span class="mini__l"><span>Tentativas bancárias</span>${unitTag("count", "vínculos")}</span><span class="mini__v">${F.int(banksPending)}</span><span class="mini__s">vínculos em Pendente · outra visão</span></a>
      </div>`;
    return panel({ id: "dash-pend", title: "Pendências registradas", q: "O que venceu, o que vence hoje e o que vem a seguir?", unit: "pendência registrada na operação", period: "Situação atual · prazo comparado a hoje (São Paulo)", filters: V.filterText(q, ["branch", "seller"]), source: "canonical", sourceId: "irmen_dashboard_registered_pending", body: scenarioBody("canonical", body), foot: "Visão própria: não é o checklist documental nem as tentativas bancárias pendentes, que têm unidade e fonte diferentes." });
  }

  function activity(q) {
    const ops = M.ops(q); const ids = new Set(ops.map(o => o.id));
    const ev = (S.scenario === "empty" ? [] : D.events.filter(e => ids.has(e.operation))).slice(0, 7);
    const recent = [...ops].filter(o => M.ACTIVE.includes(o.state)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const color = s => ({ received: "var(--jv-stage-received)", in_review: "var(--jv-stage-review)", formalization: "var(--jv-stage-formalization)", billing: "var(--jv-stage-billing)", closed: "var(--jv-good)", cancelled: "var(--jv-x-stage-cancelled-hc)", credit_rejected: "var(--jv-crit)", bank_rejected: "var(--jv-crit)" }[s]);
    return `<div class="stack-v">
      ${panel({ id: "dash-queue", title: "Fila · operações em andamento", q: "Quais operações chegaram por último?", unit: "operação", period: "Situação atual", filters: V.filterText(q, ["branch", "seller"]), source: "canonical", body: scenarioBody("canonical", () => recent.length ? `<ul class="list">${recent.map(o => `<li><span class="jv-orb jv-orb--${o.state}" style="margin-top:5px"></span><div class="list__main"><div class="list__title">${esc(o.client)}</div><div class="list__sub"><span class="mono">${o.id}</span> · ${esc(o.equipment)}</div></div><div class="list__right">${lcChip(o.state)}<span>${unitTag("equipment", "R$ equip.")} ${F.brl(o.equipmentValue)}</span></div></li>`).join("")}</ul>` : C.state("empty", "Fila vazia", "Nenhuma operação em andamento no seu escopo.")) })}
      ${panel({ id: "dash-activity", title: "Atividade recente", q: "O que mudou nas operações que eu acompanho?", unit: "fato registrado na operação", period: "Últimos registros", filters: V.filterText(q, ["branch", "seller"]), source: "canonical", body: scenarioBody("canonical", () => ev.length ? `<ol class="tl">${ev.map(e => `<li style="--o:${color(e.state)}"><time>${F.dt(e.at)}</time><b style="font-size:12.5px">${esc(e.title)}</b><div class="list__sub"><span class="mono">${e.operation}</span> · ${esc(e.actor)}</div></li>`).join("")}</ol>` : C.state("empty", "Sem atividade recente", "Nenhum fato registrado no recorte.")) })}
    </div>`;
  }
  function pendingIntegrations() {
    const dep = (title, unit, id, text) => `<div class="dep"><span class="kpi__label"><span>${title}</span>${unit}</span><span class="dep__v">—</span><p>${text}</p><span class="dep__id">${id}</span></div>`;
    return `<section class="section" aria-labelledby="dep-t"><div class="section__title"><p class="jv-eyebrow" id="dep-t">Aguardando integração · sem número até haver fonte</p></div>
      <div class="grid g3">${dep("Meta do período", unitTag("billed", "R$ meta"), "DASH-INT-03", "Metas versionadas por perfil, calendário de dias úteis e projeção no servidor.")}
      ${dep("Faturado no período", unitTag("billed", "R$ faturados"), "DASH-INT-04 · FAT-DEP-01", "Fatos de faturamento fiscal por item. Aprovação e pedido não contam como faturado.")}
      ${dep("Volume financiado", unitTag("received", "R$ financiado"), "DASH-INT-12", "Fatos de desembolso e condições contratadas. Valor de equipamento não é volume financiado.")}</div></section>`;
  }

  function content(q) {
    return `${attention(q)}
      <section class="section"><div class="section__title"><p class="jv-eyebrow">Resumo</p></div><div class="dual">${commercial(q)}${operational(q)}</div></section>
      <section class="section">${creditPanel(q)}</section>
      <section class="section"><div class="grid split-6-4">${pendingPanel(q)}${activity(q)}</div></section>
      ${pendingIntegrations()}`;
  }
  window.VIEW_DASH = { keys: KEYS, local: ["cat", "ptab"], head, recorte, content, eyebrow: "Operação", name: "Dashboard" };
})();
