import { useState, useMemo } from 'react';
import {
  Flame, DollarSign, TrendingUp, Info, 
  ArrowRight, Target, Download, RefreshCw, 
  Layers, Percent, Calendar, BatteryCharging,
  Briefcase, Activity
} from 'lucide-react';

// ============================================================
// HELPER FUNCTIONS & COMPONENTS
// ============================================================
const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);
const formatLargeCurrency = (val) => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return formatCurrency(val);
};
const formatPercent = (val) => new Intl.NumberFormat('en-AU', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val / 100);

const Tooltip = ({ content, children }) => (
  <div className="group relative inline-block">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0a192f] text-white text-xs rounded-lg py-1.5 px-3 whitespace-nowrap z-10 shadow-xl font-normal w-48 text-center pointer-events-none">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0a192f]"></div>
    </div>
  </div>
);

// ============================================================
// MAIN ENGINE COMPONENT
// ============================================================
export default function FireProjector() {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    currentInvested: 150000,
    annualIncome: 120000,     // Post-tax
    annualExpenses: 65000,
    expectedReturn: 7.0,      // Real return (post-inflation)
    withdrawalRate: 4.0       // SWR (Safe Withdrawal Rate)
  });

  const [reportLoading, setReportLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: Number(value) || 0 }));
  };

  // --- Core FIRE Mathematics ---
  const fireModel = useMemo(() => {
    const annualSavings = inputs.annualIncome - inputs.annualExpenses;
    const savingsRate = inputs.annualIncome > 0 ? (annualSavings / inputs.annualIncome) * 100 : 0;
    
    // Core FIRE Target = Expenses / Safe Withdrawal Rate
    const fireTarget = inputs.annualExpenses / (inputs.withdrawalRate / 100);
    const leanFireTarget = (inputs.annualExpenses * 0.7) / (inputs.withdrawalRate / 100);
    const fatFireTarget = (inputs.annualExpenses * 1.3) / (inputs.withdrawalRate / 100);

    const trajectory = [];
    let currentBalance = inputs.currentInvested;
    let yearsPassed = 0;
    let totalContributed = inputs.currentInvested;
    
    // Safety break to prevent infinite loops if expenses > income
    const maxYears = 60; 
    let reachedFire = false;
    let fireAge = null;

    // We check if they are already FI
    if (currentBalance >= fireTarget) {
      reachedFire = true;
      fireAge = inputs.currentAge;
    }

    // Project until they hit Fat FIRE or max 60 years
    while (yearsPassed <= maxYears && currentBalance < fatFireTarget * 1.2) {
      trajectory.push({
        year: yearsPassed,
        age: inputs.currentAge + yearsPassed,
        balance: currentBalance,
        contributed: totalContributed,
        growth: currentBalance - totalContributed,
        isFI: currentBalance >= fireTarget
      });

      if (!reachedFire && currentBalance >= fireTarget) {
        reachedFire = true;
        fireAge = inputs.currentAge + yearsPassed;
      }

      // Grow the balance and add new savings
      const growth = currentBalance * (inputs.expectedReturn / 100);
      currentBalance += growth;
      
      if (annualSavings > 0) {
        currentBalance += annualSavings;
        totalContributed += annualSavings;
      }
      yearsPassed++;
    }

    // Determine Coast FIRE (If you stopped investing today, at what age does compounding alone hit the target?)
    let coastYears = 0;
    let coastBalance = inputs.currentInvested;
    while (coastBalance < fireTarget && coastYears < 50) {
      coastBalance *= (1 + (inputs.expectedReturn / 100));
      coastYears++;
    }
    const coastFireAge = inputs.currentAge + coastYears;

    return {
      savingsRate,
      annualSavings,
      fireTarget,
      leanFireTarget,
      fatFireTarget,
      trajectory,
      fireAge,
      yearsToFire: fireAge ? fireAge - inputs.currentAge : null,
      coastFireAge,
      isCurrentlyBleeding: annualSavings <= 0
    };
  }, [inputs]);

  // For Chart Scaling
  const maxBalance = fireModel.trajectory.length > 0 ? fireModel.trajectory[fireModel.trajectory.length - 1].balance : 0;

  const downloadReport = async () => {
    setReportLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const reportData = { inputs, fireModel, generated: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investool-fire-projection-${Date.now()}.json`;
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
              <Flame className="w-4 h-4 text-[#9e1b32]" />
              <span className="text-sm font-bold text-[#0a2540] uppercase tracking-wider">Wealth Engines</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3 text-[#0a192f] pb-1">
              FIRE Projector
              <span className="bg-[#9e1b32]/10 border border-[#9e1b32]/20 text-[#9e1b32] text-sm px-3 py-1 rounded-full shadow-sm flex items-center tracking-widest uppercase">
                Interactive
              </span>
            </h1>
            <p className="text-[#475569] mt-2 max-w-2xl font-medium text-lg">
              Calculate your exact timeline to Financial Independence and Early Retirement.
            </p>
          </div>
          <button
            onClick={downloadReport}
            disabled={reportLoading}
            className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#1e2f4b] transition-all px-5 py-3 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5"
          >
            {reportLoading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            Export Timeline
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ========================================== */}
          {/* LEFT COLUMN: ASSUMPTIONS PANEL             */}
          {/* ========================================== */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-[#e2e8f0] rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
              
              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Briefcase size={16} className="text-[#9e1b32]" /> Current Status
              </h2>
              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Current Age</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="currentAge" value={inputs.currentAge} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Invested Assets</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" name="currentInvested" value={inputs.currentInvested} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold focus:ring-2 focus:ring-[#9e1b32] outline-none shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mt-8 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity size={16} className="text-[#0a2540]" /> Cashflow Metrics
              </h2>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    Annual Income
                    <Tooltip content="Total income AFTER taxes"><Info size={12}/></Tooltip>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" name="annualIncome" value={inputs.annualIncome} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold focus:ring-2 focus:ring-[#0a2540] outline-none shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    Annual Expenses
                    <Tooltip content="Your total yearly living costs. Lower expenses = faster FIRE."><Info size={12}/></Tooltip>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" name="annualExpenses" value={inputs.annualExpenses} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold focus:ring-2 focus:ring-[#0a2540] outline-none shadow-sm" />
                  </div>
                </div>
                
                {/* Savings Rate Indicator */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Savings Rate</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">Investing {formatCurrency(fireModel.annualSavings)}/yr</p>
                  </div>
                  <div className={`text-2xl font-black ${fireModel.isCurrentlyBleeding ? 'text-rose-500' : 'text-[#0a2540]'}`}>
                    {formatPercent(fireModel.savingsRate)}
                  </div>
                </div>
              </div>

              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mt-8 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Target size={16} className="text-[#9e1b32]" /> Projections
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Real Return (%)</label>
                    <span className="text-xs font-bold text-[#0a2540]">{inputs.expectedReturn}%</span>
                  </div>
                  <input type="range" name="expectedReturn" min="1" max="15" step="0.5" value={inputs.expectedReturn} onChange={handleInputChange} className="w-full accent-[#0a2540]" />
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      Withdrawal Rate (SWR)
                      <Tooltip content="The Trinity Study recommends 4%. Lower is safer."><Info size={12}/></Tooltip>
                    </label>
                    <span className="text-xs font-bold text-[#9e1b32]">{inputs.withdrawalRate}%</span>
                  </div>
                  <input type="range" name="withdrawalRate" min="2" max="7" step="0.1" value={inputs.withdrawalRate} onChange={handleInputChange} className="w-full accent-[#9e1b32]" />
                </div>
              </div>

            </div>
          </div>

          {/* ========================================== */}
          {/* RIGHT COLUMN: VALUATION ENGINE             */}
          {/* ========================================== */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Hero Metrics */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#9e1b32] to-[#ff7b5c] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl p-6 md:p-10 border border-[#e2e8f0] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                
                <div className="flex-1 w-full text-center md:text-left">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Target FIRE Number</p>
                  <h2 className="text-4xl md:text-5xl font-black text-[#0a2540] tracking-tighter drop-shadow-sm">
                    {formatCurrency(fireModel.fireTarget)}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-2">
                    Needed to sustain {formatCurrency(inputs.annualExpenses)}/yr.
                  </p>
                </div>

                <div className="h-16 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex-1 w-full text-center">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Years to FIRE</p>
                  <div className="bg-gradient-to-br from-[#0a192f] to-[#1e2f4b] py-5 px-8 rounded-2xl border border-slate-700 shadow-xl inline-block w-full max-w-xs">
                    {fireModel.isCurrentlyBleeding && fireModel.trajectory.length === 0 ? (
                      <p className="text-xl font-bold text-rose-400">Increase Income</p>
                    ) : fireModel.yearsToFire === null ? (
                      <p className="text-2xl font-black text-slate-300">60+ Years</p>
                    ) : fireModel.yearsToFire === 0 ? (
                      <p className="text-2xl font-black text-emerald-400">Already FI!</p>
                    ) : (
                      <>
                        <p className="text-5xl font-black text-white drop-shadow-md">
                          {fireModel.yearsToFire} <span className="text-xl text-slate-400 font-medium">yrs</span>
                        </p>
                        <p className="text-xs font-bold text-[#ff7b5c] mt-2 uppercase tracking-wider">
                          Retire at Age {fireModel.fireAge}
                        </p>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Visual FIRE Trajectory (Pure CSS) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-lg">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 border-b border-slate-100 pb-3 flex justify-between items-center">
                <span>Wealth Accumulation Timeline</span>
                <span className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-200"></div> Accumulated</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0a2540]"></div> Compound Growth</span>
                </span>
              </h3>
              
              <div className="h-64 relative">
                {/* Target Line */}
                <div 
                  className="absolute w-full border-t-2 border-dashed border-[#9e1b32]/50 z-0 flex items-center"
                  style={{ bottom: `${Math.min(100, (fireModel.fireTarget / maxBalance) * 100)}%` }}
                >
                  <span className="absolute -top-6 right-0 bg-[#9e1b32]/10 text-[#9e1b32] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    FIRE Target
                  </span>
                </div>

                {/* Bars */}
                <div className="w-full h-full flex items-end justify-between gap-1 relative z-10">
                  {fireModel.trajectory.map((point, index) => {
                    // Sparsify on dense arrays
                    const isSparse = fireModel.trajectory.length > 25;
                    if (isSparse && index % 2 !== 0 && index !== fireModel.trajectory.length - 1) return null;

                    const contribHeight = (point.contributed / maxBalance) * 100;
                    const growthHeight = (point.growth / maxBalance) * 100;

                    return (
                      <div key={point.age} className="flex flex-col items-center flex-1 group h-full justify-end cursor-pointer">
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-[#0a192f] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap transition-opacity pointer-events-none z-20 text-center">
                          Age {point.age}: {formatLargeCurrency(point.balance)}
                        </div>
                        
                        <div className={`w-full relative flex flex-col justify-end rounded-t-sm overflow-hidden group-hover:brightness-110 transition-all ${point.isFI ? 'opacity-100' : 'opacity-80'}`} style={{ height: `${((point.balance) / maxBalance) * 100}%` }}>
                          <div className="w-full bg-[#0a2540]" style={{ height: `${(growthHeight / (contribHeight + growthHeight)) * 100}%` }}></div>
                          <div className="w-full bg-slate-200" style={{ height: `${(contribHeight / (contribHeight + growthHeight)) * 100}%` }}></div>
                        </div>
                        
                        {/* Only show some labels */}
                        {(!isSparse || index % 4 === 0 || index === fireModel.trajectory.length - 1) && (
                          <span className="text-[9px] font-bold text-slate-400 mt-2 absolute -bottom-6">
                            {point.age}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8"></div> {/* Spacer for x-axis labels */}
            </div>

            {/* 3. FIRE Milestones */}
            <div className="grid md:grid-cols-3 gap-4">
              
              <div className="bg-[#f8fafc] rounded-3xl p-6 border border-[#e2e8f0] shadow-sm text-center">
                <BatteryCharging size={24} className="text-[#0a2540] mx-auto mb-2 opacity-70" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Coast FIRE</p>
                <p className="text-2xl font-black text-[#0a2540]">Age {fireModel.coastFireAge}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  If you stopped saving today, compounding alone hits your target by this age.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-md text-center">
                <Target size={24} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Lean FIRE</p>
                <p className="text-2xl font-black text-[#0a2540]">{formatLargeCurrency(fireModel.leanFireTarget)}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Bare minimum living (70% of current expenses).
                </p>
              </div>

              <div className="bg-gradient-to-br from-[#0a192f] to-[#1e2f4b] rounded-3xl p-6 border border-slate-700 shadow-xl text-center">
                <Flame size={24} className="text-[#ff7b5c] mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fat FIRE</p>
                <p className="text-2xl font-black text-white">{formatLargeCurrency(fireModel.fatFireTarget)}</p>
                <p className="text-[10px] text-slate-400 mt-2 font-medium">
                  Luxury living (130% of current expenses).
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}