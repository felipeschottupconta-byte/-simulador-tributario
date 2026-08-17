import React, { useState, useMemo } from "react";

// ---------- helpers ----------
const fmtBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    isFinite(v) ? v : 0
  );
const fmtPct = (v, d = 2) => `${(isFinite(v) ? v : 0).toFixed(d).replace(".", ",")}%`;
const num = (v) => {
  let s = String(v).trim();
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) ? n : 0;
};

// ---------- small UI atoms ----------
function CurrencyField({ label, value, onChange, hint }) {
  const [text, setText] = useState(() => String(value).replace(".", ","));
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input-wrap">
        <span className="field-prefix">R$</span>
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(num(e.target.value));
          }}
          onBlur={() => setText(String(num(text)).replace(".", ","))}
        />
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function PercentField({ label, value, onChange, hint }) {
  const [text, setText] = useState(() => String(value).replace(".", ","));
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-input-wrap">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(num(e.target.value));
          }}
          onBlur={() => setText(String(num(text)).replace(".", ","))}
        />
        <span className="field-suffix">%</span>
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function FixedBadge({ label, value, note }) {
  return (
    <div className="badge">
      <span className="badge-dot" />
      <span className="badge-label">{label}</span>
      <span className="badge-value">{value}%</span>
      {note && <span className="badge-note">{note}</span>}
    </div>
  );
}

function ReqBadge({ label }) {
  return (
    <div className="badge">
      <span className="badge-dot req-dot" />
      <span className="badge-label">{label}</span>
    </div>
  );
}

