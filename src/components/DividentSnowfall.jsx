import { useState, useMemo } from 'react';
import {
  Snowflake, DollarSign, TrendingUp, Info, 
  ArrowRight, ShieldCheck, Download, RefreshCw, 
  Layers, Percent, Calendar, Target, PlusCircle
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
// MAIN COMPONENT
// ============================================================
export default function DividendSnowball() {
  const [inputs, setInputs] = useState({
    initialInvestment: 50000,
    monthlyContribution: 1500,
    annualGrowth: 4.0,        // Capital appreciation
    dividendYield: 4.5,       // Cash yield
    frankingPercent: 100,     // 100% fully franked
    marginalTaxRate: 37,      // User's tax bracket
    years: 20,
    reinvestDividends: true
  });

  const [reportLoading, setReportLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInputs(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (Number(value) || 0) 
    }));
  };

  // --- Core Snowball Engine (DRIP & Franking Math) ---
  const snowballModel = useMemo(() => {
    const projection = [];
    let portfolioValue = inputs.initialInvestment;
    let totalContributions = inputs.initialInvestment;
    let totalCapitalGrowth = 0;
    let totalReinvested = 0;

    let crossoverYear = null;

    for (let year = 1; year <= inputs.years; year++) {
      // 1. Add annual contributions
      const annualContrib = inputs.monthlyContribution * 12;
      totalContributions += annualContrib;
      portfolioValue += annualContrib;

      // 2. Calculate Capital Growth
      const growth = portfolioValue * (inputs.annualGrowth / 100);
      totalCapitalGrowth += growth;
      portfolioValue += growth;

      // 3. Calculate Dividends & Australian Franking Credits
      const cashDividend = portfolioValue * (inputs.dividendYield / 100);
      
      // Franking Math: Gross up the dividend, calculate tax, subtract franking credit
      const frankingCredit = cashDividend * (inputs.frankingPercent / 100) * (0.30 / 0.70);
      const taxableIncome = cashDividend + frankingCredit;
      const taxLiability = taxableIncome * (inputs.marginalTaxRate / 100);
      const taxToPay = taxLiability - frankingCredit;
      
      const netDividend = cashDividend - taxToPay;

      // 4. Reinvest (DRIP)
      if (inputs.reinvestDividends && netDividend > 0) {
        portfolioValue += netDividend;
        totalReinvested += netDividend;
      }

      // Check for Crossover (Passive income > Contributions)
      if (!crossoverYear && netDividend > annualContrib && annualContrib > 0) {
        crossoverYear = year;
      }

      projection.push({
        year,
        portfolioValue,
        contributions: totalContributions,
        capitalGrowth: totalCapitalGrowth,
        reinvested: totalReinvested,
        annualNetDividend: netDividend > 0 ? netDividend : 0,
        yieldOnCost: netDividend / totalContributions
      });
    }

    const finalYear = projection[projection.length - 1];

    return {
      projection,
      finalValue: finalYear.portfolioValue,
      finalIncome: finalYear.annualNetDividend,
      yieldOnCost: finalYear.yieldOnCost,
      totalContributions,
      totalCapitalGrowth,
      totalReinvested,
      crossoverYear
    };
  }, [inputs]);

  // Maximum value for CSS Chart scaling
  const maxPortfolio = Math.max(...snowballModel.projection.map(p => p.portfolioValue));

  const downloadReport = async () => {
    setReportLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const reportData = { inputs, snowballModel, generated: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investool-dividend-snowball-${Date.now()}.json`;
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
              <Snowflake className="w-4 h-4 text-[#0a2540]" />
              <span className="text-sm font-bold text-[#0a2540] uppercase tracking-wider">Wealth Engines</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center gap-3 text-[#0a192f] pb-1">
              Dividend Snowball
              <span className="bg-[#0a2540]/10 border border-[#0a2540]/20 text-[#0a2540] text-sm px-3 py-1 rounded-full shadow-sm flex items-center tracking-widest uppercase">
                Franking Enabled
              </span>
            </h1>
            <p className="text-[#475569] mt-2 max-w-2xl font-medium text-lg">
              Map the compounding power of fully-franked dividend reinvestment over time.
            </p>
          </div>
          <button
            onClick={downloadReport}
            disabled={reportLoading}
            className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#1e2f4b] transition-all px-5 py-3 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5"
          >
            {reportLoading ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
            Export Schedule
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* ========================================== */}
          {/* LEFT COLUMN: ASSUMPTIONS PANEL             */}
          {/* ========================================== */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-md border border-[#e2e8f0] rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50">
              
              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Layers size={16} className="text-[#9e1b32]" /> Investment Strategy
              </h2>
              <div className="space-y-5 mb-8">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Initial Portfolio ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" name="initialInvestment" value={inputs.initialInvestment} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold focus:ring-2 focus:ring-[#0a2540] outline-none shadow-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monthly Contribution ($)</label>
                  <div className="relative">
                    <PlusCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold focus:ring-2 focus:ring-[#0a2540] outline-none shadow-sm" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Timeframe (Years)</label>
                    <span className="text-xs font-bold text-[#0a2540]">{inputs.years} yrs</span>
                  </div>
                  <input type="range" name="years" min="5" max="40" step="1" value={inputs.years} onChange={handleInputChange} className="w-full accent-[#0a2540]" />
                </div>
              </div>

              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mt-8 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <TrendingUp size={16} className="text-[#0a2540]" /> Yield & Growth
              </h2>
              <div className="space-y-5 mb-8">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cap Growth (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" step="0.1" name="annualGrowth" value={inputs.annualGrowth} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cash Yield (%)</label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="number" step="0.1" name="dividendYield" value={inputs.dividendYield} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-[#0a2540] font-bold outline-none shadow-sm" />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-[#0a2540]">Reinvest Dividends (DRIP)</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Compound your net cash</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="reinvestDividends" checked={inputs.reinvestDividends} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9e1b32]"></div>
                  </label>
                </div>
              </div>

              <h2 className="text-sm font-bold text-[#0a2540] uppercase tracking-widest mt-8 mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck size={16} className="text-[#9e1b32]" /> ATO Tax & Franking
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                      Franking Proportion
                      <Tooltip content="100% means fully franked (e.g. BHP, CBA). 0% means unfranked (e.g. US ETFs)."><Info size={12}/></Tooltip>
                    </label>
                    <span className="text-xs font-bold text-[#0a2540]">{inputs.frankingPercent}%</span>
                  </div>
                  <input type="range" name="frankingPercent" min="0" max="100" step="10" value={inputs.frankingPercent} onChange={handleInputChange} className="w-full accent-[#9e1b32]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    Marginal Tax Rate (%)
                    <Tooltip content="Your income tax bracket. Franking credits will offset this tax."><Info size={12}/></Tooltip>
                  </label>
                  <input type="number" step="0.5" name="marginalTaxRate" value={inputs.marginalTaxRate} onChange={handleInputChange} className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-[#0a2540] font-bold outline-none shadow-sm" />
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
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0a2540] to-[#1e2f4b] rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative bg-white rounded-3xl p-6 md:p-10 border border-[#e2e8f0] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                
                <div className="text-center md:text-left flex-1">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Portfolio Value (Year {inputs.years})</p>
                  <h2 className="text-5xl md:text-6xl font-black text-[#0a2540] tracking-tighter drop-shadow-sm">
                    {formatCurrency(snowballModel.finalValue)}
                  </h2>
                </div>

                <div className="h-16 w-px bg-slate-200 hidden md:block"></div>

                <div className="flex-1 w-full text-center md:text-right">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Future Passive Income</p>
                  <div className="bg-emerald-50 py-4 px-6 rounded-2xl border border-emerald-200 inline-block shadow-inner">
                    <p className="text-4xl font-black text-emerald-700">
                      {formatCurrency(snowballModel.finalIncome)}<span className="text-lg text-emerald-600 font-medium">/yr</span>
                    </p>
                    <p className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">After Tax</p>
                  </div>
                </div>

              </div>
            </div>

            {/* 2. Visual Snowball Chart (Pure CSS) */}
            <div className="bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-lg">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8 border-b border-slate-100 pb-3 flex justify-between items-center">
                <span>Wealth Composition Matrix</span>
                <span className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Contributions</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0a2540]"></div> Capital Growth</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#9e1b32]"></div> Reinvested Divs</span>
                </span>
              </h3>
              
              <div className="h-56 flex items-end justify-between gap-1 sm:gap-2 relative">
                {snowballModel.projection.map((flow, index) => {
                  // Only show every Nth bar on mobile to avoid crowding, or all if short timeframe
                  if (inputs.years > 20 && index % 2 !== 0 && index !== inputs.years - 1) return null;

                  const contribHeight = (flow.contributions / maxPortfolio) * 100;
                  const growthHeight = (flow.capitalGrowth / maxPortfolio) * 100;
                  const divHeight = (flow.reinvested / maxPortfolio) * 100;
                  
                  return (
                    <div key={flow.year} className="flex flex-col items-center flex-1 group">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-[#0a192f] text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap transition-opacity pointer-events-none z-10 text-center">
                        Year {flow.year}: {formatLargeCurrency(flow.portfolioValue)}
                        <div className="text-[10px] text-emerald-400 font-medium">Income: {formatCurrency(flow.annualNetDividend)}/yr</div>
                      </div>
                      
                      {/* Stacked Bar */}
                      <div className="w-full relative flex flex-col justify-end h-full rounded-t-sm overflow-hidden group-hover:brightness-110 transition-all cursor-pointer">
                        <div className="w-full bg-[#9e1b32]" style={{ height: `${divHeight}%` }}></div>
                        <div className="w-full bg-[#0a2540]" style={{ height: `${growthHeight}%` }}></div>
                        <div className="w-full bg-slate-300" style={{ height: `${contribHeight}%` }}></div>
                      </div>
                      
                      <span className="text-[9px] font-bold text-slate-400 mt-2">Y{flow.year}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Breakdown & Milestones */}
            <div className="grid md:grid-cols-3 gap-4">
              
              <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-[#e2e8f0] shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-[#0a2540]" />
                  <h4 className="font-bold text-[#0a2540]">Capital Breakdown</h4>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-300"></div>Total Contributed:</span>
                    <span className="text-[#0a2540] font-black">{formatCurrency(snowballModel.totalContributions)}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#0a2540]"></div>Capital Growth:</span>
                    <span className="text-[#0a2540] font-black">{formatCurrency(snowballModel.totalCapitalGrowth)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#9e1b32]"></div>Dividends Reinvested:</span>
                    <span className="text-[#0a2540] font-black">{formatCurrency(snowballModel.totalReinvested)}</span>
                  </div>
                </div>
              </div>

              {/* Snowball Milestone Card */}
              <div className={`rounded-3xl p-6 border shadow-lg flex flex-col justify-center text-center transition-colors ${snowballModel.crossoverYear ? 'bg-gradient-to-br from-[#0a192f] to-[#1e2f4b] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                {snowballModel.crossoverYear ? (
                  <>
                    <Snowflake size={32} className="text-emerald-400 mx-auto mb-3 opacity-80" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Snowball Crossover</p>
                    <p className="text-4xl font-black text-white">Year {snowballModel.crossoverYear}</p>
                    <p className="text-xs font-medium text-slate-300 mt-2 leading-relaxed">
                      Your passive dividends exceed your active contributions.
                    </p>
                  </>
                ) : (
                  <>
                    <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Yield on Cost</p>
                    <p className="text-4xl font-black text-[#0a2540]">{formatPercent(snowballModel.yieldOnCost)}</p>
                    <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                      Your final year income vs total money invested.
                    </p>
                  </>
                )}
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}