/* Shell, rota, transição de recorte, detalhamento e laboratório do protótipo. */
(function () {
  "use strict";
  const C = window.IRC, V = window.IRV, CH = window.IRCH, DR = window.IRDR;
  const { D, F, esc, icon, S } = C;
  const $ = (s, r = document) => r.querySelector(s);
  const NAV = [
    ["Operação", [["/dashboard", "Dashboard", "home"], ["/fora?tela=nova-operacao", "Nova Operação", "file"], ["/fora?tela=centro-operacoes", "Centro de Operações", "archive"], ["/fora?tela=clientes", "Clientes", "users"], ["/fora?tela=equipamentos", "Equipamentos", "package"], ["/fora?tela=simulador", "Crédito (Simulador)", "shield"], ["/fora?tela=areas", "Áreas & Localização", "map"]]],
    ["Comercial", [["/fora?tela=funil", "Funil comercial", "workflow"]]],
    ["Análise", [["/bi/comercial", "BI", "chart"], ["/relatorios", "Relatórios", "chart"], ["/fora?tela=ava", "AVA", "bot"]]],
    ["Administração", [["/fora?tela=configuracoes", "Configurações", "gear"]]]
  ];
  const TELAS = { "nova-operacao": "Nova Operação", "centro-operacoes": "Centro de Operações", clientes: "Clientes", equipamentos: "Equipamentos", simulador: "Crédito (Simulador)", areas: "Áreas & Localização", funil: "Funil comercial", ava: "AVA", configuracoes: "Configurações" };

  function navHtml(path) {
    const active = path.startsWith("/bi") ? "/bi/comercial" : path.startsWith("/relatorios") ? "/relatorios" : path === "/dashboard" ? "/dashboard" : null;
    const tela = C.parseHash().q.tela;
    return `<div class="jv-brand"><span class="jv-brand__mark">IR</span><div><div class="jv-brand__name">Portal IRMEN</div><div class="jv-brand__env">Protótipo · dados sintéticos</div></div></div>
      <nav class="jv-nav" aria-label="Menu principal">${NAV.map(([g, items]) => `<p class="jv-nav__heading">${g}</p>${items.map(([h, l, i]) => { const cur = h === active || (path === "/fora" && h.endsWith("tela=" + tela)); return `<a href="#${h}" ${cur ? 'aria-current="page"' : ""}>${icon(i)}<span>${l}</span></a>`; }).join("")}`).join("")}</nav>`;
  }
  function shell() {
    document.body.innerHTML = `<a class="jv-skip" href="#main" data-skip>Pular para o conteúdo</a>
      <canvas id="mesh" aria-hidden="true"></canvas><div class="portal-smoke" aria-hidden="true"></div>
      <div class="jv-shell"><div class="jv-shell__layout"><aside class="jv-side" id="side"></aside>
        <div class="jv-shell__content"><header class="jv-top">
          <button type="button" class="jv-shell-menu" data-act="drawer" aria-label="Abrir menu">${icon("menu")}</button>
          <div class="jv-top__title"><div class="jv-top__eyebrow" id="top-eyebrow"></div><div class="jv-top__name" id="top-name"></div></div>
          <div class="jv-top__tools">
            <button type="button" class="ava-cmd" data-act="ava"><span class="ava-dot" aria-hidden="true"></span>Ava · Navegar no Portal…<kbd>Ctrl K</kbd></button>
            <div class="jv-user-chip">${icon("user")}<div><b>Marina Sintética</b><span id="role-chip">Coordenadora de crédito</span></div></div>
            <button type="button" class="jv-icon-btn" data-act="theme" aria-label="Alternar tema">${icon("moon")}</button>
            <button type="button" class="jv-icon-btn" data-act="bell" aria-label="Notificações">${icon("bell")}</button>
            <button type="button" class="jv-icon-btn" data-act="logout" aria-label="Sair">${icon("logout")}</button>
          </div></header>
          <main class="jv-shell__main" id="main" tabindex="-1">
            <div class="jv-x-synth" role="note"><b>DADOS SINTÉTICOS</b><span class="grow">Protótipo de design. Nenhum número, nome de cliente ou código (prefixo SIN-) corresponde ao Portal real. Nomes e logos das instituições só ilustram o desenho. Sem conexão com o sistema.</span><a href="#/roteiro">Roteiro da demonstração →</a></div>
            <div id="head"></div><div id="rec"></div><div id="content"></div>
          </main></div></div></div>
      <div id="live" class="sr-only" aria-live="polite"></div><div id="toast" class="toast" role="status"></div><div id="drawer-root"></div>
      <div class="lab" id="lab"></div>`;
    document.body.appendChild(C.tip);
    applyTheme(); renderLab();
    window.__mesh = CH.mesh($("#mesh")); window.FX.spotlight();
  }
  function applyTheme() {
    if (S.theme === "light") document.documentElement.dataset.theme = "irmen-executive-light"; else delete document.documentElement.dataset.theme;
    const b = $('[data-act="theme"]'); if (b) b.innerHTML = icon(S.theme === "light" ? "moon" : "sun");
    document.documentElement.dataset.motion = S.motion === "reduced" ? "reduced" : "";
  }

  // ---------- rota ----------
  let cur = { path: null, q: {} };
  function viewFor(path) {
    if (path === "/dashboard") return { v: window.VIEW_DASH, eyebrow: "Operação", name: "Dashboard", keys: window.VIEW_DASH.keys };
    if (path.startsWith("/bi")) return { v: window.VIEW_BI, eyebrow: "Análise", name: "BI · " + window.VIEW_BI.tabOf(path).label, keys: window.VIEW_BI.keysFor(path) };
    if (path === "/relatorios") return { v: "central", eyebrow: "Análise", name: "Relatórios", keys: ["period", "branch", "seller"] };
    if (path.startsWith("/relatorios/")) { const r = window.VIEW_REL.repOf(path.split("/")[2]); return r ? { v: "consulta", id: r.id, eyebrow: "Análise", name: "Relatórios", keys: r.keys } : null; }
    if (path === "/fora") return { v: "fora", eyebrow: "Protótipo", name: "Fora deste protótipo", keys: [] };
    if (path === "/roteiro") return { v: "roteiro", eyebrow: "Protótipo", name: "Roteiro da demonstração", keys: [] };
    return null;
  }
  function headHtml(vf, q, path) {
    if (vf.v === window.VIEW_DASH) return vf.v.head(q);
    if (vf.v === window.VIEW_BI) return vf.v.head(q, path);
    if (vf.v === "central") return window.VIEW_REL.headCentral();
    if (vf.v === "consulta") return window.VIEW_REL.headConsulta(q, vf.id);
    if (vf.v === "fora") return `<div class="hero"><p class="jv-eyebrow">Fora deste protótipo</p><h1 class="jv-h1">${esc(TELAS[q.tela] || "Tela")}</h1><p class="jv-lead">Este protótipo cobre Dashboard, BI e Relatórios. As demais telas seguem o JARVIS homologado.</p></div>`;
    return `<div class="hero"><p class="jv-eyebrow">Protótipo · REV04</p><h1 class="jv-h1">Roteiro da demonstração</h1><p class="jv-lead">Seis percursos que provam os critérios da REV04. Cada link abre a tela no ponto certo.</p></div>`;
  }
  function recHtml(vf, q, path) {
    if (vf.v === window.VIEW_DASH) return vf.v.recorte(q);
    if (vf.v === window.VIEW_BI) return vf.v.recorte(q, path);
    if (vf.v === "consulta") return window.VIEW_REL.recorteConsulta(q, vf.id);
    if (vf.v === "central") return "";
    return "";
  }
  function contentHtml(vf, q, path) {
    if (vf.v === window.VIEW_DASH) return vf.v.content(q);
    if (vf.v === window.VIEW_BI) return vf.v.content(q, path);
    if (vf.v === "central") return window.VIEW_REL.central(q);
    if (vf.v === "consulta") return window.VIEW_REL.consulta(q, vf.id);
    if (vf.v === "fora") { const carried = Object.entries(q).filter(([k]) => !["tela", "estado"].includes(k)); return `<div class="jv-panel cp"><h2 class="jv-h2">Contexto que seria levado</h2><p class="cp__q">No produto, este link abre ${esc(TELAS[q.tela] || "a tela")} já filtrada com o recorte de origem, quando o contrato da tela de destino aceitar esses filtros.</p>
      <div class="recorte__chips" style="margin:12px 0">${carried.length ? carried.map(([k, v]) => `<span class="chip chip--base"><b>${esc(V.LABEL[k] || k)}</b>: ${esc(V.valueLabel(k, v))}</span>`).join("") : '<span class="dim">Sem filtros: abriria com o escopo padrão do seu perfil.</span>'}${q.estado ? `<span class="chip chip--base"><b>Estado</b>: em andamento</span>` : ""}</div>
      <p><a class="ds-button" href="javascript:history.back()">${icon("back")}Voltar</a> <a class="ds-button" href="../">Prévias JARVIS homologadas</a></p></div>`; }
    return roteiro();
  }
  function roteiro() {
    const steps = [
      ["Dashboard por área, com painel de atenção único", "#/dashboard", "Use as abas Comercial, Operações de crédito, Documentação e Faturamento. No topo, escolha os indicadores do pulso (Escolher indicadores). O painel Precisa da sua atenção junta pendências, decisões e documentos; Pendências não é alimentado automaticamente pelo status Pendente do banco."],
      ["Filtro geral, filtro do painel e comparativo", "#/bi/comercial?period=90d", "Troque o período no filtro geral: todos os painéis sem filtro próprio acompanham. Abra Filtros em um painel e escolha outro vendedor: só ele muda. Ligue Iniciar comparativo e escolha no calendário o início do período comparado."],
      ["Duas ou mais visões em cada gráfico", "#/bi/comercial?cmp=1", "Em cada painel, alterne as visões no seletor de ícones: árvore × destino por vendedor, fluxo × funil clássico, Qtd × R$, calendário × dia da semana. Pipeline aberto mostra \"sem histórico\" no comparativo, porque é fotografia de hoje."],
      ["Reprovação: comercial × operação × banco", "#/bi/operacoes", "Perdida por crédito fica só na aba Comercial (Motivos das perdas). Aqui, Reprovação: operação × banco mostra, linha a linha, quando um banco reprovou e a operação seguiu com outro, e quando a operação inteira foi reprovada por crédito (LC-DEP-01). Em Por instituição, o histórico de transições trata Recebida e Pendente como entradas paralelas."],
      ["Documentação só com estados reais", "#/bi/documentacao", "Pendente (não enviado), enviado aguardando validação, validado e rejeitado. Sem Dispensado. Veja % OK por vendedor, completude por banco e do documento mais enviado ao menos enviado."],
      ["Faturamento = Encerrada", "#/bi/faturamento?cmp=1", "Faturado com 5 visões, máquinas faturadas, relatório por equipamento (maior e menor preço da história), metas (prévia FAT-DEP-META), comparativo entre vendedores (só gestão), caminho do dinheiro, volume financiado pelo banco do desembolso e painéis de mercado."]
    ];
    return `<ol class="catalog" style="list-style:none;padding:0;margin:0">${steps.map(([t, h, d], i) => `<li class="rep"><span class="jv-eyebrow">Percurso ${i + 1}</span><p class="rep__q">${t}</p><p class="muted" style="margin:0;font-size:12.5px">${d}</p><div class="rep__formats"><a class="ds-button ds-button--sm" href="${h}">${icon("arrow")}Abrir</a></div></li>`).join("")}</ol>`;
  }

  function fullRender(p) {
    const vf = viewFor(p.path); if (!vf) return C.go("/dashboard");
    $("#side").innerHTML = navHtml(p.path); $("#top-eyebrow").textContent = vf.eyebrow; $("#top-name").textContent = vf.name;
    document.title = vf.name + " · Portal IRMEN (protótipo)";
    const swap = () => {
      $("#head").innerHTML = headHtml(vf, p.q, p.path); $("#rec").innerHTML = recHtml(vf, p.q, p.path);
      const c = $("#content");
      c.innerHTML = `<div class="stack-v" aria-busy="true">${C.skeleton(3)}</div>`;
      const delay = S.scenario === "slow" ? 1600 : 260;
      setTimeout(() => { c.innerHTML = contentHtml(vf, p.q, p.path); c.classList.remove("view-enter"); void c.offsetWidth; c.classList.add("view-enter"); afterRender(c); window.FX.intro(c); if (p.q.focus) { const t = document.getElementById(p.q.focus); if (t) t.scrollIntoView({ behavior: C.reduced() ? "auto" : "smooth", block: "start" }); } if (p.q.drill) openDrill(p.q, null); }, delay);
    };
    const sameArea = cur.path && cur.path.split("/")[1] === p.path.split("/")[1];
    if (document.startViewTransition && !C.reduced() && sameArea) document.startViewTransition(swap); else swap();
    if (!sameArea) window.scrollTo({ top: 0 });
  }
  function afterRender(root) { root.querySelectorAll('[data-act="retry"]').forEach(b => b.addEventListener("click", () => { S.scenario = "normal"; renderLab(); update(cur.q, cur.q, null); })); }

  // Atualização animada: marca painéis como "atualizando", troca o conteúdo e anima do valor anterior para o novo.
  let pendingScope = null, updTimer = null;
  function update(prevQ, q, scope, opts = {}) {
    const c = $("#content"), rec = $("[data-recorte]"), vf = viewFor(cur.path);
    const prev = C.captureValues(c);
    const targets = scope ? c.querySelectorAll(`.cp[data-panel="${scope}"]`) : c.querySelectorAll(".cp, .attn__card, .kpi");
    targets.forEach(t => { t.dataset.busy = "true"; t.dataset.done = "false"; });
    if (rec) { rec.dataset.busy = "false"; void rec.offsetWidth; rec.dataset.busy = "true"; if (rec.classList.contains("mf")) { const sig = signature(document.activeElement); $("#rec").innerHTML = recHtml(vf, q, cur.path); const nr = $("[data-recorte]"); nr.dataset.busy = "true"; if (sig) { const el = nr.querySelector(sig); if (el) el.focus({ preventScroll: true }); } } else refreshRecorte(prevQ, q, vf); setStatus("busy", opts.auto ? "Atualizando dados…" : "Aplicando recorte…"); }
    C.announce(opts.auto ? "Atualizando dados." : "Aplicando recorte.");
    const focusSig = signature(document.activeElement);
    clearTimeout(updTimer);
    const delay = S.scenario === "slow" ? 1800 : C.reduced() ? 180 : 700;
    updTimer = setTimeout(() => {
      const y = window.scrollY;
      c.innerHTML = contentHtml(vf, q, cur.path); afterRender(c);
      window.scrollTo({ top: y });
      ghosts(c, prev); C.animateFrom(c, prev);
      const done = scope ? c.querySelectorAll(`.cp[data-panel="${scope}"]`) : c.querySelectorAll(".cp");
      done.forEach(t => { t.dataset.done = "true"; });
      if (focusSig) { const el = c.querySelector(focusSig); if (el) el.focus({ preventScroll: true }); }
      const rec2 = $("[data-recorte]"); if (rec2) rec2.dataset.busy = "false";
      if (rec) { setStatus("done", (opts.auto ? "Atualizado " : "Recorte aplicado ") + "às " + F.time(S.lastUpdate)); }
      C.announce(summary(vf, q));
    }, delay);
  }
  window.IRAPP = { refresh: () => update(cur.q, cur.q, null) };
  function signature(el) { if (!el || el === document.body) return null; if (el.dataset && el.dataset.q && el.dataset.v != null) return `[data-q="${CSS.escape(el.dataset.q)}"][data-v="${CSS.escape(el.dataset.v)}"]`; if (el.dataset && el.dataset.drill) return `[data-drill="${el.dataset.drill}"]${el.dataset.dv ? `[data-dv="${el.dataset.dv}"]` : ""}`; if (el.dataset && el.dataset.q) return `[data-q="${CSS.escape(el.dataset.q)}"]`; return null; }
  function setStatus(tone, text) { const s = $("[data-recorte-status]"); if (!s) return; s.dataset.tone = tone; s.innerHTML = (tone === "busy" ? icon("refresh") : icon("check")) + esc(text); }
  function refreshRecorte(prevQ, q, vf) {
    const box = $("[data-chips]"); if (!box) return;
    const tmp = document.createElement("div"); tmp.innerHTML = recHtml(vf, q, cur.path);
    const nb = tmp.querySelector("[data-chips]"); nb.querySelectorAll("[data-chip]").forEach(ch => { const k = ch.dataset.chip; if ((prevQ[k] || "") !== (q[k] || "")) ch.dataset.new = "true"; });
    box.innerHTML = nb.innerHTML;
    document.querySelectorAll("[data-recorte] select[data-q]").forEach(s => { const k = s.dataset.q, n = tmp.querySelector(`select[data-q="${k}"]`); if (n) { s.value = n.value; s.dataset.active = n.dataset.active; } });
    const clr = $('[data-recorte] [data-act="clear"]'), nclr = tmp.querySelector('[data-act="clear"]'); if (clr && nclr) clr.disabled = nclr.disabled;
  }
  // "Fantasma" da largura anterior: deixa visível de onde o dado saiu.
  function ghosts(root, prev) {
    if (C.reduced()) return;
    root.querySelectorAll(".bar__fill[data-k], .funnel__fill[data-k]").forEach(el => {
      const old = prev.get(el.dataset.k); if (!old || old.w == null || Math.abs(+old.w - +el.dataset.w) < 0.5) return;
      let g = el.parentElement.querySelector(".bar__ghost, .funnel__ghost");
      if (!g) { g = document.createElement("span"); g.className = "bar__ghost"; el.parentElement.insertBefore(g, el); }
      g.style.width = old.w + "%"; g.dataset.on = "true"; setTimeout(() => { g.dataset.on = "false"; }, 2600);
    });
  }
  function summary(vf, q) {
    const parts = (vf.keys || []).filter(k => q[k]).map(k => (V.LABEL[k] || k) + " " + V.valueLabel(k, q[k]));
    const kp = [...document.querySelectorAll("#content .kpi__label")].slice(0, 2).map(l => l.textContent.trim() + ": " + (l.parentElement.querySelector("[data-k]") || {}).textContent).join("; ");
    return "Recorte aplicado" + (parts.length ? ": " + parts.join(", ") : "") + ". " + kp;
  }

  // ---------- detalhamento ----------
  let drillOrigin = null;
  function openDrill(q, fromEl) {
    const d = DR.build(q.drill, q, q.dv); if (!d) return;
    const vf = viewFor(cur.path); const rows = d.rows || [], cols = d.cols.filter(c => !c.hidden), show = rows.slice(0, 40);
    const fp = C.fingerprint(Object.fromEntries((vf.keys || []).map(k => [k, q[k] || (k === "period" ? "90d" : "")])));
    const filt = (vf.keys || []).filter(k => k !== "period" && q[k]).map(k => `<span class="chip chip--base">${esc(V.LABEL[k] || k)}: <b>${esc(V.valueLabel(k, q[k]))}</b></span>`).join("");
    const root = $("#drawer-root");
    root.innerHTML = `<div class="drawer-bg" data-act="close-drill"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-t" tabindex="-1">
      <div class="drawer__head"><div class="grow"><p class="jv-eyebrow">Registros que compõem este número · ${esc(d.unit)}</p><h2 class="jv-h2" id="dr-t" style="font-size:16px;margin-top:4px">${esc(d.title)}</h2>
        <div class="drawer__num"><b>${F.int(rows.length)}</b><span class="muted">${C.plural(rows.length, "registro", "registros").replace(/^\S+ /, "")}</span>${d.moneyText ? `<span class="muted">· ${d.moneyText}</span>` : ""}</div></div>
        <button type="button" class="jv-icon-btn" data-act="close-drill" aria-label="Fechar e voltar ao painel">${icon("x")}</button></div>
      <div class="drawer__body"><p class="drawer__def">${esc(d.def)}</p>
        <div class="recorte__chips" style="margin:0 0 12px">${(vf.keys || []).includes("period") ? `<span class="chip chip--base">Período: <b>${esc(C.periodLabel(q.period || "90d"))}</b></span>` : ""}${filt}<span class="recorte__fp">${fp}</span></div>
        ${rows.length ? `<div class="tbl-wrap"><table class="tbl tbl--cards"><thead><tr>${cols.map(c => `<th class="${c.r ? "r" : ""}">${c.label}</th>`).join("")}</tr></thead><tbody>${show.map(x => `<tr>${cols.map(c => `<td data-l="${c.label}" class="${c.r ? "r" : ""}">${c.html ? c.html(x) : esc(x[c.id])}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${rows.length > show.length ? `<p class="dim" style="font-size:12px">Mostrando ${show.length} de ${rows.length}. O CSV traz todas as linhas.</p>` : ""}` : C.state("empty", "Nenhum registro", "Este número é zero no recorte atual.")}
      </div>
      <div class="drawer__foot"><button type="button" class="ds-button" data-act="close-drill">${icon("back")}Voltar ao painel</button><button type="button" class="ds-button ds-button--primary" data-act="drill-csv" ${rows.length ? "" : "disabled"}>${icon("download")}CSV deste recorte</button></div></aside>`;
    const dr = $(".drawer", root); if (fromEl) CH.morph(fromEl, dr.getBoundingClientRect());
    dr.focus(); window.__drill = { d, fp };
    C.announce(`Detalhamento aberto: ${d.title}, ${rows.length} registros.`);
  }
  function closeDrill() {
    const root = $("#drawer-root"); if (!root.innerHTML) return; root.innerHTML = "";
    const sel = drillOrigin; drillOrigin = null;
    const el = sel && document.querySelector(sel); if (el) el.focus({ preventScroll: false });
  }

  // ---------- eventos ----------
  window.addEventListener("hashchange", () => {
    const p = C.parseHash(); const prev = cur; cur = p;
    if (prev.path !== p.path) { closeDrillDom(); fullRender(p); return; }
    const strip = q => { const o = { ...q }; delete o.drill; delete o.dv; return JSON.stringify(Object.keys(o).sort().map(k => [k, o[k]])); };
    if (strip(prev.q) !== strip(p.q)) { const scope = pendingScope; pendingScope = null; update(prev.q, p.q, scope); }
    if (p.q.drill && (p.q.drill !== prev.q.drill || p.q.dv !== prev.q.dv)) openDrill(p.q, window.__drillFrom || null);
    if (!p.q.drill && prev.q.drill) closeDrill();
    window.__drillFrom = null;
  });
  function closeDrillDom() { $("#drawer-root").innerHTML = ""; }
  function setQ(patch, scopeEl) {
    const q = { ...cur.q, ...patch }; Object.keys(patch).forEach(k => { if (patch[k] === "" || patch[k] == null) delete q[k]; });
    if (!("pg" in patch)) delete q.pg; delete q.drill; delete q.dv; delete q.focus;
    pendingScope = scopeEl ? (scopeEl.closest(".cp") || {}).dataset && scopeEl.closest(".cp") && scopeEl.closest(".cp").dataset.panel : null;
    C.go(cur.path, q);
  }
  document.addEventListener("change", e => {
    // Período livre: as duas datas formam um só valor "d:de:até".
    const fr = e.target.closest("input[data-qr]");
    if (fr) { const box = fr.closest(".pfree"); const v = k => (box.querySelector(`[data-end="${k}"]`) || {}).value; let x = v("a"), y = v("b"); if (!x || !y) return; if (x > y) [x, y] = [y, x]; setQ({ [fr.dataset.qr]: `d:${x}:${y}`, [fr.dataset.qr === "period" ? "cmpf" : fr.dataset.qr.replace(/\.p$/, ".cf")]: "" }, fr.closest("[data-recorte]") ? null : fr); return; }
    const s = e.target.closest("select[data-q], input[data-q]"); if (!s) return;
    const v = s.type === "checkbox" ? (s.checked ? "1" : "") : s.value;
    const patch = { [s.dataset.q]: v };
    // Desligar o comparativo limpa a data escolhida.
    if (s.type === "checkbox" && !v) patch[s.dataset.q === "cmp" ? "cmpf" : s.dataset.q.replace(/\.c$/, ".cf")] = "";
    setQ(patch, s.closest("[data-recorte]") ? null : s);
  });
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-q][data-v], [data-unchip], [data-act], [data-drill], [data-export], [data-lab]");
    if (!t) return;
    if (t.matches("[data-lab]")) return labClick(t);
    if (t.matches("[data-export]")) { if (t.getAttribute("aria-disabled") === "true") { C.toast(t.title || "Indisponível", "warn"); return; } return window.VIEW_REL.doExport(t.dataset.export, cur.q, cur.path.split("/")[2]); }
    if (t.matches("[data-drill]")) { e.preventDefault(); drillOrigin = signature(t); window.__drillFrom = t; C.go(cur.path, { ...cur.q, drill: t.dataset.drill, dv: t.dataset.dv || "" }); return; }
    if (t.matches("[data-unchip]")) { const ch = t.closest(".chip"); ch.dataset.leaving = "true"; setTimeout(() => setQ({ [t.dataset.unchip]: "" }), C.reduced() ? 0 : 180); return; }
    if (t.matches("[data-q][data-v]")) { if (t.disabled) return; setQ({ [t.dataset.q]: t.dataset.v }, t); return; }
    const a = t.dataset.act;
    if (a === "pclear") { const pid = t.dataset.pid, patch = {}; Object.keys(cur.q).forEach(k => { if (k.startsWith(pid + ".") && !k.endsWith(".v")) patch[k] = ""; }); setQ(patch, t); return; }
    if (a === "clear") { const vf = viewFor(cur.path); const patch = {}; (vf.keys || []).forEach(k => { patch[k] = ""; }); setQ(patch); }
    else if (a === "theme") { S.theme = S.theme === "light" ? "dark" : "light"; try { localStorage.setItem("irmen-dbr-theme", S.theme); } catch (err) { /* opcional */ } applyTheme(); renderLab(); }
    else if (a === "drawer") openNavDrawer();
    else if (a === "close-nav") { $("#nav-drawer") && $("#nav-drawer").remove(); }
    else if (a === "close-drill") { history.length > 1 && cur.q.drill ? history.back() : C.go(cur.path, { ...cur.q, drill: "", dv: "" }); }
    else if (a === "drill-csv") { const { d, fp } = window.__drill; C.download(`irmen-sintetico-${d.key}-${fp}.csv`, C.csv(d.cols, d.rows)); C.toast(`CSV gerado: ${d.rows.length} linhas · recorte ${fp} · dados sintéticos`); }
    else if (a === "csv-detail") { const d = DR.build("opp_open", cur.q) ; const st = window.IRF && window.IRF.SETS["c-detail-csv"]; const rows = st ? st.rows : window.IRM.opps(cur.q); C.download("irmen-sintetico-oportunidades.csv", C.csv(d.cols, rows)); C.toast(`CSV gerado: ${rows.length} oportunidades · proposta P-A02 · dados sintéticos`); }
    else if (a === "refresh") doRefresh(false);
    else if (a === "ava" || a === "bell" || a === "logout") C.toast("Fora do escopo deste protótipo.", "arc");
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { if ($("#drawer-root").innerHTML) { e.preventDefault(); $('[data-act="close-drill"]').click(); } else if ($("#nav-drawer")) $("#nav-drawer").remove(); else if ($(".lab__panel")) { S.labOpen = false; renderLab(); } }
    if (e.key === "Tab" && $("#drawer-root").innerHTML) { const f = [...$(".drawer").querySelectorAll("button,a,[tabindex]:not([tabindex='-1'])")].filter(x => !x.disabled); if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("g[data-drill], path[data-drill]")) { e.preventDefault(); e.target.dispatchEvent(new MouseEvent("click", { bubbles: true })); }
  });
  document.addEventListener("click", e => { const g = e.target.closest("[data-skip]"); if (g) { e.preventDefault(); $("#main").focus(); } }, true);
  function openNavDrawer() {
    const d = document.createElement("div"); d.id = "nav-drawer";
    d.innerHTML = `<div class="jv-drawer-backdrop" data-act="close-nav"></div><div class="jv-drawer" role="dialog" aria-modal="true" aria-label="Menu">${navHtml(cur.path)}</div>`;
    document.body.appendChild(d); d.querySelector("a").focus(); d.addEventListener("click", ev => { if (ev.target.closest("a")) d.remove(); });
  }

  // ---------- atualização automática (Dashboard) ----------
  let tick = 60, t0 = Date.now();
  function doRefresh(auto) { S.lastUpdate = new Date(D.NOW.getTime() + (Date.now() - t0)); tick = 60; const at = $("[data-refresh-at]"); if (at) at.textContent = "Atualizado às " + F.time(S.lastUpdate); update(cur.q, cur.q, null, { auto: true }); if (!auto) C.toast("Dados atualizados às " + F.time(S.lastUpdate) + " · nenhuma mudança no recorte"); }
  setInterval(() => {
    if (cur.path !== "/dashboard" || document.visibilityState !== "visible") return;
    tick--; const ring = $("[data-refresh-ring]"), nx = $("[data-refresh-next]");
    if (ring) ring.setAttribute("stroke-dashoffset", String(((60 - tick) / 60) * 100));
    if (nx) nx.textContent = `Próxima atualização em ${tick} s`;
    if (tick <= 0) doRefresh(true);
  }, 1000);

  // ---------- laboratório ----------
  function renderLab() {
    const seg = (name, items, val) => `<div class="jv-seg" role="group" aria-label="${name}">${items.map(([id, l]) => `<button type="button" data-lab="${name}" data-v="${id}" aria-pressed="${val === id}">${l}</button>`).join("")}</div>`;
    $("#lab").innerHTML = `<button type="button" class="lab__btn" data-lab="toggle" aria-expanded="${!!S.labOpen}">${icon("flask")}<span>Laboratório</span></button>
      ${S.labOpen ? `<div class="lab__panel" role="dialog" aria-label="Laboratório do protótipo"><h2>Laboratório</h2><p>Simula estados das fontes, perfil e acessibilidade. Não existe no produto.</p>
        <p class="h3">Estado das fontes</p>${seg("scenario", [["normal", "Normal"], ["slow", "Lento"], ["empty", "Sem dados"], ["nosource", "Fonte indisponível"], ["error", "Erro"], ["denied", "Sem acesso"]], S.scenario)}
        <p class="h3">Perfil</p>${seg("profile", [["coord", "Coordenador"], ["seller", "Vendedor"]], S.profile)}
        <p class="h3">Movimento</p>${seg("motion", [["auto", "Do sistema"], ["reduced", "Reduzido"]], S.motion)}
        <p class="h3">Tema</p>${seg("theme", [["dark", "Dark"], ["light", "Slate"]], S.theme)}
        <p class="h3">Roteiro</p><ol><li><a href="#/roteiro">Ver os seis percursos</a></li></ol></div>` : ""}`;
  }
  function labClick(t) {
    const k = t.dataset.lab;
    if (k === "toggle") { S.labOpen = !S.labOpen; renderLab(); return; }
    S[k] = t.dataset.v;
    if (k === "theme") { try { localStorage.setItem("irmen-dbr-theme", S.theme); } catch (err) { /* opcional */ } }
    applyTheme(); renderLab();
    if (k === "profile") { $("#role-chip").textContent = S.profile === "seller" ? "Vendedora · escopo próprio" : "Coordenadora de crédito"; fullRender(cur); return; }
    if (k === "scenario" || k === "motion") update(cur.q, cur.q, null);
    if (k === "motion" && window.__mesh) window.__mesh.restart();
  }

  document.addEventListener("DOMContentLoaded", () => { shell(); cur = C.parseHash(); if (!location.hash) history.replaceState(null, "", "#/dashboard"); fullRender(cur); });
})();
