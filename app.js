(function () {
  const { icon, ROLES, NAV, PHASES, BANKS, MACHINES, DEALS, FLOWS, SELLERS } = window.IR;
  const S = window.SCREENS;
  const { brl, org } = window.IRH;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  const SCREEN_LABEL = {};
  NAV.forEach((g) => g.items.forEach((it) => (SCREEN_LABEL[it.id] = [g.g, it.label])));

  const st = {
    screen: 'painel', role: 'vendedor', funilView: 'kanban', orgSel: 'o1', conv: 'c1', biTab: 'comercial', cfgTab: 'unidades',
    sim: { m: 0, q: 2, ent: 20, prazo: 48 }, tour: null, theme: null
  };
  try { const r = localStorage.getItem('irmen-role'); if (r && ROLES[r]) st.role = r; } catch (e) {}
  const h = (location.hash || '').slice(1);
  if (S[h]) st.screen = h;

  const canSee = (it, g) => {
    const roles = it.roles || null;
    return !roles || roles.includes(st.role);
  };

  /* ---------- shell ---------- */
  function renderSide() {
    const r = ROLES[st.role];
    $('#side').innerHTML = `
      <div class="brand"><span class="logo">IR</span><div><b>PORTAL IRMEN</b><small>Plataforma operacional</small></div>
        <button class="ibtn menu-btn" data-close-menu aria-label="Fechar menu" style="margin-left:auto">${icon('x')}</button></div>
      <button class="ws" aria-label="Trocar espaço de trabalho"><span class="dot"></span><span>IRMEN · SANY</span>${icon('arrow')}</button>
      <nav class="nav">${NAV.map((g) => {
        const items = g.items.filter((it) => canSee(it, g));
        if (!items.length) return '';
        return `<h6>${g.g}</h6>` + items.map((it) => `<a href="#${it.id}" data-go="${it.id}" class="${st.screen === it.id ? 'on' : ''}" ${st.screen === it.id ? 'aria-current="page"' : ''}>${icon(it.ic)}<span>${it.label}</span>${it.cnt ? `<span class="cnt ${it.arc ? 'arc' : ''}">${it.cnt}</span>` : it.tag ? `<span class="tagnew">${it.tag}</span>` : ''}</a>`).join('');
      }).join('')}</nav>
      <div class="me"><span class="av lvl" data-l="${r.lvl}">${r.ini}</span><div class="xp"><b>${r.user}</b><div class="bar" style="margin-top:5px"><i style="width:${r.xp / r.next * 100}%"></i></div><span class="dim mono" style="font-size:10.5px">Nível ${r.lvl} · ${r.rank}</span></div></div>`;
  }
  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }
  function renderTop() {
    const lab = SCREEN_LABEL[st.screen] || ['', ''];
    $('#top').innerHTML = `
      <button class="ibtn menu-btn" data-open-menu aria-label="Abrir menu">${icon('menu')}</button>
      <div class="crumb"><small>${lab[0]}</small><b>${lab[1]}</b></div>
      <button class="ava-bar" data-palette><span class="orb" aria-hidden="true"></span><span>Pergunte à Ava ou vá para…</span><kbd>Ctrl K</kbd></button>
      <label class="role">${icon('users')}<span class="sr" style="position:absolute;left:-9999px">Ver como</span><select id="role-sel" aria-label="Ver o portal como">${Object.keys(ROLES).map((k) => `<option value="${k}" ${k === st.role ? 'selected' : ''}>${ROLES[k].label}</option>`).join('')}</select></label>
      <button class="ibtn" data-theme-toggle aria-label="Alternar tema claro e escuro">${icon(isDark() ? 'sun' : 'moon')}</button>
      <button class="ibtn" data-notif aria-label="Notificações, 3 novas">${icon('bell')}<span class="pip"></span></button>`;
  }

  /* ---------- charts ---------- */
  let charts = [];
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  function base() {
    const fg2 = css('--fg-2'), fg3 = css('--fg-3'), line = css('--line');
    return {
      color: [css('--c1'), css('--c2'), css('--c3'), css('--c4'), css('--c5')],
      textStyle: { fontFamily: 'IBM Plex Sans, system-ui, sans-serif', color: fg2 },
      grid: { left: 8, right: 16, top: 30, bottom: 8, containLabel: true },
      tooltip: { trigger: 'axis', backgroundColor: css('--panel-solid'), borderColor: css('--line-2'), textStyle: { color: css('--fg'), fontSize: 12 }, axisPointer: { type: 'shadow', shadowStyle: { color: css('--arc-soft') } } },
      legend: { top: 0, right: 0, textStyle: { color: fg2, fontSize: 11.5 }, icon: 'roundRect', itemWidth: 10, itemHeight: 10 },
      _ax: { axisLine: { lineStyle: { color: line } }, axisTick: { show: false }, axisLabel: { color: fg3, fontSize: 11 }, splitLine: { lineStyle: { color: line } } }
    };
  }
  function mk(id, fn) {
    const el = document.getElementById(id);
    if (!el || !window.echarts) return null;
    const c = echarts.init(el, null, { renderer: 'canvas' });
    const b = base();
    const opt = fn(b);
    c.setOption(Object.assign({ animationDuration: 700 }, b, opt));
    charts.push(c);
    return c;
  }
  const ax = (b, o) => Object.assign({}, b._ax, o);
  const bar4 = { borderRadius: [4, 4, 0, 0] };
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out'];

  function drill(label) {
    const body = $('#drill-body');
    if (!body) return;
    const ds = DEALS.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    $('#drill-sub').textContent = 'Filtrado por: ' + label + ' · ' + ds.length + ' registros';
    body.innerHTML = ds.map((d) => `<tr><td class="mono">${d.id}</td><td>${org(d.org).n}</td><td>${d.own}</td><td>${PHASES[d.ph]}</td><td>Financiamento bancário</td><td class="r mono">${brl(d.v)}</td></tr>`).join('');
    $('#drill').classList.add('spot');
    setTimeout(() => $('#drill') && $('#drill').classList.remove('spot'), 1400);
  }

  const AFTER = {
    painel() {
      const pct = st.role === 'diretoria' ? 79.3 : st.role === 'gerencia' ? 83.8 : st.role === 'vendedor' ? 97.3 : 81;
      mk('ch-gauge', (b) => ({
        tooltip: { show: false }, legend: { show: false },
        series: [{ type: 'gauge', startAngle: 210, endAngle: -30, min: 0, max: 120, radius: '96%', center: ['50%', '58%'], splitNumber: 6,
          progress: { show: true, width: 12, roundCap: true, itemStyle: { color: css('--arc'), shadowBlur: 14, shadowColor: css('--arc-glow') } },
          axisLine: { roundCap: true, lineStyle: { width: 12, color: [[1, css('--line')]] } },
          axisTick: { show: false }, splitLine: { length: 6, distance: -22, lineStyle: { color: css('--line-2'), width: 1 } },
          axisLabel: { distance: -14, color: css('--fg-3'), fontSize: 10, formatter: (v) => v + '%' },
          pointer: { show: false }, anchor: { show: false },
          title: { offsetCenter: [0, '30%'], color: css('--fg-3'), fontSize: 11 },
          detail: { valueAnimation: true, offsetCenter: [0, '-2%'], formatter: (v) => v.toLocaleString('pt-BR') + '%', color: css('--fg'), fontSize: 30, fontFamily: 'Chakra Petch', fontWeight: 700 },
          data: [{ value: pct, name: st.role === 'mesa' || st.role === 'admin' ? 'no prazo de 20 h úteis' : 'da meta atingida' }] }]
      }));
      const k = st.role === 'diretoria' ? 1 : st.role === 'vendedor' ? 0.04 : 0.13;
      mk('ch-evo', (b) => ({
        xAxis: ax(b, { type: 'category', data: months.slice(0, 9), splitLine: { show: false } }),
        yAxis: ax(b, { type: 'value', axisLabel: { color: css('--fg-3'), fontSize: 11, formatter: (v) => v.toLocaleString('pt-BR') } }),
        tooltip: Object.assign({}, b.tooltip, { valueFormatter: (v) => 'R$ ' + v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi' }),
        series: [
          { name: '2025', type: 'bar', barWidth: 7, barGap: '40%', itemStyle: Object.assign({ color: css('--fg-3') }, bar4), data: [9, 11, 10, 12, 11, 13, 12, 12, 21].map((v) => +(v * k).toFixed(2)) },
          { name: '2026', type: 'bar', barWidth: 7, itemStyle: Object.assign({ color: css('--brand') }, bar4), data: [12, 16, 14, 17, 16, 19, 15, 16, 17.8].map((v) => +(v * k).toFixed(2)) }
        ]
      }));
    },
    mesa() { donutBanks('ch-banks'); },
    whatsapp() {
      mk('ch-wa', (b) => ({
        xAxis: ax(b, { type: 'category', data: ['Qua', 'Qui', 'Sex', 'Sáb', 'Dom', 'Seg', 'Ter'], splitLine: { show: false } }),
        yAxis: ax(b, { type: 'value' }),
        series: [
          { name: 'Oficial', type: 'line', smooth: true, symbolSize: 7, lineStyle: { width: 2 }, areaStyle: { opacity: 0.12 }, itemStyle: { color: css('--c2') }, data: [210, 245, 260, 80, 40, 270, 290] },
          { name: 'Não oficial', type: 'line', smooth: true, symbolSize: 7, lineStyle: { width: 2 }, itemStyle: { color: css('--c3') }, data: [110, 120, 98, 30, 10, 140, 147] }
        ]
      }));
    },
    bi() {
      const click = (c) => c && c.on('click', (p) => drill((p.seriesName ? p.seriesName + ' · ' : '') + p.name));
      if (st.biTab === 'comercial') {
        click(mk('ch-entradas', (b) => ({
          xAxis: ax(b, { type: 'category', data: months.slice(4), splitLine: { show: false } }), yAxis: ax(b, { type: 'value' }),
          series: [
            { name: 'Novas oportunidades', type: 'bar', barWidth: 10, barGap: '30%', itemStyle: Object.assign({ color: css('--c2') }, bar4), data: [38, 42, 47, 44, 51, 23] },
            { name: 'Faturadas', type: 'bar', barWidth: 10, itemStyle: Object.assign({ color: css('--c1') }, bar4), data: [11, 14, 13, 15, 17, 9] }
          ]
        })));
        click(mk('ch-funil', (b) => ({
          tooltip: { trigger: 'item', backgroundColor: css('--panel-solid'), borderColor: css('--line-2'), textStyle: { color: css('--fg') }, formatter: (p) => p.name + ': ' + p.value + ' de 100' }, legend: { show: false },
          series: [{ type: 'funnel', left: '4%', right: '32%', top: 10, bottom: 10, minSize: '8%', sort: 'descending', gap: 3,
            label: { show: true, position: 'right', color: css('--fg-2'), fontSize: 11.5, formatter: (p) => p.name + '  ' + p.value + '%' },
            labelLine: { lineStyle: { color: css('--line-2') } },
            itemStyle: { borderWidth: 0 },
            data: PHASES.map((ph, i) => ({ name: ph, value: [100, 82, 66, 55, 47, 41, 37, 34][i], itemStyle: { color: i === 7 ? css('--good') : css('--arc'), opacity: 1 - i * 0.08 } })) }]
        })));
        click(mk('ch-modelos', (b) => ({
          grid: Object.assign({}, b.grid, { top: 8 }), legend: { show: false },
          xAxis: ax(b, { type: 'value', axisLabel: { color: css('--fg-3'), fontSize: 11, formatter: (v) => v + ' mi' } }),
          yAxis: ax(b, { type: 'category', inverse: true, data: ['SY215C', 'SY135C', 'SW956K', 'SY75C', 'SR285R', 'SSR120'], splitLine: { show: false } }),
          tooltip: Object.assign({}, b.tooltip, { valueFormatter: (v) => 'R$ ' + v.toLocaleString('pt-BR') + ' mi' }),
          series: [{ name: 'Faturado', type: 'bar', barWidth: 10, itemStyle: { color: css('--c2'), borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: css('--fg-2'), fontSize: 11, formatter: (p) => p.value.toLocaleString('pt-BR') }, data: [8.28, 4.14, 3.42, 1.84, 0.77, 0.52] }]
        })));
        mk('ch-meta', (b) => {
          const days = Array.from({ length: 23 }, (_, i) => i + 1);
          const real = [0.4, 1.1, 1.5, 2.6, 3.1, 3.9, 4.4, 5.6, 6.2, 7.1, 8.0, 9.3, 10.1, 11.4, 12.2, 13.9, 15.1, 16.0, 17.2, 18.45];
          return {
            xAxis: ax(b, { type: 'category', data: days.map((d) => 'D' + d), splitLine: { show: false }, axisLabel: { color: css('--fg-3'), fontSize: 10, interval: 4 } }),
            yAxis: ax(b, { type: 'value', axisLabel: { color: css('--fg-3'), fontSize: 11, formatter: (v) => v + ' mi' } }),
            tooltip: Object.assign({}, b.tooltip, { axisPointer: { type: 'line', lineStyle: { color: css('--line-2') } }, valueFormatter: (v) => v == null ? '—' : 'R$ ' + (+v).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi' }),
            series: [
              { name: 'Meta linear', type: 'line', symbol: 'none', lineStyle: { width: 2, type: 'dashed', color: css('--fg-3') }, itemStyle: { color: css('--fg-3') }, data: days.map((d) => +(22 / 23 * d).toFixed(2)) },
              { name: 'Realizado', type: 'line', symbolSize: 7, showSymbol: false, lineStyle: { width: 2, color: css('--brand') }, itemStyle: { color: css('--brand') }, areaStyle: { color: css('--brand-soft') }, data: real, endLabel: { show: true, color: css('--fg'), formatter: '{c} mi', fontFamily: 'Chakra Petch', fontWeight: 600 } }
            ]
          };
        });
      }
      if (st.biTab === 'credito') {
        click(mk('ch-bancos', (b) => ({
          xAxis: ax(b, { type: 'category', data: BANKS.map((x) => x.n), splitLine: { show: false } }), yAxis: ax(b, { type: 'value' }),
          series: [
            { name: 'Aprovadas', type: 'bar', stack: 's', barWidth: 22, itemStyle: { color: css('--good'), borderColor: css('--panel-solid'), borderWidth: 1 }, data: [44, 29, 25, 13, 14] },
            { name: 'Em análise', type: 'bar', stack: 's', itemStyle: { color: css('--c2'), borderColor: css('--panel-solid'), borderWidth: 1 }, data: [6, 7, 5, 8, 4] },
            { name: 'Recusadas', type: 'bar', stack: 's', itemStyle: { color: css('--c3'), borderColor: css('--panel-solid'), borderWidth: 1, borderRadius: [4, 4, 0, 0] }, data: [2, 4, 3, 4, 1] }
          ]
        })));
        click(donutBanks('ch-banks2'));
      }
      if (st.biTab === 'operacao') {
        click(mk('ch-aging', (b) => ({
          xAxis: ax(b, { type: 'category', data: ['Triagem', 'Análise interna', 'Comitê', 'Aprovado', 'Formalização'], splitLine: { show: false } }), yAxis: ax(b, { type: 'value' }),
          series: [
            { name: 'até 8 h', type: 'bar', stack: 'a', barWidth: 22, itemStyle: { color: css('--c2'), borderColor: css('--panel-solid'), borderWidth: 1 }, data: [12, 14, 8, 15, 10] },
            { name: '8–20 h', type: 'bar', stack: 'a', itemStyle: { color: css('--c4'), borderColor: css('--panel-solid'), borderWidth: 1 }, data: [10, 13, 9, 6, 5] },
            { name: 'acima de 20 h', type: 'bar', stack: 'a', itemStyle: { color: css('--c3'), borderColor: css('--panel-solid'), borderWidth: 1, borderRadius: [4, 4, 0, 0] }, data: [6, 9, 17, 3, 3] }
          ]
        })));
        mk('ch-sla', (b) => ({
          xAxis: ax(b, { type: 'category', data: ['S36', 'S37', 'S38', 'S39', 'S40', 'S41', 'S42', 'S43'], splitLine: { show: false } }),
          yAxis: ax(b, { type: 'value', min: 50, max: 100, axisLabel: { color: css('--fg-3'), fontSize: 11, formatter: '{value}%' } }),
          tooltip: Object.assign({}, b.tooltip, { axisPointer: { type: 'line', lineStyle: { color: css('--line-2') } }, valueFormatter: (v) => v + '%' }), legend: { show: false },
          series: [{ name: 'SLA cumprido', type: 'line', smooth: true, symbolSize: 7, lineStyle: { width: 2, color: css('--arc') }, itemStyle: { color: css('--arc') }, areaStyle: { color: css('--arc-soft') }, data: [72, 75, 74, 78, 77, 80, 79, 81], markLine: { symbol: 'none', label: { color: css('--fg-3'), formatter: 'alvo 85%' }, lineStyle: { color: css('--fg-3'), type: 'dashed' }, data: [{ yAxis: 85 }] } }]
        }));
      }
      if (st.biTab === 'perdas') {
        click(mk('ch-perdas', (b) => ({
          grid: Object.assign({}, b.grid, { top: 8 }), legend: { show: false },
          xAxis: ax(b, { type: 'value' }), yAxis: ax(b, { type: 'category', inverse: true, splitLine: { show: false }, data: ['Preço / concorrência', 'Crédito recusado', 'Prazo de entrega', 'Desistência do cliente', 'Documentação incompleta'] }),
          series: [{ name: 'Perdas', type: 'bar', barWidth: 10, itemStyle: { color: css('--c3'), borderRadius: [0, 4, 4, 0] }, label: { show: true, position: 'right', color: css('--fg-2') }, data: [8, 6, 4, 3, 2] }]
        })));
        mk('ch-perdas-t', (b) => ({
          xAxis: ax(b, { type: 'category', data: months.slice(4), splitLine: { show: false } }), yAxis: ax(b, { type: 'value' }), legend: { show: false },
          series: [{ name: 'Perdas', type: 'bar', barWidth: 14, itemStyle: Object.assign({ color: css('--c3') }, bar4), data: [5, 4, 4, 3, 5, 2] }]
        }));
      }
    }
  };
  function donutBanks(id) {
    return mk(id, (b) => ({
      tooltip: { trigger: 'item', backgroundColor: css('--panel-solid'), borderColor: css('--line-2'), textStyle: { color: css('--fg') }, formatter: (p) => `${p.name}<br>R$ ${p.value.toLocaleString('pt-BR')} mi · ${p.percent}%` },
      legend: { orient: 'vertical', right: 0, top: 'middle', textStyle: { color: css('--fg-2'), fontSize: 11.5 }, icon: 'roundRect', itemWidth: 10, itemHeight: 10 },
      title: { text: 'R$ 118,5 mi', subtext: '5 bancos', left: '33%', top: '41%', textAlign: 'center', textStyle: { color: css('--fg'), fontFamily: 'Chakra Petch', fontSize: 17, fontWeight: 700 }, subtextStyle: { color: css('--fg-3'), fontSize: 11 } },
      series: [{ type: 'pie', radius: ['58%', '78%'], center: ['34%', '50%'], padAngle: 2, itemStyle: { borderRadius: 4 }, label: { show: false }, data: BANKS.map((x) => ({ name: x.n, value: x.vol })) }]
    }));
  }

  /* ---------- render ---------- */
  function render(opts) {
    charts.forEach((c) => c.dispose()); charts = [];
    renderSide(); renderTop();
    const view = $('#view');
    view.innerHTML = S[st.screen](st);
    if (AFTER[st.screen]) AFTER[st.screen]();
    if (!(opts && opts.keepScroll)) window.scrollTo({ top: 0 });
    renderTour();
  }
  function go(id, extra) {
    if (!S[id]) return;
    Object.assign(st, extra || {});
    st.screen = id;
    try { history.replaceState(null, '', '#' + id); } catch (e) {}
    $('#side').classList.remove('open');
    render();
  }

  /* ---------- toasts ---------- */
  function toast(msg, xp) {
    const d = document.createElement('div');
    if (xp) d.className = 'xp';
    d.innerHTML = msg;
    $('#toast').appendChild(d);
    setTimeout(() => d.remove(), 3200);
  }

  /* ---------- overlay: palette & dialogs ---------- */
  function closeOverlay() { $('#overlay').innerHTML = ''; }
  function palette() {
    const cmds = [];
    NAV.forEach((g) => g.items.filter((it) => canSee(it, g)).forEach((it) => cmds.push({ ic: it.ic, t: 'Ir para ' + it.label, k: 'nav', go: it.id })));
    const acts = [
      { ic: 'plus', t: 'Nova operação', go: 'simulador' }, { ic: 'check', t: 'Criar tarefa', go: 'tarefas' },
      { ic: 'life', t: 'Abrir chamado no suporte', go: 'suporte' }, { ic: 'target', t: 'Ver minha meta', go: 'arena' }
    ];
    $('#overlay').innerHTML = `<div class="scrim" data-scrim><div class="pal" role="dialog" aria-modal="true" aria-label="Ava e navegação">
      <div class="q"><span class="orb" aria-hidden="true"></span><input id="pal-q" placeholder="Pergunte algo ou digite para filtrar…" autocomplete="off"><button class="ibtn" data-close aria-label="Fechar">${icon('x')}</button></div>
      <div class="sec" id="pal-list"></div><div class="ans" id="pal-ans" hidden></div></div></div>`;
    const list = $('#pal-list'), q = $('#pal-q');
    const draw = () => {
      const v = q.value.trim().toLowerCase();
      const m = (x) => !v || x.t.toLowerCase().includes(v);
      const a = acts.filter(m), n = cmds.filter(m);
      list.innerHTML = (v ? `<h6>Ava</h6><button class="opt on" data-ask>${icon('spark')}Perguntar: “${q.value.replace(/[<>&"]/g, '')}”<kbd>Enter</kbd></button>` : `<h6>Sugestões da Ava</h6>${['Quais fichas estão travando minha meta?', 'Resumo da Mesa de Crédito hoje', 'Quem da equipe precisa de ajuda?'].map((s) => `<button class="opt" data-ask="${s}">${icon('spark')}${s}</button>`).join('')}`) +
        (a.length ? `<h6>Ações</h6>${a.map((x) => `<button class="opt" data-pgo="${x.go}">${icon(x.ic)}${x.t}</button>`).join('')}` : '') +
        (n.length ? `<h6>Telas</h6>${n.map((x) => `<button class="opt" data-pgo="${x.go}">${icon(x.ic)}${x.t}</button>`).join('')}` : '');
    };
    draw();
    q.addEventListener('input', draw);
    q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); ask(q.value || 'Resumo do dia'); } });
    setTimeout(() => q.focus(), 30);
  }
  function ask(text) {
    const ans = $('#pal-ans');
    if (!ans) return;
    ans.hidden = false;
    const t = text.toLowerCase();
    let a = 'Encontrei <b>2 fichas</b> com documento pendente somando <b>R$ 3,86 mi</b>, e a cotação da Pavimenta vence ao meio-dia. Quer que eu crie as tarefas de cobrança?';
    if (t.includes('mesa')) a = 'A Mesa tem <b>14 fichas</b> em análise. O comitê bancário está <b>4,6 dias</b> acima do SLA, concentrado na CEF. 6 fichas aguardam documento do cliente.';
    if (t.includes('equipe') || t.includes('ajuda')) a = '<b>Mateus Silva</b> está em 60% da meta, com 4 fichas pendentes e nenhuma proposta nesta semana. Sugiro uma sessão de 30 min e o desafio "Fichas limpas".';
    ans.innerHTML = `<span class="orb" aria-hidden="true"></span><div>${a}<div class="dim" style="font-size:11.5px;margin-top:6px">Resposta de exemplo · a Ava só consulta dados que você já pode ver</div></div>`;
  }
  function dialog(kind) {
    const D = {
      convite: ['Convidar usuário', `<div class="grid g2"><div class="field"><label for="d1">Nome</label><input id="d1" value="Fernanda Alves"></div><div class="field"><label for="d2">E-mail corporativo</label><input id="d2" value="fernanda.alves@irmen.com.br"></div><div class="field"><label for="d3">Cargo</label><select id="d3"><option>Vendedor</option><option>Assistente de Crédito</option><option>Gerente Comercial</option></select></div><div class="field"><label for="d4">Unidade</label><select id="d4"><option>Filial Goiânia</option><option>Filial Rio Verde</option></select></div></div><div class="panel" style="padding:12px"><span class="dim" style="font-size:12px">Código do vendedor sugerido</span><div class="num" style="font-size:22px">FA</div><span class="dim" style="font-size:11.5px">Primeira letra do nome + inicial do último sobrenome. Fica permanente após a confirmação.</span></div>`, 'Enviar convite', 'Convite enviado para fernanda.alves@irmen.com.br'],
      desafio: ['Criar desafio', `<div class="field"><label for="d1">Nome</label><input id="d1" value="Semana da pá carregadeira"></div><div class="grid g2"><div class="field"><label for="d2">Objetivo</label><select id="d2"><option>Propostas enviadas</option><option>Máquinas faturadas</option><option>Fichas completas em 48 h</option><option>Tempo de 1ª resposta</option></select></div><div class="field"><label for="d3">Alvo</label><input id="d3" type="number" value="8"></div><div class="field"><label for="d4">Participantes</label><select id="d4"><option>Equipe Centro-Oeste</option><option>Individual (cada vendedor)</option></select></div><div class="field"><label for="d5">Recompensa</label><input id="d5" value="+500 XP e insígnia"></div></div><p class="dim" style="font-size:12px;margin:0">Só eventos confirmados pelo sistema contam para o progresso.</p>`, 'Publicar desafio', 'Desafio publicado para a Equipe Centro-Oeste'],
      meta: ['Ajustar metas de novembro', `<div class="tbl-wrap"><table class="tbl" style="min-width:380px"><thead><tr><th>Vendedor</th><th class="r">Meta (R$)</th></tr></thead><tbody>${SELLERS.map((s, i) => `<tr><td>${s.n}</td><td class="r"><input id="mt${i}" aria-label="Meta de ${s.n}" style="width:140px;text-align:right;padding:6px 8px;border-radius:6px;border:1px solid var(--line-2);background:var(--bg-2)" value="${s.meta.toLocaleString('pt-BR')}"></td></tr>`).join('')}</tbody></table></div><div class="row" style="justify-content:space-between"><span class="muted">Soma da equipe</span><b class="num">R$ 20,0 mi</b></div>`, 'Salvar metas', 'Metas de novembro salvas'],
      ticket: ['Abrir chamado', `<div class="field"><label for="d1">Assunto</label><input id="d1" value="Não consigo anexar o IR dos sócios"></div><div class="grid g2"><div class="field"><label for="d2">Categoria</label><select id="d2"><option>Documentos</option><option>Acesso</option><option>Bug</option><option>Dúvida de crédito</option></select></div><div class="field"><label for="d3">Prioridade</label><select id="d3"><option>Normal</option><option>Alta</option></select></div></div><div class="panel" style="padding:12px;border-color:var(--arc-glow)"><b style="font-size:13px">${icon('spark')} A Ava encontrou um artigo</b><p class="muted" style="font-size:12.5px;margin:4px 0 0">"Limites de upload (20 MiB) e formatos aceitos" resolve 70% dos chamados parecidos.</p></div>`, 'Abrir chamado', 'Chamado SUP-209 aberto · SLA de 4 h'],
      lead: ['Criar organização e oportunidade', `<div class="field"><label for="d1">Organização</label><input id="d1" value="Loteadora Trindade Ltda"></div><div class="grid g2"><div class="field"><label for="d2">Contato</label><input id="d2" value="(62) 9 9455-1020"></div><div class="field"><label for="d3">Equipamento</label><select id="d3"><option>SY75C · Miniescavadeira</option></select></div></div><p class="dim" style="font-size:12px;margin:0">A conversa fica vinculada à nova oportunidade e o lead sai da fila "Sem dono".</p>`, 'Criar e abrir no funil', 'Oportunidade OPP-DS-20261022-A criada na fase Oportunidade']
    }[kind];
    if (!D) return;
    $('#overlay').innerHTML = `<div class="scrim" data-scrim><form class="dlg" role="dialog" aria-modal="true" aria-label="${D[0]}" data-dlg="${kind}"><div class="row" style="justify-content:space-between"><h2>${D[0]}</h2><button type="button" class="ibtn" data-close aria-label="Fechar">${icon('x')}</button></div>${D[1]}<div class="row" style="justify-content:flex-end"><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn pri" type="submit">${D[2]}</button></div></form></div>`;
    $('#overlay form').addEventListener('submit', (e) => {
      e.preventDefault(); closeOverlay(); toast(D[3]);
      if (kind === 'lead') go('funil');
    });
  }

  /* ---------- tour ---------- */
  const SPOT = { painel: '#t-brief', crm: '#t-docs', funil: '#t-kanban', simulador: '#t-sim', mesa: '#t-fila', operacoes: '#t-ped', arena: '#t-challenges', inbox: '#t-chat', tarefas: '#t-tasks', bi: '#t-filtros', suporte: '#t-tickets', usuarios: '#t-caps' };
  function startFlow(id) { st.tour = { f: FLOWS.find((f) => f.id === id), i: 0 }; if (st.tour.f.role) { st.role = st.tour.f.role; } stepTo(0); }
  function stepTo(i) {
    const t = st.tour; if (!t) return;
    t.i = Math.max(0, Math.min(t.f.steps.length - 1, i));
    const s = t.f.steps[t.i];
    const extra = {};
    if (s[0] === 'crm' && s[1]) extra.orgSel = s[1];
    if (s[0] === 'inbox' && s[1]) extra.conv = s[1];
    if (s[0] === 'bi') extra.biTab = 'comercial';
    go(s[0], extra);
    const el = SPOT[s[0]] && $(SPOT[s[0]]);
    if (el) { el.classList.add('spot'); el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' }); }
  }
  function renderTour() {
    const t = st.tour, box = $('#tourbar');
    if (!t) { box.innerHTML = ''; return; }
    const s = t.f.steps[t.i];
    box.innerHTML = `<div class="tour" role="region" aria-label="Demonstração guiada"><span class="orb" aria-hidden="true"></span><div class="tx"><span class="eyebrow">${t.f.n} · passo ${t.i + 1} de ${t.f.steps.length}</span><p style="color:var(--fg)">${s[2]}</p><div class="dots" aria-hidden="true">${t.f.steps.map((_, k) => `<i class="${k <= t.i ? 'on' : ''}"></i>`).join('')}</div></div>
      <div class="row"><button class="btn sm ghost" data-tour="end">Encerrar</button><button class="btn sm" data-tour="prev" ${t.i === 0 ? 'disabled' : ''}>${icon('back')}Anterior</button>${t.i < t.f.steps.length - 1 ? `<button class="btn sm pri" data-tour="next">Próximo${icon('arrow')}</button>` : `<button class="btn sm pri" data-tour="end">Concluir</button>`}</div></div>`;
  }

  /* ---------- events ---------- */
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go],[data-pgo],[data-flow],[data-tour],[data-fv],[data-bitab],[data-cfg],[data-org],[data-conv],[data-act],[data-ask],[data-close],[data-scrim],[data-palette],[data-theme-toggle],[data-open-menu],[data-close-menu],[data-notif],.seg button,.chip,.suggest button');
    if (!t) return;
    if (t.matches('[data-scrim]') && e.target !== t) return;
    if (t.dataset.go) { e.preventDefault(); const ex = {}; if (t.dataset.org) ex.orgSel = t.dataset.org; go(t.dataset.go, ex); return; }
    if (t.dataset.pgo) { closeOverlay(); go(t.dataset.pgo); return; }
    if (t.dataset.flow) { startFlow(t.dataset.flow); return; }
    if (t.dataset.tour) { const k = t.dataset.tour; if (k === 'end') { st.tour = null; renderTour(); toast('Demonstração encerrada'); } else stepTo(st.tour.i + (k === 'next' ? 1 : -1)); return; }
    if (t.dataset.fv) { st.funilView = t.dataset.fv; render({ keepScroll: true }); return; }
    if (t.dataset.bitab) { st.biTab = t.dataset.bitab; render({ keepScroll: true }); return; }
    if (t.dataset.cfg) { st.cfgTab = t.dataset.cfg; render({ keepScroll: true }); return; }
    if (t.dataset.org && t.classList.contains('conv')) { st.orgSel = t.dataset.org; render({ keepScroll: true }); return; }
    if (t.dataset.conv) { st.conv = t.dataset.conv; render({ keepScroll: true }); return; }
    if (t.dataset.act) { dialog(t.dataset.act); return; }
    if (t.hasAttribute('data-ask')) { ask(t.dataset.ask || $('#pal-q').value); return; }
    if (t.hasAttribute('data-close') || t.hasAttribute('data-scrim')) { closeOverlay(); return; }
    if (t.hasAttribute('data-palette')) { palette(); return; }
    if (t.hasAttribute('data-notif')) { toast('3 alertas: SLA da CEF, cotação vencendo, convite pendente'); return; }
    if (t.hasAttribute('data-open-menu')) { $('#side').classList.add('open'); return; }
    if (t.hasAttribute('data-close-menu')) { $('#side').classList.remove('open'); return; }
    if (t.hasAttribute('data-theme-toggle')) {
      document.documentElement.setAttribute('data-theme', isDark() ? 'light' : 'dark');
      net.recolor(); render({ keepScroll: true }); return;
    }
    if (t.matches('.suggest button')) { const i = $('#cmp'); if (i) { i.value = t.textContent.trim(); i.focus(); } if (t.textContent.includes('Criar contato')) dialog('lead'); return; }
    if (t.matches('.seg button') || t.matches('.chip')) { const p = t.parentElement; $$('.on', p).forEach((x) => x.classList.remove('on')); t.classList.add('on'); }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'role-sel') { st.role = t.value; try { localStorage.setItem('irmen-role', st.role); } catch (er) {} const vis = NAV.some((g) => g.items.some((it) => it.id === st.screen && canSee(it))); if (!vis) st.screen = 'painel'; render(); toast('Visão de ' + ROLES[st.role].label); return; }
    if (t.classList.contains('tk') && t.checked) { toast(`Tarefa concluída · <b style="color:var(--arc)">+${t.dataset.xp} XP</b>`, true); t.closest('.li').style.opacity = .5; return; }
    if (t.id === 'sim-m') { st.sim.m = +t.value; render({ keepScroll: true }); }
    if (t.id === 'sim-q') { st.sim.q = Math.max(1, +t.value || 1); render({ keepScroll: true }); }
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'sim-ent' || t.id === 'sim-pr') {
      st.sim[t.id === 'sim-ent' ? 'ent' : 'prazo'] = +t.value;
      const b = document.querySelector(`label[for="${t.id}"] b`);
      if (b) b.textContent = t.id === 'sim-ent' ? t.value + '%' : t.value + ' meses';
    }
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'sim-ent' || t.id === 'sim-pr') { render({ keepScroll: true }); const n = document.getElementById(t.id); if (n) n.focus({ preventScroll: true }); }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-composer]');
    if (!f) return;
    e.preventDefault();
    const i = $('input', f); if (!i.value.trim()) return;
    const box = f.parentElement.querySelector('.msgs');
    if (box) { const d = document.createElement('div'); d.className = 'msg me'; d.textContent = i.value; const tm = document.createElement('time'); tm.textContent = 'agora'; d.appendChild(tm); box.appendChild(d); box.scrollTop = box.scrollHeight; }
    i.value = '';
  });
  // Kanban drag and drop
  let dragId = null;
  document.addEventListener('dragstart', (e) => { const c = e.target.closest && e.target.closest('.kcard'); if (!c) return; dragId = c.dataset.deal; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (er) {} });
  document.addEventListener('dragend', (e) => { $$('.kcard.dragging').forEach((x) => x.classList.remove('dragging')); $$('.kcol.drop').forEach((x) => x.classList.remove('drop')); });
  document.addEventListener('dragover', (e) => { const col = e.target.closest && e.target.closest('.kcol'); if (!col || !dragId) return; e.preventDefault(); $$('.kcol.drop').forEach((x) => x !== col && x.classList.remove('drop')); col.classList.add('drop'); });
  document.addEventListener('drop', (e) => {
    const col = e.target.closest && e.target.closest('.kcol'); if (!col || !dragId) return; e.preventDefault();
    const d = DEALS.find((x) => x.id === dragId); const ph = +col.dataset.ph; dragId = null;
    if (!d || d.ph === ph) return render({ keepScroll: true });
    if (ph >= 6) { toast('Formalização e faturamento avançam pela Mesa, não pelo arraste'); return render({ keepScroll: true }); }
    d.ph = ph; render({ keepScroll: true });
    toast(`${d.id} movida para <b>${PHASES[ph]}</b> · histórico registrado`);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); palette(); }
    if (e.key === 'Escape') { closeOverlay(); $('#side').classList.remove('open'); }
  });
  window.addEventListener('resize', () => charts.forEach((c) => c.resize()));
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { net.recolor(); render({ keepScroll: true }); });
  new MutationObserver(() => { net.recolor(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- neural background ---------- */
  const net = (function () {
    const cv = $('#neural'), ctx = cv.getContext('2d');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dpr = 1, pts = [], mouse = { x: -999, y: -999 }, c1 = '63,208,255', c2 = '239,63,79', raf = 0;
    function recolor() { c1 = css('--net') || c1; c2 = css('--net-2') || c2; if (reduce) draw(); }
    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(110, Math.round(W * H / 16000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, r: Math.random() * 1.4 + 0.6, hot: Math.random() < 0.08 }));
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      const L = 130;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (!reduce) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
          if (d2 < 22000) { const f = (1 - d2 / 22000) * 0.6; p.vx += (dx / Math.sqrt(d2 + 1)) * f * 0.06; p.vy += (dy / Math.sqrt(d2 + 1)) * f * 0.06; }
          p.vx *= 0.985; p.vy *= 0.985;
          p.vx += (Math.random() - 0.5) * 0.01; p.vy += (Math.random() - 0.5) * 0.01;
          p.x += p.vx; p.y += p.vy;
          if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
        }
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < L * L) { ctx.strokeStyle = `rgba(${p.hot || q.hot ? c2 : c1},${(1 - Math.sqrt(d) / L) * 0.22})`; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (md < 170) { ctx.strokeStyle = `rgba(${c1},${(1 - md / 170) * 0.45})`; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        ctx.fillStyle = `rgba(${p.hot ? c2 : c1},${p.hot ? 0.9 : 0.6})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + (md < 120 ? 1 : 0), 0, Math.PI * 2); ctx.fill();
      }
    }
    function loop() { draw(); raf = requestAnimationFrame(loop); }
    size(); recolor();
    addEventListener('resize', () => { size(); if (reduce) draw(); });
    addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else if (!reduce) loop(); });
    if (reduce) draw(); else loop();
    return { recolor };
  })();

  render();
})();
