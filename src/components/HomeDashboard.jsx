import { useNavigate } from 'react-router-dom';
import { 
  Home, TrendingDown, CircleDollarSign, MapPin, 
  LineChart, Snowflake, Flame, Landmark, 
  ArrowRight, Calculator, Briefcase, Sparkles
} from 'lucide-react';

export default function HomeDashboard() {
  const navigate = useNavigate();

  const propertyEngines = [
    {
      id: 'rentvesting',
      title: 'Rentvesting Validator',
      desc: 'Compare buying a PPOR vs. renting and investing the deposit.',
      icon: <Home className="text-[#9e1b32]" size={28} />,
      path: '/dashboard/rentvesting',
      tag: 'Popular'
    },
    {
      id: 'yield',
      title: 'Yield & Cashflow',
      desc: 'Calculate exact weekly out-of-pocket holding costs.',
      icon: <TrendingDown className="text-[#0a2540]" size={28} />,
      path: '/dashboard/yield-calculator'
    },
    {
      id: 'negative-gearing',
      title: 'Negative Gearing',
      desc: 'Model depreciation and ATO Stage 3 tax refunds.',
      icon: <CircleDollarSign className="text-[#0a2540]" size={28} />,
      path: '/dashboard/negative-gearing',
      tag: 'Advanced'
    },
    {
      id: 'purchasing-costs',
      title: 'Purchasing Costs',
      desc: 'Estimate Stamp Duty and LMI across all 8 AU states.',
      icon: <MapPin className="text-[#0a2540]" size={28} />,
      path: '/dashboard/purchasing-costs'
    }
  ];

  const wealthEngines = [
    {
      id: 'dcf',
      title: 'DCF Sandbox',
      desc: 'Run Discounted Cash Flow valuations on equities.',
      icon: <LineChart className="text-[#0a2540]" size={28} />,
      path: '/dashboard/dcf-sandbox',
      status: 'Coming Soon'
    },
    {
      id: 'dividend',
      title: 'Dividend Snowball',
      desc: 'Map the compound growth of franked dividend income.',
      icon: <Snowflake className="text-[#0a2540]" size={28} />,
      path: '/dashboard/dividend-snowball',
      status: 'Coming Soon'
    },
    {
      id: 'fire',
      title: 'FIRE Projector',
      desc: 'Chart your exact timeline to financial independence.',
      icon: <Flame className="text-[#0a2540]" size={28} />,
      path: '/dashboard/fire-projector',
      status: 'Coming Soon'
    },
    {
      id: 'cgt',
      title: 'CGT Estimator',
      desc: 'Calculate Capital Gains Tax obligations and discounts.',
      icon: <Landmark className="text-[#0a2540]" size={28} />,
      path: '/dashboard/cgt-estimator',
      status: 'Coming Soon'
    }
  ];

  const EngineCard = ({ engine }) => (
    <div 
      onClick={() => navigate(engine.path)}
      className="group cursor-pointer bg-white border border-[#e2e8f0] rounded-3xl p-6 hover:border-[#9e1b32]/50 hover:shadow-xl hover:shadow-[#9e1b32]/5 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-[#9e1b32]/5 group-hover:scale-110 transition-all duration-300">
          {engine.icon}
        </div>
        {engine.tag && (
          <span className="bg-[#9e1b32]/10 text-[#9e1b32] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-[#9e1b32]/20">
            {engine.tag}
          </span>
        )}
        {engine.status === 'Coming Soon' && (
          <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200">
            In Dev
          </span>
        )}
      </div>
      
      <div className="relative z-10 flex-grow">
        <h3 className="text-xl font-bold text-[#0a2540] mb-2 group-hover:text-[#9e1b32] transition-colors">{engine.title}</h3>
        <p className="text-slate-500 text-sm font-medium leading-relaxed">{engine.desc}</p>
      </div>

      <div className="relative z-10 mt-6 flex items-center text-[#0a2540] font-bold text-sm group-hover:text-[#9e1b32] transition-colors">
        <span>Launch Engine</span>
        <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Subtle background glow on hover */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#9e1b32]/0 to-[#9e1b32]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e9eef3] text-[#0a192f] font-sans p-6 md:p-10 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 border border-slate-200 shadow-sm mb-4">
              <Sparkles className="w-4 h-4 text-[#9e1b32]" />
              <span className="text-sm font-bold text-[#0a2540] uppercase tracking-wider">InvesTool Console</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#0a192f] via-[#1e2f4b] to-[#9e1b32] bg-clip-text text-transparent pb-2">
              Command Center
            </h1>
            <p className="text-[#475569] text-lg mt-2 font-medium max-w-2xl">
              Select an institutional engine to begin mathematically modeling your wealth trajectory.
            </p>
          </div>
        </div>

        {/* Property Engines Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="text-[#9e1b32]" size={24} />
            <h2 className="text-2xl font-bold text-[#0a2540]">Property Engines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {propertyEngines.map(engine => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </div>

        {/* Wealth Engines Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Briefcase className="text-[#0a2540]" size={24} />
            <h2 className="text-2xl font-bold text-[#0a2540]">Wealth Engines</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wealthEngines.map(engine => (
              <EngineCard key={engine.id} engine={engine} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}