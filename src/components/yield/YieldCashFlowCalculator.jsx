import { useState } from 'react';
import { Sparkles } from 'lucide-react';

// Imports
import { useYieldCashflowModel } from '../../hooks/useYieldCashflowModel';
import YieldCashflowInputs from './YieldCashFlowInputs';
import YieldCashflowResults from './YieldCashFlowResults';

export default function YieldCashflowCalculator() {
  // 1. Core State
  const [inputs, setInputs] = useState({
    propertyPrice: 750000,
    deposit: 150000,
    state: 'QLD',
    weeklyRent: 650,
    interestRate: 6.25,
    loanType: 'IO',
    loanTermYears: 30,
    annualStrata: 2800,
    annualRates: 2200,
    annualMaintenance: 1500,
    annualInsurance: 1200,
    propertyMgmtRate: 7.0,
    annualDepreciation: 6000,
    salary: 120000,
  });

  const [sensitivity, setSensitivity] = useState({
    interestShift: 0,
    rentGrowth: 0,
    capitalGrowth: 0,
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 2. Handlers
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = (type === 'text' || name === 'state' || name === 'loanType') ? value : (parseFloat(value) || 0);
    setInputs(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSensitivityChange = (name, value) => {
    setSensitivity(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  // 3. Math Engine Hook
  const metrics = useYieldCashflowModel(inputs, sensitivity);

  // 4. Render Layout
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans text-[#0a192f] animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="mb-8 text-center lg:text-left">
        <div className="inline-flex items-center gap-2 bg-[#0a2540]/10 rounded-full px-4 py-1.5 mb-4 border border-[#0a2540]/20">
          <Sparkles className="w-4 h-4 text-[#0a2540]" />
          <span className="text-sm font-bold text-[#0a2540]">Australian Property Analytics</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#0a192f] via-[#1e2f4b] to-[#9e1b32] bg-clip-text text-transparent pb-2">
          Yield & Cashflow Analyser
        </h1>
        <p className="text-[#64748b] mt-2 text-lg max-w-2xl mx-auto lg:mx-0">
          Institutional‑grade cashflow modelling with sensitivity analysis, tax optimisation, and 10‑year projections.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200">
        {['dashboard', 'sensitivity', 'projections'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-bold rounded-t-xl transition-all capitalize ${
              activeTab === tab 
                ? 'bg-white text-[#9e1b32] border-t-2 border-x-2 border-slate-200 shadow-[0_-4px_6px_-2px_rgba(0,0,0,0.05)] z-10 relative -mb-[1px]' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-b border-slate-200'
            }`}
          >
            {tab === 'dashboard' ? 'Core Dashboard' : tab === 'sensitivity' ? 'Stress Testing' : 'Projections'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Pass state to the Inputs Component */}
        <YieldCashflowInputs 
          inputs={inputs} 
          handleInputChange={handleInputChange} 
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
        />

        {/* Pass metrics to the Results Component */}
        <YieldCashflowResults 
          inputs={inputs}
          metrics={metrics}
          sensitivity={sensitivity}
          handleSensitivityChange={handleSensitivityChange}
          activeTab={activeTab}
        />
        
      </div>
    </div>
  );
}