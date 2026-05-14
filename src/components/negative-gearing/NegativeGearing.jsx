import { useState, useMemo } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Receipt,
  Building,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Info,
  Settings,
  Download,
  RefreshCw,
  AlertCircle,
  Home,
  Landmark,
  PiggyBank,
  LineChart,
  Percent,
  Zap,
  Target,
  Gauge,
  Calendar
} from 'lucide-react';
import { calculateNegativeGearing } from '../../utils/tax';

// ============================================================
// 1. HELPER FUNCTIONS & COMPONENTS
// ============================================================
const formatCurrency = (val) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);

const formatPercent = (val) =>
  new Intl.NumberFormat('en-AU', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val / 100);

const formatNumber = (val) =>
  new Intl.NumberFormat('en-AU').format(Math.round(val));

const Tooltip = ({ content, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0a192f] text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-xl">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a192f]"></div>
    </div>
  </div>
);

// ============================================================
// 2. MAIN COMPONENT
// ============================================================
export default function NegativeGearing() {
  const [inputs, setInputs] = useState({
    salary: 130000,
    weeklyRent: 650,
    loanAmount: 600000,
    interestRate: 6.2,
    annualExpenses: 8500,
    annualDepreciation: 12000,
    propertyValue: 750000,
    loanTermYears: 30,
    annualGrowthRate: 3.0,
    managementFeePercent: 6.5
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sensitivityMode, setSensitivityMode] = useState('interest');
  const [reportLoading, setReportLoading] = useState(false);

  const lvr = (inputs.loanAmount / inputs.propertyValue) * 100;
  const annualRent = inputs.weeklyRent * 52;
  const annualInterest = inputs.loanAmount * (inputs.interestRate / 100);
  const annualManagementFees = (inputs.weeklyRent * 52) * (inputs.managementFeePercent / 100);
  const totalAnnualExpenses = inputs.annualExpenses + annualManagementFees;

  const sensitivityScenarios = useMemo(() => {
    if (sensitivityMode === 'interest') {
      const rates = [inputs.interestRate - 1, inputs.interestRate, inputs.interestRate + 1].filter(r => r > 0);
      return rates.map(rate => {
        const interest = inputs.loanAmount * (rate / 100);
        const res = calculateNegativeGearing({
          salary: inputs.salary,
          annualRent,
          annualExpenses: totalAnnualExpenses,
          annualInterest: interest,
          annualDepreciation: inputs.annualDepreciation
        });
        return { label: `${rate}%`, value: res.weeklyHoldingCost, rate };
      });
    } else {
      const rents = [inputs.weeklyRent - 50, inputs.weeklyRent, inputs.weeklyRent + 50].filter(r => r > 0);
      return rents.map(rent => {
        const rentAnnual = rent * 52;
        const mgmtFees = rentAnnual * (inputs.managementFeePercent / 100);
        const totalExp = inputs.annualExpenses + mgmtFees;
        const res = calculateNegativeGearing({
          salary: inputs.salary,
          annualRent: rentAnnual,
          annualExpenses: totalExp,
          annualInterest,
          annualDepreciation: inputs.annualDepreciation
        });
        return { label: `$${rent}/wk`, value: res.weeklyHoldingCost, rent };
      });
    }
  }, [inputs, sensitivityMode, annualRent, annualInterest, totalAnnualExpenses]);

  const results = useMemo(() => {
    return calculateNegativeGearing({
      salary: inputs.salary,
      annualRent,
      annualExpenses: totalAnnualExpenses,
      annualInterest,
      annualDepreciation: inputs.annualDepreciation
    });
  }, [inputs.salary, annualRent, totalAnnualExpenses, annualInterest, inputs.annualDepreciation]);

  const breakEvenRent = useMemo(() => {
    let low = 0, high = 2000;
    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      const rentAnnual = mid * 52;
      const mgmtFees = rentAnnual * (inputs.managementFeePercent / 100);
      const totalExp = inputs.annualExpenses + mgmtFees;
      const testRes = calculateNegativeGearing({
        salary: inputs.salary,
        annualRent: rentAnnual,
        annualExpenses: totalExp,
        annualInterest,
        annualDepreciation: inputs.annualDepreciation
      });
      if (testRes.weeklyHoldingCost > 0) low = mid;
      else high = mid;
    }
    return (low + high) / 2;
  }, [inputs.salary, annualInterest, inputs.annualDepreciation, inputs.annualExpenses, inputs.managementFeePercent]);

  const marginalBenefit = useMemo(() => {
    const base = results.taxRefund;
    const extraDep = calculateNegativeGearing({
      salary: inputs.salary,
      annualRent,
      annualExpenses: totalAnnualExpenses,
      annualInterest,
      annualDepreciation: inputs.annualDepreciation + 1000
    });
    return (extraDep.taxRefund - base) / 1000;
  }, [results, inputs, annualRent, annualInterest, totalAnnualExpenses]);

  const loanInsight = useMemo(() => {
    const monthlyRate = inputs.interestRate / 100 / 12;
    const months = inputs.loanTermYears * 12;
    const payment = inputs.loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    const firstYearInterest = inputs.loanAmount * (inputs.interestRate / 100);
    const firstYearPrincipal = payment * 12 - firstYearInterest;
    return { firstYearInterest, firstYearPrincipal, monthlyPayment: payment };
  }, [inputs.loanAmount, inputs.interestRate, inputs.loanTermYears]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const downloadReport = async () => {
    setReportLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const reportData = { inputs, results, breakEvenRent, marginalBenefit, loanInsight, generated: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investool-negative-gearing-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setReportLoading(false);
  };

  if (!results) return null;

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e9eef3] text-[#0a192f] font-sans pb-16">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* Header with actions */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3 text-[#0a192f] pb-1">
              <Calculator className="text-[#9e1b32]" size={40} />
              Negative Gearing 
              <span className="bg-[#9e1b32]/10 border border-[#9e1b32]/20 text-[#9e1b32] text-sm px-3 py-1 rounded-full shadow-sm flex items-center">
                Advanced
              </span>
            </h1>
            <p className="text-[#475569] mt-2 max-w-2xl font-medium text-lg">
              Model tax refunds, depreciation impact, and true holding costs with ATO Stage 3 compliance.
            </p>
          </div>
          <button
            onClick={downloadReport}
            disabled={reportLoading}
            className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#1e2f4b] transition-all px-5 py-3 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5"
          >
            {reportLoading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            Export Report
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ========================================== */}
          {/* LEFT COLUMN: INPUT PANEL                    */}
          {/* ========================================== */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-[#e2e8f0] rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
              <h2 className="text-xl font-bold text-[#0a2540] mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Landmark size={20} className="text-[#9e1b32]" />
                Investor Profile
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                    Base Salary (Pre-Tax)
                    <Tooltip content="Your PAYG income before deductions. Higher salary = higher tax refund.">
                      <Info size={14} className="text-slate-400 cursor-help" />
                    </Tooltip>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      name="salary"
                      value={inputs.salary}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] focus:border-transparent outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Property Value</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="propertyValue" value={inputs.propertyValue} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loan Amount</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="loanAmount" value={inputs.loanAmount} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-600">Loan-to-Value Ratio (LVR)</span>
                  <span className={`font-bold ${lvr > 80 ? 'text-rose-600' : 'text-[#0a2540]'}`}>{formatPercent(lvr)}</span>
                  {lvr > 80 && <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">⚠️ LMI may apply</span>}
                </div>
              </div>

              <h2 className="text-xl font-bold text-[#0a2540] mt-8 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Home size={20} className="text-[#9e1b32]" />
                Property Cashflow
              </h2>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Weekly Rent</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="weeklyRent" value={inputs.weeklyRent} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interest Rate (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" step="0.1" name="interestRate" value={inputs.interestRate} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Annual Expenses (excl. interest)</label>
                    <Tooltip content="Strata, council rates, insurance, repairs, etc.">
                      <Info size={14} className="text-slate-400 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" name="annualExpenses" value={inputs.annualExpenses} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                    <span>Annual Depreciation</span>
                    <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded">Paper deduction</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" name="annualDepreciation" value={inputs.annualDepreciation} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                  </div>
                </div>

                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm font-bold text-[#9e1b32] flex items-center gap-1 hover:text-[#b41f3a] transition-colors pt-2"
                >
                  <Settings size={14} />
                  {showAdvanced ? 'Hide advanced settings' : 'Show advanced (loan term, growth, fees)'}
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t border-slate-200 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loan Term (years)</label>
                      <input type="number" name="loanTermYears" value={inputs.loanTermYears} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Annual Property Growth (%)</label>
                      <input type="number" step="0.5" name="annualGrowthRate" value={inputs.annualGrowthRate} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Management Fee (%)</label>
                      <input type="number" step="0.5" name="managementFeePercent" value={inputs.managementFeePercent} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-2 px-3 text-[#0a2540] font-medium focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: INSIGHTS & VISUALIZATIONS    */}
          {/* ========================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Key Metrics Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-md shadow-slate-200/50">
                <div className="flex justify-between items-start">
                  <TrendingDown size={20} className="text-rose-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">ATO Paper Loss</span>
                </div>
                <p className="text-2xl font-black text-[#0a2540] mt-3">{formatCurrency(results.paperLoss)}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">Includes depreciation</p>
              </div>
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200 shadow-md shadow-slate-200/50">
                <div className="flex justify-between items-start">
                  <Receipt size={20} className="text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tax Refund</span>
                </div>
                <p className="text-2xl font-black text-emerald-700 mt-3">+{formatCurrency(results.taxRefund)}</p>
                <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center gap-1"><ShieldCheck size={12} /> Stage 3 + Medicare</p>
              </div>
              <div className="bg-[#f8fafc] rounded-3xl p-6 border border-[#e2e8f0] shadow-md shadow-slate-200/50">
                <div className="flex justify-between items-start">
                  <PiggyBank size={20} className="text-[#0a2540]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Marginal Benefit</span>
                </div>
                <p className="text-2xl font-black text-[#0a2540] mt-3">{formatCurrency(marginalBenefit)}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">per $1k depreciation</p>
              </div>
            </div>

            {/* Core "Aha!" Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#9e1b32] to-[#ff7b5c] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl p-6 md:p-10 border border-[#e2e8f0] shadow-xl">
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">True Out-of-Pocket Cost</p>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 my-8">
                    <div>
                      <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-1">Before Tax</p>
                      <p className="text-2xl font-bold text-rose-500">{formatCurrency(results.cashflowBeforeTax / 52)} <span className="text-sm text-rose-400">/wk</span></p>
                    </div>
                    
                    <ArrowRight className="hidden md:block text-slate-300" size={32} />
                    
                    {/* The Hero Metric Box */}
                    <div className="bg-gradient-to-br from-[#0a192f] to-[#1e2f4b] py-5 px-10 rounded-2xl shadow-2xl border border-slate-700">
                      <p className="text-[#ff7b5c] text-xs font-bold uppercase tracking-widest mb-1">After Tax Refund</p>
                      <p className="text-5xl font-black text-white drop-shadow-md">
                        {formatCurrency(results.weeklyHoldingCost)}
                        <span className="text-xl text-slate-400 font-medium">/wk</span>
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
                    Your actual weekly cash outflow after the ATO refunds <strong className="text-[#0a2540]">{formatCurrency(results.taxRefund)}</strong> at tax time.
                  </p>
                </div>
              </div>
            </div>

            {/* Sensitivity Analysis */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#e2e8f0] shadow-lg">
              <h3 className="text-lg font-bold text-[#0a2540] mb-5 flex items-center gap-2">
                <Gauge size={20} className="text-[#9e1b32]" />
                Sensitivity Analysis
              </h3>
              <div className="flex gap-3 mb-6 bg-slate-100 p-1.5 rounded-full w-fit">
                <button
                  onClick={() => setSensitivityMode('interest')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${sensitivityMode === 'interest' ? 'bg-white text-[#0a2540] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0a2540]'}`}
                >
                  Interest Rate
                </button>
                <button
                  onClick={() => setSensitivityMode('rent')}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${sensitivityMode === 'rent' ? 'bg-white text-[#0a2540] shadow-sm border border-slate-200' : 'text-slate-500 hover:text-[#0a2540]'}`}
                >
                  Weekly Rent
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {sensitivityScenarios.map((scenario, idx) => (
                  <div key={idx} className={`rounded-2xl p-4 text-center border ${idx === 1 ? 'bg-[#f8fafc] border-[#9e1b32]/20 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{scenario.label}</p>
                    <p className="text-xl font-black text-[#0a2540] mt-1">{formatCurrency(scenario.value)}<span className="text-xs font-medium text-slate-400">/wk</span></p>
                    {idx === 1 && <div className="text-[10px] font-bold text-[#9e1b32] mt-2 uppercase tracking-widest bg-[#9e1b32]/10 rounded-full inline-block px-2 py-0.5">Current</div>}
                  </div>
                ))}
              </div>
              <div className="mt-5 text-center text-xs font-medium text-slate-500">
                ±1% {sensitivityMode === 'interest' ? 'interest rate' : 'weekly rent change'} shifts your holding cost by ~<strong className="text-[#0a2540]">{formatCurrency(Math.abs(sensitivityScenarios[2].value - sensitivityScenarios[0].value) / 2)}</strong>/wk
              </div>
            </div>

            {/* Break-even & Loan Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={18} className="text-[#0a2540]" />
                  <h4 className="font-bold text-[#0a2540]">Break-even Rent</h4>
                </div>
                <p className="text-3xl font-black text-[#0a2540]">{formatCurrency(breakEvenRent)}<span className="text-sm font-medium text-slate-500">/wk</span></p>
                <p className="text-xs font-medium text-slate-500 mt-1">Rent needed for $0 holding cost</p>
                <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div className="bg-[#0a2540] h-full rounded-full" style={{ width: `${Math.min(100, (inputs.weeklyRent / breakEvenRent) * 100)}%` }}></div>
                </div>
                <p className="text-xs mt-2 font-bold text-slate-400 uppercase tracking-wider text-right">
                  {Math.round((inputs.weeklyRent / breakEvenRent) * 100)}% Covered
                </p>
              </div>
              
              <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={18} className="text-[#0a2540]" />
                  <h4 className="font-bold text-[#0a2540]">First Year Loan Impact</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">Interest paid:</span><span className="text-[#0a2540] font-bold">{formatCurrency(loanInsight.firstYearInterest)}</span></div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">Principal repaid:</span><span className="text-[#0a2540] font-bold">{formatCurrency(loanInsight.firstYearPrincipal)}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-500 font-medium">Monthly P&I:</span><span className="text-[#0a2540] font-bold">{formatCurrency(loanInsight.monthlyPayment)}</span></div>
                </div>
              </div>
            </div>

            {/* Future projection */}
            <div className="bg-gradient-to-r from-slate-50 to-white rounded-3xl p-6 border border-[#e2e8f0] shadow-md">
              <div className="flex items-center gap-2 mb-5">
                <LineChart size={20} className="text-[#9e1b32]" />
                <h4 className="font-bold text-[#0a2540]">5-Year Wealth Projection <span className="text-slate-400 font-normal">(estimated)</span></h4>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Est. Growth</p>
                  <p className="text-xl font-black text-[#0a2540]">{formatCurrency(inputs.propertyValue * Math.pow(1 + inputs.annualGrowthRate/100, 5) - inputs.propertyValue)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Refunds</p>
                  <p className="text-xl font-black text-[#0a2540]">{formatCurrency(results.taxRefund * 5)}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Net Gain</p>
                  <p className="text-xl font-black text-emerald-600">{formatCurrency(inputs.propertyValue * Math.pow(1 + inputs.annualGrowthRate/100, 5) - inputs.loanAmount + results.taxRefund * 5)}</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-4 text-center font-medium">
                *Assuming constant rent, expenses, and interest rates. This is a mathematical model, not financial advice.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}