import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, Briefcase, MapPin, BarChart4, Save } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { useIncomeEngine } from '../../hooks/useIncomeEngine';
import StreamItem from './StreamItem';
import { AUSTRALIAN_STATES } from '../../utils/constants';

export default function Profile() {
  const engine = useIncomeEngine();

  if (engine.isLoadingInitial) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f8fa] text-[#0a192f]">
        <Loader2 size={48} className="animate-spin text-[#9e1b32]" />
      </div>
    );
  }

  const themeBg = 'bg-[#f5f8fa]';
  const themeText = 'text-[#0a192f]';
  const cardBg = 'bg-white border-slate-200';
  const mutedText = 'text-slate-500';

  return (
    <div className={`min-h-screen ${themeBg} ${themeText} transition-colors duration-500 flex justify-center px-6 py-10 font-sans w-full`}>
      <Toaster position="top-right" />

      <div className="flex-1 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight">
              Income Command Center
            </h1>
            <p className={`${mutedText} mt-2 font-medium`}>
              Manage all revenue streams, backed securely by cloud.
            </p>
          </motion.div>

          <div />
        </div>

        {/* Hero Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-10 bg-[#0a2540] text-white shadow-2xl mb-12"
        >
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#9e1b32]/20 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2 font-bold tracking-wider uppercase">
                <CheckCircle2 size={16} />
                Active Engine Baseline
              </div>

              <h2 className="text-6xl font-extrabold tracking-tight">
                ${engine.totalIncome.toLocaleString()}
              </h2>

              <div className="flex gap-4 mt-2 text-slate-300">
                <span>
                  After‑Tax: ${engine.afterTax.toLocaleString()}
                </span>
                <span>
                  Tax: ${engine.tax.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={engine.handleSave}
              disabled={!engine.state.present || engine.isSaving}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all duration-300 ${
                !engine.state.present || engine.isSaving
                  ? 'bg-white/5 text-slate-400 cursor-not-allowed'
                  : 'bg-[#9e1b32] hover:scale-105 shadow-[0_10px_25px_-5px_rgba(158,27,50,0.4)] text-white'
              }`}
            >
              {engine.isSaving ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  Save Configuration
                </>
              )}
            </button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Streams */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Briefcase size={20} className="text-[#9e1b32]" />
                Revenue Streams
              </h3>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => engine.addStream('salary')}
                  className="text-sm px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500"
                >
                  + Salary
                </button>

                <button
                  onClick={() => engine.addStream('hourly')}
                  className="text-sm px-3 py-1 rounded-full bg-[#9e1b32]/10 text-[#9e1b32]"
                >
                  + Hourly
                </button>

                <button
                  onClick={() => engine.addStream('freelance')}
                  className="text-sm px-3 py-1 rounded-full bg-blue-500/10 text-blue-500"
                >
                  + Freelance
                </button>

                <button
                  onClick={() => engine.addStream('dividends')}
                  className="text-sm px-3 py-1 rounded-full bg-purple-500/10 text-purple-500"
                >
                  + Dividends
                </button>
              </div>
            </div>

            <Reorder.Group
              axis="y"
              values={engine.streams}
              onReorder={engine.updateStreams}
              className="space-y-4"
            >
              <AnimatePresence initial={false}>
                {engine.streams.map((stream) => (
                  <StreamItem
                    key={stream.id}
                    stream={stream}
                    onUpdate={(updated) =>
                      engine.updateStreams(
                        engine.streams.map((s) =>
                          s.id === updated.id ? updated : s
                        )
                      )
                    }
                    onDelete={(id) =>
                      engine.updateStreams(
                        engine.streams.filter((s) => s.id !== id)
                      )
                    }
                    dark={false}
                    canDrag={engine.streams.length > 1}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className={`rounded-3xl p-6 border shadow-sm ${cardBg}`}>
              <h4
                className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${mutedText}`}
              >
                <MapPin size={16} />
                Global Settings
              </h4>

              <label className="block text-xs font-medium mb-1">
                State of Residence (Tax Purposes)
              </label>

              <select
                value={engine.userStateLoc}
                onChange={(e) => engine.updateUserState(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-white border-slate-300 text-[#0a192f]"
              >
                {AUSTRALIAN_STATES.map((state) => (
                  <option key={state.value} value={state.value}>
                    {state.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={`rounded-3xl p-6 border shadow-sm ${cardBg}`}>
              <h4
                className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${mutedText}`}
              >
                <BarChart4 size={16} />
                After‑Tax Allocation
              </h4>

              <p className="text-xs text-slate-500 mb-3 italic">
                Playground only. Not saved to database.
              </p>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Savings ({engine.budget.savings}%)</span>
                    <span>
                      ${engine.budgetAllocations.savings.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={engine.budget.savings}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const remaining = 100 - val;
                      const inv =
                        (engine.budget.investments /
                          (engine.budget.investments +
                            engine.budget.expenses)) *
                        remaining;

                      engine.updateBudget({
                        savings: val,
                        investments: inv,
                        expenses: remaining - inv,
                      });
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      Investments ({engine.budget.investments.toFixed(0)}%)
                    </span>
                    <span>
                      ${engine.budgetAllocations.investments.toLocaleString()}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={engine.budget.investments}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const exp = 100 - engine.budget.savings - val;

                      if (exp >= 0) {
                        engine.updateBudget({
                          ...engine.budget,
                          investments: val,
                          expenses: exp,
                        });
                      }
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>
                      Expenses ({engine.budget.expenses.toFixed(0)}%)
                    </span>
                    <span>
                      ${engine.budgetAllocations.expenses.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}