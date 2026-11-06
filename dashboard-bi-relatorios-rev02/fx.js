/*
 * FX · camada visual da REV02 (proposta). Gráficos SVG de "centro de comando" e movimento com propósito:
 * radar orbital, reator de crédito, funil em fita, conduíte operacional, série com período anterior,
 * calendário de calor, mapa de árvore, colunas divergentes, anel e linha do tempo de prazos.
 * Tudo clicável abre os registros (data-drill). Partículas e varreduras não são geradas com movimento reduzido.
 */
(function () {
  "use strict";
  const C = window.IRC; const { D, L, F, esc } = C;
  let uid = 0; const nid = (p) => p + (++uid).toString(36);
  const motion = () => !C.reduced();
  const STAGE = { received: "var(--jv-stage-received)", in_review: "var(--jv-stage-review)", formalization: "var(--jv-stage-formalization)", billing: "var(--jv-stage-billing)", closed: "var(--jv-good)", cancelled: "var(--jv-x-stage-cancelled-hc)", credit_rejected: "var(--jv-crit)" };
  const pol = (cx, cy, r, a) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)];
  const arcPath = (cx, cy, r, a0, a1) => { const [x0, y0] = pol(cx, cy, r, a0), [x1, y1] = pol(cx, cy, r, a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`; };
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; };
  const glow = (id, sd = 3) => `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

  // ---------------- Radar orbital (operações em andamento) ----------------
  // Anel = etapa; ângulo = horas na etapa (0 h no topo, sentido horário); tamanho = valor de equipamento.
  function radar(ops, o = {}) {
    const S = o.size || 420, c = S / 2, rings = [["received", .41], ["in_review", .325], ["formalization", .24], ["billing", .155]].map(([s, f]) => [s, S * f]);
    const maxH = Math.max(72, ...ops.map(x => x.residenceHours)); const maxV = Math.max(1, ...ops.map(x => x.equipmentValue));
    const per = 9; const gid = nid("rg"), sw = nid("sw"), fl = nid("rf");
    const ringSvg = rings.map(([s, r], i) => `<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${STAGE[s]}" stroke-opacity=".28" stroke-width="1"/>
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${STAGE[s]}" stroke-opacity=".5" stroke-width="1" stroke-dasharray="1 7"/>
      <g class="radar__lbl">${(() => { const [lx, ly] = pol(c, c, r, 344); return `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="2.5" fill="${STAGE[s]}"/><text x="${(lx - 6).toFixed(1)}" y="${(ly + 3).toFixed(1)}" text-anchor="end" fill="${STAGE[s]}">${esc(L.lc[s].label.toUpperCase())}</text>`; })()}</g>`).join("");
    const spokes = [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const [x, y] = pol(c, c, S * .44, a), [x0, y0] = pol(c, c, S * .12, a); return `<line x1="${x0}" y1="${y0}" x2="${x}" y2="${y}" stroke="var(--jv-line)" />`; }).join("");
    const hourLbl = [0, .25, .5, .75].map(f => { const a = f * 330; const [x, y] = pol(c, c, S * .465, a); return `<text x="${x}" y="${y + 3}" text-anchor="middle" class="radar__h">${Math.round(f * maxH)} h</text>`; }).join("");
    const ticks = Array.from({ length: 72 }, (_, i) => { const a = i * 5, l = i % 6 ? 4 : 9; const [x0, y0] = pol(c, c, S * .48, a), [x1, y1] = pol(c, c, S * .48 - l, a); return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`; }).join("");
    const dots = ops.map(op => {
      const ring = rings.find(([s]) => s === op.state); if (!ring) return "";
      const a = Math.min(330, (op.residenceHours / maxH) * 330), j = (hash(op.id) - .5) * 14, r = ring[1] + j;
      const [x, y] = pol(c, c, r, a), size = 3 + Math.sqrt(op.equipmentValue / maxV) * 5.5;
      const delay = ((a / 360) * per - per).toFixed(2);
      return `<g class="radar__dot" style="--c:${STAGE[op.state]};--d:${delay}s" data-drill="op_one" data-dv="${op.id}" tabindex="0" role="button" aria-label="${op.id}, ${esc(L.lc[op.state].label)}, ${op.residenceHours} horas na etapa, ${F.brlc(op.equipmentValue)} de equipamento. Abrir registro"
        data-tip="${op.id} · ${esc(op.client)}|${esc(L.lc[op.state].label)} · ${op.residenceHours} h na etapa · ${F.brlc(op.equipmentValue)} equip.">
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size + 7).toFixed(1)}" class="radar__ping"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size.toFixed(1)}" fill="${STAGE[op.state]}" filter="url(#${fl})"/>
        <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(size * .38).toFixed(1)}" fill="#fff" fill-opacity=".85"/></g>`;
    }).join("");
    return `<div class="radar" style="--per:${per}s">
      <svg viewBox="0 0 ${S} ${S}" role="img" aria-label="${esc(o.label || "Radar das operações em andamento")}: ${rings.map(([s]) => esc(L.lc[s].label) + " " + ops.filter(x => x.state === s).length).join(", ")}">
        <defs>${glow(fl, 2.2)}<radialGradient id="${gid}"><stop offset="0" stop-color="var(--jv-arc)" stop-opacity=".16"/><stop offset=".7" stop-color="var(--jv-arc)" stop-opacity=".03"/><stop offset="1" stop-color="var(--jv-arc)" stop-opacity="0"/></radialGradient>
          <linearGradient id="${sw}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--jv-arc)" stop-opacity="0"/><stop offset="1" stop-color="var(--jv-arc)" stop-opacity=".34"/></linearGradient></defs>
        <circle cx="${c}" cy="${c}" r="${S * .48}" fill="url(#${gid})"/>
        <g class="radar__ticks" stroke="var(--jv-line-2)">${ticks}</g>
        <g>${spokes}</g>${ringSvg}${hourLbl}
        ${motion() ? `<g class="radar__sweep"><path d="M${c},${c} L${c},${c - S * .44} ${arcPath(c, c, S * .44, 0, 38).replace(/^M[^A]+/, "")} Z" fill="url(#${sw})"/><line x1="${c}" y1="${c}" x2="${c}" y2="${c - S * .44}" stroke="var(--jv-arc)" stroke-opacity=".8" stroke-width="1.2"/></g>` : ""}
        <g class="radar__dots">${dots}</g>
        <circle cx="${c}" cy="${c}" r="${S * .1}" fill="var(--jv-panel-solid)" stroke="var(--jv-line-2)"/>
      </svg>
      <div class="radar__c"><b class="num" data-k="${o.k || "radar"}" data-v="${ops.length}" data-f="int">${F.int(ops.length)}</b><span>${esc(o.center || "em andamento")}</span></div>
    </div>`;
  }

  // ---------------- Reator de crédito ----------------
  function reactor(cr, o = {}) {
    const S = 320, c = S / 2, fl = nid("rx");
    const dec = cr.decided.length, apr = cr.approved.length, rej = cr.rejected.length, rate = dec ? apr / dec : 0;
    const gap = dec ? 1.6 : 0;
    const seg = (r, w, a0, a1, color, attrs = "", cls = "") => a1 - a0 <= gap ? "" : `<path d="${arcPath(c, c, r, a0 + gap / 2, a1 - gap / 2)}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="butt" class="${cls}" ${attrs}/>`;
    const outer = seg(132, 12, 0, rate * 360, "var(--jv-good)", `filter="url(#${fl})" data-q="cat" data-v="" data-tip="Aprovadas|${apr} de ${dec} decididas · ${F.pct(rate)}"`, "rx__arc") + seg(132, 12, rate * 360, 360, "var(--jv-crit)", `data-q="cat" data-v="REJECTED" data-tip="Reprovadas|${rej} de ${dec} decididas"`, "rx__arc");
    const CATS = [["BANK_FULL", "Bancária integral", "var(--jv-good)"], ["BANK_PARTIAL", "Bancária parcial", "var(--jv-teal)"], ["INTERNAL_FULL", "Interna integral", "var(--jv-arc)"], ["INTERNAL_PARTIAL", "Interna parcial", "var(--jv-indigo)"]];
    let acc = 0; const mid = CATS.map(([id, l, col]) => { const v = cr.cats[id]; const a0 = acc / Math.max(1, dec) * 360; acc += v; const a1 = acc / Math.max(1, dec) * 360; return seg(110, 7, a0, a1, col, `data-drill="credit_cat" data-dv="${id}" tabindex="0" role="button" aria-label="${l}: ${v}" data-tip="${l}|${v} operações · ${F.pct(v / Math.max(1, dec))} das decisões"`, "rx__seg"); }).join("") + seg(110, 7, acc / Math.max(1, dec) * 360, 360, "color-mix(in srgb,var(--jv-crit) 70%,transparent)", `data-tip="Reprovadas|${rej}"`, "rx__seg");
    const share = dec ? cr.sel.length / dec : 0;
    const inner = `<circle cx="${c}" cy="${c}" r="92" fill="none" stroke="var(--jv-line)" stroke-width="4"/>` + seg(92, 4, 0, Math.max(share * 360, .01), "var(--jv-violet)", `data-drill="credit_sel" data-tip="Categoria selecionada|${cr.sel.length} de ${dec} · ${F.pct(share)} do denominador"`, "rx__sel");
    const ticks = Array.from({ length: 120 }, (_, i) => { const a = i * 3, l = i % 10 ? 3 : 8; const [x0, y0] = pol(c, c, 152, a), [x1, y1] = pol(c, c, 152 - l, a); return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>`; }).join("");
    return `<div class="rx"><svg viewBox="0 0 ${S} ${S}" role="img" aria-label="Taxa geral de aprovação ${F.pct(rate)}: ${apr} aprovadas de ${dec} decididas. Categoria selecionada: ${cr.sel.length}.">
      <defs>${glow(fl, 3.5)}<radialGradient id="${fl}c"><stop offset="0" stop-color="var(--jv-arc)" stop-opacity=".22"/><stop offset="1" stop-color="var(--jv-arc)" stop-opacity="0"/></radialGradient></defs>
      <circle cx="${c}" cy="${c}" r="80" fill="url(#${fl}c)"/>
      <g class="rx__ticks" stroke="var(--jv-line-2)">${ticks}</g>
      <circle cx="${c}" cy="${c}" r="132" fill="none" stroke="var(--jv-bg-2)" stroke-width="12"/>
      <circle cx="${c}" cy="${c}" r="110" fill="none" stroke="var(--jv-bg-2)" stroke-width="7"/>
      <g class="rx__ring rx__ring--o">${outer}</g><g class="rx__ring rx__ring--m">${mid}</g><g class="rx__ring rx__ring--i">${inner}</g>
      ${motion() ? `<g class="rx__orbit"><circle cx="${c}" cy="${c - 145}" r="2.4" fill="var(--jv-arc)"/></g>` : ""}
    </svg>
    <div class="rx__c"><small>Taxa geral</small><b class="num" data-k="${o.k || "rx"}" data-v="${rate * 100}" data-f="int">${F.int(rate * 100)}</b><em>%</em><span>${F.int(apr)} de ${F.int(dec)} decididas</span></div></div>`;
  }

  // ---------------- Funil em fita (pipeline por etapa) ----------------
  function ribbon(items, o = {}) {
    const W = o.w || 1000, H = o.h || 240, top = 46, bot = 30, n = items.length, max = Math.max(1, ...items.map(i => i.v));
    const colW = W / n, mid = top + (H - top - bot) / 2, maxH = H - top - bot;
    const hs = items.map(i => Math.max(10, (i.v / max) * maxH));
    const gid = nid("rb"), fl = nid("rbf");
    let topP = `M0,${mid - hs[0] / 2}`, botP = "";
    items.forEach((_, i) => { const x0 = i * colW, x1 = x0 + colW * .62, h = hs[i]; topP += ` L${x1.toFixed(1)},${(mid - h / 2).toFixed(1)}`; if (i < n - 1) { const nx = (i + 1) * colW, nh = hs[i + 1], cx = (x1 + nx) / 2; topP += ` C${cx},${(mid - h / 2).toFixed(1)} ${cx},${(mid - nh / 2).toFixed(1)} ${nx},${(mid - nh / 2).toFixed(1)}`; } });
    topP += ` L${W},${(mid - hs[n - 1] / 2).toFixed(1)} L${W},${(mid + hs[n - 1] / 2).toFixed(1)}`;
    for (let i = n - 1; i >= 0; i--) { const x0 = i * colW, x1 = x0 + colW * .62, h = hs[i]; botP += ` L${x1.toFixed(1)},${(mid + h / 2).toFixed(1)} L${x0.toFixed(1)},${(mid + h / 2).toFixed(1)}`; if (i > 0) { const px = (i - 1) * colW + colW * .62, ph = hs[i - 1], cx = (px + x0) / 2; botP += ` C${cx},${(mid + h / 2).toFixed(1)} ${cx},${(mid + ph / 2).toFixed(1)} ${px.toFixed(1)},${(mid + ph / 2).toFixed(1)}`; } }
    const shape = topP + botP + " Z";
    const cols = items.map((it, i) => { const x0 = i * colW, h = hs[i]; return `<g class="rb__col" data-drill="${o.drill}" data-dv="${esc(it.id)}" tabindex="0" role="button" aria-label="${esc(it.full || it.label)}: ${esc(it.text)}${it.sub ? ", " + esc(it.sub) : ""}. Abrir registros" data-tip="${esc(it.full || it.label)}|${esc(it.text)}${it.sub ? " · " + esc(it.sub) : ""}">
        <rect x="${x0}" y="0" width="${colW}" height="${H}" fill="transparent"/>
        <rect x="${x0 + 1}" y="${(mid - h / 2).toFixed(1)}" width="${(colW * .62 - 2).toFixed(1)}" height="${h.toFixed(1)}" class="rb__hl" rx="3"/>
        <text x="${x0 + 6}" y="16" class="rb__idx">${String(i + 1).padStart(2, "0")}</text>
        <text x="${x0 + 6}" y="33" class="rb__lab">${esc(it.label)}</text>
        <text x="${x0 + colW * .31}" y="${(mid + 6).toFixed(1)}" text-anchor="middle" class="rb__val" data-k="${o.k}-${esc(it.id)}-v" data-v="${it.v}" data-f="${o.f || "int"}">${esc(it.text)}</text>
        ${it.sub ? `<text x="${x0 + 6}" y="${H - 8}" class="rb__sub">${esc(it.sub)}</text>` : ""}
        ${i < n - 1 && items[i].v ? `<text x="${x0 + colW * .81}" y="${(mid + 4).toFixed(1)}" text-anchor="middle" class="rb__conv">→</text>` : ""}</g>`; }).join("");
    let parts = "";
    if (motion()) { const pid = nid("rbp"); parts = `<path id="${pid}" d="M0,${mid} L${W},${mid}" fill="none" stroke="none"/>` + Array.from({ length: 14 }, (_, k) => `<circle r="${1.3 + (k % 3) * .5}" fill="#fff" fill-opacity="${.35 + (k % 4) * .12}"><animateMotion dur="${(7 + (k % 5)).toFixed(1)}s" begin="${(-k * .73).toFixed(2)}s" repeatCount="indefinite" path="M0,${(mid + ((k * 37) % 30) - 15).toFixed(0)} L${W},${(mid + ((k * 53) % 20) - 10).toFixed(0)}"/></circle>`).join(""); }
    return `<svg class="rb" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "Funil")}: ${items.map(i => esc(i.label) + " " + esc(i.text)).join(", ")}">
      <defs><linearGradient id="${gid}" x1="0" x2="1"><stop offset="0" stop-color="${o.c0 || "var(--jv-arc)"}" stop-opacity=".55"/><stop offset="1" stop-color="${o.c1 || "var(--jv-indigo)"}" stop-opacity=".55"/></linearGradient>${glow(fl, 6)}</defs>
      <path d="${shape}" fill="url(#${gid})" class="rb__shape"/><path d="${shape}" fill="none" stroke="${o.c0 || "var(--jv-arc)"}" stroke-opacity=".7" stroke-width="1.2" class="rb__edge" filter="url(#${fl})"/>
      <g class="rb__parts" clip-path="url(#${gid}c)">${parts}</g><clipPath id="${gid}c"><path d="${shape}"/></clipPath>
      ${cols}</svg>`;
  }

  // ---------------- Conduíte operacional ----------------
  function conduit(stages, o = {}) {
    const W = 760, H = 210, n = stages.length, gap = W / n, y = 92, fl = nid("cdf");
    const max = Math.max(1, ...stages.map(s => s.v));
    const pipe = `<path d="M${gap / 2},${y} L${W - gap / 2},${y}" stroke="var(--jv-line-2)" stroke-width="10" stroke-linecap="round"/><path d="M${gap / 2},${y} L${W - gap / 2},${y}" stroke="url(#${fl}g)" stroke-width="2" />`;
    const parts = motion() ? Array.from({ length: 10 }, (_, k) => `<circle r="2.2" fill="var(--jv-arc)" filter="url(#${fl})"><animateMotion dur="6s" begin="${(-k * .6).toFixed(1)}s" repeatCount="indefinite" path="M${gap / 2},${y} L${W - gap / 2},${y}"/></circle>`).join("") : "";
    const nodes = stages.map((s, i) => { const x = gap / 2 + i * gap, r = 26 + Math.sqrt(s.v / max) * 16; return `<g class="cd__node" style="--c:${s.color}" data-drill="${o.drill}" data-dv="${s.id}" tabindex="0" role="button" aria-label="${esc(s.label)}: ${s.v} operações, ${esc(s.money)}. Abrir registros" data-tip="${esc(s.label)}|${s.v} operações · ${esc(s.money)} · ${esc(s.res)}">
        <circle cx="${x}" cy="${y}" r="${r + 10}" class="cd__halo"/>
        <circle cx="${x}" cy="${y}" r="${r}" fill="var(--jv-panel-solid)" stroke="${s.color}" stroke-width="2" filter="url(#${fl})"/>
        <circle cx="${x}" cy="${y}" r="${r - 6}" fill="${s.color}" fill-opacity=".14"/>
        <text x="${x}" y="${y + 8}" text-anchor="middle" class="cd__v" data-k="${o.k}-${s.id}" data-v="${s.v}" data-f="int">${F.int(s.v)}</text>
        <text x="${x}" y="${y - r - 18}" text-anchor="middle" class="cd__step">${esc(s.step)}</text>
        <text x="${x}" y="${y + r + 26}" text-anchor="middle" class="cd__lab">${esc(s.label)}</text>
        <text x="${x}" y="${y + r + 43}" text-anchor="middle" class="cd__sub">${esc(s.money)}</text></g>`; }).join("");
    return `<svg class="cd" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "Operações por etapa")}: ${stages.map(s => esc(s.label) + " " + s.v).join(", ")}">
      <defs>${glow(fl, 2.5)}<linearGradient id="${fl}g" x1="0" x2="1">${stages.map((s, i) => `<stop offset="${i / Math.max(1, n - 1)}" stop-color="${s.color}"/>`).join("")}</linearGradient></defs>${pipe}${parts}${nodes}</svg>`;
  }

  // ---------------- Série temporal com período anterior ----------------
  function series(points, o = {}) {
    const W = 640, H = o.h || 230, pl = 40, pr = 14, pt = 22, pb = 30;
    const prev = o.prev || null;
    const max = Math.max(1, ...points.map(p => p.v), ...(prev || []).map(p => p.v)) * 1.18;
    const x = i => pl + (points.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (points.length - 1));
    const y = v => pt + (H - pt - pb) * (1 - v / max);
    const curve = (arr) => { const pts = arr.map((p, i) => [x(i), y(p.v)]); let d = ""; pts.forEach(([px, py], i) => { if (!i) { d += `M${px.toFixed(1)},${py.toFixed(1)}`; return; } const [qx, qy] = pts[i - 1]; const cx = (qx + px) / 2; d += ` C${cx.toFixed(1)},${qy.toFixed(1)} ${cx.toFixed(1)},${py.toFixed(1)} ${px.toFixed(1)},${py.toFixed(1)}`; }); return { d, pts }; };
    const cur = curve(points), color = o.color || "var(--jv-arc)", gid = nid("sg"), fl = nid("sf");
    const fill = cur.d + ` L${cur.pts[cur.pts.length - 1][0]},${H - pb} L${cur.pts[0][0]},${H - pb} Z`;
    const grid = [0, .25, .5, .75, 1].map(t => { const v = (max / 1.18) * t; return `<line x1="${pl}" x2="${W - pr}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="var(--jv-line)" ${t ? 'stroke-dasharray="2 5"' : ""}/>${t % .5 === 0 ? `<text x="${pl - 8}" y="${(y(v) + 3).toFixed(1)}" text-anchor="end" class="ax">${F.int(v)}</text>` : ""}`; }).join("");
    const peak = points.reduce((b, p, i) => p.v > b.v ? { v: p.v, i } : b, { v: -1, i: 0 });
    const step = points.length > 1 ? (W - pl - pr) / (points.length - 1) : W - pl - pr;
    const pv = prev ? curve(prev) : null;
    return `<svg class="ser" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}: ${points.map(p => esc(p.label) + " " + F.int(p.v)).join(", ")}">
      <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".42"/><stop offset=".6" stop-color="${color}" stop-opacity=".08"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>${glow(fl, 4)}</defs>
      ${grid}
      ${pv ? `<path d="${pv.d}" fill="none" stroke="var(--jv-fg-3)" stroke-width="1.4" stroke-dasharray="4 5" class="ser__prev"/>` : ""}
      <path d="${fill}" fill="url(#${gid})" class="ser__fill"/>
      <path d="${cur.d}" fill="none" stroke="${color}" stroke-width="2.4" pathLength="100" class="ser__line" filter="url(#${fl})"/>
      ${peak.v > 0 ? `<g class="ser__peak"><line x1="${x(peak.i)}" x2="${x(peak.i)}" y1="${y(peak.v)}" y2="${pt - 6}" stroke="${color}" stroke-dasharray="2 3"/><text x="${x(peak.i)}" y="${pt - 9}" text-anchor="middle" class="ser__pk">PICO ${F.int(peak.v)}</text></g>` : ""}
      ${points.map((p, i) => `<g class="ser__pt" ${o.drill ? `data-drill="${o.drill}" data-dv="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(p.label)}: ${F.int(p.v)}. Abrir registros"` : ""} data-tip="${esc(p.label)}|${F.int(p.v)} ${esc(o.unit || "")}${prev && prev[i] ? ` · período anterior ${F.int(prev[i].v)}` : ""}">
        <rect x="${(x(i) - step / 2).toFixed(1)}" y="${pt}" width="${step.toFixed(1)}" height="${H - pt - pb}" fill="transparent"/>
        <line x1="${x(i)}" x2="${x(i)}" y1="${pt}" y2="${H - pb}" class="ser__cross"/>
        <circle cx="${x(i)}" cy="${y(p.v)}" r="9" class="ser__halo" fill="${color}"/>
        <circle cx="${x(i)}" cy="${y(p.v)}" r="3.6" fill="var(--jv-panel-solid)" stroke="${color}" stroke-width="2"/>
        <text x="${x(i)}" y="${H - 10}" text-anchor="middle" class="ax">${esc(p.label)}</text></g>`).join("")}
    </svg>${prev ? `<div class="legend"><span><i style="--c:${color}"></i>${esc(o.curLabel || "Período atual")}</span><span><i class="dash"></i>${esc(o.prevLabel || "Período anterior")}</span></div>` : ""}`;
  }

  // ---------------- Calendário de calor ----------------
  function heat(counts, o = {}) {
    const weeks = o.weeks || 26, cell = 13, gap = 3, left = 30, top = 18;
    const end = new Date(C.localDate(D.NOW.toISOString()) + "T12:00:00Z"); const dow = (end.getUTCDay() + 6) % 7;
    const start = new Date(end.getTime() - ((weeks - 1) * 7 + dow) * 86400000);
    const max = Math.max(1, ...Object.values(counts)); const cells = []; const months = [];
    for (let w = 0; w < weeks; w++) for (let d = 0; d < 7; d++) {
      const dt = new Date(start.getTime() + (w * 7 + d) * 86400000); if (dt > end) continue;
      const key = dt.toISOString().slice(0, 10), v = counts[key] || 0, lv = v ? Math.ceil((v / max) * 4) : 0;
      if (d === 0 && dt.getUTCDate() <= 7) months.push([w, dt]);
      cells.push(`<rect x="${left + w * (cell + gap)}" y="${top + d * (cell + gap)}" width="${cell}" height="${cell}" rx="3" class="heat__c" data-l="${lv}" ${v ? `data-drill="${o.drill}" data-dv="${key}" tabindex="-1"` : ""} data-tip="${key.split("-").reverse().join("/")}|${v} ${esc(o.unit || "")}"/>`);
    }
    const W = left + weeks * (cell + gap), H = top + 7 * (cell + gap);
    return `<svg class="heat" viewBox="0 0 ${W} ${H + 4}" role="img" aria-label="${esc(o.label || "Calendário")}">
      ${months.map(([w, dt]) => `<text x="${left + w * (cell + gap)}" y="11" class="ax">${["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][dt.getUTCMonth()]}</text>`).join("")}
      ${[["seg", 0], ["qua", 2], ["sex", 4]].map(([l, d]) => `<text x="0" y="${top + d * (cell + gap) + 10}" class="ax">${l}</text>`).join("")}
      ${cells.join("")}</svg>
      <div class="heat__legend"><span>menos</span>${[0, 1, 2, 3, 4].map(l => `<i data-l="${l}"></i>`).join("")}<span>mais</span></div>`;
  }

  // ---------------- Mapa de árvore (squarified) ----------------
  function squarify(items, x, y, w, h) {
    const total = items.reduce((s, i) => s + i.v, 0); if (!total) return [];
    const out = []; let rest = items.filter(i => i.v > 0).sort((a, b) => b.v - a.v).map(i => ({ ...i, a: (i.v / total) * w * h }));
    while (rest.length) {
      const short = Math.min(w, h); let row = [rest[0]], best = Infinity;
      const worst = r => { const s = r.reduce((a, b) => a + b.a, 0); const mx = Math.max(...r.map(i => i.a)), mn = Math.min(...r.map(i => i.a)); return Math.max((short * short * mx) / (s * s), (s * s) / (short * short * mn)); };
      best = worst(row); let k = 1;
      while (k < rest.length) { const t = row.concat(rest[k]); const ww = worst(t); if (ww > best) break; row = t; best = ww; k++; }
      const s = row.reduce((a, b) => a + b.a, 0);
      if (w >= h) { const cw = s / h; let yy = y; row.forEach(r => { const ch = r.a / cw; out.push({ ...r, x, y: yy, w: cw, h: ch }); yy += ch; }); x += cw; w -= cw; }
      else { const ch = s / w; let xx = x; row.forEach(r => { const cw = r.a / ch; out.push({ ...r, x: xx, y, w: cw, h: ch }); xx += cw; }); y += ch; h -= ch; }
      rest = rest.slice(row.length);
    }
    return out;
  }
  function treemap(groups, o = {}) {
    const W = 640, H = o.h || 300; const total = groups.reduce((s, g) => s + g.v, 0);
    if (!total) return "";
    const top = squarify(groups, 0, 0, W, H);
    const cells = top.map(g => {
      const inner = squarify(g.children, g.x + 3, g.y + 22, Math.max(1, g.w - 6), Math.max(1, g.h - 25));
      return `<g class="tm__g" style="--c:${g.color}"><rect x="${g.x + 1}" y="${g.y + 1}" width="${Math.max(0, g.w - 2)}" height="${Math.max(0, g.h - 2)}" rx="6" class="tm__frame"/>
        ${g.w > 90 ? `<text x="${g.x + 9}" y="${g.y + 15}" class="tm__gl">${esc(g.label.toUpperCase())} · ${F.brlc(g.v)}</text>` : ""}
        ${inner.map((c, i) => `<g class="tm__cell" data-drill="${o.drill}" data-dv="${esc(c.id)}" tabindex="0" role="button" aria-label="${esc(g.label)}, ${esc(c.label)}: ${F.brlc(c.v)}. Abrir registros" data-tip="${esc(c.label)} · ${esc(g.label)}|${F.brlc(c.v)} · ${c.n} abertas · ${F.pct(c.v / total)} do pipeline">
          <rect x="${(c.x + 1).toFixed(1)}" y="${(c.y + 1).toFixed(1)}" width="${Math.max(0, c.w - 2).toFixed(1)}" height="${Math.max(0, c.h - 2).toFixed(1)}" rx="4" fill="${g.color}" fill-opacity="${(.62 - i * .08).toFixed(2)}"/>
          ${c.w > 70 && c.h > 34 ? `<text x="${c.x + 8}" y="${c.y + 18}" class="tm__l">${esc(c.label)}</text><text x="${c.x + 8}" y="${c.y + 33}" class="tm__v">${F.brlc(c.v)}</text>` : ""}</g>`).join("")}</g>`;
    }).join("");
    return `<svg class="tm" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "Mapa de árvore")}">${cells}</svg>`;
  }

  // ---------------- Colunas divergentes (ganhas acima, perdidas abaixo) ----------------
  function diverge(groups, o = {}) {
    const W = 640, H = o.h || 240, pl = 30, pr = 10, mid = H / 2 + 4, room = H / 2 - 30;
    const max = Math.max(1, ...groups.map(g => Math.max(g.up, g.down)));
    const bw = Math.min(46, (W - pl - pr) / groups.length * .5), step = (W - pl - pr) / groups.length;
    const net = groups.map((g, i) => [pl + step * i + step / 2, mid - ((g.up - g.down) / max) * room]);
    return `<svg class="dv" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}: ${groups.map(g => `${esc(g.label)} ${g.up} ganhas, ${g.down} perdidas`).join("; ")}">
      <line x1="${pl}" x2="${W - pr}" y1="${mid}" y2="${mid}" stroke="var(--jv-line-2)"/>
      <text x="${pl - 6}" y="${mid - room + 4}" text-anchor="end" class="ax">${max}</text><text x="${pl - 6}" y="${mid + room + 4}" text-anchor="end" class="ax">${max}</text>
      ${groups.map((g, i) => { const cx = pl + step * i + step / 2, hu = (g.up / max) * room, hd = (g.down / max) * room; return `<g class="dv__g" data-drill="${o.drill}" data-dv="${esc(g.id)}" tabindex="0" role="button" aria-label="${esc(g.label)}: ${g.up} ganhas, ${g.down} perdidas. Abrir registros" data-tip="${esc(g.label)}|${g.up} ganhas · ${g.down} perdidas · saldo ${g.up - g.down >= 0 ? "+" : ""}${g.up - g.down}">
        <rect x="${cx - step / 2}" y="0" width="${step}" height="${H}" fill="transparent"/>
        <rect x="${cx - bw / 2}" y="${(mid - hu - 1).toFixed(1)}" width="${bw}" height="${hu.toFixed(1)}" rx="4" fill="var(--jv-good)" class="dv__up"/>
        <rect x="${cx - bw / 2}" y="${mid + 1}" width="${bw}" height="${hd.toFixed(1)}" rx="4" fill="var(--jv-warn)" class="dv__down"/>
        ${g.up ? `<text x="${cx}" y="${(mid - hu - 7).toFixed(1)}" text-anchor="middle" class="dv__n">${g.up}</text>` : ""}${g.down ? `<text x="${cx}" y="${(mid + hd + 15).toFixed(1)}" text-anchor="middle" class="dv__n">${g.down}</text>` : ""}
        <text x="${cx}" y="${H - 4}" text-anchor="middle" class="ax">${esc(g.label)}</text></g>`; }).join("")}
      <path d="${net.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")}" fill="none" stroke="var(--jv-fg)" stroke-width="1.4" stroke-dasharray="3 4" class="dv__net"/>
      ${net.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="var(--jv-fg)"/>`).join("")}
    </svg><div class="legend"><span><i style="--c:var(--jv-good)"></i>Ganhas</span><span><i style="--c:var(--jv-warn)"></i>Perdidas</span><span><i class="dash"></i>Saldo (ganhas − perdidas)</span></div>`;
  }

  // ---------------- Anel com legenda ----------------
  function donut(segs, o = {}) {
    const S = 220, c = S / 2, R = 92, w = 16, total = segs.reduce((s, x) => s + x.v, 0); let acc = 0; const gap = total ? 2 : 0;
    const arcs = segs.map(s => { const a0 = acc / Math.max(1, total) * 360; acc += s.v; const a1 = acc / Math.max(1, total) * 360; if (!s.v || a1 - a0 <= gap) return ""; return `<path d="${arcPath(c, c, R, a0 + gap / 2, a1 - gap / 2)}" stroke="${s.color}" stroke-width="${w}" fill="none" class="dn__seg" ${o.drill ? `data-drill="${o.drill}" data-dv="${s.id}" tabindex="0" role="button" aria-label="${esc(s.label)}: ${s.v}. Abrir registros"` : ""} data-tip="${esc(s.label)}|${s.v} ${esc(o.unit || "")} · ${F.pct(s.v / Math.max(1, total))}"/>`; }).join("");
    return `<div class="dn"><div class="dn__ring"><svg viewBox="0 0 ${S} ${S}" role="img" aria-label="${esc(o.label || "")}: ${segs.map(s => esc(s.label) + " " + s.v).join(", ")}"><circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="var(--jv-bg-2)" stroke-width="${w}"/>${arcs}<circle cx="${c}" cy="${c}" r="${R - 20}" fill="none" stroke="var(--jv-line)" stroke-dasharray="1 4"/></svg>
      <div class="dn__c"><b class="num" data-k="${o.k || "dn"}" data-v="${total}" data-f="int">${F.int(total)}</b><span>${esc(o.center || "")}</span></div></div>
      <ul class="dn__leg">${segs.map(s => `<li><button type="button" ${o.drill ? `data-drill="${o.drill}" data-dv="${s.id}"` : ""}><i style="--c:${s.color}"></i><span>${esc(s.label)}</span><b>${s.v}</b><small>${F.pct(s.v / Math.max(1, total))}</small></button></li>`).join("")}</ul></div>`;
  }

  // ---------------- Linha do tempo de prazos ----------------
  function timeline(p, o = {}) {
    const W = 760, H = 168, pl = 18, pr = 70, base = 128, days = []; for (let d = -5; d <= 7; d++) days.push(d);
    const today = C.localDate(D.NOW.toISOString()); const dayOf = iso => Math.round((new Date(C.localDate(iso) + "T12:00:00Z") - new Date(today + "T12:00:00Z")) / 86400000);
    const step = (W - pl - pr) / (days.length - 1), X = d => pl + (Math.max(-5, Math.min(7, d)) + 5) * step;
    const col = d => d < 0 ? "var(--jv-crit)" : d === 0 ? "var(--jv-warn)" : "var(--jv-arc)";
    const stacks = {}; const dots = [];
    p.all.filter(x => x.dueAt).sort((a, b) => a.dueAt.localeCompare(b.dueAt)).forEach(x => { const d = Math.max(-5, Math.min(7, dayOf(x.dueAt))); stacks[d] = (stacks[d] || 0) + 1; const k = stacks[d]; const tab = d < 0 ? "overdue" : d === 0 ? "today" : "week";
      dots.push(`<g class="tl2__dot" style="--c:${col(d)}" data-drill="pend_${tab}" data-tip="${esc(x.title)}|${x.operation} · ${F.dt(x.dueAt)} · ${esc(L.seller[x.seller].label)}"><circle cx="${X(d)}" cy="${base - 8 - (k - 1) * 13}" r="5" fill="${col(d)}" fill-opacity=".9"/></g>`); });
    const none = p.none.length;
    return `<svg class="tl2" viewBox="0 0 ${W} ${H}" role="img" aria-label="Pendências por prazo: ${p.overdue.length} vencidas, ${p.today.length} hoje, ${p.week.length} próximas, ${none} sem prazo">
      <rect x="${pl - 8}" y="10" width="${X(-0.5) - pl + 8}" height="${base - 6}" rx="6" fill="var(--jv-crit)" fill-opacity=".06"/>
      <line x1="${pl}" x2="${W - pr}" y1="${base}" y2="${base}" stroke="var(--jv-line-2)"/>
      ${days.map(d => `<line x1="${X(d)}" x2="${X(d)}" y1="${base}" y2="${base + 5}" stroke="var(--jv-line-2)"/><text x="${X(d)}" y="${base + 19}" text-anchor="middle" class="ax" ${d === 0 ? 'fill="var(--jv-warn)"' : ""}>${d === 0 ? "HOJE" : (d > 0 ? "+" : "") + d + "d"}</text>`).join("")}
      <line x1="${X(0)}" x2="${X(0)}" y1="6" y2="${base}" stroke="var(--jv-warn)" stroke-width="1.4" class="tl2__now"/>
      <text x="${X(-2.5)}" y="24" text-anchor="middle" class="tl2__zone">VENCIDAS · ${p.overdue.length}</text>
      <text x="${X(3.5)}" y="24" text-anchor="middle" class="tl2__zone tl2__zone--n">PRÓXIMAS · ${p.week.length}</text>
      ${dots.join("")}
      <g class="tl2__none" data-drill="pend_none" data-tip="Sem prazo|${none} pendências"><rect x="${W - pr + 14}" y="${base - 54}" width="50" height="54" rx="6" fill="none" stroke="var(--jv-line-2)" stroke-dasharray="3 3"/><text x="${W - pr + 39}" y="${base - 24}" text-anchor="middle" class="tl2__nn">${none}</text><text x="${W - pr + 39}" y="${base + 19}" text-anchor="middle" class="ax">S/ PRAZO</text></g>
    </svg>`;
  }

  // ---------------- Barras de líderes (vendedores) ----------------
  function leaders(rows, o = {}) {
    const max = Math.max(1, ...rows.map(r => r.pipe));
    return `<ol class="ld">${rows.map((r, i) => { const conv = r.conv == null ? null : r.conv; const dash = conv == null ? 0 : conv * 100; return `<li><button type="button" class="ld__row" data-drill="${o.drill}" data-dv="${r.id}" aria-label="${esc(r.label)}: pipeline ${F.brlc(r.pipe)}, conversão ${F.pct(conv)}. Abrir registros">
      <span class="ld__rank mono">${String(i + 1).padStart(2, "0")}</span>
      <span class="ld__av"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="var(--jv-bg-2)" stroke-width="3"/><circle cx="18" cy="18" r="15" fill="none" stroke="var(--jv-violet)" stroke-width="3" pathLength="100" stroke-dasharray="${dash.toFixed(0)} 100" transform="rotate(-90 18 18)" stroke-linecap="round"/></svg><b>${esc(r.label.split(" ").map(s => s[0]).join("").slice(0, 2))}</b></span>
      <span class="ld__who"><b>${esc(r.label)}</b><small>${esc(r.sub)}</small></span>
      <span class="ld__bar"><i style="width:${((r.pipe / max) * 100).toFixed(1)}%" data-k="ld-${r.id}" data-w="${((r.pipe / max) * 100).toFixed(1)}"></i></span>
      <span class="ld__val"><b>${F.brlc(r.pipe)}</b><small>${conv == null ? "sem concluídas" : F.pct(conv) + " conversão"}</small></span></button></li>`; }).join("")}</ol>`;
  }

  // ---------------- Movimento de entrada: números contam do zero ----------------
  function intro(root) {
    if (C.reduced()) return;
    root.querySelectorAll("[data-v][data-f]").forEach((el, i) => {
      const to = parseFloat(el.dataset.v); if (isNaN(to)) return; const f = el.dataset.f, t0 = performance.now() + Math.min(i, 18) * 22, dur = 1100;
      const final = el.textContent; const step = (t) => { const p = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - p, 4); el.textContent = p >= 1 ? final : C.fmt(f, to * e) + (el.dataset.suffix || ""); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  // Luz que acompanha o cursor nos painéis (só ponteiro fino).
  function spotlight() {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    document.addEventListener("pointermove", e => { const p = e.target.closest && e.target.closest(".cp, .rep, .kpi, .attn__card, .cmd"); if (!p) return; const r = p.getBoundingClientRect(); p.style.setProperty("--mx", (e.clientX - r.left) + "px"); p.style.setProperty("--my", (e.clientY - r.top) + "px"); }, { passive: true });
  }

  window.FX = { radar, reactor, ribbon, conduit, series, heat, treemap, squarify, diverge, donut, timeline, leaders, intro, spotlight, STAGE };
})();
