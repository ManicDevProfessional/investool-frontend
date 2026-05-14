import { Target, Info, TrendingUp, Calendar, DollarSign, Building2 } from 'lucide-react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useMemo } from 'react';

// --- CUSTOM TOOLTIP ---
// This completely fixes the "double text" issue by filtering duplicate dataKeys
// and provides a premium, dark-mode institutional aesthetic.
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Filter out duplicates (since Area and Line share the same dataKey)
    const uniquePayload = [];
    const keys = new Set();
    
    payload.forEach((entry) => {
      if (!keys.has(entry.dataKey)) {
        keys.add(entry.dataKey);
        uniquePayload.push(entry);
      }
    });

    return (
      <div className="bg-[#0a192f] border border-[#1e2f4b] rounded-xl p-4 shadow-2xl">
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-3">
          {label}
        </p>
        <div className="space-y-2.5">
          {uniquePayload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-300 text-xs font-semibold">{entry.name}</span>
              </div>
              <span className="text-white text-sm font-bold">
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function YieldProjectionsTab({ inputs, projectionData, tickInterval }) {
  
  // --- SUMMARY METRICS ---
  const summary = useMemo(() => {
    if (!projectionData || !projectionData.length) return null;

    const lastYear = projectionData[projectionData.length - 1];
    const finalCumulative = lastYear.cumulative;
    const finalCashflow = lastYear.cashflow;
    const totalCashflowOverPeriod = projectionData.reduce((sum, d) => sum + d.cashflow, 0);

    // Calculate final property value using base inputs 
    const capGrowth = inputs.capitalGrowth || 5; 
    const finalPropertyValue = inputs.propertyPrice * Math.pow(1 + capGrowth / 100, inputs.loanTermYears);

    return {
      finalCumulative,
      finalCashflow,
      totalCashflowOverPeriod,
      finalPropertyValue,
    };
  }, [projectionData, inputs]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-10 animate-in fade-in duration-500 flex flex-col h-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-slate-100 pb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-3 text-[#0a192f]">
            <Target className="w-7 h-7 text-[#0a2540]" /> {inputs.loanTermYears}‑Year Financial Outlook
          </h3>
          <p className="text-sm text-slate-500 mt-2 font-medium">
            Projected cashflow and cumulative wealth accumulation over the lifespan of your loan.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-[11px] font-bold text-[#9e1b32] uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-lg border border-rose-100">
            Tax-Adjusted
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full opacity-50" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Property Value</span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-[#0a192f] relative z-10">
              ${Math.round(summary.finalPropertyValue).toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-emerald-600 mt-1 relative z-10">
              +{(((summary.finalPropertyValue - inputs.propertyPrice) / inputs.propertyPrice) * 100).toFixed(0)}% Capital Growth
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full opacity-50" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Net Cashflow</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className={`text-2xl font-extrabold relative z-10 ${summary.totalCashflowOverPeriod >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summary.totalCashflowOverPeriod < 0 ? '-' : ''}${Math.abs(Math.round(summary.totalCashflowOverPeriod)).toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-slate-500 mt-1 relative z-10 uppercase">
              Over {inputs.loanTermYears} Years
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full opacity-50" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Cumulative</span>
              <TrendingUp className="w-4 h-4 text-[#0a2540]" />
            </div>
            <p className="text-2xl font-extrabold text-[#0a2540] relative z-10">
              ${Math.round(summary.finalCumulative).toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-slate-500 mt-1 relative z-10 uppercase">
              Total Wealth Generated
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 shadow-sm relative overflow-hidden group border-b-4 border-b-[#9e1b32]">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-bl-full opacity-50" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Final Annual CF</span>
              <Calendar className="w-4 h-4 text-[#9e1b32]" />
            </div>
            <p className={`text-2xl font-extrabold relative z-10 ${summary.finalCashflow >= 0 ? 'text-[#9e1b32]' : 'text-rose-600'}`}>
              ${Math.round(summary.finalCashflow).toLocaleString()}
            </p>
            <p className="text-[11px] font-bold text-slate-500 mt-1 relative z-10 uppercase">
              In Year {inputs.loanTermYears}
            </p>
          </div>
        </div>
      )}

      {/* COMPOSED CHART */}
      <div className="flex-1 min-h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCashflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9e1b32" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#9e1b32" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0a2540" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0a2540" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis
              dataKey="year"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              dy={10}
              interval={tickInterval}
            />
            
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              dx={-10}
            />
            
            {/* Using the Custom Tooltip */}
            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px', fontWeight: 600, fontSize: '13px', color: '#475569' }}
            />
            
           
            
            {/* Stroke Lines */}
            <Line
              type="monotone"
              dataKey="cashflow"
              name="Annual Cashflow"
              stroke="#9e1b32"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#9e1b32', stroke: '#fff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Cumulative Cashflow"
              stroke="#0a2540"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: '#0a2540', stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ASSUMPTIONS FOOTER */}
      <div className="mt-10 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl text-sm text-blue-900 flex items-start gap-4 shadow-sm">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#0a192f] mb-1.5 text-base">Model Assumptions</p>
          <p className="text-blue-800/80 font-medium leading-relaxed text-xs sm:text-sm">
            Interest rate remains constant throughout the {inputs.loanTermYears}-year period. Gross rent grows annually based on the variable set in your sensitivity slider. Operating expenses grow with standard average inflation (2% p.a.). Depreciation remains constant. All figures are in today's dollars.
          </p>
        </div>
      </div>
      
    </div>
  );
}