function Row({ label, value, sub, strong, negative }) {
  return (
    <div className={`row ${strong ? "row-strong" : ""}`}>
      <span className="row-label">
        {label}
        {sub && <span className="row-sub"> {sub}</span>}
      </span>
      <span className={`row-value ${negative ? "row-negative" : ""}`}>
        {typeof value === "number" ? fmtBRL(value) : value}
      </span>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`stat stat-${tone || "neutral"}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function MemoriaCompleta({ title, icms, base, icmsDestacado, icmsValor, difalValor, g, f }) {
  const aliq = (v) => (base > 0 ? fmtPct((v / base) * 100) : "—");
  return (
    <details className="memoria" open>
      <summary>
        <span>{title || "Memória de cálculo completa"}</span>
        <span className="memoria-chevron">▾</span>
      </summary>
      <div className="memoria-body">
        <div className="memoria-line memoria-section-title">ICMS</div>
        {icms}

        <div className="memoria-line memoria-section-title memoria-gap">Federais (Lucro Presumido)</div>
        {f.excedente > 0 && (
          <>
            <div className="memoria-line">
              Faturamento acima do limite (LC 224/2025) = {fmtBRL(base)} − {fmtBRL(base - f.excedente)} ={" "}
              {fmtBRL(f.excedente)}
            </div>
            <div className="memoria-line-hint">
              nessa parcela, presunção IRPJ vai pra {fmtPct(f.presuncaoIRPJMajorada)} e CSLL pra{" "}
              {fmtPct(f.presuncaoCSLLMajorada)} (+10%)
            </div>
          </>
        )}
        <div className="memoria-line">
          Base IRPJ = {fmtBRL(base - f.excedente)} × {g.presuncaoIRPJ}%
          {f.excedente > 0 && ` + ${fmtBRL(f.excedente)} × ${fmtPct(f.presuncaoIRPJMajorada)}`} ={" "}
          {fmtBRL(f.baseIRPJ)}
        </div>
        <div className="memoria-line">
          IRPJ (15%) = {fmtBRL(f.baseIRPJ)} × 15% = {fmtBRL(f.irpjNormal)}
        </div>
        <div className="memoria-line">
          Adicional = máx(0; {fmtBRL(f.baseIRPJ)} − {fmtBRL(g.limiteAdicionalIRPJ)}) × 10% ={" "}
          {fmtBRL(f.irpjAdicional)}
        </div>
        <div className="memoria-line memoria-total">IRPJ total = {fmtBRL(f.irpjTotal)}</div>
        <div className="memoria-line-hint">alíquota efetiva IRPJ (s/ faturamento) = {aliq(f.irpjTotal)}</div>

        <div className="memoria-line memoria-gap">
          Base CSLL = {fmtBRL(base - f.excedente)} × {g.presuncaoCSLL}%
          {f.excedente > 0 && ` + ${fmtBRL(f.excedente)} × ${fmtPct(f.presuncaoCSLLMajorada)}`} ={" "}
          {fmtBRL(f.baseCSLL)}
        </div>
        <div className="memoria-line memoria-total">
          CSLL (9%) = {fmtBRL(f.baseCSLL)} × 9% = {fmtBRL(f.csll)}
        </div>
        <div className="memoria-line-hint">alíquota efetiva CSLL (s/ faturamento) = {aliq(f.csll)}</div>

        <div className="memoria-line memoria-gap">
          Base PIS/COFINS = {fmtBRL(base)} − {fmtBRL(icmsDestacado)} (ICMS destacado) ={" "}
          {fmtBRL(f.basePisCofins)}
        </div>
        <div className="memoria-line-hint">exclusão do ICMS da base — RE 574.706/STF ("tese do século")</div>
        <div className="memoria-line">
          PIS = {fmtBRL(f.basePisCofins)} × 0,65% = {fmtBRL(f.pis)}
        </div>
        <div className="memoria-line-hint">alíquota efetiva PIS (s/ faturamento) = {aliq(f.pis)}</div>
        <div className="memoria-line memoria-total">
          COFINS = {fmtBRL(f.basePisCofins)} × 3% = {fmtBRL(f.cofins)}
        </div>
        <div className="memoria-line-hint">alíquota efetiva COFINS (s/ faturamento) = {aliq(f.cofins)}</div>

        {icmsValor !== undefined && (
          <>
            <div className="memoria-line memoria-section-title memoria-gap">Alíquotas efetivas (sobre faturamento)</div>
            <div className="memoria-line">ICMS = {aliq(icmsValor)}</div>
            <div className="memoria-line">DIFAL = {aliq(difalValor)}</div>
            <div className="memoria-line">IRPJ = {aliq(f.irpjTotal)}</div>
            <div className="memoria-line">CSLL = {aliq(f.csll)}</div>
            <div className="memoria-line">PIS = {aliq(f.pis)}</div>
            <div className="memoria-line">COFINS = {aliq(f.cofins)}</div>
            <div className="memoria-line memoria-total">TOTAL = {aliq(icmsValor + difalValor + f.total)}</div>
          </>
        )}
      </div>
    </details>
  );
}

// ---------- App ----------
export default function App() {
  const [tab, setTab] = useState(1);
  const [showParams, setShowParams] = useState(false);

  const [global_, setGlobal] = useState({
    presuncaoIRPJ: 8,
    presuncaoCSLL: 12,
    limiteAdicionalIRPJ: 20000,
    limiteMajoracaoMensal: 416666.67,
  });

  const [c1, setC1] = useState({
    faturamento: 249581.75,
    icmsSaida: 11.8,
    difal: 8.09,
    compras: 33742.23,
    icmsCompra: 4,
  });

  const [c2, setC2] = useState({
    valorCompra: 0,
    icmsCompra: 12,
    valorTransferencia: 0,
    custoTransferencia: 70,
    valorVenda: 0,
    difal: 8,
  });

  const [c3, setC3] = useState({
    valorCompra: 0,
    valorVenda: 0,
    custoTransferencia: 70,
    cargaEfetiva: 3.5,
    difal: 6.79,
  });

  const ICMS_TRANSFER = 12;
  const ICMS_VENDA_FILIAL = 12;

  const upd = (setter, field) => (v) =>
    setter((prev) => ({ ...prev, [field]: v }));

  const calcFederais = (faturamento, icmsDestacado, g) => {
    // LC 224/2025: +10% na presunção de IRPJ/CSLL sobre a parcela do
    // faturamento que exceder o limite (R$5mi/ano ÷ 12 = limite mensal).
    const excedente = Math.max(0, faturamento - g.limiteMajoracaoMensal);
    const baseNormal = faturamento - excedente;
    const presuncaoIRPJMajorada = g.presuncaoIRPJ * 1.1;
    const presuncaoCSLLMajorada = g.presuncaoCSLL * 1.1;

    const baseIRPJ =
      baseNormal * (g.presuncaoIRPJ / 100) + excedente * (presuncaoIRPJMajorada / 100);
    const irpjNormal = baseIRPJ * 0.15;
    const irpjAdicional = Math.max(0, baseIRPJ - g.limiteAdicionalIRPJ) * 0.1;
    const irpjTotal = irpjNormal + irpjAdicional;

    const baseCSLL =
      baseNormal * (g.presuncaoCSLL / 100) + excedente * (presuncaoCSLLMajorada / 100);
    const csll = baseCSLL * 0.09;

    const basePisCofins = Math.max(0, faturamento - icmsDestacado);
    const pis = basePisCofins * 0.0065;
    const cofins = basePisCofins * 0.03;
    const total = irpjTotal + csll + pis + cofins;
    return {
      excedente,
      baseNormal,
      presuncaoIRPJMajorada,
      presuncaoCSLLMajorada,
      baseIRPJ,
      irpjNormal,
      irpjAdicional,
      irpjTotal,
      baseCSLL,
      csll,
      basePisCofins,
      pis,
      cofins,
      total,
    };
  };

  const r1 = useMemo(() => {
    const debitoIcms = c1.faturamento * (c1.icmsSaida / 100);
    const creditoIcms = c1.compras * (c1.icmsCompra / 100);
    const icmsLiquido = debitoIcms - creditoIcms;
    const difal = c1.faturamento * (c1.difal / 100);
    const federais = calcFederais(c1.faturamento, debitoIcms, global_);
    const total = icmsLiquido + difal + federais.total;
    const carga = c1.faturamento > 0 ? (total / c1.faturamento) * 100 : 0;
    const margem = c1.faturamento - c1.compras - total;
    return { debitoIcms, creditoIcms, icmsLiquido, difal, federais, total, carga, margem };
  }, [c1, global_]);

  const r2 = useMemo(() => {
    const creditoCompraMatriz = c2.valorCompra * (c2.icmsCompra / 100);
    const baseTransferenciaComCusto =
      c2.valorTransferencia * (c2.custoTransferencia / 100);
    const debitoTransferencia = baseTransferenciaComCusto * (ICMS_TRANSFER / 100);
    const icmsLiquidoMatriz = debitoTransferencia - creditoCompraMatriz;

    const creditoRecebidoFilial = debitoTransferencia;
    const debitoVendaFilial = c2.valorVenda * (ICMS_VENDA_FILIAL / 100);
    const difalFilial = c2.valorVenda * (c2.difal / 100);
    const icmsLiquidoFilial =
      debitoVendaFilial - creditoRecebidoFilial + difalFilial;

    const icmsGrupo = icmsLiquidoMatriz + icmsLiquidoFilial;
    const federais = calcFederais(c2.valorVenda, debitoVendaFilial, global_);
    const total = icmsGrupo + federais.total;
    const carga = c2.valorVenda > 0 ? (total / c2.valorVenda) * 100 : 0;
    const margem =
      c2.valorVenda - c2.valorCompra - baseTransferenciaComCusto - total;

    return {
      creditoCompraMatriz,
      baseTransferenciaComCusto,
      debitoTransferencia,
      icmsLiquidoMatriz,
      creditoRecebidoFilial,
      debitoVendaFilial,
      difalFilial,
      icmsLiquidoFilial,
      icmsGrupo,
      federais,
      total,
      carga,
      margem,
    };
  }, [c2, global_]);

  const r3 = useMemo(() => {
    const baseComCusto = c3.valorVenda * (c3.custoTransferencia / 100);
    const icmsMatriz = baseComCusto * (c3.cargaEfetiva / 100);

    const creditoRecebidoFilial = baseComCusto * (ICMS_VENDA_FILIAL / 100);
    const debitoVendaFilial = c3.valorVenda * (ICMS_VENDA_FILIAL / 100);
    const difalFilial = c3.valorVenda * (c3.difal / 100);
    const icmsLiquidoFilial =
      debitoVendaFilial - creditoRecebidoFilial + difalFilial;

    const icmsGrupo = icmsMatriz + icmsLiquidoFilial;
    const federais = calcFederais(c3.valorVenda, debitoVendaFilial, global_);
    const total = icmsGrupo + federais.total;
    const carga = c3.valorVenda > 0 ? (total / c3.valorVenda) * 100 : 0;
    const margem = c3.valorVenda - c3.valorCompra - total;

    return {
      baseComCusto,
      icmsMatriz,
      creditoRecebidoFilial,
      debitoVendaFilial,
      difalFilial,
      icmsLiquidoFilial,
      icmsGrupo,
      federais,
      total,
      carga,
      margem,
    };
  }, [c3, global_]);

  const comparativo = [
    { n: 1, label: "Presumido sem filial", carga: r1.carga },
    { n: 2, label: "Com filiais SP", carga: r2.carga },
    { n: 3, label: "Lei da Moda", carga: r3.carga },
  ];
  const maxCarga = Math.max(1, ...comparativo.map((c) => c.carga || 0));

  const scenarioLabels = {
    1: "Presumido sem filial",
    2: "Com filiais SP",
    3: "Lei da Moda",
  };

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .app {
          --bg: #F3F4F8;
          --surface: #FFFFFF;
          --surface-soft: #F8F9FC;
          --border: #E6E8F0;
          --ink: #10131C;
          --ink-soft: #6B7180;
          --primary: #4338CA;
          --primary-soft: #EEEDFC;
          --teal: #0D9488;
          --teal-soft: #E6F6F4;
          --amber: #B45309;
          --amber-soft: #FDF3E3;
          --red: #DC2626;
          --red-soft: #FDEDED;
          --radius: 16px;
          font-family: 'Inter', system-ui, sans-serif;
          color: var(--ink);
          background: var(--bg);
          padding: 18px;
          border-radius: 22px;
          max-width: 100%;
        }
        .app * { box-sizing: border-box; }
        .app h1, .app h2, .app .display { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; }
        .app .mono { font-family: 'JetBrains Mono', monospace; }

        .topbar { margin-bottom: 18px; padding: 4px 4px 0; }
        .eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: var(--primary);
          font-weight: 600;
        }
        .topbar h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 4px 0 0;
          letter-spacing: -0.01em;
        }
        .topbar-sub {
          font-size: 12.5px;
          color: var(--ink-soft);
          margin: 6px 0 0;
          max-width: 640px;
          line-height: 1.5;
        }

        .compare-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .compare-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
          box-shadow: 0 1px 2px rgba(16,24,40,0.04);
          cursor: pointer;
          transition: transform .12s ease, box-shadow .12s ease;
        }
        .compare-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(16,24,40,0.08); }
        .compare-card.active { border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-soft); }
        .compare-card-label {
          font-size: 11.5px;
          color: var(--ink-soft);
          font-weight: 600;
          display: block;
          margin-bottom: 6px;
        }
        .compare-card-value {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: 800;
          display: block;
          margin-bottom: 10px;
        }
        .compare-bar-track {
          height: 6px;
          border-radius: 999px;
          background: var(--surface-soft);
          overflow: hidden;
        }
        .compare-bar-fill { height: 100%; border-radius: 999px; background: var(--primary); }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 18px;
          box-shadow: 0 1px 2px rgba(16,24,40,0.04);
        }
        .globals-card { margin-bottom: 16px; }
        .card-title {
          font-size: 12px;
          font-weight: 700;
          color: var(--primary);
          letter-spacing: 0.03em;
          margin-bottom: 14px;
        }
        .card-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }
        .card-title-row .card-title { margin-bottom: 0; }
        .card-title-toggle {
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-soft);
          white-space: nowrap;
        }
        .globals-row { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; }
        .globals-row .field { width: 172px; }
        .globals-row .field:last-child { width: 260px; }
        .globals-row .field-label { min-height: 32px; display: flex; align-items: flex-end; }
        .badges-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
        .badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 6px 12px;
          font-size: 12px;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--teal); flex-shrink: 0; }
        .req-dot { background: var(--amber); }
        .badge-label { color: var(--ink-soft); }
        .badge-value { font-family: 'JetBrains Mono', monospace; font-weight: 600; }
        .badge-note { color: var(--ink-soft); font-size: 10.5px; }

        .tabs {
          display: flex;
          gap: 4px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 4px;
          margin-bottom: 16px;
          overflow-x: auto;
        }
        .tab {
          flex: 1;
          text-align: center;
          white-space: nowrap;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 14px;
          border-radius: 999px;
          cursor: pointer;
          color: var(--ink-soft);
        }
        .tab.active { background: var(--primary); color: #fff; }

        .scenario-note {
          font-size: 12.5px;
          line-height: 1.55;
          background: var(--amber-soft);
          border: 1px solid #F2DCB3;
          color: #7A4A0C;
          border-radius: 12px;
          padding: 12px 14px;
          margin-bottom: 16px;
        }

        .grid { display: grid; grid-template-columns: minmax(240px, 320px) 1fr; gap: 16px; }
        @media (max-width: 760px) {
          .grid { grid-template-columns: 1fr; }
          .compare-grid { grid-template-columns: repeat(2, 1fr); }
          .compare-card-value { font-size: 20px; }
          .globals-row .field { width: 100%; max-width: 220px; }
          .globals-row .field-label { min-height: 0; }
        }

        .panel-title {
          font-size: 11.5px;
          font-weight: 700;
          color: var(--ink-soft);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .fields { display: flex; flex-direction: column; gap: 12px; }
        .field { display: flex; flex-direction: column; gap: 4px; }
        .field-label { font-size: 12.5px; font-weight: 600; color: var(--ink); }
        .field-hint { font-size: 10.5px; color: var(--ink-soft); }
        .field-input-wrap {
          display: flex;
          align-items: center;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0 10px;
          transition: border-color .12s ease, box-shadow .12s ease;
        }
        .field-input-wrap:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-soft);
          background: var(--surface);
        }
        .field-prefix, .field-suffix {
          font-size: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--ink-soft);
        }
        .field-input-wrap input {
          border: none;
          outline: none;
          background: transparent;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13.5px;
          padding: 9px 6px;
          width: 100%;
          text-align: right;
          color: var(--ink);
        }

        .subgroup-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--teal);
          margin: 16px 0 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .subgroup-label:first-child { margin-top: 0; }

        .results { display: flex; flex-direction: column; margin-bottom: 4px; }
        .row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 9px 2px;
          font-size: 13px;
          border-bottom: 1px solid var(--border);
        }
        .row-label { color: var(--ink-soft); }
        .row-sub { font-size: 10.5px; opacity: 0.7; }
        .row-value { font-family: 'JetBrains Mono', monospace; text-align: right; font-weight: 500; }
        .row-negative { color: var(--red); }
        .row-strong {
          background: var(--primary-soft);
          border: none;
          border-radius: 10px;
          padding: 10px 12px;
          margin: 6px 0 2px;
          font-weight: 700;
        }
        .row-strong .row-value { color: var(--primary); }

        .kpi-row { display: flex; gap: 12px; margin-top: 16px; }
        .stat { flex: 1; border-radius: 14px; padding: 14px 16px; }
        .stat-label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 4px;
          opacity: 0.85;
        }
        .stat-value { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 20px; font-weight: 800; }
        .stat-teal { background: var(--teal-soft); color: var(--teal); }
        .stat-neutral { background: var(--primary-soft); color: var(--primary); }

        .memoria {
          margin-top: 14px;
          border: 1px solid var(--border);
          border-radius: 14px;
          overflow: hidden;
        }
        .memoria summary {
          list-style: none;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
          background: var(--surface-soft);
        }
        .memoria summary::-webkit-details-marker { display: none; }
        .memoria-chevron { transition: transform .15s ease; color: var(--ink-soft); }
        .memoria[open] .memoria-chevron { transform: rotate(180deg); }
        .memoria-body { padding: 12px 16px 16px; background: var(--surface); }
        .memoria-line {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          padding: 3px 0;
          color: var(--ink-soft);
        }
        .memoria-line-hint {
          font-size: 10.5px;
          color: var(--amber);
          padding: 0 0 4px;
        }
        .memoria-gap { margin-top: 10px; }
        .memoria-total { font-weight: 700; color: var(--ink); border-bottom: 1px solid var(--border); padding-bottom: 8px; }
        .memoria-section-title {
          font-weight: 700;
          text-transform: uppercase;
          font-size: 10.5px;
          letter-spacing: 0.05em;
          color: var(--primary);
          padding-top: 2px;
        }

        textarea {
          width: 100%;
          min-height: 90px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px;
          background: var(--surface-soft);
          resize: vertical;
        }
        textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-soft); }
        .placeholder-box {
          border: 1.5px dashed var(--border);
          border-radius: 14px;
          padding: 24px 16px;
          font-size: 12.5px;
          color: var(--ink-soft);
          text-align: center;
          line-height: 1.6;
        }
      `}</style>

      <div className="topbar">
        <span className="eyebrow">SIMULADOR TRIBUTÁRIO</span>
        <h1>Comparativo de regime — Lucro Presumido</h1>
        <p className="topbar-sub">
          Todos os cenários partem da mesma saída do Simples Nacional. O 1 é a referência, sem
          nenhuma estrutura adicional; do 2 ao 3 são alternativas de planejamento sobre essa mesma
          base.
        </p>
      </div>

      <div className="compare-grid">
        {comparativo.map((c) => (
          <div
            key={c.n}
            className={`compare-card ${tab === c.n ? "active" : ""}`}
            onClick={() => setTab(c.n)}
          >
            <span className="compare-card-label">{c.n}. {c.label}</span>
            <span className="compare-card-value">{c.carga !== null ? fmtPct(c.carga, 1) : "—"}</span>
            <div className="compare-bar-track">
              {c.carga !== null && (
                <div className="compare-bar-fill" style={{ width: `${(c.carga / maxCarga) * 100}%` }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card globals-card">
        <div className="card-title-row" onClick={() => setShowParams(!showParams)}>
          <span className="card-title">PARÂMETROS GERAIS — LUCRO PRESUMIDO (COMÉRCIO)</span>
          <span className="card-title-toggle">{showParams ? "ocultar ▴" : "editar ▾"}</span>
        </div>
        {showParams && (
          <>
            <div className="globals-row">
              <PercentField label="Presunção IRPJ" value={global_.presuncaoIRPJ} onChange={upd(setGlobal, "presuncaoIRPJ")} hint="8% comércio/indústria" />
              <PercentField label="Presunção CSLL" value={global_.presuncaoCSLL} onChange={upd(setGlobal, "presuncaoCSLL")} hint="12% comércio/indústria" />
              <CurrencyField label="Limite p/ adicional IRPJ" value={global_.limiteAdicionalIRPJ} onChange={upd(setGlobal, "limiteAdicionalIRPJ")} hint="R$20.000/mês (R$60k/trim.)" />
              <CurrencyField label="Limite majoração (mensal)" value={global_.limiteMajoracaoMensal} onChange={upd(setGlobal, "limiteMajoracaoMensal")} hint="LC 224/25: +10% s/ excedente 5mi/ano" />
            </div>
            <div className="badges-row">
              <FixedBadge label="IRPJ" value={15} note="+10% acima do limite" />
              <FixedBadge label="CSLL" value={9} />
              <FixedBadge label="PIS" value={0.65} note="cumulativo" />
              <FixedBadge label="COFINS" value={3} note="cumulativo" />
            </div>
          </>
        )}
      </div>

      <div className="tabs">
        {[1, 2, 3].map((n) => (
          <div key={n} className={`tab ${tab === n ? "active" : ""}`} onClick={() => setTab(n)}>
            {n}. {scenarioLabels[n]}
          </div>
        ))}
      </div>

      {tab === 1 && (
        <>
          <div className="scenario-note">
            <strong>Ponto de partida.</strong> Saída do Simples hoje, sem nenhuma estrutura ou
            planejamento adicional — operação direta pela matriz, sem filiais. ICMS líquido = débito
            de saída − crédito de compra; DIFAL sobre o faturamento; federais apurados pela
            sistemática do Lucro Presumido (presunção × alíquota). Os cenários 2 e 3 são alternativas
            de planejamento a partir dessa mesma base.
          </div>
          <div className="grid">
            <div className="card">
              <div className="panel-title">Entradas</div>
              <div className="fields">
                <CurrencyField label="Faturamento do mês" value={c1.faturamento} onChange={upd(setC1, "faturamento")} />
                <PercentField label="ICMS de saída (médio)" value={c1.icmsSaida} onChange={upd(setC1, "icmsSaida")} />
                <PercentField label="DIFAL" value={c1.difal} onChange={upd(setC1, "difal")} />
                <CurrencyField label="Compras do mês" value={c1.compras} onChange={upd(setC1, "compras")} />
                <PercentField label="ICMS de compra (crédito)" value={c1.icmsCompra} onChange={upd(setC1, "icmsCompra")} />
              </div>
            </div>
            <div className="card">
              <div className="panel-title">Apuração</div>
              <div className="subgroup-label">Cálculo do ICMS</div>
              <div className="results">
                <Row label="Faturamento" value={c1.faturamento} sub="ponto de partida" />
                <Row label="× ICMS de saída" value={`${c1.icmsSaida}%`} />
                <Row label="= ICMS débito (saída)" value={r1.debitoIcms} strong />
                <Row label="Compras" value={c1.compras} />
                <Row label="× ICMS de compra" value={`${c1.icmsCompra}%`} />
                <Row label="= ICMS crédito (compra)" value={-r1.creditoIcms} negative strong />
                <Row label="ICMS a recolher (débito − crédito)" value={r1.icmsLiquido} strong />
                <Row label="DIFAL" value={r1.difal} sub={`= faturamento × ${c1.difal}%`} />
              </div>
              <div className="subgroup-label">Federais</div>
              <div className="results">
                <Row label="IRPJ (normal + adicional)" value={r1.federais.irpjTotal} />
                <Row label="CSLL" value={r1.federais.csll} />
                <Row label="PIS" value={r1.federais.pis} />
                <Row label="COFINS" value={r1.federais.cofins} />
                <Row label="TOTAL DE TRIBUTOS" value={r1.total} strong />
              </div>
              <MemoriaCompleta
                title="Memória de cálculo — Cenário 1 (ICMS + federais)"
                base={c1.faturamento}
                icmsDestacado={r1.debitoIcms}
                icmsValor={r1.icmsLiquido}
                difalValor={r1.difal}
                g={global_}
                f={r1.federais}
                icms={
                  <>
                    <div className="memoria-line">
                      Débito = {fmtBRL(c1.faturamento)} × {fmtPct(c1.icmsSaida)} = {fmtBRL(r1.debitoIcms)}
                    </div>
                    <div className="memoria-line">
                      Crédito = {fmtBRL(c1.compras)} × {fmtPct(c1.icmsCompra)} = {fmtBRL(r1.creditoIcms)}
                    </div>
                    <div className="memoria-line memoria-total">
                      ICMS a recolher = {fmtBRL(r1.debitoIcms)} − {fmtBRL(r1.creditoIcms)} = {fmtBRL(r1.icmsLiquido)}
                    </div>
                    <div className="memoria-line memoria-gap">
                      DIFAL = {fmtBRL(c1.faturamento)} × {fmtPct(c1.difal)} = {fmtBRL(r1.difal)}
                    </div>
                  </>
                }
              />
              <div className="kpi-row">
                <StatCard label="CARGA EFETIVA" value={fmtPct(r1.carga)} tone="neutral" />
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 2 && (
        <>
          <div className="scenario-note">
            <strong>Mesma saída do Simples do cenário 1, agora com planejamento.</strong> Em vez de
            vender direto pela matriz, ela compra, transfere para filiais em SP (Mercado Livre /
            Shopee) e as filiais vendem ao consumidor final. ICMS de transferência e de venda fixos em
            12%. Federais apurados sobre a venda da filial (faturamento consolidado
            do grupo).
          </div>
          <div className="grid">
            <div className="card">
              <div className="panel-title">Entradas</div>
              <div className="subgroup-label">Matriz (RJ) — compra</div>
              <div className="fields">
                <CurrencyField label="Valor de compra" value={c2.valorCompra} onChange={upd(setC2, "valorCompra")} />
                <PercentField label="ICMS de compra (crédito)" value={c2.icmsCompra} onChange={upd(setC2, "icmsCompra")} />
              </div>
              <div className="subgroup-label">Transferência matriz → filial</div>
              <div className="fields">
                <CurrencyField label="Valor de transferência" value={c2.valorTransferencia} onChange={upd(setC2, "valorTransferencia")} />
                <PercentField label="Custo de transferência" value={c2.custoTransferencia} onChange={upd(setC2, "custoTransferencia")} hint="reduz a base do ICMS de transferência" />
              </div>
              <div className="badges-row"><FixedBadge label="ICMS transferência" value={ICMS_TRANSFER} /></div>
              <div className="subgroup-label">Filial (SP) — venda</div>
              <div className="fields">
                <CurrencyField label="Valor de venda da filial" value={c2.valorVenda} onChange={upd(setC2, "valorVenda")} />
                <PercentField label="DIFAL" value={c2.difal} onChange={upd(setC2, "difal")} />
              </div>
              <div className="badges-row">
                <FixedBadge label="ICMS venda" value={ICMS_VENDA_FILIAL} />
              </div>
            </div>
            <div className="card">
              <div className="panel-title">Apuração</div>
              <div className="subgroup-label">Cálculo de transferência (matriz → filial)</div>
              <div className="results">
                <Row label="Valor de transferência" value={c2.valorTransferencia} sub="ponto de partida" />
                <Row label="× Custo de transferência" value={`${c2.custoTransferencia}%`} />
                <Row label="= Base do ICMS de transferência" value={r2.baseTransferenciaComCusto} sub="transferência × custo%" strong />
                <Row label="× ICMS de transferência" value={`${ICMS_TRANSFER}%`} />
                <Row label="= ICMS de entrada (crédito da filial)" value={r2.debitoTransferencia} sub="base × 12%" strong />
              </div>
              <div className="subgroup-label">Matriz</div>
              <div className="results">
                <Row label="ICMS crédito (compra)" value={-r2.creditoCompraMatriz} negative />
                <Row label="ICMS débito (transferência)" value={r2.debitoTransferencia} />
                <Row label="ICMS líquido matriz" value={r2.icmsLiquidoMatriz} strong />
              </div>
              <div className="subgroup-label">Filial</div>
              <div className="results">
                <Row label="ICMS crédito (recebido na transf.)" value={-r2.creditoRecebidoFilial} negative />
                <Row label="ICMS débito (venda)" value={r2.debitoVendaFilial} />
                <Row label="DIFAL" value={r2.difalFilial} />
                <Row label="ICMS líquido filial" value={r2.icmsLiquidoFilial} strong />
              </div>
              <div className="subgroup-label">Consolidado do grupo</div>
              <div className="results">
                <Row label="ICMS do grupo" value={r2.icmsGrupo} />
                <Row label="IRPJ (normal + adicional)" value={r2.federais.irpjTotal} />
                <Row label="CSLL" value={r2.federais.csll} />
                <Row label="PIS" value={r2.federais.pis} />
                <Row label="COFINS" value={r2.federais.cofins} />
                <Row label="TOTAL DE TRIBUTOS" value={r2.total} strong />
              </div>
              <MemoriaCompleta
                title="Memória de cálculo — Cenário 2 (ICMS + federais)"
                base={c2.valorVenda}
                icmsDestacado={r2.debitoVendaFilial}
                icmsValor={r2.icmsGrupo - r2.difalFilial}
                difalValor={r2.difalFilial}
                g={global_}
                f={r2.federais}
                icms={
                  <>
                    <div className="memoria-line">Matriz</div>
                    <div className="memoria-line">
                      Base c/ custo = {fmtBRL(c2.valorTransferencia)} × {fmtPct(c2.custoTransferencia)} ={" "}
                      {fmtBRL(r2.baseTransferenciaComCusto)}
                    </div>
                    <div className="memoria-line">
                      ICMS débito (transferência) = {fmtBRL(r2.baseTransferenciaComCusto)} × {fmtPct(ICMS_TRANSFER)} ={" "}
                      {fmtBRL(r2.debitoTransferencia)}
                    </div>
                    <div className="memoria-line">
                      ICMS crédito (compra) = {fmtBRL(c2.valorCompra)} × {fmtPct(c2.icmsCompra)} = {fmtBRL(r2.creditoCompraMatriz)}
                    </div>
                    <div className="memoria-line memoria-total">
                      ICMS líquido matriz = {fmtBRL(r2.debitoTransferencia)} − {fmtBRL(r2.creditoCompraMatriz)} ={" "}
                      {fmtBRL(r2.icmsLiquidoMatriz)}
                    </div>
                    <div className="memoria-line memoria-gap">Filial</div>
                    <div className="memoria-line">
                      ICMS débito (venda) = {fmtBRL(c2.valorVenda)} × {fmtPct(ICMS_VENDA_FILIAL)} = {fmtBRL(r2.debitoVendaFilial)}
                    </div>
                    <div className="memoria-line">DIFAL = {fmtBRL(c2.valorVenda)} × {fmtPct(c2.difal)} = {fmtBRL(r2.difalFilial)}</div>
                    <div className="memoria-line">
                      ICMS crédito (recebido na transf.) = {fmtBRL(r2.creditoRecebidoFilial)}
                    </div>
                    <div className="memoria-line memoria-total">
                      ICMS líquido filial = {fmtBRL(r2.debitoVendaFilial)} + {fmtBRL(r2.difalFilial)} −{" "}
                      {fmtBRL(r2.creditoRecebidoFilial)} = {fmtBRL(r2.icmsLiquidoFilial)}
                    </div>
                    <div className="memoria-line memoria-total memoria-gap">
                      ICMS do grupo = {fmtBRL(r2.icmsLiquidoMatriz)} + {fmtBRL(r2.icmsLiquidoFilial)} = {fmtBRL(r2.icmsGrupo)}
                    </div>
                  </>
                }
              />
              <div className="kpi-row">
                <StatCard label="CARGA EFETIVA" value={fmtPct(r2.carga)} tone="neutral" />
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 3 && (
        <>
          <div className="scenario-note">
            Regime especial Lei nº 6.331/2012 (RJ) — crédito presumido: carga efetiva sobre uma base
            reduzida das saídas, sem aproveitamento de crédito de compra (art. 2º, §1º). Base = valor
            de venda × custo de transferência (%); ICMS matriz = base × carga efetiva (conforme sua
            planilha real, 3,5%). Venda da filial segue as mesmas alíquotas fixas do cenário 2.
            Federais apurados sobre a venda da filial.
          </div>
          <div className="grid">
            <div className="card">
              <div className="panel-title">Entradas</div>
              <div className="subgroup-label">Matriz (RJ) — compra</div>
              <div className="fields">
                <CurrencyField label="Valor de compra" value={c3.valorCompra} onChange={upd(setC3, "valorCompra")} hint="sem crédito de ICMS — regime veda aproveitamento" />
              </div>
              <div className="subgroup-label">Transferência / venda filial</div>
              <div className="fields">
                <CurrencyField label="Valor de venda (filial)" value={c3.valorVenda} onChange={upd(setC3, "valorVenda")} />
                <PercentField label="Custo de transferência" value={c3.custoTransferencia} onChange={upd(setC3, "custoTransferencia")} hint="reduz a base: base = venda × custo%" />
                <PercentField label="Carga efetiva (crédito presumido)" value={c3.cargaEfetiva} onChange={upd(setC3, "cargaEfetiva")} hint="lei (art. 2º): 2,5% já c/ FECP · sua planilha real: 3,5%" />
                <PercentField label="DIFAL" value={c3.difal} onChange={upd(setC3, "difal")} />
              </div>
              <div className="badges-row">
                <FixedBadge label="ICMS venda" value={ICMS_VENDA_FILIAL} />
              </div>
            </div>
            <div className="card">
              <div className="panel-title">Apuração</div>
              <div className="subgroup-label">Cálculo de transferência (matriz → filial)</div>
              <div className="results">
                <Row label="Venda (filial)" value={c3.valorVenda} sub="ponto de partida" />
                <Row label="× Custo de transferência" value={`${c3.custoTransferencia}%`} />
                <Row label="= Base do ICMS matriz" value={r3.baseComCusto} sub="venda × custo%" strong />
                <Row label="× Carga efetiva (Lei da Moda)" value={`${c3.cargaEfetiva}%`} />
                <Row label="= ICMS matriz (crédito presumido)" value={r3.icmsMatriz} sub="base × carga efetiva" strong />
              </div>
              <div className="subgroup-label">Filial</div>
              <div className="results">
                <Row label="ICMS crédito (recebido na transf.)" value={-r3.creditoRecebidoFilial} negative />
                <Row label="ICMS débito (venda)" value={r3.debitoVendaFilial} />
                <Row label="DIFAL" value={r3.difalFilial} />
                <Row label="ICMS líquido filial" value={r3.icmsLiquidoFilial} strong />
              </div>
              <div className="subgroup-label">Consolidado do grupo</div>
              <div className="results">
                <Row label="ICMS do grupo" value={r3.icmsGrupo} />
                <Row label="IRPJ (normal + adicional)" value={r3.federais.irpjTotal} />
                <Row label="CSLL" value={r3.federais.csll} />
                <Row label="PIS" value={r3.federais.pis} />
                <Row label="COFINS" value={r3.federais.cofins} />
                <Row label="TOTAL DE TRIBUTOS" value={r3.total} strong />
              </div>
              <MemoriaCompleta
                title="Memória de cálculo — Cenário 3 (ICMS + federais)"
                base={c3.valorVenda}
                icmsDestacado={r3.debitoVendaFilial}
                icmsValor={r3.icmsGrupo - r3.difalFilial}
                difalValor={r3.difalFilial}
                g={global_}
                f={r3.federais}
                icms={
                  <>
                    <div className="memoria-line">Matriz — Lei da Moda</div>
                    <div className="memoria-line">
                      Base = {fmtBRL(c3.valorVenda)} × {fmtPct(c3.custoTransferencia)} = {fmtBRL(r3.baseComCusto)}
                    </div>
                    <div className="memoria-line memoria-total">
                      ICMS matriz = {fmtBRL(r3.baseComCusto)} × {fmtPct(c3.cargaEfetiva)} = {fmtBRL(r3.icmsMatriz)}
                    </div>
                    <div className="memoria-line memoria-gap">Filial</div>
                    <div className="memoria-line">
                      ICMS débito (venda) = {fmtBRL(c3.valorVenda)} × {fmtPct(ICMS_VENDA_FILIAL)} = {fmtBRL(r3.debitoVendaFilial)}
                    </div>
                    <div className="memoria-line">DIFAL = {fmtBRL(c3.valorVenda)} × {fmtPct(c3.difal)} = {fmtBRL(r3.difalFilial)}</div>
                    <div className="memoria-line">
                      ICMS crédito (recebido na transf.) = {fmtBRL(r3.creditoRecebidoFilial)}
                    </div>
                    <div className="memoria-line memoria-total">
                      ICMS líquido filial = {fmtBRL(r3.debitoVendaFilial)} + {fmtBRL(r3.difalFilial)} −{" "}
                      {fmtBRL(r3.creditoRecebidoFilial)} = {fmtBRL(r3.icmsLiquidoFilial)}
                    </div>
                    <div className="memoria-line memoria-total memoria-gap">
                      ICMS do grupo = {fmtBRL(r3.icmsMatriz)} + {fmtBRL(r3.icmsLiquidoFilial)} = {fmtBRL(r3.icmsGrupo)}
                    </div>
                  </>
                }
              />
              <div className="kpi-row">
                <StatCard label="CARGA EFETIVA" value={fmtPct(r3.carga)} tone="neutral" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
