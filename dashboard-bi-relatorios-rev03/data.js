/*
 * DADOS SINTÉTICOS · Protótipo JARVIS Dashboard, BI e Relatórios (REV01)
 * Tudo aqui é gerado por semente fixa. Nenhum nome, código, valor ou banco corresponde ao Portal real.
 * Códigos usam o prefixo SIN- para não serem confundidos com registros de produção.
 */
(function () {
  "use strict";
  // Gerador determinístico (mulberry32) para que capturas e roteiro sejam reproduzíveis.
  let seed = 20261106;
  const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const weighted = (pairs) => { const total = pairs.reduce((s, p) => s + p[1], 0); let r = rnd() * total; for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; } return pairs[pairs.length - 1][0]; };
  const pad = (n, l = 4) => String(n).padStart(l, "0");

  // Data de referência fixa do protótipo (horário de São Paulo).
  const NOW = new Date("2026-11-06T09:12:00-03:00");
  const DAY = 86400000;
  const daysAgo = (d, h = 10) => new Date(NOW.getTime() - d * DAY - (h % 24) * 3600000 + 5 * 3600000);

  const BRANCHES = [
    { id: "b-norte", label: "Filial Norte" },
    { id: "b-centro", label: "Filial Centro" },
    { id: "b-sul", label: "Filial Sul" }
  ];
  const SELLERS = [
    { id: "s-01", label: "Ana Prado", branch: "b-centro" },
    { id: "s-02", label: "Bruno Lacerda", branch: "b-centro" },
    { id: "s-03", label: "Carla Mendonça", branch: "b-norte" },
    { id: "s-04", label: "Diego Furtado", branch: "b-norte" },
    { id: "s-05", label: "Elisa Ramos", branch: "b-sul" },
    { id: "s-06", label: "Fábio Teixeira", branch: "b-sul" }
  ];
  const MODALITIES = [
    { id: "BANK_FINANCING", label: "Financiamento Bancário" },
    { id: "INTERNAL_INSTALLMENT", label: "Parcelamento Interno" },
    { id: "CLIENT_FUNDS", label: "Recursos do Cliente / À Vista" }
  ];
  // Instituições parceiras usadas no Portal (nomes e logos reais apenas para ilustrar o desenho; todos os números são sintéticos).
  // Ordem de exibição definida pelo Owner: Banco Sany, Bradesco, Caixa, Itaú e BBC Digital por último (inativo).
  const BANKS = [
    { id: "bk-alfa", label: "Banco Sany", logo: "assets/bancos/banco-sany.png", active: true },
    { id: "bk-beta", label: "Bradesco", logo: "assets/bancos/bradesco.png", active: true },
    { id: "bk-gama", label: "Caixa", logo: "assets/bancos/caixa-economica-federal.png", active: true },
    { id: "bk-delta", label: "Itaú", logo: "assets/bancos/itau.png", active: true },
    { id: "bk-eps", label: "BBC Digital", logo: "assets/bancos/bbc-digital.png", active: false }
  ];
  const STAGES = [
    { id: "OPPORTUNITY", label: "Oportunidade" },
    { id: "SERVICE", label: "Atendimento" },
    { id: "PROPOSAL", label: "Proposta" },
    { id: "FOLLOW_UP", label: "Acompanhamento" },
    { id: "NEGOTIATION", label: "Negociação" },
    { id: "CREDIT_ANALYSIS", label: "Análise de crédito" },
    { id: "FORMALIZATION", label: "Formalização" },
    { id: "BILLING", label: "Faturamento" }
  ];
  const LOSS_REASONS = [
    { id: "CREDIT", label: "Crédito / restrição" },
    { id: "PRICE", label: "Preço" },
    { id: "DELIVERY", label: "Prazo de entrega" },
    { id: "COMPETITOR", label: "Concorrência" },
    { id: "GAVE_UP", label: "Desistência do cliente" }
  ];
  // Estado operacional canônico + o novo terminal proposto (depende do Lifecycle).
  const LIFECYCLE = [
    { id: "received", label: "Recebida", tone: "received", step: "Etapa 01" },
    { id: "in_review", label: "Em análise", tone: "in_review", step: "Etapa 02" },
    { id: "formalization", label: "Formalização", tone: "formalization", step: "Etapa 03" },
    { id: "billing", label: "Faturamento", tone: "billing", step: "Etapa 04" },
    { id: "closed", label: "Encerrada", tone: "closed", step: "Terminal" },
    { id: "cancelled", label: "Cancelada", tone: "cancelled", step: "Terminal" },
    { id: "credit_rejected", label: "Reprovada por crédito", tone: "credit_rejected", step: "Terminal", pending: "LC-DEP-01" }
  ];
  const BANK_STATES = [
    { id: "PENDING", label: "Pendente", tone: "attention" },
    { id: "RECEIVED", label: "Recebida", tone: "info" },
    { id: "IN_REVIEW", label: "Em análise", tone: "deep_blue" },
    { id: "APPROVED", label: "Aprovada", tone: "positive" },
    { id: "CONDITIONAL", label: "Aprovada c/ condições", tone: "conditional" },
    { id: "REJECTED", label: "Reprovada", tone: "negative" },
    { id: "INELIGIBLE", label: "Inelegível", tone: "neutral" },
    { id: "DISBURSED", label: "Desembolsada", tone: "positive" }
  ];
  const REQUIREMENTS = [
    { id: "RQ-ID", label: "Documento de identidade · CNH ou RG" },
    { id: "RQ-ADDR", label: "Comprovante de endereço" },
    { id: "RQ-REV", label: "Declaração de faturamento dos últimos 12 meses" },
    { id: "RQ-FLEET", label: "Relação de frota com indicação de operação" },
    { id: "RQ-CONTRACT", label: "Contrato social e alterações" },
    { id: "RQ-IR", label: "Declaração de IR do sócio" }
  ];
  const EQUIPMENT = [
    ["Escavadeira 5,5 t", 290000], ["Escavadeira 13,5 t", 640000], ["Escavadeira 3,5 t", 250000], ["Minicarregadeira 0,9 t", 260000],
    ["Retroescavadeira 4x4", 370000], ["Pá-carregadeira 2,5 m³", 520000], ["Rolo compactador 11 t", 410000], ["Motoniveladora 140 hp", 980000],
    ["Empilhadeira 2,5 t", 140000], ["Manipulador telescópico 17 m", 610000]
  ];
  const CLIENT_A = ["Atlas", "Borda", "Cume", "Delta Sul", "Encosta", "Ferro Leve", "Granito", "Horizonte", "Ipê", "Jatobá", "Lajedo", "Marco Zero", "Nascente", "Orla", "Pedra Alta", "Quartzo", "Ribeira", "Serra Azul", "Trilha", "Vale Verde", "Xisto", "Zênite"];
  const CLIENT_B = ["Terraplenagem", "Locação de Máquinas", "Construtora", "Agro", "Mineração", "Pavimentação", "Obras", "Saneamento"];

  const opportunities = [], operations = [], events = [], pendings = [];
  let oppSeq = 1, opSeq = 1, evSeq = 1, pdSeq = 1;
  const stageIndex = (id) => STAGES.findIndex(s => s.id === id);

  for (let i = 0; i < 190; i++) {
    const seller = pick(SELLERS);
    const createdDaysAgo = Math.floor(Math.pow(rnd(), 0.9) * 160);
    const created = daysAgo(createdDaysAgo, Math.floor(rnd() * 9));
    const [equip, base] = pick(EQUIPMENT);
    const qty = weighted([[1, 7], [2, 2], [3, 1]]);
    const amount = Math.round((base * qty * (0.92 + rnd() * 0.16)) / 1000) * 1000;
    const modality = weighted([[MODALITIES[0], 5], [MODALITIES[1], 3], [MODALITIES[2], 2]]);
    const age = createdDaysAgo;
    let status = "OPEN";
    if (age > 12) status = weighted([["OPEN", age > 90 ? 1 : age > 45 ? 4 : 9], ["WON", 2.6], ["LOST", 2], ["CANCELLED", 0.35]]);
    let stage;
    if (status === "OPEN") stage = weighted([["OPPORTUNITY", 2], ["SERVICE", 2], ["PROPOSAL", 3], ["FOLLOW_UP", 2], ["NEGOTIATION", 2.4], ["CREDIT_ANALYSIS", 5], ["FORMALIZATION", 3], ["BILLING", 2]]);
    else if (status === "WON") stage = "BILLING";
    else stage = weighted([["PROPOSAL", 2], ["NEGOTIATION", 2], ["CREDIT_ANALYSIS", 3]]);
    const lossReason = status === "LOST" ? (stage === "CREDIT_ANALYSIS" ? weighted([["CREDIT", 6], ["GAVE_UP", 1]]) : weighted([["PRICE", 3], ["DELIVERY", 2], ["COMPETITOR", 3], ["GAVE_UP", 2], ["CREDIT", 1]])) : null;
    const closedAt = status === "OPEN" ? null : new Date(created.getTime() + Math.min(age - 1, 8 + Math.floor(rnd() * 40)) * DAY);
    const opp = {
      id: "OPP-SIN-" + pad(oppSeq++), client: pick(CLIENT_A) + " " + pick(CLIENT_B) + (rnd() > 0.5 ? " Ltda" : " S.A."),
      seller: seller.id, branch: seller.branch, modality: modality.id, amount, equipment: equip + (qty > 1 ? " ×" + qty : ""),
      createdAt: created.toISOString(), status, stage, lossReason, closedAt: closedAt ? closedAt.toISOString() : null, operation: null
    };
    opportunities.push(opp);

    // Operação nasce quando a oportunidade chega à análise de crédito ou é ganha.
    const reachesOperation = status === "WON" || stageIndex(stage) >= stageIndex("CREDIT_ANALYSIS") || (status === "LOST" && lossReason === "CREDIT");
    if (!reachesOperation) continue;
    const opCreated = new Date(created.getTime() + (2 + Math.floor(rnd() * 6)) * DAY);
    if (opCreated > NOW) continue;
    let state;
    if (status === "WON") state = "closed";
    else if (status === "LOST") state = lossReason === "CREDIT" ? weighted([["credit_rejected", 4], ["cancelled", 2]]) : "cancelled";
    else if (status === "CANCELLED") state = "cancelled";
    else state = stage === "FORMALIZATION" ? "formalization" : stage === "BILLING" ? "billing" : weighted([["received", 1.6], ["in_review", 4]]);
    const bankCount = modality.id === "BANK_FINANCING" ? weighted([[1, 3], [2, 3], [3, 2]]) : 0;
    const usedBanks = [...BANKS].sort(() => rnd() - 0.5).slice(0, bankCount);
    const links = usedBanks.map((b, k) => {
      let current;
      if (state === "credit_rejected") current = weighted([["REJECTED", 5], ["INELIGIBLE", 1.5]]);
      else if (state === "closed" || state === "billing") current = k === 0 ? weighted([["APPROVED", 3], ["CONDITIONAL", 1.4], ["DISBURSED", 2]]) : weighted([["REJECTED", 2], ["APPROVED", 1], ["INELIGIBLE", 1]]);
      else if (state === "cancelled") current = weighted([["REJECTED", 1], ["PENDING", 1], ["APPROVED", 0.6]]);
      else if (state === "received") current = "PENDING";
      else current = weighted([["PENDING", 2], ["RECEIVED", 1.2], ["IN_REVIEW", 2.5], ["APPROVED", 1], ["REJECTED", 1], ["CONDITIONAL", 0.6]]);
      const path = ["PENDING"];
      if (!["PENDING"].includes(current)) { path.push("RECEIVED"); if (!["RECEIVED", "INELIGIBLE"].includes(current)) path.push("IN_REVIEW"); if (current === "DISBURSED") path.push("APPROVED"); if (!path.includes(current)) path.push(current); }
      if (current === "INELIGIBLE") path.splice(1, path.length, "INELIGIBLE");
      let t = opCreated.getTime();
      const transitions = path.map((to, j) => { t += (j === 0 ? 0.2 : 1 + rnd() * 4) * DAY; return { to, at: new Date(Math.min(t, NOW.getTime() - 3600000)).toISOString() }; });
      return { bank: b.id, current, transitions };
    });
    let decision = "PENDING", category = null, decidedAt = null;
    if (["closed", "billing", "formalization"].includes(state) || (state === "in_review" && rnd() > 0.55) || (state === "cancelled" && rnd() > 0.5)) {
      decision = state === "cancelled" ? weighted([["APPROVED", 2], ["REJECTED", 1]]) : weighted([["APPROVED", 5], ["APPROVED_WITH_CONDITIONS", 2]]);
      const internal = modality.id !== "BANK_FINANCING";
      category = decision === "REJECTED" ? null : (internal ? (decision === "APPROVED" ? "INTERNAL_FULL" : "INTERNAL_PARTIAL") : (decision === "APPROVED" ? "BANK_FULL" : "BANK_PARTIAL"));
      decidedAt = new Date(opCreated.getTime() + (3 + rnd() * 9) * DAY);
    }
    if (state === "credit_rejected") { decision = "REJECTED"; decidedAt = new Date(opCreated.getTime() + (3 + rnd() * 9) * DAY); }
    if (decidedAt && decidedAt > NOW) decidedAt = new Date(NOW.getTime() - 5 * 3600000);
    const billingEnteredAt = ["billing", "closed"].includes(state) ? new Date(Math.min(NOW.getTime() - 2 * 3600000, opCreated.getTime() + (12 + rnd() * 20) * DAY)) : null;
    const stateEnteredAt = new Date(Math.min(NOW.getTime() - 3600000, opCreated.getTime() + (state === "received" ? 0.3 : 2 + rnd() * 18) * DAY));
    const residenceHours = Math.round(8 + rnd() * (state === "in_review" ? 60 : 30));
    // Checklist documental: aplicabilidade e situação atual por requisito.
    const docs = REQUIREMENTS.filter(() => rnd() > 0.22).map(r => {
      const doneish = ["closed", "billing", "formalization"].includes(state);
      const s = doneish ? weighted([["VALIDATED", 9], ["WAIVED", 1]]) : weighted([["VALIDATED", 3], ["RECEIVED", 2.2], ["MISSING", 2.2], ["WAIVED", 0.5]]);
      const via = s === "MISSING" ? null : weighted([["INITIAL", 3], ["DESK", 1.4]]);
      return { req: r.id, state: s, via };
    });
    const observable = rnd() > 0.08;
    const op = {
      id: "OP-SIN-" + pad(opSeq++), opportunity: opp.id, client: opp.client, seller: opp.seller, branch: opp.branch, modality: opp.modality,
      equipment: opp.equipment, equipmentValue: amount, createdAt: opCreated.toISOString(), state, stateEnteredAt: stateEnteredAt.toISOString(), residenceHours,
      decision, category, decidedAt: decidedAt ? decidedAt.toISOString() : null, billingEnteredAt: billingEnteredAt ? billingEnteredAt.toISOString() : null,
      banks: links, docs: observable ? docs : null
    };
    opp.operation = op.id;
    operations.push(op);
    // Pendências operacionais registradas (distintas do checklist e das tentativas bancárias).
    if (["received", "in_review", "formalization", "billing"].includes(state) && rnd() > 0.35) {
      const n = weighted([[1, 3], [2, 2], [3, 1]]);
      for (let k = 0; k < n; k++) {
        const dueOffset = weighted([[-4, 1], [-2, 1.4], [-1, 1], [0, 2], [1, 1.5], [3, 1.5], [7, 1], [null, 1]]);
        const due = dueOffset === null ? null : new Date(NOW.getTime() + dueOffset * DAY + (rnd() * 8 - 4) * 3600000);
        pendings.push({
          id: "PD-SIN-" + pad(pdSeq++), operation: op.id, seller: op.seller, branch: op.branch,
          type: weighted([["DOCUMENT", 3], ["CONTACT", 2], ["BANK_RETURN", 1.4], ["SIGNATURE", 1]]),
          title: pick(["Solicitar declaração de faturamento atualizada", "Retornar contato do cliente sobre entrada", "Reenviar proposta com novo prazo", "Coletar assinatura do aditivo", "Confirmar dados do avalista", "Enviar relação de frota revisada", "Agendar vistoria de entrega"]),
          dueAt: due ? due.toISOString() : null
        });
      }
    }
  }

  // Atividade recente: fatos registrados nas operações (sintéticos).
  const recentOps = [...operations].sort((a, b) => b.stateEnteredAt.localeCompare(a.stateEnteredAt)).slice(0, 14);
  const verbs = {
    received: "Operação recebida pela Mesa", in_review: "Análise de crédito iniciada", formalization: "Avançou para Formalização", billing: "Entrada na etapa Faturamento",
    closed: "Operação encerrada", cancelled: "Operação cancelada", credit_rejected: "Reprovada por crédito (proposta Lifecycle)"
  };
  recentOps.forEach(op => events.push({ id: "EV-SIN-" + pad(evSeq++), operation: op.id, at: op.stateEnteredAt, title: verbs[op.state], state: op.state, actor: SELLERS.find(s => s.id === op.seller).label }));
  operations.filter(o => o.banks.some(l => l.current === "REJECTED")).slice(0, 4).forEach(op => {
    const link = op.banks.find(l => l.current === "REJECTED"); const last = link.transitions[link.transitions.length - 1];
    events.push({ id: "EV-SIN-" + pad(evSeq++), operation: op.id, at: last.at, title: "Proposta do " + BANKS.find(b => b.id === link.bank).label + " reprovada", state: "bank_rejected", actor: "Mesa de crédito" });
  });
  events.sort((a, b) => b.at.localeCompare(a.at));

  window.IRD = {
    SYNTHETIC: true, NOW, BRANCHES, SELLERS, MODALITIES, BANKS, STAGES, LOSS_REASONS, LIFECYCLE, BANK_STATES, REQUIREMENTS,
    opportunities, operations, pendings, events
  };
})();
