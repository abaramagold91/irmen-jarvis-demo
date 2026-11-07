/*
 * BI REV04 · "Por que os resultados mudaram". Quatro abas, cada uma com a sua unidade.
 * Mesmas regras do Dashboard: filtro geral no topo, filtro próprio em cada painel, comparativo com calendário,
 * duas ou mais formas de ver por painel e seletor de KPIs em toda faixa.
 */
(function () {
  "use strict";
  const C = window.IRC, M = window.IRM, V = window.IRV, FX = window.FX, X3 = window.FX3, X4 = window.FX4, IRF = window.IRF, A = window.IRA;
  const { D, L, F, esc, icon, lcChip, oppChip, bsChip, unitTag, S } = C;
  const { sum, avg } = A;
  const SET = IRF.SET, plural = C.plural, STAGE = FX.STAGE;
  const BASE = ["period", "branch", "mgr", "seller"];
  const TABS = [
    { id: "comercial", label: "Comercial", unit: "Unidade: oportunidade", ico: "target", keys: [...BASE, "modality", "cmp", "cmpf"] },
    { id: "operacoes", label: "Operações e Crédito", unit: "Unidade: operação · vínculo com banco", ico: "layers", keys: [...BASE, "modality", "bank", "cmp", "cmpf"] },
    { id: "documentacao", label: "Documentação", unit: "Unidade: requisito por operação", ico: "doc", keys: [...BASE, "bank", "cmp", "cmpf"] },
    { id: "faturamento", label: "Faturamento", unit: "Unidade: operação encerrada · máquina", ico: "coins", keys: [...BASE, "modality", "bank", "cmp", "cmpf"] }
  ];
  const tabOf = path => TABS.find(t => path.endsWith("/" + t.id)) || TABS[0];
  const BS = A.BS_COLORS, MODC = A.MOD_COLORS, CATC = A.CAT_COLORS;
  const LCOL = { CREDIT: "var(--jv-warn)", PRICE: "var(--jv-indigo)", COMPETITOR: "var(--jv-violet)", DELIVERY: "var(--jv-teal)", GAVE_UP: "var(--jv-fg-3)" };
  const BANKC = Object.fromEntries(D.BANKS.map((b, i) => [b.id, b.active ? X4.CAT[i % 6] : "var(--jv-fg-3)"]));
  const DS = [["VALIDATED", "Validado", "var(--jv-good)"], ["RECEIVED", "Enviado · a validar", "var(--jv-indigo)"], ["MISSING", "Pendente", "var(--jv-warn)"], ["REJECTED", "Rejeitado", "var(--jv-crit)"]];

  // ---------- utilitários ----------
  const seg = (key, cur, opts, aria) => `<div class="jv-seg jv-seg--xs" role="group" aria-label="${esc(aria)}">${opts.map(([v, l], i) => `<button type="button" data-q="${key}" data-v="${i === 0 ? "" : v}" aria-pressed="${cur === v}">${l}</button>`).join("")}</div>`;
  const pick = (q, key, ids) => ids.includes(q[key]) ? q[key] : ids[0];
  const pts = b => b.map(x => ({ id: x.id, label: x.label, long: x.from === x.to ? C.dmy(x.from) : C.dmy(x.from) + " a " + C.dmy(x.to), v: x.v, items: x.items }));
  const note = (t, ic = "info") => `<p class="note4">${icon(ic)}<span>${t}</span></p>`;
  const granTxt = g => g === "day" ? "um dia" : g === "week" ? "uma semana" : "um mês";
  const empty = (t, s) => C.state("empty", t, s || "Ajuste o período ou os filtros.");
  const scope = f => IRF.scope(D.operations, f);
  const P = (q, o) => IRF.P({ mq: q, ...o });
  const money = v => F.brlc(v);
  // Série no tempo com período comparado tracejado.
  function tsCmp(ctx, listFn, dateFn, val, o) {
    const b = IRF.series(listFn(ctx.q, ctx.r), dateFn, ctx.r, val, o.gran);
    const sets = [{ label: o.curLabel || "Período atual", color: o.color || "var(--jv-arc)", pts: pts(b) }];
    if (ctx.cq) sets.push({ label: "Comparado", dash: true, color: "var(--jv-fg-2)", pts: pts(IRF.series(listFn(ctx.cq, ctx.cr), dateFn, ctx.cr, val, b.gran)) });
    return X4.ts(sets, { mode: o.mode, f: o.f, h: o.h || 200, label: o.label, drill: p => SET(o.key + "-" + p.id, { title: o.title + " · " + p.long, unit: o.unit, kind: o.kind, rows: p.items || [], money: o.money }) }) +
      note(`Uma faixa = ${granTxt(b.gran)}. ${ctx.cq ? "Tracejado: período comparado, alinhado pelo início." : "Ligue o comparativo para sobrepor outro período."}`);
  }
  const seller = id => L.seller[id] ? L.seller[id].label : id;
  const ini = A.initials;

  // ---------- cabeçalho, abas e filtro geral ----------
  function head(q, path) {
    const t = tabOf(path); const f = IRF.eff(q, null), r = IRF.range(f), mq = IRF.mq(f, r);
    const cm = M.commercialMetrics(A.opps(mq)), act = A.activeOps(mq).length, d = A.docs(mq), cl = A.closedOps(mq, r);
    const mini = { comercial: [F.brlc(cm.pipeline), "pipeline aberto"], operacoes: [F.int(act), "operações em andamento"], documentacao: [F.pct(d.applicable ? d.validated / d.applicable : null), "requisitos validados"], faturamento: [F.brlc(sum(cl, o => o.equipmentValue)), "faturado"] };
    return `<div class="hero hero--slim"><div class="hero__row"><div><p class="jv-eyebrow">Análise · BI</p><h1 class="jv-h1 jv-h1--xl">Por que os resultados mudaram<span class="caret" aria-hidden="true"></span></h1>
      <p class="jv-lead">Quatro visões, cada uma com a sua unidade. Filtro geral no topo; cada painel pode ter o seu. Todo número, faixa, bloco ou ponto abre os registros que o compõem.</p></div>
      <div class="page-head__actions"><span class="jv-pill jv-pill--good"><span class="dot"></span>Dados de ${F.dt(S.lastUpdate.toISOString())}</span><button type="button" class="ds-button ds-button--sm" data-act="refresh">${icon("refresh")}Atualizar</button></div></div></div>
      <nav class="bi-tabs" aria-label="Visões do BI">${TABS.map(x => `<a class="bi-tab" href="${V.href("/bi/" + x.id, V.carry(q))}" ${x.id === t.id ? 'aria-current="page"' : ""}><span class="bi-tab__ico">${icon(x.ico)}</span><span class="bi-tab__t"><b>${x.label}</b><small>${x.unit}</small></span><span class="bi-tab__m"><b>${mini[x.id][0]}</b><small>${mini[x.id][1]}</small></span></a>`).join("")}</nav>`;
  }
  const recorte = (q, path) => IRF.master(q, tabOf(path).keys);
  const strip = (q, id, defs, title) => IRF.kpiStrip("bi-" + id, q, A.CATALOG[id], defs, { title });
  const unitbar = (ic, b, t) => `<div class="unitbar">${icon(ic)}<b>${b}</b><span>${t}</span></div>`;
  const sec = h => `<section class="section">${h}</section>`;
  const two = (a, b, cls = "g2") => `<div class="grid ${cls} section">${a}${b}</div>`;

  // =====================================================================
  // COMERCIAL
  // =====================================================================
  function comercial(q) {
    return `${unitbar("target", "Unidade desta visão: oportunidade comercial.", `Operações sem oportunidade vinculada não entram aqui. ${unitTag("pipeline", "R$ pipeline")} e ${unitTag("won", "R$ venda ganha")} nunca se misturam. Pipeline aberto é fotografia de hoje e não tem histórico para comparar.`)}
      ${strip(q, "comercial", ["c_pipe", "c_open", "c_won", "c_lost", "c_conv", "c_age"], "Indicadores · Comercial")}
      ${sec(cFlow(q))}${sec(cStage(q))}
      ${two(cCreated(q), cHeat(q), "split-7-5")}
      ${two(cClosed(q), cLoss(q))}
      ${two(cWhere(q), cSellers(q), "split-7-5")}
      ${two(cAge(q), cWhy(q))}
      ${sec(cDetail(q))}`;
  }
  const opOf = o => o.operation ? D.operations.find(x => x.id === o.operation) : null;
  function cFlow(q) {
    return P(q, { id: "c-flow", title: "Do pipeline à operação", q: "Para onde foram as oportunidades criadas no período?", unit: "oportunidade", basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_OUTCOME", hud: true,
      views: [["arvore", "Árvore", "tree"], ["destino", "Destino por vendedor", "hbars"]],
      cmpSummary: ctx => { const a = M.commercialMetrics(A.opps(ctx.q)), b = M.commercialMetrics(A.opps(ctx.cq)); return [{ label: "Criadas", cur: a.population, prev: b.population, fmt: F.int }, { label: "Ganhas", cur: a.wonCount, prev: b.wonCount, fmt: F.int }]; },
      body: ctx => {
        const list = A.opps(ctx.q), cm = M.commercialMetrics(list);
        if (!list.length) return empty("Nenhuma oportunidade criada no período");
        const s = (k, title, rows) => SET("cf-" + k, { title, unit: "oportunidade", kind: "opp", rows });
        if (ctx.view === "destino") {
          const parts = [{ id: "nop", label: "Aberta sem operação", color: "var(--jv-arc)" }, { id: "act", label: "Aberta com operação", color: "var(--jv-stage-review)" }, { id: "won", label: "Ganha · encerrada", color: "var(--jv-good)" }, { id: "lost", label: "Perdida", color: "var(--jv-brand)" }];
          const cls = o => o.status === "WON" ? "won" : o.status === "LOST" ? "lost" : o.operation ? "act" : "nop";
          const rows = D.SELLERS.map(se => { const l = list.filter(o => o.seller === se.id); return { id: se.id, label: se.label, sub: `${l.length} criadas`, segs: Object.fromEntries(parts.map(p => [p.id, l.filter(o => cls(o) === p.id).length])), l }; }).filter(r => r.l.length);
          return X4.stackRows(rows, parts, { pct: true, segAttr: (r, p) => s(`${r.id}-${p.id}`, `${r.label} · ${p.label}`, r.l.filter(o => cls(o) === p.id)) }) + note("Cada linha soma 100% das oportunidades que o vendedor criou no período. Mostra para onde elas foram.");
        }
        const withOp = cm.open.filter(o => o.operation), noOp = cm.open.filter(o => !o.operation);
        const reasons = D.LOSS_REASONS.map(r => ({ label: r.label, v: cm.lost.filter(o => o.lossReason === r.id).length, color: LCOL[r.id], attrs: s("lr-" + r.id, "Perdidas · " + r.label, cm.lost.filter(o => o.lossReason === r.id)) }));
        const root = { label: "Criadas no período", v: list.length, color: "var(--jv-arc)", attrs: s("all", "Oportunidades criadas", list), children: [
          { label: "Abertas", v: cm.openCount, color: "var(--jv-arc)", attrs: s("open", "Abertas", cm.open), children: [{ label: "Sem operação ainda", v: noOp.length, color: "var(--jv-fg-3)", attrs: s("noop", "Abertas sem operação", noOp) }, { label: "Operação em andamento", v: withOp.length, color: "var(--jv-stage-review)", attrs: s("withop", "Abertas com operação", withOp) }] },
          { label: "Ganhas", v: cm.wonCount, color: "var(--jv-good)", attrs: s("won", "Ganhas", cm.won), children: [{ label: "Operação encerrada", v: cm.wonCount, color: "var(--jv-good)", attrs: s("won2", "Ganhas · operação encerrada", cm.won) }] },
          { label: "Perdidas", v: cm.lostCount, color: "var(--jv-brand)", attrs: s("lost", "Perdidas", cm.lost), children: reasons }] };
        return X4.tree(root, { f: "int", colW: 220, gapX: 80, heads: ["Entrada", "Resultado comercial", "Destino"], label: "Para onde foram as oportunidades criadas" }) + note("Largura das linhas = quantidade. Barra dentro do bloco = participação no bloco de origem. Clique em qualquer bloco para ver as oportunidades.");
      },
      foot: "Ganha não é faturado: faturado é a operação que entrou em Encerrada (aba Faturamento)." });
  }
  function funnelOf(open, m) {
    return D.STAGES.map((s, i) => { const l = open.filter(o => D.STAGES.findIndex(x => x.id === o.stage) >= i), here = open.filter(o => o.stage === s.id); const v = m === "amount" ? sum(l, o => o.amount) : l.length;
      return { label: s.label, full: s.label + " ou adiante", v, text: m === "amount" ? F.brlc(v) : F.int(v), sub: `${F.int(here.length)} nesta etapa`, color: `color-mix(in oklab, var(--jv-arc) ${100 - i * 11}%, var(--jv-violet))`, attrs: SET(`cs-fn-${s.id}`, { title: "Abertas em " + s.label + " ou adiante", unit: "oportunidade", kind: "opp", rows: l, money: ["pipeline", o => o.amount] }) }; });
  }
  function cStage(q) {
    const pid = "c-stage", m = pick(q, pid + ".m.v", ["count", "amount"]);
    return P(q, { id: pid, title: "Pipeline por etapa", q: "Em que etapa está o pipeline aberto e onde ele estreita?", unit: m === "amount" ? unitTag("pipeline", "R$ pipeline") : "oportunidade aberta", basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_OPEN_PIPELINE",
      views: [["fluxo", "Fluxo", "area"], ["funil", "Funil clássico", "funnel"]],
      tools: () => seg(pid + ".m.v", m, [["count", "Qtd"], ["amount", "R$"]], "Medida"),
      body: ctx => {
        const cm = M.commercialMetrics(A.opps(ctx.q)); if (!cm.openCount) return empty("Sem oportunidades abertas");
        if (ctx.view === "funil") return X4.funnel(funnelOf(cm.open, m), { f: m === "amount" ? "brlc" : "int", label: "Funil do pipeline aberto" }) + note("Cada faixa soma as abertas que já chegaram pelo menos até aquela etapa, por isso só diminui. A porcentagem compara com a faixa de cima.");
        const st = D.STAGES.map(s => { const l = cm.open.filter(o => o.stage === s.id), amt = sum(l, o => o.amount); return { label: s.label.replace("Acompanhamento", "Acompanh.").replace("Análise de crédito", "Crédito"), full: s.label, v: m === "amount" ? amt : l.length, text: m === "amount" ? F.brlc(amt) : F.int(l.length), sub: m === "amount" ? plural(l.length, "aberta", "abertas") : F.brlc(amt), attrs: SET("cs-" + s.id, { title: "Abertas em " + s.label, unit: "oportunidade", kind: "opp", rows: l, money: ["pipeline", o => o.amount] }) }; });
        return X4.stream(st, { f: m === "amount" ? "brlc" : "int", label: "Pipeline aberto por etapa" }) + note("Largura da faixa = volume na etapa. Entre etapas: quanto a próxima é maior (▲) ou menor (▼) que a anterior.");
      } });
  }
  function cCreated(q) {
    const pid = "c-created", m = pick(q, pid + ".m.v", ["count", "amount"]);
    return P(q, { id: pid, title: "Novas oportunidades", q: "O volume de entrada está crescendo?", unit: m === "amount" ? unitTag("pipeline", "R$ criado") : "oportunidade criada", basis: "data de criação", source: "canonical", sourceId: "BI_COMMERCIAL_CREATED",
      views: [["area", "Área", "area"], ["cols", "Colunas", "bars"], ["cum", "Acumulado", "cum"]],
      tools: () => seg(pid + ".m.v", m, [["count", "Qtd"], ["amount", "R$"]], "Medida"),
      cmpSummary: ctx => { const a = A.opps(ctx.q), b = A.opps(ctx.cq); return m === "amount" ? { label: "Criado", cur: sum(a, o => o.amount), prev: sum(b, o => o.amount), fmt: F.brlc } : { label: "Criadas", cur: a.length, prev: b.length, fmt: F.int }; },
      body: ctx => tsCmp(ctx, q2 => A.opps(q2), o => o.createdAt, m === "amount" ? (o => o.amount) : (() => 1), { mode: ctx.view, f: m === "amount" ? "brlc" : "int", label: "Oportunidades criadas", key: "cc", title: "Criadas", unit: "oportunidade", kind: "opp" }) });
  }
  function cHeat(q) {
    const pid = "c-heat";
    return P(q, { id: pid, title: "Ritmo de entrada", q: "Em que dias as oportunidades chegam?", unit: "oportunidade criada por dia", basis: "data de criação", source: "canonical", sourceId: "BI_COMMERCIAL_CREATED",
      views: [["cal", "Calendário", "grid"], ["sem", "Dia da semana", "hbars"]],
      cmpSummary: ctx => { const a = A.opps(ctx.q), b = A.opps(ctx.cq); return { label: "Média por dia", cur: a.length / ctx.r.days, prev: b.length / ctx.cr.days, fmt: F.dec1 }; },
      body: ctx => {
        const list = A.opps(ctx.q); if (!list.length) return empty("Nenhuma oportunidade no período");
        if (ctx.view === "sem") {
          const DW = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]; const dw = o => (new Date(C.localDate(o.createdAt) + "T12:00:00Z").getUTCDay() + 6) % 7;
          const prev = ctx.cq ? A.opps(ctx.cq) : null;
          return X4.hb(DW.map((l, i) => { const x = list.filter(o => dw(o) === i); return { label: l, v: x.length, sub: F.brlc(sum(x, o => o.amount)), prev: prev ? prev.filter(o => dw(o) === i).length : null, color: i >= 5 ? "var(--jv-violet)" : "var(--jv-arc)", attrs: SET("ch-dw-" + i, { title: "Criadas às " + l.toLowerCase() + "s", unit: "oportunidade", kind: "opp", rows: x }) }; }), { dense: true, cmpLegend: !!prev });
        }
        const counts = {}; list.forEach(o => { const k = C.localDate(o.createdAt); counts[k] = (counts[k] || 0) + 1; });
        const from = ctx.r.days > 371 ? C.localDate(new Date(Date.parse(ctx.r.to + "T12:00:00Z") - 370 * 864e5).toISOString()) : ctx.r.from;
        return X4.heatCal(counts, { from, to: ctx.r.to, unit: "oportunidades", label: "Oportunidades criadas por dia", attrs: d => SET("ch-" + d, { title: "Criadas em " + C.dmy(d), unit: "oportunidade", kind: "opp", rows: list.filter(o => C.localDate(o.createdAt) === d) }) })
          + (ctx.r.days > 371 ? note("O calendário mostra as últimas 53 semanas da janela.") : "");
      } });
  }
  function cClosed(q) {
    const pid = "c-closed";
    return P(q, { id: pid, title: "Ganhos e perdas", q: "Quando os negócios foram decididos e qual o saldo?", unit: "oportunidade encerrada", basis: "data de encerramento (ganho ou perda)", source: "proposal", sourceId: "BI-DEP-03",
      views: [["duelo", "Duelo", "hbars"], ["taxa", "Taxa de ganho", "line"], ["valor", "Valor", "area"]],
      cmpSummary: ctx => { const a = M.oppsClosed(ctx.q), b = M.oppsClosed(ctx.cq); const r = l => { const w = l.filter(o => o.status === "WON").length; return l.length ? w / l.length : null; }; return [{ label: "Taxa de ganho", cur: r(a), prev: r(b), fmt: F.pct }, { label: "Encerradas", cur: a.length, prev: b.length, fmt: F.int }]; },
      body: ctx => {
        const list = M.oppsClosed(ctx.q); if (!list.length) return empty("Nenhuma oportunidade encerrada no período");
        const b = IRF.buckets(ctx.r, ctx.r.days > 62 ? "month" : "week"), pb = ctx.cr ? IRF.buckets(ctx.cr, b.gran) : null, plist = ctx.cq ? M.oppsClosed(ctx.cq) : [];
        const inB = (o, x) => { const d = C.localDate(o.closedAt); return d >= x.from && d <= x.to; };
        const g = b.map((x, i) => { const w = list.filter(o => o.status === "WON" && inB(o, x)), l = list.filter(o => o.status === "LOST" && inB(o, x)); const px = pb && pb[i]; return { id: x.id, label: x.label, long: C.dmy(x.from) + " a " + C.dmy(x.to), won: w.length, lost: l.length, wv: sum(w, o => o.amount), lv: sum(l, o => o.amount), pwon: px ? plist.filter(o => o.status === "WON" && inB(o, px)).length : null, plost: px ? plist.filter(o => o.status === "LOST" && inB(o, px)).length : null, wonAttrs: SET("cw-" + x.id, { title: "Ganhas · " + x.label, unit: "oportunidade", kind: "opp", rows: w, money: ["won", o => o.amount] }), lostAttrs: SET("cl-" + x.id, { title: "Perdidas · " + x.label, unit: "oportunidade", kind: "opp", rows: l }) }; });
        const W = list.filter(o => o.status === "WON"), L = list.filter(o => o.status === "LOST");
        const kp = `<div class="eqk"><div style="--c:var(--jv-arc)"><span>Ganhas</span><b>${F.int(W.length)}</b><small>${F.brlc(sum(W, o => o.amount))}</small></div><div style="--c:var(--jv-brand)"><span>Perdidas</span><b>${F.int(L.length)}</b><small>${F.brlc(sum(L, o => o.amount))}</small></div><div style="--c:var(--jv-violet)"><span>Taxa de ganho</span><b>${F.pct(W.length / Math.max(1, list.length))}</b><small>${F.int(list.length)} encerradas</small></div><div style="--c:var(--jv-good)"><span>Saldo</span><b>${(W.length - L.length >= 0 ? "+" : "") + F.int(W.length - L.length)}</b><small>ganhas − perdidas</small></div></div>`;
        if (ctx.view === "taxa") return kp + (() => { const sets = [{ label: "Taxa de ganho", color: "var(--jv-arc)", pts: g.map(x => ({ id: x.id, label: x.label, long: x.long, v: x.won + x.lost ? x.won / (x.won + x.lost) * 100 : 0 })) }]; if (pb) sets.push({ label: "Comparado", dash: true, color: "var(--jv-fg-2)", pts: g.map((x, i) => ({ id: pb[i] ? pb[i].id : x.id, label: x.label, v: x.pwon + x.plost ? x.pwon / (x.pwon + x.plost) * 100 : 0 })) }); return X4.ts(sets, { mode: "line", f: v => F.int(v) + "%", yMax: 100, h: 200, label: "Taxa de ganho" }) + note("Taxa de ganho = ganhas ÷ (ganhas + perdidas) encerradas em cada faixa."); })();
        if (ctx.view === "valor") return kp + X4.ts([{ label: "R$ ganho", color: "var(--jv-arc)", pts: g.map(x => ({ id: x.id, label: x.label, long: x.long, v: x.wv })) }, { label: "R$ perdido", color: "var(--jv-brand)", pts: g.map(x => ({ id: x.id, label: x.label, long: x.long, v: x.lv })) }], { mode: "line", f: "brlc", h: 200, label: "Valor ganho e perdido" }) + note("Mesma escala para as duas linhas. Valor da oportunidade no encerramento.");
        return kp + X4.duel(g, { cmp: !!pb, label: "Ganhos e perdas" });
      },
      foot: "Proposta: a base atual só filtra por criação. Esta série usa a data de ganho ou perda (BI-DEP-03)." });
  }
  function cLoss(q) {
    const pid = "c-loss";
    return P(q, { id: pid, title: "Motivos das perdas", q: "Por que perdemos?", unit: "oportunidade perdida", basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_LOSS",
      views: [["anel", "Anel", "pie"], ["barras", "Barras", "hbars"]],
      cmpSummary: ctx => { const a = M.commercialMetrics(A.opps(ctx.q)).lost, b = M.commercialMetrics(A.opps(ctx.cq)).lost; return [{ label: "Perdidas", cur: a.length, prev: b.length, fmt: F.int, invert: true }, { label: "Por crédito", cur: a.filter(o => o.lossReason === "CREDIT").length, prev: b.filter(o => o.lossReason === "CREDIT").length, fmt: F.int, invert: true }]; },
      body: ctx => {
        const lost = M.commercialMetrics(A.opps(ctx.q)).lost; if (!lost.length) return empty("Nenhuma perda no recorte");
        const plost = ctx.cq ? M.commercialMetrics(A.opps(ctx.cq)).lost : null;
        const it = D.LOSS_REASONS.map(r => { const l = lost.filter(o => o.lossReason === r.id); return { label: r.label, v: l.length, prev: plost ? plost.filter(o => o.lossReason === r.id).length : null, color: LCOL[r.id], sub: F.brlc(sum(l, o => o.amount)), note: r.id === "CREDIT" ? "perda comercial" : "", attrs: SET("lo-" + r.id, { title: "Perdidas · " + r.label, unit: "oportunidade", kind: "opp", rows: l, def: r.id === "CREDIT" ? "Perda comercial registrada no encerramento da oportunidade. Não é operação reprovada nem decisão de banco." : "" }) }; }).sort((a, b) => b.v - a.v);
        const body = ctx.view === "barras" ? X4.hb(it, { cmpLegend: !!plost }) : X4.ring(it, { center: "perdidas", label: "Motivos das perdas" });
        return body + note(`"Crédito / restrição" aqui é <b>perda comercial</b> (unidade: oportunidade). Reprovação da operação e reprovação por banco ficam em <a href="${V.href("/bi/operacoes", V.carry(q))}">Operações e Crédito</a>.`);
      } });
  }
  function cWhere(q) {
    const pid = "c-where";
    return P(q, { id: pid, title: "Onde está o pipeline", q: "Quais vendedores e modalidades concentram o valor aberto?", unit: unitTag("pipeline", "R$ pipeline"), basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_OPEN_PIPELINE",
      views: [["matriz", "Matriz", "grid"], ["comp", "Composição", "hbars"]],
      body: ctx => {
        const open = M.commercialMetrics(A.opps(ctx.q)).open; if (!open.length) return empty("Sem pipeline aberto");
        const rows = D.SELLERS.filter(s => open.some(o => o.seller === s.id)).map(s => ({ id: s.id, label: s.label }));
        const cell = (r, c) => { const l = open.filter(o => o.seller === r.id && o.modality === c.id); const v = sum(l, o => o.amount); return { v, text: v ? F.brlc(v).replace("R$ ", "") : "", tip: `${F.brlc(v)} · ${plural(l.length, "aberta", "abertas")}`, attrs: SET(`cw-${r.id}-${c.id}`, { title: `${r.label} · ${L.modality[c.id].label}`, unit: "oportunidade", kind: "opp", rows: l, money: ["pipeline", o => o.amount] }) }; };
        if (ctx.view === "comp") return X4.stackRows(rows.map(r => ({ label: r.label, segs: Object.fromEntries(D.MODALITIES.map(m => [m.id, sum(open.filter(o => o.seller === r.id && o.modality === m.id), o => o.amount)])), id: r.id })).sort((a, b) => sum(Object.values(b.segs), x => x) - sum(Object.values(a.segs), x => x)), D.MODALITIES.map(m => ({ id: m.id, label: m.label, color: MODC[m.id] })), { f: "brlc", segAttr: (r, p) => SET(`cw-${r.id}-${p.id}`, { title: `${r.label} · ${p.label}`, unit: "oportunidade", kind: "opp", rows: open.filter(o => o.seller === r.id && o.modality === p.id), money: ["pipeline", o => o.amount] }) });
        return X4.grid(rows, D.MODALITIES.map(m => ({ id: m.id, label: m.label, short: m.label.split(" ")[0] })), cell, { corner: "Vendedor · R$", total: r => F.brlc(sum(open.filter(o => o.seller === r.id), o => o.amount)), label: "Pipeline por vendedor e modalidade" });
      } });
  }
  function cSellers(q) {
    const pid = "c-sellers", m = pick(q, pid + ".m.v", ["pipe", "units", "conv"]);
    return P(q, { id: pid, title: "Vendedores", q: "Quem carrega o pipeline, quantas máquinas e quem converte?", unit: { pipe: unitTag("pipeline", "R$ pipeline"), units: "equipamento (unidade)", conv: "% conversão" }[m], basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_BY_SELLER",
      views: [["rank", "Ranking", "hbars"], ["bolhas", "Bolhas", "scatter"]],
      tools: () => seg(pid + ".m.v", m, [["pipe", "R$"], ["units", "Máquinas"], ["conv", "Conversão"]], "Medida"),
      body: ctx => {
        const list = A.opps(ctx.q), plist = ctx.cq ? A.opps(ctx.cq) : null;
        const calc = (l, id) => { const x = l.filter(o => o.seller === id), op = x.filter(o => o.status === "OPEN"), w = x.filter(o => o.status === "WON").length, lo = x.filter(o => o.status === "LOST").length; return { x, op, pipe: sum(op, o => o.amount), units: sum(op, o => o.units) + sum(x.filter(o => o.status === "WON"), o => o.units), uo: sum(op, o => o.units), uw: sum(x.filter(o => o.status === "WON"), o => o.units), conv: w + lo ? w / (w + lo) : null, w, lo }; };
        const rows = D.SELLERS.map(s => ({ s, c: calc(list, s.id), p: plist ? calc(plist, s.id) : null })).filter(r => r.c.x.length);
        if (!rows.length) return empty("Sem vendedores no recorte");
        const attrs = r => SET("sl-" + r.s.id, { title: "Oportunidades · " + r.s.label, unit: "oportunidade", kind: "opp", rows: r.c.x });
        if (ctx.view === "bolhas") {
          const maxU = Math.max(1, ...rows.map(r => r.c.units));
          return X4.scatter(rows.filter(r => r.c.conv != null).map(r => ({ x: r.c.pipe, y: r.c.conv * 100, r: 8 + r.c.units / maxU * 16, color: A.SELLER_COLOR[r.s.id], label: r.s.label.split(" ")[0], tipT: r.s.label, tip: `${F.brlc(r.c.pipe)} pipeline · ${F.pct(r.c.conv)} conversão · ${r.c.units} máquinas`, attrs: attrs(r) })), { fx: "brlc", fy: v => F.int(v) + "%", xLabel: "R$ pipeline aberto →", yLabel: "conversão", labels: true, h: 280, label: "Pipeline × conversão por vendedor" }) + note("Eixo horizontal: R$ pipeline. Vertical: conversão. Tamanho da bolha: máquinas em oportunidades abertas e ganhas.");
        }
        if (m === "pipe") return FX.leaders(rows.map(r => ({ id: "sl-" + r.s.id, label: r.s.label, sub: `${L.branch[r.s.branch].label} · ${r.c.op.length} abertas`, pipe: r.c.pipe, conv: r.c.conv })).sort((a, b) => b.pipe - a.pipe), { drill: "set" }).replace(/data-dv="sl-(s-\d+)"/g, (_, id) => { attrs(rows.find(r => r.s.id === id)); return `data-dv="sl-${id}"`; }) + note(`Anel: conversão (ganhas ÷ concluídas). Barra: ${unitTag("pipeline", "R$ pipeline")} aberto.`);
        const v = r => m === "units" ? r.c.units : (r.c.conv == null ? 0 : r.c.conv * 100), pv = r => !r.p ? null : m === "units" ? r.p.units : (r.p.conv == null ? 0 : r.p.conv * 100);
        return X4.hb(rows.map(r => ({ label: r.s.label, sub: m === "units" ? `${r.c.uo} em abertas · ${r.c.uw} ganhas` : `${r.c.w} ganhas · ${r.c.lo} perdidas`, v: v(r), prev: pv(r), text: m === "units" ? F.int(v(r)) + " un." : F.pct(r.c.conv), avatar: ini(r.s.label), color: A.SELLER_COLOR[r.s.id], attrs: attrs(r) })).sort((a, b) => b.v - a.v), { rank: true, max: m === "conv" ? 100 : undefined, cmpLegend: !!plist });
      } });
  }
  function cAge(q) {
    const pid = "c-age";
    return P(q, { id: pid, title: "Idade do pipeline aberto", q: "O pipeline está envelhecendo?", unit: "oportunidade aberta", basis: "dias desde a criação", source: "proposal", sourceId: "BI-P-04",
      views: [["faixas", "Faixas", "hbars"], ["disp", "Dispersão por etapa", "scatter"]],
      body: ctx => {
        const open = M.commercialMetrics(A.opps(ctx.q)).open; if (!open.length) return empty("Sem oportunidades abertas");
        const age = o => (D.NOW - new Date(o.createdAt)) / 864e5;
        if (ctx.view === "disp") { const st = D.STAGES.filter(s => open.some(o => o.stage === s.id)); return X4.scatter(open.map(o => ({ x: age(o), row: o.stage, r: 6 + Math.sqrt(o.amount / 1e5) * 2.2, color: age(o) > 60 ? "var(--jv-warn)" : "var(--jv-arc)", tipT: o.id + " · " + o.client, tip: `${F.int(age(o))} dias · ${F.brlc(o.amount)} · ${L.stage[o.stage].label}`, attrs: SET("ca-" + o.id, { title: o.id, unit: "oportunidade", kind: "opp", rows: [o] }) })), { rows: st.map(s => s.id), rowLabel: id => L.stage[id].label, fx: v => F.int(v) + " d", xmin: 0, vline: 60, vlineLabel: "60 dias", xLabel: "dias desde a criação →", label: "Idade das abertas por etapa" }) + note("Cada ponto é uma oportunidade aberta. Tamanho: valor. Laranja: mais de 60 dias."); }
        const B = [["0-15", 0, 15], ["16-30", 16, 30], ["31-60", 31, 60], ["61+", 61, 1e9]];
        return X4.hb(B.map(([id, a, b]) => { const l = open.filter(o => age(o) >= a && age(o) < b + 1); return { label: id === "61+" ? "Mais de 60 dias" : `${a} a ${b} dias`, v: l.length, sub: F.brlc(sum(l, o => o.amount)), color: id === "61+" ? "var(--jv-warn)" : id === "31-60" ? "var(--jv-indigo)" : "var(--jv-arc)", attrs: SET("ca-b-" + id, { title: "Abertas · " + id + " dias", unit: "oportunidade", kind: "opp", rows: l, money: ["pipeline", o => o.amount] }) }; }));
      },
      foot: "Proposta: faixas de idade derivadas da mesma fonte; exige aprovação da métrica." });
  }
  function cWhy(q) {
    const pid = "c-why", dim = pick(q, pid + ".d.v", ["modality", "seller", "branch"]);
    return P(q, { id: pid, title: "O que mudou neste recorte", q: "Qual dimensão mais explica a diferença?", unit: unitTag("pipeline", "R$ em oportunidades criadas"), basis: "criação da oportunidade", source: "proposal", sourceId: "BI-P-05",
      views: [["div", "Barras", "hbars"], ["cascata", "Cascata", "bars"]],
      tools: () => seg(pid + ".d.v", dim, [["modality", "Modalidade"], ["seller", "Vendedor"], ["branch", "Filial"]], "Dimensão"),
      body: ctx => {
        const cr = ctx.cr || IRF.cmpRange({ ...ctx.f, cmp: "1" }); if (!cr) return empty("Sem período para comparar", "Com o período completo não há outro período para comparar.");
        const cur = A.opps(ctx.q), prev = A.opps(IRF.mq(ctx.f, cr));
        const opts = { modality: D.MODALITIES, seller: D.SELLERS, branch: D.BRANCHES }[dim];
        const c = opts.map(o => { const a = cur.filter(x => x[dim] === o.id), b = prev.filter(x => x[dim] === o.id); return { id: o.id, label: o.label, v: sum(a, x => x.amount) - sum(b, x => x.amount), a, b }; }).sort((x, y) => Math.abs(y.v) - Math.abs(x.v));
        const tc = sum(cur, x => x.amount), tp = sum(prev, x => x.amount);
        const head = `<div class="ratio"><b style="color:${tc >= tp ? "var(--jv-good)" : "var(--jv-brand)"}">${tc >= tp ? "▲" : "▼"} ${F.brlc(Math.abs(tc - tp))}</b><span>${F.brlc(tc)} agora vs ${F.brlc(tp)} em ${cr.label}${ctx.cr ? "" : " (período anterior, automático)"}</span></div>`;
        if (ctx.view === "cascata") return head + X4.waterfall([{ label: "Antes", v: tp, total: true }, ...c.map(x => ({ label: x.label.split(" ")[0], v: x.v, attrs: SET("cy-" + x.id, { title: x.label + " · criadas agora", unit: "oportunidade", kind: "opp", rows: x.a }) })), { label: "Agora", v: tc, total: true }], { f: "brlc", label: "Do valor anterior ao atual" });
        return head + X4.hb(c.map(x => ({ label: x.label, v: x.v, text: (x.v >= 0 ? "+" : "−") + F.brlc(Math.abs(x.v)), sub: `${x.a.length} agora · ${x.b.length} antes`, color: x.v >= 0 ? "var(--jv-good)" : "var(--jv-brand)", attrs: SET("cy-" + x.id, { title: x.label + " · criadas agora", unit: "oportunidade", kind: "opp", rows: x.a }) })), { diverge: true });
      },
      foot: "Compara o valor das oportunidades criadas em cada janela (mesma base, sem fotografia do pipeline). Verde: ganho; vermelho: queda." });
  }
  function cDetail(q) {
    const pid = "c-detail", sort = q.sort === "amount" ? "amount" : "";
    return P(q, { id: pid, title: "Detalhamento das oportunidades", q: "Quais oportunidades compõem estes números?", unit: "oportunidade · 1 linha por oportunidade", basis: "criação da oportunidade", source: "canonical", sourceId: "BI_COMMERCIAL_LIST",
      views: [["tabela", "Tabela", "table"], ["cartoes", "Cartões", "cards"]],
      tools: () => `<label class="jv-field" style="flex-direction:row;align-items:center;gap:6px"><span>Ordenar</span><select class="jv-select" data-q="sort"><option value="">Mais recentes</option><option value="amount" ${sort === "amount" ? "selected" : ""}>Maior valor</option></select></label><button type="button" class="ds-button ds-button--sm" data-act="csv-detail">${icon("download")}CSV</button>`,
      body: ctx => {
        const list = A.opps(ctx.q); SET("c-detail-csv", { title: "Oportunidades", unit: "oportunidade", kind: "opp", rows: list });
        if (!list.length) return empty("Nenhuma oportunidade encontrada");
        const per = ctx.view === "cartoes" ? 12 : 10, page = Math.max(1, +(q.pg || 1)), sorted = [...list].sort((a, b) => sort === "amount" ? b.amount - a.amount : b.createdAt.localeCompare(a.createdAt)), rows = sorted.slice((page - 1) * per, page * per), pages = Math.max(1, Math.ceil(list.length / per)), maxAmt = Math.max(1, ...list.map(o => o.amount));
        const pager = `<div class="pager"><span>${F.int(list.length)} oportunidades no recorte · ${per} por página</span><span><button class="ds-button ds-button--sm" data-q="pg" data-v="${page - 1}" ${page <= 1 ? "disabled" : ""}>Anterior</button> Página ${Math.min(page, pages)} de ${pages} <button class="ds-button ds-button--sm" data-q="pg" data-v="${page + 1}" ${page >= pages ? "disabled" : ""}>Próxima</button></span></div>`;
        const stC = o => o.status === "WON" ? "var(--jv-good)" : o.status === "OPEN" ? "var(--jv-arc)" : "var(--jv-brand)";
        if (ctx.view === "cartoes") return `<div class="cards4">${rows.map(o => { const op = opOf(o); return `<article style="--c:${stC(o)}"><header><span><span class="code">${o.id}</span><span class="sub" style="display:block">${esc(o.client)}</span></span>${oppChip(o.status)}</header><span class="amt">${F.brlc(o.amount)}</span><span class="sub">${esc(seller(o.seller))} · ${esc(L.branch[o.branch].label)} · ${esc(L.stage[o.stage].label)}</span><span class="sub">${esc(o.equipment)} · criada ${F.date(o.createdAt)}</span>${op ? `<span>${lcChip(op.state)} <span class="code">${op.id}</span></span>` : `<span class="dim" style="font-size:11.5px">Sem operação vinculada</span>`}</article>`; }).join("")}</div>${pager}`;
        return `<div class="tbl-wrap"><table class="tbl tbl--cards tbl--pro"><thead><tr><th>Oportunidade · cliente</th><th>Vendedor · filial</th><th>Etapa · resultado</th><th>Equipamento</th><th class="r">Valor atual</th><th>Criação</th><th>Operação vinculada</th></tr></thead><tbody>
          ${rows.map(o => { const op = opOf(o); return `<tr><td data-l="Oportunidade"><span class="code">${o.id}</span><span class="sub">${esc(o.client)}</span></td><td data-l="Vendedor">${esc(seller(o.seller))}<span class="sub">${esc(L.branch[o.branch].label)}</span></td><td data-l="Etapa">${esc(L.stage[o.stage].label)}<span class="sub">${oppChip(o.status)}${o.lossReason ? " " + esc(L.loss[o.lossReason].label) : ""}</span></td><td data-l="Equipamento">${esc(o.equipment)}<span class="sub"><span class="moddot" style="--c:${MODC[o.modality]}"></span>${esc(L.modality[o.modality].label)}</span></td><td data-l="Valor" class="r">${F.brl(o.amount)}<span class="vbar"><i style="width:${(o.amount / maxAmt * 100).toFixed(0)}%;--c:${stC(o)}"></i></span></td><td data-l="Criação">${F.date(o.createdAt)}</td><td data-l="Operação">${op ? `<span class="code">${op.id}</span><span class="sub">${lcChip(op.state)}</span>` : '<span class="dim">Sem operação vinculada</span>'}</td></tr>`; }).join("")}
          </tbody></table></div>${pager}`;
      } });
  }

  // =====================================================================
  // OPERAÇÕES E CRÉDITO
  // =====================================================================
  function operacoes(q) {
    return `${unitbar("layers", "Unidade: operação, pelo estado do Lifecycle.", "No painel por instituição a unidade muda para <b>vínculo operação-banco</b>: uma operação pode ter vários. Perda comercial por crédito fica na aba Comercial.")}
      ${strip(q, "operacoes", ["o_act", "o_new", "o_closed", "o_rate", "o_rej", "o_bankrej"], "Indicadores · Operações e Crédito")}
      ${two(oStages(q), oTerm(q))}
      ${two(oRes(q), oDec(q))}
      ${sec(oRej(q))}
      ${sec(oInst(q))}`;
  }
  function oStages(q) {
    return P(q, { id: "o-stages", title: "Volume e etapas", q: "Onde estão as operações agora e com que valor de equipamento?", unit: "operação · " + unitTag("equipment", "R$ equipamento"), period: false, periodText: "Situação atual", source: "canonical", sourceId: "OPERATION_LIFECYCLE_STATE",
      views: [["radar", "Radar", "target"], ["barras", "Barras", "hbars"], ["matriz", "Matriz", "grid"]],
      body: ctx => {
        const now = A.opsNow(ctx.q), active = now.filter(o => M.ACTIVE.includes(o.state)); if (!now.length) return empty("Nenhuma operação no recorte");
        const bars = X4.hb(M.ACTIVE.concat(["closed", "cancelled", "credit_rejected"]).map(s => { const l = now.filter(o => o.state === s); return { label: L.lc[s].label, sub: F.brlc(sum(l, o => o.equipmentValue)), v: l.length, color: STAGE[s], attrs: SET("os-" + s, { title: L.lc[s].label + " · agora", unit: "operação", kind: "op", rows: l, money: ["equipment", o => o.equipmentValue] }) }; }), { dense: true });
        if (ctx.view === "matriz") return X3.matrix(active, { label: "Operações em andamento por etapa e horas na etapa" }).replace(/data-drill="ops_state" data-dv="(\w+)"/g, (_, s) => SET("os-" + s, { title: L.lc[s].label + " · agora", unit: "operação", kind: "op", rows: active.filter(o => o.state === s) }));
        if (ctx.view === "barras") return bars + note("Inclui os estados terminais acumulados (situação atual de todas as operações do recorte).");
        const chips = M.ACTIVE.map(s => { const l = active.filter(o => o.state === s); return `<button type="button" style="--c:${STAGE[s]}" ${SET("os-" + s, { title: L.lc[s].label + " · agora", unit: "operação", kind: "op", rows: l, money: ["equipment", o => o.equipmentValue] })}><span>${esc(L.lc[s].label)}</span><b>${F.int(l.length)}</b><small>${F.brlc(sum(l, o => o.equipmentValue))}</small></button>`; }).join("");
        return `<div class="ost4"><div class="cmd__viz" data-view="radar">${FX.radar(active, { k: "o-radar", center: "em andamento", size: 330 })}</div><div class="eqk orx__k ost4__k">${chips}</div></div>`;
      } });
  }
  function oTerm(q) {
    const term = ["closed", "cancelled", "credit_rejected"];
    const inT = (o, s, r) => o.state === s && IRF.inR(s === "closed" ? o.closedAt : o.stateEnteredAt, r);
    return P(q, { id: "o-term", title: "Estados terminais", q: "Quantas operações saíram do fluxo, e como?", unit: "operação", basis: "data da transição para o estado terminal", source: "lifecycle", sourceId: "LC-DEP-01",
      views: [["cartoes", "Cartões", "cards"], ["tempo", "No tempo", "line"]],
      cmpSummary: ctx => { const a = scope(ctx.f), r = ctx.r, cr = ctx.cr; return term.map(s => ({ label: L.lc[s].label, cur: a.filter(o => inT(o, s, r)).length, prev: a.filter(o => inT(o, s, cr)).length, fmt: F.int, invert: s !== "closed" })); },
      body: ctx => {
        const all = scope(ctx.f);
        if (ctx.view === "tempo") { const b0 = IRF.buckets(ctx.r); const sets = term.map(s => { const b = IRF.series(all.filter(o => o.state === s), o => s === "closed" ? o.closedAt : o.stateEnteredAt, ctx.r, () => 1, b0.gran); return { label: L.lc[s].label, color: STAGE[s], pts: pts(b) }; }); return X4.ts(sets, { mode: "line", h: 200, label: "Saídas do fluxo no tempo", drill: (p, i) => SET("ot-" + p.id, { title: "Saíram do fluxo · " + p.long, unit: "operação", kind: "op", rows: term.flatMap(s => all.filter(o => o.state === s && IRF.inR(s === "closed" ? o.closedAt : o.stateEnteredAt, { from: b0[i].from, to: b0[i].to }))) }) }) + note(`Uma faixa = ${granTxt(b0.gran)}. Encerrada é o faturado da aba Faturamento.`); }
        return `<div class="lc-terms" style="margin-top:0">${term.map(s => { const l = all.filter(o => inT(o, s, ctx.r)), pl = ctx.cr ? all.filter(o => inT(o, s, ctx.cr)) : null; return `<button type="button" class="lc" data-tone="${s}" ${SET("ot-" + s, { title: L.lc[s].label + " no período", unit: "operação", kind: "op", rows: l })}><span class="lc__step">${s === "closed" ? "Homologado" : s === "cancelled" ? "Homologado" : "Proposta LC-DEP-01"}</span><span class="lc__name"><span class="lc__ico">${icon(C.LC_ICON[s])}</span>${L.lc[s].label}</span><span class="lc__v" data-k="t-${s}" data-v="${l.length}" data-f="int">${F.int(l.length)}</span>${pl ? IRF.delta(l.length, pl.length, { invert: s !== "closed" }) : ""}<span>${lcChip(s)}</span></button>`; }).join("")}</div>
          <ul class="list" style="margin-top:8px;font-size:12px"><li><span class="lc__ico" style="color:var(--jv-good)">${icon("check")}</span><div class="list__main"><b>Encerrada</b>: concluída. É o faturado do sistema.</div></li><li><span style="color:var(--jv-x-stage-cancelled-hc)">${icon("ban")}</span><div class="list__main"><b>Cancelada</b>: cinza de alto contraste, ícone de bloqueio.</div></li><li><span style="color:var(--jv-crit)">${icon("shieldx")}</span><div class="list__main"><b>Reprovada por crédito</b>: nenhum caminho de crédito aprovou. Novo estado, depende do Lifecycle.</div></li></ul>`;
      } });
  }
  function oRes(q) {
    const BK = [["0-24", "até 24 h", 0, 24, "var(--jv-arc)"], ["24-48", "24 a 48 h", 24, 48, "var(--jv-indigo)"], ["48-72", "48 a 72 h", 48, 72, "var(--jv-violet)"], ["72+", "mais de 72 h", 72, 1e9, "var(--jv-warn)"]];
    return P(q, { id: "o-res", title: "Permanência por etapa", q: "Onde as operações demoram?", unit: "horas na etapa (passagem atual)", period: false, periodText: "Situação atual", basis: "entrada na etapa", source: "canonical", sourceId: "dashboard-residence",
      views: [["media", "Média", "hbars"], ["faixas", "Faixas de tempo", "bars"]],
      body: ctx => {
        const act = A.activeOps(ctx.q); if (!act.length) return empty("Nenhuma operação em andamento");
        if (ctx.view === "faixas") return X4.stackRows(M.ACTIVE.map(s => ({ id: s, label: L.lc[s].label, segs: Object.fromEntries(BK.map(b => [b[0], act.filter(o => o.state === s && o.residenceHours >= b[2] && o.residenceHours < b[3]).length])) })), BK.map(b => ({ id: b[0], label: b[1], color: b[4] })), { segAttr: (r, p) => { const b = BK.find(x => x[0] === p.id); return SET(`or-${r.id}-${p.id}`, { title: `${r.label} · ${b[1]}`, unit: "operação", kind: "op", rows: act.filter(o => o.state === r.id && o.residenceHours >= b[2] && o.residenceHours < b[3]) }); } });
        return X4.hb(M.ACTIVE.map(s => { const l = act.filter(o => o.state === s), h = avg(l, o => o.residenceHours); return { label: L.lc[s].label, v: h || 0, text: h == null ? "—" : F.int(h) + " h", sub: h == null ? "sem operações" : `${F.dec1(h / 9)} dias úteis · ${plural(l.length, "operação", "operações")}`, color: STAGE[s], attrs: SET("or-" + s, { title: L.lc[s].label + " · agora", unit: "operação", kind: "op", rows: l }) }; }));
      },
      foot: "Tempo factual de permanência. Não é apuração de SLA (DASH-INT-11)." });
  }
  function oDec(q) {
    return P(q, { id: "o-dec", title: "Decisões consolidadas", q: "Quantas decisões saíram e com que resultado?", unit: "operação decidida", basis: "data da decisão", source: "canonical", sourceId: "decisionDateView",
      views: [["colunas", "Colunas", "bars"], ["velas", "Velas", "candle"], ["taxa", "Taxa", "line"]],
      cmpSummary: ctx => { const a = A.decidedIn(ctx.q, ctx.r), b = A.decidedIn(ctx.cq, ctx.cr); const r = l => l.length ? l.filter(o => o.decision !== "REJECTED").length / l.length : null; return [{ label: "Aprovação", cur: r(a), prev: r(b), fmt: F.pct }, { label: "Decididas", cur: a.length, prev: b.length, fmt: F.int }]; },
      body: ctx => {
        const dec = A.decidedIn(ctx.q, ctx.r); if (!dec.length) return empty("Nenhuma decisão no período");
        const b = IRF.buckets(ctx.r, ctx.r.days > 62 ? "month" : "week"), pb = ctx.cr ? IRF.buckets(ctx.cr, b.gran) : null, pdec = ctx.cq ? A.decidedIn(ctx.cq, ctx.cr) : [];
        const inB = (o, x) => { const d = C.localDate(o.decidedAt); return d >= x.from && d <= x.to; };
        const g = b.map((x, i) => { const l = dec.filter(o => inB(o, x)), px = pb && pb[i] ? pdec.filter(o => inB(o, pb[i])) : null; return { x, l, full: l.filter(o => ["BANK_FULL", "INTERNAL_FULL"].includes(o.category)), part: l.filter(o => ["BANK_PARTIAL", "INTERNAL_PARTIAL"].includes(o.category)), rej: l.filter(o => o.decision === "REJECTED"), px }; });
        if (ctx.view === "velas") return X4.candles(g.map(y => ({ label: y.x.label, long: C.dmy(y.x.from) + " a " + C.dmy(y.x.to), up: y.full.length + y.part.length, down: y.rej.length, pup: y.px ? y.px.filter(o => o.decision !== "REJECTED").length : null, pdown: y.px ? y.px.filter(o => o.decision === "REJECTED").length : null, upAttrs: SET("od-u-" + y.x.id, { title: "Aprovadas · " + y.x.label, unit: "operação decidida", kind: "op", rows: y.full.concat(y.part) }), downAttrs: SET("od-d-" + y.x.id, { title: "Reprovadas · " + y.x.label, unit: "operação decidida", kind: "op", rows: y.rej }) })), { h: 190 });
        if (ctx.view === "taxa") { const sets = [{ label: "Aprovação", color: "var(--jv-arc)", pts: g.map(y => ({ id: y.x.id, label: y.x.label, v: y.l.length ? (y.full.length + y.part.length) / y.l.length * 100 : 0 })) }]; if (pb) sets.push({ label: "Comparado", dash: true, color: "var(--jv-fg-2)", pts: g.map(y => ({ id: y.x.id, label: y.x.label, v: y.px && y.px.length ? y.px.filter(o => o.decision !== "REJECTED").length / y.px.length * 100 : 0 })) }); return X4.ts(sets, { mode: "line", f: v => F.int(v) + "%", yMax: 100, h: 200, label: "Taxa de aprovação" }); }
        return C.cols(g.map(y => ({ id: y.x.id, label: y.x.label, v: { full: y.full.length, partial: y.part.length, rej: y.rej.length } })), [{ id: "full", label: "Aprovada integral", color: "var(--jv-arc)" }, { id: "partial", label: "Aprovada parcial", color: "var(--jv-teal)" }, { id: "rej", label: "Reprovada", color: "var(--jv-brand)" }], { k: "o-dec", drill: "odcol" }).replace(/data-drill="odcol" data-dv="([^"]+)"/g, (_, id) => SET("od-" + id, { title: "Decididas · " + (g.find(y => y.x.id === id) || { x: { label: id } }).x.label, unit: "operação decidida", kind: "op", rows: (g.find(y => y.x.id === id) || { l: [] }).l }));
      } });
  }
  // Reprovação: operação inteira × um banco. Mostra que um banco recusar não reprova a operação.
  function oRej(q) {
    return P(q, { id: "o-rej", title: "Reprovação: operação × banco", q: "Quando um banco reprova, a operação acaba? Quando a operação inteira é reprovada?", unit: "operação · vínculo operação-banco", period: false, periodText: "Situação atual dos vínculos", source: "canonical", sourceId: "outcomeFacts.banks", hud: true,
      views: [["mapa", "Mapa por operação", "grid"], ["destino", "O que aconteceu depois", "tree"]],
      body: ctx => {
        const now = A.opsNow(ctx.q);
        const hit = now.filter(o => o.banks.some(l => l.current === "REJECTED"));
        const crej = now.filter(o => o.state === "credit_rejected");
        const kind = o => o.state === "credit_rejected" ? "rej" : o.banks.some(l => ["APPROVED", "CONDITIONAL", "DISBURSED"].includes(l.current)) ? "other" : o.state === "cancelled" ? "canc" : M.ACTIVE.includes(o.state) ? "wait" : "other";
        const g = { other: hit.filter(o => kind(o) === "other"), wait: hit.filter(o => kind(o) === "wait"), rej: hit.filter(o => kind(o) === "rej"), canc: hit.filter(o => kind(o) === "canc") };
        const links = hit.flatMap(o => o.banks.filter(l => l.current === "REJECTED").map(l => ({ ...l, op: o })));
        const k = (id, c, label, v, sub, attrs) => `<button type="button" style="--c:${c}" ${attrs}><span>${label}</span><b>${F.int(v)}</b><small>${sub}</small></button>`;
        const head = `<div class="eqk orx__k">
          ${k("l", "var(--jv-brand)", "Reprovado por banco", links.length, `vínculos · em ${hit.length} operações`, SET("orj-l", { title: "Vínculos reprovados por banco", unit: "vínculo operação-banco", kind: "link", rows: links }))}
          ${k("o", "var(--jv-good)", "Seguiu com outro banco", g.other.length, "a operação não acabou", SET("orj-o", { title: "Reprovadas por um banco, aprovadas por outro", unit: "operação", kind: "op", rows: g.other }))}
          ${k("w", "var(--jv-arc)", "Ainda em análise", g.wait.length, "aguardando outro banco", SET("orj-w", { title: "Reprovadas por um banco, ainda em andamento", unit: "operação", kind: "op", rows: g.wait }))}
          ${k("r", "var(--jv-crit)", "Reprovada por crédito", crej.length, "operação inteira · LC-DEP-01", SET("orj-r", { title: "Operações reprovadas por crédito", unit: "operação", kind: "op", rows: crej }))}</div>`;
        if (!hit.length && !crej.length) return head + empty("Nenhuma reprovação no recorte");
        if (ctx.view === "destino") {
          return head + X4.tree({ label: "Operações com reprovação de banco", v: hit.length, color: "var(--jv-brand)", attrs: SET("orj-all", { title: "Operações com ao menos uma reprovação de banco", unit: "operação", kind: "op", rows: hit }), children: [
            { label: "Aprovada por outro banco", v: g.other.length, color: "var(--jv-good)", attrs: SET("orj-o2", { title: "Aprovadas por outro banco", unit: "operação", kind: "op", rows: g.other }), children: [{ label: "Encerrada (faturada)", v: g.other.filter(o => o.state === "closed").length, color: "var(--jv-good)" }, { label: "Ainda em andamento", v: g.other.filter(o => M.ACTIVE.includes(o.state)).length, color: "var(--jv-stage-review)" }] },
            { label: "Aguardando outro banco", v: g.wait.length, color: "var(--jv-arc)", attrs: SET("orj-w2", { title: "Aguardando outro banco", unit: "operação", kind: "op", rows: g.wait }) },
            { label: "Reprovada por crédito", v: g.rej.length, color: "var(--jv-crit)", attrs: SET("orj-r2", { title: "Todos recusaram", unit: "operação", kind: "op", rows: g.rej }) },
            { label: "Cancelada", v: g.canc.length, color: "var(--jv-x-stage-cancelled-hc)" }] }, { f: "int", colW: 230, gapX: 80, heads: ["Reprovação de banco", "Destino da operação", "Situação"] }) + note("Um banco reprovar é decisão sobre um vínculo. A operação só termina como reprovada por crédito quando nenhum caminho aprova.");
        }
        const banks = D.BANKS.filter(b => hit.some(o => o.banks.some(l => l.bank === b.id)));
        const show = [...g.other, ...g.wait, ...g.rej, ...g.canc].slice(0, 12);
        const chip = (l) => l ? `<span class="orx__c" style="--c:${BS[l.current]}" title="${esc(L.bank[l.bank].label)}: ${esc(L.bs[l.current].label)}">${esc(L.bs[l.current].label)}</span>` : `<span class="orx__c is-none">—</span>`;
        return head + `<div class="orx" style="--n:${banks.length}" role="table" aria-label="Operações com reprovação de banco">
          <div class="orx__h" role="row"><span>Operação</span>${banks.map(b => `<span title="${esc(b.label)}"><img class="lg-chip" src="${b.logo}" alt="">${esc(b.label)}</span>`).join("")}<span>Resultado da operação</span></div>
          ${show.map(o => `<button type="button" class="orx__r" role="row" ${SET("orj-op-" + o.id, { title: o.id, unit: "operação", kind: "op", rows: [o] })}><span class="code">${o.id}<small>${esc(o.client)}</small></span>${banks.map(b => chip(o.banks.find(l => l.bank === b.id))).join("")}<span>${lcChip(o.state)}</span></button>`).join("")}</div>
          ${hit.length > show.length ? note(`Mostrando ${show.length} de ${hit.length} operações. Os números acima abrem todas.`) : ""}${note("Linha = uma operação. Colunas = estado de cada vínculo com banco. A operação segue enquanto houver um caminho de crédito possível.")}`;
      },
      foot: "Perdida por crédito (perda comercial) fica na aba Comercial. Aqui só reprovação da operação e reprovação por banco." });
  }
  // Árvore de transições dos vínculos: Recebida e Pendente são entradas paralelas.
  function oInst(q) {
    return P(q, { id: "o-inst", title: "Por instituição", q: "Em que estado está cada vínculo e por onde ele passou?", unit: "vínculo operação-banco", period: false, periodText: "Situação atual · histórico completo dos vínculos", source: "canonical", sourceId: "outcomeFacts.banks",
      views: [["atual", "Estado atual", "hbars"], ["historico", "Histórico de transições", "tree"]],
      body: ctx => {
        const now = A.opsNow(ctx.q); const banks = D.BANKS.filter(b => !ctx.f.bank || b.id === ctx.f.bank);
        const links = now.flatMap(o => o.banks.filter(l => banks.some(b => b.id === l.bank)).map(l => ({ ...l, op: o })));
        if (!links.length) return empty("Sem vínculos bancários no recorte", "Nenhuma operação do recorte foi enviada a instituição financeira.");
        if (ctx.view === "historico") {
          const LBL = Object.fromEntries(D.BANK_STATES.map(s => [s.id, s.label]));
          const root = { label: "Vínculos enviados", v: links.length, color: "var(--jv-arc)", children: [], key: "" };
          links.forEach(l => { let n = root; l.transitions.forEach(t => { let c = n.children.find(x => x.id === t.to); if (!c) { c = { id: t.to, label: LBL[t.to], v: 0, color: BS[t.to], children: [], rows: [] }; n.children.push(c); } c.v++; c.rows.push(l); n = c; }); });
          let i = 0; (function walk(n, path) { if (n.rows) n.attrs = SET("oi-h-" + (i++), { title: "Vínculos · " + path.join(" › "), unit: "vínculo operação-banco", kind: "link", rows: n.rows }); n.children.sort((a, b) => (a.id === "RECEIVED" ? -1 : b.id === "RECEIVED" ? 1 : b.v - a.v)); n.children.forEach(c => walk(c, path.concat(c.label))); })(root, []);
          return X4.tree(root, { f: "int", colW: 172, gapX: 52, heads: ["Envio", "Entrada (paralelas)", "Análise", "Decisão", "Desembolso"], label: "Transições dos vínculos bancários" }) + note("<b>Recebida</b> e <b>Pendente</b> são entradas paralelas: o vínculo começa por uma delas, nunca Pendente antes de Recebida. Largura = quantidade de vínculos.");
        }
        const rows = banks.map(b => { const l = links.filter(x => x.bank === b.id); return { id: b.id, label: b.label + (b.active ? "" : " · inativa"), logo: b.logo, sub: plural(l.length, "vínculo", "vínculos"), segs: Object.fromEntries(D.BANK_STATES.map(s => [s.id, l.filter(x => x.current === s.id).length])), l }; }).filter(r => r.l.length);
        return X4.stackRows(rows, D.BANK_STATES.map(s => ({ id: s.id, label: s.label, color: BS[s.id] })), { pct: true, segAttr: (r, p) => SET(`oi-${r.id}-${p.id}`, { title: `${r.label} · ${p.label}`, unit: "vínculo operação-banco", kind: "link", rows: r.l.filter(x => x.current === p.id) }) });
      },
      foot: "Consultas e reavaliações de elegibilidade não contam como envio. Ausência de envio registrado não comprova que a proposta não chegou ao banco." });
  }

  // =====================================================================
  // DOCUMENTAÇÃO
  // =====================================================================
  function documentacao(q) {
    return `${unitbar("doc", "Unidade: requisito documental aplicável a uma operação.", "Estados reais: pendente (não enviado), enviado, validado, rejeitado. Não aplicável fica fora da conta. Classificação por AVA ou manual.")}
      ${strip(q, "documentacao", ["d_app", "d_val", "d_rec", "d_miss", "d_rej", "d_comp"], "Indicadores · Documentação")}
      ${sec(dMain(q))}
      ${two(dSeller(q), dBank(q))}
      ${two(dDocs(q), dAva(q))}`;
  }
  // Operações em andamento com checklist, filtradas pelo banco do recorte.
  const docsOf = ctx => { const x = A.docs(ctx.q); return x; };
  function dMain(q) {
    const reqOpts = [["", "Todos os requisitos"], ...D.REQUIREMENTS.map(r => [r.id, r.label])];
    return P(q, { id: "d-main", title: "Situação do checklist", q: "Quanto já está validado e onde está parado?", unit: "requisito por operação", period: false, periodText: "Situação atual · operações em andamento", source: "canonical", sourceId: "OPERATION_DOCUMENT_CHECKLIST",
      views: [["anel", "Estados", "pie"], ["req", "Por requisito", "hbars"]],
      tools: () => `<label class="jv-field" style="flex-direction:row;align-items:center;gap:6px;max-width:260px"><span>Requisito</span><select class="jv-select" data-q="req" data-active="${!!q.req}">${reqOpts.map(([id, l]) => `<option value="${id}" ${q.req === id ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`,
      body: ctx => {
        const x = A.docs({ ...ctx.q, req: q.req }); if (!x.applicable) return empty("Nenhum requisito aplicável", "As operações em andamento do recorte não têm checklist.");
        if (ctx.view === "req") return X4.stackRows(D.REQUIREMENTS.filter(r => !q.req || r.id === q.req).map(rq => { const l = x.rows.filter(y => y.req === rq.id); return { id: rq.id, label: rq.label, sub: `${l.length} aplicáveis`, segs: Object.fromEntries(DS.map(([k]) => [k, l.filter(y => y.state === k).length])), total: F.pct(l.length ? l.filter(y => y.state === "VALIDATED").length / l.length : null) + " ok" }; }), DS.map(([id, label, color]) => ({ id, label, color })), { pct: true, segAttr: (r, p) => SET(`dm-${r.id}-${p.id}`, { title: `${r.label} · ${p.label}`, unit: "requisito por operação", kind: "doc", rows: x.rows.filter(y => y.req === r.id && y.state === p.id) }) });
        const cov = x.list.length ? x.observable.length / x.list.length : null;
        return `<div class="doc-top">${X4.ring(DS.map(([k, label, color]) => { const l = x.rows.filter(y => y.state === k); return { label, v: l.length, color, attrs: SET("dm-" + k, { title: "Requisitos · " + label, unit: "requisito por operação", kind: "doc", rows: l }) }; }), { center: "aplicáveis", label: "Estados do checklist" })}
          <div class="eqk" style="grid-template-columns:1fr"><div style="--c:var(--jv-arc)"><span>Cobertura observável</span><b>${F.pct(cov)}</b><small>${F.int(x.observable.length)} de ${F.int(x.list.length)} operações com checklist registrado</small></div><div style="--c:var(--jv-good)"><span>Checklists completos</span><b>${F.int(x.complete.length)}</b><small>todos os requisitos validados</small></div></div></div>`;
      },
      foot: "Dispensa não aparece: existe só no back-end (irmen_waive_document_requirement), sem tela que a use. Completude não avalia a qualidade do documento." });
  }
  function dSeller(q) {
    return P(q, { id: "d-seller", title: "Documentação OK por vendedor", q: "Que vendedor entrega a documentação completa?", unit: "% de requisitos validados", period: false, periodText: "Situação atual · operações em andamento", source: "canonical", sourceId: "OPERATION_DOCUMENT_CHECKLIST",
      views: [["rank", "Ranking", "hbars"], ["comp", "Composição", "bars"]],
      body: ctx => {
        const x = docsOf(ctx); if (!x.applicable) return empty("Nenhum requisito aplicável");
        const rows = D.SELLERS.map(s => { const l = x.rows.filter(y => y.op.seller === s.id); return { s, l, ok: l.filter(y => y.state === "VALIDATED").length }; }).filter(r => r.l.length);
        if (ctx.view === "comp") return X4.stackRows(rows.map(r => ({ id: r.s.id, label: r.s.label, sub: `${r.l.length} requisitos`, segs: Object.fromEntries(DS.map(([k]) => [k, r.l.filter(y => y.state === k).length])) })), DS.map(([id, label, color]) => ({ id, label, color })), { pct: true, segAttr: (r, p) => SET(`ds-${r.id}-${p.id}`, { title: `${r.label} · ${p.label}`, unit: "requisito por operação", kind: "doc", rows: x.rows.filter(y => y.op.seller === r.id && y.state === p.id) }) });
        return X4.hb(rows.map(r => ({ label: r.s.label, sub: `${r.ok} de ${r.l.length} validados · ${r.l.filter(y => y.state === "MISSING").length} pendentes`, v: r.ok / r.l.length * 100, text: F.pct(r.ok / r.l.length), avatar: ini(r.s.label), color: A.SELLER_COLOR[r.s.id], attrs: SET("ds-" + r.s.id, { title: "Requisitos · " + r.s.label, unit: "requisito por operação", kind: "doc", rows: r.l }) })).sort((a, b) => b.v - a.v), { rank: true, max: 100 });
      } });
  }
  function dBank(q) {
    return P(q, { id: "d-bank", title: "Completude por banco", q: "Em que banco a documentação está mais completa?", unit: "% de requisitos validados", period: false, periodText: "Situação atual · operações em andamento", source: "canonical", sourceId: "OPERATION_DOCUMENT_CHECKLIST",
      views: [["rank", "Ranking", "hbars"], ["comp", "Composição", "bars"]],
      body: ctx => {
        const x = docsOf(ctx); if (!x.applicable) return empty("Nenhum requisito aplicável");
        const rows = D.BANKS.map(b => { const l = x.rows.filter(y => y.op.banks.some(k => k.bank === b.id)); return { b, l, ok: l.filter(y => y.state === "VALIDATED").length }; }).filter(r => r.l.length);
        if (!rows.length) return empty("Nenhuma operação com banco no recorte");
        if (ctx.view === "comp") return X4.stackRows(rows.map(r => ({ id: r.b.id, label: r.b.label, logo: r.b.logo, sub: `${r.l.length} requisitos`, segs: Object.fromEntries(DS.map(([k]) => [k, r.l.filter(y => y.state === k).length])) })), DS.map(([id, label, color]) => ({ id, label, color })), { pct: true, segAttr: (r, p) => SET(`db-${r.id}-${p.id}`, { title: `${r.label} · ${p.label}`, unit: "requisito por operação", kind: "doc", rows: x.rows.filter(y => y.op.banks.some(k => k.bank === r.id) && y.state === p.id) }) });
        return X4.hb(rows.map(r => ({ label: r.b.label, sub: `${r.ok} de ${r.l.length} validados`, v: r.ok / r.l.length * 100, text: F.pct(r.ok / r.l.length), logo: r.b.logo, color: BANKC[r.b.id], attrs: SET("db-" + r.b.id, { title: "Requisitos · " + r.b.label, unit: "requisito por operação", kind: "doc", rows: r.l }) })).sort((a, b) => b.v - a.v), { rank: true, max: 100 });
      },
      foot: "No Portal o checklist é por banco. No protótipo, os requisitos da operação contam para cada banco com vínculo." });
  }
  function dDocs(q) {
    return P(q, { id: "d-docs", title: "Do mais enviado ao menos enviado", q: "Que documento chega fácil e qual mais falta?", unit: "requisito por operação", period: false, periodText: "Situação atual · operações em andamento", source: "canonical", sourceId: "OPERATION_DOCUMENT_CHECKLIST",
      views: [["barras", "Enviados", "hbars"], ["matriz", "Matriz de estados", "grid"]],
      body: ctx => {
        const x = docsOf(ctx); if (!x.applicable) return empty("Nenhum requisito aplicável");
        const rows = D.REQUIREMENTS.map(r => { const l = x.rows.filter(y => y.req === r.id); return { id: r.id, label: r.label, l, sent: l.filter(y => y.state !== "MISSING") }; }).sort((a, b) => b.sent.length - a.sent.length);
        if (ctx.view === "matriz") return X4.grid(rows, DS.map(([id, label]) => ({ id, label, short: label.split(" ")[0] })), (r, c) => { const l = r.l.filter(y => y.state === c.id); return { v: l.length, text: F.int(l.length), tip: `${l.length} de ${r.l.length}`, attrs: SET(`dd-${r.id}-${c.id}`, { title: `${r.label} · ${c.label}`, unit: "requisito por operação", kind: "doc", rows: l }) }; }, { corner: "Requisito × estado", color: "var(--jv-teal)", label: "Requisitos por estado" });
        return X4.hb(rows.map(r => ({ label: r.label, sub: `${r.l.length - r.sent.length} pendentes de ${r.l.length}`, v: r.sent.length, text: F.int(r.sent.length) + " enviados", color: "var(--jv-teal)", attrs: SET("dd-" + r.id, { title: "Enviados · " + r.label, unit: "requisito por operação", kind: "doc", rows: r.sent }) })), { rank: true, dense: true });
      } });
  }
  function dAva(q) {
    return P(q, { id: "d-ava", title: "Classificação: AVA × manual", q: "Quanto da documentação a AVA classifica sozinha?", unit: "documento enviado", basis: "data do envio", source: "canonical", sourceId: "DOCUMENT_CLASSIFICATION",
      views: [["linha", "No tempo", "line"], ["anel", "Participação", "pie"]],
      cmpSummary: ctx => { const sent = c => A.docs({ ...c, __range: undefined }).rows.filter(y => y.sentAt); const a = sent(ctx.q).filter(y => IRF.inR(y.sentAt, ctx.r)), b = sent(ctx.cq).filter(y => IRF.inR(y.sentAt, ctx.cr)); return { label: "Pela AVA", cur: a.length ? a.filter(y => y.by === "AVA").length / a.length : null, prev: b.length ? b.filter(y => y.by === "AVA").length / b.length : null, fmt: F.pct }; },
      body: ctx => {
        const rowsIn = (c, r) => A.docs({ ...c, __range: undefined }).rows.filter(y => y.sentAt && IRF.inR(y.sentAt, r));
        const rows = rowsIn(ctx.q, ctx.r); if (!rows.length) return empty("Nenhum documento enviado no período");
        if (ctx.view === "anel") return X4.ring([["AVA", "AVA (automática)", "var(--jv-violet)"], ["MANUAL", "Manual", "var(--jv-arc)"]].map(([k, l, c]) => { const x = rows.filter(y => y.by === k); return { label: l, v: x.length, color: c, attrs: SET("da-" + k, { title: "Classificação " + l, unit: "documento", kind: "doc", rows: x }) }; }), { center: "enviados", label: "Classificação dos documentos" });
        const b0 = IRF.buckets(ctx.r);
        return X4.ts(["AVA", "MANUAL"].map((k, i) => ({ label: k === "AVA" ? "AVA" : "Manual", color: i ? "var(--jv-arc)" : "var(--jv-violet)", pts: pts(IRF.series(rows.filter(y => y.by === k), y => y.sentAt, ctx.r, () => 1, b0.gran)) })), { mode: "line", h: 200, label: "Documentos classificados no tempo", drill: p => SET("da-" + p.id, { title: "Classificados pela AVA · " + p.long, unit: "documento", kind: "doc", rows: p.items || [] }) }) + note(`Uma faixa = ${granTxt(b0.gran)}. Documentos das operações em andamento, pela data do envio.`);
      } });
  }

  // =====================================================================
  // FATURAMENTO
  // =====================================================================
  function faturamento(q) {
    return `${unitbar("coins", "Faturado = operação que entrou em Encerrada no lifecycle.", "Sem API fiscal. Data do faturamento = data da transição para Encerrada. Volume financiado usa o banco que registrou o desembolso. Recebimento saiu: não há controle de contas a receber.")}
      ${strip(q, "faturamento", ["f_billed", "f_units", "f_ticket", "f_fin", "f_ops", "f_goal"], "Indicadores · Faturamento")}
      ${sec(fBilled(q))}
      ${sec(fMach(q))}
      ${sec(fEquip(q))}
      ${sec(fGoal(q))}
      ${S.profile === "seller" ? "" : sec(fCmp(q))}
      ${two(fPath(q), fFin(q))}
      ${two(fModBank(q), fTicket(q))}
      ${two(fAbc(q), fNewRec(q))}
      ${two(fUf(q), fEntry(q))}
      ${sec(fSeason(q))}`;
  }
  const valOf = m => m === "units" ? (o => o.units) : (o => o.equipmentValue);
  function fBilled(q) {
    const pid = "f-billed", m = pick(q, pid + ".m.v", ["value", "units"]);
    return P(q, { id: pid, title: "Faturado no período", q: "Quanto foi faturado, quantas máquinas e em que ritmo?", unit: m === "units" ? "máquina faturada" : unitTag("billed", "R$ faturado"), basis: "data da transição para Encerrada", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED", hud: true,
      views: [["cols", "Colunas", "bars"], ["line", "Linha", "line"], ["area", "Área", "area"], ["cum", "Acumulado", "cum"], ["cat", "Por categoria", "layers"]],
      tools: () => seg(pid + ".m.v", m, [["value", "R$"], ["units", "Máquinas"]], "Medida"),
      cmpSummary: ctx => { const a = A.closedOps(ctx.q, ctx.r), b = A.closedOps(ctx.cq, ctx.cr); return [{ label: "Faturado", cur: sum(a, o => o.equipmentValue), prev: sum(b, o => o.equipmentValue), fmt: F.brlc }, { label: "Máquinas", cur: sum(a, o => o.units), prev: sum(b, o => o.units), fmt: F.int }, { label: "Operações", cur: a.length, prev: b.length, fmt: F.int }]; },
      body: ctx => {
        const list = A.closedOps(ctx.q, ctx.r); if (!list.length) return empty("Nenhuma operação entrou em Encerrada no período");
        if (ctx.view === "cat") { const sales = A.sales(ctx.q, ctx.r); const b0 = IRF.buckets(ctx.r); return X4.ts(D.CATEGORIES.map(c => ({ label: c.label, color: CATC[c.id], pts: pts(IRF.series(sales.filter(s => s.cat === c.id), s => s.op.closedAt, ctx.r, m === "units" ? (s => s.qty) : (s => s.total), b0.gran)) })), { mode: "line", f: m === "units" ? "int" : "brlc", h: 220, label: "Faturado por categoria", drill: p => SET("fb-c-" + p.id, { title: "Itens faturados · " + p.long, unit: "item de equipamento", kind: "sale", rows: sales.filter(s => IRF.inR(s.op.closedAt, { from: b0.find(x => x.id === p.id).from, to: b0.find(x => x.id === p.id).to })) }) }) + note(`Uma faixa = ${granTxt(b0.gran)}. Mesma escala para todas as categorias.`); }
        return tsCmp(ctx, (q2, r2) => A.closedOps(q2, r2), o => o.closedAt, valOf(m), { mode: ctx.view, f: m === "units" ? "int" : "brlc", color: "var(--jv-x-money-billed)", h: 220, label: "Faturado no período", key: "fb", title: "Encerradas", unit: "operação", kind: "op", money: ["billed", o => o.equipmentValue] });
      } });
  }
  // Máquinas faturadas: por modelo, categoria, vendedor, filial, gerência.
  function fMach(q) {
    const pid = "f-mach", dim = pick(q, pid + ".d.v", ["model", "cat", "seller", "branch", "mgr"]), m = pick(q, pid + ".m.v", ["units", "value"]);
    const DIM = { model: ["Modelo", s => s.model, id => L.model[id].label], cat: ["Categoria", s => s.cat, id => L.cat[id].label], seller: ["Vendedor", s => s.op.seller, id => seller(id)], branch: ["Filial", s => s.op.branch, id => L.branch[id].label], mgr: ["Gerência", s => s.op.manager, id => L.mgr[id].label] };
    return P(q, { id: pid, title: "Máquinas faturadas", q: "Quais máquinas saíram, quantas e por quanto?", unit: m === "units" ? "máquina (unidade)" : unitTag("billed", "R$ faturado"), basis: "data da Encerrada", source: "canonical", sourceId: "operation_equipment_items",
      views: [["barras", "Barras", "hbars"], ["mix", "Mix", "pie"], ["matriz", "Vendedor × categoria", "grid"]],
      tools: () => seg(pid + ".d.v", dim, Object.entries(DIM).map(([k, v]) => [k, v[0]]), "Agrupar por") + seg(pid + ".m.v", m, [["units", "Unid."], ["value", "R$"]], "Medida"),
      cmpSummary: ctx => { const a = A.sales(ctx.q, ctx.r), b = A.sales(ctx.cq, ctx.cr); return [{ label: "Máquinas", cur: sum(a, s => s.qty), prev: sum(b, s => s.qty), fmt: F.int }, { label: "Modelos", cur: new Set(a.map(s => s.model)).size, prev: new Set(b.map(s => s.model)).size, fmt: F.int }]; },
      body: ctx => {
        const sales = A.sales(ctx.q, ctx.r); if (!sales.length) return empty("Nenhuma máquina faturada no período");
        const ps = ctx.cq ? A.sales(ctx.cq, ctx.cr) : null; const [, key, lab] = DIM[dim]; const v = l => m === "units" ? sum(l, s => s.qty) : sum(l, s => s.total);
        if (ctx.view === "matriz") { const rows = D.SELLERS.filter(s => sales.some(x => x.op.seller === s.id)).map(s => ({ id: s.id, label: s.label })); return X4.grid(rows, D.CATEGORIES.map(c => ({ id: c.id, label: c.label, short: c.label.slice(0, 6) + "." })), (r, c) => { const l = sales.filter(s => s.op.seller === r.id && s.cat === c.id); return { v: v(l), text: m === "units" ? F.int(v(l)) : F.brlc(v(l)).replace("R$ ", ""), tip: `${sum(l, s => s.qty)} máquinas · ${F.brlc(sum(l, s => s.total))}`, attrs: SET(`fm-x-${r.id}-${c.id}`, { title: `${r.label} · ${c.label}`, unit: "item de equipamento", kind: "sale", rows: l }) }; }, { corner: "Vendedor × categoria", total: r => m === "units" ? F.int(v(sales.filter(s => s.op.seller === r.id))) + " un." : F.brlc(v(sales.filter(s => s.op.seller === r.id))), color: "var(--jv-violet)" }); }
        const ids = [...new Set(sales.map(key))];
        const items = ids.map((id, i) => { const l = sales.filter(s => key(s) === id); return { id, label: lab(id), v: v(l), prev: ps ? v(ps.filter(s => key(s) === id)) : null, text: m === "units" ? F.int(v(l)) + " un." : F.brlc(v(l)), sub: m === "units" ? `${F.brlc(sum(l, s => s.total))} · média ${F.brlc(sum(l, s => s.total) / Math.max(1, sum(l, s => s.qty)))}` : `${sum(l, s => s.qty)} máquinas`, color: dim === "cat" ? CATC[id] : dim === "model" ? CATC[L.model[id].cat] : dim === "seller" ? A.SELLER_COLOR[id] : X4.CAT[i % 6], avatar: dim === "seller" ? ini(seller(id)) : null, attrs: SET("fm-" + id, { title: "Faturados · " + lab(id), unit: "item de equipamento", kind: "sale", rows: l }) }; }).sort((a, b) => b.v - a.v);
        if (ctx.view === "mix") return X4.ring(items.slice(0, 8).concat(items.length > 8 ? [{ label: "Outros", v: sum(items.slice(8), x => x.v), color: "var(--jv-fg-3)" }] : []).map(x => ({ label: x.label, v: x.v, color: x.color, attrs: x.attrs })), { f: m === "units" ? "int" : "brlc", centerText: m === "units" ? F.int(v(sales)) : F.brlc(v(sales)), center: m === "units" ? "máquinas" : "faturado", label: "Mix" }) + (dim === "model" ? note("Cor do modelo = cor da sua categoria.") : "");
        return X4.hb(items, { rank: true, cmpLegend: !!ps, f: m === "units" ? "int" : "brlc" }) + (dim === "model" ? `<div class="lg4">${D.CATEGORIES.map(c => `<span><i style="--c:${CATC[c.id]}"></i>${esc(c.label)}</span>`).join("")}</div>` : "");
      } });
  }
  // Relatório por equipamento: escolho um modelo e vejo quem vende, preços e quando.
  function fEquip(q) {
    const pid = "f-equip", mdl = D.MODELS.some(x => x.id === q[pid + ".mdl"]) ? q[pid + ".mdl"] : D.MODELS[2].id;
    return P(q, { id: pid, title: "Relatório por equipamento", q: "Quem mais vende este modelo, por quanto e para quem?", unit: "máquina faturada · preço unitário", basis: "data da Encerrada", source: "canonical", sourceId: "operation_equipment_items", defPeriod: "all", hud: true,
      views: [["rank", "Vendedores", "hbars"], ["precos", "Faixa de preço", "scatter"], ["hist", "Histórico", "line"], ["tabela", "Vendas", "table"]],
      cmpSummary: ctx => { const a = A.sales(ctx.q, ctx.r).filter(s => s.model === mdl), b = A.sales(ctx.cq, ctx.cr).filter(s => s.model === mdl); return [{ label: "Unidades", cur: sum(a, s => s.qty), prev: sum(b, s => s.qty), fmt: F.int }, { label: "Preço médio", cur: sum(a, s => s.qty) ? sum(a, s => s.total) / sum(a, s => s.qty) : null, prev: sum(b, s => s.qty) ? sum(b, s => s.total) / sum(b, s => s.qty) : null, fmt: F.brlc }]; },
      body: ctx => {
        const all = A.sales(ctx.q, ctx.r); const l = all.filter(s => s.model === mdl); const md = L.model[mdl];
        const sel = `<div class="eqsel"><label class="jv-field"><span>Modelo</span><select class="jv-select" data-q="${pid}.mdl">${D.CATEGORIES.map(c => `<optgroup label="${esc(c.label)}">${D.MODELS.filter(x => x.cat === c.id).map(x => `<option value="${x.id}" ${x.id === mdl ? "selected" : ""}>${esc(x.label)} · ${x.id}</option>`).join("")}</optgroup>`).join("")}</select></label><span class="dim" style="font-size:12px">${esc(L.cat[md.cat].label)} · preço de tabela ilustrativo ${F.brlc(md.price)}</span></div>`;
        if (!l.length) return sel + empty("Nenhuma unidade deste modelo faturada no período", "Escolha outro modelo ou amplie o período.");
        const units = sum(l, s => s.qty), avgP = sum(l, s => s.total) / units;
        const hi = l.reduce((a, b) => b.unit > a.unit ? b : a), lo = l.reduce((a, b) => b.unit < a.unit ? b : a);
        const bySeller = D.SELLERS.map(s => { const x = l.filter(y => y.op.seller === s.id); return { s, x, u: sum(x, y => y.qty), avg: x.length ? sum(x, y => y.total) / sum(x, y => y.qty) : null }; }).filter(r => r.u).sort((a, b) => b.u - a.u);
        const top = bySeller[0];
        const one = (t, c, b, s, attrs) => `<div style="--c:${c}" ${attrs || ""}><span>${t}</span><b>${b}</b><small>${s}</small></div>`;
        const kp = `<div class="eqk">
          ${one("Unidades faturadas", "var(--jv-violet)", F.int(units), `${plural(l.length, "venda", "vendas")} · ${F.brlc(sum(l, s => s.total))}`)}
          ${one("Quem mais vende", "var(--jv-arc)", esc(top.s.label), `${top.u} unidades · média ${F.brlc(top.avg)}`)}
          ${one("Preço médio", "var(--jv-teal)", F.brlc(avgP), `tabela ${F.brlc(md.price)} · ${avgP >= md.price ? "+" : "−"}${F.pct(Math.abs(avgP / md.price - 1))}`)}
          ${one("Maior preço", "var(--jv-good)", F.brlc(hi.unit), `${F.date(hi.op.closedAt)} · ${esc(hi.op.client)} · ${esc(seller(hi.op.seller))}`)}
          ${one("Menor preço", "var(--jv-warn)", F.brlc(lo.unit), `${F.date(lo.op.closedAt)} · ${esc(lo.op.client)} · ${esc(seller(lo.op.seller))}`)}</div>`;
        let v;
        if (ctx.view === "precos") v = X4.scatter(l.map(s => ({ x: s.unit, row: s.op.seller, r: 7 + s.qty * 3, color: A.SELLER_COLOR[s.op.seller], hl: s === hi || s === lo, tipT: `${s.op.client} · ${F.date(s.op.closedAt)}`, tip: `${F.brlc(s.unit)} por unidade · ${s.qty} un. · ${seller(s.op.seller)}`, attrs: SET("fe-s-" + s.op.id + s.model, { title: s.op.id, unit: "item de equipamento", kind: "sale", rows: [s] }) })), { rows: bySeller.map(r => r.s.id), rowLabel: id => seller(id), fx: "brlc", vline: avgP, vlineLabel: "média", xLabel: "preço por unidade →", label: "Faixa de preço por vendedor" }) + note("Cada ponto é uma venda. Tamanho: quantidade. Contorno: maior e menor preço. Linha: preço médio.");
        else if (ctx.view === "hist") { const t = l.map(s => Date.parse(s.op.closedAt)); v = X4.scatter(l.map(s => ({ x: Date.parse(s.op.closedAt), y: s.unit, r: 7 + s.qty * 2, color: A.SELLER_COLOR[s.op.seller], hl: s === hi || s === lo, tipT: `${s.op.client} · ${F.date(s.op.closedAt)}`, tip: `${F.brlc(s.unit)} · ${seller(s.op.seller)}`, attrs: SET("fe-h-" + s.op.id + s.model, { title: s.op.id, unit: "item de equipamento", kind: "sale", rows: [s] }) })), { fx: x => C.dmy(new Date(x).toISOString().slice(0, 10)), fy: "brlc", xmin: Math.min(...t), xmax: Math.max(...t), hline: avgP, hlineLabel: "média", yLabel: "preço", xLabel: "data da Encerrada →", h: 240, label: "Preço por data" }) + `<div class="lg4">${bySeller.map(r => `<span><i style="--c:${A.SELLER_COLOR[r.s.id]}"></i>${esc(r.s.label)}</span>`).join("")}</div>`; }
        else if (ctx.view === "tabela") v = `<div class="tbl-wrap"><table class="tbl tbl--cards"><thead><tr><th>Data</th><th>Cliente</th><th>Vendedor · filial</th><th class="r">Qtd</th><th class="r">Preço unitário</th><th class="r">Total</th></tr></thead><tbody>${[...l].sort((a, b) => b.op.closedAt.localeCompare(a.op.closedAt)).slice(0, 25).map(s => `<tr><td data-l="Data">${F.date(s.op.closedAt)}</td><td data-l="Cliente">${esc(s.op.client)}<span class="sub">${esc(s.op.city)} · ${s.op.uf}</span></td><td data-l="Vendedor">${esc(seller(s.op.seller))}<span class="sub">${esc(L.branch[s.op.branch].label)}</span></td><td data-l="Qtd" class="r">${s.qty}</td><td data-l="Preço" class="r" ${s === hi ? 'style="color:var(--jv-good)"' : s === lo ? 'style="color:var(--jv-warn)"' : ""}>${F.brl(s.unit)}</td><td data-l="Total" class="r">${F.brl(s.total)}</td></tr>`).join("")}</tbody></table></div>`;
        else v = X4.hb(bySeller.map(r => ({ label: r.s.label, sub: `${L.branch[r.s.branch].label} · média ${F.brlc(r.avg)} · ${r.x.length} vendas`, v: r.u, text: r.u + " un.", avatar: ini(r.s.label), color: A.SELLER_COLOR[r.s.id], attrs: SET("fe-r-" + r.s.id, { title: `${md.label} · ${r.s.label}`, unit: "item de equipamento", kind: "sale", rows: r.x }) })), { rank: true });
        return sel + kp + v;
      },
      foot: "Período padrão deste painel: período completo (maior e menor preço da história). Base para a estratégia do ano seguinte." });
  }
  // Metas (cadastro a criar: FAT-DEP-META). Duas metas por vendedor: valor e unidades por categoria.
  function fGoal(q) {
    const pid = "f-goal", m = pick(q, pid + ".m.v", ["value", "units"]), lvl = pick(q, pid + ".l.v", ["seller", "branch", "mgr", "company"]);
    return P(q, { id: pid, title: "Metas", q: "Vamos bater a meta, em valor e em máquinas?", unit: m === "units" ? "máquina × meta de unidades" : unitTag("billed", "R$ faturado × meta"), basis: "metas mensais somadas nos meses do período", source: "none", sourceId: "FAT-DEP-META", hud: true,
      views: [["bala", "Realizado × meta", "hbars"], ["radial", "Atingimento", "target"], ["proj", "Projeção", "line"], ["cat", "Por categoria", "grid"], ["cad", "Cadastro (proposta)", "table"]],
      tools: () => seg(pid + ".m.v", m, [["value", "R$"], ["units", "Unidades"]], "Meta") + seg(pid + ".l.v", lvl, [["seller", "Vendedor"], ["branch", "Filial"], ["mgr", "Gerência"], ["company", "Empresa"]], "Nível"),
      body: ctx => {
        const badge = `<div class="dep3__badge">${icon("flask")}Prévia do desenho · metas ilustrativas · sem fonte até o cadastro de metas (FAT-DEP-META)</div>`;
        const closed = A.closedOps(ctx.q, ctx.r), goals = A.goalsIn(ctx.q, ctx.r), sales = A.sales(ctx.q, ctx.r);
        const act = l => m === "units" ? sum(l, o => o.units) : sum(l, o => o.equipmentValue);
        const gol = l => m === "units" ? sum(l, g => sum(Object.values(g.units), x => x)) : sum(l, g => g.value);
        const end = new Date(Date.parse(ctx.r.to + "T12:00:00Z")); const eom = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
        const left = IRF.diffDays(ctx.r.to, eom); const proj = v => v + v / ctx.r.days * left; const f = m === "units" ? "int" : "brlc";
        const groups = { seller: D.SELLERS.filter(s => !ctx.f.seller || s.id === ctx.f.seller).map(s => ({ id: s.id, label: s.label, sub: L.branch[s.branch].label, avatar: ini(s.label), color: A.SELLER_COLOR[s.id], k: "seller" })), branch: D.BRANCHES.map((b, i) => ({ id: b.id, label: b.label, color: X4.CAT[i], k: "branch" })), mgr: D.MANAGERS.map(g => ({ id: g.id, label: g.label, sub: "DASH-DEP-G1", color: "var(--jv-indigo)", k: "manager" })), company: [{ id: "all", label: "Empresa", color: "var(--jv-x-money-billed)", k: null }] }[lvl];
        const rowsOf = gr => { const l = gr.k ? closed.filter(o => o[gr.k] === gr.id) : closed, g = gr.k ? goals.filter(x => x[gr.k] === gr.id) : goals; return { ...gr, l, g, actual: act(l), goal: gol(g), proj: proj(act(l)) }; };
        const rows = groups.map(rowsOf).filter(r => r.goal);
        if (ctx.view === "cad") {
          const mon = ctx.r.to.slice(0, 7); const gm = D.GOALS.filter(g => g.month === mon && (!ctx.f.seller || g.seller === ctx.f.seller));
          return badge + `<p class="dim" style="font-size:12.5px;margin:8px 0">Como o cadastro de metas pode ficar: por mês e por vendedor, uma meta de <b>valor</b> e metas de <b>unidades por categoria</b> (ou por modelo). Filial, gerência e empresa somam as metas dos vendedores. Mês mostrado: ${F.month(mon)}.</p>
            <div class="tbl-wrap"><table class="tbl tbl--cards"><thead><tr><th>Vendedor</th><th>Filial</th><th class="r">Meta de valor</th>${D.CATEGORIES.map(c => `<th class="r">${esc(c.label)}</th>`).join("")}<th class="r">Total unid.</th></tr></thead><tbody>${gm.map(g => `<tr><td data-l="Vendedor">${esc(seller(g.seller))}</td><td data-l="Filial">${esc(L.branch[g.branch].label)}</td><td data-l="Meta de valor" class="r">${F.brl(g.value)}</td>${D.CATEGORIES.map(c => `<td data-l="${esc(c.label)}" class="r">${g.units[c.id]}</td>`).join("")}<td data-l="Total" class="r"><b>${sum(Object.values(g.units), x => x)}</b></td></tr>`).join("")}
            <tr><td data-l="Total"><b>Empresa</b></td><td></td><td class="r"><b>${F.brl(sum(gm, g => g.value))}</b></td>${D.CATEGORIES.map(c => `<td class="r"><b>${sum(gm, g => g.units[c.id])}</b></td>`).join("")}<td class="r"><b>${sum(gm, g => sum(Object.values(g.units), x => x))}</b></td></tr></tbody></table></div>`;
        }
        if (!rows.length) return badge + empty("Sem metas para este recorte");
        if (ctx.view === "radial") return badge + X4.radial(rows.slice(0, 6).map(r => ({ label: r.label, v: r.actual / r.goal, text: F.pct(r.actual / r.goal), sub: `${C.fmt(f, r.actual)} de ${C.fmt(f, r.goal)} · projeção ${F.pct(r.proj / r.goal)}`, color: r.color })), { size: 220, max: 1, center: `<b>${F.pct(gol(goals) ? act(closed) / gol(goals) : null)}</b><small>empresa</small>` });
        if (ctx.view === "proj") { const b = IRF.series(closed, o => o.closedAt, ctx.r, valOf(m)); const G = gol(goals); return badge + X4.ts([{ label: "Realizado acumulado", color: "var(--jv-x-money-billed)", pts: pts(b) }, { label: "Meta no ritmo linear", dash: true, color: "var(--jv-warn)", pts: b.map(x => ({ id: x.id, label: x.label, v: G / b.length })) }], { mode: "cum", f, h: 220, peak: false, label: "Realizado e meta" }) + note(`No ritmo atual o período fecha em <b>${C.fmt(f, proj(act(closed)))}</b> para uma meta de <b>${C.fmt(f, G)}</b> (${F.pct(G ? proj(act(closed)) / G : null)}).`); }
        if (ctx.view === "cat") { const rr = groups.map(gr => ({ ...gr })); return badge + X4.grid(rr, D.CATEGORIES.map(c => ({ id: c.id, label: c.label, short: c.label.slice(0, 6) + "." })), (r, c) => { const s = r.k ? sales.filter(x => x.op[r.k] === r.id && x.cat === c.id) : sales.filter(x => x.cat === c.id); const g = r.k ? goals.filter(x => x[r.k] === r.id) : goals; const a = sum(s, x => x.qty), gg = sum(g, x => x.units[c.id]); return { v: gg ? Math.min(1.2, a / gg) : 0, text: gg ? F.pct(a / gg) : "—", tip: `${a} de ${gg} unidades` }; }, { corner: "Atingimento de unidades", color: "var(--jv-good)", label: "Meta de unidades por categoria" }) + note("Cada célula: unidades faturadas ÷ meta de unidades da categoria."); }
        return badge + X4.bullet(rows.sort((a, b) => b.actual / b.goal - a.actual / a.goal), { f });
      } });
  }
  // Comparativo entre vendedores (uso gerencial).
  function fCmp(q) {
    const pid = "f-cmp"; const raw = (q[pid + ".s"] || "").split(",").filter(id => D.SELLERS.some(s => s.id === id));
    return P(q, { id: pid, title: "Comparativo entre vendedores", q: "Como os vendedores escolhidos se comparam no período?", unit: unitTag("billed", "R$ faturado") + " · máquinas · meta", basis: "data da Encerrada", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED", fields: ["b", "g"],
      views: [["linha", "Dia a dia", "line"], ["barras", "Totais", "hbars"], ["radar", "Radar", "radar"], ["tabela", "Tabela", "table"]],
      body: ctx => {
        const list = A.closedOps({ ...ctx.q, seller: "" }, ctx.r);
        const rank = D.SELLERS.map(s => ({ s, v: sum(list.filter(o => o.seller === s.id), o => o.equipmentValue) })).sort((a, b) => b.v - a.v);
        const ids = raw.length >= 2 ? raw : rank.slice(0, 3).map(x => x.s.id);
        const chips = `<div class="selchips" role="group" aria-label="Vendedores comparados">${D.SELLERS.map(s => { const on = ids.includes(s.id); const nx = on ? ids.filter(x => x !== s.id) : ids.concat(s.id); return `<button type="button" style="--c:${A.SELLER_COLOR[s.id]}" aria-pressed="${on}" data-q="${pid}.s" data-v="${nx.length >= 2 ? nx.join(",") : ids.join(",")}" ${on && ids.length <= 2 ? 'title="Mantenha pelo menos dois"' : ""}><span class="av4" style="--c:${A.SELLER_COLOR[s.id]}">${ini(s.label)}</span>${esc(s.label)}</button>`; }).join("")}</div>`;
        const mnote = `<div class="mgr-note">${icon("shield")}Uso gerencial: este painel não aparece para o perfil vendedor (permissão própria).</div>`;
        const goals = A.goalsIn({ ...ctx.q, seller: "" }, ctx.r);
        const stat = id => { const l = list.filter(o => o.seller === id), g = sum(goals.filter(x => x.seller === id), x => x.value), u = sum(l, o => o.units), v = sum(l, o => o.equipmentValue); return { l, v, u, n: l.length, t: u ? v / u : 0, g, gp: g ? v / g : null, cyc: avg(l, o => (Date.parse(o.closedAt) - Date.parse(o.oppCreatedAt)) / 864e5) }; };
        const S2 = ids.map(id => ({ id, label: seller(id), color: A.SELLER_COLOR[id], ...stat(id) }));
        let v;
        if (ctx.view === "barras") v = ["v", "u", "gp"].map(k => `<div class="sub-head"><span class="h3">${{ v: "R$ faturado", u: "Máquinas", gp: "Meta atingida (prévia)" }[k]}</span></div>` + X4.hb(S2.map(x => ({ label: x.label, v: k === "gp" ? (x.gp || 0) * 100 : x[k], text: k === "v" ? F.brlc(x.v) : k === "u" ? x.u + " un." : F.pct(x.gp), avatar: ini(x.label), color: x.color, attrs: SET(`fc-${k}-${x.id}`, { title: "Encerradas · " + x.label, unit: "operação", kind: "op", rows: x.l }) })), { dense: true })).join("");
        else if (ctx.view === "radar") { const ax = [["v", "R$ faturado"], ["u", "Máquinas"], ["n", "Operações"], ["t", "Ticket"], ["gp", "Meta"]]; const mx = Object.fromEntries(ax.map(([k]) => [k, Math.max(1e-9, ...S2.map(x => x[k] || 0))])); v = X4.spider(ax.map(([, l]) => ({ label: l })), S2.map(x => ({ label: x.label, color: x.color, v: ax.map(([k]) => (x[k] || 0) / mx[k]), t: [F.brlc(x.v), x.u + " un.", x.n + " operações", F.brlc(x.t), F.pct(x.gp)] })), { size: 320 }); }
        else if (ctx.view === "tabela") v = `<div class="tbl-wrap"><table class="tbl tbl--cards"><thead><tr><th>Vendedor</th><th class="r">R$ faturado</th><th class="r">Máquinas</th><th class="r">Operações</th><th class="r">Ticket por máquina</th><th class="r">Ciclo de venda</th><th class="r">Meta (prévia)</th></tr></thead><tbody>${S2.map(x => `<tr><td data-l="Vendedor"><span class="av4" style="--c:${x.color};display:inline-grid;margin-right:6px">${ini(x.label)}</span>${esc(x.label)}</td><td data-l="R$" class="r">${F.brlc(x.v)}</td><td data-l="Máquinas" class="r">${x.u}</td><td data-l="Operações" class="r">${x.n}</td><td data-l="Ticket" class="r">${F.brlc(x.t)}</td><td data-l="Ciclo" class="r">${x.cyc == null ? "—" : F.int(x.cyc) + " d"}</td><td data-l="Meta" class="r">${F.pct(x.gp)}</td></tr>`).join("")}</tbody></table></div>`;
        else { const b0 = IRF.buckets(ctx.r); v = X4.ts(S2.map(x => ({ label: x.label, color: x.color, pts: pts(IRF.series(x.l, o => o.closedAt, ctx.r, o => o.equipmentValue, b0.gran)) })), { mode: "cum", f: "brlc", h: 230, peak: false, label: "Faturado acumulado por vendedor" }) + note(`Acumulado do período, faixa de ${granTxt(b0.gran)}. Período: ${ctx.r.label}.`); }
        return mnote + chips + v;
      } });
  }
  // Caminho do dinheiro (substitui a legenda "Qual R$ é qual").
  function fPath(q) {
    return P(q, { id: "f-path", title: "Caminho do dinheiro", q: "Do pipeline ao faturado: quanto valor existe em cada etapa?", unit: "cada coluna com a sua unidade monetária", basis: "pipeline e ganha: criação da oportunidade · equipamento: operações abertas no período · faturado: Encerrada", source: "canonical", sourceId: "UNIT-01",
      views: [["caminho", "Caminho", "workflow"], ["funil", "Funil", "funnel"]],
      cmpSummary: ctx => { const a = A.closedOps(ctx.q, ctx.r), b = A.closedOps(ctx.cq, ctx.cr); return { label: "Faturado", cur: sum(a, o => o.equipmentValue), prev: sum(b, o => o.equipmentValue), fmt: F.brlc }; },
      body: ctx => {
        const cm = M.commercialMetrics(A.opps(ctx.q)), ops = M.ops(ctx.q, "createdAt"), cl = A.closedOps(ctx.q, ctx.r);
        const st = [
          { u: "pipeline", label: "R$ pipeline", v: cm.pipeline, s: `${cm.openCount} oportunidades abertas`, d: "Valor atual das abertas", c: "var(--jv-x-money-pipeline)", rows: cm.open, kind: "opp" },
          { u: "won", label: "R$ venda ganha", v: cm.wonAmount, s: `${cm.wonCount} ganhas`, d: "Oportunidade ganha", c: "var(--jv-x-money-won)", rows: cm.won, kind: "opp" },
          { u: "equipment", label: "R$ equipamento", v: sum(ops, o => o.equipmentValue), s: `${ops.length} operações abertas no período`, d: "Equipamento na operação", c: "var(--jv-x-money-equipment, var(--jv-indigo))", rows: ops, kind: "op" },
          { u: "billed", label: "R$ faturado", v: sum(cl, o => o.equipmentValue), s: `${cl.length} encerradas`, d: "Operação entrou em Encerrada", c: "var(--jv-x-money-billed)", rows: cl, kind: "op" }];
        const mx = Math.max(1, ...st.map(x => x.v));
        st.forEach(x => { x.attrs = SET("fp-" + x.u, { title: x.label, unit: x.kind === "opp" ? "oportunidade" : "operação", kind: x.kind, rows: x.rows }); });
        if (ctx.view === "funil") return X4.funnel(st.map(x => ({ label: x.label, v: x.v, text: F.brlc(x.v), sub: x.s, color: x.c, attrs: x.attrs })), { conv: false, label: "Caminho do dinheiro" }) + note("As quatro faixas não são uma conversão direta: cada uma tem a sua base de data. O desenho mostra a ordem do caminho.");
        return `<div class="path4">${st.map(x => `<button type="button" class="path4__s" style="--c:${x.c}" ${x.attrs}><small>${unitTag(x.u, x.label)}</small><span class="path4__lv" style="--lv:${(x.v / mx).toFixed(3)}"><i></i></span><b>${F.brlc(x.v)}</b><span>${x.s}</span><em>${x.d}</em></button>`).join("")}</div>` + note("Cores fixas de cada unidade monetária. Elas nunca se somam entre si.");
      } });
  }
  function fFin(q) {
    const pid = "f-fin", all = q[pid + ".i.v"] === "on";
    return P(q, { id: pid, title: "Volume financiado", q: "Quanto cada instituição financiou nas operações faturadas?", unit: unitTag("received", "R$ financiado · valor do equipamento"), basis: "data da Encerrada · banco do desembolso", source: "canonical", sourceId: "BANK_LINK_DISBURSED",
      views: [["barras", "Por banco", "hbars"], ["anel", "Participação", "pie"], ["tempo", "No tempo", "line"]],
      tools: () => seg(pid + ".i.v", all ? "on" : "off", [["off", "Ativas"], ["on", "Todas"]], "Instituições"),
      cmpSummary: ctx => { const a = A.financed(ctx.q, ctx.r), b = A.financed(ctx.cq, ctx.cr); return { label: "Financiado", cur: sum(a, x => x.op.equipmentValue), prev: sum(b, x => x.op.equipmentValue), fmt: F.brlc }; },
      body: ctx => {
        const a = A.financed(ctx.q, ctx.r), b = ctx.cq ? A.financed(ctx.cq, ctx.cr) : null; if (!a.length) return empty("Nenhum desembolso no período");
        const banks = D.BANKS.filter(k => k.active || all);
        const items = banks.map(k => { const l = a.filter(x => x.link.bank === k.id); return { id: k.id, label: k.label + (k.active ? "" : " · inativa"), sub: plural(l.length, "desembolso", "desembolsos"), v: sum(l, x => x.op.equipmentValue), prev: b ? sum(b.filter(x => x.link.bank === k.id), x => x.op.equipmentValue) : null, logo: k.logo, color: BANKC[k.id], l, attrs: SET("ff-" + k.id, { title: "Financiadas · " + k.label, unit: "operação", kind: "op", rows: l.map(x => x.op), money: ["financed", o => o.equipmentValue] }) }; }).sort((x, y) => y.v - x.v);
        const n = note("R$ = valor do equipamento das operações encerradas cujo vínculo com o banco foi Desembolsado. O valor contratado por banco pede campo novo (FAT-DEP-FIN).");
        if (ctx.view === "anel") return X4.ring(items.filter(i => i.v).map(i => ({ label: i.label, v: i.v, color: i.color, note: i.sub, attrs: i.attrs })), { f: "brlc", centerText: F.brlc(sum(items, i => i.v)), center: "financiado" }) + n;
        if (ctx.view === "tempo") { const b0 = IRF.buckets(ctx.r); return X4.ts(items.filter(i => i.v).map(i => ({ label: i.label, color: i.color, pts: pts(IRF.series(i.l, x => x.op.closedAt, ctx.r, x => x.op.equipmentValue, b0.gran)) })), { mode: "line", f: "brlc", h: 200, peak: false, label: "Financiado por banco no tempo" }) + n; }
        return X4.hb(items, { f: "brlc", cmpLegend: !!b }) + n;
      } });
  }
  function fModBank(q) {
    return P(q, { id: "f-modbank", title: "Modalidade × banco", q: "Como foi pago o que faturamos?", unit: unitTag("billed", "R$ faturado"), basis: "data da Encerrada", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED",
      views: [["matriz", "Matriz", "grid"], ["comp", "Composição", "hbars"]],
      body: ctx => {
        const cl = A.closedOps(ctx.q, ctx.r); if (!cl.length) return empty("Nada faturado no período");
        const bankOf = o => { const l = o.banks.find(x => x.current === "DISBURSED"); return l ? l.bank : "none"; };
        const cols = D.BANKS.filter(b => cl.some(o => bankOf(o) === b.id)).map(b => ({ id: b.id, label: b.label, short: b.label.replace("Banco ", "") })).concat([{ id: "none", label: "Sem banco (interno ou à vista)", short: "Sem banco" }]);
        const rows = D.MODALITIES.map(m => ({ id: m.id, label: m.label })).filter(r => cl.some(o => o.modality === r.id));
        const L2 = (r, c) => cl.filter(o => o.modality === r.id && bankOf(o) === c.id);
        if (ctx.view === "comp") return X4.stackRows(rows.map(r => ({ id: r.id, label: r.label, segs: Object.fromEntries(cols.map(c => [c.id, sum(L2(r, c), o => o.equipmentValue)])) })), cols.map((c, i) => ({ id: c.id, label: c.label, color: c.id === "none" ? "var(--jv-fg-3)" : BANKC[c.id] || X4.CAT[i] })), { f: "brlc", segAttr: (r, p) => SET(`fmb-${r.id}-${p.id}`, { title: `${r.label} · ${p.label}`, unit: "operação", kind: "op", rows: L2(r, p) }) });
        const mcols = rows.map(r => ({ id: r.id, label: r.label, short: r.label.split(" ")[0] }));
        return X4.grid(cols.map(c => ({ id: c.id, label: c.label })), mcols, (b, m) => { const l = L2(m, b), v = sum(l, o => o.equipmentValue); return { v, text: v ? F.brlc(v).replace("R$ ", "") : "", tip: `${F.brlc(v)} · ${plural(l.length, "operação", "operações")}`, attrs: SET(`fmb-${m.id}-${b.id}`, { title: `${m.label} · ${b.label}`, unit: "operação", kind: "op", rows: l }) }; }, { corner: "Banco × modalidade", total: b => F.brlc(sum(cl.filter(o => bankOf(o) === b.id), o => o.equipmentValue)), color: "var(--jv-x-money-billed)", label: "Faturado por banco e modalidade" }) + note("Banco = instituição que registrou o desembolso. Parcelamento interno e recursos do cliente não passam por banco.");
      } });
  }
  function fTicket(q) {
    const pid = "f-ticket", m = pick(q, pid + ".m.v", ["machine", "op"]);
    const cyc = o => (Date.parse(o.closedAt) - Date.parse(o.oppCreatedAt)) / 864e5;
    return P(q, { id: pid, title: "Ticket médio e ciclo de venda", q: "Quanto vale cada venda e quanto tempo ela leva?", unit: "R$ por máquina ou por operação · dias", basis: "data da Encerrada", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED",
      views: [["ticket", "Ticket no tempo", "line"], ["ciclo", "Ciclo de venda", "hbars"], ["disp", "Valor × ciclo", "scatter"]],
      tools: () => seg(pid + ".m.v", m, [["machine", "Por máquina"], ["op", "Por operação"]], "Ticket"),
      cmpSummary: ctx => { const a = A.closedOps(ctx.q, ctx.r), b = A.closedOps(ctx.cq, ctx.cr); const t = l => m === "op" ? (l.length ? sum(l, o => o.equipmentValue) / l.length : null) : (sum(l, o => o.units) ? sum(l, o => o.equipmentValue) / sum(l, o => o.units) : null); return [{ label: "Ticket", cur: t(a), prev: t(b), fmt: F.brlc }, { label: "Ciclo médio", cur: avg(a, cyc), prev: avg(b, cyc), fmt: v => v == null ? "—" : F.int(v) + " d", invert: true }]; },
      body: ctx => {
        const cl = A.closedOps(ctx.q, ctx.r); if (!cl.length) return empty("Nada faturado no período");
        if (ctx.view === "ciclo") { const B = [["até 30 dias", 0, 30], ["31 a 60", 31, 60], ["61 a 90", 61, 90], ["mais de 90", 91, 1e9]]; return X4.hb(B.map(([l, a, b], i) => { const x = cl.filter(o => cyc(o) >= a && cyc(o) < b + 1); return { label: l, v: x.length, sub: F.brlc(sum(x, o => o.equipmentValue)), color: i === 3 ? "var(--jv-warn)" : X4.CAT[i], attrs: SET("ft-c-" + i, { title: "Ciclo " + l, unit: "operação", kind: "op", rows: x }) }; })) + note(`Ciclo = dias da criação da oportunidade até Encerrada. Média: ${F.int(avg(cl, cyc))} dias.`); }
        if (ctx.view === "disp") return X4.scatter(cl.map(o => ({ x: cyc(o), y: o.equipmentValue, r: 6 + o.units * 2, color: MODC[o.modality], tipT: o.id + " · " + o.client, tip: `${F.int(cyc(o))} dias · ${F.brlc(o.equipmentValue)} · ${o.units} máquinas`, attrs: SET("ft-d-" + o.id, { title: o.id, unit: "operação", kind: "op", rows: [o] }) })), { fx: v => F.int(v) + " d", fy: "brlc", xmin: 0, yLabel: "valor", xLabel: "ciclo de venda (dias) →", h: 240, label: "Valor × ciclo" }) + `<div class="lg4">${D.MODALITIES.map(x => `<span><i style="--c:${MODC[x.id]}"></i>${esc(x.label)}</span>`).join("")}</div>`;
        const b = IRF.buckets(ctx.r, ctx.r.days > 62 ? "month" : "week"); const inB = (o, x) => { const d = C.localDate(o.closedAt); return d >= x.from && d <= x.to; };
        const t = (l) => m === "op" ? (l.length ? sum(l, o => o.equipmentValue) / l.length : 0) : (sum(l, o => o.units) ? sum(l, o => o.equipmentValue) / sum(l, o => o.units) : 0);
        const sets = [{ label: m === "op" ? "Ticket por operação" : "Ticket por máquina", color: "var(--jv-x-money-billed)", pts: b.map(x => ({ id: x.id, label: x.label, v: t(cl.filter(o => inB(o, x))) })) }];
        if (ctx.cq) { const pb = IRF.buckets(ctx.cr, b.gran), pcl = A.closedOps(ctx.cq, ctx.cr); sets.push({ label: "Comparado", dash: true, color: "var(--jv-fg-2)", pts: pb.map(x => ({ id: x.id, label: x.label, v: t(pcl.filter(o => inB(o, x))) })) }); }
        return X4.ts(sets, { mode: "line", f: "brlc", h: 200, label: "Ticket médio" });
      } });
  }
  function fAbc(q) {
    return P(q, { id: "f-abc", title: "Curva ABC de clientes", q: "Quais clientes concentram o faturamento?", unit: unitTag("billed", "R$ faturado") + " por cliente", basis: "data da Encerrada", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED",
      views: [["curva", "Curva", "hbars"], ["classes", "Classes", "pie"]],
      body: ctx => {
        const cl = A.closedOps(ctx.q, ctx.r); if (!cl.length) return empty("Nada faturado no período");
        const tot = sum(cl, o => o.equipmentValue); let acc = 0;
        const cs = [...new Set(cl.map(o => o.clientId))].map(id => { const l = cl.filter(o => o.clientId === id); return { id, label: l[0].client, l, v: sum(l, o => o.equipmentValue) }; }).sort((a, b) => b.v - a.v).map(x => { acc += x.v; return { ...x, cum: acc / tot, cls: acc / tot <= 0.8 || acc === x.v ? "A" : acc / tot <= 0.95 ? "B" : "C" }; });
        const CC = { A: "var(--jv-arc)", B: "var(--jv-violet)", C: "var(--jv-fg-3)" };
        if (ctx.view === "classes") return X4.ring(["A", "B", "C"].map(k => { const x = cs.filter(c => c.cls === k); return { label: `Classe ${k} · ${x.length} clientes`, v: sum(x, c => c.v), color: CC[k], note: k === "A" ? "até 80% do faturado" : k === "B" ? "de 80% a 95%" : "últimos 5%", attrs: SET("fa-" + k, { title: "Clientes classe " + k, unit: "operação", kind: "op", rows: x.flatMap(c => c.l) }) }; }), { f: "brlc", centerText: F.int(cs.length), center: "clientes" });
        return X4.hb(cs.slice(0, 8).map(c => ({ label: c.label, sub: `classe ${c.cls} · ${F.pct(c.cum)} acumulado · ${plural(c.l.length, "operação", "operações")}`, v: c.v, text: F.brlc(c.v), color: CC[c.cls], attrs: SET("fa-c-" + c.id, { title: c.label, unit: "operação", kind: "op", rows: c.l }) })), { rank: true, dense: true, f: "brlc" }) + (cs.length > 8 ? note(`Mostrando 8 de ${cs.length} clientes. Classe A: ${cs.filter(c => c.cls === "A").length} clientes somam até 80% do faturado.`) : "");
      } });
  }
  function fNewRec(q) {
    return P(q, { id: "f-newrec", title: "Clientes novos × recorrentes", q: "Estamos vendendo para clientes novos ou para a mesma base?", unit: "cliente faturado", basis: "data da Encerrada · primeira compra de cada cliente", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED",
      views: [["colunas", "No tempo", "bars"], ["anel", "Participação", "pie"]],
      cmpSummary: ctx => { const nr = (qq, r) => { const cl = A.closedOps(qq, r), first = firstBuy(qq); return cl.filter(o => first[o.clientId] >= r.from).length; }; return { label: "Operações de clientes novos", cur: nr(ctx.q, ctx.r), prev: nr(ctx.cq, ctx.cr), fmt: F.int }; },
      body: ctx => {
        const cl = A.closedOps(ctx.q, ctx.r); if (!cl.length) return empty("Nada faturado no período");
        const first = firstBuy(ctx.q); const isNew = o => first[o.clientId] >= ctx.r.from;
        const nw = cl.filter(isNew), rc = cl.filter(o => !isNew(o));
        if (ctx.view === "anel") return X4.ring([{ label: `Novos · ${new Set(nw.map(o => o.clientId)).size} clientes`, v: sum(nw, o => o.equipmentValue), color: "var(--jv-teal)", note: "primeira compra no período", attrs: SET("fn-n", { title: "Clientes novos", unit: "operação", kind: "op", rows: nw }) }, { label: `Recorrentes · ${new Set(rc.map(o => o.clientId)).size} clientes`, v: sum(rc, o => o.equipmentValue), color: "var(--jv-indigo)", note: "já compraram antes", attrs: SET("fn-r", { title: "Clientes recorrentes", unit: "operação", kind: "op", rows: rc }) }], { f: "brlc", centerText: F.int(new Set(cl.map(o => o.clientId)).size), center: "clientes" });
        const b0 = IRF.buckets(ctx.r);
        return X4.ts([{ label: "Novos", color: "var(--jv-teal)", pts: pts(IRF.series(nw, o => o.closedAt, ctx.r, o => o.equipmentValue, b0.gran)) }, { label: "Recorrentes", color: "var(--jv-indigo)", pts: pts(IRF.series(rc, o => o.closedAt, ctx.r, o => o.equipmentValue, b0.gran)) }], { mode: "cols", f: "brlc", h: 200, label: "Novos e recorrentes no tempo" }) + note(`Novo = primeira operação encerrada do cliente dentro da janela. Uma faixa = ${granTxt(b0.gran)}.`);
      } });
  }
  function firstBuy(qq) { const out = {}; scope({ ...qq, seller: "", branch: "", mgr: "" }).filter(o => o.closedAt).forEach(o => { const d = C.localDate(o.closedAt); if (!out[o.clientId] || d < out[o.clientId]) out[o.clientId] = d; }); return out; }
  function fUf(q) {
    return P(q, { id: "f-uf", title: "Mapa por UF", q: "Onde estão os clientes que faturamos?", unit: unitTag("billed", "R$ faturado"), basis: "data da Encerrada · UF do cliente", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED",
      views: [["mapa", "Mapa", "map"], ["rank", "Ranking", "hbars"]],
      body: ctx => {
        const cl = A.closedOps(ctx.q, ctx.r); if (!cl.length) return empty("Nada faturado no período");
        const ufs = [...new Set(cl.map(o => o.uf))].map(uf => { const l = cl.filter(o => o.uf === uf); return { uf, l, v: sum(l, o => o.equipmentValue), cities: [...new Set(l.map(o => o.city))] }; }).sort((a, b) => b.v - a.v);
        const at = u => SET("fu-" + u.uf, { title: "Faturado em " + u.uf, unit: "operação", kind: "op", rows: u.l });
        if (ctx.view === "rank") return X4.hb(ufs.map(u => ({ label: u.uf, sub: u.cities.slice(0, 3).join(", ") + (u.cities.length > 3 ? "…" : ""), v: u.v, text: F.brlc(u.v), color: "var(--jv-teal)", attrs: at(u) })), { rank: true, dense: true, f: "brlc" });
        return X4.tiles(Object.fromEntries(ufs.map(u => [u.uf, { v: u.v, text: F.brlc(u.v), short: F.brlc(u.v).replace("R$ ", ""), sub: `${plural(u.l.length, "operação", "operações")} · ${u.cities.join(", ")}`, attrs: at(u) }])), { label: "Faturado por UF" });
      } });
  }
  function fSeason(q) {
    return P(q, { id: "f-season", title: "Sazonalidade", q: "Que meses vendem mais, ano contra ano?", unit: unitTag("billed", "R$ faturado"), period: false, periodText: "Todo o histórico, mês a mês", periodNote: "Sazonalidade usa todo o histórico; o período não se aplica. Filial, gerência e vendedor valem.", basis: "mês da Encerrada", source: "canonical", sourceId: "OPERATION_LIFECYCLE_CLOSED",
      views: [["matriz", "Mês × ano", "grid"], ["linhas", "Linhas por ano", "line"]],
      body: ctx => {
        const cl = scope(ctx.f).filter(o => o.closedAt); if (!cl.length) return empty("Nada faturado");
        const yrs = [...new Set(cl.map(o => o.closedAt.slice(0, 4)))].sort(); const MS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
        const L3 = (y, i) => cl.filter(o => C.monthKey(o.closedAt) === `${y}-${String(i + 1).padStart(2, "0")}`);
        if (ctx.view === "linhas") return X4.ts(yrs.map((y, k) => ({ label: y, color: k === yrs.length - 1 ? "var(--jv-x-money-billed)" : k === yrs.length - 2 ? "var(--jv-violet)" : "var(--jv-fg-3)", pts: MS.map((m, i) => ({ id: y + i, label: m, long: m + "/" + y, v: sum(L3(y, i), o => o.equipmentValue) })) })), { mode: "line", f: "brlc", h: 220, peak: false, ticks: 12, label: "Faturado por mês, um ano por linha" });
        return X4.grid(yrs.map(y => ({ id: y, label: y })), MS.map((m, i) => ({ id: i, label: m })), (r, c) => { const l = L3(r.id, c.id), v = sum(l, o => o.equipmentValue); return { v, text: v ? F.brlc(v).replace("R$ ", "").replace(" mi", "m").replace(" mil", "k") : "", tip: `${F.brlc(v)} · ${plural(l.length, "operação", "operações")}`, attrs: SET(`fs-${r.id}-${c.id}`, { title: `Faturado em ${MS[c.id]}/${r.id}`, unit: "operação", kind: "op", rows: l }) }; }, { corner: "Ano × mês", total: r => F.brlc(sum(cl.filter(o => o.closedAt.startsWith(r.id)), o => o.equipmentValue)), color: "var(--jv-x-money-billed)" }) + note("Ano corrente até hoje. Os dados sintéticos começam em out/2024.");
      } });
  }
  function fEntry(q) {
    const pid = "f-entry";
    return P(q, { id: pid, title: "Entrada na etapa Faturamento", q: "Quantas operações chegaram à etapa Faturamento?", unit: "entrada na etapa (evento operacional)", basis: "data da transição", source: "canonical", sourceId: "lifecycle transitions",
      views: [["cols", "Colunas", "bars"], ["line", "Linha", "line"], ["cum", "Acumulado", "cum"]],
      cmpSummary: ctx => { const f = (qq, r) => scope(qq).filter(o => o.billingEnteredAt && IRF.inR(o.billingEnteredAt, r)).length; return { label: "Entradas", cur: f(ctx.q, ctx.r), prev: f(ctx.cq, ctx.cr), fmt: F.int }; },
      body: ctx => tsCmp(ctx, (qq, r) => scope(qq).filter(o => o.billingEnteredAt), o => o.billingEnteredAt, () => 1, { mode: ctx.view, color: "var(--jv-stage-billing)", h: 190, label: "Entradas na etapa Faturamento", key: "fe", title: "Entradas em Faturamento", unit: "operação", kind: "op" }),
      foot: "Evento operacional: a operação chegou na etapa. O faturado é a Encerrada (painel do topo)." });
  }

  function content(q, path) { const t = tabOf(path); return { comercial, operacoes, documentacao, faturamento }[t.id](q); }
  window.VIEW_BI = { TABS, tabOf, head, recorte, content, keysFor: path => tabOf(path).keys, local: ["sort", "pg", "req", "focus"], eyebrow: "Comercial", name: "BI comercial" };
})();
