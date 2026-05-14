import { Building2, DollarSign, ChevronDown, ChevronUp, Receipt, Landmark, ShieldCheck, Percent, Clock, Briefcase } from 'lucide-react';

export default function YieldCashflowInputs({ inputs, handleInputChange, showAdvanced, setShowAdvanced }) {
  // Quick calculated values for immediate UI feedback
  const loanAmount = Math.max(0, inputs.propertyPrice - inputs.deposit);
  const currentLvr = inputs.propertyPrice > 0 ? ((loanAmount / inputs.propertyPrice) * 100).toFixed(1) : 0;

  return (
    <div className="xl:col-span-4 space-y-6">
      
      {/* 1. PURCHASE & INCOME */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2 text-[#0a192f]">
            <Building2 className="w-5 h-5 text-[#9e1b32]" /> Acquisition & Income
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">Step 1</span>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purchase Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9e1b32]" />
                <input type="number" name="propertyPrice" value={inputs.propertyPrice} onChange={handleInputChange} className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#9e1b32]/20 focus:border-[#9e1b32] outline-none font-bold text-lg text-[#0a192f] transition-all shadow-sm" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State</label>
                <div className="relative">
                  <select name="state" value={inputs.state} onChange={handleInputChange} className="w-full pl-4 pr-10 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#9e1b32]/20 focus:border-[#9e1b32] outline-none font-bold text-[#0a192f] appearance-none transition-all shadow-sm">
                    {['NSW','VIC','QLD','WA','SA','TAS','ACT','NT'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Weekly Rent</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
                  <input type="number" name="weeklyRent" value={inputs.weeklyRent} onChange={handleInputChange} className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-bold text-[#0a192f] transition-all shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FINANCING STRATEGY */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2 text-[#0a192f]">
            <Landmark className="w-5 h-5 text-[#0a2540]" /> Financing Strategy
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">Step 2</span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-5">
            
            {/* Deposit & LVR Dynamic Row */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cash Deposit</label>
              <div className="relative mb-3">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0a2540]" />
                <input type="number" name="deposit" value={inputs.deposit} onChange={handleInputChange} className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-bold text-[#0a192f] transition-all shadow-sm" />
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Loan: <strong className="text-[#0a192f]">${loanAmount.toLocaleString()}</strong></span>
                <span className={`px-2 py-1 rounded-md ${currentLvr > 80 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                  LVR: {currentLvr}%
                </span>
              </div>
            </div>

            {/* Interest, Type, and Term in a 3-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Interest Rate</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="number" step="0.1" name="interestRate" value={inputs.interestRate} onChange={handleInputChange} className="w-full pl-9 pr-3 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-bold text-[#0a192f] transition-all shadow-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Loan Type</label>
                <div className="relative">
                  <select name="loanType" value={inputs.loanType} onChange={handleInputChange} className="w-full pl-4 pr-8 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-bold text-[#0a192f] appearance-none transition-all shadow-sm">
                    <option value="IO">Interest Only</option>
                    <option value="PI">Principal & Interest</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Loan Term</label>
                <div className="relative">
                  <select name="loanTermYears" value={inputs.loanTermYears} onChange={handleInputChange} className="w-full pl-4 pr-8 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-bold text-[#0a192f] appearance-none transition-all shadow-sm">
                    <option value="10">10 Years</option>
                    <option value="20">20 Years</option>
                    <option value="30">30 Years</option>
                    <option value="40">40 Years</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. OPERATING EXPENSES (OpEx) */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2 text-[#0a192f]">
            <Receipt className="w-5 h-5 text-amber-500" /> Operating Expenses
          </h3>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">Step 3</span>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Strata / Body Corp (Yr)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="number" name="annualStrata" value={inputs.annualStrata} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-[#0a192f] outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Council Rates (Yr)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="number" name="annualRates" value={inputs.annualRates} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-[#0a192f] outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Maintenance (Yr)</label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="number" name="annualMaintenance" value={inputs.annualMaintenance} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-[#0a192f] outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Property Mgmt (%)</label>
              <div className="relative">
                <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="number" step="0.1" name="propertyMgmtRate" value={inputs.propertyMgmtRate} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-[#0a192f] outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADVANCED TAX & STRUCTURE TOGGLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)} 
          className="w-full bg-slate-50 hover:bg-slate-100 transition-colors p-5 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0a192f]/5 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#0a2540]" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-[#0a192f]">Advanced Tax & Structure</h3>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Depreciation, Salary & Vacancy</p>
            </div>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </button>

        {showAdvanced && (
          <div className="p-6 border-t border-slate-200 bg-white animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> Base Salary (Pre-Tax)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="number" name="salary" value={inputs.salary} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-[#0a192f] outline-none focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-[#9e1b32] uppercase tracking-wider mb-1.5">
                  Paper Depreciation (Yr)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9e1b32]" />
                  <input type="number" name="annualDepreciation" value={inputs.annualDepreciation} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-rose-50 border border-rose-200 rounded-lg text-sm font-bold text-[#9e1b32] outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Vacancy Rate (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="number" step="0.1" name="vacancyRate" value={inputs.vacancyRate || 5.0} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-[#0a192f] outline-none focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] transition-all" />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}