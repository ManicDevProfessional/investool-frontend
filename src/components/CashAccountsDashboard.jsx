import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Landmark, ShieldCheck, ShieldAlert, PiggyBank, Plus, Trash2, ArrowUpRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function CashAccountsDashboard() {
  // STATE: Cash Accounts
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Everyday Checking', balance: 4500, apy: 0.0 },
    { id: 2, name: 'High Yield Savings', balance: 25000, apy: 5.25 },
    { id: 3, name: 'Home Loan Offset', balance: 15500, apy: 6.10 }
  ]);

  // STATE: Emergency Fund Settings
  const [monthlyExpenses, setMonthlyExpenses] = useState(4500);

  // ENGINE MATH
  const { totalCash, totalAnnualInterest, blendedAPY } = useMemo(() => {
    let total = 0;
    let totalInterest = 0;
    
    accounts.forEach(acc => {
      const bal = Number(acc.balance) || 0;
      const rate = Number(acc.apy) || 0;
      total += bal;
      totalInterest += bal * (rate / 100);
    });

    const blended = total > 0 ? (totalInterest / total) * 100 : 0;

    return { totalCash: total, totalAnnualInterest: totalInterest, blendedAPY: blended };
  }, [accounts]);

  // EMERGENCY FUND MATH
  const runwayMonths = totalCash / (Number(monthlyExpenses) || 1);
  const isRunwaySafe = runwayMonths >= 6;

  // COMPOUND INTEREST PROJECTION (5 Years)
  const projectionData = useMemo(() => {
    let data = [];
    let currentBalance = totalCash;
    const rate = blendedAPY / 100;

    for (let i = 0; i <= 5; i++) {
      data.push({
        year: i === 0 ? 'Today' : `Year ${i}`,
        "Total Cash": Math.round(currentBalance),
        "Interest Earned": Math.round(currentBalance - totalCash)
      });
      currentBalance = currentBalance * (1 + rate);
    }
    return data;
  }, [totalCash, blendedAPY]);

  const addAccount = () => {
    setAccounts([...accounts, { id: Date.now(), name: 'New Account', balance: 0, apy: 0 }]);
  };

  const updateAccount = (id, field, value) => {
    setAccounts(accounts.map(acc => acc.id === id ? { ...acc, [field]: value } : acc));
  };

  const deleteAccount = (id) => {
    setAccounts(accounts.filter(acc => acc.id !== id));
  };

  const cardStyle = "bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm";
  const ghostInput = "bg-transparent border-b-2 border-slate-200 focus:border-[#0a192f] transition-colors outline-none font-bold text-[#0a192f] pb-1 w-full";

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-[#f5f8fa] text-[#0a192f] flex justify-center px-6 py-10 font-sans">
      <div className="w-full max-w-6xl space-y-8">

        {/* HEADER */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-extrabold tracking-tight">Cash & Liquidity</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage deployment capital, yields, and emergency runway.</p>
        </motion.div>

        {/* HERO: TOTAL CASH & YIELD */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl p-10 bg-[#0a2540] text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10b981]/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-3 font-bold tracking-wider uppercase">
                <Wallet size={18} /> Total Liquid Assets
              </div>
              <h2 className="text-6xl md:text-7xl font-extrabold tracking-tight">
                ${totalCash.toLocaleString()}
              </h2>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[160px]">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Blended Yield</p>
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-emerald-400" />
                  <p className="text-2xl font-bold text-white">{blendedAPY.toFixed(2)}%</p>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 min-w-[160px]">
                <p className="text-slate-300 text-xs font-bold uppercase tracking-wider mb-1">Est. Annual Interest</p>
                <div className="flex items-center gap-2">
                  <ArrowUpRight size={20} className="text-emerald-400" />
                  <p className="text-2xl font-bold text-white">${Math.round(totalAnnualInterest).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: ACCOUNTS LEDGER */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Landmark size={20} className="text-[#0a2540]" /> Registered Accounts
              </h3>
              <button 
                onClick={addAccount}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-[#0a2540]/5 text-[#0a2540] font-bold hover:bg-[#0a2540]/10 transition-colors"
              >
                <Plus size={16} /> Add Account
              </button>
            </div>

            <AnimatePresence>
              {accounts.map((acc) => (
                <motion.div 
                  key={acc.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className={`${cardStyle} relative group`}
                >
                  <button onClick={() => deleteAccount(acc.id)} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={18} />
                  </button>

                  <div className="grid md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-1">
                      <p className="text-xs uppercase font-bold tracking-wider mb-1 text-slate-500">Account Name</p>
                      <input type="text" value={acc.name} onChange={(e) => updateAccount(acc.id, 'name', e.target.value)} className={`${ghostInput} text-xl`} />
                    </div>
                    
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider mb-1 text-slate-500">Balance ($)</p>
                      <input type="number" value={acc.balance} onChange={(e) => updateAccount(acc.id, 'balance', Number(e.target.value))} className={`${ghostInput} text-2xl font-extrabold`} />
                    </div>

                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider mb-1 text-slate-500">APY / Rate (%)</p>
                      <input type="number" step="0.1" value={acc.apy} onChange={(e) => updateAccount(acc.id, 'apy', Number(e.target.value))} className={`${ghostInput} text-2xl font-bold text-emerald-600`} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: ANALYTICS & EMERGENCY FUND */}
          <div className="space-y-6">
            
            {/* Emergency Fund Card */}
            <div className={`${cardStyle}`}>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <ShieldCheck size={20} className={isRunwaySafe ? "text-emerald-500" : "text-amber-500"} /> Runway Health
              </h3>
              
              <div className="mb-6">
                <p className="text-xs uppercase font-bold tracking-wider mb-1 text-slate-500">Est. Monthly Expenses</p>
                <div className="flex items-center text-3xl font-extrabold">
                  <span className="text-slate-400 mr-1">$</span>
                  <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className={`${ghostInput} text-3xl font-extrabold`} step="100" />
                </div>
              </div>

              <div className={`rounded-2xl p-5 border ${isRunwaySafe ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-bold uppercase tracking-wider ${isRunwaySafe ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Liquidity Runway
                  </span>
                  {isRunwaySafe ? <ShieldCheck className="text-emerald-500" size={20}/> : <ShieldAlert className="text-amber-500" size={20}/>}
                </div>
                <p className={`text-4xl font-extrabold ${isRunwaySafe ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {runwayMonths.toFixed(1)} <span className="text-lg font-bold">Months</span>
                </p>
                <p className={`text-xs mt-2 font-medium ${isRunwaySafe ? 'text-emerald-600/80' : 'text-amber-600/80'}`}>
                  {isRunwaySafe ? 'You meet the 6-month safety threshold. Excess cash can be deployed to Equities.' : 'Warning: Target 6 months of liquid reserves before deploying aggressive capital.'}
                </p>
              </div>
            </div>

            {/* Interest Projection Chart */}
            <div className={`${cardStyle} flex flex-col`}>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                <PiggyBank size={20} className="text-[#0a2540]" /> 5-Year Idle Projection
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-6">
                Compounding growth based on your {blendedAPY.toFixed(2)}% blended yield, assuming no additional deposits.
              </p>

              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                      contentStyle={{ backgroundColor: '#0a192f', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="Total Cash" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}