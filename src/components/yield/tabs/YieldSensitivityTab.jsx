import { Sliders, Activity, Target, AlertTriangle, TrendingUp, TrendingDown, RefreshCw, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useMemo } from 'react';

export default function YieldSensitivityTab({ inputs, metrics, sensitivity, handleSensitivityChange, rateCurveData }) {
  
  // Find break-even rate (where cashflow crosses zero) using linear interpolation
  const breakEvenRate = useMemo(() => {
    if (!rateCurveData || !rateCurveData.length) return null;
    for (let i = 0; i < rateCurveData.length - 1; i++) {
      const current = rateCurveData[i];
      const next = rateCurveData[i + 1];
      if (current.cashflow >= 0 && next.cashflow <= 0) {
        const ratio = current.cashflow / (current.cashflow - next.cashflow);
        const rate = current.rate + ratio * (next.rate - current.rate);
        return rate.toFixed(2);
      }
    }
    return null;
  }, [rateCurveData]);

  const resetSensitivity = () => {
    handleSensitivityChange('interestShift', 0);
    handleSensitivityChange('rentGrowth', 0);
  };

  const currentStressedRate = inputs.interestRate + sensitivity.interestShift;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3 text-[#0a192f]">
            <Sliders className="w-7 h-7 text-[#9e1b32]" /> Stress Testing Engine
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Simulate market shocks. Adjust rates and rent to find your break-even threshold.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 flex items-center gap-2 shadow-sm">
            <Activity className="w-4 h-4 text-[#9e1b32] animate-pulse" /> Live Simulation
          </div>
          <button 
            onClick={resetSensitivity}
            className="text-xs font-bold text-slate-500 hover:text-[#0a192f] uppercase tracking-widest bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-lg border border-slate-100 flex items-center gap-2 transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>
      
      <div className="grid xl:grid-cols-2 gap-12 items-start">
        
        {/* LEFT COLUMN: Controls & Results */}
        <div className="space-y-8">
          
          {/* Sliders */}
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Macro Factor</span>
                  <span className="block text-base font-bold text-[#0a192f]">Interest Rate Shock</span>
                </div>
                <span className="bg-rose-100 px-4 py-1.5 rounded-lg text-rose-700 font-extrabold text-lg border border-rose-200 shadow-sm">
                  {sensitivity.interestShift > 0 ? '+' : ''}{sensitivity.interestShift}%
                </span>
              </div>
              <input type="range" min="-1.5" max="3" step="0.25" value={sensitivity.interestShift} onChange={(e) => handleSensitivityChange('interestShift', e.target.value)} className="w-full accent-[#9e1b32] h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                <span>-1.5%</span>
                <span className="text-[#0a192f]">Stressed Rate: {currentStressedRate.toFixed(2)}%</span>
                <span>+3.0%</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Market Factor</span>
                  <span className="block text-base font-bold text-[#0a192f]">Rent Growth p.a.</span>
                </div>
                <span className="bg-emerald-100 px-4 py-1.5 rounded-lg text-emerald-700 font-extrabold text-lg border border-emerald-200 shadow-sm">
                  {sensitivity.rentGrowth > 0 ? '+' : ''}{sensitivity.rentGrowth}%
                </span>
              </div>
              <input type="range" min="-3" max="10" step="0.5" value={sensitivity.rentGrowth} onChange={(e) => handleSensitivityChange('rentGrowth', e.target.value)} className="w-full accent-emerald-600 h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                <span>-3.0%</span>
                <span className="text-[#0a192f]">Year 1 Shift</span>
                <span>+10.0%</span>
              </div>
            </div>
          </div>

          {/* Dark Mode Results Card */}
          <div className="bg-[#0a192f] rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-2xl border border-[#1e2f4b]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#1e2f4b] rounded-bl-full -z-0 opacity-40 blur-2xl" />
            <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-8">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" /> Stressed Net Yield
                </p>
                <p className="text-white">{metrics.netYield.toFixed(2)}%</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex sm:justify-end items-center gap-2">
                  Stressed Cashflow <Activity className="w-4 h-4 text-rose-400" /> 
                </p>
                <div className="flex sm:justify-end items-baseline gap-1">
                  <p className={`tracking-tight ${metrics.weeklyPostTax >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {metrics.weeklyPostTax < 0 ? '-' : ''}${Math.abs(metrics.weeklyPostTax).toFixed(0)}
                  </p>
                  <span className="text-slate-400 font-medium">/wk</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Chart */}
        <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-8 h-full min-h-[450px] flex flex-col shadow-sm">
          
          {/* Custom Chart Legend / Status Bar (Replaces inline text) */}
          <div className="mb-8 space-y-4">
            <h4 className="text-lg font-bold text-[#0a192f] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#9e1b32]" /> Cashflow Sensitivity Curve
            </h4>
            
            <div className="flex flex-wrap gap-3">
              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#0a2540]" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Rate</p>
                  <p className="text-sm font-extrabold text-[#0a192f]">{inputs.interestRate.toFixed(2)}%</p>
                </div>
              </div>
              
              {breakEvenRate ? (
                <div className="bg-white border border-rose-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                  <div>
                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Break-Even Threshold</p>
                    <p className="text-sm font-extrabold text-rose-600">{breakEvenRate}%</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-emerald-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Break-Even</p>
                    <p className="text-sm font-extrabold text-emerald-700">Highly Positive</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* The Chart */}
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rateCurveData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.7} />
                
                {/* Increased font size and spacing for readability */}
                <XAxis 
                  dataKey="rateLabel" 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={15} 
                />
                <YAxis 
                  tickFormatter={(v) => `$${v}`} 
                  tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  dx={-10} 
                />
                
                <Tooltip 
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                  contentStyle={{ backgroundColor: '#0a192f', borderRadius: '12px', border: '1px solid #1e2f4b', color: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', padding: '16px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '6px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '16px', fontWeight: 'extrabold' }}
                  formatter={(value) => [`$${value} / wk`, 'Net Cashflow']}
                />
                
                {/* Break-even Zero Line */}
                <ReferenceLine y={0} stroke="#ef4444" strokeWidth={2} strokeDasharray="4 4" />
                
                {/* Current Rate Vertical Marker */}
                <ReferenceLine x={`${inputs.interestRate.toFixed(1)}%`} stroke="#0a2540" strokeWidth={2} strokeOpacity={0.3} />
                
                <Line 
                  type="monotone" 
                  dataKey="cashflow" 
                  stroke="#0a2540" 
                  strokeWidth={4} 
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const isCurrent = payload.rateLabel === `${inputs.interestRate.toFixed(1)}%`;
                    return isCurrent ? (
                      <circle cx={cx} cy={cy} r={7} fill="#0a2540" stroke="#fff" strokeWidth={3} key={`dot-${payload.rateLabel}`} />
                    ) : (
                      <circle cx={cx} cy={cy} r={0} key={`dot-${payload.rateLabel}`} />
                    );
                  }}
                  activeDot={{ r: 8, fill: '#9e1b32', stroke: '#fff', strokeWidth: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Helper Footer */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 text-sm text-blue-900 flex items-start gap-4">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold mb-1 text-base">Understanding the Curve</p>
          <p className="text-blue-800/80 leading-relaxed font-medium">
            This curve maps your exact weekly cashflow against changing interest rates. The red dashed line represents absolute zero (Break-Even). If your dark blue data line crosses the red line, your property has shifted from positively geared to negatively geared (or vice versa).
          </p>
        </div>
      </div>
    </div>
  );
}