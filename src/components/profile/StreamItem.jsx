import { useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { Briefcase, Gamepad2, TrendingUp, Home, TrendingDown, GitBranch, Trash2 } from 'lucide-react';

export default function StreamItem({ stream, onUpdate, onDelete, dark, canDrag }) {
  const handleChange = (field, value) => {
    const num = parseFloat(value);
    if (isNaN(num) && value !== '') return;
    onUpdate({ ...stream, [field]: value === '' ? '' : num });
  };

  const renderFields = () => {
    switch (stream.type) {
      case 'salary':
        return (
          <div>
            <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Annual Base</p>
            <div className="flex items-center text-3xl font-extrabold">
              <span className="text-slate-400 mr-1">$</span>
              <input type="number" value={stream.amount} onChange={(e) => handleChange('amount', e.target.value)} className={`bg-transparent border-b-2 border-transparent focus:border-slate-400 outline-none pb-1 w-full text-3xl font-extrabold ${dark ? 'text-white' : 'text-[#0a192f]'}`} min="0" step="1000" />
            </div>
          </div>
        );
      case 'hourly':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Hours / Week</p>
              <input type="number" value={stream.hours} onChange={(e) => handleChange('hours', e.target.value)} className={`bg-transparent border-b-2 border-transparent focus:border-slate-400 outline-none pb-1 w-full text-2xl font-bold ${dark ? 'text-white' : 'text-[#0a192f]'}`} min="0" step="1" />
            </div>
            <div>
              <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Hourly Rate</p>
              <div className="flex items-center text-2xl font-bold">
                <span className="text-slate-400 mr-1">$</span>
                <input type="number" value={stream.rate} onChange={(e) => handleChange('rate', e.target.value)} className={`bg-transparent border-b-2 border-transparent focus:border-slate-400 outline-none pb-1 w-full text-2xl font-bold ${dark ? 'text-white' : 'text-[#0a192f]'}`} min="0" step="5" />
              </div>
            </div>
          </div>
        );
      case 'freelance':
      case 'dividends':
      case 'rental':
      case 'capital_gains':
        return (
          <div>
            <p className={`text-xs uppercase font-bold tracking-wider mb-1 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Annual Income</p>
            <div className="flex items-center text-3xl font-extrabold">
              <span className="text-slate-400 mr-1">$</span>
              <input type="number" value={stream.amount} onChange={(e) => handleChange('amount', e.target.value)} className={`bg-transparent border-b-2 border-transparent focus:border-slate-400 outline-none pb-1 w-full text-3xl font-extrabold ${dark ? 'text-white' : 'text-[#0a192f]'}`} min="0" step="1000" />
            </div>
          </div>
        );
      default: return null;
    }
  };

  const yearlyAmount = useMemo(() => {
    if (stream.type === 'hourly') return (stream.hours || 0) * (stream.rate || 0) * 52;
    return stream.amount || 0;
  }, [stream]);

  return (
    <Reorder.Item value={stream} dragListener={canDrag} dragConstraints={{ top: 0, bottom: 0 }} whileDrag={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }} className={`rounded-3xl p-6 md:p-8 border shadow-sm transition-colors duration-500 relative group ${dark ? 'bg-[#112240] border-[#233554]' : 'bg-white border-slate-200'}`}>
      <button onClick={() => onDelete(stream.id)} className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"><Trash2 size={18} /></button>
      <div className="flex items-center gap-4 mb-6">
        <div className={`p-4 rounded-2xl ${stream.type === 'salary' ? 'bg-emerald-500/10 text-emerald-500' : stream.type === 'hourly' ? 'bg-[#9e1b32]/10 text-[#9e1b32]' : 'bg-slate-500/10 text-slate-500'}`}>
          {stream.type === 'salary' && <Briefcase size={24} />}
          {stream.type === 'hourly' && <Gamepad2 size={24} />}
          {stream.type !== 'salary' && stream.type !== 'hourly' && <TrendingUp size={24} />}
        </div>
        <input value={stream.title} onChange={(e) => onUpdate({ ...stream, title: e.target.value })} className={`bg-transparent border-b-2 border-transparent focus:border-slate-400 outline-none pb-1 text-2xl font-bold w-full max-w-[250px] ${dark ? 'text-white' : 'text-[#0a192f]'}`} placeholder="Stream Name" />
      </div>
      {renderFields()}
      <div className={`mt-6 pt-4 border-t ${dark ? 'border-[#233554]' : 'border-slate-100'} flex justify-between items-center`}>
        <span className={`text-sm font-semibold uppercase tracking-wider ${dark ? 'text-slate-400' : 'text-slate-500'}`}>Yearly Contribution</span>
        <span className="text-xl font-bold">${Math.round(yearlyAmount).toLocaleString()}</span>
      </div>
    </Reorder.Item>
  );
}