/* BI · "Por que os resultados mudaram". Quatro visões, cada uma com a sua unidade explícita. */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV, CH = window.IRCH;
  const { D, L, F, esc, icon, panel, kpi, lcChip, oppChip, bsChip, unitTag, sourceTag, scenarioBody, S } = C;
  const TABS = [
    { id: "comercial", label: "Comercial", unit: "Unidade: oportunidade", keys: ["period", "branch", "seller", "modality"] },
    { id: "operacoes", label: "Operações e Crédito", unit: "Unidade: operação · vínculo com banco", keys: ["period", "branch", "seller", "modality", "bank"] },
    { id: "documentacao", label: "Documentação", unit: "Unidade: requisito por operação", keys: ["branch", "seller", "bank"] },
    { id: "faturamento", label: "Faturamento", unit: "Unidade: evento operacional", keys: ["branch", "seller"] }
  ];
  const tabOf = (path) => TABS.find(t => path.endsWith("/" + t.id)) || TABS[0];
  const STAGE_COLORS = { received: "var(--jv-stage-received)", in_review: "var(--jv-stage-review)", formalization: "var(--jv-stage-formalization)", billing: "var(--jv-stage-billing)", closed: "var(--jv-good)", cancelled: "var(--jv-x-stage-cancelled-hc)", credit_rejected: "var(--jv-crit)" };
  const BS_COLORS = { PENDING: "var(--jv-warn)", RECEIVED: "var(--jv-indigo)", IN_REVIEW: "var(--jv-arc)", APPROVED: "var(--jv-good)", CONDITIONAL: "var(--jv-teal)", REJECTED: "var(--jv-crit)", INELIGIBLE: "var(--jv-fg-3)", DISBURSED: "var(--jv-violet)" };

  function head(q, path) {
    const t = tabOf(path);
    return `<div class="hero"><div class="hero__row"><div><p class="jv-eyebrow">Análise · BI</p><h1 class="jv-h1">Por que os resultados mudaram</h1>
      <p class="jv-lead">Cada visão tem a sua unidade. Clique em qualquer número, barra ou ponto para abrir os registros que o compõem, no mesmo recorte.</p></div>
      <div class="page-head__actions"><span class="jv-pill jv-pill--good"><span class="dot"></span>Dados de ${F.dt(S.lastUpdate.toISOString())}</span></div></div></div>
      <nav class="bi-tabs" aria-label="Visões do BI">${TABS.map(x => `<a class="bi-tab" href="${V.href("/bi/" + x.id, V.carry(q))}" ${x.id === t.id ? 'aria-current="page"' : ""}><b>${x.label}</b><small>${x.unit}</small></a>`).join("")}</nav>`;
  }
  const recorte = (q, path) => {
    const t = tabOf(path);
    const base = { comercial: ["Base de data: criação da oportunidade"], operacoes: ["Estado atual; séries usam data da decisão"], documentacao: ["Situação atual do checklist"], faturamento: ["Período próprio em cada painel"] }[t.id];
    return V.recorte(q, t.keys, { base });
  };

  // ---------------- Comercial ----------------
  function comercial(q) {
    const keys = TABS[0].keys, list = M.opps(q), cm = M.commercialMetrics(list), ft = V.filterText(q, keys), per = V.periodText(q);
    const trend = M.months(6).map(m => M.opps({ ...q, period: "all" }).filter(o => C.monthKey(o.createdAt) === m && o.status === "OPEN").length);
    const kp = scenarioBody("canonical", () => `<div class="kpis">
      ${kpi({ k: "c-pipe", label: "Pipeline aberto", unit: unitTag("pipeline", "R$ pipeline"), v: cm.pipeline, f: "brlc", text: F.brlc(cm.pipeline), sub: `valor atual de ${F.int(cm.openCount)} abertas`, drill: "opp_open", color: "var(--jv-x-money-pipeline)" })}
      ${kpi({ k: "c-open", label: "Oportunidades abertas", unit: unitTag("count", "qtd"), v: cm.openCount, text: F.int(cm.openCount), sub: `de ${F.int(cm.population)} criadas`, ctx: CH.spark(trend), drill: "opp_open" })}
      ${kpi({ k: "c-won", label: "Venda ganha", unit: unitTag("won", "R$ venda ganha"), v: cm.wonAmount, f: "brlc", text: F.brlc(cm.wonAmount), sub: `${F.int(cm.wonCount)} ganhas · operação encerrada`, drill: "opp_won", color: "var(--jv-x-money-won)" })}
      ${kpi({ k: "c-lost", label: "Perdidas", unit: unitTag("count", "qtd"), v: cm.lostCount, text: F.int(cm.lostCount), sub: `${list.filter(o => o.status === "LOST" && o.lossReason === "CREDIT").length} por crédito / restrição`, drill: "opp_lost", color: "var(--jv-warn)" })}
      ${kpi({ k: "c-conv", label: "Conversão", unit: unitTag("count", "%"), v: cm.conversion == null ? null : cm.conversion * 100, f: "int", text: F.pct(cm.conversion), sub: cm.conversion == null ? "sem negócios concluídos" : `${cm.wonCount} ganhas ÷ ${cm.wonCount + cm.lostCount} concluídas`, drill: "opp_closed", color: "var(--jv-violet)" })}
      ${kpi({ k: "c-age", label: "Tempo médio em aberto", unit: unitTag("count", "dias"), v: cm.avgAge, f: "dec1", text: cm.avgAge == null ? "—" : F.dec1(cm.avgAge) + " dias", sub: "desde a criação das abertas", drill: "opp_open" })}
    </div>`);
    const linked = cm.open.filter(o => o.operation);
    const concepts = `<div class="three" style="margin-top:14px">
      <div class="concept"><h3>${oppChip("OPEN")}</h3><p>Pode virar venda. Conta no pipeline.</p><dl><dt>Agora</dt><dd><b>${F.int(cm.openCount)}</b> · ${F.brlc(cm.pipeline)} ${unitTag("pipeline", "R$ pipeline")}</dd><dt>Data</dt><dd>criação da oportunidade</dd></dl></div>
      <div class="concept"><h3>${oppChip("WON")}</h3><p>Negócio fechado com operação encerrada. Não é faturamento fiscal.</p><dl><dt>Agora</dt><dd><b>${F.int(cm.wonCount)}</b> · ${F.brlc(cm.wonAmount)} ${unitTag("won", "R$ venda ganha")}</dd><dt>Data</dt><dd>encerramento comercial</dd></dl></div>
      <div class="concept"><h3>${lcChip("in_review")}</h3><p>Operação em andamento na Mesa. Uma oportunidade aberta pode já ter operação.</p><dl><dt>Agora</dt><dd><b>${F.int(linked.length)}</b> das abertas já têm operação</dd><dt>Data</dt><dd>evento operacional</dd></dl></div>
    </div>`;
    const pm = q.pm === "amount" ? "amount" : "count";
    const stages = D.STAGES.map(s => { const l = cm.open.filter(o => o.stage === s.id), amt = l.reduce((a, o) => a + o.amount, 0); return { id: s.id, label: s.label, v: pm === "amount" ? amt : l.length, text: pm === "amount" ? F.brlc(amt) : F.int(l.length), sub: pm === "amount" ? plural(l.length, "oportunidade", "oportunidades") : F.brlc(amt) }; });
    const dist = q.dist || "modality";
    const dimList = dist === "seller" ? D.SELLERS : dist === "branch" ? D.BRANCHES : D.MODALITIES;
    const distItems = dimList.map(d => { const l = cm.open.filter(o => o[dist] === d.id), amt = l.reduce((a, o) => a + o.amount, 0); return { id: d.id, label: d.label, v: amt, text: F.brlc(amt), sub: plural(l.length, "oportunidade", "oportunidades") }; }).sort((a, b) => b.v - a.v);
    const monthsK = M.monthsInPeriod(q).length >= 3 ? M.monthsInPeriod(q) : M.months(3);
    const created = monthsK.map(m => ({ id: m, label: F.month(m), v: list.filter(o => C.monthKey(o.createdAt) === m).length }));
    const closed = M.oppsClosed(q);
    const closedG = monthsK.map(m => ({ id: m, label: F.month(m), v: { won: closed.filter(o => o.status === "WON" && C.monthKey(o.closedAt) === m).length, lost: closed.filter(o => o.status === "LOST" && C.monthKey(o.closedAt) === m).length } }));
    const lost = list.filter(o => o.status === "LOST");
    const reasons = D.LOSS_REASONS.map(r => ({ id: r.id, label: r.label, v: lost.filter(o => o.lossReason === r.id).length, color: r.id === "CREDIT" ? "var(--jv-warn)" : "var(--jv-fg-3)" })).map(x => ({ ...x, text: F.int(x.v) })).sort((a, b) => b.v - a.v);
    const ageB = [["0-15", 0, 15], ["16-30", 16, 30], ["31-60", 31, 60], ["61+", 61, 9999]].map(([id, a, b]) => { const l = cm.open.filter(o => { const d = (D.NOW - new Date(o.createdAt)) / 86400000; return d >= a && d <= b + .999; }); return { id, label: id === "61+" ? "Mais de 60 dias" : `${a} a ${b} dias`, v: l.length, text: F.int(l.length), sub: F.brlc(l.reduce((s, o) => s + o.amount, 0)), color: id === "61+" ? "var(--jv-warn)" : "var(--jv-arc)" }; });
    const flowNodes = [
      { id: "created", label: "Criadas", col: 0, color: "var(--jv-arc)" },
      { id: "open", label: "Abertas", col: 1, color: "var(--jv-arc)", dv: "OPEN" }, { id: "won", label: "Ganhas", col: 1, color: "var(--jv-good)", dv: "WON" }, { id: "lost", label: "Perdidas", col: 1, color: "var(--jv-warn)", dv: "LOST" },
      { id: "nop", label: "Sem operação", col: 2, color: "var(--jv-fg-3)" }, { id: "opact", label: "Operação em andamento", col: 2, color: "var(--jv-stage-review)" }, { id: "opclosed", label: "Operação encerrada", col: 2, color: "var(--jv-good)" }, { id: "opterm", label: "Cancelada ou reprovada", col: 2, color: "var(--jv-crit)" }
    ];
    const opOf = o => o.operation ? D.operations.find(x => x.id === o.operation) : null;
    const cnt = f => list.filter(f).length;
    const flowLinks = [
      { s: "created", t: "open", v: cm.openCount, colorBy: "t", dv: "OPEN" }, { s: "created", t: "won", v: cm.wonCount, colorBy: "t", dv: "WON" }, { s: "created", t: "lost", v: cm.lostCount, colorBy: "t", dv: "LOST" },
      { s: "open", t: "nop", v: cnt(o => o.status === "OPEN" && !o.operation) }, { s: "open", t: "opact", v: cnt(o => o.status === "OPEN" && opOf(o) && M.ACTIVE.includes(opOf(o).state)) },
      { s: "won", t: "opclosed", v: cnt(o => o.status === "WON") },
      { s: "lost", t: "nop", v: cnt(o => o.status === "LOST" && !o.operation) }, { s: "lost", t: "opterm", v: cnt(o => o.status === "LOST" && o.operation) }
    ];
    const page = Math.max(1, +(q.pg || 1)), per20 = 10, sorted = [...list].sort((a, b) => q.sort === "amount" ? b.amount - a.amount : b.createdAt.localeCompare(a.createdAt)), rows = sorted.slice((page - 1) * per20, page * per20), pages = Math.max(1, Math.ceil(list.length / per20));
    return `<div class="unitbar">${icon("target")}<b>Unidade desta visão: oportunidade comercial.</b><span>Operações sem oportunidade vinculada não entram aqui. Valores em ${unitTag("pipeline", "R$ pipeline")} e ${unitTag("won", "R$ venda ganha")} nunca se misturam.</span><a href="${V.href("/bi/operacoes", V.carry(q))}">Consultar operações →</a></div>
      ${kp}${S.scenario === "normal" || S.scenario === "slow" || S.scenario === "empty" ? concepts : ""}
      <div class="grid g2 section">
        ${panel({ id: "c-flow", title: "Do pipeline à operação", q: "Para onde foram as oportunidades criadas no período?", unit: "oportunidade", period: per, basis: "criação da oportunidade", filters: ft, source: "canonical", body: scenarioBody("canonical", () => cm.population ? CH.flow(flowNodes, flowLinks, { drill: "opp_status", unit: "oportunidades", label: "Fluxo das oportunidades criadas até a operação", h: 250 }) : C.state("empty", "Nenhuma oportunidade criada no período", "Amplie o período ou limpe os filtros.", `<button class="ds-button ds-button--sm" data-act="clear">Limpar recorte</button>`)), foot: "A coluna da direita mostra a operação vinculada, quando existe. Uma oportunidade ganha não é faturamento." })}
        ${panel({ id: "c-stage", title: "Pipeline por etapa", q: "Em que etapa está o pipeline aberto?", unit: pm === "amount" ? "R$ pipeline (valor atual)" : "oportunidade aberta", period: per, basis: "criação da oportunidade", filters: ft, source: "canonical", tools: `<div class="jv-seg" role="group" aria-label="Medida"><button type="button" data-q="pm" data-v="" aria-pressed="${pm === "count"}">Qtd</button><button type="button" data-q="pm" data-v="amount" aria-pressed="${pm === "amount"}">R$</button></div>`, body: scenarioBody("canonical", () => cm.openCount ? CH.funnel(stages.map(s => ({ ...s, color: "var(--jv-x-money-pipeline)" })), { k: "c-st", drill: "opp_stage", f: pm === "amount" ? "brlc" : "int" }) : C.state("empty", "Sem oportunidades abertas", "Nenhuma oportunidade aberta no recorte.")) })}
      </div>
      <div class="grid g2 section">
        ${panel({ id: "c-created", title: "Novas oportunidades por mês", q: "O volume de entrada está crescendo?", unit: "oportunidade criada", period: per, basis: "<span class=\"hl\">data de criação</span>", filters: ft, source: "canonical", body: scenarioBody("canonical", () => CH.area(created, { drill: "opp_created_month", unit: "oportunidades", label: "Oportunidades criadas por mês" })) })}
        ${panel({ id: "c-closed", title: "Ganhos e perdas por mês", q: "Quando os negócios foram decididos?", unit: "oportunidade encerrada", period: per, basis: "<span class=\"hl\">data de encerramento</span> (ganho ou perda)", filters: ft, source: "proposal", sourceId: "BI-DEP-03", body: C.cols(closedG, [{ id: "won", label: "Ganhas", color: "var(--jv-good)" }, { id: "lost", label: "Perdidas", color: "var(--jv-warn)" }], { k: "c-cl", drill: "opp_closed_month" }), foot: "Proposta: a base atual só filtra por criação. Esta série depende de período por data de decisão (BI-DEP-03)." })}
      </div>
      <div class="grid g2 section">
        ${panel({ id: "c-dist", title: "Distribuição do pipeline", q: "Quem e qual modalidade concentram o pipeline aberto?", unit: "R$ pipeline", period: per, basis: "criação da oportunidade", filters: ft, source: "canonical", tools: `<div class="jv-seg" role="group" aria-label="Dimensão">${[["modality", "Modalidade"], ["seller", "Vendedor"], ["branch", "Filial"]].map(([id, l]) => `<button type="button" data-q="dist" data-v="${id === "modality" ? "" : id}" aria-pressed="${dist === id}">${l}</button>`).join("")}</div>`, body: scenarioBody("canonical", () => cm.openCount ? C.bars(distItems, { k: "c-d-" + dist, drill: "opp_dim_" + dist, f: "brlc", color: "var(--jv-x-money-pipeline)" }) : C.state("empty", "Sem pipeline aberto", "Nenhuma oportunidade aberta no recorte.")) })}
        ${panel({ id: "c-loss", title: "Motivos das perdas", q: "Por que perdemos?", unit: "oportunidade perdida", period: per, basis: "criação da oportunidade", filters: ft, source: "canonical", body: scenarioBody("canonical", () => lost.length ? C.bars(reasons, { k: "c-lr", drill: "opp_loss" }) + `<p class="dim" style="font-size:11.5px;margin:10px 0 0">${icon("info")} "Crédito / restrição" é motivo de <b>perda comercial</b> (unidade: oportunidade). Não é o mesmo que <a href="${V.href("/bi/operacoes", V.carry(q, { focus: "leituras" }))}">operação reprovada por crédito ou decisão de banco</a>.</p>` : C.state("empty", "Nenhuma perda no recorte", "Sem oportunidades perdidas no período.")) })}
      </div>
      <div class="grid g2 section">
        ${panel({ id: "c-age", title: "Idade do pipeline aberto", q: "O pipeline está envelhecendo?", unit: "oportunidade aberta", period: "Situação atual das abertas do recorte", basis: "dias desde a criação", filters: ft, source: "proposal", sourceId: "BI-P-04", body: C.bars(ageB, { k: "c-ab", drill: "opp_age" }), foot: "Proposta: faixas de idade derivadas da mesma fonte; exige aprovação da métrica." })}
        ${panel({ id: "c-why", title: "O que mudou neste recorte", q: "Qual dimensão mais explica a diferença?", unit: "R$ pipeline", period: per, filters: ft, source: "proposal", sourceId: "BI-P-05", body: whyChanged(q, cm), foot: "Proposta: comparação com o período anterior de mesmo tamanho. Depende de leitura histórica (BI-DEP-03)." })}
      </div>
      <section class="section">${panel({ id: "c-detail", title: "Detalhamento das oportunidades", q: "Quais oportunidades compõem estes números?", unit: "oportunidade · 1 linha por oportunidade", period: per, basis: "criação da oportunidade", filters: ft, source: "canonical",
        tools: `<label class="jv-field" style="flex-direction:row;align-items:center;gap:6px"><span>Ordenar</span><select class="jv-select" data-q="sort"><option value="">Mais recentes</option><option value="amount" ${q.sort === "amount" ? "selected" : ""}>Maior valor</option></select></label><button type="button" class="ds-button ds-button--sm" data-act="csv-detail">${icon("download")}CSV</button>`,
        body: scenarioBody("canonical", () => list.length ? `<div class="tbl-wrap"><table class="tbl tbl--cards"><thead><tr><th>Oportunidade · cliente</th><th>Vendedor · filial</th><th>Etapa · resultado</th><th>Modalidade</th><th class="r">Valor atual</th><th>Criação</th><th>Operação vinculada</th></tr></thead><tbody>
          ${rows.map(o => { const op = opOf(o); return `<tr><td data-l="Oportunidade"><span class="code">${o.id}</span><span class="sub">${esc(o.client)}</span></td><td data-l="Vendedor">${esc(L.seller[o.seller].label)}<span class="sub">${esc(L.branch[o.branch].label)}</span></td><td data-l="Etapa">${esc(L.stage[o.stage].label)}<span class="sub">${oppChip(o.status)}${o.lossReason ? " " + esc(L.loss[o.lossReason].label) : ""}</span></td><td data-l="Modalidade">${esc(L.modality[o.modality].label)}</td><td data-l="Valor" class="r">${F.brl(o.amount)}<span class="sub">${o.status === "WON" ? "R$ venda ganha" : o.status === "OPEN" ? "R$ pipeline" : "fora do pipeline"}</span></td><td data-l="Criação">${F.date(o.createdAt)}</td><td data-l="Operação">${op ? `<span class="code">${op.id}</span><span class="sub">${lcChip(op.state)}</span>` : '<span class="dim">Sem operação vinculada</span>'}</td></tr>`; }).join("")}
          </tbody></table></div><div class="pager"><span>${F.int(list.length)} oportunidades no recorte · ${per20} por página</span><span><button class="ds-button ds-button--sm" data-q="pg" data-v="${page - 1}" ${page <= 1 ? "disabled" : ""}>Anterior</button> Página ${page} de ${pages} <button class="ds-button ds-button--sm" data-q="pg" data-v="${page + 1}" ${page >= pages ? "disabled" : ""}>Próxima</button></span></div>` : C.state("empty", "Nenhuma oportunidade encontrada", "Ajuste o período ou limpe os filtros.", `<button class="ds-button ds-button--sm" data-act="clear">Limpar recorte</button>`)) })}</section>`;
  }
  const plural = C.plural;
  function whyChanged(q, cm) {
    const r = C.periodRange(q.period || "90d"); if (!r.from) return C.state("empty", "Sem período anterior", "Com todo o histórico não há período anterior para comparar.");
    const days = (new Date(r.to) - new Date(r.from)) / 86400000 + 1; const prevTo = new Date(new Date(r.from).getTime() - 86400000), prevFrom = new Date(prevTo.getTime() - (days - 1) * 86400000);
    const d = M.dims(q); const prev = M.scoped(D.opportunities).filter(o => (!d.branch || o.branch === d.branch) && (!d.seller || o.seller === d.seller) && (!d.modality || o.modality === d.modality) && C.localDate(o.createdAt) >= prevFrom.toISOString().slice(0, 10) && C.localDate(o.createdAt) <= prevTo.toISOString().slice(0, 10));
    const pm = M.commercialMetrics(prev); const delta = cm.pipeline - pm.pipeline;
    const contrib = D.MODALITIES.map(m => ({ id: m.id, label: m.label, v: cm.open.filter(o => o.modality === m.id).reduce((s, o) => s + o.amount, 0) - pm.open.filter(o => o.modality === m.id).reduce((s, o) => s + o.amount, 0) }));
    const max = Math.max(1, ...contrib.map(c => Math.abs(c.v)));
    return `<div class="ratio"><b class="${delta >= 0 ? "" : ""}" style="color:${delta >= 0 ? "var(--jv-good)" : "var(--jv-warn)"}">${delta >= 0 ? "▲" : "▼"} ${F.brlc(Math.abs(delta))}</b><span>pipeline aberto vs. ${prevFrom.toLocaleDateString("pt-BR")} a ${prevTo.toLocaleDateString("pt-BR")} (${F.brlc(pm.pipeline)})</span></div>
      <div class="bars">${contrib.map(c => `<div class="bar" data-tip="${esc(c.label)}|${c.v >= 0 ? "+" : "−"}${F.brlc(Math.abs(c.v))}"><span class="bar__label">${esc(c.label)}</span><span class="bar__track" style="background:linear-gradient(90deg,transparent 49.5%,var(--jv-line-2) 49.5% 50.5%,transparent 50.5%),var(--jv-bg-2)"><span class="bar__fill" style="left:${c.v >= 0 ? 50 : 50 - (Math.abs(c.v) / max) * 50}%;width:${(Math.abs(c.v) / max) * 50}%;--b:${c.v >= 0 ? "var(--jv-good)" : "var(--jv-warn)"};border-radius:3px"></span></span><span class="bar__val">${c.v >= 0 ? "+" : "−"}${F.brlc(Math.abs(c.v))}</span></div>`).join("")}</div>`;
  }

  // ---------------- Operações e Crédito ----------------
  function operacoes(q) {
    const keys = TABS[1].keys, ft = V.filterText(q, keys), per = V.periodText(q);
    const all = M.ops(q), n = s => all.filter(o => o.state === s);
    const cr = M.credit(q);
    const active = all.filter(o => M.ACTIVE.includes(o.state));
    const kp = scenarioBody("canonical", () => `<div class="kpis">
      ${kpi({ k: "o-act", label: "Em andamento", unit: unitTag("count", "operações"), v: active.length, text: F.int(active.length), sub: `${F.brlc(active.reduce((s, o) => s + o.equipmentValue, 0))} em valor de equipamento`, drill: "ops_active" })}
      ${kpi({ k: "o-closed", label: "Encerradas", unit: unitTag("count", "operações"), v: n("closed").length, text: F.int(n("closed").length), sub: "situação atual", drill: "ops_state", dv: "closed", color: "var(--jv-good)" })}
      ${kpi({ k: "o-canc", label: "Canceladas", unit: unitTag("count", "operações"), v: n("cancelled").length, text: F.int(n("cancelled").length), sub: "situação atual", drill: "ops_state", dv: "cancelled", color: "var(--jv-x-stage-cancelled-hc)" })}
      ${kpi({ k: "o-rej", label: "Reprovadas por crédito", unit: `<span class="jv-x-source" data-s="lifecycle" title="Depende do Lifecycle · LC-DEP-01">${icon("workflow")}Lifecycle</span>`, v: n("credit_rejected").length, text: F.int(n("credit_rejected").length), sub: "novo estado terminal proposto", drill: "ops_state", dv: "credit_rejected", color: "var(--jv-crit)" })}
      ${kpi({ k: "o-rate", label: "Aprovação no período", unit: unitTag("count", "%"), v: (cr.rate || 0) * 100, text: F.pct(cr.rate), sub: `${cr.approved.length} aprovadas de ${cr.decided.length} decididas`, drill: "credit_sel", color: "var(--jv-violet)" })}
    </div>`);
    const residence = M.ACTIVE.map(s => { const l = n(s); const h = l.length ? l.reduce((a, o) => a + o.residenceHours, 0) / l.length : 0; return { id: s, label: L.lc[s].label, v: Math.round(h), text: l.length ? `${F.int(h)} h` : "—", sub: l.length ? `${F.dec1(h / 9)} dias úteis · ${plural(l.length, "operação", "operações")}` : "sem operações", color: STAGE_COLORS[s] }; });
    const decided = M.ops(q).filter(o => o.decidedAt && C.inRange(o.decidedAt, C.periodRange(q.period || "90d")));
    const mk = M.monthsInPeriod(q).length >= 3 ? M.monthsInPeriod(q) : M.months(3);
    const decG = mk.map(m => ({ id: m, label: F.month(m), v: { full: decided.filter(o => C.monthKey(o.decidedAt) === m && ["BANK_FULL", "INTERNAL_FULL"].includes(o.category)).length, partial: decided.filter(o => C.monthKey(o.decidedAt) === m && ["BANK_PARTIAL", "INTERNAL_PARTIAL"].includes(o.category)).length, rej: decided.filter(o => C.monthKey(o.decidedAt) === m && o.decision === "REJECTED").length } }));
    const ivw = q.ivw === "history" ? "history" : "current";
    const banks = D.BANKS.filter(b => !q.bank || b.id === q.bank).map(b => { const links = all.flatMap(o => o.banks.filter(l => l.bank === b.id).map(l => ({ ...l, op: o }))); return { b, links }; }).filter(x => x.links.length);
    const instBody = () => banks.length ? (ivw === "current" ? `<div>${banks.map(({ b, links }) => { const parts = D.BANK_STATES.map(s => ({ id: s.id, label: s.label, v: links.filter(l => l.current === s.id).length, color: BS_COLORS[s.id] })).filter(p => p.v); return `<div class="bankrow"><b>${esc(b.label)}</b><div>${C.stackBar(parts, "bk-" + b.id)}<div class="legend2" style="margin-top:6px">${parts.map(p => `<span><i style="--c:${p.color}"></i>${esc(p.label)} ${p.v}</span>`).join("")}</div></div><button type="button" class="linkbtn mono" data-drill="bank_links" data-dv="${b.id}" aria-label="${esc(b.label)}: ${links.length} vínculos. Abrir">${links.length} vínc.</button></div>`; }).join("")}</div><div class="legend" style="margin-top:6px">${D.BANK_STATES.map(s => `<span><i style="--c:${BS_COLORS[s.id]}"></i>${s.label}</span>`).join("")}</div>`
      : CH.flow(
        [{ id: "PENDING", label: "Pendente", col: 0, color: BS_COLORS.PENDING }, { id: "RECEIVED", label: "Recebida", col: 1, color: BS_COLORS.RECEIVED }, { id: "INELIGIBLE", label: "Inelegível", col: 1, color: BS_COLORS.INELIGIBLE }, { id: "IN_REVIEW", label: "Em análise", col: 2, color: BS_COLORS.IN_REVIEW }, { id: "APPROVED", label: "Aprovada", col: 3, color: BS_COLORS.APPROVED }, { id: "CONDITIONAL", label: "Aprovada c/ condições", col: 3, color: BS_COLORS.CONDITIONAL }, { id: "REJECTED", label: "Reprovada", col: 3, color: BS_COLORS.REJECTED }, { id: "DISBURSED", label: "Desembolsada", col: 4, color: BS_COLORS.DISBURSED }],
        (() => { const cnt = {}; banks.forEach(({ links }) => links.forEach(l => { for (let i = 1; i < l.transitions.length; i++) { const k = l.transitions[i - 1].to + ">" + l.transitions[i].to; cnt[k] = (cnt[k] || 0) + 1; } })); return Object.entries(cnt).map(([k, v]) => { const [s, t] = k.split(">"); return { s, t, v, colorBy: "t", dv: t }; }); })(),
        { drill: "bank_transition", unit: "transições", label: "Transições registradas entre estados dos vínculos bancários", w: 1000, h: 300 })) : C.state("empty", "Sem vínculos bancários no recorte", "Nenhuma operação do recorte foi enviada a instituição financeira.");
    // Caso didático: operação com decisões diferentes entre bancos.
    const sample = all.find(o => o.banks.some(l => l.current === "REJECTED") && o.banks.some(l => ["APPROVED", "DISBURSED", "CONDITIONAL"].includes(l.current)));
    const lostCredit = M.opps(q).filter(o => o.status === "LOST" && o.lossReason === "CREDIT");
    const rejLinks = all.reduce((s, o) => s + o.banks.filter(l => l.current === "REJECTED").length, 0);
    const leituras = `<div class="case">
      <div class="concept"><h3>${oppChip("LOST")} por crédito</h3><p>Perda <b>comercial</b> registrada no encerramento da oportunidade, com motivo "Crédito / restrição".</p><dl><dt>Unidade</dt><dd>oportunidade</dd><dt>Data</dt><dd>encerramento comercial</dd><dt>No recorte</dt><dd><button type="button" class="linkbtn" data-drill="opp_loss" data-dv="CREDIT"><b>${F.int(lostCredit.length)}</b> oportunidades</button></dd><dt>Fonte</dt><dd>${sourceTag("canonical")}</dd></dl></div>
      <div class="concept"><h3>${lcChip("credit_rejected")}</h3><p>Estado <b>terminal da operação</b> no Lifecycle. Toda a operação foi encerrada por crédito.</p><dl><dt>Unidade</dt><dd>operação</dd><dt>Data</dt><dd>transição de estado</dd><dt>No recorte</dt><dd><button type="button" class="linkbtn" data-drill="ops_state" data-dv="credit_rejected"><b>${F.int(n("credit_rejected").length)}</b> operações</button></dd><dt>Fonte</dt><dd>${sourceTag("lifecycle", "LC-DEP-01")}</dd></dl></div>
      <div class="concept"><h3>${bsChip("REJECTED")} por banco</h3><p>Decisão de <b>uma instituição</b> sobre um vínculo. Uma operação pode ter várias, com resultados diferentes.</p><dl><dt>Unidade</dt><dd>vínculo operação-banco</dd><dt>Data</dt><dd>transição do vínculo</dd><dt>No recorte</dt><dd><button type="button" class="linkbtn" data-drill="bank_state" data-dv="REJECTED"><b>${F.int(rejLinks)}</b> vínculos reprovados</button></dd><dt>Fonte</dt><dd>${sourceTag("canonical")}</dd></dl></div>
    </div>${sample ? `<div class="drawer__def" style="margin-top:12px">${icon("info")} Exemplo: <span class="mono">${sample.id}</span> tem ${sample.banks.map(l => `${esc(L.bank[l.bank].label)} ${bsChip(l.current)}`).join(" e ")}. A operação está ${lcChip(sample.state)}, não "reprovada": basta uma aprovação válida.</div>` : ""}`;
    return `<div class="unitbar">${icon("layers")}<b>Unidade: operação, pelo estado atual do Lifecycle.</b><span>Na visão por instituição a unidade muda para <b>vínculo operação-banco</b>: uma operação pode ter vários.</span></div>
      ${kp}
      <div class="grid g2 section">
        ${panel({ id: "o-stages", title: "Volume e etapas", q: "Onde estão as operações agora e com que valor de equipamento?", unit: "operação · " + unitTag("equipment", "R$ equipamento"), period: "Situação atual · sem recorte de data", filters: ft, source: "canonical", body: scenarioBody("canonical", () => all.length ? `<div class="pulse pulse--stack">${CH.ring(M.ACTIVE.map(s => ({ id: s, label: L.lc[s].label, v: n(s).length, color: STAGE_COLORS[s] })), { k: "o-ring", center: "em andamento", drill: "ops_state", unit: "operações" })}
            <div>${C.bars(M.ACTIVE.concat(["closed", "cancelled", "credit_rejected"]).map(s => { const l = n(s); return { id: s, label: L.lc[s].label, v: l.length, text: F.int(l.length), sub: F.brlc(l.reduce((a, o) => a + o.equipmentValue, 0)), color: STAGE_COLORS[s] }; }), { k: "o-st", drill: "ops_state" })}</div></div>` : C.state("empty", "Nenhuma operação no recorte", "Ajuste os filtros.")) })}
        ${panel({ id: "o-term", title: "Estados terminais", q: "Como distinguir encerramento, cancelamento e reprovação por crédito?", unit: "operação", period: "Situação atual", filters: ft, source: "lifecycle", sourceId: "LC-DEP-01", body: `<div class="lc-terms" style="margin-top:0">${["closed", "cancelled", "credit_rejected"].map(s => `<button type="button" class="lc" data-tone="${s}" data-drill="ops_state" data-dv="${s}"><span class="lc__step">${s === "closed" ? "Homologado" : "Proposta LC-UI-01"}</span><span class="lc__name"><span class="lc__ico">${icon(C.LC_ICON[s])}</span>${L.lc[s].label}</span><span class="lc__v" data-k="t-${s}" data-v="${n(s).length}" data-f="int">${F.int(n(s).length)}</span><span>${lcChip(s)}</span></button>`).join("")}</div>
          <ul class="list" style="margin-top:8px;font-size:12px"><li><span class="lc__ico" style="color:var(--jv-good)">${icon("check")}</span><div class="list__main"><b>Encerrada</b> mantém o padrão homologado: verde, ícone de conclusão.</div></li><li><span style="color:var(--jv-x-stage-cancelled-hc)">${icon("ban")}</span><div class="list__main"><b>Cancelada</b>: cinza de alto contraste, ícone de bloqueio. Legível sem cor (texto + ícone).</div></li><li><span style="color:var(--jv-crit)">${icon("shieldx")}</span><div class="list__main"><b>Reprovada por crédito</b>: vermelho crítico, escudo com X. Novo estado, depende da integração do Lifecycle.</div></li></ul>` })}
      </div>
      <div class="grid g2 section">
        ${panel({ id: "o-res", title: "Permanência por etapa", q: "Onde as operações demoram?", unit: "horas úteis (média da passagem atual)", period: "Situação atual", basis: "entrada na etapa", filters: ft, source: "canonical", sourceId: "dashboard-residence", body: scenarioBody("canonical", () => C.bars(residence, { k: "o-res", drill: "ops_state" })), foot: "Tempo factual de permanência. Não é apuração de SLA (DASH-INT-11)." })}
        ${panel({ id: "o-dec", title: "Decisões consolidadas por mês", q: "Quantas decisões saíram e com que resultado?", unit: "operação decidida", period: per, basis: "<span class=\"hl\">data da decisão</span>", filters: ft, source: "canonical", sourceId: "decisionDateView", body: scenarioBody("canonical", () => C.cols(decG, [{ id: "full", label: "Aprovada integral", color: "var(--jv-good)" }, { id: "partial", label: "Aprovada parcial", color: "var(--jv-teal)" }, { id: "rej", label: "Reprovada", color: "var(--jv-crit)" }], { k: "o-dec", drill: "credit_month" })) })}
      </div>
      <section class="section">${panel({ id: "o-inst", title: "Por instituição", q: ivw === "current" ? "Em que estado está cada vínculo agora?" : "Por quais estados os vínculos passaram?", unit: ivw === "current" ? "vínculo operação-banco (estado atual)" : "transição registrada (evento)", period: ivw === "current" ? "Situação atual" : "Todo o histórico dos vínculos do recorte", basis: ivw === "current" ? null : "data da transição", filters: ft, source: "canonical", sourceId: "outcomeFacts.banks",
        tools: `<div class="jv-seg" role="group" aria-label="Leitura"><button type="button" data-q="ivw" data-v="" aria-pressed="${ivw === "current"}">Estado atual</button><button type="button" data-q="ivw" data-v="history" aria-pressed="${ivw === "history"}">Histórico de transições</button></div>`,
        body: scenarioBody("canonical", instBody), foot: "Consultas e reavaliações de elegibilidade não contam como envio. Ausência de envio registrado não comprova que a proposta não chegou ao banco." })}</section>
      <section class="section" id="leituras">${panel({ id: "o-reads", title: "Três leituras de crédito", q: "Perdi por crédito, a operação foi reprovada ou um banco reprovou?", unit: "cada leitura tem a sua", period: per, filters: ft, source: "canonical", body: leituras, hud: true })}</section>`;
  }

  // ---------------- Documentação ----------------
  function documentacao(q) {
    const keys = TABS[2].keys, ft = V.filterText(q, keys.concat([])), d = M.docs(q), dtab = q.dtab === "history" ? "history" : "current";
    const all = M.ops(q).filter(o => M.ACTIVE.includes(o.state));
    const reqOpts = [["", "Todos os requisitos"], ...D.REQUIREMENTS.map(r => [r.id, r.label])];
    const localFilters = `<div class="recorte__row" style="margin-bottom:10px"><label class="jv-field" style="max-width:320px;flex:1 1 220px"><span>Requisito</span><select class="jv-select" data-q="req" data-active="${!!q.req}">${reqOpts.map(([id, l]) => `<option value="${id}" ${q.req === id ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
      <label class="jv-field" style="max-width:220px;flex:1 1 160px"><span>Etapa</span><select class="jv-select" data-q="dstage"><option value="">Em andamento</option><option value="all" ${q.dstage === "all" ? "selected" : ""}>Todas as operações</option></select></label></div>`;
    const parts = [{ id: "VALIDATED", label: "Validados", v: d.validated, color: "var(--jv-good)" }, { id: "RECEIVED", label: "Recebidos aguardando validação", v: d.received, color: "var(--jv-indigo)" }, { id: "WAIVED", label: "Dispensados", v: d.waived, color: "var(--jv-fg-3)" }, { id: "MISSING", label: "Faltantes", v: d.missing, color: "var(--jv-warn)" }];
    const cover = `${F.int(d.observable.length)} de ${F.int(d.list.length)} operações com checklist observável (${F.pct(d.list.length ? d.observable.length / d.list.length : null)})`;
    const kp = scenarioBody("canonical", () => `<div class="kpis">
      ${kpi({ k: "d-app", label: "Aplicáveis", unit: unitTag("count", "requisitos"), v: d.applicable, text: F.int(d.applicable), sub: `em ${F.int(d.observable.length)} operações`, drill: "doc_state", dv: "" })}
      ${parts.map(p => kpi({ k: "d-" + p.id, label: p.label, unit: unitTag("count", "requisitos"), v: p.v, text: F.int(p.v), sub: F.pct(d.applicable ? p.v / d.applicable : null) + " dos aplicáveis", drill: "doc_state", dv: p.id, color: p.color })).join("")}
      ${kpi({ k: "d-comp", label: "Checklists completos", unit: unitTag("count", "operações"), v: d.complete.length, text: F.int(d.complete.length), sub: `de ${F.int(d.observable.length)} observáveis`, drill: "doc_complete", color: "var(--jv-good)" })}
    </div>`);
    const perReq = D.REQUIREMENTS.filter(r => !q.req || r.id === q.req).map(r => { const rows = d.rows.filter(x => x.req === r.id); const c = s => rows.filter(x => x.state === s).length; return { r, rows, parts: parts.map(p => ({ ...p, v: c(p.id) })) }; }).filter(x => x.rows.length);
    const current = () => d.observable.length ? `${C.stackBar(parts, "d-all")}<div class="legend">${parts.map(p => `<span><i style="--c:${p.color}"></i>${p.label} · ${F.int(p.v)}</span>`).join("")}</div>
      <div class="tbl-wrap" style="margin-top:12px"><table class="tbl tbl--cards"><thead><tr><th>Requisito</th><th style="min-width:180px">Situação</th><th class="r">Aplicável</th><th class="r">Validado</th><th class="r">Aguardando</th><th class="r">Dispensado</th><th class="r">Faltante</th></tr></thead><tbody>
      ${perReq.map(x => `<tr><td data-l="Requisito"><button type="button" class="linkbtn" data-drill="doc_req" data-dv="${x.r.id}" style="text-align:left">${esc(x.r.label)}</button></td><td data-l="Situação">${C.stackBar(x.parts, "dr-" + x.r.id)}</td><td data-l="Aplicável" class="r">${x.rows.length}</td>${x.parts.map(p => `<td data-l="${p.label}" class="r" ${p.id === "MISSING" && p.v ? 'style="color:var(--jv-warn);font-weight:600"' : ""}>${p.v}</td>`).join("")}</tr>`).join("")}
      </tbody></table></div>` : C.state("empty", "Nenhum checklist observável no recorte", "As operações do recorte não têm checklist documental registrado.");
    const history = () => C.state("nosource", "Sem fonte para o histórico por requisito", "Entrega inicial e complementação pela Mesa não são registradas por requisito hoje. A visão aparece quando houver eventos de entrega por requisito (DOC-DEP-02). Nenhum número é estimado.");
    return `<div class="unitbar">${icon("doc")}<b>Unidade: requisito documental aplicável a uma operação.</b><span>Cobertura: ${cover}. Período observado: situação atual das operações ${q.dstage === "all" ? "de todos os estados" : "em andamento"}.</span></div>
      ${kp}
      <section class="section">${panel({ id: "d-main", title: "Situação do checklist", q: dtab === "current" ? "Quais requisitos faltam e onde a validação está parada?" : "O documento chegou na entrega inicial ou foi complementado pela Mesa?", unit: "requisito por operação", period: dtab === "current" ? "Situação atual · " + F.dt(S.lastUpdate.toISOString()) : "Histórico desde a criação da operação", filters: ft + (q.req ? " · " + esc(D.REQUIREMENTS.find(r => r.id === q.req).label) : ""), source: dtab === "current" ? "canonical" : "none", sourceId: dtab === "current" ? "checklist documental" : "DOC-DEP-02",
        tools: `<div class="jv-seg" role="group" aria-label="Leitura"><button type="button" data-q="dtab" data-v="" aria-pressed="${dtab === "current"}">Situação atual</button><button type="button" data-q="dtab" data-v="history" aria-pressed="${dtab === "history"}">Entrega inicial × Mesa</button></div>`,
        body: localFilters + (dtab === "current" ? scenarioBody("canonical", current) : history()), foot: "Filtros de requisito e etapa ficam junto deste painel porque só valem para ele. Completude não avalia a qualidade do documento." })}</section>`;
  }

  // ---------------- Faturamento ----------------
  function faturamento(q) {
    const keys = TABS[3].keys, ft = V.filterText(q, keys), bp = q.bp || "6m";
    const n = bp === "12m" ? 12 : bp === "3m" ? 3 : 6, mk = M.months(n);
    const entries = M.ops({ ...q, period: "all" }).filter(o => o.billingEnteredAt);
    const g = mk.map(m => { const l = entries.filter(o => C.monthKey(o.billingEnteredAt) === m); return { id: m, label: F.month(m), v: l.length }; });
    const total = g.reduce((s, x) => s + x.v, 0);
    const money = [
      ["pipeline", "R$ pipeline", "Valor atual das oportunidades abertas.", "BI Comercial", "canonical", "criação da oportunidade"],
      ["won", "R$ venda ganha", "Valor das oportunidades ganhas (operação encerrada).", "BI Comercial", "canonical", "encerramento comercial"],
      ["equipment", "R$ equipamento", "Valor de equipamento registrado na operação.", "Centro de Operações", "canonical", "situação atual"],
      ["billed", "R$ faturados", "Notas fiscais emitidas por item.", "FAT-DEP-01", "none", "emissão da NF"],
      ["received", "R$ recebidos", "Recebimentos conciliados.", "FAT-DEP-03", "none", "data do crédito"]
    ];
    const dep = (title, u, ul, id, src, per, text) => `<div class="dep"><span class="kpi__label"><span>${title}</span>${unitTag(u, ul)}</span><span class="dep__v">—</span><p>${text}</p><p class="dim" style="font-size:11px">Período: ${per}</p><span class="dep__id">${sourceTag("none", id)} · ${src}</span></div>`;
    return `<div class="unitbar">${icon("coins")}<b>Duas naturezas diferentes.</b><span>A entrada na etapa Faturamento é um <b>evento operacional</b>. Faturamento fiscal, máquinas faturadas, volume financiado, recebimento e metas são <b>integrações distintas</b>, cada uma com a sua fonte.</span></div>
      <div class="grid split-6-4">
        ${panel({ id: "f-entry", title: "Entrada na etapa Faturamento", q: "Quantas operações chegaram à etapa Faturamento a cada mês?", unit: "entrada na etapa (evento operacional)", period: `<span class="hl">Últimos ${n} meses</span> · período próprio deste painel`, basis: "<span class=\"hl\">data da transição</span>, independente da criação", filters: ft, source: "canonical", sourceId: "lifecycle transitions",
          tools: `<div class="jv-seg" role="group" aria-label="Período do painel">${[["3m", "3 m"], ["6m", "6 m"], ["12m", "12 m"]].map(([id, l]) => `<button type="button" data-q="bp" data-v="${id === "6m" ? "" : id}" aria-pressed="${bp === id}">${l}</button>`).join("")}</div>`,
          body: scenarioBody("canonical", () => `<div class="ratio"><b data-k="f-total" data-v="${total}" data-f="int">${F.int(total)}</b><span class="of">entradas em ${new Set(entries.filter(o => mk.includes(C.monthKey(o.billingEnteredAt))).map(o => o.id)).size} operações distintas</span></div>${CH.area(g, { drill: "billing_month", unit: "entradas", label: "Entradas na etapa Faturamento por mês", color: "var(--jv-teal)" })}`), foot: "Inclui retornos à etapa. Não representa nota fiscal, valor faturado nem recebimento." })}
        ${panel({ id: "f-money", title: "Qual R$ é qual", q: "Que valor estou olhando?", unit: "legenda de unidades monetárias", period: "—", filters: "não se aplica", source: "proposal", sourceId: "UNIT-01", body: `<ul class="list">${money.map(([u, l, t, src, s, per]) => `<li><span style="padding-top:2px">${unitTag(u, l)}</span><div class="list__main"><div class="list__title" style="font-weight:500">${t}</div><div class="list__sub">Data: ${per} · ${src}</div></div>${sourceTag(s)}</li>`).join("")}</ul>` })}
      </div>
      <section class="section"><div class="section__title"><p class="jv-eyebrow">Integrações pendentes · nenhum número até haver fonte canônica</p></div>
      <div class="grid g3">
        ${dep("Faturamento fiscal", "billed", "R$ faturados", "FAT-DEP-01", "ERP / fiscal", "data de emissão da NF", "Notas fiscais por item, com parciais e estornos.")}
        ${dep("Máquinas faturadas", "count", "qtd máquinas", "FAT-DEP-02", "ERP / fiscal", "data de emissão da NF", "Quantidade de equipamentos por nota, por série.")}
        ${dep("Volume financiado", "received", "R$ financiado", "DASH-INT-12", "instituição financeira", "data do desembolso", "Desembolsos e condições contratadas por vínculo.")}
        ${dep("Recebimento", "received", "R$ recebidos", "FAT-DEP-03", "financeiro / conciliação", "data do crédito", "Recebimentos conciliados por nota e parcela.")}
        ${dep("Metas", "billed", "R$ meta", "DASH-INT-03", "metas versionadas", "competência da meta", "Metas por perfil e período, com calendário de dias úteis.")}
      </div></section>`;
  }

  function content(q, path) { const t = tabOf(path); return { comercial, operacoes, documentacao, faturamento }[t.id](q); }
  window.VIEW_BI = { TABS, tabOf, head, recorte, content, keysFor: (path) => tabOf(path).keys, local: ["pm", "dist", "sort", "pg", "ivw", "req", "dstage", "dtab", "bp", "focus"], eyebrow: "Comercial", name: "BI comercial" };
})();
