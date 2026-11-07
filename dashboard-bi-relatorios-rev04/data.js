/*
 * DADOS SINTÉTICOS · Protótipo JARVIS Dashboard, BI e Relatórios (REV04)
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
  // Potência estável: Math.pow pode variar no último bit entre níveis do JIT; arredondar evita dados diferentes a cada carga.
  const powS = (x, y) => Math.round(Math.pow(x, y) * 1e9) / 1e9;
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
  // Catálogo sintético de modelos. Categoria, código e preço de tabela só ilustram o desenho.
  const CATEGORIES = [
    { id: "ESC", label: "Escavadeiras" }, { id: "CAR", label: "Carregadeiras" }, { id: "COMP", label: "Compactação" },
    { id: "NIV", label: "Motoniveladoras" }, { id: "MOV", label: "Movimentação de carga" }
  ];
  const MODELS = [
    { id: "EX-35", label: "Escavadeira 3,5 t", cat: "ESC", price: 250000, w: 3 }, { id: "EX-55", label: "Escavadeira 5,5 t", cat: "ESC", price: 290000, w: 4 },
    { id: "EX-135", label: "Escavadeira 13,5 t", cat: "ESC", price: 640000, w: 3 }, { id: "EX-215", label: "Escavadeira 21,5 t", cat: "ESC", price: 890000, w: 2 },
    { id: "MC-09", label: "Minicarregadeira 0,9 t", cat: "CAR", price: 260000, w: 3 }, { id: "RT-44", label: "Retroescavadeira 4x4", cat: "CAR", price: 370000, w: 4 },
    { id: "PC-25", label: "Pá-carregadeira 2,5 m³", cat: "CAR", price: 520000, w: 2 }, { id: "RC-11", label: "Rolo compactador 11 t", cat: "COMP", price: 410000, w: 2 },
    { id: "MN-140", label: "Motoniveladora 140 hp", cat: "NIV", price: 980000, w: 1 }, { id: "EP-25", label: "Empilhadeira 2,5 t", cat: "MOV", price: 140000, w: 2 },
    { id: "MT-17", label: "Manipulador telescópico 17 m", cat: "MOV", price: 610000, w: 1.4 }
  ];
  const MANAGERS = [{ id: "g-01", label: "Gerência Comercial" }];
  SELLERS.forEach(s => { s.manager = "g-01"; });
  // Cada vendedor negocia com uma margem própria: é o que o relatório por equipamento revela.
  const PRICE_BIAS = { "s-01": 1.03, "s-02": 0.96, "s-03": 1.01, "s-04": 0.98, "s-05": 1.05, "s-06": 0.99 };
  const UFS = [["SP", "Campinas", 6], ["MG", "Belo Horizonte", 4], ["PR", "Londrina", 3], ["SC", "Joinville", 2.4], ["RS", "Caxias do Sul", 2], ["GO", "Goiânia", 2.6], ["MT", "Cuiabá", 2.2], ["BA", "Feira de Santana", 1.8], ["PE", "Recife", 1.2], ["PA", "Marabá", 1.4], ["ES", "Vitória", 1], ["RJ", "Duque de Caxias", 1.2], ["MS", "Dourados", 1.3], ["TO", "Palmas", .8], ["MA", "Imperatriz", .7]];
  const CLIENT_A = ["Atlas", "Borda", "Cume", "Delta Sul", "Encosta", "Ferro Leve", "Granito", "Horizonte", "Ipê", "Jatobá", "Lajedo", "Marco Zero", "Nascente", "Orla", "Pedra Alta", "Quartzo", "Ribeira", "Serra Azul", "Trilha", "Vale Verde", "Xisto", "Zênite"];
  const CLIENT_B = ["Terraplenagem", "Locação de Máquinas", "Construtora", "Agro", "Mineração", "Pavimentação", "Obras", "Saneamento"];
  const CLIENTS = [];
  for (let i = 0; i < 84; i++) {
    const uf = weighted(UFS.map(u => [u, u[2]]));
    const name = CLIENT_A[i % CLIENT_A.length] + " " + CLIENT_B[(i * 7 + Math.floor(i / CLIENT_A.length)) % CLIENT_B.length] + (i % 3 ? " Ltda" : " S.A.");
    CLIENTS.push({ id: "CL-SIN-" + pad(i + 1, 3), label: name, uf: uf[0], city: uf[1], w: 0.4 + powS(rnd(), 2.2) * 4 });
  }

  const opportunities = [], operations = [], events = [], pendings = [];
  let oppSeq = 1, opSeq = 1, evSeq = 1, pdSeq = 1;
  const stageIndex = (id) => STAGES.findIndex(s => s.id === id);
  const ev = (op, at, title, state, actor) => { if (at <= NOW.getTime()) events.push({ id: "EV-SIN-" + pad(evSeq++, 5), operation: op.id, at: new Date(at).toISOString(), title, state, actor }); };
  const mid = (a, b) => a + rnd() * (b - a);

  // 760 dias de histórico: permite comparar 360 dias com o ano anterior e ler sazonalidade.
  for (let i = 0; i < 640; i++) {
    const seller = pick(SELLERS);
    const createdDaysAgo = Math.floor(powS(rnd(), 1.22) * 760);
    const created = daysAgo(createdDaysAgo, Math.floor(rnd() * 9));
    const client = weighted(CLIENTS.map(c => [c, c.w]));
    const lines = weighted([[1, 8], [2, 2]]);
    const items = [];
    for (let k = 0; k < lines; k++) {
      const m = weighted(MODELS.map(x => [x, x.w])); if (items.some(it => it.model === m.id)) continue;
      const qty = weighted([[1, 7], [2, 2], [3, 1]]);
      const unit = Math.round(m.price * PRICE_BIAS[seller.id] * (0.9 + rnd() * 0.16) / 500) * 500;
      items.push({ model: m.id, cat: m.cat, qty, unit, total: unit * qty });
    }
    const amount = items.reduce((s, it) => s + it.total, 0), units = items.reduce((s, it) => s + it.qty, 0);
    const modality = weighted([[MODALITIES[0], 5], [MODALITIES[1], 3], [MODALITIES[2], 2]]);
    const age = createdDaysAgo;
    let status = "OPEN";
    if (age > 12) status = weighted([["OPEN", age > 120 ? 0.25 : age > 90 ? 1 : age > 45 ? 4 : 9], ["WON", 2.6], ["LOST", 2], ["CANCELLED", 0.35]]);
    let stage;
    if (status === "OPEN") stage = weighted([["OPPORTUNITY", 2], ["SERVICE", 2], ["PROPOSAL", 3], ["FOLLOW_UP", 2], ["NEGOTIATION", 2.4], ["CREDIT_ANALYSIS", 5], ["FORMALIZATION", 3], ["BILLING", 2]]);
    else if (status === "WON") stage = "BILLING";
    else stage = weighted([["PROPOSAL", 2], ["NEGOTIATION", 2], ["CREDIT_ANALYSIS", 3]]);
    const lossReason = status === "LOST" ? (stage === "CREDIT_ANALYSIS" ? weighted([["CREDIT", 6], ["GAVE_UP", 1]]) : weighted([["PRICE", 3], ["DELIVERY", 2], ["COMPETITOR", 3], ["GAVE_UP", 2], ["CREDIT", 1]])) : null;
    const closedAt = status === "OPEN" ? null : new Date(created.getTime() + Math.min(age - 1, 8 + Math.floor(rnd() * 40)) * DAY);
    const m0 = MODELS.find(m => m.id === items[0].model);
    const opp = {
      id: "OPP-SIN-" + pad(oppSeq++), client: client.label, clientId: client.id, uf: client.uf, city: client.city,
      seller: seller.id, branch: seller.branch, manager: seller.manager, modality: modality.id, amount, units, items,
      equipment: m0.label + (items[0].qty > 1 ? " ×" + items[0].qty : "") + (items.length > 1 ? " + 1 item" : ""),
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
    const billingEnteredAt = ["billing", "closed"].includes(state) ? new Date(Math.min(NOW.getTime() - 2 * 3600000, opCreated.getTime() + (12 + rnd() * 20) * DAY)) : null;
    // Faturado = entrou em Encerrada no lifecycle (regra do Owner enquanto não houver API fiscal).
    const closedOpAt = state === "closed" ? new Date(Math.min(NOW.getTime() - 3600000, billingEnteredAt.getTime() + (1 + rnd() * 9) * DAY)) : null;
    const bankCount = modality.id === "BANK_FINANCING" ? weighted([[1, 3], [2, 3], [3, 2]]) : 0;
    const usedBanks = [...BANKS]; for (let k = usedBanks.length - 1; k > 0; k--) { const j = Math.floor(rnd() * (k + 1)); [usedBanks[k], usedBanks[j]] = [usedBanks[j], usedBanks[k]]; } usedBanks.length = bankCount;
    // Vínculo operação-banco. Recebida e Pendente são estados de ENTRADA paralelos (um não vem antes do outro).
    const links = usedBanks.map((b, k) => {
      let current;
      if (state === "credit_rejected") current = weighted([["REJECTED", 5], ["INELIGIBLE", 1.5]]);
      else if (state === "closed") current = k === 0 ? "DISBURSED" : weighted([["REJECTED", 2], ["APPROVED", 1], ["INELIGIBLE", 1]]);
      else if (state === "billing") current = k === 0 ? weighted([["APPROVED", 3], ["CONDITIONAL", 1.4]]) : weighted([["REJECTED", 2], ["APPROVED", 1], ["INELIGIBLE", 1]]);
      else if (state === "cancelled") current = weighted([["REJECTED", 1], ["PENDING", 1], ["APPROVED", 0.6]]);
      else if (state === "received") current = weighted([["PENDING", 1], ["RECEIVED", 1.3]]);
      else current = weighted([["PENDING", 1.6], ["RECEIVED", 1.2], ["IN_REVIEW", 2.5], ["APPROVED", 1], ["REJECTED", 1], ["CONDITIONAL", 0.6]]);
      const entry = current === "PENDING" ? "PENDING" : current === "RECEIVED" ? "RECEIVED" : weighted([["RECEIVED", 2.4], ["PENDING", 1]]);
      let path;
      if (current === "PENDING" || current === "RECEIVED") path = [entry];
      else if (current === "INELIGIBLE") path = rnd() > 0.5 ? ["INELIGIBLE"] : [entry, "INELIGIBLE"];
      else if (current === "IN_REVIEW") path = [entry, "IN_REVIEW"];
      else if (current === "DISBURSED") path = [entry, "IN_REVIEW", weighted([["APPROVED", 3], ["CONDITIONAL", 1]]), "DISBURSED"];
      else path = [entry, "IN_REVIEW", current];
      let t = opCreated.getTime();
      const transitions = path.map((to, j) => { t += (j === 0 ? 0.2 : 1 + rnd() * 4) * DAY; return { to, at: new Date(Math.min(t, NOW.getTime() - 3600000)).toISOString() }; });
      if (current === "DISBURSED") transitions[transitions.length - 1].at = new Date(closedOpAt.getTime() - 0.5 * DAY).toISOString();
      return { bank: b.id, current, transitions, disbursedAt: current === "DISBURSED" ? transitions[transitions.length - 1].at : null };
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
    const stateEnteredAt = closedOpAt || new Date(Math.min(NOW.getTime() - 3600000, opCreated.getTime() + (state === "received" ? 0.3 : 2 + rnd() * 18) * DAY));
    const residenceHours = Math.round(8 + rnd() * (state === "in_review" ? 60 : 30));
    // Checklist documental: estados reais do requisito (sem "dispensado": nenhuma tela do Portal dispensa documento hoje).
    const docs = REQUIREMENTS.filter(() => rnd() > 0.22).map(r => {
      const doneish = ["closed", "billing", "formalization"].includes(state);
      const s = doneish ? weighted([["VALIDATED", 12], ["REJECTED", 0.4]]) : weighted([["VALIDATED", 3], ["RECEIVED", 2.2], ["MISSING", 2.2], ["REJECTED", 0.6]]);
      const via = s === "MISSING" ? null : weighted([["INITIAL", 3], ["DESK", 1.4]]);
      const by = s === "MISSING" ? null : weighted([["AVA", 2.6], ["MANUAL", 1]]);
      const sentAt = s === "MISSING" ? null : new Date(Math.min(NOW.getTime() - 3600000, opCreated.getTime() + mid(0.2, 9) * DAY)).toISOString();
      return { req: r.id, state: s, via, by, sentAt };
    });
    const observable = rnd() > 0.08;
    const op = {
      id: "OP-SIN-" + pad(opSeq++), opportunity: opp.id, client: opp.client, clientId: opp.clientId, uf: opp.uf, city: opp.city,
      seller: opp.seller, branch: opp.branch, manager: opp.manager, modality: opp.modality,
      equipment: opp.equipment, items, units, equipmentValue: amount, createdAt: opCreated.toISOString(), state, stateEnteredAt: stateEnteredAt.toISOString(), residenceHours,
      decision, category, decidedAt: decidedAt ? decidedAt.toISOString() : null, billingEnteredAt: billingEnteredAt ? billingEnteredAt.toISOString() : null,
      closedAt: closedOpAt ? closedOpAt.toISOString() : null, oppCreatedAt: opp.createdAt,
      banks: links, docs: observable ? docs : null
    };
    opp.operation = op.id;
    operations.push(op);
    // Fatos registrados na operação (Atividade recente).
    const actor = SELLERS.find(s => s.id === op.seller).label;
    ev(op, opCreated.getTime(), "Operação recebida pela Mesa", "received", actor);
    if (state !== "received") ev(op, opCreated.getTime() + 0.6 * DAY, "Análise de crédito iniciada", "in_review", "Mesa de crédito");
    links.forEach(l => l.transitions.forEach(tr => { if (["REJECTED", "APPROVED", "CONDITIONAL", "DISBURSED"].includes(tr.to)) ev(op, Date.parse(tr.at), ({ REJECTED: "Proposta reprovada pelo ", APPROVED: "Proposta aprovada pelo ", CONDITIONAL: "Aprovada com condições pelo ", DISBURSED: "Desembolso registrado pelo " })[tr.to] + BANKS.find(b => b.id === l.bank).label, tr.to === "REJECTED" ? "bank_rejected" : tr.to === "DISBURSED" ? "disbursed" : "bank_approved", "Mesa de crédito"); }));
    if (["formalization", "billing", "closed"].includes(state)) ev(op, (decidedAt ? decidedAt.getTime() : opCreated.getTime()) + 0.4 * DAY, "Avançou para Formalização", "formalization", actor);
    if (billingEnteredAt) ev(op, billingEnteredAt.getTime(), "Entrada na etapa Faturamento", "billing", actor);
    if (closedOpAt) ev(op, closedOpAt.getTime(), "Operação encerrada · faturada", "closed", actor);
    if (state === "cancelled") ev(op, stateEnteredAt.getTime(), "Operação cancelada", "cancelled", actor);
    if (state === "credit_rejected") ev(op, stateEnteredAt.getTime(), "Reprovada por crédito (proposta Lifecycle)", "credit_rejected", "Mesa de crédito");
    // Pendências registradas manualmente no cockpit (tipos reais do Portal).
    if (["received", "in_review", "formalization", "billing"].includes(state) && rnd() > 0.35) {
      const n = weighted([[1, 3], [2, 2], [3, 1]]);
      for (let k = 0; k < n; k++) {
        const dueOffset = weighted([[-4, 1], [-2, 1.4], [-1, 1], [0, 2], [1, 1.5], [3, 1.5], [7, 1], [null, 1]]);
        const due = dueOffset === null ? null : new Date(NOW.getTime() + dueOffset * DAY + (rnd() * 8 - 4) * 3600000);
        pendings.push({
          id: "PD-SIN-" + pad(pdSeq++), operation: op.id, seller: op.seller, branch: op.branch, manager: op.manager,
          type: weighted([["DOCUMENT", 3], ["CLIENT", 2], ["BANK", 1.4], ["INTERNAL", 1], ["OPERATIONAL", 0.8], ["OTHER", 0.4]]),
          title: pick(["Solicitar declaração de faturamento atualizada", "Retornar contato do cliente sobre entrada", "Reenviar proposta com novo prazo", "Coletar assinatura do aditivo", "Confirmar dados do avalista", "Enviar relação de frota revisada", "Agendar vistoria de entrega"]),
          createdAt: new Date(Math.max(opCreated.getTime(), NOW.getTime() - mid(1, 12) * DAY)).toISOString(),
          dueAt: due ? due.toISOString() : null
        });
      }
    }
  }
  events.sort((a, b) => b.at.localeCompare(a.at));

  // Metas sintéticas por vendedor e mês (valor e unidades por categoria). DEPENDÊNCIA: o Portal ainda não tem cadastro de metas (FAT-DEP-META).
  const GOALS = [];
  const monthKeyOf = d => new Date(d.getTime() - 3 * 3600000).toISOString().slice(0, 7);
  for (let i = 23; i >= 0; i--) {
    const d = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth() - i, 15)); const mk = d.toISOString().slice(0, 7);
    SELLERS.forEach(s => {
      const closed = operations.filter(o => o.seller === s.id && o.closedAt);
      const avgV = closed.reduce((a, o) => a + o.equipmentValue, 0) / 24, avgU = closed.reduce((a, o) => a + o.units, 0) / 24;
      const units = {}; CATEGORIES.forEach(c => { const share = closed.filter(o => o.items.some(it => it.cat === c.id)).length / Math.max(1, closed.length); units[c.id] = Math.max(0, Math.round(avgU * share * (1.1 + rnd() * 0.3))); });
      GOALS.push({ month: mk, seller: s.id, branch: s.branch, manager: s.manager, value: Math.round(avgV * (1.08 + rnd() * 0.22) / 10000) * 10000, units });
    });
  }
  void monthKeyOf;

  window.IRD = {
    SYNTHETIC: true, NOW, BRANCHES, SELLERS, MANAGERS, MODALITIES, BANKS, STAGES, LOSS_REASONS, LIFECYCLE, BANK_STATES, REQUIREMENTS, CATEGORIES, MODELS, CLIENTS, GOALS,
    opportunities, operations, pendings, events
  };
})();
