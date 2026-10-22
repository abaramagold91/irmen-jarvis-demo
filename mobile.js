/* Camada mobile do protótipo. Só age em telas até 860 px; no desktop não faz nada.
   Não altera app.js: observa cada render de #view e ajusta a apresentação. */
(function () {
  const mq = matchMedia('(max-width:860px)');
  const sm = matchMedia('(max-width:640px)');
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const icon = (n) => (window.IR && window.IR.icon ? window.IR.icon(n) : '');

  /* tabelas → cartões: rótulo de cada célula vem do cabeçalho da coluna */
  function cards() {
    document.querySelectorAll('table.tbl').forEach((t) => {
      const heads = Array.from(t.querySelectorAll('thead th')).map((th) => th.textContent.trim());
      t.querySelectorAll('tbody tr').forEach((tr) => {
        Array.from(tr.children).forEach((td, i) => {
          if (td.dataset.label !== undefined) return;
          td.dataset.label = heads[i] || '';
          const w = document.createElement('div');
          w.className = 'm-cell';
          while (td.firstChild) w.appendChild(td.firstChild);
          td.appendChild(w);
        });
      });
    });
  }

  /* pontos indicadores para carrosséis */
  function dots(sc) {
    if (!sc || (sc.nextElementSibling && sc.nextElementSibling.classList.contains('m-dots'))) return;
    const kids = Array.from(sc.children);
    if (kids.length < 2 || sc.scrollWidth <= sc.clientWidth + 4) return;
    const d = document.createElement('div');
    d.className = 'm-dots';
    d.setAttribute('aria-hidden', 'true');
    d.innerHTML = kids.map(() => '<i></i>').join('');
    sc.after(d);
    const upd = () => {
      const left = sc.getBoundingClientRect().left;
      let best = 0, bd = Infinity;
      kids.forEach((k, i) => { const x = Math.abs(k.getBoundingClientRect().left - left); if (x < bd) { bd = x; best = i; } });
      d.querySelectorAll('i').forEach((el, i) => el.classList.toggle('on', i === best));
    };
    sc.addEventListener('scroll', upd, { passive: true });
    upd();
  }
  function reveal(sc, el) { if (sc && el) sc.scrollLeft = el.getBoundingClientRect().left - sc.getBoundingClientRect().left + sc.scrollLeft - 2; }

  /* CRM: organizações num carrossel horizontal */
  function crmCarousel() {
    const sec = document.querySelector('#t-crm > section');
    if (!sec || sec.querySelector('.m-hscroll')) return;
    const convs = Array.from(sec.querySelectorAll(':scope > .conv'));
    if (!convs.length) return;
    const box = document.createElement('div');
    box.className = 'm-hscroll';
    convs[0].before(box);
    convs.forEach((c) => box.appendChild(c));
    reveal(box, box.querySelector('.conv.on'));
  }

  /* gráficos: legendas embaixo e rótulos dentro quando a largura é pequena */
  function charts() {
    if (!window.echarts) return;
    ['ch-banks', 'ch-banks2'].forEach((id) => {
      const el = document.getElementById(id); const c = el && echarts.getInstanceByDom(el);
      if (!c || el.clientWidth > 420) return;
      c.setOption({ legend: { orient: 'horizontal', left: 'center', right: 'auto', top: 'auto', bottom: 0 }, title: { left: '50%', top: '34%' }, series: [{ center: ['50%', '42%'], radius: ['50%', '70%'] }] });
    });
    const f = document.getElementById('ch-funil'); const fc = f && echarts.getInstanceByDom(f);
    if (fc && f.clientWidth <= 420) fc.setOption({ series: [{ left: '0%', right: '44%', label: { fontSize: 10.5 } }] });
    document.querySelectorAll('.chart').forEach((el) => { const c = echarts.getInstanceByDom(el); if (c) c.resize(); });
  }

  function enhance() {
    if (!mq.matches) return;
    if (sm.matches) cards();
    crmCarousel();
    const cl = document.querySelector('.chat .c-list');
    if (cl) reveal(cl, cl.querySelector('.conv.on'));
    document.querySelectorAll('.kanban, .phases, .m-hscroll, .chat .c-list').forEach(dots);
    charts();
  }

  /* Kanban no toque: tocar no cartão abre "Mover para…" e usa a mesma regra do arrastar */
  const PH = () => (window.IR && window.IR.PHASES) || [];
  function moveSheet(card) {
    const ph = +card.closest('.kcol').dataset.ph;
    const name = card.querySelector('.org') ? card.querySelector('.org').textContent : '';
    document.getElementById('overlay').innerHTML = `<div class="scrim" data-scrim><div class="dlg" role="dialog" aria-modal="true" aria-label="Mover oportunidade">
      <div class="row" style="justify-content:space-between"><h2>Mover para…</h2><button type="button" class="ibtn" data-close aria-label="Fechar">${icon('x')}</button></div>
      <p class="muted" style="margin:0;font-size:13px"><span class="mono">${card.dataset.deal}</span> · ${name}</p>
      <div class="list">${PH().map((p, i) => `<button type="button" class="li m-mv" data-mv="${i}" ${i === ph ? 'disabled' : ''} style="border:0;border-bottom:1px solid var(--line);background:transparent;width:100%;text-align:left;align-items:center;${i === ph ? 'opacity:.5' : ''}"><span class="pill ${i === 7 ? 'good' : 'neutral'} nodot mono">${i + 1}</span><span style="flex:1">${p}</span>${i === ph ? '<span class="dim" style="font-size:12px">fase atual</span>' : i >= 6 ? '<span class="dim" style="font-size:12px">pela Mesa</span>' : icon('arrow')}</button>`).join('')}</div>
    </div></div>`;
    const first = document.querySelector('#overlay .m-mv:not([disabled])');
    if (first) first.focus();
    moveSheet.card = card;
  }
  function moveTo(i) {
    const card = moveSheet.card; document.getElementById('overlay').innerHTML = '';
    const col = document.querySelector(`.kcol[data-ph="${i}"]`);
    if (!card || !col) return;
    let dt; try { dt = new DataTransfer(); } catch (e) { dt = undefined; }
    const ev = (t, el) => el.dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt }));
    ev('dragstart', card); ev('dragover', col); ev('drop', col); ev('dragend', document.body);
    setTimeout(() => { const k = document.querySelector('.kanban'); reveal(k, document.querySelector(`.kcol[data-ph="${i}"]`)); }, 0);
  }
  document.addEventListener('click', (e) => {
    if (!mq.matches) return;
    const mv = e.target.closest('.m-mv');
    if (mv) { moveTo(+mv.dataset.mv); return; }
    const card = e.target.closest('.kcard');
    if (card) moveSheet(card);
  });

  const start = () => {
    const v = document.getElementById('view');
    if (!v) return;
    new MutationObserver(enhance).observe(v, { childList: true });
    enhance();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
