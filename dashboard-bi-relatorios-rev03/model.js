/*
 * Modelo do protótipo: recortes e métricas calculados sobre os DADOS SINTÉTICOS.
 * As fórmulas espelham os contratos existentes (ver MATRIZ-DE-FONTES.md). Onde não há contrato, a métrica é marcada como proposta.
 */
(function () {
  "use strict";
  const C = window.IRC; const { D, L, periodRange, inRange, localDate, monthKey, S, SELLER_LOCK } = C;

  // Escopo do usuário (perfil do laboratório). Vendedor lê somente as próprias oportunidades e operações.
  const scoped = (arr) => S.profile === "seller" ? arr.filter(x => x.seller === SELLER_LOCK) : arr;
  const empty = () => S.scenario === "empty";

  function dims(q) { return { branch: q.branch || "", seller: S.profile === "seller" ? SELLER_LOCK : (q.seller || ""), modality: q.modality || "", bank: q.bank || "" }; }
  const matchDims = (x, d) => (!d.branch || x.branch === d.branch) && (!d.seller || x.seller === d.seller) && (!d.modality || x.modality === d.modality);

  // Oportunidades: período pela data de criação (contrato atual do BI comercial).
  function opps(q) {
    if (empty()) return [];
    const r = periodRange(q.period || "90d"), d = dims(q);
    return scoped(D.opportunities).filter(o => matchDims(o, d) && inRange(o.createdAt, r));
  }
  // Oportunidades encerradas no período (data de ganho/perda) — PROPOSTA (BI-DEP-03).
  function oppsClosed(q) {
    if (empty()) return [];
    const r = periodRange(q.period || "90d"), d = dims(q);
    return scoped(D.opportunities).filter(o => matchDims(o, d) && o.closedAt && inRange(o.closedAt, r) && (o.status === "WON" || o.status === "LOST"));
  }
  // Operações: estado atual, sem período, a menos que a base de data seja informada.
  function ops(q, basis) {
    if (empty()) return [];
    const d = dims(q); let list = scoped(D.operations).filter(o => matchDims(o, d) && (!d.bank || o.banks.some(l => l.bank === d.bank)));
    if (basis) { const r = periodRange(q.period || "90d"); list = list.filter(o => inRange(o[basis], r)); }
    return list;
  }
  function commercialMetrics(list) {
    const open = list.filter(o => o.status === "OPEN"), won = list.filter(o => o.status === "WON"), lost = list.filter(o => o.status === "LOST");
    const sum = a => a.reduce((s, o) => s + o.amount, 0);
    const age = open.length ? open.reduce((s, o) => s + (D.NOW - new Date(o.createdAt)) / 86400000, 0) / open.length : null;
    return { population: list.length, open, won, lost, openCount: open.length, pipeline: sum(open), wonCount: won.length, wonAmount: sum(won), lostCount: lost.length, conversion: won.length + lost.length ? won.length / (won.length + lost.length) : null, avgAge: age };
  }
  const ACTIVE = ["received", "in_review", "formalization", "billing"];
  // Taxa geral de aprovação: operações decididas, base data de criação da operação (contrato OPERATION_DECIDED_APPROVAL_V2).
  function credit(q) {
    const r = periodRange(q.period || "90d"), all = ops(q).filter(o => inRange(o.createdAt, r));
    const decided = all.filter(o => o.state !== "cancelled" && ["APPROVED", "APPROVED_WITH_CONDITIONS", "REJECTED"].includes(o.decision));
    const approved = decided.filter(o => o.decision !== "REJECTED"), rejected = decided.filter(o => o.decision === "REJECTED");
    const cat = q.cat || "ALL";
    const sel = decided.filter(o => cat === "ALL" || (cat === "REJECTED" ? o.decision === "REJECTED" : cat === "FULL" ? ["BANK_FULL", "INTERNAL_FULL"].includes(o.category) : ["BANK_PARTIAL", "INTERNAL_PARTIAL"].includes(o.category)));
    const cats = { BANK_FULL: 0, BANK_PARTIAL: 0, INTERNAL_FULL: 0, INTERNAL_PARTIAL: 0 }; approved.forEach(o => { if (o.category) cats[o.category]++; });
    return { range: r, universe: all.length, decided, approved, rejected, rate: decided.length ? approved.length / decided.length : null, sel, cat, cats,
      pending: all.filter(o => o.decision === "PENDING" && o.state !== "cancelled"), cancelled: all.filter(o => o.state === "cancelled") };
  }
  function pendings(q) {
    if (empty()) return { overdue: [], today: [], week: [], none: [], all: [] };
    const d = dims(q); const today = localDate(D.NOW.toISOString());
    const list = scoped(D.pendings).filter(p => (!d.branch || p.branch === d.branch) && (!d.seller || p.seller === d.seller));
    const out = { overdue: [], today: [], week: [], none: [], all: list };
    list.forEach(p => { if (!p.dueAt) return out.none.push(p); const day = localDate(p.dueAt); if (day < today) out.overdue.push(p); else if (day === today) out.today.push(p); else out.week.push(p); });
    ["overdue", "today", "week"].forEach(k => out[k].sort((a, b) => a.dueAt.localeCompare(b.dueAt)));
    return out;
  }
  function docs(q) {
    const list = ops(q).filter(o => ACTIVE.includes(o.state) || q.dstage === "all");
    const observable = list.filter(o => o.docs);
    const rows = []; observable.forEach(o => o.docs.forEach(dc => { if (!q.req || dc.req === q.req) rows.push({ op: o, ...dc }); }));
    const count = s => rows.filter(r => r.state === s).length;
    const complete = observable.filter(o => o.docs.length && o.docs.every(dc => ["VALIDATED", "WAIVED"].includes(dc.state)));
    return { list, observable, rows, applicable: rows.length, validated: count("VALIDATED"), received: count("RECEIVED"), waived: count("WAIVED"), missing: count("MISSING"), complete };
  }
  function months(n) { const out = []; const d = new Date(D.NOW.getTime()); for (let i = n - 1; i >= 0; i--) { const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)); out.push(x.toISOString().slice(0, 7)); } return out; }
  function monthsInPeriod(q) { const r = periodRange(q.period || "90d"); const n = q.period === "30d" ? 2 : q.period === "180d" ? 6 : q.period === "ytd" ? 11 : q.period === "all" ? 6 : 3; return months(n).filter(m => !r.from || m >= r.from.slice(0, 7)); }

  window.IRM = { dims, opps, oppsClosed, ops, commercialMetrics, credit, pendings, docs, months, monthsInPeriod, ACTIVE, monthKey, scoped };
})();
