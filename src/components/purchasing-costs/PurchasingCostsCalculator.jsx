import { useState } from 'react';
import { 
  MapPin, Building2, DollarSign, ShieldCheck, FileText, ChevronDown, 
  ChevronUp, PieChart as PieChartIcon, Activity, Sparkles 
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePurchasingCosts } from '../../hooks/usePurchasingCosts';

export default function PurchasingCostsCalculator() {
  const { inputs, handleInputChange, metrics } = usePurchasingCosts();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Prepare data for the beautiful donut chart
  const costBreakdownData = [
    { name: 'Stamp Duty', value: metrics.stampDuty, color: '#0a2540' },
    { name: 'LMI', value: metrics.lmi, color: '#9e1b32' },
    { name: 'Conveyancing & Professional', value: metrics.professionalFees, color: '#f59e0b' },
    { name: 'Government Fees', value: metrics.governmentFees, color: '#3b82f6' }
  ].filter(item => item.value > 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 pb-20 font-sans text-[#0a192f] animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-10 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 bg-[#0a2540]/10 rounded-full px-4 py-1.5 mb-4 border border-[#0a2540]/20">
          <Sparkles className="w-4 h-4 text-[#0a2540]" />
          <span className="text-sm font-bold text-[#0a2540]">FY25-26 Validated</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#0a192f] via-[#1e2f4b] to-[#9e1b32] bg-clip-text text-transparent pb-2">
          State Purchasing Costs
        </h1>
        <p className="text-[#64748b] mt-3 text-lg max-w-3xl lg:mx-0 mx-auto">
          Don't get caught short at settlement. Accurately calculate Stamp Duty, LMI, FHB Concessions, and hidden closing costs across all 8 Australian states.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Inputs */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center gap-3">
              <Building2 className="w-5 h-5 text-[#9e1b32]" />
              <h3 className="text-lg font-bold text-[#0a192f]">Property & Buyer Profile</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Target Price</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e1b32]" />
                  <input type="number" name="propertyPrice" value={inputs.propertyPrice} onChange={handleInputChange} className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#9e1b32]/20 focus:border-[#9e1b32] outline-none font-bold text-lg text-[#0a192f] transition-all shadow-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cash Deposit Saved</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input type="number" name="deposit" value={inputs.deposit} onChange={handleInputChange} className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-[#0a192f] transition-all shadow-sm" />
                </div>
                <div className="flex justify-between items-center mt-2 text-[11px] font-bold uppercase tracking-wider">
                  <span className="text-slate-400">Target LVR:</span>
                  <span className={metrics.lvr > 80 ? 'text-rose-600' : 'text-emerald-600'}>{metrics.lvr}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <select name="state" value={inputs.state} onChange={handleInputChange} className="w-full pl-8 pr-8 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-bold text-[#0a192f] appearance-none shadow-sm">
                      {['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Buyer Type</label>
                  <div className="relative">
                    <select name="buyerType" value={inputs.buyerType} onChange={handleInputChange} className="w-full pl-4 pr-8 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-bold text-[#0a192f] appearance-none shadow-sm">
                      <option value="First Home Buyer">First Home</option>
                      <option value="Next Home">Next Home</option>
                      <option value="Investor">Investor</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Closing Costs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="w-full bg-slate-50 hover:bg-slate-100 transition-colors p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#0a192f]/5 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#0a2540]" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-[#0a192f]">Advanced Closing Costs</h3>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Conveyancing, Pest, Reg. Fees</p>
                </div>
              </div>
              {showAdvanced ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {showAdvanced && (
              <div className="p-6 border-t border-slate-200 bg-white animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Conveyancer</label>
                    <input type="number" name="conveyancing" value={inputs.conveyancing} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-[#0a192f] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Building & Pest</label>
                    <input type="number" name="buildingPest" value={inputs.buildingPest} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-[#0a192f] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Govt Transfer Fee</label>
                    <input type="number" name="transferFee" value={inputs.transferFee} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-[#0a192f] outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Mortgage Reg.</label>
                    <input type="number" name="mortgageRegFee" value={inputs.mortgageRegFee} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-[#0a192f] outline-none" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Results */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Main Hero Card */}
          <div className="bg-[#0a192f] rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl border border-[#1e2f4b]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#1e2f4b] rounded-bl-full -z-0 opacity-40 blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Total Cash Required to Settle
                </p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                    ${Math.round(metrics.totalCashRequired).toLocaleString()}
                  </h2>
                </div>
                <p className="text-slate-400 text-sm mt-3 font-medium">
                  Deposit (${inputs.deposit.toLocaleString()}) + Closing Costs (${Math.round(metrics.totalPurchaseCosts).toLocaleString()})
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shrink-0 w-full md:w-auto">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Final Loan Amount</p>
                <p className="text-2xl font-bold text-white mb-3">${Math.round(metrics.loanAmount).toLocaleString()}</p>
                
                {metrics.lmi > 0 ? (
                  <div className="bg-rose-500/20 text-rose-200 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> LMI Applies (LVR {metrics.lvr}%)
                  </div>
                ) : (
                  <div className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> LMI Avoided
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown & Donut Chart */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3 text-[#0a192f]">
              <PieChartIcon className="w-6 h-6 text-[#9e1b32]" /> Purchasing Cost Breakdown
            </h3>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Ledger */}
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#0a2540]" />
                    <span className="font-bold text-slate-700">Stamp Duty</span>
                  </div>
                  <span className="font-extrabold text-[#0a192f]">${Math.round(metrics.stampDuty).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#9e1b32]" />
                    <span className="font-bold text-slate-700">Lenders Mortgage Ins.</span>
                  </div>
                  <span className="font-extrabold text-[#0a192f]">${Math.round(metrics.lmi).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                    <span className="font-bold text-slate-700">Conveyancing & Pest</span>
                  </div>
                  <span className="font-extrabold text-[#0a192f]">${Math.round(metrics.professionalFees).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                    <span className="font-bold text-slate-700">Government Reg. Fees</span>
                  </div>
                  <span className="font-extrabold text-[#0a192f]">${Math.round(metrics.governmentFees).toLocaleString()}</span>
                </div>
                
                <div className="w-full h-px bg-slate-200 my-4" />
                
                <div className="flex justify-between items-center p-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Closing Costs</span>
                  <span className="text-2xl font-extrabold text-[#9e1b32]">${Math.round(metrics.totalPurchaseCosts).toLocaleString()}</span>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="relative h-72">
                {metrics.totalPurchaseCosts > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={costBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} stroke="none">
                          {costBreakdownData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                        </Pie>
                        <Tooltip 
                          formatter={(v) => `$${Math.round(v).toLocaleString()}`} 
                          contentStyle={{ backgroundColor: '#0a192f', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 'bold' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Added Costs</span>
                      <span className="text-2xl font-extrabold text-[#0a192f]">${Math.round(metrics.totalPurchaseCosts).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-full">
                    <p className="text-slate-400 font-bold text-sm">Add costs to visualize</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}