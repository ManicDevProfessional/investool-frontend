import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, Star, TrendingUp, Sparkles, BarChart3, 
  CircleDollarSign, Layers, ArrowUpRight, 
  Flame, Snowflake, Landmark, LineChart, Target, PieChart
} from 'lucide-react';
import { useState } from 'react';

export default function StocksDashboard() {
  const navigate = useNavigate();
  const [hoveredTool, setHoveredTool] = useState(null);

  // Static, realistic placeholder data for the Market. 
  // Update these periodically or connect to an API later.
  const marketMetrics = {
    asxReturn: "+4.2%",
    avgYield: "4.1%",
    inflation: "4.1%",
    timestamp: "Updated this week"
  };

  const tools = [
    {
      id: 'dcf-sandbox',
      title: 'Manual DCF Sandbox',
      description: 'The ultimate valuation engine. Manually project free cash flows and discount them to find a stock\'s true intrinsic value.',
      icon: <LineChart className="w-8 h-8 text-[#9e1b32]" />,
      path: '/dashboard/dcf-sandbox',
      tag: 'Core Tool',
      tagIcon: <Star className="w-3.5 h-3.5 mr-1" />,
      color: 'from-[#9e1b32]/10 to-[#9e1b32]/5',
      metric: 'Absolute Valuation',
      trend: 'Fundamental'
    },
    {
      id: 'dividend-snowball',
      title: 'Dividend Snowball Tracker',
      description: 'Visualize the accelerating power of compounding. See the exact impact of Dividend Reinvestment Plans (DRP) over decades.',
      icon: <Snowflake className="w-8 h-8 text-[#0a2540]" />,
      path: '/dashboard/dividend-snowball',
      tag: 'Wealth',
      tagIcon: <PieChart className="w-3.5 h-3.5 mr-1" />,
      color: 'from-[#0a2540]/10 to-[#0a2540]/5',
      metric: 'DRP Enabled',
      trend: 'Compounding'
    },
    {
      id: 'fire-projector',
      title: 'The FIRE Projector',
      description: 'Map your exact path to Financial Independence. Input contributions and target safe withdrawal rates to find your retirement age.',
      icon: <Flame className="w-8 h-8 text-[#0a2540]" />,
      path: '/dashboard/fire-projector',
      tag: 'Planning',
      tagIcon: <Target className="w-3.5 h-3.5 mr-1" />,
      color: 'from-amber-500/10 to-amber-500/5',
      metric: 'Retirement Age',
      trend: 'Visualized'
    },
    {
      id: 'cgt-estimator',
      title: 'Capital Gains Tax Estimator',
      description: 'Instantly estimate your tax burden on stock sales. Automatically applies the Australian 12-month 50% discount rule.',
      icon: <Landmark className="w-8 h-8 text-[#0a2540]" />,
      path: '/dashboard/cgt-estimator',
      tag: 'Fast',
      tagIcon: <Sparkles className="w-3.5 h-3.5 mr-1" />,
      color: 'from-emerald-500/10 to-emerald-500/5',
      metric: 'ATO Rules',
      trend: 'AU Specific'
    }
  ];

  const insights = [
    {
      title: 'Market Pulse',
      icon: <TrendingUp className="w-5 h-5" />,
      value: marketMetrics.asxReturn,
      label: 'ASX 200 YTD',
      trend: 'Bullish Consensus',
      color: 'text-emerald-600'
    },
    {
      title: 'Yield Outlook',
      icon: <CircleDollarSign className="w-5 h-5" />,
      value: marketMetrics.avgYield,
      label: 'Avg Market Yield',
      trend: 'Fully Franked',
      color: 'text-amber-600'
    },
    {
      title: 'Strategy Tip',
      icon: <BarChart3 className="w-5 h-5" />,
      value: 'Margin of Safety',
      label: 'Always buy below intrinsic',
      trend: 'Learn more →',
      color: 'text-[#9e1b32]'
    }
  ];

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e9eef3] text-[#0a192f] font-sans overflow-x-hidden">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(158,27,50,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(10,37,64,0.08)_0%,transparent_50%)]" />
      </div>

      <div className="relative z-10 px-6 py-10 lg:py-12 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="mb-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-1.5 border border-[#e2e8f0] shadow-sm">
              <Sparkles className="w-4 h-4 text-[#9e1b32]" />
              <span className="text-sm font-medium text-[#0a2540]/80">Equities & Wealth Building</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-[#0a192f] via-[#1e2f4b] to-[#9e1b32] bg-clip-text text-transparent pb-2">
              Stock Market Analytics
            </h1>
            <p className="text-[#475569] text-lg leading-relaxed max-w-xl">
              Calculate intrinsic value, forecast your financial independence, and track the compounding power of your dividend portfolio.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-[#475569] bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-[#e2e8f0]">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>No API limits</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#475569] bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-[#e2e8f0]">
                <PieChart className="w-4 h-4 text-[#0a2540]" />
                <span>4 precision tools</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Card */}
          <div className="w-full lg:w-auto bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 shadow-xl p-6 min-w-[300px]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#9e1b32] mb-4">
              <BarChart3 className="w-5 h-5" />
              <span>Macro Environment</span>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-[#0a2540]">{marketMetrics.asxReturn}</div>
                <div className="text-sm font-medium text-[#64748b] mt-1">ASX 200 YTD</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0a2540]">{marketMetrics.inflation}</div>
                <div className="text-sm font-medium text-[#64748b] mt-1">CPI Inflation</div>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-[#e2e8f0] text-xs font-medium text-[#64748b] flex justify-between">
              <span>{marketMetrics.timestamp}</span>
              <span className="text-[#9e1b32]">RBA Data</span>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => navigate(tool.path)}
              onMouseEnter={() => setHoveredTool(tool.id)}
              onMouseLeave={() => setHoveredTool(null)}
              className="group relative text-left bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 overflow-hidden flex flex-col h-full"
              style={{
                boxShadow: hoveredTool === tool.id ? '0 25px 40px -12px rgba(10, 37, 64, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.05)'
              }}
            >
              {/* Animated Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-0`} />
              
              {tool.tag && (
                <div className="absolute top-6 right-6 z-10">
                  <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#9e1b32] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#e2e8f0]">
                    {tool.tagIcon}
                    <span>{tool.tag}</span>
                  </div>
                </div>
              )}

              <div className="relative z-10 w-16 h-16 rounded-xl bg-gradient-to-br from-white to-[#f8fafc] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-[#e2e8f0]">
                {tool.icon}
              </div>

              <div className="relative z-10 flex-grow">
                <h2 className="text-2xl font-bold text-[#0a2540] mb-3 group-hover:text-[#9e1b32] transition-colors duration-300">
                  {tool.title}
                </h2>
                <p className="text-[#475569] leading-relaxed">
                  {tool.description}
                </p>
                
                <div className="mt-5 flex items-center gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5 bg-[#f1f5f9] px-3 py-1.5 rounded-full">
                    <CircleDollarSign className="w-3.5 h-3.5 text-[#9e1b32]" />
                    <span className="text-[#334155]">{tool.metric}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{tool.trend}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 flex items-center text-[#9e1b32] font-bold text-sm group/link">
                <span className="border-b-2 border-transparent group-hover/link:border-[#9e1b32] transition-all duration-200 pb-0.5">
                  Launch Calculator
                </span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform duration-200" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#9e1b32] to-[#0a2540] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />
            </button>
          ))}
        </div>

        {/* Insights Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#9e1b32]" />
              <h2 className="text-xl font-bold text-[#0a2540]">Market Intelligence</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white/60 backdrop-blur-sm rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-lg hover:border-[#9e1b32]/30 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-[#e2e8f0] ${insight.color.replace('text', 'text')}`}>
                    {insight.icon}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">{insight.title}</span>
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-[#0a2540] mb-1">{insight.value}</div>
                  <div className="text-sm font-medium text-[#64748b]">{insight.label}</div>
                  <div className="mt-4 pt-4 border-t border-[#e2e8f0] text-xs font-bold text-[#9e1b32] flex items-center gap-1 group-hover:gap-2 transition-all">
                    {insight.trend}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}