import { useState, useMemo } from 'react';
import {
  Landmark, DollarSign, Info, ArrowRight, 
  ShieldCheck, Download, RefreshCw, Layers, 
  Calendar, TrendingUp, TrendingDown, Receipt
} from 'lucide-react';

// ============================================================
// HELPER FUNCTIONS & COMPONENTS
// ============================================================
const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);

const Tooltip = ({ content, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0a192f] text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-xl font-normal w-48 text-center pointer-events-none">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a192f]"></div>
    </div>
  </div>
);

// ATO Stage 3 Tax Calculator (Includes 2% Medicare Levy)
const calculateStage3Tax = (income) => {
  if (income <= 0) return 0;
  let tax = 0;
  if (income > 190000) tax = 51600 + (income - 190000) * 0.45;
  else if (income > 135000) tax = 31250 + (income - 135000) * 0.37;
  else if (income > 45000) tax = 4288 + (income - 45000) * 0.30;
  else if (income > 18200) tax = (income - 18200) * 0.16;
  
  const medicare = income > 26000 ? income * 0.02 : 0;
  return tax + medicare;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function CgtEstimator() {
  const [inputs, setInputs] = useState({
    assetType: 'Property', // 'Property' or 'Shares'
    purchasePrice: 650000,
    salePrice: 950000,
    purchaseCosts: 25000,   // Stamp duty, legals, brokerage
    saleCosts: 18000,       // Agent fees, marketing, brokerage
    heldOver12Months: true,
    carriedForwardLosses: 0,
    baseIncome: 130000      // User's standard PAYG/business income
  });

  const [reportLoading, setReportLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'assetType' ? value : Number(value) || 0) 
    }));
  };

  // --- Core CGT Mathematics ---
  const cgtModel = useMemo(() => {
    // 1. Determine Cost Base
    const costBase = inputs.purchasePrice + inputs.purchaseCosts + inputs.saleCosts;
    
    // 2. Gross Capital Gain (or Loss)
    const grossCapitalGain = inputs.salePrice - costBase;
    const isLoss = grossCapitalGain < 0;

    // 3. Apply Prior Losses (Must be done BEFORE the 50% discount)
    let gainAfterLosses = 0;
    let unusedLosses = 0;
    
    if (!isLoss) {
      gainAfterLosses = Math.max(0, grossCapitalGain - inputs.carriedForwardLosses);
      unusedLosses = Math.max(0, inputs.carriedForwardLosses - grossCapitalGain);
    } else {
      unusedLosses = inputs.carriedForwardLosses + Math.abs(grossCapitalGain);
    }

    // 4. Apply 50% CGT Discount
    let assessableGain = gainAfterLosses;
    let discountApplied = 0;
    if (inputs.heldOver12Months && gainAfterLosses > 0) {
      discountApplied = gainAfterLosses * 0.5;
      assessableGain = gainAfterLosses - discountApplied;
    }

    // 5. Marginal Tax Impact Calculation
    const baselineTax = calculateStage3Tax(inputs.baseIncome);
    const newTaxableIncome = inputs.baseIncome + assessableGain;
    const newTax = calculateStage3Tax(newTaxableIncome);
    
    const estimatedCgtPayable = isLoss ? 0 : Math.max(0, newTax - baselineTax);
    
    // 6. Net Profit in Pocket (Cash out minus Cash in minus Tax)
    const netCashFromSale = inputs.salePrice - inputs.saleCosts;
    const totalCashInvested = inputs.purchasePrice + inputs.purchaseCosts;
    const pureProfitBeforeTax = netCashFromSale - totalCashInvested;
    const netProfitAfterTax = pureProfitBeforeTax - estimatedCgtPayable;

    // Effective Tax Rate on the Gross Profit
    const effectiveTaxRate = pureProfitBeforeTax > 0 ? (estimatedCgtPayable / pureProfitBeforeTax) * 100 : 0;

    return {
      costBase,
      grossCapitalGain,
      isLoss,
      gainAfterLosses,
      discountApplied,
      assessableGain,
      baselineTax,
      newTaxableIncome,
      newTax,
      estimatedCgtPayable,
      pureProfitBeforeTax,
      netProfitAfterTax,
      unusedLosses,
      effectiveTaxRate
    };
  }, [inputs]);

  const downloadReport = async () => {
    setReportLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const reportData = { inputs, cgtModel, generated: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investool-cgt-estimate-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setReportLoading(false);
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e9eef3] text-[#0a192f] font-sans pb-16">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 border border-slate-200 shadow-sm mb-4">
              <Landmark className="w-4 h-4 text-[#0a2540]" />
              <span className="text-sm font-bold text-[#0a2540] uppercase tracking-wider">Wealth Engines</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3 text-[#0a192f] pb-1">
              CGT Estimator
              <span className="bg-[#9e1b32]/10 border border-[#9e1b32]/20 text-[#9e1b32] text-sm px-3 py-1 rounded-full shadow-sm flex items-center tracking-widest uppercase">
                Stage 3 Compliant
              </span>
            </h1>
            <p className="text-[#475569] mt-2 max-w-2xl font-medium text-lg">
              Calculate your exact Capital Gains Tax obligation and true after-tax profit.
            </p>
          </div>
          <button
            onClick={downloadReport}
            disabled={reportLoading}
            className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#1e2f4b] transition-all px-5 py-3 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5"
          >
            {reportLoading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            Export Estimate
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ========================================== */}
          {/* LEFT COLUMN: ASSUMPTIONS PANEL             */}
          {/* ========================================== */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-[#e2e8f0] rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
              
              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers size={16} className="text-[#9e1b32]" /> Asset & Transaction
              </h2>
              
              {/* Asset Toggle */}
              <div className="flex gap-3 mb-6 bg-slate-100 p-1.5 rounded-xl w-full">
                <button
                  onClick={() => handleInputChange({ target: { name: 'assetType', value: 'Property' } })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${inputs.assetType === 'Property' ? 'bg-white text-[#0a2540] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0a2540]'}`}
                >
                  Real Estate
                </button>
                <button
                  onClick={() => handleInputChange({ target: { name: 'assetType', value: 'Shares' } })}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${inputs.assetType === 'Shares' ? 'bg-white text-[#0a2540] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0a2540]'}`}
                >
                  Shares / Crypto
                </button>
              </div>

              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Purchase Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="purchasePrice" value={inputs.purchasePrice} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none focus:ring-2 focus:ring-[#0a2540] shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sale Price</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="salePrice" value={inputs.salePrice} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none focus:ring-2 focus:ring-[#0a2540] shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      Acquisition Costs
                      <Tooltip content="Stamp duty, legal fees, building inspections, brokerage."><Info size={12}/></Tooltip>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="purchaseCosts" value={inputs.purchaseCosts} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      Disposal Costs
                      <Tooltip content="Agent commissions, marketing, legal fees, brokerage."><Info size={12}/></Tooltip>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="saleCosts" value={inputs.saleCosts} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mt-8 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck size={16} className="text-[#0a2540]" /> ATO Rules & Tax Profile
              </h2>
              <div className="space-y-5">
                
                {/* 12 Month Toggle */}
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-4 rounded-xl shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                      <Calendar size={16} /> Held {'>'} 12 Months?
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Triggers the 50% CGT Discount</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="heldOver12Months" checked={inputs.heldOver12Months} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-emerald-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      Prior CGT Losses
                      <Tooltip content="Carried forward losses from previous tax returns."><Info size={12}/></Tooltip>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="carriedForwardLosses" value={inputs.carriedForwardLosses} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      Base Salary (PAYG)
                      <Tooltip content="Used to determine your marginal tax bracket before the capital gain is added."><Info size={12}/></Tooltip>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="baseIncome" value={inputs.baseIncome} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none shadow-sm" />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: VALUATION ENGINE             */}
          {/* ========================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Hero Metrics */}
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-[2rem] blur opacity-20 transition duration-1000 ${cgtModel.isLoss ? 'bg-gradient-to-r from-slate-400 to-slate-500' : 'bg-gradient-to-r from-[#9e1b32] to-[#ff7b5c] group-hover:opacity-40'}`}></div>
              <div className="relative bg-white rounded-3xl p-6 md:p-10 border border-[#e2e8f0] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                
                <div className="text-center md:text-left flex-1">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center md:justify-start">
                    <Receipt size={18} /> Estimated CGT Payable
                  </p>
                  <h2 className={`text-5xl md:text-6xl font-black tracking-tighter drop-shadow-sm ${cgtModel.isLoss ? 'text-slate-400' : 'text-rose-600'}`}>
                    {formatCurrency(cgtModel.estimatedCgtPayable)}
                  </h2>
                  <p className="text-sm font-bold text-slate-500 mt-2">
                    Added to your EOFY tax bill.
                  </p>
                </div>

                <div className="h-16 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex-1 w-full text-center md:text-right">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">True Net Profit</p>
                  <div className={`py-4 px-6 rounded-2xl border inline-block shadow-inner ${cgtModel.isLoss ? 'bg-slate-50 border-slate-200' : 'bg-[#0a192f] border-slate-700'}`}>
                    <p className={`text-4xl font-black ${cgtModel.isLoss ? 'text-slate-600' : 'text-white'}`}>
                      {formatCurrency(cgtModel.netProfitAfterTax)}
                    </p>
                    <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${cgtModel.isLoss ? 'text-slate-400' : 'text-emerald-400'}`}>
                      {cgtModel.isLoss ? 'Capital Loss' : 'In Your Pocket (After Tax)'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. The CGT Bridge (How we got the number) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e2e8f0] shadow-lg">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex justify-between items-center">
                <span>The CGT Bridge (ATO Methodology)</span>
              </h3>
              
              <div className="space-y-4">
                
                {/* Step 1: Cost Base */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">1</div>
                    <div>
                      <p className="text-sm font-bold text-[#0a2540]">Calculate Cost Base</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Purchase + Buying Costs + Selling Costs</p>
                    </div>
                  </div>
                  <p className="text-lg font-black text-[#0a2540]">{formatCurrency(cgtModel.costBase)}</p>
                </div>

                {/* Step 2: Gross Gain */}
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">2</div>
                    <div>
                      <p className="text-sm font-bold text-[#0a2540]">Gross Capital {cgtModel.isLoss ? 'Loss' : 'Gain'}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sale Price - Cost Base</p>
                    </div>
                  </div>
                  <p className={`text-lg font-black ${cgtModel.isLoss ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {formatCurrency(cgtModel.grossCapitalGain)}
                  </p>
                </div>

                {!cgtModel.isLoss && (
                  <>
                    {/* Step 3: Losses */}
                    {inputs.carriedForwardLosses > 0 && (
                      <div className="flex justify-between items-center p-3 rounded-xl bg-rose-50 border border-rose-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-rose-600 font-bold text-xs">3</div>
                          <div>
                            <p className="text-sm font-bold text-rose-800">Deduct Prior Losses</p>
                            <p className="text-[10px] text-rose-600 uppercase tracking-wider">Applied before discount</p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-rose-600">-{formatCurrency(Math.min(inputs.carriedForwardLosses, cgtModel.grossCapitalGain))}</p>
                      </div>
                    )}

                    {/* Step 4: Discount */}
                    {inputs.heldOver12Months && (
                      <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">4</div>
                          <div>
                            <p className="text-sm font-bold text-emerald-800">Apply 50% CGT Discount</p>
                            <p className="text-[10px] text-emerald-600 uppercase tracking-wider">Asset held {'>'} 12 Months</p>
                          </div>
                        </div>
                        <p className="text-lg font-black text-emerald-600">-{formatCurrency(cgtModel.discountApplied)}</p>
                      </div>
                    )}

                    {/* Final Assessable */}
                    <div className="flex justify-between items-center p-4 rounded-xl bg-[#0a2540] border border-slate-700 shadow-md mt-2">
                      <div>
                        <p className="text-sm font-bold text-[#ff7b5c] uppercase tracking-widest">Final Assessable Gain</p>
                        <p className="text-[10px] text-slate-400">This amount is added to your tax return</p>
                      </div>
                      <p className="text-2xl font-black text-white">+{formatCurrency(cgtModel.assessableGain)}</p>
                    </div>
                  </>
                )}

                {/* Loss Carry Forward Notification */}
                {cgtModel.unusedLosses > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-200 flex items-start gap-3">
                    <Info className="text-slate-500 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-bold text-[#0a2540]">Unused Capital Losses</p>
                      <p className="text-xs text-slate-500 mt-1">You have <strong className="text-[#0a2540]">{formatCurrency(cgtModel.unusedLosses)}</strong> in capital losses to carry forward to future tax years.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Marginal Tax Impact Breakdown */}
            {!cgtModel.isLoss && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#f8fafc] rounded-3xl p-6 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-slate-400" />
                    <h4 className="font-bold text-[#0a2540]">Tax Bracket Impact</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Original Income:</span>
                      <span className="text-[#0a2540] font-bold">{formatCurrency(inputs.baseIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">New Taxable Income:</span>
                      <span className="text-rose-600 font-bold">{formatCurrency(cgtModel.newTaxableIncome)}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Effective Tax Rate on Profit</p>
                      <p className="text-2xl font-black text-[#0a2540] text-center mt-1">{cgtModel.effectiveTaxRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#f8fafc] rounded-3xl p-6 border border-[#e2e8f0] shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingDown size={18} className="text-slate-400" />
                    <h4 className="font-bold text-[#0a2540]">Tax Liability Shift</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">Baseline Tax (No Sale):</span>
                      <span className="text-[#0a2540] font-bold">{formatCurrency(cgtModel.baselineTax)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="text-slate-500 font-medium">New Total Tax Bill:</span>
                      <span className="text-rose-600 font-bold">{formatCurrency(cgtModel.newTax)}</span>
                    </div>
                    <div className="pt-2">
                      <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">Delta (CGT Payable)</p>
                      <p className="text-2xl font-black text-rose-600 text-center mt-1">{formatCurrency(cgtModel.estimatedCgtPayable)}</p>
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