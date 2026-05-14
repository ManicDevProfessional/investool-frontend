import { Sparkles, TrendingUp, ShieldCheck, AlertCircle, BarChart3, Info, Calendar, Award, Target, DollarSign } from 'lucide-react';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';

// Helper to compute additional stats from projections
const computeInsights = (projections, finalYear) => {
  if (!projections || projections.length === 0) return {};

  let crossingYear = null;
  for (let i = 1; i < projections.length; i++) {
    if (projections[i].Rentvesting > projections[i].PPOR && projections[i-1].Rentvesting <= projections[i-1].PPOR) {
      crossingYear = projections[i].year;
      break;
    }
  }

  let maxGap = 0;
  let maxGapYear = null;
  projections.forEach(p => {
    const gap = Math.abs(p.Rentvesting - p.PPOR);
    if (gap > maxGap) {
      maxGap = gap;
      maxGapYear = p.year;
    }
  });

  const termLength = projections.length - 1; 
  const cagrPPOR = termLength > 0 ? (finalYear.PPOR / projections[0].PPOR) ** (1/termLength) - 1 : 0;
  const cagrRentvest = termLength > 0 ? (finalYear.Rentvesting / projections[0].Rentvesting) ** (1/termLength) - 1 : 0;

  return { crossingYear, maxGap, maxGapYear, cagrPPOR, cagrRentvest };
};

export default function RentvestingResults({ inputs, projections, finalYear, winner, difference }) {
  const insights = useMemo(() => computeInsights(projections, finalYear), [projections, finalYear]);

  const formatMoney = (val) => `$${Math.round(val).toLocaleString()}`;
  const formatPercent = (val) => `${(val * 100).toFixed(1)}%`;

  const tickInterval = inputs.loanTermYears >= 40 ? 4 : inputs.loanTermYears >= 30 ? 3 : inputs.loanTermYears >= 20 ? 2 : 1;

  return (
    <div className="xl:col-span-8 space-y-6">
      
      {/* Hero Banner with dynamic winner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl overflow-hidden group">
        {/* FIXED: URL-encoded quotes (%22) so Babel doesn't crash */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C27B0%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#9e1b32] rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-xs font-medium tracking-wider text-white/80">{inputs.loanTermYears}-YEAR PROJECTION</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
            {winner}
          </h2>
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-lg px-4 py-2 text-emerald-200">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">
              Leaves you <strong className="text-white mx-1">${difference.toLocaleString()}</strong> wealthier after {inputs.loanTermYears} years
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-[#0a2540]/30 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -z-10 group-hover:bg-slate-100 transition-colors" />
          <div className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Net Wealth (PPOR)</p>
              <ShieldCheck className="w-4 h-4 text-[#0a2540]" />
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#0a192f] mt-2 tracking-tight">
              {formatMoney(finalYear?.PPOR || 0)}
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-[#0a2540]" />
                CAGR {formatPercent(insights.cagrPPOR || 0)}
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <Award className="w-3.5 h-3.5 text-[#0a2540]" />
                Tax‑free
              </span>
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl border-l-4 border-l-[#9e1b32] shadow-sm hover:shadow-lg hover:border-[#9e1b32]/30 transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#9e1b32]" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-50 rounded-tl-full -z-10 group-hover:bg-rose-100 transition-colors" />
          <div className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Net Wealth (Rentvest)</p>
              <AlertCircle className="w-4 h-4 text-[#9e1b32]" />
            </div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#9e1b32] mt-2 tracking-tight">
              {formatMoney(finalYear?.Rentvesting || 0)}
            </p>
            <div className="flex items-center gap-3 mt-4 text-xs">
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-[#9e1b32]" />
                CAGR {formatPercent(insights.cagrRentvest || 0)}
              </span>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-slate-500 font-medium">
                <DollarSign className="w-3.5 h-3.5 text-[#9e1b32]" />
                After 50% CGT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Milestones Row */}
      {insights.crossingYear && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm">
            <Calendar className="w-6 h-6 text-[#0a2540]" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Crossing Point</p>
              <p className="font-extrabold text-[#0a192f] text-lg">{insights.crossingYear}</p>
              <p className="text-[11px] font-medium text-slate-500">Rentvesting overtakes</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm">
            <Target className="w-6 h-6 text-[#9e1b32]" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Wealth Gap</p>
              <p className="font-extrabold text-[#0a192f] text-lg">{formatMoney(insights.maxGap || 0)}</p>
              <p className="text-[11px] font-medium text-slate-500">at {insights.maxGapYear}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3 shadow-sm">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Return</p>
              <p className="font-extrabold text-[#0a192f] text-lg">{formatPercent(Math.max(insights.cagrPPOR, insights.cagrRentvest))}</p>
              <p className="text-[11px] font-medium text-slate-500">Highest CAGR</p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
        <div className="flex justify-between items-center px-6 pt-6 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#9e1b32]" />
            <h3 className="text-lg font-bold text-[#0a192f]">Wealth Trajectory</h3>
          </div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
            {inputs.loanTermYears} Years
          </div>
        </div>

        <div className="flex-1 w-full p-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={projections} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
              <defs>
                <linearGradient id="colorPPOR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0a2540" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0a2540" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRentvest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9e1b32" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#9e1b32" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                dy={10} 
                interval={tickInterval}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                dx={-10}
              />
              <Tooltip 
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ 
                  backgroundColor: '#0a192f', 
                  borderRadius: '12px', 
                  border: '1px solid #1e2f4b', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)', 
                  color: '#fff',
                  padding: '12px 16px'
                }}
                itemStyle={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}
                formatter={(value, name) => [formatMoney(value), name === 'PPOR' ? 'Buying PPOR' : 'Rentvesting']}
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 600 }}
                formatter={(value) => <span className="text-[#0a192f]">{value === 'PPOR' ? 'Buying PPOR' : 'Rentvesting'}</span>}
              />
              <Area type="monotone" dataKey="PPOR" fill="url(#colorPPOR)" stroke="none" legendType="none" tooltipType="none" />
              <Area type="monotone" dataKey="Rentvesting" fill="url(#colorRentvest)" stroke="none" legendType="none" tooltipType="none" />
              <Line type="monotone" name="PPOR" dataKey="PPOR" stroke="#0a2540" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#0a2540', stroke: '#fff', strokeWidth: 2 }} />
              <Line type="monotone" name="Rentvesting" dataKey="Rentvesting" stroke="#9e1b32" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#9e1b32', stroke: '#fff', strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enhanced Disclaimer */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-600 flex items-start gap-4 shadow-sm">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#0a192f] mb-2">Methodology & Assumptions</p>
          <div className="text-xs leading-relaxed text-slate-500 space-y-2 font-medium">
            <p><strong className="text-slate-700">PPOR:</strong> Principal & Interest loan with standard amortisation schedule over the loan term. Ongoing costs (strata, rates, maintenance) are factored into annual holding costs. Capital gains are tax‑free.</p>
            <p><strong className="text-slate-700">Rentvesting:</strong> Interest‑Only loan, assuming negative gearing benefits applied to your marginal tax rate (using current 2025-26 AU Tax Brackets). Surplus cash from tax refunds and rent differential is assumed to earn 4% p.a. (e.g., in offset account). Capital Gains Tax is applied at sale using the 50% discount for assets held longer than 12 months.</p>
            <p><strong className="text-slate-700">Projections:</strong> All figures are in today's dollars, assuming constant growth rates and no transaction costs beyond initial stamp duty/LMI. Results are illustrative and do not constitute financial advice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}