import { useState } from 'react';
import { DollarSign, Calculator, Building2, Sliders, MapPin, ChevronDown, ChevronUp, Clock } from 'lucide-react';

export default function RentvestingInputs({ inputs, handleInputChange, handleSliderChange, finalStampDuty, finalLMI }) {
  const [showDetailed, setShowDetailed] = useState(false);

  return (
    <div className="xl:col-span-4 space-y-6">
      
      {/* Financial Baseline */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-3 text-[#0a192f]">
          <Calculator className="w-5 h-5 text-[#9e1b32]" /> Financial Baseline
        </h3>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Base Salary (Pre-Tax)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" name="salary" value={inputs.salary} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#9e1b32]/20 focus:border-[#9e1b32] outline-none font-semibold text-[#0a192f]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available Deposit / Equity</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" name="savings" value={inputs.savings} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#9e1b32]/20 focus:border-[#9e1b32] outline-none font-semibold text-[#0a192f]" />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">After stamp duty & LMI, effective deposit = <span className="text-[#9e1b32] font-bold">${Math.max(0, inputs.savings - finalStampDuty - finalLMI).toLocaleString()}</span></p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Price</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input type="number" name="propertyPrice" value={inputs.propertyPrice} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#9e1b32]/20 focus:border-[#9e1b32] outline-none font-semibold text-[#0a192f]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select name="state" value={inputs.state} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#9e1b32]/20 focus:border-[#9e1b32] outline-none font-semibold text-[#0a192f] appearance-none">
                  <option value="NSW">NSW</option>
                  <option value="VIC">VIC</option>
                  <option value="QLD">QLD</option>
                  <option value="WA">WA</option>
                  <option value="SA">SA</option>
                  <option value="TAS">TAS</option>
                  <option value="ACT">ACT</option>
                  <option value="NT">NT</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-2 text-[11px] font-medium text-slate-500">
            <div className="bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 flex justify-between"><span>Stamp Duty:</span> <strong>${finalStampDuty.toLocaleString()}</strong></div>
            <div className="bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 flex justify-between"><span>LMI:</span> <strong>${finalLMI.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>

      {/* Loan & Market Variables */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-3 text-[#0a192f]">
          <Building2 className="w-5 h-5 text-[#0a2540]" /> Loan & Market Variables
        </h3>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Interest Rate (%)</label>
              <input type="number" step="0.1" name="interestRate" value={inputs.interestRate} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-semibold text-[#0a192f]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Loan Term</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <select name="loanTermYears" value={inputs.loanTermYears} onChange={handleInputChange} className="w-full pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-semibold text-[#0a192f] appearance-none">
                  <option value={10}>10 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={30}>30 Years</option>
                  <option value={40}>40 Years</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cap Growth (%)</label>
              <input type="number" step="0.1" name="capitalGrowth" value={inputs.capitalGrowth} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-semibold text-[#0a192f]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Rental Yield (%)</label>
              <input type="number" step="0.1" name="rentalYield" value={inputs.rentalYield} onChange={handleInputChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-semibold text-[#0a192f]" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Weekly Rent You Pay (To Live)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="number" name="weeklyRent" value={inputs.weeklyRent} onChange={handleInputChange} className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0a2540]/20 focus:border-[#0a2540] outline-none font-semibold text-[#0a192f]" />
            </div>
          </div>

          {/* Detailed Mode Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button 
              onClick={() => setShowDetailed(!showDetailed)}
              className="w-full flex justify-between items-center py-2 text-sm font-bold text-[#0a2540] hover:text-[#9e1b32] transition-colors"
            >
              <span>Detailed Expenses & Depreciation</span>
              {showDetailed ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            
            {showDetailed && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Property Mgmt (%)</label>
                    <input type="number" step="0.1" name="propertyManagementRate" value={inputs.propertyManagementRate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Depreciation (Paper Loss)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type="number" name="annualDepreciation" value={inputs.annualDepreciation} onChange={handleInputChange} className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Annual Strata</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type="number" name="annualStrata" value={inputs.annualStrata} onChange={handleInputChange} className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Council Rates</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type="number" name="annualRates" value={inputs.annualRates} onChange={handleInputChange} className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Maintenance</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type="number" name="annualMaintenance" value={inputs.annualMaintenance} onChange={handleInputChange} className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Landlord Insurance</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type="number" name="annualInsurance" value={inputs.annualInsurance} onChange={handleInputChange} className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}