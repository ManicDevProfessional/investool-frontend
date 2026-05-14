import { TrendingDown, TrendingUp, Wallet, Receipt, BarChart3, HelpCircle, PieChart as PieChartIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, PieChart as RePieChart, Pie, Legend } from 'recharts';

function MetricCard({ title, value, tooltip, highlight = false }) {
  return (
    <div className={`bg-white p-6 rounded-2xl border ${highlight ? 'border-b-4 border-b-[#9e1b32]' : 'border-slate-200'} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
      {highlight && <div className="absolute top-0 right-0 w-16 h-16 bg-rose-50 rounded-bl-full -z-10 group-hover:bg-rose-100 transition-colors" />}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        {tooltip && (
          <div className="group/tooltip relative">
            <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help hover:text-slate-500 transition-colors" />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-3 bg-[#0a192f] text-white text-xs font-medium rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-2xl text-center leading-relaxed">
              {tooltip}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a192f]" />
            </div>
          </div>
        )}
      </div>
      <p className={`text-3xl font-extrabold tracking-tight ${highlight ? 'text-[#9e1b32]' : 'text-[#0a192f]'}`}>{value}</p>
    </div>
  );
}

export default function YieldDashboardTab({ metrics, cashflowChartData, expenseData }) {
  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      
      {/* Hero Banner: Weekly Cashflow */}
      <div className={`relative rounded-2xl p-8 md:p-10 shadow-2xl overflow-hidden border transition-colors duration-500 ${metrics.weeklyPostTax >= 0 ? 'bg-gradient-to-br from-emerald-900 via-[#064e3b] to-emerald-950 border-emerald-800' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-[#450a0a] border-rose-900'}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%239C27B0%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
        <div className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 ${metrics.weeklyPostTax >= 0 ? 'bg-emerald-400' : 'bg-rose-500'}`} />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-1.5 mb-4 border border-white/20 shadow-sm">
              <Wallet className="w-4 h-4 text-white" />
              <span className="text-xs font-bold tracking-widest text-white uppercase">Post-Tax Reality</span>
            </div>
            <p className="text-slate-300 text-sm font-medium mb-1 tracking-wide">Your exact holding cost is</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-6xl md:text-7xl font-extrabold text-white tracking-tight">
                {metrics.weeklyPostTax < 0 ? '-' : ''}${Math.abs(Math.round(metrics.weeklyPostTax))}
              </h2>
              <span className="text-2xl text-white/70 font-medium">/ week</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold backdrop-blur-md border shadow-lg ${metrics.weeklyPostTax >= 0 ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/40' : 'bg-rose-500/20 text-rose-100 border-rose-500/40'}`}>
              {metrics.weeklyPostTax >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {metrics.cashflowStatus}
            </div>
            <div className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
              <Receipt className="w-5 h-5" />
              {metrics.gearingStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MetricCard title="Gross Yield" value={`${metrics.grossYield.toFixed(2)}%`} tooltip="Annual rent divided by property price." />
        <MetricCard title="Net Yield (True)" value={`${metrics.netYield.toFixed(2)}%`} tooltip="Net operating income (after expenses) divided by property price." highlight />
        <MetricCard title="Cash-on-Cash" value={`${metrics.cashOnCashReturn.toFixed(1)}%`} tooltip="Your annual post-tax cashflow divided by your actual cash deposit." />
        <MetricCard title="DSCR" value={metrics.dscr.toFixed(2)} tooltip="Debt Service Coverage Ratio. A ratio above 1.0 means income covers the interest." />
      </div>

      {/* Cashflow Breakdown Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-[#0a192f]">
          <BarChart3 className="w-6 h-6 text-[#0a2540]" /> Operating Ledger
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Cashflow Waterfall</h4>
            <div className="h-72 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashflowChartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 13, fontWeight: 600, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#0a192f', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', color: '#fff' }} itemStyle={{ fontWeight: 'bold' }} formatter={(v) => [`$${Math.abs(Math.round(v)).toLocaleString()}`, 'Amount']} />
                  <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={2} />
                  <Bar dataKey="amount" barSize={28} radius={[0, 6, 6, 0]}>
                    {cashflowChartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expense Distribution</h4>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 flex flex-col xl:flex-row items-center justify-center gap-8">
              <div className="w-56 h-56 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={expenseData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} stroke="none">
                      {expenseData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a192f', borderRadius: '12px', border: 'none', color: '#fff' }} itemStyle={{ fontWeight: 'bold' }} formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
                  </RePieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total OpEx</span>
                  <span className="text-2xl font-extrabold text-[#0a192f]">${Math.round(metrics.totalOpex).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex-1 w-full space-y-3">
                {expenseData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-bold text-slate-700">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-[#0a192f]">${Math.round(item.value).toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-slate-400">{((item.value / metrics.totalOpex) * 100).toFixed(1)}%</p>
                    </div>
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