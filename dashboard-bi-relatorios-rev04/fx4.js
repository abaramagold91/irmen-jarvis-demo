/*
 * FX4 · Gráficos da REV04. Regra de desenho: o texto nunca escala com o SVG.
 * Linhas e áreas usam SVG esticado com traço sem escala; rótulos, pontos e áreas de clique são HTML.
 * Gráficos radiais usam SVG de tamanho fixo. Assim o mesmo gráfico fica fino no notebook e no monitor grande.
 */
(function () {
  "use strict";
  const C = window.IRC;
  const { F, esc } = C;
  // Ordem validada (validate_palette): CVD adjacente ≥ 6,6 no escuro e no claro; todo uso tem legenda e rótulo direto.
  const CAT = ["var(--jv-arc)", "var(--jv-warn)", "var(--jv-violet)", "var(--jv-teal)", "var(--jv-indigo)", "var(--jv-magenta)"];
  const fmtOf = f => typeof f === "function" ? f : (v => C.fmt(f || "int", v));
  const nice = v => { if (v <= 0) return 1; const e = Math.pow(10, Math.floor(Math.log10(v))); const n = v / e; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * e; };
  let uid = 0; const nid = p => p + (++uid);
  const tipAttr = (a, b) => `data-tip="${esc(a)}|${esc(b)}"`;

  // Caminho suave (monotônico) em coordenadas 0..1000 × 0..100.
  function smooth(pts) {
    if (!pts.length) return ""; if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
    const n = pts.length, dx = [], m = [], t = [];
    for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / (dx[i] || 1); }
    t[0] = m[0]; t[n - 1] = m[n - 2];
    for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n - 1; i++) { const h = dx[i] / 3; d += ` C${(pts[i][0] + h).toFixed(1)},${(pts[i][1] + t[i] * h).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)},${(pts[i + 1][1] - t[i + 1] * h).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`; }
    return d;
  }

  // ---------- 1. Série temporal: linha, área, colunas ou acumulado, com série comparada tracejada ----------
  function ts(sets, o = {}) {
    const f = fmtOf(o.f); const mode = o.mode || "area"; const h = o.h || 200;
    let S = sets.filter(s => s && s.pts && s.pts.length);
    if (!S.length) return C.state("empty", "Sem dados no período", "Nada registrado nesta janela.");
    if (mode === "cum") S = S.map(s => { let acc = 0; return { ...s, pts: s.pts.map(p => ({ ...p, v: (acc += p.v) })) }; });
    const n = Math.max(...S.map(s => s.pts.length));
    let max = o.yMax || nice(Math.max(1, ...S.flatMap(s => s.pts.map(p => p.v))) * 1.08);
    if (!o.yMax && (o.f === "int" || !o.f) && max < 400) max = Math.ceil(max / 4) * 4; // quartos inteiros no eixo de contagem
    const main = S[0];
    const X = i => n === 1 ? 500 : (i / (n - 1)) * 1000;
    const Y = v => 100 - (v / max) * 100;
    const every = Math.max(1, Math.ceil(n / (o.ticks || 8)));
    const grid = [0, 0.25, 0.5, 0.75, 1].map(g => `<i class="ts4__g" style="bottom:${g * 100}%"><span>${f(max * g)}</span></i>`).join(""); const yw = Math.max(36, Math.ceil(Math.max(...[0, 0.25, 0.5, 0.75, 1].map(g => String(f(max * g)).length)) * 6.3) + 10);
    const peakI = main.pts.reduce((b, p, i, a) => p.v > a[b].v ? i : b, 0);
    let plot = "";
    if (mode === "cols") {
      const per = S.length;
      plot = `<div class="ts4__cols">${Array.from({ length: n }, (_, i) => `<div class="ts4__cg">${S.map((s, si) => { const p = s.pts[i]; if (!p) return `<span class="ts4__c" style="height:0"></span>`; return `<span class="ts4__c${s.dash ? " is-prev" : ""}" style="--c:${s.color || CAT[si]};height:${(p.v / max * 100).toFixed(2)}%;--i:${i}"></span>`; }).join("")}</div>`).join("")}</div>`;
      void per;
    } else {
      const gid = nid("tsg");
      plot = `<svg class="ts4__svg" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><defs>${S.map((s, si) => `<linearGradient id="${gid}-${si}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.color || CAT[si]}" stop-opacity="${s.dash ? 0 : 0.28}"/><stop offset="1" stop-color="${s.color || CAT[si]}" stop-opacity="0"/></linearGradient>`).join("")}</defs>
        ${S.map((s, si) => { const pts = s.pts.map((p, i) => [X(i), Y(p.v)]); const d = smooth(pts); const area = mode !== "line" && !s.dash ? `<path d="${d} L${X(s.pts.length - 1)},100 L${X(0)},100 Z" fill="url(#${gid}-${si})"/>` : ""; return `${area}<path class="ts4__ln${s.dash ? " is-prev" : ""}" d="${d}" fill="none" stroke="${s.color || CAT[si]}" vector-effect="non-scaling-stroke" pathLength="1"/>`; }).join("")}</svg>
        ${S.map((s, si) => s.dash || s.pts.length > 40 ? "" : s.pts.map((p, i) => `<i class="ts4__dot" style="left:${X(i) / 10}%;top:${Y(p.v)}%;--c:${s.color || CAT[si]}"></i>`).join("")).join("")}
        ${o.peak !== false && main.pts[peakI].v > 0 ? `<span class="ts4__peak${X(peakI) > 880 ? " is-r" : ""}" style="left:${X(peakI) / 10}%;top:${Y(main.pts[peakI].v)}%"><b>${f(main.pts[peakI].v)}</b></span>` : ""}`;
    }
    const hits = Array.from({ length: n }, (_, i) => {
      const lines = S.map(s => s.pts[i] ? `${s.label}: ${f(s.pts[i].v)}${s.pts[i].label && s.dash ? " (" + s.pts[i].label + ")" : ""}` : "").filter(Boolean).join(" · ");
      const p = main.pts[i]; const attrs = o.drill && p ? o.drill(p, i) : "";
      const pos = mode === "cols" ? `left:${(i / n * 100).toFixed(3)}%;width:${(100 / n).toFixed(3)}%` : `left:${(n === 1 ? 0 : (i - 0.5) / (n - 1) * 100).toFixed(3)}%;width:${n === 1 ? 100 : (100 / (n - 1)).toFixed(3)}%`;
      return `<button type="button" class="ts4__hit" style="${pos}" ${tipAttr(p ? p.long || p.label : "", lines)} ${attrs} aria-label="${esc((p ? p.long || p.label : "") + ": " + lines)}"><i></i></button>`;
    }).join("");
    const xl = main.pts.map((p, i) => i % every === 0 || i === n - 1 ? `<span style="left:${mode === "cols" ? ((i + 0.5) / n * 100).toFixed(3) : X(i) / 10}%"${mode !== "cols" && n > 1 && i === n - 1 ? ' class="is-end"' : mode !== "cols" && i === 0 ? ' class="is-start"' : ""}>${esc(p.label)}</span>` : "").join("");
    const legend = S.length > 1 ? `<div class="lg4">${S.map((s, si) => `<span><i class="${s.dash ? "is-prev" : ""}" style="--c:${s.color || CAT[si]}"></i>${esc(s.label)}</span>`).join("")}</div>` : "";
    return `<figure class="ts4" data-mode="${mode}" style="--h:${h}px;--yw:${yw}px" role="img" aria-label="${esc(o.label || "Série no tempo")}"><div class="ts4__plot">${grid}${plot}<div class="ts4__hits">${hits}</div></div><div class="ts4__x">${xl}</div>${legend}</figure>`;
  }

  // ---------- 2. Barras horizontais com marca do período comparado ----------
  function hb(items, o = {}) {
    if (!items.length) return C.state("empty", "Sem dados", "Nada a mostrar neste recorte.");
    const f = fmtOf(o.f);
    const max = o.max || Math.max(1, ...items.map(i => Math.max(Math.abs(i.v), i.prev || 0)));
    const div = !!o.diverge;
    return `<div class="hb4${div ? " hb4--div" : ""}${o.dense ? " hb4--dense" : ""}" role="list">${items.map((it, i) => {
      const w = Math.abs(it.v) / max * (div ? 50 : 100);
      const left = div ? (it.v >= 0 ? 50 : 50 - w) : 0;
      const pw = it.prev != null ? (it.prev / max * 100) : null;
      const tag = it.attrs ? "button" : "div";
      return `<${tag} ${it.attrs ? `type="button" ${it.attrs}` : ""} class="hb4__r" role="listitem" style="--c:${it.color || o.color || "var(--jv-arc)"};--i:${i}" ${tipAttr(it.label, (it.text || f(it.v)) + (it.sub ? " · " + it.sub : "") + (it.prev != null ? " · antes " + f(it.prev) : ""))}>
        <span class="hb4__l">${it.logo ? `<img class="lg-chip" src="${it.logo}" alt="">` : it.avatar ? `<span class="av4" style="--c:${it.color || "var(--jv-arc)"}">${esc(it.avatar)}</span>` : o.rank ? `<span class="hb4__n">${String(i + 1).padStart(2, "0")}</span>` : ""}<span class="hb4__t"><b>${esc(it.label)}</b>${it.sub ? `<small>${esc(it.sub)}</small>` : ""}</span></span>
        <span class="hb4__tr">${div ? `<i class="hb4__zero"></i>` : ""}<i class="hb4__f" style="left:${left.toFixed(2)}%;width:${w.toFixed(2)}%"></i>${pw != null ? `<i class="hb4__p" style="left:${Math.min(100, pw).toFixed(2)}%" title="Período comparado"></i>` : ""}</span>
        <span class="hb4__v"><b>${it.text || f(it.v)}</b>${it.d || ""}${it.small ? `<small>${it.small}</small>` : ""}</span>
      </${tag}>`;
    }).join("")}</div>${o.cmpLegend ? `<div class="lg4"><span><i style="--c:${o.color || "var(--jv-arc)"}"></i>Período atual</span><span><i class="is-tick"></i>Período comparado</span></div>` : ""}`;
  }

  // ---------- 3. Linhas empilhadas (composição por linha) ----------
  function stackRows(rows, parts, o = {}) {
    if (!rows.length) return C.state("empty", "Sem dados", "Nada a mostrar neste recorte.");
    const f = fmtOf(o.f); const max = o.pct ? 1 : Math.max(1, ...rows.map(r => parts.reduce((s, p) => s + (r.segs[p.id] || 0), 0)));
    return `<div class="sr4" role="list">${rows.map(r => {
      const tot = parts.reduce((s, p) => s + (r.segs[p.id] || 0), 0) || 0;
      return `<div class="sr4__r" role="listitem"><span class="sr4__l">${r.logo ? `<img class="lg-chip" src="${r.logo}" alt="">` : ""}<span><b>${esc(r.label)}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</span></span>
        <span class="sr4__bar" style="--w:${o.pct ? 100 : (tot / max * 100).toFixed(2)}%">${parts.map(p => { const v = r.segs[p.id] || 0; if (!v) return ""; const share = tot ? v / tot : 0; const a = o.segAttr ? o.segAttr(r, p) : ""; return `<button type="button" class="sr4__s" style="flex-grow:${v};--c:${p.color}" ${a} ${tipAttr(r.label + " · " + p.label, f(v) + " · " + F.pct(share))} aria-label="${esc(r.label + ", " + p.label + ": " + f(v))}">${share > 0.12 ? `<span>${o.pct ? F.pct(share) : f(v)}</span>` : ""}</button>`; }).join("")}</span>
        <span class="sr4__v">${r.total || f(tot)}</span></div>`;
    }).join("")}</div><div class="lg4">${parts.map(p => `<span><i style="--c:${p.color}"></i>${esc(p.label)}</span>`).join("")}</div>`;
  }

  // ---------- 4. Matriz de calor ----------
  function grid(rows, cols, cell, o = {}) {
    if (!rows.length) return C.state("empty", "Sem dados", "Nada a mostrar neste recorte.");
    const vals = rows.flatMap(r => cols.map(c => cell(r, c).v)); const max = Math.max(1, ...vals);
    return `<div class="gd4" style="--cols:${cols.length}" role="table" aria-label="${esc(o.label || "Matriz")}">
      <div class="gd4__h" role="row"><span role="columnheader">${esc(o.corner || "")}</span>${cols.map(c => `<span role="columnheader" title="${esc(c.label)}">${esc(c.short || c.label)}</span>`).join("")}${o.total ? `<span role="columnheader">Total</span>` : ""}</div>
      ${rows.map(r => `<div class="gd4__r" role="row"><span class="gd4__rl" role="rowheader">${r.logo ? `<img class="lg-chip" src="${r.logo}" alt="">` : ""}<b>${esc(r.label)}</b></span>${cols.map(c => { const x = cell(r, c); const a = x.v / max; return `<button type="button" role="cell" class="gd4__c" style="--a:${a.toFixed(3)};--c:${o.color || "var(--jv-arc)"}" ${x.attrs || ""} ${tipAttr(r.label + " · " + c.label, x.tip || x.text)} ${x.v ? "" : "data-zero=\"true\""}><span>${x.v ? x.text : "·"}</span></button>`; }).join("")}${o.total ? `<span class="gd4__t mono">${o.total(r)}</span>` : ""}</div>`).join("")}
      <div class="gd4__scale"><span>menos</span><i style="--c:${o.color || "var(--jv-arc)"}"></i><span>mais</span></div></div>`;
  }

  // ---------- 5. Anel refinado (sombra, brilho e vãos) ----------
  function ring(parts, o = {}) {
    const total = parts.reduce((s, p) => s + p.v, 0);
    if (!total) return C.state("empty", "Sem dados", "Nada a mostrar neste recorte.");
    const f = fmtOf(o.f); const size = o.size || 210, r = 78, sw = 22, gid = nid("rg");
    let acc = 0; const gap = parts.filter(p => p.v).length > 1 ? 0.8 : 0;
    const arcs = parts.map((p, i) => { const len = p.v / total * 100; const seg = `<circle class="rg4__s" cx="105" cy="105" r="${r}" pathLength="100" stroke="${p.color}" stroke-width="${sw}" fill="none" stroke-dasharray="${Math.max(0, len - gap).toFixed(2)} ${(100 - Math.max(0, len - gap)).toFixed(2)}" stroke-dashoffset="${(-acc).toFixed(2)}" style="--i:${i}" ${p.attrs || ""} ${tipAttr(p.label, f(p.v) + " · " + F.pct(p.v / total))} tabindex="${p.attrs ? 0 : -1}"/>`; acc += len; return seg; }).join("");
    return `<div class="rg4${o.side === false ? " rg4--solo" : ""}"><div class="rg4__fig"><svg width="${size}" height="${size}" viewBox="0 0 210 210" role="img" aria-label="${esc(o.label || "Composição")}">
        <defs><radialGradient id="${gid}" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="var(--jv-arc)" stop-opacity=".16"/><stop offset="1" stop-color="var(--jv-arc)" stop-opacity="0"/></radialGradient><filter id="${gid}-f" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000" flood-opacity=".35"/></filter></defs>
        <circle cx="105" cy="105" r="${r + sw / 2 + 8}" fill="url(#${gid})"/><circle cx="105" cy="105" r="${r}" fill="none" stroke="var(--jv-bg-2)" stroke-width="${sw}"/>
        <mask id="${gid}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="210" height="210"><circle class="rg4__m" cx="105" cy="105" r="${r}" pathLength="100" stroke="#fff" stroke-width="${sw + 14}" fill="none" stroke-dasharray="100 100" transform="rotate(-90 105 105)"/></mask>
        <g mask="url(#${gid}-m)"><g transform="rotate(-90 105 105)" filter="url(#${gid}-f)">${arcs}</g></g>
        <circle cx="105" cy="105" r="${r - sw / 2 - 6}" fill="none" stroke="var(--jv-line-2)" stroke-dasharray="1 3"/>
      </svg><div class="rg4__c"><b${String(o.centerText || F.int(total)).length > 7 ? ' class="is-long"' : ""}>${o.centerText || F.int(total)}</b><span>${esc(o.center || "total")}</span></div></div>
      ${o.side === false ? "" : `<div class="rg4__leg" role="list">${parts.map(p => `<${p.attrs ? "button type=\"button\"" : "div"} class="rg4__li" role="listitem" style="--c:${p.color}" ${p.attrs || ""}><i></i><span class="rg4__ln">${esc(p.label)}${p.note ? `<small>${p.note}</small>` : ""}</span><span class="rg4__lb"><i style="width:${(p.v / total * 100).toFixed(1)}%"></i></span><b>${f(p.v)}</b><span class="dim mono">${F.pct(p.v / total)}</span>${p.d || ""}</${p.attrs ? "button" : "div"}>`).join("")}</div>`}</div>`;
  }

  // ---------- 6. Barras radiais (alternativa ao medidor) ----------
  function radial(items, o = {}) {
    const size = o.size || 220, cx = size / 2, n = items.length, sw = Math.min(14, (size / 2 - 24) / n - 4);
    const max = o.max || 1; const sweep = 270;
    const arc = (r, frac) => { const a0 = -135 * Math.PI / 180, a1 = (-135 + sweep * Math.max(0.0001, Math.min(1, frac))) * Math.PI / 180; const x0 = cx + r * Math.sin(a0), y0 = cx - r * Math.cos(a0), x1 = cx + r * Math.sin(a1), y1 = cx - r * Math.cos(a1); return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${sweep * frac > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`; };
    const rings = items.map((it, i) => { const r = size / 2 - 14 - i * (sw + 5); return `<path d="${arc(r, 1)}" stroke="var(--jv-bg-2)" stroke-width="${sw}" fill="none" stroke-linecap="round"/><path class="rd4__a" d="${arc(r, it.v / max)}" stroke="${it.color}" stroke-width="${sw}" fill="none" stroke-linecap="round" pathLength="1" style="--i:${i}" ${it.attrs || ""} ${tipAttr(it.label, it.text)} tabindex="${it.attrs ? 0 : -1}"/>`; }).join("");
    return `<div class="rd4"><div class="rd4__fig"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(o.label || "Barras radiais")}">${rings}</svg>${o.center ? `<div class="rd4__c">${o.center}</div>` : ""}</div>
      <div class="rd4__leg">${items.map(it => `<${it.attrs ? "button type=\"button\"" : "div"} class="rd4__li" style="--c:${it.color}" ${it.attrs || ""}><i></i><span>${esc(it.label)}</span><b>${it.text}</b>${it.sub ? `<small>${it.sub}</small>` : ""}</${it.attrs ? "button" : "div"}>`).join("")}</div></div>`;
  }

  // ---------- 7. Funil clássico (trapézios com brilho) ----------
  function funnel(stages, o = {}) {
    const f = fmtOf(o.f); const max = Math.max(1, ...stages.map(s => s.v));
    const w = v => 22 + (v / max) * 78;
    return `<div class="fn4" role="list" aria-label="${esc(o.label || "Funil")}">${stages.map((s, i) => {
      const a = w(s.v), b = i < stages.length - 1 ? w(stages[i + 1].v) : a * 0.86;
      const conv = i > 0 && stages[i - 1].v ? s.v / stages[i - 1].v : null;
      return `<button type="button" class="fn4__r" role="listitem" style="--a:${a.toFixed(2)};--b:${b.toFixed(2)};--c:${s.color || CAT[0]};--i:${i}" ${s.attrs || ""} ${tipAttr(s.full || s.label, (s.text || f(s.v)) + (s.sub ? " · " + s.sub : ""))}>
        <span class="fn4__l"><span class="fn4__n mono">${String(i + 1).padStart(2, "0")}</span>${esc(s.label)}</span>
        <span class="fn4__band"><span class="fn4__shape"><b>${s.text || f(s.v)}</b></span></span>
        <span class="fn4__s">${s.sub ? esc(s.sub) : ""}${conv != null && o.conv !== false ? `<small class="mono">${F.pct(conv)} da anterior</small>` : ""}</span></button>`;
    }).join("")}</div>`;
  }

  // ---------- 8. Fluxo de etapas refinado (largura = volume, linhas de passagem entre etapas) ----------
  function stream(stages, o = {}) {
    const f = fmtOf(o.f); const n = stages.length; const max = Math.max(1, ...stages.map(s => s.v)); const gid = nid("st");
    const half = v => 6 + (v / max) * 40;
    const pts = []; stages.forEach((s, i) => { const x0 = i / n * 1000, x1 = (i + 1) / n * 1000; pts.push([x0 + 18, half(s.v)], [x1 - 18, half(s.v)]); });
    const top = smooth(pts.map(([x, h]) => [x, 50 - h])), bot = smooth(pts.slice().reverse().map(([x, h]) => [x, 50 + h]));
    const path = `${top} L${pts[pts.length - 1][0]},${50 + pts[pts.length - 1][1]} ${bot.replace(/^M/, "L")} Z`;
    return `<div class="st4" style="--n:${n}" role="list" aria-label="${esc(o.label || "Pipeline por etapa")}">
      <div class="st4__heads">${stages.map((s, i) => `<span class="st4__hd"><small class="mono">${String(i + 1).padStart(2, "0")}</small>${esc(s.label)}</span>`).join("")}</div>
      <div class="st4__band"><svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" x2="1"><stop offset="0" stop-color="var(--jv-arc)"/><stop offset=".55" stop-color="var(--jv-indigo)"/><stop offset="1" stop-color="var(--jv-violet)"/></linearGradient>
          <linearGradient id="${gid}-s" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>${C.reduced() ? "" : `<animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0" dur="5.5s" repeatCount="indefinite"/>`}</linearGradient></defs>
          <path d="${path}" fill="url(#${gid})" fill-opacity=".26"/><path d="${path}" fill="url(#${gid}-s)"/><path d="${top}" fill="none" stroke="url(#${gid})" stroke-width="1.6" vector-effect="non-scaling-stroke"/><path d="${bot}" fill="none" stroke="url(#${gid})" stroke-width="1.6" vector-effect="non-scaling-stroke"/>
          <line x1="0" y1="50" x2="1000" y2="50" stroke="var(--jv-line-2)" stroke-dasharray="4 6" vector-effect="non-scaling-stroke"/></svg>
        ${stages.map((s, i) => `<button type="button" class="st4__seg" style="left:${i / n * 100}%;width:${100 / n}%" ${s.attrs || ""} ${tipAttr(s.full || s.label, (s.text || f(s.v)) + (s.sub ? " · " + s.sub : ""))} aria-label="${esc((s.full || s.label) + ": " + (s.text || f(s.v)))}"><b>${s.text || f(s.v)}</b></button>`).join("")}
        ${stages.slice(1).map((s, i) => { const a = stages[i].v, conv = a ? s.v / a : null; return `<span class="st4__gate" style="left:${(i + 1) / n * 100}%"><i></i>${conv != null ? `<small class="mono" title="Abertas nesta etapa ÷ abertas na anterior">${conv >= 1 ? "▲" : "▼"}${F.int(Math.abs(conv - 1) * 100)}%</small>` : ""}</span>`; }).join("")}
      </div>
      <div class="st4__foot">${stages.map(s => `<span class="mono">${s.sub ? esc(s.sub) : ""}</span>`).join("")}</div></div>`;
  }

  // ---------- 9. Árvore de decomposição (de onde para onde) ----------
  function tree(root, o = {}) {
    const f = fmtOf(o.f); const colW = o.colW || 210, nodeH = 40, rowH = 50, gapX = o.gapX || 70;
    const levels = []; (function walk(n, d) { (levels[d] = levels[d] || []).push(n); n.depth = d; (n.children || []).forEach(c => { c.parent = n; walk(c, d + 1); }); })(root, 0);
    let leafY = 0; (function place(n) { const ch = (n.children || []).filter(c => c.v > 0); n.kids = ch; if (!ch.length) { n.y = leafY * rowH; leafY++; } else { ch.forEach(place); n.y = (ch[0].y + ch[ch.length - 1].y) / 2; } })(root);
    const H = Math.max(1, leafY) * rowH - (rowH - nodeH); const W = levels.length * colW + (levels.length - 1) * gapX;
    const xOf = d => d * (colW + gapX);
    const nodes = []; const links = [];
    (function draw(n) { nodes.push(n); n.kids.forEach(c => { links.push([n, c]); draw(c); }); })(root);
    const pid = nid("tr");
    const linkSvg = links.map(([a, b], i) => { const x0 = xOf(a.depth) + colW, y0 = a.y + nodeH / 2, x1 = xOf(b.depth), y1 = b.y + nodeH / 2, mx = (x0 + x1) / 2; const w = Math.max(1.4, Math.min(10, (b.v / Math.max(1, root.v)) * 22)); const d = `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`; return `<path d="${d}" stroke="${b.color}" stroke-width="${w.toFixed(1)}" stroke-opacity=".38" fill="none" id="${pid}-${i}"/>${C.reduced() ? "" : `<circle r="2.2" fill="${b.color}"><animateMotion dur="${(2.6 + (i % 4) * 0.4).toFixed(1)}s" repeatCount="indefinite" begin="-${(i * 0.3).toFixed(1)}s"><mpath href="#${pid}-${i}"/></animateMotion></circle>`}`; }).join("");
    const nodeHtml = nodes.map(n => { const share = n.parent ? n.v / Math.max(1, n.parent.v) : 1; const tag = n.attrs ? "button" : "div"; return `<${tag} ${n.attrs ? `type="button" ${n.attrs}` : ""} class="tr4__n" style="left:${xOf(n.depth)}px;top:${n.y}px;width:${colW}px;height:${nodeH}px;--c:${n.color}" ${tipAttr(n.label, f(n.v) + (n.parent ? " · " + F.pct(share) + " de " + n.parent.label : ""))}>
        <i class="tr4__bar" style="width:${(share * 100).toFixed(1)}%"></i><span class="tr4__l">${esc(n.label)}</span><b class="tr4__v">${f(n.v)}</b>${n.parent ? `<small class="tr4__p mono">${F.pct(share)}</small>` : ""}</${tag}>`; }).join("");
    const heads = (o.heads || []).map((h, d) => `<span style="left:${xOf(d)}px;width:${colW}px">${esc(h)}</span>`).join("");
    return `<div class="tr4" role="img" aria-label="${esc(o.label || "Árvore de decomposição")}"><div class="tr4__in" style="width:${W}px">${heads ? `<div class="tr4__heads">${heads}</div>` : ""}<div class="tr4__cv" style="height:${H}px"><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">${linkSvg}</svg>${nodeHtml}</div></div></div>`;
  }

  // ---------- 10. Trilho de etapas (resumo operacional, fino) ----------
  function rail(stages, o = {}) {
    const max = Math.max(1, ...stages.map(s => s.v));
    return `<div class="rl4" role="list" aria-label="${esc(o.label || "Etapas")}">${stages.map((s, i) => `<button type="button" class="rl4__n" role="listitem" style="--c:${s.color};--i:${i};--lv:${(s.v / max).toFixed(3)}" ${s.attrs || ""} ${tipAttr(s.label, s.v + " operações · " + s.money + " · " + s.res)}>
        <span class="rl4__top"><small class="mono">${esc(s.step)}</small>${s.d || ""}</span>
        <span class="rl4__name">${esc(s.label)}</span>
        <span class="rl4__v"><b data-k="${o.k}-${s.id}" data-v="${s.v}" data-f="int">${F.int(s.v)}</b><small>operações</small></span>
        <span class="rl4__lvl"><i></i></span>
        <span class="rl4__meta"><span>${esc(s.money)}</span><span>${esc(s.res)}</span></span>
      </button>${i < stages.length - 1 ? `<span class="rl4__link" aria-hidden="true"><i></i></span>` : ""}`).join("")}</div>`;
  }

  // ---------- 11. Dispersão (bolhas, faixa de preços, histórico) ----------
  function scatter(points, o = {}) {
    if (!points.length) return C.state("empty", "Sem dados", "Nada a mostrar neste recorte.");
    const xs = points.map(p => p.x), xmin = o.xmin != null ? o.xmin : Math.min(...xs), xmax = o.xmax != null ? o.xmax : Math.max(...xs);
    const rows = o.rows; const ys = points.map(p => p.y || 0);
    const ymin = o.ymin != null ? o.ymin : Math.min(...ys), ymax = o.ymax != null ? o.ymax : Math.max(...ys);
    const X = x => xmax === xmin ? 50 : 4 + (x - xmin) / (xmax - xmin) * 92;
    const Y = p => rows ? ((rows.indexOf(p.row) + 0.5) / rows.length * 100) : (ymax === ymin ? 50 : 96 - (p.y - ymin) / (ymax - ymin) * 92);
    const fx = fmtOf(o.fx), fy = fmtOf(o.fy);
    const ticks = [0, 0.5, 1].map(t => `<span style="left:${4 + t * 92}%">${fx(xmin + (xmax - xmin) * t)}</span>`).join("");
    return `<figure class="sc4${rows ? " sc4--rows" : ""}" style="--h:${o.h || (rows ? rows.length * 40 : 240)}px" role="img" aria-label="${esc(o.label || "Dispersão")}">
      ${rows ? `<div class="sc4__rows">${rows.map(r => `<span>${esc(o.rowLabel ? o.rowLabel(r) : r)}</span>`).join("")}</div>` : `<div class="sc4__yl"><span>${fy(ymax)}</span><span>${esc(o.yLabel || "")}</span><span>${fy(ymin)}</span></div>`}
      <div class="sc4__plot">${rows ? rows.map((r, i) => `<i class="sc4__lane" style="top:${(i + 0.5) / rows.length * 100}%"></i>`).join("") : [0.25, 0.5, 0.75].map(g => `<i class="sc4__g" style="top:${g * 100}%"></i>`).join("")}
        ${o.vline != null ? `<i class="sc4__v" style="left:${X(o.vline)}%"><span>${esc(o.vlineLabel || "")}</span></i>` : ""}
        ${o.hline != null ? `<i class="sc4__h" style="top:${96 - (o.hline - ymin) / ((ymax - ymin) || 1) * 92}%"><span>${esc(o.hlineLabel || "")}</span></i>` : ""}
        ${points.map((p, i) => `<${p.attrs ? "button type=\"button\"" : "span"} class="sc4__p${p.hl ? " is-hl" : ""}" style="left:${X(p.x)}%;top:${Y(p)}%;--r:${p.r || 9}px;--c:${p.color || "var(--jv-arc)"};--i:${i % 30}" ${p.attrs || ""} ${tipAttr(p.tipT || p.label || "", p.tip || "")}>${p.label && o.labels ? `<em>${esc(p.label)}</em>` : ""}</${p.attrs ? "button" : "span"}>`).join("")}
      </div><div class="sc4__x">${ticks}</div>${o.xLabel ? `<div class="sc4__xl">${esc(o.xLabel)}</div>` : ""}</figure>`;
  }

  // ---------- 12. Radar de indicadores (comparativo de vendedores) ----------
  function spider(axes, series, o = {}) {
    const size = o.size || 300, cx = size / 2, R = size / 2 - 46, n = axes.length;
    const pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * R * r, cx + Math.sin(a) * R * r]; };
    const rings = [0.25, 0.5, 0.75, 1].map(r => `<polygon points="${axes.map((_, i) => pt(i, r).join(",")).join(" ")}" fill="none" stroke="var(--jv-line)"/>`).join("");
    const spokes = axes.map((a, i) => { const [x, y] = pt(i, 1), [lx, ly] = pt(i, 1.2); return `<line x1="${cx}" y1="${cx}" x2="${x}" y2="${y}" stroke="var(--jv-line)"/><text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" class="sp4__ax">${esc(a.label)}</text>`; }).join("");
    const polys = series.map((s, si) => `<polygon class="sp4__poly" points="${s.v.map((v, i) => pt(i, Math.max(0.02, Math.min(1, v))).join(",")).join(" ")}" fill="${s.color}" fill-opacity=".14" stroke="${s.color}" stroke-width="2" style="--i:${si}"/>${s.v.map((v, i) => { const [x, y] = pt(i, Math.max(0.02, Math.min(1, v))); return `<circle cx="${x}" cy="${y}" r="3.5" fill="${s.color}" ${tipAttr(s.label + " · " + axes[i].label, s.t[i])}/>`; }).join("")}`).join("");
    return `<div class="sp4"><svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(o.label || "Radar de indicadores")}">${rings}${spokes}${polys}</svg><div class="lg4 lg4--col">${series.map(s => `<span><i style="--c:${s.color}"></i>${esc(s.label)}</span>`).join("")}<span class="dim">Cada eixo vai de 0 ao maior valor entre os escolhidos.</span></div></div>`;
  }

  // ---------- 13. Mapa de UFs em ladrilhos ----------
  const UF_POS = { RR: [3, 0], AP: [5, 0], AM: [2, 1], PA: [4, 1], MA: [5, 1], CE: [6, 1], RN: [7, 1], AC: [1, 2], RO: [2, 2], TO: [4, 2], PI: [5, 2], PB: [7, 2], PE: [6, 2], MT: [3, 2], AL: [7, 3], SE: [6, 3], BA: [5, 3], GO: [4, 3], DF: [4, 4], MS: [3, 4], MG: [5, 4], ES: [6, 4], SP: [4, 5], RJ: [5, 5], PR: [3, 5], SC: [3, 6], RS: [2, 6] };
  function tiles(values, o = {}) {
    const max = Math.max(1, ...Object.values(values).map(v => v.v));
    return `<div class="uf4" role="list" aria-label="${esc(o.label || "Mapa por UF")}">${Object.entries(UF_POS).map(([uf, [x, y]]) => { const it = values[uf]; const a = it ? it.v / max : 0; return `<${it && it.attrs ? "button type=\"button\"" : "span"} class="uf4__t${it ? "" : " is-empty"}" role="listitem" style="grid-column:${x + 1};grid-row:${y + 1};--a:${a.toFixed(3)};--c:${o.color || "var(--jv-teal)"}" ${it ? `${it.attrs || ""} ${tipAttr(uf, it.text + (it.sub ? " · " + it.sub : ""))}` : `title="${uf}: sem vendas"`}><b>${uf}</b>${it ? `<small>${it.short || it.text}</small>` : ""}</${it && it.attrs ? "button" : "span"}>`; }).join("")}</div>
      <div class="gd4__scale"><span>menos</span><i style="--c:${o.color || "var(--jv-teal)"}"></i><span>mais</span></div>`;
  }

  // ---------- 14. Bala de meta (realizado × meta × projeção) ----------
  function bullet(rows, o = {}) {
    const f = fmtOf(o.f);
    return `<div class="bu4" role="list">${rows.map((r, i) => { const max = Math.max(r.goal || 1, r.proj || 0, r.actual) * 1.08; const pa = r.actual / max * 100, pg = (r.goal || 0) / max * 100, pp = (r.proj || 0) / max * 100; const pct = r.goal ? r.actual / r.goal : null; const tone = pct == null ? "none" : pct >= 1 ? "good" : (r.proj || 0) >= r.goal ? "ok" : "risk";
      return `<${r.attrs ? "button type=\"button\"" : "div"} class="bu4__r" role="listitem" data-tone="${tone}" style="--i:${i}" ${r.attrs || ""} ${tipAttr(r.label, `Realizado ${f(r.actual)} · meta ${f(r.goal || 0)}${r.proj ? " · projeção " + f(r.proj) : ""}`)}>
        <span class="bu4__l">${r.avatar ? `<span class="av4" style="--c:${r.color || "var(--jv-arc)"}">${esc(r.avatar)}</span>` : ""}<span><b>${esc(r.label)}</b>${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</span></span>
        <span class="bu4__tr"><i class="bu4__pj" style="width:${pp.toFixed(1)}%"></i><i class="bu4__a" style="width:${pa.toFixed(1)}%"></i><i class="bu4__g" style="left:${pg.toFixed(1)}%"></i></span>
        <span class="bu4__v"><b>${pct == null ? "—" : F.pct(pct)}</b><small>${f(r.actual)} de ${f(r.goal || 0)}</small></span></${r.attrs ? "button" : "div"}>`; }).join("")}</div>
      <div class="lg4"><span><i style="--c:var(--jv-arc)"></i>Realizado</span><span><i class="is-hatch"></i>Projeção no ritmo atual</span><span><i class="is-goal"></i>Meta</span></div>`;
  }

  // ---------- 15. Duelo mensal: perdidas à esquerda, ganhas à direita ----------
  function duel(groups, o = {}) {
    const max = Math.max(1, ...groups.flatMap(g => [g.won, g.lost, g.pwon || 0, g.plost || 0]));
    return `<div class="du4" role="list" aria-label="${esc(o.label || "Ganhos e perdas")}">
      <div class="du4__h"><span>Perdidas</span><span></span><span>Ganhas</span><span class="r">Saldo · taxa</span></div>
      ${groups.map((g, i) => { const rate = g.won + g.lost ? g.won / (g.won + g.lost) : null; return `<div class="du4__r" role="listitem" style="--i:${i}">
        <button type="button" class="du4__side du4__side--l" ${g.lostAttrs || ""} ${tipAttr(g.long || g.label, `${g.lost} perdidas${g.plost != null ? " · antes " + g.plost : ""}`)}><i style="width:${(g.lost / max * 100).toFixed(1)}%"></i>${g.plost != null ? `<em style="width:${(g.plost / max * 100).toFixed(1)}%"></em>` : ""}<b>${g.lost}</b></button>
        <span class="du4__m mono">${esc(g.label)}</span>
        <button type="button" class="du4__side du4__side--r" ${g.wonAttrs || ""} ${tipAttr(g.long || g.label, `${g.won} ganhas${g.pwon != null ? " · antes " + g.pwon : ""}`)}><i style="width:${(g.won / max * 100).toFixed(1)}%"></i>${g.pwon != null ? `<em style="width:${(g.pwon / max * 100).toFixed(1)}%"></em>` : ""}<b>${g.won}</b></button>
        <span class="du4__net mono" data-up="${g.won >= g.lost}">${g.won - g.lost >= 0 ? "+" : "−"}${Math.abs(g.won - g.lost)}<small>${rate == null ? "—" : F.pct(rate)}</small></span></div>`; }).join("")}
      ${o.cmp ? `<div class="lg4"><span><i style="--c:var(--jv-arc)"></i>Ganhas</span><span><i style="--c:var(--jv-brand)"></i>Perdidas</span><span><i class="is-tick"></i>Período comparado</span></div>` : `<div class="lg4"><span><i style="--c:var(--jv-arc)"></i>Ganhas</span><span><i style="--c:var(--jv-brand)"></i>Perdidas</span></div>`}</div>`;
  }

  // ---------- 16. Cascata (o que explica a diferença) ----------
  function waterfall(steps, o = {}) {
    const f = fmtOf(o.f); let acc = 0; const bars = [];
    steps.forEach(s => { if (s.total) { bars.push({ ...s, a: 0, b: s.v }); acc = s.v; } else { bars.push({ ...s, a: acc, b: acc + s.v }); acc += s.v; } });
    const max = Math.max(1, ...bars.map(b => Math.max(b.a, b.b))), min = Math.min(0, ...bars.map(b => Math.min(b.a, b.b)));
    const Y = v => (v - min) / (max - min) * 100;
    return `<div class="wf4" role="list" aria-label="${esc(o.label || "Cascata")}">${bars.map((b, i) => { const lo = Math.min(b.a, b.b), hi = Math.max(b.a, b.b); const tone = b.total ? "total" : b.v >= 0 ? "up" : "down"; return `<button type="button" class="wf4__c" role="listitem" data-tone="${tone}" style="--i:${i}" ${b.attrs || ""} ${tipAttr(b.label, (b.total ? "" : b.v >= 0 ? "+" : "−") + f(Math.abs(b.v)))}><span class="wf4__plot"><i style="bottom:${Y(lo).toFixed(1)}%;height:${Math.max(0.8, Y(hi) - Y(lo)).toFixed(1)}%"></i><b style="bottom:${(Y(hi) + 1).toFixed(1)}%">${b.total ? "" : b.v >= 0 ? "+" : "−"}${f(Math.abs(b.v))}</b></span><span class="wf4__l">${esc(b.label)}</span></button>`; }).join("")}</div>`;
  }

  // ---------- 17. Linha do prazo (pendências antes e depois de hoje) ----------
  function dueline(items, o = {}) {
    const span = o.span || 7, today = C.localDate(C.D.NOW.toISOString());
    const dayIdx = iso => Math.round((Date.parse(C.localDate(iso) + "T12:00:00Z") - Date.parse(today + "T12:00:00Z")) / 86400000);
    const cols = {}; items.filter(p => p.dueAt).forEach(p => { const d = Math.max(-span, Math.min(span, dayIdx(p.dueAt))); (cols[d] = cols[d] || []).push(p); });
    const none = items.filter(p => !p.dueAt);
    const lanes = Array.from({ length: span * 2 + 1 }, (_, i) => i - span);
    return `<div class="dl4w"><div class="dl4l" style="--n:${lanes.length}">${lanes.map(d => `<div class="dl4l__c${d < 0 ? " is-late" : d === 0 ? " is-today" : ""}"><div class="dl4l__stack">${(cols[d] || []).map(p => `<button type="button" class="dl4l__p" style="--c:${o.color ? o.color(p) : "var(--jv-arc)"}" ${o.attrs ? o.attrs(p) : ""} ${tipAttr(p.title, p.operation + " · " + (d < 0 ? "venceu há " + Math.abs(d) + " d" : d === 0 ? "vence hoje" : "vence em " + d + " d"))} aria-label="${esc(p.title)}"></button>`).join("")}</div><span class="dl4l__d mono">${d === 0 ? "hoje" : (d > 0 ? "+" : "") + d}</span></div>`).join("")}</div>
      <div class="dl4w__f"><span class="dim">${icon2("clock")} ${C.plural(none.length, "pendência sem prazo", "pendências sem prazo")}</span><span class="lg4" style="margin:0"><span><i style="--c:var(--jv-crit)"></i>Vencida</span><span><i style="--c:var(--jv-warn)"></i>Hoje</span><span><i style="--c:var(--jv-arc)"></i>A vencer</span></span></div></div>`;
  }
  const icon2 = n => C.icon(n);

  // ---------- 18. Barra de composição com chaves de grupo (alternativa ao mosaico) ----------
  function segbar(parts, groups, o = {}) {
    const total = parts.reduce((s, p) => s + p.v, 0) || 1;
    return `<div class="sb4"><div class="sb4__bar">${parts.map((p, i) => `<button type="button" class="sb4__s${p.dim ? " is-dim" : ""}" style="flex-grow:${p.v};--c:${p.color};--i:${i}" ${p.attrs || ""} ${tipAttr(p.label, F.int(p.v) + " · " + F.pct(p.v / total))}><b>${p.v / total > 0.08 ? F.int(p.v) : ""}</b></button>`).join("")}</div>
      <div class="sb4__groups">${groups.map(g => { const v = parts.filter(p => g.ids.includes(p.id)).reduce((s, p) => s + p.v, 0); return `<span class="sb4__g" style="flex-grow:${Math.max(v, 0.0001)}"><i></i><b>${esc(g.label)}</b><small class="mono">${F.int(v)} · ${F.pct(v / total)}</small></span>`; }).join("")}</div>
      <div class="lg4">${parts.map(p => `<span><i style="--c:${p.color}"></i>${esc(p.label)} · ${F.int(p.v)}</span>`).join("")}</div></div>`;
  }

  // ---------- 19. Velas de decisão em HTML (aprovadas para cima, reprovadas para baixo; compactas para notebook) ----------
  function candles(groups, o = {}) {
    if (!groups.length) return C.state("empty", "Sem decisões", "Nenhuma decisão no período.");
    const max = Math.max(1, ...groups.flatMap(g => [g.up, g.down, g.pup || 0, g.pdown || 0]));
    const hp = v => (v / max * 100).toFixed(1);
    const up = o.upLabel || "aprovadas", dn = o.downLabel || "reprovadas";
    return `<figure class="cn4" style="--h:${o.h || 150}px;--n:${groups.length}" role="img" aria-label="${esc(o.label || "Decisões por mês")}: ${groups.map(g => `${g.long || g.label} ${g.up} ${up}, ${g.down} ${dn}`).join("; ")}">
      <div class="cn4__plot">${groups.map((g, i) => { const t = g.up + g.down, r = t ? g.up / t : null; return `<div class="cn4__g" style="--i:${i}">
        <span class="cn4__r mono">${r == null ? "—" : F.pct(r)}</span>
        <div class="cn4__h cn4__h--up"><button type="button" class="cn4__b" style="height:${hp(g.up)}%" ${g.upAttrs || ""} ${tipAttr(g.long || g.label, `${g.up} ${up} · ${g.down} ${dn}${r == null ? "" : " · " + F.pct(r) + " de aprovação"}${g.pup != null ? " · antes " + g.pup : ""}`)} aria-label="${esc((g.long || g.label) + ": " + g.up + " " + up)}">${g.up ? `<b>${g.up}</b>` : ""}</button>${g.pup != null ? `<i class="cn4__p" style="bottom:${hp(g.pup)}%"></i>` : ""}</div>
        <div class="cn4__h cn4__h--dn"><button type="button" class="cn4__b" style="height:${hp(g.down)}%" ${g.downAttrs || ""} ${tipAttr(g.long || g.label, `${g.down} ${dn}${g.pdown != null ? " · antes " + g.pdown : ""}`)} aria-label="${esc((g.long || g.label) + ": " + g.down + " " + dn)}">${g.down ? `<b>${g.down}</b>` : ""}</button>${g.pdown != null ? `<i class="cn4__p" style="top:${hp(g.pdown)}%"></i>` : ""}</div>
        <span class="cn4__x mono">${esc(g.label)}</span></div>`; }).join("")}</div>
      <div class="lg4"><span><i style="--c:var(--jv-arc)"></i>${o.upLegend || "Aprovadas (acima)"}</span><span><i style="--c:var(--jv-brand)"></i>${o.downLegend || "Reprovadas (abaixo)"}</span>${groups.some(g => g.pup != null) ? `<span><i class="is-tick"></i>Período comparado</span>` : ""}<span class="dim">topo: % de aprovação</span></div></figure>`;
  }

  // ---------------- Calendário de calor (HTML: texto não escala) ----------------
  function heatCal(counts, o = {}) {
    const from = o.from, to = o.to, D0 = s => Date.parse(s + "T12:00:00Z");
    const startDow = (new Date(D0(from)).getUTCDay() + 6) % 7, start = D0(from) - startDow * 864e5;
    const weeks = Math.ceil((D0(to) - start) / 864e5 / 7 + 1e-9) || 1;
    const max = Math.max(1, ...Object.values(counts)); const MN = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
    let months = "", cells = "", lastM = -1;
    for (let w = 0; w < weeks; w++) {
      const d0 = new Date(start + w * 7 * 864e5); const m = d0.getUTCMonth();
      if (m !== lastM) { months += `<span style="grid-column:${w + 2}">${MN[m]}</span>`; lastM = m; }
      for (let d = 0; d < 7; d++) {
        const t = start + (w * 7 + d) * 864e5, key = new Date(t).toISOString().slice(0, 10);
        if (key < from || key > to) { cells += `<i class="hc4__c is-out" style="grid-column:${w + 2};grid-row:${d + 2}"></i>`; continue; }
        const v = counts[key] || 0, lv = v ? Math.ceil((v / max) * 4) : 0;
        const attrs = v && o.attrs ? o.attrs(key, v) : "";
        cells += `<i class="hc4__c" data-l="${lv}" style="grid-column:${w + 2};grid-row:${d + 2}" ${attrs} data-tip="${key.split("-").reverse().join("/")}|${v} ${o.unit || ""}"></i>`;
      }
    }
    const days = ["seg","","qua","","sex","","dom"].map((l, d) => `<b style="grid-row:${d + 2}">${l}</b>`).join("");
    return `<figure class="hc4" aria-label="${o.label || "Calendário"}"><div class="hc4__g" style="--w:${weeks}">${months}${days}${cells}</div>
      <div class="heat__legend"><span>menos</span>${[0, 1, 2, 3, 4].map(l => `<i data-l="${l}"></i>`).join("")}<span>mais</span></div></figure>`;
  }

  window.FX4 = { heatCal, CAT, candles, ts, hb, stackRows, grid, ring, radial, funnel, stream, tree, rail, scatter, spider, tiles, bullet, duel, waterfall, dueline, segbar, nice, smooth };
})();
