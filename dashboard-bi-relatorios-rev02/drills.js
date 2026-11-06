/* Detalhamento: cada número clicável abre os registros que o compõem, no mesmo recorte da tela. */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV;
  const { D, L, F, esc, lcChip, oppChip, bsChip, unitTag } = C;
  const OPP = [
    { id: "id", label: "Oportunidade", html: o => `<span class="code">${o.id}</span><span class="sub">${esc(o.client)}</span>`, csv: o => o.id },
    { id: "client", label: "Cliente", hidden: true },
    { id: "seller", label: "Vendedor", html: o => esc(L.seller[o.seller].label), csv: o => L.seller[o.seller].label },
    { id: "stage", label: "Etapa · resultado", html: o => `${esc(L.stage[o.stage].label)}<span class="sub">${oppChip(o.status)}</span>`, csv: o => L.stage[o.stage].label + " / " + o.status },
    { id: "amount", label: "Valor atual", r: true, html: o => F.brl(o.amount), csv: o => o.amount },
    { id: "createdAt", label: "Criação", html: o => F.date(o.createdAt), csv: o => F.date(o.createdAt) },
    { id: "operation", label: "Operação", html: o => o.operation ? `<span class="code">${o.operation}</span>` : '<span class="dim">—</span>', csv: o => o.operation || "" }
  ];
  const OP = [
    { id: "id", label: "Operação", html: o => `<span class="code">${o.id}</span><span class="sub">${esc(o.client)}</span>`, csv: o => o.id },
    { id: "client", label: "Cliente", hidden: true },
    { id: "state", label: "Etapa", html: o => lcChip(o.state), csv: o => L.lc[o.state].label },
    { id: "decision", label: "Crédito", html: o => ({ APPROVED: "Aprovada", APPROVED_WITH_CONDITIONS: "Aprovada c/ condições", REJECTED: "Reprovada", PENDING: "Sem decisão" })[o.decision], csv: o => o.decision },
    { id: "equipmentValue", label: "Valor de equipamento", r: true, html: o => F.brl(o.equipmentValue), csv: o => o.equipmentValue },
    { id: "createdAt", label: "Abertura", html: o => F.date(o.createdAt), csv: o => F.date(o.createdAt) }
  ];
  const PEND = [
    { id: "operation", label: "Operação", html: p => `<span class="code">${p.operation}</span>` },
    { id: "title", label: "Pendência", html: p => esc(p.title) },
    { id: "seller", label: "Responsável", html: p => esc(L.seller[p.seller].label), csv: p => L.seller[p.seller].label },
    { id: "dueAt", label: "Prazo", html: p => p.dueAt ? F.dt(p.dueAt) : "sem prazo", csv: p => p.dueAt ? F.dt(p.dueAt) : "" }
  ];
  const LINK = [
    { id: "bank", label: "Instituição", html: x => esc(L.bank[x.bank].label), csv: x => L.bank[x.bank].label },
    { id: "op", label: "Operação", html: x => `<span class="code">${x.op.id}</span>`, csv: x => x.op.id },
    { id: "current", label: "Estado atual", html: x => bsChip(x.current), csv: x => L.bs[x.current].label },
    { id: "path", label: "Transições", html: x => `<span class="trans">${x.transitions.map(t => `<span>${esc(L.bs[t.to].label)}</span>`).join("")}</span>`, csv: x => x.transitions.map(t => L.bs[t.to].label).join(" > ") }
  ];
  const DOC = [
    { id: "op", label: "Operação", html: r => `<span class="code">${r.op.id}</span>`, csv: r => r.op.id },
    { id: "req", label: "Requisito", html: r => esc(L.req[r.req].label), csv: r => L.req[r.req].label },
    { id: "state", label: "Situação", html: r => ({ VALIDATED: "Validado", RECEIVED: "Aguardando validação", WAIVED: "Dispensado", MISSING: "Faltante" })[r.state], csv: r => r.state },
    { id: "via", label: "Origem", html: r => r.via === "DESK" ? "Complementação pela Mesa" : r.via === "INITIAL" ? "Entrega inicial" : "—", csv: r => r.via || "" }
  ];
  const sum = (rows, f) => rows.reduce((s, x) => s + f(x), 0);
  const links = q => M.ops(q).flatMap(o => o.banks.map(l => ({ ...l, op: o })));
  const OPP_DEF = "Oportunidades criadas no período e filtros da tela (base: data de criação).";

  const DR = {
    pend_overdue: q => ({ title: "Pendências vencidas", unit: "pendência registrada", rows: M.pendings(q).overdue, cols: PEND, def: "Pendências abertas com prazo anterior a hoje (São Paulo). Não inclui checklist documental nem tentativas bancárias." }),
    pend_today: q => ({ title: "Pendências que vencem hoje", unit: "pendência registrada", rows: M.pendings(q).today, cols: PEND, def: "Pendências abertas com prazo na data de hoje." }),
    pend_week: q => ({ title: "Próximas pendências", unit: "pendência registrada", rows: M.pendings(q).week, cols: PEND, def: "Pendências abertas com prazo depois de hoje." }),
    pend_none: q => ({ title: "Pendências sem prazo", unit: "pendência registrada", rows: M.pendings(q).none, cols: PEND, def: "Pendências abertas sem prazo informado." }),
    credit_waiting: q => ({ title: "Aguardando decisão de crédito", unit: "operação", rows: M.ops(q).filter(o => o.state === "in_review" && o.decision === "PENDING"), cols: OP, money: ["equipment", o => o.equipmentValue], def: "Operações em análise sem decisão de crédito consolidada." }),
    docs_waiting: q => ({ title: "Documentos aguardando validação", unit: "requisito por operação", rows: M.docs(q).rows.filter(r => r.state === "RECEIVED"), cols: DOC, def: "Requisitos recebidos e ainda não validados pela Mesa, nas operações em andamento." }),
    opp_open: q => ({ title: "Oportunidades abertas", unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "OPEN"), cols: OPP, money: ["pipeline", o => o.amount], def: OPP_DEF + " Somente abertas; soma = R$ pipeline." }),
    opp_won: q => ({ title: "Oportunidades ganhas", unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "WON"), cols: OPP, money: ["won", o => o.amount], def: OPP_DEF + " Ganha = operação encerrada. Soma = R$ venda ganha, não faturamento." }),
    opp_lost: q => ({ title: "Oportunidades perdidas", unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "LOST"), cols: OPP, def: OPP_DEF + " Cancelamentos administrativos ficam fora." }),
    opp_closed: q => ({ title: "Oportunidades concluídas (base da conversão)", unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "WON" || o.status === "LOST"), cols: OPP, def: "Conversão = ganhas ÷ (ganhas + perdidas). Estas são as linhas do denominador." }),
    opp_status: (q, v) => DR[{ OPEN: "opp_open", WON: "opp_won", LOST: "opp_lost" }[v] || "opp_open"](q),
    opp_stage: (q, v) => ({ title: "Abertas na etapa " + (L.stage[v] ? L.stage[v].label : ""), unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "OPEN" && o.stage === v), cols: OPP, money: ["pipeline", o => o.amount], def: OPP_DEF + " Etapa atual da oportunidade." }),
    opp_created_month: (q, v) => ({ title: "Criadas em " + F.month(v), unit: "oportunidade", rows: M.opps(q).filter(o => C.monthKey(o.createdAt) === v), cols: OPP, def: "Base: data de criação, dentro do recorte da tela." }),
    opp_closed_month: (q, v) => ({ title: "Encerradas em " + F.month(v), unit: "oportunidade", rows: M.oppsClosed(q).filter(o => C.monthKey(o.closedAt) === v), cols: OPP, def: "Proposta BI-DEP-03. Base: data de encerramento (ganho ou perda)." }),
    opp_dim_modality: (q, v) => ({ title: "Pipeline · " + L.modality[v].label, unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "OPEN" && o.modality === v), cols: OPP, money: ["pipeline", o => o.amount], def: "Abertas na modalidade atual do negócio." }),
    opp_dim_seller: (q, v) => ({ title: "Pipeline · " + L.seller[v].label, unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "OPEN" && o.seller === v), cols: OPP, money: ["pipeline", o => o.amount], def: "Abertas do vendedor responsável." }),
    opp_dim_branch: (q, v) => ({ title: "Pipeline · " + L.branch[v].label, unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "OPEN" && o.branch === v), cols: OPP, money: ["pipeline", o => o.amount], def: "Abertas da filial." }),
    opp_loss: (q, v) => ({ title: "Perdidas · " + L.loss[v].label, unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "LOST" && o.lossReason === v), cols: OPP, def: "Motivo registrado no encerramento comercial. " + (v === "CREDIT" ? "Perda comercial por crédito não é operação reprovada nem decisão de banco." : "") }),
    opp_age: (q, v) => { const [a, b] = { "0-15": [0, 15], "16-30": [16, 30], "31-60": [31, 60], "61+": [61, 9999] }[v]; return { title: "Abertas há " + (v === "61+" ? "mais de 60 dias" : `${a} a ${b} dias`), unit: "oportunidade", rows: M.opps(q).filter(o => { const d = (D.NOW - new Date(o.createdAt)) / 86400000; return o.status === "OPEN" && d >= a && d <= b + .999; }), cols: OPP, money: ["pipeline", o => o.amount], def: "Proposta BI-P-04. Dias desde a criação." }; },
    ops_state: (q, v) => ({ title: "Operações · " + L.lc[v].label, unit: "operação", rows: M.ops(q).filter(o => o.state === v), cols: OP, money: ["equipment", o => o.equipmentValue], def: "Estado atual do Lifecycle." + (v === "credit_rejected" ? " Novo estado proposto, depende da integração do Lifecycle (LC-DEP-01)." : "") }),
    ops_active: q => ({ title: "Operações em andamento", unit: "operação", rows: M.ops(q).filter(o => M.ACTIVE.includes(o.state)), cols: OP, money: ["equipment", o => o.equipmentValue], def: "Recebida, Em análise, Formalização e Faturamento." }),
    credit_sel: q => { const cr = M.credit(q); return { title: "Decisões · " + ({ ALL: "todas", FULL: "aprovadas integralmente", PARTIAL: "aprovadas parcialmente", REJECTED: "reprovadas" })[cr.cat], unit: "operação decidida", rows: cr.sel, cols: OP, def: `Operações criadas de ${cr.range.label} com decisão consolidada. Denominador da taxa geral: ${cr.decided.length}.` }; },
    credit_cat: (q, v) => ({ title: "Aprovadas · " + { BANK_FULL: "bancária integral", BANK_PARTIAL: "bancária parcial", INTERNAL_FULL: "interna integral", INTERNAL_PARTIAL: "interna parcial" }[v], unit: "operação decidida", rows: M.credit(q).approved.filter(o => o.category === v), cols: OP, def: "Categoria da aprovação consolidada." }),
    credit_month: (q, v) => ({ title: "Decisões em " + F.month(v), unit: "operação decidida", rows: M.ops(q).filter(o => o.decidedAt && C.monthKey(o.decidedAt) === v), cols: OP, def: "Base: data da decisão." }),
    bank_links: (q, v) => ({ title: "Vínculos · " + L.bank[v].label, unit: "vínculo operação-banco", rows: links(q).filter(x => x.bank === v), cols: LINK, def: "Estado atual e transições registradas de cada vínculo." }),
    bank_state: (q, v) => ({ title: "Vínculos em " + L.bs[v].label, unit: "vínculo operação-banco", rows: links(q).filter(x => x.current === v), cols: LINK, def: "Decisão de uma instituição. Uma operação pode ter vínculos com resultados diferentes." }),
    bank_transition: (q, v) => ({ title: "Vínculos que passaram por " + L.bs[v].label, unit: "vínculo operação-banco", rows: links(q).filter(x => x.transitions.some(t => t.to === v)), cols: LINK, def: "Histórico de transições registradas." }),
    doc_state: (q, v) => ({ title: v ? "Requisitos · " + { VALIDATED: "validados", RECEIVED: "aguardando validação", WAIVED: "dispensados", MISSING: "faltantes" }[v] : "Requisitos aplicáveis", unit: "requisito por operação", rows: M.docs(q).rows.filter(r => !v || r.state === v), cols: DOC, def: "Situação atual do checklist nas operações observáveis do recorte." }),
    doc_req: (q, v) => ({ title: L.req[v].label, unit: "requisito por operação", rows: M.docs(q).rows.filter(r => r.req === v), cols: DOC, def: "Operações em que o requisito se aplica." }),
    doc_complete: q => ({ title: "Checklists completos", unit: "operação", rows: M.docs(q).complete, cols: OP, def: "Todos os requisitos aplicáveis validados ou dispensados." }),
    op_one: (q, v) => ({ title: "Operação " + v, unit: "operação", rows: M.ops(q).filter(o => o.id === v), cols: OP, money: ["equipment", o => o.equipmentValue], def: "Registro único destacado no radar. Ângulo = horas na etapa atual; anel = etapa; tamanho = valor de equipamento." }),
    opp_created_day: (q, v) => ({ title: "Criadas em " + v.split("-").reverse().join("/"), unit: "oportunidade", rows: M.opps({ ...q, period: "all" }).filter(o => C.localDate(o.createdAt) === v), cols: OPP, def: "Base: data de criação. Período próprio do calendário (26 semanas), com os demais filtros da tela." }),
    opp_cell: (q, v) => { const [m, s] = v.split("|"); return { title: "Pipeline · " + L.modality[m].label + " · " + L.seller[s].label, unit: "oportunidade", rows: M.opps(q).filter(o => o.status === "OPEN" && o.modality === m && o.seller === s), cols: OPP, money: ["pipeline", o => o.amount], def: "Abertas da modalidade e do vendedor do bloco clicado." }; },
    billing_month: (q, v) => ({ title: "Entradas em Faturamento · " + F.month(v), unit: "operação (evento de entrada)", rows: M.ops({ ...q, period: "all" }).filter(o => o.billingEnteredAt && C.monthKey(o.billingEnteredAt) === v), cols: OP, def: "Evento operacional pela data da transição. Não é nota fiscal." })
  };
  const MONEY = { pipeline: "R$ pipeline", won: "R$ venda ganha", equipment: "R$ equipamento" };
  function build(key, q, dv) { const f = DR[key]; if (!f) return null; const d = f(q, dv); d.key = key; d.dv = dv; if (d.money) d.moneyText = F.brl(sum(d.rows, d.money[1])) + " " + unitTag(d.money[0], MONEY[d.money[0]]); return d; }
  window.IRDR = { build };
})();
