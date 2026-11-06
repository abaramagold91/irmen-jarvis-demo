/*
 * FX3 · componentes da REV03 do Dashboard (proposta).
 * Tendência mensal rotulada, matriz de permanência (alternativa ao radar), escada de etapas em LED,
 * tanques de etapa, medidor de aprovação, mosaico de decisões, velas mensais, baldes de prazo
 * e as três prévias de integração pendente (meta, faturado, volume financiado por instituição).
 * Tudo clicável abre registros (data-drill) ou muda o recorte local (data-q). Movimento some com movimento reduzido.
 */
(function () {
  "use strict";
  const C = window.IRC; const { D, L, F, esc, icon } = C;
  let uid = 0; const nid = (p) => p + (++uid).toString(36);
  const motion = () => !C.reduced();
  const STAGE = window.FX.STAGE;
  const MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const mes = (key) => MES[+key.split("-")[1] - 1];
  const pol = (cx, cy, r, a) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
  const arc = (cx, cy, r, a0, a1) => { const [x0, y0] = pol(cx, cy, r, a0), [x1, y1] = pol(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  const glow = (id, sd = 3) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  // ---------- Tendência mensal rotulada (substitui a linha sem marcação) ----------
  // Colunas por mês com o rótulo do mês embaixo, valor no mês atual e legenda do que é contado.
  function trend(months, values, o = {}) {
    const max = Math.max(1, ...values), last = values.length - 1;
    return `<span class="tr3" style="--c:${o.color || "var(--jv-arc)"}" role="img" aria-label="${esc(o.caption)}: ${months.map((m, i) => mes(m) + " " + values[i]).join(", ")}">
      <span class="tr3__cap">${esc(o.caption)}</span>
      <span class="tr3__cols">${values.map((v, i) => `<span class="tr3__c" data-last="${i === last}" data-tip="${esc(F.month(months[i]))}|${F.int(v)} ${esc(o.unit || "")}"><b>${i === last || i === 0 ? F.int(v) : ""}</b><i style="height:${Math.max(6, (v / max) * 100).toFixed(0)}%"></i><em>${mes(months[i])}</em></span>`).join("")}</span></span>`;
  }

  // ---------- Matriz de permanência (visão "Painel", alternativa contida ao radar) ----------
  const BUCKETS = [["0-24", "até 24 h", 0, 24], ["24-48", "24 a 48 h", 24, 48], ["48-72", "48 a 72 h", 48, 72], ["72+", "mais de 72 h", 72, 1e9]];
  const inB = (h, b) => h >= b[2] && h < b[3];
  function matrix(ops, o = {}) {
    const states = ["received", "in_review", "formalization", "billing"];
    const cell = (s, b) => ops.filter(x => x.state === s && inB(x.residenceHours, b));
    const max = Math.max(1, ...states.flatMap(s => BUCKETS.map(b => cell(s, b).length)));
    const eqMax = Math.max(1, ...states.map(s => ops.filter(x => x.state === s).reduce((a, x) => a + x.equipmentValue, 0)));
    const head = `<div class="mx__h"><span class="mx__corner">Etapa</span>${BUCKETS.map((b, i) => `<span class="mx__bh" data-late="${i === 3}">${b[1]}</span>`).join("")}<span class="mx__bh mx__bh--t">Total · R$ equipamento</span></div>`;
    const rows = states.map((s, si) => {
      const all = ops.filter(x => x.state === s), eq = all.reduce((a, x) => a + x.equipmentValue, 0);
      return `<div class="mx__r" style="--c:${STAGE[s]};--i:${si}">
        <button type="button" class="mx__st" data-drill="ops_state" data-dv="${s}" aria-label="${esc(L.lc[s].label)}: ${all.length} operações. Abrir registros"><span class="mx__idx mono">${L.lc[s].step.replace("Etapa ", "")}</span><span>${esc(L.lc[s].label)}</span></button>
        ${BUCKETS.map((b, bi) => { const n = cell(s, b).length; return `<button type="button" class="mx__c" data-zero="${!n}" data-late="${bi === 3}" style="--a:${n ? (.12 + (n / max) * .6).toFixed(2) : 0}" data-drill="ops_age" data-dv="${s}|${b[0]}" aria-label="${esc(L.lc[s].label)}, ${b[1]}: ${n} operações. Abrir registros" data-tip="${esc(L.lc[s].label)} · ${b[1]}|${n} operações · ${F.brlc(cell(s, b).reduce((a, x) => a + x.equipmentValue, 0))} equip."><b data-k="mx-${s}-${b[0]}" data-v="${n}" data-f="int">${n || "·"}</b></button>`; }).join("")}
        <button type="button" class="mx__t" data-drill="ops_state" data-dv="${s}" aria-label="${esc(L.lc[s].label)}: ${all.length} operações, ${F.brlc(eq)}. Abrir registros"><b data-k="mx-t-${s}" data-v="${all.length}" data-f="int">${all.length}</b><span class="mx__bar"><i style="width:${((eq / eqMax) * 100).toFixed(1)}%"></i></span><small>${F.brlc(eq)}</small></button></div>`;
    }).join("");
    const foot = `<div class="mx__f"><span class="mx__corner">Total por faixa</span>${BUCKETS.map(b => `<span>${ops.filter(x => inB(x.residenceHours, b)).length}</span>`).join("")}<span><b>${ops.length}</b></span></div>`;
    return `<div class="mx" role="group" aria-label="${esc(o.label || "Operações por etapa e horas na etapa")}">${head}${rows}${foot}
      <p class="mx__note">Cada célula conta operações pela etapa atual e pelas horas que estão nela. Quanto mais forte a cor, mais operações. A coluna de mais de 72 h mostra o que está parado há mais tempo.</p></div>`;
  }

  // ---------- Escada de etapas em LED (resumo comercial) ----------
  function ladder(items, o = {}) {
    const max = Math.max(1, ...items.map(i => i.v)), N = 28, total = items.reduce((s, i) => s + i.v, 0) || 1;
    return `<ol class="ld3" aria-label="${esc(o.label || "")}">${items.map((it, i) => { const lit = it.v ? Math.max(1, Math.round((it.v / max) * N)) : 0; return `<li style="--i:${i}"><button type="button" class="ld3__row" data-drill="${o.drill}" data-dv="${esc(it.id)}" aria-label="${esc(it.full)}: ${esc(it.text)}, ${esc(it.sub)}. Abrir registros" data-tip="${esc(it.full)}|${esc(it.text)} · ${esc(it.sub)} · ${F.pct(it.v / total)} do aberto">
      <span class="ld3__idx mono">${String(i + 1).padStart(2, "0")}</span><span class="ld3__name">${esc(it.full)}</span>
      <span class="ld3__led" aria-hidden="true">${Array.from({ length: N }, (_, k) => `<i data-on="${k < lit}" style="--k:${k}"></i>`).join("")}</span>
      <span class="ld3__v"><b data-k="${o.k}-${esc(it.id)}" data-v="${it.v}" data-f="${o.f || "int"}">${esc(it.text)}</b><small>${esc(it.sub)}</small></span>
      <span class="ld3__pct mono">${F.pct(it.v / total)}</span></button></li>`; }).join("")}</ol>`;
  }

  // ---------- Tanques de etapa (resumo operacional) ----------
  function tanks(stages, o = {}) {
    const W = 150, H = 300, tw = 104, th = 178, y0 = 30, X = (W - tw) / 2;
    const max = Math.max(1, ...stages.map(s => s.v));
    const one = (s, i) => {
      const lvl = s.v ? Math.max(.08, s.v / max) : 0, fh = th * lvl, fy = y0 + th - fh, gid = nid("tg"), fl = nid("tk");
      const ticks = Array.from({ length: 5 }, (_, k) => { const ty = y0 + (th / 4) * k; return `<line x1="${X - 9}" x2="${X - 3}" y1="${ty}" y2="${ty}" class="tk__tick"/>`; }).join("");
      return `<svg class="tk__g" viewBox="0 0 ${W} ${H}" style="--c:${s.color};--i:${i}" data-drill="${o.drill}" data-dv="${s.id}" tabindex="0" role="button" aria-label="${esc(s.label)}: ${s.v} operações, ${esc(s.money)}, ${esc(s.res)}. Abrir registros" data-tip="${esc(s.label)}|${s.v} operações · ${esc(s.money)} · ${esc(s.res)}">
        <defs>${glow(fl, 2)}<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color}" stop-opacity=".85"/><stop offset="1" stop-color="${s.color}" stop-opacity=".18"/></linearGradient><clipPath id="${gid}c"><rect x="${X}" y="${y0}" width="${tw}" height="${th}" rx="12"/></clipPath></defs>
        <rect x="0" y="0" width="${W}" height="${H}" fill="transparent"/>
        <text x="${W / 2}" y="16" text-anchor="middle" class="tk__step">${esc(s.step)}</text>
        ${ticks}
        <rect x="${X}" y="${y0}" width="${tw}" height="${th}" rx="12" class="tk__glass"/>
        <g clip-path="url(#${gid}c)">
          <rect x="${X}" y="${fy.toFixed(1)}" width="${tw}" height="${fh.toFixed(1)}" fill="url(#${gid})" class="tk__fill"/>
          ${s.v ? `<path d="M${X - tw},${fy.toFixed(1)} q${tw / 4},-5 ${tw / 2},0 t${tw / 2},0 t${tw / 2},0 t${tw / 2},0 t${tw / 2},0 V${y0 + th} H${X - tw} Z" fill="${s.color}" fill-opacity=".35" class="tk__wave"/>` : ""}
          <line x1="${X}" x2="${X + tw}" y1="${fy.toFixed(1)}" y2="${fy.toFixed(1)}" stroke="${s.color}" stroke-width="2" filter="url(#${fl})"/>
        </g>
        <rect x="${X}" y="${y0}" width="${tw}" height="${th}" rx="12" class="tk__rim"/>
        <text x="${W / 2}" y="${y0 + 46}" text-anchor="middle" class="tk__v" data-k="${o.k}-${s.id}" data-v="${s.v}" data-f="int">${F.int(s.v)}</text>
        <text x="${W / 2}" y="${y0 + 64}" text-anchor="middle" class="tk__u">operações</text>
        <text x="${W / 2}" y="${y0 + th + 24}" text-anchor="middle" class="tk__lab">${esc(s.label)}</text>
        <text x="${W / 2}" y="${y0 + th + 44}" text-anchor="middle" class="tk__m">${esc(s.money)}</text>
        <text x="${W / 2}" y="${y0 + th + 62}" text-anchor="middle" class="tk__h">${esc(s.res)}</text></svg>`;
    };
    const chev = i => `<span class="tk__chev" aria-hidden="true" style="--i:${i}"><svg viewBox="0 0 24 16"><path d="M2,2 l5,6 l-5,6" style="--k:0"/><path d="M9,2 l5,6 l-5,6" style="--k:1"/><path d="M16,2 l5,6 l-5,6" style="--k:2"/></svg></span>`;
    return `<div class="tk" role="group" aria-label="${esc(o.label || "")}: ${stages.map(s => esc(s.label) + " " + s.v).join(", ")}">${stages.map((s, i) => one(s, i) + (i < stages.length - 1 ? chev(i) : "")).join("")}</div>`;
  }

  // ---------- Medidor de aprovação (240°) ----------
  function meter(cr, o = {}) {
    const S = 300, c = 150, R = 118, A0 = -120, A1 = 120, span = A1 - A0, fl = nid("mt");
    const dec = cr.decided.length, apr = cr.approved.length, rate = dec ? apr / dec : 0, aR = A0 + span * rate;
    const ticks = Array.from({ length: 41 }, (_, i) => { const a = A0 + (span / 40) * i, big = i % 4 === 0; const [x0, y0] = pol(c, c, R + 16, a), [x1, y1] = pol(c, c, R + (big ? 26 : 21), a); return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" class="${big ? "mt__tk mt__tk--b" : "mt__tk"}"/>`; }).join("");
    const lbl = [0, 25, 50, 75, 100].map(p => { const [x, y] = pol(c, c, R + 38, A0 + span * p / 100); return `<text x="${x.toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="middle" class="mt__l">${p}</text>`; }).join("");
    const [nx, ny] = pol(c, c, R, aR);
    return `<div class="mt"><svg viewBox="-10 -6 ${S + 20} ${S - 34}" role="img" aria-label="Taxa geral de aprovação ${F.pct(rate)}: ${apr} aprovadas de ${dec} decididas">
      <defs>${glow(fl, 4)}<linearGradient id="${fl}g" x1="0" x2="1"><stop offset="0" stop-color="var(--jv-indigo)"/><stop offset="1" stop-color="var(--jv-arc)"/></linearGradient></defs>
      <g>${ticks}</g>${lbl}
      <path d="${arc(c, c, R, A0, A1)}" class="mt__track"/>
      ${dec && rate < 1 ? `<path d="${arc(c, c, R, aR + 1.5, A1)}" class="mt__rej" data-q="cat" data-v="REJECTED" data-tip="Reprovadas|${cr.rejected.length} de ${dec} decididas · ${F.pct(1 - rate)}"/>` : ""}
      ${dec && rate > 0 ? `<path d="${arc(c, c, R, A0, aR - (rate < 1 ? 1.5 : 0))}" class="mt__apr" stroke="url(#${fl}g)" filter="url(#${fl})" pathLength="100" data-q="cat" data-v="" data-tip="Aprovadas|${apr} de ${dec} decididas · ${F.pct(rate)}"/>` : ""}
      ${dec ? `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="7" class="mt__knob"/>` : ""}
      ${motion() ? `<circle r="2.4" fill="var(--jv-arc)"><animateMotion dur="9s" repeatCount="indefinite" path="${arc(c, c, R - 22, A0, A1)}"/></circle>` : ""}
      <path d="${arc(c, c, R - 22, A0, A1)}" class="mt__inner"/>
    </svg>
    <div class="mt__c"><small>Taxa geral</small><b class="num"><span data-k="${o.k || "mt"}" data-v="${rate * 100}" data-f="int">${F.int(rate * 100)}</span><em>%</em></b>
      <span class="mt__frac"><button type="button" data-q="cat" data-v="">${F.int(apr)} aprovadas</button> ÷ <button type="button" data-drill="credit_sel">${F.int(dec)} decididas</button></span></div></div>`;
  }

  // ---------- Mosaico de decisões (cada quadrado = uma operação decidida) ----------
  const DCAT = [["BANK_FULL", "Bancária integral", "var(--jv-arc)", "FULL"], ["BANK_PARTIAL", "Bancária parcial", "var(--jv-teal)", "PARTIAL"], ["INTERNAL_FULL", "Interna integral", "var(--jv-indigo)", "FULL"], ["INTERNAL_PARTIAL", "Interna parcial", "var(--jv-violet)", "PARTIAL"], ["REJECTED", "Reprovada", "var(--jv-brand)", "REJECTED"]];
  function waffle(cr, o = {}) {
    const keyOf = x => x.decision === "REJECTED" ? "REJECTED" : x.category;
    const sorted = DCAT.flatMap(([k]) => cr.decided.filter(x => keyOf(x) === k));
    const per = Math.max(1, Math.ceil(sorted.length / 120));
    const cells = []; for (let i = 0; i < sorted.length; i += per) cells.push(sorted[i]);
    const on = k => cr.cat === "ALL" || DCAT.find(d => d[0] === k)[3] === cr.cat;
    const counts = Object.fromEntries(DCAT.map(([k]) => [k, sorted.filter(x => keyOf(x) === k).length]));
    return `<div class="wf">
      <div class="wf__grid" role="img" aria-label="${DCAT.map(([k, l]) => l + " " + counts[k]).join(", ")}">${cells.map((x, i) => { const k = keyOf(x), d = DCAT.find(z => z[0] === k); return `<button type="button" class="wf__c" style="--c:${d[2]};--i:${i}" data-on="${on(k)}" data-drill="op_one" data-dv="${x.id}" aria-label="${x.id}: ${esc(d[1])}" data-tip="${x.id} · ${esc(x.client)}|${esc(d[1])} · ${F.brlc(x.equipmentValue)} equip."></button>`; }).join("")}</div>
      <p class="wf__unit">${per === 1 ? "Cada quadrado é uma operação decidida." : `Cada quadrado representa ${per} operações decididas.`}</p>
      <ul class="wf__leg">${DCAT.map(([k, l, col]) => `<li data-on="${on(k)}"><button type="button" ${k === "REJECTED" ? `data-q="cat" data-v="REJECTED"` : `data-drill="credit_cat" data-dv="${k}"`} style="--c:${col}"><i></i><span>${l}</span><b>${counts[k]}</b><small>${F.pct(counts[k] / Math.max(1, sorted.length))}</small></button></li>`).join("")}</ul></div>`;
  }

  // ---------- Velas mensais de decisão (aprovadas para cima, reprovadas para baixo) ----------
  function candles(groups, o = {}) {
    const W = 760, H = o.h || 220, pl = 34, pr = 12, mid = H / 2 + 6, room = H / 2 - 40, fl = nid("cn");
    const max = Math.max(1, ...groups.map(g => Math.max(g.up, g.down)));
    const step = (W - pl - pr) / groups.length, bw = Math.min(30, step * .32);
    const grid = [1, .5].flatMap(f => [mid - room * f, mid + room * f]).map(y => `<line x1="${pl}" x2="${W - pr}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" class="cn__grid"/>`).join("");
    return `<div class="cn__wrap"><svg class="cn" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}: ${groups.map(g => `${F.month(g.id)} ${g.up} aprovadas, ${g.down} reprovadas`).join("; ")}">
      <defs>${glow(fl, 3)}<linearGradient id="${fl}u" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--jv-arc)" stop-opacity=".25"/><stop offset="1" stop-color="var(--jv-arc)"/></linearGradient><linearGradient id="${fl}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--jv-brand)" stop-opacity=".3"/><stop offset="1" stop-color="var(--jv-brand)"/></linearGradient></defs>
      ${grid}<line x1="${pl}" x2="${W - pr}" y1="${mid}" y2="${mid}" class="cn__axis"/>
      <text x="${pl - 6}" y="${mid - room + 4}" text-anchor="end" class="ax">${max}</text><text x="${pl - 6}" y="${mid + 4}" text-anchor="end" class="ax">0</text><text x="${pl - 6}" y="${mid + room + 4}" text-anchor="end" class="ax">${max}</text>
      ${groups.map((g, i) => { const cx = pl + step * i + step / 2, hu = (g.up / max) * room, hd = (g.down / max) * room, tot = g.up + g.down, r = tot ? g.up / tot : null; return `<g class="cn__g" style="--i:${i}" data-drill="${o.drill}" data-dv="${g.id}" tabindex="0" role="button" aria-label="${F.month(g.id)}: ${g.up} aprovadas, ${g.down} reprovadas. Abrir registros" data-tip="${F.month(g.id)}|${g.up} aprovadas · ${g.down} reprovadas · ${r == null ? "sem decisões" : F.pct(r) + " de aprovação"}">
        <rect x="${cx - step / 2}" y="0" width="${step}" height="${H}" class="cn__hit"/>
        <line x1="${cx}" x2="${cx}" y1="${(mid - hu - 8).toFixed(1)}" y2="${(mid + hd + 8).toFixed(1)}" class="cn__wick"/>
        ${g.up ? `<rect x="${cx - bw / 2}" y="${(mid - hu).toFixed(1)}" width="${bw}" height="${hu.toFixed(1)}" rx="3" fill="url(#${fl}u)" class="cn__up"/><rect x="${cx - bw / 2}" y="${(mid - hu).toFixed(1)}" width="${bw}" height="2.5" fill="var(--jv-arc)" filter="url(#${fl})"/>` : ""}
        ${g.down ? `<rect x="${cx - bw / 2}" y="${mid}" width="${bw}" height="${hd.toFixed(1)}" rx="3" fill="url(#${fl}d)" class="cn__dn"/><rect x="${cx - bw / 2}" y="${(mid + hd - 2.5).toFixed(1)}" width="${bw}" height="2.5" fill="var(--jv-brand)" filter="url(#${fl})"/>` : ""}
        ${g.up ? `<text x="${cx + bw / 2 + 6}" y="${(mid - hu + 10).toFixed(1)}" class="cn__n">${g.up}</text>` : ""}${g.down ? `<text x="${cx + bw / 2 + 6}" y="${(mid + hd).toFixed(1)}" class="cn__n cn__n--d">${g.down}</text>` : ""}
        <text x="${cx}" y="16" text-anchor="middle" class="cn__rate">${r == null ? "—" : F.pct(r)}</text>
        <text x="${cx}" y="${H - 6}" text-anchor="middle" class="ax">${F.month(g.id)}</text></g>`; }).join("")}
    </svg></div><div class="legend"><span><i style="--c:var(--jv-arc)"></i>Aprovadas (acima)</span><span><i style="--c:var(--jv-brand)"></i>Reprovadas (abaixo)</span><span class="dim">Percentual no topo: aprovação do mês</span></div>`;
  }

  // ---------- Baldes de prazo (pendências) ----------
  const PTYPE = [["DOCUMENT", "doc", "Documento"], ["BANK_RETURN", "bank", "Retorno bancário"], ["SIGNATURE", "file", "Assinatura"], ["CONTACT", "users", "Contato"]];
  function buckets(p, tab) {
    const today = C.localDate(D.NOW.toISOString());
    const days = iso => Math.round((new Date(C.localDate(iso) + "T12:00:00Z") - new Date(today + "T12:00:00Z")) / 86400000);
    const tiles = [
      ["overdue", "Vencidas", p.overdue, "var(--jv-crit)", "alert", l => l.length ? `mais antiga há ${-days(l[0].dueAt)} ${-days(l[0].dueAt) === 1 ? "dia" : "dias"}` : "nada vencido"],
      ["today", "Vencem hoje", p.today, "var(--jv-warn)", "clock", l => l.length ? `próxima às ${F.dt(l[0].dueAt).slice(-5)}` : "nada para hoje"],
      ["week", "Próximos dias", p.week, "var(--jv-arc)", "calendar", l => l.length ? `a próxima em ${days(l[0].dueAt)} ${days(l[0].dueAt) === 1 ? "dia" : "dias"}` : "nada agendado"],
      ["none", "Sem prazo", p.none, "var(--jv-fg-3)", "inbox", l => l.length ? "defina um prazo para acompanhar" : "todas têm prazo"]];
    const typeOf = x => PTYPE.find(t => t[0] === x.type) ? x.type : "CONTACT";
    return `<div class="bk3" role="tablist" aria-label="Pendências por prazo">${tiles.map(([id, l, list, col, ic, ctx]) => `<button type="button" role="tab" class="bk3__t" style="--c:${col}" aria-selected="${tab === id}" data-q="ptab" data-v="${id}" data-hot="${list.length > 0}">
      <span class="bk3__top"><span class="bk3__ico">${icon(ic)}</span><span class="bk3__l">${l}</span></span>
      <span class="bk3__v"><b data-k="bk-${id}" data-v="${list.length}" data-f="int">${list.length}</b><small>${list.length === 1 ? "pendência" : "pendências"}</small></span>
      <span class="bk3__ctx">${ctx(list)}</span>
      <span class="bk3__types">${PTYPE.map(([t, ti, tl]) => { const n = list.filter(x => typeOf(x) === t).length; return `<span data-zero="${!n}" title="${tl}: ${n}">${icon(ti)}${n}</span>`; }).join("")}</span></button>`).join("")}</div>`;
  }
  function relDue(iso) {
    if (!iso) return { t: "sem prazo", tone: "none" };
    const today = C.localDate(D.NOW.toISOString()); const d = Math.round((new Date(C.localDate(iso) + "T12:00:00Z") - new Date(today + "T12:00:00Z")) / 86400000);
    if (d < 0) return { t: `venceu há ${-d} ${-d === 1 ? "dia" : "dias"}`, tone: "overdue" };
    if (d === 0) return { t: "hoje às " + F.dt(iso).slice(-5), tone: "today" };
    return { t: `em ${d} ${d === 1 ? "dia" : "dias"} · ${F.date(iso).slice(0, 5)}`, tone: "week" };
  }

  // ---------- Prévias de integração pendente ----------
  const PREVIEW = {
    goal: { done: 2.9e6, goal: 16e6, dayDone: 4, days: 20, branches: [["Filial Norte", 1.1e6, 5.5e6], ["Filial Centro", 1.2e6, 6.0e6], ["Filial Sul", .6e6, 4.5e6]] },
    billed: [["2026-06", 9.8e6, 21], ["2026-07", 11.2e6, 24], ["2026-08", 10.4e6, 22], ["2026-09", 12.9e6, 27], ["2026-10", 13.6e6, 29], ["2026-11", 3.1e6, 7]],
    financed: { "bk-alfa": [7.4e6, 16], "bk-beta": [5.1e6, 11], "bk-gama": [3.6e6, 8], "bk-delta": [2.9e6, 6], "bk-eps": [0, 0] }
  };
  function goal() {
    const g = PREVIEW.goal, pace = g.done / g.dayDone * g.days, pct = g.done / g.goal, pp = Math.min(1.15, pace / g.goal), tp = g.dayDone / g.days;
    const row = ([l, d, t]) => { const p = d / t, exp = tp; return `<li><span>${l}</span><span class="gl__mini"><i style="width:${Math.min(100, p * 100).toFixed(1)}%"></i><em style="left:${(exp * 100).toFixed(1)}%"></em></span><b>${F.pct(p)}</b><small>${F.brlc(d)} de ${F.brlc(t)}</small></li>`; };
    return `<div class="gl">
      <div class="gl__nums"><div><small>Realizado</small><b>${F.brlc(g.done)}</b></div><div><small>Meta do mês</small><b>${F.brlc(g.goal)}</b></div><div><small>Projeção no ritmo atual</small><b class="gl__proj">${F.brlc(pace)}</b></div></div>
      <div class="gl__track" role="img" aria-label="Realizado ${F.pct(pct)} da meta; projeção ${F.pct(pace / g.goal)}; ${g.dayDone} de ${g.days} dias úteis">
        <span class="gl__proj-bar" style="width:${(Math.min(1, pp) * 100).toFixed(1)}%"></span><span class="gl__done" style="width:${(pct * 100).toFixed(1)}%"><b>${F.pct(pct)}</b></span>
        <span class="gl__today" style="left:${(tp * 100).toFixed(1)}%"><em>hoje · dia útil ${g.dayDone} de ${g.days}</em></span><span class="gl__goal"><em>meta</em></span>
        <span class="gl__scale">${[0, 25, 50, 75, 100].map(p => `<i style="left:${p}%">${p}%</i>`).join("")}</span></div>
      <ul class="gl__rows">${g.branches.map(row).join("")}</ul>
      <p class="gl__note">Barra cheia: realizado. Barra tracejada: onde o mês termina se o ritmo continuar. Traço claro: onde deveria estar hoje.</p></div>`;
  }
  function billed() {
    const rows = PREVIEW.billed, max = Math.max(...rows.map(r => r[1])), avg = rows.slice(0, 5).reduce((s, r) => s + r[1], 0) / 5;
    return `<div class="bl"><div class="bl__head"><div><small>Faturado em ${F.month(rows[5][0])} até hoje</small><b>${F.brlc(rows[5][1])}</b><span>${rows[5][2]} máquinas faturadas</span></div><div><small>Média dos 5 meses anteriores</small><b>${F.brlc(avg)}</b></div></div>
      <div class="bl__cols" role="img" aria-label="${rows.map(r => F.month(r[0]) + " " + F.brlc(r[1]) + ", " + r[2] + " máquinas").join("; ")}">
        ${rows.map((r, i) => `<span class="bl__c" data-cur="${i === 5}" data-tip="${F.month(r[0])}|${F.brlc(r[1])} · ${r[2]} máquinas"><b>${F.brlc(r[1]).replace("R$ ", "")}</b><i style="height:${(r[1] / max * 100).toFixed(1)}%"></i><em>${mes(r[0])}</em><small>${r[2]} máq.</small></span>`).join("")}</div>
      <p class="gl__note">Data de referência: emissão da nota fiscal. O mês atual aparece parcial e destacado.</p></div>`;
  }
  function financed(showInactive = true) {
    const list = D.BANKS.filter(b => showInactive || b.active).map(b => ({ ...b, v: PREVIEW.financed[b.id][0], n: PREVIEW.financed[b.id][1] }));
    const max = Math.max(1, ...list.map(b => b.v)), total = list.reduce((s, b) => s + b.v, 0);
    return `<div class="fn"><div class="fn__total"><small>Volume financiado nos últimos 90 dias</small><b>${F.brlc(total)}</b><span>${list.reduce((s, b) => s + b.n, 0)} contratos desembolsados</span></div>
      <ul class="fn__list">${list.map((b, i) => `<li data-inactive="${!b.active}" style="--i:${i}" data-tip="${esc(b.label)}|${b.active ? F.brlc(b.v) + " · " + b.n + " contratos · " + F.pct(b.v / Math.max(1, total)) : "Instituição inativa · sem operação no período"}">
        <span class="fn__logo"><img src="${b.logo}" alt="${esc(b.label)}"></span>
        <span class="fn__bar"><i style="width:${(b.v / max * 100).toFixed(1)}%"></i></span>
        <span class="fn__v">${b.active ? `<b>${F.brlc(b.v)}</b><small>${b.n} contratos · ${F.pct(b.v / Math.max(1, total))}</small>` : `<b class="dim">—</b><small>inativa</small>`}</span></li>`).join("")}</ul></div>`;
  }

  window.FX3 = { trend, matrix, ladder, tanks, meter, waffle, candles, buckets, relDue, goal, billed, financed, BUCKETS, DCAT };
})();
