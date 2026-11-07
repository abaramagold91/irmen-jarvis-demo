/* Peças comuns das telas: barra de recorte, texto de filtros e links com o mesmo recorte. */
(function () {
  "use strict";
  const C = window.IRC; const { D, L, esc, icon, PERIODS, periodRange, periodLabel, S, SELLER_LOCK } = C;

  const OPTS = {
    period: () => PERIODS.map(p => [p.id, p.label]),
    branch: () => [["", "Todas as filiais"], ...D.BRANCHES.map(b => [b.id, b.label])],
    seller: () => [["", "Todos os vendedores"], ...D.SELLERS.map(s => [s.id, s.label])],
    mgr: () => [["", "Todas as gerências"], ...D.MANAGERS.map(m => [m.id, m.label])],
    modality: () => [["", "Todas as modalidades"], ...D.MODALITIES.map(m => [m.id, m.label])],
    bank: () => [["", "Todas as instituições"], ...D.BANKS.map(b => [b.id, b.label])]
  };
  const LABEL = { period: "Período", branch: "Filial", seller: "Vendedor", mgr: "Gerência", modality: "Modalidade", bank: "Instituição", cmp: "Comparativo", cmpf: "Comparar a partir de" };
  const DEFAULTS = { period: "90d" };
  const valueLabel = (key, v) => { if (key === "cmp") return v ? "ligado" : "desligado"; if (key === "cmpf") return C.dmy(v); const o = (OPTS[key] ? OPTS[key]() : []).find(x => x[0] === v); return o ? o[1] : v; };

  function filterText(q, keys) {
    const parts = keys.filter(k => k !== "period" && (k === "seller" ? (S.profile === "seller" || q[k]) : q[k])).map(k => k === "seller" && S.profile === "seller" ? valueLabel("seller", SELLER_LOCK) + " (seu escopo)" : valueLabel(k, q[k]));
    return parts.length ? `<span class="hl">${parts.map(esc).join(" · ")}</span>` : "nenhum além do seu escopo";
  }
  const periodText = (q) => `<span class="hl">${periodLabel(q.period || "90d")}</span> · ${periodRange(q.period || "90d").label}`;

  function select(key, q, opts) {
    const locked = key === "seller" && S.profile === "seller";
    const v = locked ? SELLER_LOCK : (q[key] || (DEFAULTS[key] || ""));
    const active = key === "period" ? v !== "90d" : !!v;
    return `<label class="jv-field"><span>${opts && opts.label || LABEL[key]}</span><select class="jv-select" data-q="${key}" data-active="${active}" ${locked ? "disabled title=\"Perfil vendedor: escopo travado nas suas oportunidades\"" : ""}>${(opts && opts.options || OPTS[key]()).map(([id, l]) => `<option value="${esc(id)}" ${id === v ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>`;
  }
  // Barra de recorte: filtros, chips do recorte ativo, estado da aplicação e impressão digital do recorte.
  function recorte(q, keys, o = {}) {
    return `<section class="recorte" aria-label="Recorte desta tela" data-recorte>
      <div class="recorte__row">${keys.map(k => select(k, q, o.custom && o.custom[k])).join("")}
        <button type="button" class="ds-button ds-button--ghost ds-button--sm" data-act="clear" ${chipsCount(q, keys) ? "" : "disabled"}>${icon("x")}Limpar recorte</button>
        <span class="recorte__status" role="status" data-recorte-status>${icon("check")}Recorte aplicado</span>
      </div>
      <div class="recorte__chips" data-chips>${chips(q, keys, o)}</div>
      <div class="recorte__progress" aria-hidden="true"><i></i></div>
    </section>`;
  }
  function chipsCount(q, keys) { return keys.filter(k => k === "period" ? (q.period && q.period !== "90d") : (k === "seller" && S.profile === "seller") ? false : !!q[k]).length; }
  function chips(q, keys, o = {}) {
    const base = (o.base || []).map(b => `<span class="chip chip--base">${icon("info")}${b}</span>`).join("");
    const act = keys.filter(k => k === "period" ? true : (k === "seller" && S.profile === "seller") ? true : !!q[k]).map(k => {
      const locked = (k === "seller" && S.profile === "seller"), isDefault = k === "period" && (!q.period || q.period === "90d");
      const v = k === "seller" && locked ? SELLER_LOCK : (q[k] || DEFAULTS[k]);
      const label = (o.custom && o.custom[k] && o.custom[k].options ? (o.custom[k].options.find(x => x[0] === v) || [, v])[1] : valueLabel(k, v));
      return `<span class="chip" data-chip="${k}"><span>${o.custom && o.custom[k] && o.custom[k].label || LABEL[k]}: <b>${esc(label)}</b>${isDefault ? " <span class=\"dim\">(padrão)</span>" : ""}${locked ? " <span class=\"dim\">(seu escopo)</span>" : ""}</span>${isDefault || locked ? "" : `<button type="button" data-unchip="${k}" aria-label="Remover filtro ${esc(LABEL[k] || k)}">${icon("x")}</button>`}</span>`;
    }).join("");
    return `<span class="recorte__label">Recorte</span>${act}${base}<span class="recorte__fp" title="Impressão digital do recorte. A mesma aparece no detalhamento e na exportação." data-fp>${C.fingerprint(Object.fromEntries(keys.map(k => [k, q[k] || DEFAULTS[k] || ""])))}</span>`;
  }
  // Mantém o recorte comum ao navegar entre Dashboard, BI e Relatórios.
  const carry = (q, extra = {}) => { const out = {}; ["period", "branch", "mgr", "seller", "modality", "bank", "cmp", "cmpf"].forEach(k => { if (q[k]) out[k] = q[k]; }); return Object.assign(out, extra); };
  const href = (path, q) => C.buildHash(path, q);

  window.IRV = { OPTS, LABEL, filterText, periodText, recorte, chips, chipsCount, carry, href, valueLabel };
})();
