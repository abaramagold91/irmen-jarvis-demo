/* Dados ilustrativos do protótipo. Nenhum número aqui vem da produção. */
(function () {
  const P = {
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    spark: 'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1',
    layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
    users: 'M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-2a4 4 0 0 0-3-3.9M16 2.1a4 4 0 0 1 0 7.8',
    building: 'M4 21V5l8-3v19M12 8h8v13M8 9h.01M8 13h.01M8 17h.01M16 12h.01M16 16h.01M2 21h20',
    check: 'M9 11l3 3 8-8M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
    calc: 'M5 2h14v20H5zM8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8',
    bank: 'M3 10l9-6 9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18',
    doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5',
    chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z',
    wa: 'M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4zM8.5 9.5c.5 2.5 3 5 6 6l1.5-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z',
    life: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.9 4.9l4.3 4.3M14.8 14.8l4.3 4.3M14.8 9.2l4.3-4.3M4.9 19.1l4.3-4.3',
    chart: 'M3 3v18h18M7 15l4-4 3 3 6-7',
    trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a4 4 0 0 1-3 4M7 5H4v2a4 4 0 0 0 3 4',
    shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4',
    cog: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    map: 'M9 3l-6 3v15l6-3 6 3 6-3V3l-6 3zM9 3v15M15 6v15',
    bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
    sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    menu: 'M3 6h18M3 12h18M3 18h18',
    plus: 'M12 5v14M5 12h14',
    search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
    clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
    alert: 'M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
    target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.3.3 1.6 1.2 2.8 2.5 2.8z',
    arrow: 'M5 12h14M13 5l7 7-7 7',
    back: 'M19 12H5M11 5l-7 7 7 7',
    x: 'M18 6L6 18M6 6l12 12',
    send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
    phone: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z',
    upload: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
    filter: 'M22 3H2l8 9.5V19l4 2v-8.5z',
    download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
    link: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
    lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
    route: 'M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 13V9a4 4 0 0 1 4-4h5M18 11v4a4 4 0 0 1-4 4H9',
    play: 'M6 4l14 8-14 8z',
    star: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z',
    truck: 'M1 3h15v13H1zM16 8h4l3 3v5h-7M5.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM18.5 21a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    cal: 'M3 4h18v18H3zM16 2v4M8 2v4M3 10h18'
  };
  const icon = (n, cls) => `<svg class="i ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true"><path d="${P[n] || P.grid}"/></svg>`;

  const ROLES = {
    vendedor: { label: 'Vendedor (Comercial)', user: 'Douglas Souza', ini: 'DS', code: 'DS', unit: 'Filial Goiânia', lvl: 7, xp: 6840, next: 8000, rank: 'Especialista' },
    gerencia: { label: 'Gerência Comercial', user: 'Marina Prado', ini: 'MP', code: 'MP', unit: 'Gerência Centro-Oeste', lvl: 11, xp: 15200, next: 17000, rank: 'Estrategista' },
    mesa: { label: 'Mesa de Crédito (Coordenação)', user: 'Rafael Mourino', ini: 'RM', code: 'RM', unit: 'Mesa de Crédito', lvl: 9, xp: 11050, next: 12500, rank: 'Analista Sênior' },
    diretoria: { label: 'Diretoria Executiva', user: 'Diretoria IRMEN', ini: 'DI', code: 'DI', unit: 'Matriz', lvl: 12, xp: 18000, next: 20000, rank: 'Diretor' },
    admin: { label: 'Administrador do sistema', user: 'Administração', ini: 'AD', code: 'AD', unit: 'Matriz', lvl: 5, xp: 3900, next: 5000, rank: 'Operador' }
  };

  // status: pronto | polir | novo | futuro
  const NAV = [
    { g: 'Cockpit', items: [
      { id: 'painel', label: 'Painel', ic: 'grid', st: 'polir' },
      { id: 'ava', label: 'Ava', ic: 'spark', st: 'polir', tag: 'IA' }
    ]},
    { g: 'Comercial', items: [
      { id: 'funil', label: 'Funil & Kanban', ic: 'layers', st: 'pronto', cnt: 18 },
      { id: 'crm', label: 'Organizações & Contatos', ic: 'building', st: 'polir' },
      { id: 'tarefas', label: 'Tarefas & Agenda', ic: 'check', st: 'novo', cnt: 6 },
      { id: 'simulador', label: 'Nova Operação', ic: 'calc', st: 'pronto' }
    ]},
    { g: 'Crédito', roles: ['mesa', 'gerencia', 'diretoria', 'admin', 'vendedor'], items: [
      { id: 'mesa', label: 'Mesa de Crédito', ic: 'bank', st: 'pronto', cnt: 14, roles: ['mesa', 'gerencia', 'diretoria', 'admin'] },
      { id: 'operacoes', label: 'Operações & Pedidos', ic: 'doc', st: 'pronto' }
    ]},
    { g: 'Conversas', items: [
      { id: 'inbox', label: 'Inbox compartilhado', ic: 'chat', st: 'polir', cnt: 5, arc: true },
      { id: 'whatsapp', label: 'WhatsApp', ic: 'wa', st: 'novo', roles: ['gerencia', 'admin', 'mesa', 'diretoria'] },
      { id: 'suporte', label: 'Suporte interno', ic: 'life', st: 'novo' }
    ]},
    { g: 'Inteligência', items: [
      { id: 'bi', label: 'Relatórios & BI', ic: 'chart', st: 'novo' },
      { id: 'arena', label: 'Arena de Metas', ic: 'trophy', st: 'novo' }
    ]},
    { g: 'Administração', items: [
      { id: 'usuarios', label: 'Usuários & Permissões', ic: 'shield', st: 'pronto', roles: ['mesa', 'gerencia', 'diretoria', 'admin'] },
      { id: 'config', label: 'Configurações', ic: 'cog', st: 'polir', roles: ['mesa', 'diretoria', 'admin'] },
      { id: 'blueprint', label: 'Mapa do produto', ic: 'map', st: 'novo' }
    ]}
  ];

  const PHASES = ['Oportunidade', 'Atendimento', 'Proposta', 'Acompanhamento', 'Negociação', 'Análise de Crédito', 'Formalização', 'Faturada'];
  const PHASE_HINT = ['Lead / indicação', 'Qualificação SANY', 'Cotação enviada', 'Follow-up ativo', 'Alinhamento', '5 bancos oficiais', 'Contrato e CCB', 'Faturamento concluído'];
  const ESTEIRA = [
    { n: 'Triagem documental', ops: 28, v: 78.4, sla: 2.4, pct: 78 },
    { n: 'Análise interna (DRE/IR)', ops: 36, v: 142.6, sla: 3.2, pct: 86 },
    { n: 'Comitê bancário', ops: 34, v: 161.9, sla: 4.6, pct: 66, hot: true },
    { n: 'Crédito aprovado', ops: 24, v: 118.7, sla: 1.8, pct: 75 },
    { n: 'Formalização (Gov.br)', ops: 18, v: 74.1, sla: 2.8, pct: 92 },
    { n: 'Faturamento / Desembolso', ops: 96, v: 438.7, sla: 0.6, pct: 100, win: true }
  ];
  const BANKS = [
    { n: 'Banco Sany', apr: 88, sla: 1.4, tx: 1.29, vol: 42.66 },
    { n: 'Bradesco', apr: 76, sla: 2.2, tx: 1.38, vol: 28.44 },
    { n: 'BBC Digital', apr: 82, sla: 1.8, tx: 1.32, vol: 21.33 },
    { n: 'CEF', apr: 68, sla: 3.5, tx: 1.45, vol: 14.22 },
    { n: 'Itaú', apr: 74, sla: 2.6, tx: 1.40, vol: 11.85 }
  ];
  const MACHINES = [
    { m: 'SY215C', d: 'Escavadeira hidráulica 21,5 t', p: 1380000, q: 6 },
    { m: 'SY135C', d: 'Escavadeira compacta 13,5 t', p: 920000, q: 4 },
    { m: 'SW956K', d: 'Pá carregadeira 5 t', p: 550000, q: 5 },
    { m: 'SY75C', d: 'Miniescavadeira 7,5 t', p: 460000, q: 4 },
    { m: 'SSR120', d: 'Rolo compactador 12 t', p: 520000, q: 2 },
    { m: 'SR285R', d: 'Perfuratriz rotativa', p: 3825000, q: 1 }
  ];

  const ORGS = [
    { id: 'o1', n: 'Construtora Terra Brasilis Ltda', cnpj: '12.345.678/0001-90', seg: 'Construção pesada', city: 'Goiânia · GO', owner: 'DS', score: 'A', docs: 5, docsOk: 4, ltv: 2.9, contacts: [['Paulo Andrade', 'Diretor financeiro', '(62) 9 8811-2044'], ['Bianca Leite', 'Compras', '(62) 9 9120-7731']] },
    { id: 'o2', n: 'Agropecuária Santa Fé Ltda', cnpj: '23.456.789/0001-01', seg: 'Agronegócio', city: 'Rio Verde · GO', owner: 'DS', score: 'A', docs: 6, docsOk: 6, ltv: 1.4, contacts: [['Joaquim Ferraz', 'Sócio', '(64) 9 9932-1100']] },
    { id: 'o3', n: 'Mineração Serra Azul S.A.', cnpj: '34.567.890/0001-12', seg: 'Mineração', city: 'Catalão · GO', owner: 'CE', score: 'B', docs: 7, docsOk: 3, ltv: 6.1, contacts: [['Renata Couto', 'Suprimentos', '(64) 9 8455-0912'], ['Hélio Batista', 'CFO', '(64) 9 9810-4410']] },
    { id: 'o4', n: 'Pavimenta Centro-Oeste', cnpj: '45.678.901/0001-23', seg: 'Pavimentação', city: 'Brasília · DF', owner: 'MS', score: 'B', docs: 5, docsOk: 2, ltv: 0.9, contacts: [['Lucas Mendes', 'Proprietário', '(61) 9 9182-3355']] },
    { id: 'o5', n: 'Locadora Horizonte Máquinas', cnpj: '56.789.012/0001-34', seg: 'Locação', city: 'Anápolis · GO', owner: 'DS', score: 'A', docs: 5, docsOk: 5, ltv: 3.7, contacts: [['Ana Ribeiro', 'Gerente de frota', '(62) 9 9301-6672']] },
    { id: 'o6', n: 'Terraplenagem Vale do Araguaia', cnpj: '67.890.123/0001-45', seg: 'Terraplenagem', city: 'Barra do Garças · MT', owner: 'CE', score: 'C', docs: 6, docsOk: 1, ltv: 0.5, contacts: [['Márcio Vidal', 'Sócio', '(66) 9 9640-2210']] }
  ];

  const DEALS = [
    { id: 'OPP-DS-20261009-A', org: 'o1', eq: '2× SY215C', v: 2760000, ph: 5, own: 'DS', sla: 'warn', next: 'Enviar DRE 2025 ao Bradesco', age: 3 },
    { id: 'OPP-DS-20261010-A', org: 'o2', eq: 'SW956K', v: 550000, ph: 6, own: 'DS', sla: 'good', next: 'Assinatura Gov.br pendente', age: 1 },
    { id: 'OPP-CE-20261013-A', org: 'o3', eq: 'SR285R', v: 3825000, ph: 4, own: 'CE', sla: 'good', next: 'Reunião técnica sexta', age: 2 },
    { id: 'OPP-MS-20261014-A', org: 'o4', eq: 'SSR120 + SY75C', v: 980000, ph: 2, own: 'MS', sla: 'crit', next: 'Cotação vence hoje', age: 6 },
    { id: 'OPP-DS-20261015-A', org: 'o5', eq: '3× SY135C', v: 2760000, ph: 3, own: 'DS', sla: 'good', next: 'Ligar para Ana (frota)', age: 1 },
    { id: 'OPP-CE-20261016-A', org: 'o6', eq: 'SY215C', v: 1380000, ph: 1, own: 'CE', sla: 'warn', next: 'Qualificar capacidade de pagamento', age: 4 },
    { id: 'OPP-DS-20261017-A', org: 'o1', eq: 'SY75C', v: 460000, ph: 0, own: 'DS', sla: 'good', next: 'Primeiro contato via WhatsApp', age: 0 },
    { id: 'OPP-DS-20261017-B', org: 'o2', eq: 'SY135C', v: 920000, ph: 7, own: 'DS', sla: 'good', next: 'Faturada em 18/10', age: 0 },
    { id: 'OPP-CE-20261020-A', org: 'o3', eq: '2× SW956K', v: 1100000, ph: 5, own: 'CE', sla: 'crit', next: 'Comitê CEF parado há 4,6 dias', age: 5 },
    { id: 'OPP-DS-20261020-A', org: 'o5', eq: 'SSR120', v: 520000, ph: 2, own: 'DS', sla: 'good', next: 'Ajustar entrada para 25%', age: 2 },
    { id: 'OPP-MS-20261021-A', org: 'o4', eq: 'SY215C', v: 1380000, ph: 0, own: 'MS', sla: 'good', next: 'Lead de feira (Agrishow)', age: 0 },
    { id: 'OPP-CE-20261021-A', org: 'o6', eq: 'SY75C', v: 460000, ph: 3, own: 'CE', sla: 'warn', next: 'Cliente pediu nova simulação', age: 3 }
  ];

  const TASKS = [
    { t: 'Cobrar Balanço assinado', org: 'o1', deal: 'OPP-DS-20261009-A', due: 'Hoje 10:00', when: 'hoje', pr: 'crit', kind: 'Documento', xp: 20 },
    { t: 'Retornar cotação SSR120 + SY75C', org: 'o4', deal: 'OPP-MS-20261014-A', due: 'Hoje 12:00', when: 'hoje', pr: 'crit', kind: 'Proposta', xp: 30 },
    { t: 'Ligar para Ana sobre frota', org: 'o5', deal: 'OPP-DS-20261015-A', due: 'Hoje 15:30', when: 'hoje', pr: 'warn', kind: 'Ligação', xp: 10 },
    { t: 'Acompanhar assinatura Gov.br', org: 'o2', deal: 'OPP-DS-20261010-A', due: 'Hoje 17:00', when: 'hoje', pr: 'good', kind: 'Follow-up', xp: 10 },
    { t: 'Enviar IR dos sócios à Mesa', org: 'o3', deal: 'OPP-CE-20261020-A', due: 'Ontem', when: 'atrasada', pr: 'crit', kind: 'Documento', xp: 20 },
    { t: 'Visita técnica perfuratriz', org: 'o3', deal: 'OPP-CE-20261013-A', due: 'Sex 24/10 09:00', when: 'proxima', pr: 'good', kind: 'Visita', xp: 40 },
    { t: 'Nova simulação 60 meses', org: 'o6', deal: 'OPP-CE-20261021-A', due: 'Qui 23/10', when: 'proxima', pr: 'warn', kind: 'Proposta', xp: 30 },
    { t: 'Pós-venda: entrega SY135C', org: 'o2', deal: 'OPP-DS-20261017-B', due: 'Seg 27/10', when: 'proxima', pr: 'good', kind: 'Pós-venda', xp: 15 }
  ];

  const CONVS = [
    { id: 'c1', who: 'Paulo Andrade', org: 'o1', ch: 'WhatsApp oficial', last: 'Consigo mandar o balanço amanhã cedo', t: '09:42', unread: 2, deal: 'OPP-DS-20261009-A', assignee: 'DS', msgs: [
      ['in', 'Bom dia Douglas, o banco já respondeu sobre as duas escavadeiras?', '09:31'],
      ['me', 'Bom dia Paulo! O Bradesco está analisando. Falta só o Balanço 2025 assinado pelo contador.', '09:35'],
      ['note', 'Nota interna de Rafael (Mesa): sem o balanço o comitê não abre. Prazo do SLA vence amanhã 14h.', '09:38'],
      ['in', 'Consigo mandar o balanço amanhã cedo', '09:42']
    ]},
    { id: 'c2', who: 'Lucas Mendes', org: 'o4', ch: 'WhatsApp oficial', last: 'Qual seria a parcela com 30% de entrada?', t: '09:15', unread: 1, deal: 'OPP-MS-20261014-A', assignee: 'MS', msgs: [
      ['in', 'Qual seria a parcela com 30% de entrada?', '09:15']
    ]},
    { id: 'c3', who: 'Equipe Mesa de Crédito', org: null, ch: 'Canal interno', last: 'Rafael: priorizar OPP-CE-20261020-A hoje', t: '08:50', unread: 0, msgs: [
      ['in', 'Rafael: priorizar OPP-CE-20261020-A hoje, comitê CEF parado.', '08:50']
    ]},
    { id: 'c4', who: 'Ana Ribeiro', org: 'o5', ch: 'WhatsApp não oficial', last: 'Pode ser às 15h30', t: 'Ontem', unread: 0, deal: 'OPP-DS-20261015-A', assignee: 'DS', msgs: [
      ['me', 'Ana, podemos falar sobre a renovação da frota amanhã?', 'Ontem 17:02'],
      ['in', 'Pode ser às 15h30', 'Ontem 17:10']
    ]},
    { id: 'c5', who: 'Novo contato (62) 9 9455-1020', org: null, ch: 'WhatsApp oficial', last: 'Vi o anúncio da SY75C, ainda tem?', t: 'Ontem', unread: 2, msgs: [
      ['in', 'Olá, vi o anúncio da SY75C, ainda tem disponível?', 'Ontem 19:40'],
      ['in', 'Sou de Trindade, preciso para obra de loteamento', 'Ontem 19:41']
    ]}
  ];

  const INSTANCES = [
    { n: 'IRMEN Comercial', num: '+55 62 3200-1000', api: 'oficial', prov: 'WhatsApp Cloud API (Meta)', st: 'good', stl: 'Conectado', q: 'Alta', unit: 'Matriz', route: 'Fila Comercial → rodízio por unidade', msgs: 1284, tpl: 12, win: '24 h' },
    { n: 'Mesa de Crédito', num: '+55 62 3200-1010', api: 'oficial', prov: 'WhatsApp Cloud API (Meta)', st: 'good', stl: 'Conectado', q: 'Média', unit: 'Mesa de Crédito', route: 'Fila Documentos → analista responsável', msgs: 412, tpl: 6, win: '24 h' },
    { n: 'Douglas Souza', num: '+55 62 9 8800-1042', api: 'nao-oficial', prov: 'Sessão QR (dispositivo do vendedor)', st: 'warn', stl: 'Reconectar em 2 dias', q: 'Sem selo', unit: 'Filial Goiânia', route: 'Carteira própria do vendedor', msgs: 655 },
    { n: 'Filial Rio Verde', num: '+55 64 9 9700-2200', api: 'nao-oficial', prov: 'Sessão QR (aparelho da filial)', st: 'crit', stl: 'Desconectado', q: 'Sem selo', unit: 'Filial Rio Verde', route: 'Fila Filial → rodízio', msgs: 0 }
  ];

  const TICKETS = [
    { id: 'SUP-208', t: 'Upload de DRE falha acima de 15 MB', cat: 'Documentos', pr: 'crit', st: 'Em atendimento', who: 'Douglas Souza', ag: 'TI · Sistemas', sla: '1h 20min restantes' },
    { id: 'SUP-207', t: 'Como registrar perda por concorrência?', cat: 'Dúvida de processo', pr: 'good', st: 'Respondido', who: 'Carlos Eduardo', ag: 'Coordenação Comercial', sla: 'Cumprido' },
    { id: 'SUP-206', t: 'Liberar capability de simulador para nova vendedora', cat: 'Acesso', pr: 'warn', st: 'Aguardando aprovação', who: 'Marina Prado', ag: 'Administração', sla: '6h restantes' },
    { id: 'SUP-205', t: 'Taxa do BBC Digital desatualizada no simulador', cat: 'Crédito', pr: 'warn', st: 'Novo', who: 'Mariana Silveira', ag: 'Mesa de Crédito', sla: '3h restantes' },
    { id: 'SUP-204', t: 'PDF do pedido sem logo da filial', cat: 'Bug', pr: 'good', st: 'Resolvido', who: 'Douglas Souza', ag: 'TI · Sistemas', sla: 'Cumprido' }
  ];

  const USERS = [
    { n: 'Rafael Mourino', e: 'rafael.mourino@irmen.com.br', r: 'Coordenador de Crédito', code: '—', unit: 'Mesa de Crédito', st: 'good', stl: 'Ativo', last: 'agora' },
    { n: 'Marina Prado', e: 'marina.prado@irmen.com.br', r: 'Gerente Comercial', code: 'MP', unit: 'Gerência Centro-Oeste', st: 'good', stl: 'Ativo', last: 'há 12 min' },
    { n: 'Douglas Souza', e: 'douglas.souza@irmen.com.br', r: 'Vendedor', code: 'DS', unit: 'Filial Goiânia', st: 'good', stl: 'Ativo', last: 'há 3 min' },
    { n: 'Carlos Eduardo', e: 'carlos.eduardo@irmen.com.br', r: 'Vendedor', code: 'CE', unit: 'Filial Rio Verde', st: 'good', stl: 'Ativo', last: 'há 1 h' },
    { n: 'Mariana Silveira', e: 'mariana.silveira@irmen.com.br', r: 'Vendedor', code: 'MS', unit: 'Filial Brasília', st: 'good', stl: 'Ativo', last: 'ontem' },
    { n: 'Mateus Silva', e: 'mateus.silva@irmen.com.br', r: 'Vendedor', code: 'MSi', unit: 'Filial Goiânia', st: 'warn', stl: 'Convite enviado', last: '—' },
    { n: 'Juliana Costa', e: 'juliana.costa@irmen.com.br', r: 'Assistente de Crédito', code: '—', unit: 'Mesa de Crédito', st: 'warn', stl: 'Aguardando aprovação', last: '—' },
    { n: 'Pedro Lima', e: 'pedro.lima@irmen.com.br', r: 'Vendedor', code: 'PL', unit: 'Filial Brasília', st: 'crit', stl: 'Bloqueado', last: '02/10' }
  ];
  const CAPS = [
    ['Ver oportunidades próprias', [1, 1, 1, 1, 1]],
    ['Ver oportunidades da equipe', [0, 1, 1, 1, 1]],
    ['Criar e editar oportunidade', [1, 1, 0, 0, 1]],
    ['Simular crédito', [1, 1, 1, 0, 1]],
    ['Decidir banco e status de crédito', [0, 0, 1, 0, 1]],
    ['Emitir pedido (PED)', [1, 1, 1, 0, 1]],
    ['Ver ranking completo', [0, 1, 1, 1, 1]],
    ['Criar metas e desafios', [0, 1, 0, 1, 1]],
    ['Gerenciar instâncias WhatsApp', [0, 1, 0, 0, 1]],
    ['Convidar e aprovar usuários', [0, 1, 1, 0, 1]],
    ['Unidades e filiais', [0, 0, 1, 0, 1]],
    ['Relatórios de BI da empresa', [0, 1, 1, 1, 1]]
  ];
  const CAP_ROLES = ['Vendedor', 'Gerente', 'Coord. Crédito', 'Diretoria', 'Admin'];

  const TEAMS = [
    { n: 'Gerência Centro-Oeste', mgr: 'Marina Prado', pts: 18420, meta: 92, trend: '+3' },
    { n: 'Gerência Sudeste', mgr: 'Felipe Rocha', pts: 16110, meta: 84, trend: '+1' },
    { n: 'Gerência Norte', mgr: 'Sílvia Nunes', pts: 12980, meta: 71, trend: '−2' },
    { n: 'Gerência Sul', mgr: 'André Kuhn', pts: 11040, meta: 66, trend: '0' }
  ];
  const SELLERS = [
    { n: 'Douglas Souza', code: 'DS', meta: 6000000, fat: 6840000, maq: 9, pend: 1, xp: 6840 },
    { n: 'Carlos Eduardo', code: 'CE', meta: 5500000, fat: 5210000, maq: 7, pend: 2, xp: 6120 },
    { n: 'Mariana Silveira', code: 'MS', meta: 5000000, fat: 4300000, maq: 6, pend: 1, xp: 5480 },
    { n: 'Mateus Silva', code: 'MSi', meta: 3500000, fat: 2100000, maq: 3, pend: 4, xp: 2210 }
  ];
  const CHALLENGES = [
    { t: 'Fichas limpas', d: 'Zerar documentos pendentes da sua carteira até sexta.', prog: 3, of: 4, xp: 300, ends: '2 dias', scope: 'Individual', kind: 'qualidade' },
    { t: 'Ofensiva SY215C', d: 'Equipe envia 10 propostas de SY215C neste mês.', prog: 7, of: 10, xp: 800, ends: '9 dias', scope: 'Equipe', kind: 'volume' },
    { t: 'Resposta em 15 min', d: 'Responder 90% dos leads de WhatsApp em até 15 minutos úteis.', prog: 84, of: 90, xp: 400, ends: '5 dias', scope: 'Individual', kind: 'agilidade', pct: true },
    { t: 'Comitê sem gargalo', d: 'Mesa mantém SLA de comitê abaixo de 3 dias por 2 semanas.', prog: 6, of: 10, xp: 600, ends: '6 dias', scope: 'Mesa de Crédito', kind: 'operação' }
  ];
  const BADGES = [
    { n: 'Primeira máquina', d: 'Primeiro PED faturado', on: true, tier: 1 },
    { n: 'Trinca', d: '3 meses seguidos acima da meta', on: true, tier: 2 },
    { n: 'Ficha impecável', d: '20 operações sem retrabalho documental', on: true, tier: 2 },
    { n: 'Relâmpago', d: 'Lead → proposta em menos de 24 h, 10 vezes', on: true, tier: 1 },
    { n: 'Pesado', d: 'Vender uma perfuratriz ou acima de R$ 3 mi', on: false, tier: 3 },
    { n: 'Multibanco', d: 'Aprovações em 4 bancos diferentes', on: false, tier: 2 },
    { n: 'Mentor', d: 'Ajudar 3 colegas a bater meta (indicado pela gerência)', on: false, tier: 3 },
    { n: 'Clube do Milhão', d: 'R$ 10 mi faturados no ano', on: false, tier: 3 }
  ];

  const MODULES = [
    { id: 'painel', n: 'Painel por papel', st: 'polir', d: 'Existe no design-lab com dados de demonstração. Falta ligar a métricas canônicas e o bloco "o que fazer hoje".' },
    { id: 'funil', n: 'Funil & Kanban (8 fases)', st: 'pronto', d: 'Oportunidade, Kanban e tabela publicados. Prova de transições e perda pendente (FUN03).' },
    { id: 'crm', n: 'Clientes → Organizações & Contatos', st: 'polir', d: 'Cadastro e vínculos existem. Proposta: ficha 360º com contatos, timeline, documentos e negócios.' },
    { id: 'tarefas', n: 'Tarefas & Agenda', st: 'novo', d: 'Hoje as próximas ações vivem no card. Proposta: módulo próprio com SLA, lembretes e XP.' },
    { id: 'simulador', n: 'Simulador + Nova Operação', st: 'pronto', d: 'Regras canônicas, PDF e pedido. Proposta: assistente em 5 passos com comparação de bancos.' },
    { id: 'mesa', n: 'Mesa de Crédito (esteira)', st: 'pronto', d: 'Esteira de 6 fases e 5 bancos. Proposta: fila priorizada por SLA em horas úteis.' },
    { id: 'operacoes', n: 'OPP → OP → PED', st: 'pronto', d: 'Códigos canônicos e histórico. Prova de idempotência pendente (FUN04/05).' },
    { id: 'inbox', n: 'Chat compartilhado', st: 'polir', d: 'Já existe. Proposta: inbox único (WhatsApp + interno) com contexto do negócio ao lado.' },
    { id: 'whatsapp', n: 'Instâncias WhatsApp', st: 'novo', d: 'API oficial (Cloud API) e não oficial (QR), roteamento por fila e unidade.' },
    { id: 'suporte', n: 'Suporte interno', st: 'novo', d: 'Chamados com categoria, SLA, responsável e base de conhecimento.' },
    { id: 'bi', n: 'Relatórios & BI', st: 'novo', d: 'Fundação BI parcial. Proposta: 4 painéis com filtros, drill-down e contrato de métrica.' },
    { id: 'arena', n: 'Arena de Metas (gamificação)', st: 'novo', d: 'Metas, desafios, conquistas, níveis e liga por gerência. Depende do cadastro de metas.' },
    { id: 'usuarios', n: 'Usuários & Permissões', st: 'pronto', d: 'Convites, aprovação, papéis e capabilities. Proposta: matriz visual e auditoria.' },
    { id: 'config', n: 'Configurações e unidades', st: 'polir', d: 'Unidades/filiais só aqui. Proposta: identidade visual (white label) e integrações.' },
    { id: 'ava', n: 'Ava (assistente)', st: 'polir', d: 'Leitura documental publicada, operação paga em HOLD. Proposta: barra de comando e briefing diário.' },
    { id: 'config', n: 'Planos e pagamentos', st: 'futuro', d: 'Fora do piloto. Tela reservada para quando houver decisão sobre cobrança.' }
  ];

  const FLOWS = [
    { id: 'lead', n: 'Do lead no WhatsApp ao faturamento', who: 'Vendedor', role: 'vendedor', steps: [
      ['inbox', 'c5', 'Um lead novo chega pelo WhatsApp oficial e cai na fila da filial. A Ava já sugere o equipamento e cria o contato com um clique.'],
      ['crm', 'o1', 'A organização ganha ficha 360º: contatos, documentos exigidos pela Mesa e o histórico de conversa no mesmo lugar.'],
      ['funil', null, 'A oportunidade entra no Kanban. Arraste o card entre as fases: cada movimento grava histórico e responsável.'],
      ['simulador', null, 'O assistente de Nova Operação simula a parcela e compara os 5 bancos antes de enviar à Mesa.'],
      ['mesa', null, 'A Mesa de Crédito recebe a ficha na esteira com SLA de 20 horas úteis contando. O vendedor vê o status, mas não decide o banco.'],
      ['operacoes', null, 'Aprovado, nasce o PED com código canônico e o faturamento fecha o ciclo.'],
      ['arena', null, 'O faturamento validado credita XP e avança a meta individual e a da gerência. Nada é pontuado por clique, só por resultado confirmado.']
    ]},
    { id: 'gestao', n: 'Gestor define meta e acompanha a equipe', who: 'Gerência', role: 'gerencia', steps: [
      ['painel', null, 'O painel da gerência abre com o pacing da meta e quem precisa de ajuda hoje.'],
      ['arena', null, 'A gerente cria um desafio de equipe e ajusta metas individuais. A liga compara gerências, não pessoas de outras equipes.'],
      ['bi', null, 'No BI, clique numa barra para descer até as operações que compõem o número.']
    ]},
    { id: 'docs', n: 'Pendência documental resolvida', who: 'Mesa de Crédito', role: 'mesa', steps: [
      ['painel', null, 'A Mesa vê o gargalo no comitê bancário e as fichas com documentos incompletos.'],
      ['crm', 'o3', 'Na ficha da organização, o checklist mostra exatamente o que falta.'],
      ['inbox', 'c1', 'A cobrança sai pelo WhatsApp com nota interna visível só para a equipe.'],
      ['tarefas', null, 'Uma tarefa com prazo fica com o vendedor responsável e vira alerta se atrasar.']
    ]},
    { id: 'suporte', n: 'Vendedor pede ajuda ao suporte interno', who: 'Vendedor', role: 'vendedor', steps: [
      ['suporte', null, 'O chamado nasce com categoria, prioridade e SLA. A base de conhecimento responde antes, quando possível.'],
      ['usuarios', null, 'Se o pedido é de acesso, a aprovação acontece na matriz de capabilities, com trilha de auditoria.']
    ]}
  ];

  window.IR = { icon, ROLES, NAV, PHASES, PHASE_HINT, ESTEIRA, BANKS, MACHINES, ORGS, DEALS, TASKS, CONVS, INSTANCES, TICKETS, USERS, CAPS, CAP_ROLES, TEAMS, SELLERS, CHALLENGES, BADGES, MODULES, FLOWS };
})();
