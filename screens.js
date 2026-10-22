/* Telas do protótipo. Cada tela devolve HTML; "after" monta gráficos e interações. */
(function () {
  const { icon, ROLES, PHASES, PHASE_HINT, ESTEIRA, BANKS, MACHINES, ORGS, DEALS, TASKS, CONVS, INSTANCES, TICKETS, USERS, CAPS, CAP_ROLES, TEAMS, SELLERS, CHALLENGES, BADGES, MODULES, FLOWS } = window.IR;

  const brl = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  const mi = (v) => 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' mi';
  const org = (id) => ORGS.find((o) => o.id === id) || {};
  const sevLabel = { good: 'No prazo', warn: 'Atenção', crit: 'Atrasado' };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function spark(vals, color) {
    const w = 120, h = 30, mx = Math.max(...vals), mn = Math.min(...vals);
    const pts = vals.map((v, i) => [i * (w / (vals.length - 1)), h - 3 - ((v - mn) / (mx - mn || 1)) * (h - 8)]);
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1];
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><path d="${d} L${w} ${h} L0 ${h}Z" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="${last[0]}" cy="${last[1]}" r="2.6" fill="${color}"/></svg>`;
  }
  function kpi(k) {
    return `<div class="panel kpi ${k.hud ? 'hud' : ''}">
      <div class="k-top"><span class="k-ico ${k.arc ? 'arc' : ''}">${icon(k.ic)}</span><span class="k-lbl">${k.l}</span>${k.pill ? `<span class="pill ${k.pill[0]}" style="margin-left:auto">${k.pill[1]}</span>` : ''}</div>
      <div class="k-val">${k.v}</div>
      ${k.sp ? spark(k.sp, k.arc ? 'var(--arc)' : 'var(--brand)') : ''}
      <div class="k-foot"><span class="delta ${k.dir || 'up'}">${k.d || ''}</span><span>${k.f || ''}</span></div>
    </div>`;
  }
  const contract = (c) => `<details class="contract"><summary>Como este número é calculado</summary><dl>
    <dt>Pergunta</dt><dd>${c.q}</dd><dt>Fórmula</dt><dd>${c.f}</dd><dt>Fonte</dt><dd>${c.s}</dd><dt>Escopo</dt><dd>${c.e || 'Mesmo escopo de acesso do usuário logado'}</dd></dl></details>`;

  /* ---------------- PAINEL ---------------- */
  const PAINEL = {
    vendedor: {
      title: 'Bom dia, Douglas', sub: 'Sua carteira, sua meta e o que precisa de ação hoje.',
      brief: 'Você está a <b>R$ 160 mil</b> de bater a meta de outubro. Duas fichas travam o crédito por falta de documento e a cotação da Pavimenta vence ao meio-dia.',
      acts: [['tarefas', 'Ver 4 ações de hoje'], ['inbox', 'Responder 3 conversas'], ['simulador', 'Nova simulação']],
      kpis: [
        { ic: 'target', l: 'Meta do mês', v: '97,3%', d: '+14,2% vs set', f: 'R$ 5,84 mi de R$ 6,0 mi', sp: [40, 48, 52, 61, 70, 82, 97], hud: true },
        { ic: 'chart', l: 'Faturado no mês', v: 'R$ 5,84 mi', d: '+R$ 920 mil', f: '9 máquinas', sp: [2, 2.5, 3.1, 3.9, 4.6, 5.2, 5.84] },
        { ic: 'layers', l: 'Pipeline aberto', v: 'R$ 6,89 mi', d: '8 propostas', f: '3 quentes', sp: [5, 5.4, 6.1, 5.8, 6.4, 6.6, 6.89], arc: true },
        { ic: 'bank', l: 'Aprovação de crédito', v: '78,5%', d: '+5,2 p.p.', f: 'últimos 90 dias', sp: [70, 72, 71, 75, 74, 77, 78.5], arc: true },
        { ic: 'doc', l: 'Fichas incompletas', v: '2', d: '1 atrasada', dir: 'down', f: 'travando R$ 3,86 mi', pill: ['warn', 'Ação'] },
        { ic: 'flame', l: 'Sequência', v: '3 meses', d: 'acima da meta', f: 'conquista "Trinca"', arc: true }
      ]
    },
    gerencia: {
      title: 'Gerência Centro-Oeste', sub: 'Pacing da equipe, quem precisa de ajuda e onde o funil está parado.',
      brief: 'A equipe está em <b>83,8% da meta</b> com 9 dias úteis restantes; no ritmo atual fecha em <b>101%</b>. Mateus tem 4 fichas pendentes e nenhuma proposta nesta semana.',
      acts: [['arena', 'Ajustar metas'], ['bi', 'Abrir BI da equipe'], ['funil', 'Ver negociações paradas']],
      kpis: [
        { ic: 'target', l: 'Meta da equipe', v: '83,8%', d: 'pacing 101%', f: 'R$ 18,45 mi de R$ 22 mi', sp: [30, 41, 50, 58, 66, 75, 83.8], hud: true },
        { ic: 'chart', l: 'Faturado consolidado', v: 'R$ 18,45 mi', d: '+8% vs plano', f: '27 máquinas', sp: [8, 10, 12, 13.5, 15, 17, 18.45] },
        { ic: 'layers', l: 'Pipeline da equipe', v: 'R$ 38,6 mi', d: '+22,4%', f: '52 negócios abertos', sp: [28, 30, 31, 34, 33, 36, 38.6], arc: true },
        { ic: 'truck', l: 'Ticket médio', v: 'R$ 685 mil', d: '+5,8% a/a', f: 'por máquina', sp: [610, 630, 640, 660, 650, 672, 685], arc: true },
        { ic: 'route', l: 'Conversão lead → faturado', v: '34,2%', d: '+4,1 p.p.', f: 'coorte de julho', sp: [28, 29, 31, 30, 32, 33, 34.2] },
        { ic: 'doc', l: 'Pendências da equipe', v: '8', d: '3 atrasadas', dir: 'down', f: 'documentos', pill: ['warn', 'Auditoria'] }
      ]
    },
    mesa: {
      title: 'Mesa de Crédito', sub: 'Esteira, SLA em horas úteis e desempenho dos 5 bancos parceiros.',
      brief: 'O <b>comitê bancário</b> é o gargalo: 34 operações com SLA médio de 4,6 dias. A CEF concentra os atrasos. 6 fichas aguardam documento do cliente.',
      acts: [['mesa', 'Abrir esteira'], ['crm', 'Ver fichas incompletas'], ['inbox', 'Canal da Mesa']],
      kpis: [
        { ic: 'doc', l: 'Fichas em análise', v: '14', d: '4 prioritárias', f: 'R$ 8,92 mi em triagem', pill: ['crit', 'Triagem'], hud: true },
        { ic: 'clock', l: 'Tempo médio na Mesa', v: '4,2 h úteis', d: '−1,5 h vs semana', f: 'meta interna < 6 h', sp: [6.1, 5.8, 5.4, 5.0, 4.9, 4.6, 4.2], arc: true },
        { ic: 'bank', l: 'Taxa de aprovação', v: '82,4%', d: '+3,1 p.p. a/a', f: 'nos 5 bancos', sp: [76, 78, 79, 80, 81, 82, 82.4] },
        { ic: 'check', l: 'Em formalização', v: 'R$ 4,35 mi', d: '2 assinados hoje', f: '7 operações Gov.br / CCB', sp: [2, 2.6, 3.1, 3.4, 3.9, 4.1, 4.35], arc: true },
        { ic: 'alert', l: 'Gargalo atual', v: 'Comitê', d: '+4,6 dias', dir: 'down', f: '34 operações', pill: ['warn', 'Gargalo'] },
        { ic: 'upload', l: 'Docs incompletos', v: '6 fichas', d: 'aguardando DRE/IR', dir: 'down', f: 'cobrança automática ativa' }
      ]
    },
    diretoria: {
      title: 'Diretoria Executiva', sub: 'Meta anual, receita, volume financiado e eficiência do ciclo.',
      brief: 'O ano está em <b>79,3% da meta</b> no fim de setembro, 28,5% acima de 2025. O lead time caiu para 8,5 dias. Atenção à concentração de 36% do volume em um banco.',
      acts: [['bi', 'Relatório executivo'], ['arena', 'Liga das gerências'], ['mesa', 'Risco por banco']],
      kpis: [
        { ic: 'target', l: 'Meta anual', v: '79,3%', d: 'YTD', f: 'R$ 142,8 mi de R$ 180 mi', sp: [10, 22, 33, 45, 57, 68, 79.3], hud: true },
        { ic: 'chart', l: 'Receita faturada YTD', v: 'R$ 142,8 mi', d: '+28,5% a/a', f: 'jan–set', sp: [12, 28, 45, 62, 88, 115, 142.8] },
        { ic: 'bank', l: 'Volume financiado', v: 'R$ 118,5 mi', d: '83% das vendas', f: 'via 5 bancos', sp: [9, 22, 38, 55, 76, 98, 118.5], arc: true },
        { ic: 'spark', l: 'Spread operacional', v: '8,45%', d: '+0,65 p.p.', f: 'bruto originado', sp: [7.6, 7.8, 8.0, 8.1, 8.2, 8.3, 8.45], arc: true },
        { ic: 'clock', l: 'Lead time de venda', v: '8,5 dias', d: '−2,1 dias', f: 'lead → desembolso', sp: [12, 11.4, 10.8, 10, 9.6, 9, 8.5] },
        { ic: 'shield', l: 'Inadimplência', v: '0,00%', d: 'sem default', f: 'carteira originada', pill: ['good', 'Controlado'] }
      ]
    }
  };
  PAINEL.admin = PAINEL.mesa;

  function painel(st) {
    const p = PAINEL[st.role];
    const fun = st.role === 'vendedor' ? [4, 3, 3, 2, 2, 2, 1, 4] : st.role === 'diretoria' ? [48, 41, 36, 30, 26, 22, 18, 208] : [12, 10, 9, 7, 6, 5, 3, 27];
    const val = st.role === 'vendedor' ? [3.1, 2.4, 2.5, 1.8, 1.6, 1.9, 1.2, 2.45] : st.role === 'diretoria' ? [34.2, 29.8, 26.1, 21.5, 18.9, 16.1, 13.2, 142.8] : [8.9, 7.4, 6.8, 5.2, 4.6, 3.8, 1.9, 18.45];
    const myTasks = TASKS.filter((t) => t.when !== 'proxima').slice(0, 5);
    const showEsteira = st.role === 'mesa' || st.role === 'admin';
    return `
    <div class="head"><div class="grow"><div class="eyebrow">${ROLES[st.role].label} · outubro 2026</div><h1>${p.title}</h1><p>${p.sub}</p></div>
      <div class="seg" role="group" aria-label="Período"><button class="on">30 dias</button><button>Trimestre</button><button>Semestre</button><button>Ano</button></div>
      <a class="btn pri" href="#simulador" data-go="simulador">${icon('plus')}Nova operação</a></div>

    <section class="panel brief" id="t-brief"><span class="orb" aria-hidden="true"></span><div style="flex:1;min-width:240px"><div class="eyebrow">Briefing da Ava · 08:00</div><p>${p.brief}</p>
      <div class="acts">${p.acts.map((a) => `<a class="btn sm arc" href="#${a[0]}" data-go="${a[0]}">${a[1]}${icon('arrow')}</a>`).join('')}</div></div>
      <div class="health" aria-label="Saúde operacional"><span class="pill good">Comercial</span><span class="pill good">Crédito</span><span class="pill warn">SLA esteira · 17 ops</span><span class="pill good">5 bancos</span><span class="pill warn">Meta 83,8%</span></div></section>

    <div class="grid g6" id="t-kpis">${p.kpis.map(kpi).join('')}</div>

    <div class="grid" style="grid-template-columns:minmax(0,1.35fr) minmax(0,1fr)">
      <section class="panel" id="t-acao"><div class="ph"><h3>Precisa de ação hoje</h3><span class="sub">Ordenado por prazo e impacto no faturamento</span><div class="r"><a class="btn sm ghost" href="#tarefas" data-go="tarefas">Ver agenda</a></div></div>
        <div class="list">${myTasks.map((t) => `<div class="li"><span class="sev ${t.pr}"></span><div style="min-width:0"><div class="t">${t.t}</div><div class="s">${org(t.org).n} · <span class="mono">${t.deal}</span></div></div><div class="end"><span class="pill ${t.pr}">${t.due}</span><span class="dim mono" style="font-size:11px">+${t.xp} XP</span></div></div>`).join('')}</div></section>
      <section class="panel hud"><div class="ph"><h3>${st.role === 'diretoria' ? 'Meta anual' : st.role === 'mesa' ? 'SLA da esteira' : 'Meta vs realizado'}</h3><div class="r"><span class="sample">Exemplo</span></div></div>
        <div id="ch-gauge" class="chart"></div>
        <div class="list">${[['Projeção no ritmo atual', '101%', 'good'], ['Faltam', st.role === 'vendedor' ? 'R$ 160 mil' : 'R$ 3,55 mi', ''], ['Dias úteis restantes', '7', ''], ['Ritmo necessário por dia útil', st.role === 'vendedor' ? 'R$ 22,9 mil' : 'R$ 507 mil', 'arc']].map((r) => `<div class="li" style="padding:8px 2px"><span class="muted" style="flex:1">${r[0]}</span><b class="num" style="${r[2] ? 'color:var(--' + r[2] + ')' : ''}">${r[1]}</b></div>`).join('')}</div></section>
    </div>

    <section class="panel"><div class="ph"><h3>${showEsteira ? 'Esteira de crédito · 6 fases' : 'Funil comercial · 8 fases canônicas'}</h3><span class="sub">${showEsteira ? 'Volume total 236 operações · SLA por fase' : 'Clique numa fase para abrir o Kanban filtrado'}</span><div class="r">${showEsteira ? '<span class="pill warn">Gargalo: comitê bancário +4,6 d</span>' : '<span class="pill good">8 fases</span>'}</div></div>
      <div class="phases" ${showEsteira ? 'style="grid-template-columns:repeat(6,minmax(140px,1fr))"' : ''}>${showEsteira
        ? ESTEIRA.map((e, i) => `<a class="phase ${e.hot ? 'hot' : ''} ${e.win ? 'win' : ''}" href="#mesa" data-go="mesa" style="text-decoration:none;color:inherit"><small>FASE 0${i + 1}</small><b>${e.n}</b><span class="n">${e.ops}</span><span class="v">R$ ${e.v.toLocaleString('pt-BR')} mi</span><div class="bar ${e.hot ? 'warn' : 'good'}"><i style="width:${e.pct}%"></i></div><span class="dim" style="font-size:11px">SLA ${e.sla.toLocaleString('pt-BR')} d · ${e.pct}% no prazo</span></a>`).join('')
        : PHASES.map((ph, i) => `<a class="phase ${i === 7 ? 'win' : ''}" href="#funil" data-go="funil" style="text-decoration:none;color:inherit"><small>FASE 0${i + 1}</small><b>${ph}</b><span class="n">${fun[i]}</span><span class="v">R$ ${val[i].toLocaleString('pt-BR')} mi</span><span class="dim" style="font-size:11px">${PHASE_HINT[i]}</span></a>`).join('')}</div></section>

    <div class="grid g3">
      <section class="panel"><div class="ph"><h3>Evolução do faturamento</h3><div class="r"><span class="sample">Exemplo</span></div></div><div id="ch-evo" class="chart sm"></div></section>
      <section class="panel"><div class="ph"><h3>${st.role === 'vendedor' ? 'Minha posição na equipe' : 'Ranking da equipe'}</h3><div class="r"><a class="btn sm ghost" href="#arena" data-go="arena">Arena</a></div></div>
        <div class="list league">${SELLERS.map((s, i) => `<div class="li ${i === 0 ? 'top' : ''}"><span class="pos">${i + 1}</span><span class="av sm">${s.code}</span><div style="min-width:0;flex:1"><div class="t">${s.n}${s.code === 'DS' && st.role === 'vendedor' ? ' <span class="pill arc nodot">você</span>' : ''}</div><div class="bar ${s.fat >= s.meta ? 'good' : ''}" style="margin-top:6px"><i style="width:${Math.min(100, s.fat / s.meta * 100)}%"></i></div></div><div class="end"><b class="num">${Math.round(s.fat / s.meta * 100)}%</b><span class="dim" style="font-size:11px">${s.maq} máq.</span></div></div>`).join('')}</div></section>
      <section class="panel"><div class="ph"><h3>Linha do tempo</h3><div class="r"><span class="pill arc">Ao vivo</span></div></div>
        <div class="list">${[['10:24', 'good', 'Crédito aprovado', 'Banco Sany aprovou R$ 1,38 mi · OPP-DS-20261009-A'], ['09:15', 'good', 'Faturamento concluído', '2× SY215C faturadas'], ['08:47', 'warn', 'Alerta de SLA', 'CEF atingiu 3,5 dias no comitê'], ['07:30', 'arc', 'Assinatura Gov.br', 'Contrato PED-902 assinado pelo cliente']].map((e) => `<div class="li"><span class="mono dim" style="font-size:11.5px;width:42px">${e[0]}</span><span class="sev ${e[1]}"></span><div><div class="t">${e[2]}</div><div class="s">${e[3]}</div></div></div>`).join('')}</div></section>
    </div>`;
  }

  /* ---------------- FUNIL ---------------- */
  function funil(st) {
    const view = st.funilView || 'kanban';
    const deals = DEALS;
    const total = deals.filter((d) => d.ph < 7).reduce((a, d) => a + d.v, 0);
    const card = (d) => `<button class="kcard" draggable="true" data-deal="${d.id}" aria-label="${org(d.org).n}, ${d.eq}">
        <span class="row" style="justify-content:space-between;width:100%"><span class="mono dim" style="font-size:10.5px">${d.id}</span><span class="pill ${d.sla}">${d.age} d</span></span>
        <span class="org">${org(d.org).n}</span><span class="eq">${d.eq}</span>
        <span class="row" style="justify-content:space-between;width:100%"><span class="val">${brl(d.v)}</span><span class="av sm">${d.own}</span></span>
        <span class="meta">${icon('clock')}${d.next}</span></button>`;
    return `
    <div class="head"><div class="grow"><div class="eyebrow">CRM comercial · 8 etapas</div><h1>Funil de vendas & oportunidades</h1><p>Arraste os cards entre as fases. As fases 7 e 8 avançam sozinhas quando a Mesa formaliza e fatura.</p></div>
      <a class="btn pri" href="#simulador" data-go="simulador">${icon('plus')}Nova oportunidade</a></div>
    <div class="grid g4">
      ${kpi({ ic: 'layers', l: 'Pipeline aberto', v: mi(total), f: deals.filter((d) => d.ph < 7).length + ' oportunidades' })}
      ${kpi({ ic: 'check', l: 'Ganhas / perdidas (30 d)', v: '4 / 1', f: 'perda: preço (concorrência)', arc: true })}
      ${kpi({ ic: 'route', l: 'Conversão (coorte jul)', v: '34,2%', f: 'lead → faturado' })}
      ${kpi({ ic: 'clock', l: 'Tempo médio em aberto', v: '12,7 dias', f: 'desde a criação', arc: true })}
    </div>
    <div class="row" style="gap:8px">
      <div class="field" style="flex:1 1 240px"><label for="f-busca">Busca</label><input id="f-busca" placeholder="OPP, OP, cliente ou documento"></div>
      <div class="field" style="flex:0 1 200px"><label for="f-vend">Vendedor</label><select id="f-vend"><option>Todos no meu escopo</option><option>Douglas Souza</option><option>Carlos Eduardo</option><option>Mariana Silveira</option></select></div>
      <div class="field" style="flex:0 1 160px"><label for="f-mod">Modalidade</label><select id="f-mod"><option>Todas</option><option>Financiamento bancário</option><option>Consórcio</option><option>À vista</option></select></div>
      <div class="seg arc" style="align-self:flex-end" role="group" aria-label="Visualização"><button data-fv="kanban" class="${view === 'kanban' ? 'on' : ''}">Kanban</button><button data-fv="tabela" class="${view === 'tabela' ? 'on' : ''}">Tabela</button></div>
    </div>
    ${view === 'kanban' ? `<div class="kanban" id="t-kanban">${PHASES.map((ph, i) => {
      const ds = deals.filter((d) => d.ph === i);
      return `<section class="kcol" data-ph="${i}" aria-label="${ph}"><header><span class="pill ${i === 7 ? 'good' : 'neutral'} nodot mono">${i + 1}</span><b>${ph}</b><span class="sum">${ds.length} · ${mi(ds.reduce((a, d) => a + d.v, 0))}</span></header>
        ${i >= 6 ? '<span class="pill warn nodot" style="align-self:flex-start">Avanço automático pela Mesa</span>' : ''}
        ${ds.map(card).join('') || '<div class="empty">Arraste oportunidades para cá</div>'}</section>`;
    }).join('')}</div>` : `<section class="panel"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Oportunidade</th><th>Organização</th><th>Equipamento</th><th>Fase</th><th>Responsável</th><th>Próxima ação</th><th class="r">Valor</th></tr></thead><tbody>
      ${deals.map((d) => `<tr><td class="mono">${d.id}</td><td>${org(d.org).n}</td><td>${d.eq}</td><td><span class="pill ${d.ph === 7 ? 'good' : 'neutral'}">${PHASES[d.ph]}</span></td><td><span class="av sm">${d.own}</span></td><td class="muted">${d.next}</td><td class="r mono">${brl(d.v)}</td></tr>`).join('')}</tbody></table></div></section>`}`;
  }

  /* ---------------- CRM ---------------- */
  function crm(st) {
    const o = org(st.orgSel || 'o1');
    const deals = DEALS.filter((d) => d.org === o.id);
    const docs = ['Contrato social', 'Balanço 2025 assinado', 'DRE 2025', 'IR dos sócios', 'Comprovante de endereço', 'Faturamento 12 meses', 'Certidões negativas'].slice(0, o.docs);
    return `
    <div class="head"><div class="grow"><div class="eyebrow">CRM · multi-organização</div><h1>Organizações & contatos</h1><p>Cada cliente é uma organização com várias pessoas, negócios, conversas e documentos. Tudo o que a Mesa exige aparece aqui antes de virar pendência.</p></div>
      <button class="btn">${icon('upload')}Importar planilha</button><button class="btn pri">${icon('plus')}Nova organização</button></div>
    <div class="grid" style="grid-template-columns:minmax(0,320px) minmax(0,1fr)" id="t-crm">
      <section class="panel" style="padding:10px"><div class="field" style="padding:4px 4px 10px"><label for="crm-q">Buscar</label><input id="crm-q" placeholder="Nome, CNPJ ou contato"></div>
        <div class="row" style="padding:0 4px 8px"><span class="chip on">Todas</span><span class="chip">Minha carteira</span><span class="chip">Com pendência</span></div>
        ${ORGS.map((x) => `<button class="conv ${x.id === o.id ? 'on' : ''}" data-org="${x.id}"><span class="av sm">${x.n.split(' ').slice(0, 2).map((w) => w[0]).join('')}</span><span style="min-width:0;flex:1"><span class="who" style="display:block">${x.n}</span><span class="last" style="display:block">${x.seg} · ${x.city}</span></span>${x.docsOk < x.docs ? `<span class="pill warn">${x.docs - x.docsOk}</span>` : '<span class="pill good">ok</span>'}</button>`).join('')}
      </section>
      <div class="col" style="gap:16px">
        <section class="panel hud"><div class="row" style="align-items:flex-start;gap:16px">
          <span class="logo" style="width:52px;height:52px;font-size:18px">${o.n.split(' ').slice(0, 2).map((w) => w[0]).join('')}</span>
          <div style="flex:1;min-width:220px"><h2 style="margin:0;font:700 22px var(--f-display)">${o.n}</h2><div class="muted mono" style="font-size:12.5px">CNPJ ${o.cnpj} · ${o.city}</div>
            <div class="row" style="margin-top:8px"><span class="pill arc">${o.seg}</span><span class="pill ${o.score === 'A' ? 'good' : o.score === 'B' ? 'warn' : 'crit'}">Perfil ${o.score}</span><span class="pill neutral">Carteira de ${o.owner}</span></div></div>
          <div class="row"><a class="btn" href="#inbox" data-go="inbox">${icon('wa')}WhatsApp</a><a class="btn" href="#tarefas" data-go="tarefas">${icon('check')}Tarefa</a><a class="btn pri" href="#simulador" data-go="simulador">${icon('plus')}Oportunidade</a></div></div>
          <div class="grid g4" style="margin-top:16px">
            <div><div class="dim" style="font-size:12px">Comprado (histórico)</div><b class="num" style="font-size:20px">R$ ${o.ltv.toLocaleString('pt-BR')} mi</b></div>
            <div><div class="dim" style="font-size:12px">Negócios abertos</div><b class="num" style="font-size:20px">${deals.filter((d) => d.ph < 7).length}</b></div>
            <div><div class="dim" style="font-size:12px">Documentos</div><b class="num" style="font-size:20px">${o.docsOk}/${o.docs}</b></div>
            <div><div class="dim" style="font-size:12px">Último contato</div><b class="num" style="font-size:20px">hoje</b></div></div></section>
        <div class="grid g2">
          <section class="panel"><div class="ph"><h3>Contatos</h3><div class="r"><button class="btn sm">${icon('plus')}Contato</button></div></div>
            <div class="list">${o.contacts.map((c) => `<div class="li"><span class="av sm">${c[0].split(' ').map((w) => w[0]).join('')}</span><div><div class="t">${c[0]}</div><div class="s">${c[1]}</div></div><div class="end"><span class="mono" style="font-size:12px">${c[2]}</span></div></div>`).join('')}</div></section>
          <section class="panel" id="t-docs"><div class="ph"><h3>Checklist da Mesa</h3><span class="sub">Exigidos para análise de crédito</span></div>
            <div class="list">${docs.map((d, i) => { const ok = i < o.docsOk; return `<div class="li"><span class="sev ${ok ? 'good' : 'warn'}"></span><div class="t" style="flex:1">${d}</div><span class="pill ${ok ? 'good' : 'warn'}">${ok ? 'Recebido' : 'Pendente'}</span></div>`; }).join('')}</div>
            ${o.docsOk < o.docs ? '<button class="btn sm arc" style="margin-top:10px">' + icon('wa') + 'Cobrar pendências pelo WhatsApp</button>' : ''}</section>
        </div>
        <div class="grid g2">
          <section class="panel"><div class="ph"><h3>Negócios</h3></div>
            <div class="list">${deals.map((d) => `<div class="li"><div style="flex:1;min-width:0"><div class="t">${d.eq}</div><div class="s mono">${d.id}</div></div><div class="end"><span class="pill ${d.ph === 7 ? 'good' : 'neutral'}">${PHASES[d.ph]}</span><span class="mono" style="font-size:12px">${brl(d.v)}</span></div></div>`).join('') || '<div class="empty">Nenhum negócio ainda</div>'}</div></section>
          <section class="panel"><div class="ph"><h3>Linha do tempo</h3></div>
            <div class="list">${[['wa', 'WhatsApp', 'Cliente prometeu balanço para amanhã', 'hoje 09:42'], ['bank', 'Mesa', 'Bradesco pediu DRE atualizada', 'ontem'], ['doc', 'Documento', 'Contrato social v3 anexado', '14/10'], ['calc', 'Simulação', '2× SY215C · 48 meses · 20% entrada', '09/10']].map((e) => `<div class="li">${icon(e[0])}<div style="flex:1"><div class="t">${e[2]}</div><div class="s">${e[1]} · ${e[3]}</div></div></div>`).join('')}</div></section>
        </div>
      </div>
    </div>`;
  }

  /* ---------------- TAREFAS ---------------- */
  function tarefas(st) {
    const groups = [['atrasada', 'Atrasadas', 'crit'], ['hoje', 'Hoje', 'warn'], ['proxima', 'Próximos dias', 'arc']];
    const days = ['Seg 20', 'Ter 21', 'Qua 22', 'Qui 23', 'Sex 24'];
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Produtividade</div><h1>Tarefas & agenda</h1><p>Toda tarefa está ligada a uma organização ou negócio. Concluir no prazo vale XP; atrasos aparecem para a gerência sem expor o vendedor publicamente.</p></div>
      <button class="btn pri" id="t-newtask">${icon('plus')}Nova tarefa</button></div>
    <div class="grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">
      <section class="panel" id="t-tasks">${groups.map((g) => {
        const ts = TASKS.filter((t) => t.when === g[0]);
        return `<div class="ph" style="margin-top:6px"><h3>${g[1]}</h3><span class="pill ${g[2]} nodot">${ts.length}</span></div><div class="list" style="margin-bottom:12px">${ts.map((t, i) => `<label class="li" style="cursor:pointer"><input type="checkbox" class="tk" data-xp="${t.xp}" style="width:18px;height:18px;accent-color:var(--good);margin-top:2px"><span class="sev ${t.pr}"></span><span style="flex:1;min-width:0"><span class="t" style="display:block">${t.t}</span><span class="s">${t.kind} · ${org(t.org).n} · <span class="mono">${t.deal}</span></span></span><span class="end"><span class="pill ${t.pr}">${t.due}</span><span class="dim mono" style="font-size:11px">+${t.xp} XP</span></span></label>`).join('')}</div>`;
      }).join('')}</section>
      <div class="col" style="gap:16px">
        <section class="panel"><div class="ph"><h3>Semana</h3><div class="r"><span class="pill arc">Sincroniza com Google/Outlook</span></div></div>
          <div class="grid" style="grid-template-columns:repeat(5,minmax(0,1fr));gap:6px">${days.map((d, i) => `<div style="border:1px solid ${i === 2 ? 'var(--arc)' : 'var(--line)'};border-radius:8px;padding:8px;min-height:150px;background:${i === 2 ? 'var(--arc-soft)' : 'transparent'}"><div style="font:600 11px var(--f-display);letter-spacing:.08em">${d}</div>${(i === 2 ? ['10:00 Balanço', '12:00 Cotação', '15:30 Ana'] : i === 3 ? ['Simulação 60m'] : i === 4 ? ['09:00 Visita'] : i === 0 ? ['Reunião equipe'] : []).map((e) => `<div style="margin-top:6px;font-size:11px;padding:4px 6px;border-radius:5px;background:var(--panel-solid);border:1px solid var(--line)">${e}</div>`).join('')}</div>`).join('')}</div></section>
        <section class="panel hud"><div class="ph"><h3>Disciplina comercial</h3></div>
          <div class="grid g2"><div><div class="dim" style="font-size:12px">No prazo (30 d)</div><b class="num" style="font-size:26px">91%</b><div class="bar good" style="margin-top:6px"><i style="width:91%"></i></div></div>
          <div><div class="dim" style="font-size:12px">Tempo de 1ª resposta</div><b class="num" style="font-size:26px">11 min</b><div class="bar" style="margin-top:6px"><i style="width:73%"></i></div></div></div>
          <p class="muted" style="font-size:12.5px;margin:12px 0 0">Esses dois números alimentam o desafio "Resposta em 15 min" da Arena.</p></section>
      </div>
    </div>`;
  }

  /* ---------------- SIMULADOR ---------------- */
  function simulador(st) {
    const s = st.sim;
    const m = MACHINES[s.m];
    const fin = m.p * s.q * (1 - s.ent / 100);
    const rows = BANKS.map((b) => { const r = b.tx / 100; const pmt = fin * r / (1 - Math.pow(1 + r, -s.prazo)); return { ...b, pmt }; }).sort((a, b) => a.pmt - b.pmt);
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Nova operação · assistente</div><h1>Simular e enviar à Mesa</h1><p>Cinco passos curtos. O vendedor compara condições, mas a escolha do banco e a decisão de crédito continuam com a Mesa.</p></div></div>
    <div class="steps" aria-label="Etapas">${['Cliente', 'Equipamento', 'Condições', 'Documentos', 'Envio à Mesa'].map((x, i) => `<span class="step ${i < 2 ? 'done' : i === 2 ? 'on' : ''}"><i>${i + 1}</i>${x}</span>`).join('')}</div>
    <div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr)" id="t-sim">
      <section class="panel hud"><div class="ph"><h3>Condições</h3><div class="r"><span class="pill neutral">Construtora Terra Brasilis</span></div></div>
        <div class="col" style="gap:14px">
          <div class="field"><label for="sim-m">Equipamento</label><select id="sim-m">${MACHINES.map((x, i) => `<option value="${i}" ${i === s.m ? 'selected' : ''}>${x.m} · ${x.d} · ${brl(x.p)}</option>`).join('')}</select></div>
          <div class="grid g3"><div class="field"><label for="sim-q">Quantidade</label><input id="sim-q" type="number" min="1" max="20" value="${s.q}"></div>
          <div class="field"><label for="sim-mod">Modalidade</label><select id="sim-mod"><option>Financiamento bancário</option><option>Consórcio</option><option>À vista</option></select></div>
          <div class="field"><label for="sim-car">Carência</label><select id="sim-car"><option>Sem carência</option><option selected>60 dias</option><option>90 dias</option></select></div></div>
          <div class="field"><label for="sim-ent">Entrada: <b class="num">${s.ent}%</b> · ${brl(m.p * s.q * s.ent / 100)}</label><input id="sim-ent" type="range" min="0" max="60" step="5" value="${s.ent}"></div>
          <div class="field"><label for="sim-pr">Prazo: <b class="num">${s.prazo} meses</b></label><input id="sim-pr" type="range" min="12" max="72" step="6" value="${s.prazo}"></div>
          <div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:12px"><span class="muted">Valor financiado</span><b class="num" style="font-size:22px">${brl(fin)}</b></div>
        </div></section>
      <section class="panel"><div class="ph"><h3>Comparação entre bancos</h3><span class="sub">Taxas de referência cadastradas pela Mesa · tabela Price</span></div>
        <div class="list">${rows.map((b, i) => `<div class="li"><span class="pos num" style="width:22px;color:${i === 0 ? 'var(--arc)' : 'var(--fg-3)'}">${i + 1}</span><div style="flex:1;min-width:0"><div class="t">${b.n}</div><div class="s">${b.tx.toLocaleString('pt-BR')}% a.m. · aprovação histórica ${b.apr}% · SLA ${b.sla.toLocaleString('pt-BR')} d</div></div><div class="end"><b class="num" style="font-size:18px">${brl(b.pmt)}</b><span class="dim" style="font-size:11px">por mês</span></div></div>`).join('')}</div>
        <div class="row" style="margin-top:14px;justify-content:flex-end"><button class="btn">${icon('download')}PDF da proposta</button><a class="btn pri" href="#mesa" data-go="mesa">${icon('send')}Enviar à Mesa de Crédito</a></div></section>
    </div>`;
  }

  /* ---------------- MESA ---------------- */
  const OPS = [
    { id: 'OP-DS-20261009-A', org: 'o1', eq: '2× SY215C', v: 2760000, fase: 2, sla: 'crit', h: '18 h úteis', banks: [['Banco Sany', 'Aprovado', 'good'], ['Bradesco', 'Pendente', 'warn'], ['Itaú', 'Recebida', 'arc']] },
    { id: 'OP-CE-20261020-A', org: 'o3', eq: '2× SW956K', v: 1100000, fase: 2, sla: 'crit', h: '22 h úteis', banks: [['CEF', 'Pendente', 'warn'], ['BBC Digital', 'Recebida', 'arc']] },
    { id: 'OP-DS-20261010-A', org: 'o2', eq: 'SW956K', v: 550000, fase: 4, sla: 'good', h: '6 h úteis', banks: [['Bradesco', 'Aprovado', 'good']] },
    { id: 'OP-MS-20261014-A', org: 'o4', eq: 'SSR120 + SY75C', v: 980000, fase: 0, sla: 'warn', h: '12 h úteis', banks: [] },
    { id: 'OP-CE-20261016-A', org: 'o6', eq: 'SY215C', v: 1380000, fase: 1, sla: 'good', h: '4 h úteis', banks: [['Banco Sany', 'Reprovado', 'crit'], ['BBC Digital', 'Pendente', 'warn']] }
  ];
  function mesa(st) {
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Crédito · esteira</div><h1>Mesa de Crédito</h1><p>Fila priorizada pelo SLA de 20 horas úteis (8h–18h, seg–sex, feriados nacionais). Cada banco tem status próprio na mesma operação.</p></div>
      <div class="seg" role="group" aria-label="Fila"><button class="on">Minha fila</button><button>Toda a Mesa</button></div></div>
    <div class="phases" style="grid-template-columns:repeat(6,minmax(140px,1fr))">${ESTEIRA.map((e, i) => `<div class="phase ${e.hot ? 'hot' : ''} ${e.win ? 'win' : ''}"><small>FASE 0${i + 1}${e.hot ? ' · GARGALO' : ''}</small><b>${e.n}</b><span class="n">${e.ops}</span><span class="v">R$ ${e.v.toLocaleString('pt-BR')} mi</span><div class="bar ${e.hot ? 'warn' : 'good'}"><i style="width:${e.pct}%"></i></div></div>`).join('')}</div>
    <section class="panel" id="t-fila"><div class="ph"><h3>Fila de decisão</h3><span class="sub">Ordenada por tempo restante de SLA</span><div class="r"><span class="chip on">Todas</span><span class="chip">Aguardando documento</span><span class="chip">Comitê</span></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Operação</th><th>Cliente</th><th>Equipamento</th><th>Fase</th><th>Bancos</th><th>SLA</th><th class="r">Valor</th></tr></thead><tbody>
      ${OPS.map((o) => `<tr><td class="mono">${o.id}</td><td>${org(o.org).n}<div class="dim" style="font-size:11.5px">${org(o.org).cnpj}</div></td><td>${o.eq}</td><td>${ESTEIRA[o.fase].n}</td><td><div class="row" style="gap:4px">${o.banks.map((b) => `<span class="pill ${b[2]}" title="${b[0]}">${b[0].split(' ')[0]} · ${b[1]}</span>`).join('') || '<span class="dim">Triagem</span>'}</div></td><td><span class="pill ${o.sla}">${o.h}</span></td><td class="r mono">${brl(o.v)}</td></tr>`).join('')}</tbody></table></div></section>
    <div class="grid" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">
      <section class="panel"><div class="ph"><h3>Desempenho dos 5 bancos</h3><span class="sub">Aprovação, SLA de resposta e taxa média</span></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Banco</th><th class="r">Aprovação</th><th class="r">SLA</th><th class="r">Taxa</th><th class="r">Volume</th></tr></thead><tbody>
        ${BANKS.map((b, i) => `<tr><td><span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--c${i + 1});margin-right:8px"></span>${b.n}</td><td class="r">${b.apr}%</td><td class="r">${b.sla.toLocaleString('pt-BR')} d</td><td class="r">${b.tx.toLocaleString('pt-BR')}%</td><td class="r">R$ ${b.vol.toLocaleString('pt-BR')} mi</td></tr>`).join('')}</tbody></table></div></section>
      <section class="panel hud"><div class="ph"><h3>Distribuição por banco</h3><div class="r"><span class="sample">Exemplo</span></div></div><div id="ch-banks" class="chart sm"></div></section>
    </div>`;
  }

  /* ---------------- OPERACOES ---------------- */
  function operacoes(st) {
    const steps = [['OPP', 'OPP-DS-20261009-A', 'Oportunidade criada', '09/10 14:02', 'done'], ['OP', 'OP-DS-20261009-A', 'Operação enviada à Mesa', '11/10 10:15', 'done'], ['Crédito', 'Banco Sany', 'Aprovado · R$ 2,21 mi', '20/10 16:40', 'done'], ['Formalização', 'Gov.br + CCB', 'Aguardando assinatura do cliente', 'agora', 'on'], ['PED', 'PED-DS-20261022-A', 'Pedido e faturamento', '—', '']];
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Centro de operações</div><h1>Operações & pedidos</h1><p>OPP → OP → PED com códigos canônicos, histórico imutável e o status de cada instituição financeira na mesma linha.</p></div>
      <button class="btn">${icon('download')}Exportar CSV</button></div>
    <div class="grid g4">
      ${kpi({ ic: 'chart', l: 'Volume em operação', v: 'R$ 2,69 mi', f: '2 operações' })}
      ${kpi({ ic: 'clock', l: 'Aguardando decisão', v: '0', f: 'crédito aplicável', arc: true })}
      ${kpi({ ic: 'check', l: 'Crédito aprovado', v: '2', f: 'integral ou condicional', pill: ['good', 'ok'] })}
      ${kpi({ ic: 'x', l: 'Crédito reprovado', v: '0', f: 'não aplicáveis', arc: true })}
    </div>
    <section class="panel hud" id="t-ped"><div class="ph"><h3>Jornada da operação</h3><span class="sub">Construtora Terra Brasilis · 2× SY215C · ${brl(2760000)}</span></div>
      <div class="phases" style="grid-template-columns:repeat(5,minmax(150px,1fr))">${steps.map((s) => `<div class="phase ${s[4] === 'done' ? 'win' : s[4] === 'on' ? 'hot' : ''}"><small>${s[0]}</small><b class="mono" style="font-size:11.5px">${s[1]}</b><span>${s[2]}</span><span class="dim" style="font-size:11px">${s[3]}</span></div>`).join('')}</div></section>
    <section class="panel"><div class="ph"><h3>Operações</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Etapa / crédito</th><th>Operação / cliente</th><th>Equipamentos</th><th>Instituições</th><th class="r">Valor</th></tr></thead><tbody>
      ${OPS.slice(0, 4).map((o) => `<tr><td><span class="pill ${o.sla === 'good' ? 'good' : 'neutral'}">${ESTEIRA[o.fase].n}</span></td><td><b class="mono" style="font-size:12px">${o.id}</b><div>${org(o.org).n}</div></td><td>${o.eq}</td><td><div class="col" style="gap:4px">${o.banks.map((b) => `<span class="row" style="gap:6px"><span style="min-width:90px">${b[0]}</span><span class="pill ${b[2]}">${b[1]}</span></span>`).join('') || '<span class="dim">—</span>'}</div></td><td class="r mono">${brl(o.v)}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  /* ---------------- INBOX ---------------- */
  function inbox(st) {
    const c = CONVS.find((x) => x.id === (st.conv || 'c1'));
    const o = c.org ? org(c.org) : null;
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Conversas</div><h1>Inbox compartilhado</h1><p>WhatsApp oficial, WhatsApp não oficial e canais internos numa fila só. Notas internas nunca chegam ao cliente.</p></div>
      <div class="seg arc" role="group" aria-label="Filtro"><button class="on">Minhas</button><button>Equipe</button><button>Sem dono</button></div></div>
    <section class="panel chat" id="t-chat">
      <section class="c-list">${CONVS.map((x) => `<button class="conv ${x.id === c.id ? 'on' : ''}" data-conv="${x.id}"><span class="av sm">${x.who.split(' ').slice(0, 2).map((w) => w[0]).join('')}</span><span style="min-width:0;flex:1"><span class="row" style="justify-content:space-between;gap:6px"><span class="who">${x.who}</span><span class="dim mono" style="font-size:10.5px">${x.t}</span></span><span class="last" style="display:block">${x.last}</span><span class="row" style="gap:4px;margin-top:4px"><span class="pill ${x.ch.includes('não') ? 'warn' : x.ch.includes('interno') ? 'neutral' : 'good'} nodot" style="font-size:10.5px">${x.ch}</span>${x.unread ? `<span class="pill brand nodot" style="font-size:10.5px">${x.unread} nova${x.unread > 1 ? 's' : ''}</span>` : ''}</span></span></button>`).join('')}</section>
      <section><div class="row" style="padding:12px 14px;border-bottom:1px solid var(--line)"><span class="av sm">${c.who.split(' ').slice(0, 2).map((w) => w[0]).join('')}</span><div style="flex:1;min-width:0"><b>${c.who}</b><div class="dim" style="font-size:12px">${c.ch}${o ? ' · ' + o.n : ''}</div></div><span class="pill neutral">Responsável: ${c.assignee || 'sem dono'}</span><button class="btn sm">Transferir</button></div>
        <div class="msgs">${c.msgs.map((m) => `<div class="msg ${m[0] === 'me' ? 'me' : m[0] === 'note' ? 'note' : ''}">${m[0] === 'note' ? icon('lock') + ' ' : ''}${esc(m[1])}<time>${m[2]}</time></div>`).join('')}</div>
        <div class="suggest">${(c.id === 'c5' ? ['Criar contato e oportunidade (SY75C)', 'Enviar catálogo SY75C', 'Responder com disponibilidade'] : ['Confirmar recebimento', 'Enviar link de upload seguro', 'Agendar ligação']).map((s) => `<button>${icon('spark')} ${s}</button>`).join('')}</div>
        <form class="composer" data-composer><input id="cmp" placeholder="Escreva uma mensagem ou / para respostas rápidas" aria-label="Mensagem"><button type="button" class="btn sm ghost">${icon('lock')}Nota interna</button><button class="btn pri sm" type="submit">${icon('send')}Enviar</button></form></section>
      <section class="c-ctx">${o ? `<div class="eyebrow">Contexto</div><b style="font-family:var(--f-display);font-size:16px">${o.n}</b><span class="muted" style="font-size:12px">${o.city} · Perfil ${o.score}</span>
        ${c.deal ? `<div class="panel" style="padding:12px"><div class="dim" style="font-size:11.5px">Negócio vinculado</div><b class="mono" style="font-size:12px">${c.deal}</b><div>${(DEALS.find((d) => d.id === c.deal) || {}).eq || ''}</div><span class="pill neutral" style="margin-top:6px">${PHASES[(DEALS.find((d) => d.id === c.deal) || { ph: 0 }).ph]}</span></div>` : ''}
        <div class="panel" style="padding:12px"><div class="dim" style="font-size:11.5px">Documentos</div><b class="num" style="font-size:18px">${o.docsOk}/${o.docs}</b><div class="bar ${o.docsOk === o.docs ? 'good' : 'warn'}" style="margin-top:6px"><i style="width:${o.docsOk / o.docs * 100}%"></i></div></div>
        <a class="btn sm" href="#crm" data-go="crm" data-org="${o.id}">Abrir organização</a>`
        : `<div class="eyebrow">Contato novo</div><p class="muted" style="font-size:13px">A Ava identificou interesse em <b>SY75C</b> e cidade <b>Trindade · GO</b>.</p><button class="btn pri sm" data-act="lead">${icon('plus')}Criar organização e oportunidade</button><button class="btn sm">Atribuir a mim</button>`}</section>
    </section>`;
  }

  /* ---------------- WHATSAPP ---------------- */
  function whatsapp(st) {
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Conversas · canais</div><h1>Instâncias de WhatsApp</h1><p>Números oficiais pela API da Meta para a empresa; sessões não oficiais por QR para carteiras individuais, com aviso de risco. Cada instância tem fila, unidade e regras de roteamento.</p></div>
      <button class="btn pri">${icon('plus')}Nova instância</button></div>
    <div class="grid g2">
      <section class="panel hud"><div class="ph"><h3>API oficial</h3><span class="pill good">Recomendado</span><span class="sub">Cloud API da Meta · selo, templates aprovados, janela de 24 h, sem risco de bloqueio por automação</span></div>
        <div class="grid g2">${INSTANCES.filter((i) => i.api === 'oficial').map(inst).join('')}</div></section>
      <section class="panel"><div class="ph"><h3>API não oficial</h3><span class="pill warn">Uso controlado</span><span class="sub">Sessão por QR no aparelho · rápida de ativar, mas sujeita a desconexão e bloqueio pela Meta</span></div>
        <div class="grid g2">${INSTANCES.filter((i) => i.api !== 'oficial').map(inst).join('')}</div></section>
    </div>
    <div class="grid g3">
      <section class="panel"><div class="ph"><h3>Roteamento</h3></div><div class="list">${[['Novo lead (sem contato)', 'Fila da unidade → rodízio entre vendedores online'], ['Contato com dono', 'Direto para o vendedor da carteira'], ['Palavra "documento" ou anexo PDF', 'Fila Documentos da Mesa'], ['Fora do horário (18h–8h)', 'Resposta automática + tarefa às 8h']].map((r) => `<div class="li">${icon('route')}<div><div class="t">${r[0]}</div><div class="s">${r[1]}</div></div></div>`).join('')}</div></section>
      <section class="panel"><div class="ph"><h3>Templates aprovados</h3><div class="r"><span class="pill neutral">12</span></div></div><div class="list">${[['cobranca_documento', 'Utilidade', 'good'], ['proposta_enviada', 'Utilidade', 'good'], ['boas_vindas_lead', 'Marketing', 'good'], ['lembrete_assinatura_govbr', 'Utilidade', 'warn']].map((t) => `<div class="li"><span class="mono" style="font-size:12px;flex:1">${t[0]}</span><span class="pill ${t[2]}">${t[2] === 'good' ? 'Aprovado' : 'Em análise'}</span></div>`).join('')}</div></section>
      <section class="panel"><div class="ph"><h3>Saúde dos canais (7 d)</h3><div class="r"><span class="sample">Exemplo</span></div></div><div id="ch-wa" class="chart sm"></div></section>
    </div>`;
    function inst(i) {
      return `<div class="inst" style="border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--bg-2)"><div class="row" style="justify-content:space-between"><b>${i.n}</b><span class="pill ${i.st}">${i.stl}</span></div>
        <span class="num mono">${i.num}</span><span class="dim" style="font-size:12px">${i.prov}</span>
        <div class="row" style="font-size:12px;gap:14px"><span><span class="dim">Unidade</span> ${i.unit}</span><span><span class="dim">Qualidade</span> ${i.q}</span></div>
        <span class="dim" style="font-size:12px">${i.route}</span>
        ${i.api !== 'oficial' && i.st === 'crit' ? `<div class="row"><div class="qr" aria-hidden="true"></div><div class="col" style="gap:6px"><span style="font-size:12.5px">Escaneie o QR no aparelho da filial</span><button class="btn sm arc">Gerar novo QR</button></div></div>` : `<div class="row" style="justify-content:space-between"><span class="dim" style="font-size:12px">${i.msgs.toLocaleString('pt-BR')} mensagens/7d</span><button class="btn sm">Configurar</button></div>`}</div>`;
    }
  }

  /* ---------------- SUPORTE ---------------- */
  function suporte(st) {
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Ajuda</div><h1>Suporte interno</h1><p>Chamados entre equipes: acesso, bugs, dúvidas de processo e de crédito. Cada categoria tem dono e SLA. A Ava sugere um artigo antes de abrir o chamado.</p></div>
      <button class="btn pri" data-act="ticket">${icon('plus')}Abrir chamado</button></div>
    <div class="grid g4">
      ${kpi({ ic: 'life', l: 'Abertos', v: '3', f: '1 crítico', pill: ['warn', 'SLA'] })}
      ${kpi({ ic: 'clock', l: 'Tempo de 1ª resposta', v: '38 min', f: 'meta 1 h', arc: true })}
      ${kpi({ ic: 'check', l: 'Resolvidos (30 d)', v: '41', f: '94% no SLA' })}
      ${kpi({ ic: 'star', l: 'Satisfação', v: '4,7 / 5', f: '29 avaliações', arc: true })}
    </div>
    <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr)">
      <section class="panel" id="t-tickets"><div class="ph"><h3>Chamados</h3><div class="r"><span class="chip on">Todos</span><span class="chip">Meus</span><span class="chip">Minha equipe atende</span></div></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Chamado</th><th>Categoria</th><th>Status</th><th>Solicitante</th><th>Equipe</th><th>SLA</th></tr></thead><tbody>
        ${TICKETS.map((t) => `<tr><td><b class="mono" style="font-size:12px">${t.id}</b><div>${t.t}</div></td><td><span class="pill neutral nodot">${t.cat}</span></td><td><span class="pill ${t.st === 'Resolvido' || t.st === 'Respondido' ? 'good' : t.pr}">${t.st}</span></td><td>${t.who}</td><td class="muted">${t.ag}</td><td class="mono" style="font-size:12px">${t.sla}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="panel hud"><div class="ph"><h3>Base de conhecimento</h3></div>
        <div class="field"><label for="kb">Pesquisar</label><input id="kb" placeholder="Ex.: como registrar perda"></div>
        <div class="list" style="margin-top:8px">${['Como registrar perda e motivo', 'Limites de upload (20 MiB) e formatos aceitos', 'Por que o vendedor não escolhe o banco', 'Fluxo de assinatura Gov.br', 'Código do vendedor: como é gerado'].map((a) => `<div class="li">${icon('doc')}<div class="t" style="flex:1">${a}</div>${icon('arrow')}</div>`).join('')}</div></section>
    </div>`;
  }

  /* ---------------- BI ---------------- */
  function bi(st) {
    const tab = st.biTab || 'comercial';
    const tabs = [['comercial', 'Comercial'], ['credito', 'Crédito'], ['operacao', 'Operação & SLA'], ['perdas', 'Perdas']];
    const charts = {
      comercial: [
        ['ch-entradas', 'O que entrou e o que fechou', 'Novas oportunidades e faturadas por mês', { q: 'Quantas oportunidades entraram e quantas viraram faturamento?', f: 'Contagem por data de criação (entradas) e data de faturamento (faturadas)', s: 'Eventos de criação de OPP e emissão de PED' }],
        ['ch-funil', 'Como o funil converte', 'Coorte de julho, da oportunidade ao faturamento', { q: 'De cada 100 oportunidades de julho, quantas chegaram a cada fase?', f: 'Oportunidades da coorte que já passaram pela fase ÷ total da coorte', s: 'Histórico de transições de fase (não o estoque atual)' }],
        ['ch-modelos', 'Quais máquinas vendemos', 'Valor faturado por modelo, ano até agora', { q: 'Quais modelos geram mais receita?', f: 'Soma do valor dos itens de PED faturados', s: 'Itens e snapshots de PED · receita faturada, não previsão' }],
        ['ch-meta', 'Estamos atingindo a meta', 'Realizado acumulado vs meta da equipe', { q: 'O ritmo do mês leva à meta?', f: 'Faturado acumulado por dia útil vs meta linear', s: 'Cadastro de metas (a criar) + PED faturado', e: 'Equipe do gerente; vendedor vê só a própria' }]
      ],
      credito: [
        ['ch-bancos', 'Resultado de crédito por banco', 'Aprovadas, em análise e recusadas', { q: 'Qual banco aprova mais e qual recusa mais?', f: 'Decisões canônicas por instituição; elegibilidade não conta como aprovação', s: 'Decisões e desembolsador canônicos' }],
        ['ch-banks2', 'Concentração do volume', 'Participação no volume financiado', { q: 'Estamos dependentes de um banco?', f: 'Volume desembolsado por banco ÷ total', s: 'Desembolsos' }]
      ],
      operacao: [
        ['ch-aging', 'Onde a operação demora', 'Operações abertas por idade na fase atual (horas úteis)', { q: 'Quantas operações estão envelhecendo em cada fase?', f: 'Horas úteis desde a entrada na fase (8h–18h, seg–sex, feriados)', s: 'Eventos de fase + calendário persistido' }],
        ['ch-sla', 'SLA cumprido por semana', '% de operações decididas em até 20 h úteis', { q: 'A Mesa está cumprindo o SLA?', f: 'Decididas ≤ 20 h úteis ÷ decididas na semana', s: 'Eventos de decisão' }]
      ],
      perdas: [
        ['ch-perdas', 'Por que perdemos negócios', 'Motivos registrados, últimos 6 meses', { q: 'Quais motivos mais causam perda?', f: 'Contagem de perdas por motivo da taxonomia', s: 'Evento de perda canônico · sem classificação automática' }],
        ['ch-perdas-t', 'Tendência de perdas', 'Perdas por mês', { q: 'As perdas estão aumentando?', f: 'Contagem mensal de perdas confirmadas', s: 'Evento de perda canônico' }]
      ]
    };
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Inteligência</div><h1>Relatórios & BI</h1><p>Cada gráfico responde uma pergunta de gestão, mostra de onde vem o número e desce até as operações que o compõem. Clique nas barras.</p></div>
      <button class="btn">${icon('download')}Exportar CSV</button><button class="btn arc">${icon('star')}Salvar visão</button></div>
    <section class="panel" style="padding:12px" id="t-filtros"><div class="row" style="gap:8px">
      ${[['Período', ['Out 2026', 'Últimos 90 dias', 'Ano 2026']], ['Unidade', ['Todas no meu escopo', 'Filial Goiânia', 'Filial Rio Verde', 'Filial Brasília']], ['Equipe', ['Todas', 'Gerência Centro-Oeste', 'Gerência Sudeste']], ['Vendedor', ['Todos', 'Douglas Souza', 'Carlos Eduardo']], ['Banco', ['Todos', 'Banco Sany', 'Bradesco', 'BBC Digital', 'CEF', 'Itaú']]].map((f, i) => `<div class="field" style="flex:1 1 150px"><label for="bf${i}">${f[0]}</label><select id="bf${i}">${f[1].map((o) => `<option>${o}</option>`).join('')}</select></div>`).join('')}
    </div></section>
    <div class="seg" role="tablist" aria-label="Painéis">${tabs.map((t) => `<button role="tab" data-bitab="${t[0]}" class="${t[0] === tab ? 'on' : ''}" aria-selected="${t[0] === tab}">${t[1]}</button>`).join('')}</div>
    <div class="grid g4">${(tab === 'comercial' ? [
      { ic: 'layers', l: 'Pipeline aberto', v: 'R$ 38,6 mi', d: '+22,4%', f: '52 oportunidades', sp: [28, 30, 31, 34, 33, 36, 38.6] },
      { ic: 'chart', l: 'Faturado no período', v: 'R$ 18,45 mi', d: '+8%', f: '27 máquinas', sp: [8, 10, 12, 13.5, 15, 17, 18.45], arc: true },
      { ic: 'route', l: 'Conversão da coorte', v: '34,2%', d: '+4,1 p.p.', f: 'jul → hoje', sp: [28, 29, 31, 30, 32, 33, 34.2] },
      { ic: 'clock', l: 'Tempo até faturar', v: '8,5 dias', d: '−2,1 d', f: 'mediana', sp: [12, 11.4, 10.8, 10, 9.6, 9, 8.5], arc: true }]
      : tab === 'credito' ? [
      { ic: 'bank', l: 'Taxa de aprovação', v: '82,4%', d: '+3,1 p.p.', f: '5 bancos' }, { ic: 'x', l: 'Recusas', v: '14', dir: 'down', d: '+2', f: 'no período', arc: true },
      { ic: 'chart', l: 'Desembolsado', v: 'R$ 118,5 mi', d: '+28%', f: 'YTD' }, { ic: 'spark', l: 'Taxa média', v: '1,36% a.m.', d: '−0,04', f: 'ponderada por volume', arc: true }]
      : tab === 'operacao' ? [
      { ic: 'clock', l: 'Na Mesa agora', v: '14', f: 'fichas' }, { ic: 'alert', l: 'Fora do SLA', v: '17', dir: 'down', d: '+3', f: 'operações', arc: true },
      { ic: 'check', l: 'SLA cumprido', v: '81%', d: '+4 p.p.', f: 'últimas 4 semanas' }, { ic: 'doc', l: 'Pendência documental', v: '6', f: 'fichas', arc: true }]
      : [{ ic: 'x', l: 'Perdas (6 m)', v: '23', f: 'negócios' }, { ic: 'chart', l: 'Valor perdido', v: 'R$ 21,4 mi', f: '6 meses', arc: true },
      { ic: 'route', l: 'Maior motivo', v: 'Preço', f: '35% das perdas' }, { ic: 'clock', l: 'Fase de maior perda', v: 'Negociação', f: '9 de 23', arc: true }]).map(kpi).join('')}</div>
    <div class="grid g2">${charts[tab].map((c) => `<section class="panel"><div class="ph"><h3>${c[1]}</h3><span class="sub">${c[2]}</span><div class="r"><span class="sample">Exemplo</span></div></div><div id="${c[0]}" class="chart"></div>${contract(c[3])}</section>`).join('')}</div>
    <section class="panel" id="drill"><div class="ph"><h3>Detalhamento</h3><span class="sub" id="drill-sub">Clique numa barra ou fatia acima para filtrar esta tabela</span></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Oportunidade</th><th>Cliente</th><th>Vendedor</th><th>Fase</th><th>Modalidade</th><th class="r">Valor</th></tr></thead><tbody id="drill-body">
      ${DEALS.slice(0, 6).map((d) => `<tr><td class="mono">${d.id}</td><td>${org(d.org).n}</td><td>${d.own}</td><td>${PHASES[d.ph]}</td><td>Financiamento bancário</td><td class="r mono">${brl(d.v)}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  /* ---------------- ARENA ---------------- */
  function insignia(tier, on) {
    const c = on ? (tier === 3 ? 'var(--brand)' : tier === 2 ? 'var(--arc)' : 'var(--good)') : 'var(--fg-3)';
    const sides = tier === 3 ? 8 : tier === 2 ? 6 : 4;
    const pts = Array.from({ length: sides }, (_, i) => { const a = Math.PI * 2 * i / sides - Math.PI / 2; return `${20 + 17 * Math.cos(a)},${20 + 17 * Math.sin(a)}`; }).join(' ');
    const pts2 = Array.from({ length: sides }, (_, i) => { const a = Math.PI * 2 * i / sides - Math.PI / 2; return `${20 + 10 * Math.cos(a)},${20 + 10 * Math.sin(a)}`; }).join(' ');
    return `<svg viewBox="0 0 40 40" aria-hidden="true"><polygon points="${pts}" fill="none" stroke="${c}" stroke-width="1.6"/><polygon points="${pts2}" fill="${c}" opacity="${on ? 0.85 : 0.25}"/></svg>`;
  }
  function arena(st) {
    const r = ROLES[st.role];
    const mgr = st.role === 'gerencia' || st.role === 'diretoria' || st.role === 'admin';
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Performance · temporada Q4 2026</div><h1>Arena de metas</h1><p>Metas, desafios e conquistas que premiam resultado confirmado (faturamento, aprovação, prazo cumprido), nunca cliques. Liga entre gerências para estimular a equipe sem expor pessoas de outras equipes.</p></div>
      ${mgr ? `<button class="btn" data-act="meta">${icon('target')}Ajustar metas</button><button class="btn pri" data-act="desafio">${icon('plus')}Criar desafio</button>` : ''}</div>
    <div class="grid" style="grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)">
      <section class="panel hud" id="t-level"><div class="rank">
        <svg class="insig" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="var(--line-2)" stroke-width="6"/><circle cx="50" cy="50" r="44" fill="none" stroke="var(--arc)" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(r.xp / r.next * 276).toFixed(0)} 276" transform="rotate(-90 50 50)"/><text x="50" y="47" text-anchor="middle" font-family="Chakra Petch" font-weight="700" font-size="26" fill="var(--fg)">${r.lvl}</text><text x="50" y="66" text-anchor="middle" font-family="Chakra Petch" font-size="9" letter-spacing="2" fill="var(--fg-3)">NÍVEL</text></svg>
        <div style="flex:1;min-width:200px"><div class="eyebrow">${r.user}</div><h2 style="margin:2px 0 6px;font:700 24px var(--f-display)">${r.rank}</h2>
          <div class="row" style="justify-content:space-between;font-size:12px"><span class="mono">${r.xp.toLocaleString('pt-BR')} XP</span><span class="dim">${(r.next - r.xp).toLocaleString('pt-BR')} XP para o nível ${r.lvl + 1}</span></div>
          <div class="bar" style="height:8px;margin-top:6px"><i style="width:${r.xp / r.next * 100}%"></i></div>
          <div class="row" style="margin-top:10px"><span class="pill arc">${icon('flame')} 3 meses acima da meta</span><span class="pill neutral">#1 na Centro-Oeste</span></div></div></div></section>
      <section class="panel"><div class="ph"><h3>Metas do mês</h3></div><div class="col" style="gap:14px">
        ${[['Faturamento individual', 5840000, 6000000, 'red'], ['Máquinas faturadas', 9, 10, ''], ['Taxa de aprovação', 78.5, 75, 'good'], ['Equipe Centro-Oeste', 18450000, 22000000, '']].map((m) => { const pct = Math.min(100, m[1] / m[2] * 100); const money = m[2] > 1000; return `<div><div class="row" style="justify-content:space-between;font-size:13px"><span>${m[0]}</span><span class="mono">${money ? mi(m[1]) + ' / ' + mi(m[2]) : m[1].toLocaleString('pt-BR') + ' / ' + m[2].toLocaleString('pt-BR')}</span></div><div class="bar ${m[3]}" style="height:7px;margin-top:6px"><i style="width:${pct}%"></i></div></div>`; }).join('')}
      </div></section>
    </div>
    <section class="panel"><div class="ph"><h3>Desafios ativos</h3><span class="sub">Criados pela gerência ou pela Mesa · prazo curto, objetivo claro</span></div>
      <div class="grid g4" id="t-challenges">${CHALLENGES.map((c) => { const pct = Math.min(100, c.prog / c.of * 100); return `<div class="challenge"><div class="row" style="justify-content:space-between"><span class="pill ${c.scope === 'Individual' ? 'arc' : 'brand'} nodot">${c.scope}</span><span class="dim mono" style="font-size:11px">termina em ${c.ends}</span></div><b style="font-family:var(--f-display);font-size:15px">${c.t}</b><span class="muted" style="font-size:12.5px">${c.d}</span><div class="bar" style="height:7px"><i style="width:${pct}%"></i></div><div class="row" style="justify-content:space-between;font-size:12px"><span class="mono">${c.prog}${c.pct ? '%' : ''} / ${c.of}${c.pct ? '%' : ''}</span><b class="mono" style="color:var(--arc)">+${c.xp} XP</b></div></div>`; }).join('')}</div></section>
    <div class="grid g2">
      <section class="panel"><div class="ph"><h3>Liga das gerências</h3><span class="sub">Pontos da equipe = soma do XP confirmado ÷ número de vendedores</span></div>
        <div class="list league">${TEAMS.map((t, i) => `<div class="li ${i === 0 ? 'top' : ''}"><span class="pos">${i + 1}</span><div style="flex:1;min-width:0"><div class="t">${t.n}</div><div class="s">${t.mgr} · meta ${t.meta}%</div><div class="bar ${i === 0 ? '' : ''}" style="margin-top:6px"><i style="width:${t.meta}%"></i></div></div><div class="end"><b class="num">${t.pts.toLocaleString('pt-BR')}</b><span class="dim mono" style="font-size:11px">${t.trend}</span></div></div>`).join('')}</div></section>
      <section class="panel"><div class="ph"><h3>${mgr ? 'Minha equipe' : 'Ranking da equipe'}</h3><span class="sub">${mgr ? 'Ajuste metas individuais e reconheça quem ajudou o time' : 'Você vê sua equipe; outras equipes aparecem só na liga'}</span></div>
        <div class="tbl-wrap"><table class="tbl" style="min-width:420px"><thead><tr><th>Vendedor</th><th class="r">Meta</th><th class="r">Atingido</th><th class="r">XP</th>${mgr ? '<th></th>' : ''}</tr></thead><tbody>${SELLERS.map((s) => `<tr><td><span class="av sm" style="display:inline-grid;margin-right:8px">${s.code}</span>${s.n}</td><td class="r">${mi(s.meta)}</td><td class="r"><span class="pill ${s.fat >= s.meta ? 'good' : s.fat / s.meta > .8 ? 'warn' : 'crit'}">${Math.round(s.fat / s.meta * 100)}%</span></td><td class="r mono">${s.xp.toLocaleString('pt-BR')}</td>${mgr ? '<td><button class="btn sm">Ajustar</button></td>' : ''}</tr>`).join('')}</tbody></table></div></section>
    </div>
    <section class="panel"><div class="ph"><h3>Conquistas</h3><span class="sub">4 de 8 · insígnias por marco real, com três níveis de raridade</span></div>
      <div class="badges">${BADGES.map((b) => `<div class="badge ${b.on ? '' : 'locked'}">${insignia(b.tier, b.on)}<b>${b.n}</b><span>${b.d}</span>${b.on ? '' : `<span class="row" style="gap:4px">${icon('lock')}Bloqueada</span>`}</div>`).join('')}</div></section>
    <section class="panel"><div class="ph"><h3>Como se ganha XP</h3><span class="sub">Regras públicas, auditáveis e definidas pela gestão</span></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Evento confirmado</th><th class="r">XP</th><th>Por que</th></tr></thead><tbody>
      ${[['Máquina faturada (PED emitido)', '+500 / máquina', 'Resultado final do ciclo'], ['Crédito aprovado na 1ª submissão', '+150', 'Ficha bem preparada evita retrabalho'], ['Ficha completa em até 48 h', '+80', 'Reduz SLA da Mesa'], ['Tarefa concluída no prazo', '+10 a +40', 'Disciplina comercial'], ['Lead respondido em até 15 min úteis', '+5', 'Velocidade de atendimento'], ['Perda registrada com motivo', '+10', 'Alimenta o BI de perdas; perder não tira pontos']].map((x) => `<tr><td>${x[0]}</td><td class="r mono" style="color:var(--arc)">${x[1]}</td><td class="muted">${x[2]}</td></tr>`).join('')}</tbody></table></div></section>`;
  }

  /* ---------------- USUARIOS ---------------- */
  function usuarios(st) {
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Administração</div><h1>Usuários & permissões</h1><p>Convite seguro, aprovação, cargo e capabilities. O código do vendedor é gerado sozinho e não muda depois de confirmado.</p></div>
      <button class="btn pri" data-act="convite">${icon('send')}Convidar usuário</button></div>
    <div class="grid g4">
      ${kpi({ ic: 'users', l: 'Usuários ativos', v: '18', f: '6 cargos' })}
      ${kpi({ ic: 'clock', l: 'Aguardando aprovação', v: '2', f: '1 convite enviado', arc: true, pill: ['warn', 'Ação'] })}
      ${kpi({ ic: 'lock', l: 'Bloqueados', v: '1', f: 'sessão revogada' })}
      ${kpi({ ic: 'shield', l: 'Alterações de permissão (30 d)', v: '7', f: 'todas auditadas', arc: true })}
    </div>
    <section class="panel"><div class="ph"><h3>Pessoas</h3><div class="r"><div class="field" style="min-width:220px"><label for="u-q" class="sr" style="position:absolute;left:-9999px">Pesquisar</label><input id="u-q" placeholder="Pesquisar nome, e-mail ou cargo"></div></div></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nome</th><th>Cargo</th><th>Código</th><th>Unidade</th><th>Status</th><th>Último acesso</th><th></th></tr></thead><tbody>
      ${USERS.map((u) => `<tr><td><div class="row" style="gap:10px;flex-wrap:nowrap"><span class="av sm">${u.n.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span><div><div>${u.n}</div><div class="dim" style="font-size:11.5px">${u.e}</div></div></div></td><td>${u.r}</td><td class="mono">${u.code}</td><td class="muted">${u.unit}</td><td><span class="pill ${u.st}">${u.stl}</span></td><td class="dim">${u.last}</td><td>${u.stl === 'Aguardando aprovação' ? '<button class="btn sm arc">Aprovar</button>' : '<button class="btn sm ghost">Editar</button>'}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="panel hud" id="t-caps"><div class="ph"><h3>Matriz de capabilities</h3><span class="sub">Validada no servidor; a tela só reflete o que o backend autoriza</span></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Capability</th>${CAP_ROLES.map((r) => `<th style="text-align:center">${r}</th>`).join('')}</tr></thead><tbody>
      ${CAPS.map((c, ci) => `<tr><td>${c[0]}</td>${c[1].map((v, ri) => `<td style="text-align:center"><input type="checkbox" aria-label="${c[0]} para ${CAP_ROLES[ri]}" ${v ? 'checked' : ''} ${ri === 4 ? 'disabled' : ''} style="width:18px;height:18px;accent-color:var(--arc)"></td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
  }

  /* ---------------- CONFIG ---------------- */
  function config(st) {
    const tab = st.cfgTab || 'unidades';
    const tabs = [['unidades', 'Unidades & filiais'], ['marca', 'Identidade visual'], ['integracoes', 'Integrações'], ['planos', 'Planos & cobrança']];
    let body = '';
    if (tab === 'unidades') body = `<section class="panel"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Unidade</th><th>Tipo</th><th>Cidade</th><th>Gerência</th><th class="r">Usuários</th><th>Emissor de pedido</th></tr></thead><tbody>${[['Matriz IRMEN', 'Matriz', 'Goiânia · GO', '—', 4, 'good'], ['Filial Goiânia', 'Filial', 'Goiânia · GO', 'Centro-Oeste', 5, 'good'], ['Filial Rio Verde', 'Filial', 'Rio Verde · GO', 'Centro-Oeste', 3, 'warn'], ['Filial Brasília', 'Filial', 'Brasília · DF', 'Centro-Oeste', 4, 'warn'], ['Mesa de Crédito', 'Área', 'Goiânia · GO', '—', 2, 'neutral']].map((u) => `<tr><td>${u[0]}</td><td>${u[1]}</td><td>${u[2]}</td><td>${u[3]}</td><td class="r">${u[4]}</td><td><span class="pill ${u[5]}">${u[5] === 'good' ? 'Configurado' : u[5] === 'warn' ? 'Falta dado bancário' : 'Não emite'}</span></td></tr>`).join('')}</tbody></table></div></section>`;
    if (tab === 'marca') body = `<div class="grid g2"><section class="panel"><div class="ph"><h3>Marca do espaço de trabalho</h3><span class="sub">Base para oferecer o portal a outras empresas no futuro</span></div><div class="col"><div class="field"><label for="b-n">Nome exibido</label><input id="b-n" value="Portal IRMEN"></div><div class="field"><label for="b-c">Cor de ação</label><input id="b-c" type="color" value="#ef3f4f" style="height:44px"></div><div class="field"><label for="b-t">Tema padrão</label><select id="b-t"><option>Escuro (Jarvis)</option><option>Slate claro</option><option>Seguir o sistema</option></select></div><div class="field"><label for="b-fx">Efeito de fundo</label><select id="b-fx"><option>Rede neural suave</option><option>Desligado</option></select></div></div></section><section class="panel hud"><div class="ph"><h3>Pré-visualização</h3></div><div class="row"><span class="logo">IR</span><b style="font-family:var(--f-display)">Portal IRMEN</b></div><div class="row" style="margin-top:14px"><button class="btn pri">Ação primária</button><button class="btn arc">Secundária</button><span class="pill good">Status</span></div></section></div>`;
    if (tab === 'integracoes') body = `<div class="grid g3">${[['wa', 'WhatsApp Cloud API', 'Conectado · 2 números', 'good'], ['spark', 'Ava · leitura documental', 'Operação paga em HOLD', 'warn'], ['cal', 'Google / Outlook Agenda', 'Não conectado', 'neutral'], ['bank', 'Bancos parceiros', 'Taxas de referência manuais', 'neutral'], ['map', 'Áreas & localização', 'Serviço externo existente', 'good'], ['send', 'E-mail transacional (Titan)', 'Convites entregues · DMARC pendente', 'warn']].map((i) => `<section class="panel"><div class="row">${icon(i[0])}<b>${i[1]}</b></div><p class="muted" style="font-size:12.5px">${i[2]}</p><span class="pill ${i[3]}">${i[3] === 'good' ? 'Ativo' : i[3] === 'warn' ? 'Atenção' : 'Disponível'}</span></section>`).join('')}</div>`;
    if (tab === 'planos') body = `<section class="panel"><div class="empty" style="padding:40px"><div style="font:700 18px var(--f-display);color:var(--fg)">Planos e pagamentos ainda não fazem parte do piloto</div><p>Este espaço fica reservado. Quando houver decisão, aqui entram plano contratado, limite de usuários e instâncias, faturas e forma de pagamento.</p></div></section>`;
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Administração</div><h1>Configurações</h1><p>Unidades e filiais ficam só aqui, sem atalho no menu lateral.</p></div></div>
    <div class="seg" role="tablist">${tabs.map((t) => `<button role="tab" data-cfg="${t[0]}" class="${t[0] === tab ? 'on' : ''}">${t[1]}</button>`).join('')}</div>${body}`;
  }

  /* ---------------- AVA ---------------- */
  function ava(st) {
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Assistente</div><h1>Ava</h1><p>Lê documentos, resume conversas e responde perguntas sobre os dados que você já pode ver. Pessoas mantêm a decisão de crédito.</p></div></div>
    <div class="grid" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)">
      <section class="panel hud" style="min-height:420px;display:flex;flex-direction:column;gap:12px"><div class="row"><span class="orb" style="width:48px;height:48px"></span><div><b style="font-family:var(--f-display);font-size:18px">Em que posso ajudar, ${ROLES[st.role].user.split(' ')[0]}?</b><div class="dim" style="font-size:12.5px">Atalho em qualquer tela: Ctrl + K</div></div></div>
        <div class="msgs" style="background:transparent;padding:0">
          <div class="msg me">Quais fichas estão travando minha meta?</div>
          <div class="msg">Duas fichas somam <b>R$ 3,86 mi</b> parados por documento: <span class="mono">OPP-DS-20261009-A</span> (falta Balanço 2025 assinado) e <span class="mono">OPP-CE-20261020-A</span> (IR dos sócios). Se as duas forem aprovadas até sexta, você fecha outubro em <b>128%</b> da meta.<div class="row" style="margin-top:8px"><a class="btn sm arc" href="#crm" data-go="crm">Abrir fichas</a><button class="btn sm">Criar tarefas de cobrança</button></div></div>
        </div>
        <form class="composer" data-composer style="margin-top:auto;padding:0;border:0"><input placeholder="Pergunte sobre clientes, operações, metas…" aria-label="Pergunta para a Ava"><button class="btn pri sm" type="submit">${icon('send')}Perguntar</button></form></section>
      <section class="panel"><div class="ph"><h3>Leitura de documentos</h3><span class="pill warn">Operação paga em HOLD</span></div>
        <div class="empty" style="padding:26px">${icon('upload')}<div style="margin-top:8px">Arraste DRE, balanço ou IR (até 20 MiB)</div><div class="dim" style="font-size:12px">A Ava extrai os campos e um analista confirma</div></div>
        <div class="list" style="margin-top:12px">${[['DRE_2025_TerraBrasilis.pdf', 'Extraído · aguardando revisão', 'warn'], ['Balanco_2024.pdf', 'Revisado por Rafael', 'good']].map((d) => `<div class="li">${icon('doc')}<div style="flex:1"><div class="t">${d[0]}</div><div class="s">${d[1]}</div></div><span class="pill ${d[2]}">${d[2] === 'good' ? 'ok' : 'revisar'}</span></div>`).join('')}</div></section>
    </div>`;
  }

  /* ---------------- BLUEPRINT ---------------- */
  function blueprint(st) {
    const lbl = { pronto: ['good', 'Pronto · manter'], polir: ['warn', 'Existe · polir'], novo: ['arc', 'Novo'], futuro: ['neutral', 'Futuro'] };
    return `
    <div class="head"><div class="grow"><div class="eyebrow">Proposta de design</div><h1>Mapa do produto</h1><p>O que já existe no portal publicado, o que esta proposta melhora e o que é novo. Clique num módulo para abrir a tela, ou rode um dos fluxos guiados.</p></div></div>
    <section class="panel hud"><div class="ph"><h3>Fluxos guiados</h3><span class="sub">Cada fluxo troca o papel do usuário e percorre as telas em ordem</span></div>
      <div class="grid g4">${FLOWS.map((f) => `<button class="mod" data-flow="${f.id}"><span class="row" style="justify-content:space-between;width:100%"><span class="pill arc nodot">${f.who}</span><span class="dim mono" style="font-size:11px">${f.steps.length} passos</span></span><b>${f.n}</b><span class="row" style="color:var(--arc);font-size:12.5px">${icon('play')}Iniciar demonstração</span></button>`).join('')}</div></section>
    <div class="row">${Object.keys(lbl).map((k) => `<span class="pill ${lbl[k][0]}">${lbl[k][1]} · ${MODULES.filter((m) => m.st === k).length}</span>`).join('')}</div>
    <div class="status-map">${MODULES.map((m) => `<a class="mod" href="#${m.id}" data-go="${m.id}" style="text-decoration:none"><span class="pill ${lbl[m.st][0]}" style="align-self:flex-start">${lbl[m.st][1]}</span><b>${m.n}</b><p>${m.d}</p></a>`).join('')}</div>`;
  }

  window.SCREENS = { painel, funil, crm, tarefas, simulador, mesa, operacoes, inbox, whatsapp, suporte, bi, arena, usuarios, config, ava, blueprint };
  window.IRH = { brl, mi, org };
})();
