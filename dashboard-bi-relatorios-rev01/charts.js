/*
 * Gráficos JARVIS do protótipo (SVG puro). Cada marca é clicável quando há detalhamento e tem dica (data-tip).
 * Movimento só para explicar: desenho de entrada, transição entre recortes e "fantasma" do valor anterior.
 */
(function () {
  "use strict";
  const C = window.IRC; const { esc, F } = C;

  // Linha com área (série temporal). Uma série por gráfico; pontos clicáveis por período.
  function area(points, o = {}) {
    const W = 560, H = o.h || 190, pl = 34, pr = 12, pt = 16, pb = 26;
    const max = Math.max(1, ...points.map(p => p.v)) * 1.15;
    const x = i => pl + (points.length === 1 ? (W - pl - pr) / 2 : (i * (W - pl - pr)) / (points.length - 1));
    const y = v => pt + (H - pt - pb) * (1 - v / max);
    const pts = points.map((p, i) => [x(i), y(p.v)]);
    let d = "";
    pts.forEach(([px, py], i) => {
      if (!i) { d += `M${px},${py}`; return; }
      const [qx, qy] = pts[i - 1]; const cx = (qx + px) / 2; d += ` C${cx},${qy} ${cx},${py} ${px},${py}`;
    });
    const fill = d + ` L${pts[pts.length - 1][0]},${H - pb} L${pts[0][0]},${H - pb} Z`;
    const ticks = [0, 0.5, 1].map(t => Math.round((max / 1.15) * t));
    const id = "g" + Math.random().toString(36).slice(2, 7);
    const color = o.color || "var(--jv-arc)";
    const step = points.length > 1 ? (W - pl - pr) / (points.length - 1) : W - pl - pr;
    return `<svg class="area" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}: ${points.map(p => esc(p.label) + " " + F.int(p.v)).join(", ")}" style="width:100%;height:auto;display:block">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".38"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      ${ticks.map(t => `<g><line x1="${pl}" x2="${W - pr}" y1="${y(t)}" y2="${y(t)}" stroke="var(--jv-line)" stroke-dasharray="${t ? "3 4" : ""}"/><text x="${pl - 6}" y="${y(t) + 3}" text-anchor="end" font-size="9.5" fill="var(--jv-fg-3)" font-family="var(--jv-f-mono)">${F.int(t)}</text></g>`).join("")}
      <path d="${fill}" fill="url(#${id})" class="area__fill"/>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="2" pathLength="100" class="area__line"/>
      ${points.map((p, i) => `<g class="area__pt" ${o.drill ? `data-drill="${o.drill}" data-dv="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(p.label)}: ${F.int(p.v)}. Abrir registros"` : ""} data-tip="${esc(p.label)}|${F.int(p.v)} ${esc(o.unit || "")}">
        <rect x="${x(i) - step / 2}" y="${pt}" width="${step}" height="${H - pt - pb}" fill="transparent"/>
        <line x1="${x(i)}" x2="${x(i)}" y1="${pt}" y2="${H - pb}" class="area__cross"/>
        <circle cx="${x(i)}" cy="${y(p.v)}" r="4" fill="var(--jv-panel-solid)" stroke="${color}" stroke-width="2"/>
        <text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="9.5" fill="var(--jv-fg-3)" font-family="var(--jv-f-mono)">${esc(p.label)}</text>
        ${p.v ? `<text x="${x(i)}" y="${y(p.v) - 9}" text-anchor="middle" font-size="10" fill="var(--jv-fg-2)" font-family="var(--jv-f-mono)" class="area__val">${F.int(p.v)}</text>` : ""}
      </g>`).join("")}
    </svg>`;
  }

  // Sparkline para KPIs (sem eixo; a tendência acompanha o número).
  function spark(values, color = "var(--jv-arc)") {
    if (!values.length) return "";
    const W = 120, H = 28, max = Math.max(1, ...values), min = Math.min(...values);
    const pts = values.map((v, i) => [(i * W) / Math.max(1, values.length - 1), H - 3 - ((v - min) / Math.max(1, max - min)) * (H - 6)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true" preserveAspectRatio="none"><path d="${d} L${W},${H} L0,${H} Z" fill="${color}" opacity=".12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="1.6" pathLength="100" class="spark__line"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="2.6" fill="${color}"/></svg>`;
  }

  // Anel de estado: segmentos por etapa, número no centro. A varredura gira só enquanto atualiza.
  function ring(segs, o = {}) {
    const R = 74, r = 58, total = segs.reduce((s, x) => s + x.v, 0); let acc = 0;
    const gap = total ? 1.2 : 0;
    const arcs = segs.map(s => {
      const a0 = (acc / Math.max(1, total)) * 360, a1 = ((acc + s.v) / Math.max(1, total)) * 360; acc += s.v;
      if (!s.v) return "";
      const p = (a, rad) => [100 + rad * Math.sin((a * Math.PI) / 180), 100 - rad * Math.cos((a * Math.PI) / 180)];
      const b0 = a0 + gap / 2, b1 = Math.max(b0 + 0.1, a1 - gap / 2), large = b1 - b0 > 180 ? 1 : 0;
      const [x0, y0] = p(b0, R), [x1, y1] = p(b1, R), [x2, y2] = p(b1, r), [x3, y3] = p(b0, r);
      return `<path class="ring__seg" d="M${x0},${y0} A${R},${R} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${r},${r} 0 ${large} 0 ${x3},${y3} Z" fill="${s.color}" ${o.drill ? `data-drill="${o.drill}" data-dv="${s.id}" tabindex="0" role="button" aria-label="${esc(s.label)}: ${F.int(s.v)}. Abrir registros"` : ""} data-tip="${esc(s.label)}|${F.int(s.v)} ${esc(o.unit || "")} · ${F.pct(s.v / Math.max(1, total))}"/>`;
    }).join("");
    const ticks = Array.from({ length: 60 }, (_, i) => { const a = (i * 6 * Math.PI) / 180, l = i % 5 ? 3 : 7; return `<line x1="${100 + 88 * Math.sin(a)}" y1="${100 - 88 * Math.cos(a)}" x2="${100 + (88 - l) * Math.sin(a)}" y2="${100 - (88 - l) * Math.cos(a)}"/>`; }).join("");
    return `<div class="ring"><svg viewBox="0 0 200 200" role="img" aria-label="${esc(o.label || "")}: ${segs.map(s => esc(s.label) + " " + F.int(s.v)).join(", ")}">
      <g class="ring__ticks" stroke="var(--jv-line-2)" stroke-width="1">${ticks}</g>
      <circle cx="100" cy="100" r="${(R + r) / 2}" fill="none" stroke="var(--jv-bg-2)" stroke-width="${R - r}"/>
      <g class="ring__segs">${arcs}</g>
      <g class="ring__sweep"><path d="M100,100 L100,8 A92,92 0 0 1 165,35 Z" fill="url(#ringsweep)"/></g>
      <defs><linearGradient id="ringsweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--jv-arc)" stop-opacity="0"/><stop offset="1" stop-color="var(--jv-arc)" stop-opacity=".22"/></linearGradient></defs>
    </svg><div class="ring__c"><b class="num" data-k="${o.k}" data-v="${total}" data-f="int">${F.int(total)}</b><span>${esc(o.center || "")}</span></div></div>`;
  }

  // Funil horizontal centrado: largura proporcional ao valor; conectores mostram a passagem entre etapas.
  function funnel(items, o = {}) {
    const max = Math.max(1, ...items.map(i => i.v));
    return `<ol class="funnel" role="list">${items.map((i, idx) => {
      const w = Math.max(6, (i.v / max) * 100);
      return `<li><button type="button" class="funnel__row" ${o.drill ? `data-drill="${o.drill}" data-dv="${esc(i.id)}"` : ""} aria-label="${esc(i.label)}: ${esc(i.text)}${i.sub ? ", " + esc(i.sub) : ""}. Abrir registros" data-tip="${esc(i.label)}|${esc(i.text)}${i.sub ? " · " + esc(i.sub) : ""}">
        <span class="funnel__idx mono">${String(idx + 1).padStart(2, "0")}</span>
        <span class="funnel__lab">${esc(i.label)}</span>
        <span class="funnel__track"><span class="funnel__ghost" data-ghost="${o.k}-${esc(i.id)}"></span><span class="funnel__fill" data-k="${o.k}-${esc(i.id)}" data-w="${w.toFixed(2)}" style="width:${w.toFixed(2)}%;--b:${i.color || "var(--jv-arc)"}"></span></span>
        <span class="funnel__val"><b data-k="${o.k}-${esc(i.id)}-v" data-v="${i.v}" data-f="${o.f || "int"}">${esc(i.text)}</b>${i.sub ? `<small>${esc(i.sub)}</small>` : ""}</span>
      </button></li>`;
    }).join("")}</ol>`;
  }

  // Fluxo (Sankey simplificado): colunas de nós e bandas proporcionais. Usado para "do pipeline à operação" e transições bancárias.
  function flow(nodes, links, o = {}) {
    const W = o.w || 560, H = o.h || 240, nodeW = 10, pad = 14, top = 12, bottom = 12;
    const colsN = Math.max(...nodes.map(n => n.col)) + 1;
    const colX = c => 8 + (c * (W - 160 - nodeW)) / Math.max(1, colsN - 1) + (c ? 0 : 0);
    const val = {}; nodes.forEach(n => { const out = links.filter(l => l.s === n.id).reduce((s, l) => s + l.v, 0), inn = links.filter(l => l.t === n.id).reduce((s, l) => s + l.v, 0); val[n.id] = Math.max(out, inn, n.min || 0); });
    const colTotals = Array.from({ length: colsN }, (_, c) => nodes.filter(n => n.col === c).reduce((s, n) => s + val[n.id], 0));
    const colCount = Array.from({ length: colsN }, (_, c) => nodes.filter(n => n.col === c).length);
    const scale = Math.min(...colTotals.map((t, c) => (H - top - bottom - pad * (colCount[c] - 1)) / Math.max(1, t)));
    const pos = {}; for (let c = 0; c < colsN; c++) { let yy = top; nodes.filter(n => n.col === c).forEach(n => { const h = Math.max(2, val[n.id] * scale); pos[n.id] = { x: colX(c), y: yy, h, so: 0, to: 0 }; yy += h + pad; }); }
    const band = links.filter(l => l.v > 0).map(l => {
      const a = pos[l.s], b = pos[l.t], th = l.v * scale; const y0 = a.y + a.so + th / 2, y1 = b.y + b.to + th / 2; a.so += th; b.to += th;
      const x0 = a.x + nodeW, x1 = b.x, cx = (x0 + x1) / 2; const src = nodes.find(n => n.id === (l.colorBy === "t" ? l.t : l.s));
      return `<path class="flow__band" d="M${x0},${y0} C${cx},${y0} ${cx},${y1} ${x1},${y1}" stroke="${l.color || src.color}" stroke-width="${Math.max(1, th).toFixed(1)}" fill="none" pathLength="100" ${o.drill && l.dv ? `data-drill="${o.drill}" data-dv="${esc(l.dv)}" tabindex="0" role="button"` : ""} data-tip="${esc(nodes.find(n => n.id === l.s).label)} → ${esc(nodes.find(n => n.id === l.t).label)}|${F.int(l.v)} ${esc(o.unit || "")}"><title>${esc(nodes.find(n => n.id === l.s).label)} para ${esc(nodes.find(n => n.id === l.t).label)}: ${F.int(l.v)}</title></path>`;
    }).join("");
    const nodesSvg = nodes.map(n => { const p = pos[n.id]; const right = n.col === colsN - 1; return `<g class="flow__node" ${o.drill && n.dv ? `data-drill="${o.drill}" data-dv="${esc(n.dv)}" tabindex="0" role="button" aria-label="${esc(n.label)}: ${F.int(val[n.id])}"` : ""} data-tip="${esc(n.label)}|${F.int(val[n.id])} ${esc(o.unit || "")}">
      <rect x="${p.x}" y="${p.y}" width="${nodeW}" height="${p.h}" rx="2" fill="${n.color}"/>
      <text x="${right ? p.x + nodeW + 8 : p.x + nodeW + 8}" y="${p.y + p.h / 2 - 2}" font-size="13" fill="var(--jv-fg)" font-family="var(--jv-f-body)" font-weight="600">${esc(n.label)}</text>
      <text x="${p.x + nodeW + 8}" y="${p.y + p.h / 2 + 13}" font-size="11.5" fill="var(--jv-fg-3)" font-family="var(--jv-f-mono)">${F.int(val[n.id])}${n.note ? " · " + esc(n.note) : ""}</text></g>`; }).join("");
    return `<svg class="flow" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}" style="width:100%;max-width:${Math.round(W * 1.15)}px;height:auto;display:block;margin:0 auto">${band}${nodesSvg}</svg>`;
  }

  // Malha de fundo (assinatura JARVIS). Lenta, só desenho; pausa com movimento reduzido e com a aba oculta.
  function mesh(canvas) {
    const ctx = canvas.getContext("2d"); let w, h, pts = [], raf = 0;
    const css = () => getComputedStyle(document.documentElement);
    function size() { const r = window.devicePixelRatio || 1; w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * r; canvas.height = h * r; ctx.setTransform(r, 0, 0, r, 0, 0); const n = Math.round(Math.min(70, (w * h) / 26000)); pts = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12 })); }
    function frame() {
      const arc = css().getPropertyValue("--jv-arc").trim() || "#3fd0ff";
      ctx.clearRect(0, 0, w, h); ctx.strokeStyle = arc; ctx.fillStyle = arc;
      for (const p of pts) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) { const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y); if (d < 150) { ctx.globalAlpha = (1 - d / 150) * .14; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); } }
      ctx.globalAlpha = .35; for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.2, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      if (!C.reduced() && document.visibilityState === "visible") raf = requestAnimationFrame(frame); else raf = 0;
    }
    size(); frame(); window.addEventListener("resize", () => { size(); if (!raf) frame(); });
    document.addEventListener("visibilitychange", () => { if (!raf && document.visibilityState === "visible") frame(); });
    return { restart() { if (!raf) frame(); } };
  }

  // Ponte visual do detalhamento: um retângulo sai do número clicado e vira a gaveta.
  function morph(fromEl, toRect) {
    if (!fromEl || C.reduced()) return;
    const a = fromEl.getBoundingClientRect(); const g = document.createElement("div"); g.className = "morph";
    Object.assign(g.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
    document.body.appendChild(g); void g.offsetWidth;
    Object.assign(g.style, { left: toRect.left + "px", top: toRect.top + "px", width: toRect.width + "px", height: toRect.height + "px", opacity: "0" });
    setTimeout(() => g.remove(), 520);
  }

  window.IRCH = { area, spark, ring, funnel, flow, mesh, morph };
})();
