import React, { useMemo, useState } from 'react';
import { Activity, Building2, LineChart, Settings, TrendingUp } from 'lucide-react';

// Import our modularized engine and formatters
import { formatCurrency, formatLarge } from '../utils/formatters';
import { runModel } from '../utils/dcfEngine';

const inputsDefault = {
  ticker: 'AAPL',
  currentPrice: 175.5,
  revenue: 383285,
  freeCashFlow: 99584,
  sharesOutstanding: 15500,
  netDebt: 45000,

  revenueGrowthPhase1: 8.5,
  revenueGrowthPhase2: 6,
  revenueGrowthPhase3: 4,
  revenueGrowthPhase4: 3,

  fcfMarginExpansion1: 0.2,
  fcfMarginExpansion2: 0.1,
  fcfMarginExpansion3: 0,
  fcfMarginExpansion4: -0.05,

  wacc: 9,
  terminalGrowth: 2.5,
};

export default function DcfSandbox() {
  const [inputs, setInputs] = useState(inputsDefault);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: type === 'text' ? value.toUpperCase() : Number(value),
    }));
  };

  // Base Valuation
  const valuation = useMemo(() => runModel(inputs, inputs.wacc, inputs.terminalGrowth), [inputs]);

  // Sensitivity Matrix
  const sensitivity = useMemo(() => {
    const rows = [];
    for (const tg of [inputs.terminalGrowth + 0.5, inputs.terminalGrowth, inputs.terminalGrowth - 0.5]) {
      const row = [];
      for (const wacc of [inputs.wacc - 1, inputs.wacc - 0.5, inputs.wacc, inputs.wacc + 0.5, inputs.wacc + 1]) {
        const result = runModel(inputs, wacc, tg);
        row.push({ wacc, tg, value: result.intrinsicValue });
      }
      rows.push(row);
    }
    return rows;
  }, [inputs]);

  const maxFcf = Math.max(...valuation.cashFlows.map((x) => x.fcf));

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 mb-4">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">World-Class DCF Model</span>
              </div>
              <h1 className="text-5xl font-black flex items-center gap-3">
                <LineChart className="w-10 h-10" />
                FCF Sandbox
              </h1>
              <p className="mt-3 text-slate-600 max-w-2xl">
                A professional 20-year discounted cash flow model driven directly by free cash flow margins, long-term growth assumptions, and sensitivity analysis.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 min-w-[260px]">
              <div className="text-xs uppercase font-bold text-slate-500 mb-2">Intrinsic Value</div>
              <div className="text-6xl font-black text-slate-900">
                {formatCurrency(valuation.intrinsicValue)}
              </div>
              <div className={`mt-4 rounded-2xl p-4 font-bold ${valuation.undervalued ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {valuation.undervalued ? 'Undervalued' : 'Overvalued'} · {valuation.upside > 0 ? '+' : ''}{valuation.upside.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Inputs Section */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 space-y-4">
            <h2 className="font-black text-lg flex items-center gap-2"><Building2 className="w-5 h-5" /> Company Inputs</h2>
            {[
              ['ticker', 'Ticker', 'text'],
              ['currentPrice', 'Current Price', 'number'],
              ['revenue', 'Revenue (M)', 'number'],
              ['freeCashFlow', 'Free Cash Flow (M)', 'number'],
              ['sharesOutstanding', 'Shares Outstanding (M)', 'number'],
              ['netDebt', 'Net Debt (M)', 'number'],
              ['wacc', 'WACC %', 'number'],
              ['terminalGrowth', 'Terminal Growth %', 'number'],
            ].map(([name, label, type]) => (
              <div key={name}>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">{label}</label>
                <input
                  type={type}
                  name={name}
                  value={inputs[name]}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            ))}
          </div>

          {/* Outputs & Projection Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 20-Year Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> 20-Year FCF Projection
                </h2>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-semibold hover:bg-slate-200 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  {showAdvanced ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              {/* FIXED: Added a concrete height and items-end to force bars to grow from bottom */}
              <div className="h-72 flex items-end gap-1 md:gap-2 px-2 border-b border-slate-100 pb-2">
                {valuation.cashFlows.map((row) => {
                  // Safety check to prevent division by zero or negative heights
                  const barHeight = maxFcf > 0 ? (row.fcf / maxFcf) * 100 : 0;
                  
                  return (
                    <div key={row.year} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none transition-opacity z-10 whitespace-nowrap">
                        {formatLarge(row.fcf)}
                      </div>
                      
                      {/* The Bar */}
                      <div
                        className="w-full rounded-t-md bg-slate-900 hover:bg-slate-600 transition-all duration-500 ease-out cursor-pointer"
                        style={{ height: `${Math.max(barHeight, 2)}%` }} // Math.max(x, 2) ensures a tiny sliver is visible even if FCF is near zero
                      />
                      
                      {/* Year Label */}
                      <div className="absolute -bottom-8 text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                        Y{row.year}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Spacer for the absolute positioned labels */}
              <div className="h-8" /> 

              {showAdvanced && (
                <div className="mt-8 overflow-x-auto animate-in fade-in slide-in-from-top-4 duration-300">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-black">
                        <th className="text-left py-3">Year</th>
                        <th className="text-right py-3">Revenue</th>
                        <th className="text-right py-3">FCF Margin</th>
                        <th className="text-right py-3">FCF</th>
                        <th className="text-right py-3">Present Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valuation.cashFlows.map((row) => (
                        <tr key={row.year} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 font-bold text-slate-900">{row.year}</td>
                          <td className="text-right text-slate-600">{formatLarge(row.revenue)}</td>
                          <td className="text-right text-slate-600">{row.fcfMargin.toFixed(1)}%</td>
                          <td className="text-right font-bold text-slate-900">{formatLarge(row.fcf)}</td>
                          <td className="text-right text-rose-600 font-medium">{formatLarge(row.pv)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sensitivity Matrix Table */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200 overflow-x-auto">
              <h2 className="font-black text-lg mb-4 text-slate-900">Sensitivity Matrix (Intrinsic Value)</h2>
              <div className="min-w-[500px]">
                <div className="flex border-b border-slate-200">
                  <div className="w-24 p-2 text-[10px] font-bold text-slate-400 flex items-end justify-end border-r border-slate-200">Term. Gr. ↓ \ WACC →</div>
                  {sensitivity[0].map((col, i) => (
                    <div key={i} className="flex-1 p-2 text-center text-xs font-bold text-slate-900">{col.wacc.toFixed(1)}%</div>
                  ))}
                </div>
                {sensitivity.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex border-b border-slate-100 last:border-0">
                    <div className="w-24 p-3 flex items-center justify-end text-xs font-bold text-slate-900 border-r border-slate-200 bg-slate-50">
                      {row[0].tg.toFixed(1)}%
                    </div>
                    {row.map((cell, colIndex) => {
                      const isBaseCase = rowIndex === 1 && colIndex === 2;
                      const isUndervalued = cell.value > inputs.currentPrice;
                      return (
                        <div key={colIndex} className={`flex-1 p-3 text-center text-sm font-medium ${isBaseCase ? 'bg-slate-900 text-white font-bold' : isUndervalued ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
                          {formatCurrency(cell.value)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}