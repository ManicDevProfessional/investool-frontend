import { useState, useEffect, useMemo, useCallback, useReducer, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { calculateTax } from '../utils/tax';
import { GlobalContext } from '../context/GlobalContext';

// ----------------------------------------------------------------------
// Undo/Redo Reducer
// ----------------------------------------------------------------------
const undoReducer = (state, action) => {
  const { past, present, future } = state;
  switch (action.type) {
    case 'SET': return { past: [], present: action.payload, future: [] };
    case 'UNDO':
      if (past.length === 0) return state;
      return { past: past.slice(0, past.length - 1), present: past[past.length - 1], future: [present, ...future] };
    case 'REDO':
      if (future.length === 0) return state;
      return { past: [...past, present], present: future[0], future: future.slice(1) };
    case 'UPDATE':
      if (JSON.stringify(present) === JSON.stringify(action.payload)) return state;
      return { past: [...past, present], present: action.payload, future: [] };
    default: return state;
  }
};

export function useIncomeEngine() {
  const { setSalary } = useContext(GlobalContext);
  
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [state, dispatch] = useReducer(undoReducer, { past: [], present: null, future: [] });
  
  const [streams, setStreams] = useState([]);
  const [budget, setBudget] = useState({ savings: 20, investments: 30, expenses: 50 });
  const [goal, setGoal] = useState({ target: 120000 });
  const [netWorth, setNetWorth] = useState({ assets: 50000, liabilities: 20000 });
  const [userStateLoc, setUserStateLoc] = useState('NSW');

  // Fetch from Supabase
  useEffect(() => {
    const fetchCloudData = async () => {
      setIsLoadingInitial(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Please sign in to view your dashboard.");
          setIsLoadingInitial(false);
          return;
        }

        const { data: profile } = await supabase.from('user_profiles').select('*').eq('user_id', user.id).single();
        const { data: userStreams } = await supabase.from('income_streams').select('*').eq('user_id', user.id).order('position', { ascending: true });

        const initialStreams = userStreams?.length ? userStreams : [
          { id: crypto.randomUUID(), title: 'Primary Career', type: 'salary', amount: 90000 },
          { id: crypto.randomUUID(), title: 'Weekend Hustle', type: 'hourly', hours: 15, rate: 35 }
        ];

        const initialGoal = profile ? { target: profile.goal_target } : { target: 120000 };
        const initialNetWorth = profile ? { assets: profile.assets, liabilities: profile.liabilities } : { assets: 50000, liabilities: 20000 };
        const initialStateRes = profile?.state_residence || 'NSW';
        
        setUserStateLoc(initialStateRes);
        setStreams(initialStreams);
        setGoal(initialGoal);
        setNetWorth(initialNetWorth);
        
        dispatch({ type: 'SET', payload: { streams: initialStreams, budget, goal: initialGoal, netWorth: initialNetWorth, userStateLoc: initialStateRes } });
      } catch (error) {
        toast.error("Failed to load cloud data.");
      } finally {
        setIsLoadingInitial(false);
      }
    };
    fetchCloudData();
  }, []);

  // Sync Reducer to State
  useEffect(() => {
    if (state.present) {
      setStreams(state.present.streams);
      setBudget(state.present.budget);
      setGoal(state.present.goal);
      setNetWorth(state.present.netWorth);
      setUserStateLoc(state.present.userStateLoc);
    }
  }, [state.present]);

  // Update Helpers
  const updateFullState = useCallback((newState) => dispatch({ type: 'UPDATE', payload: newState }), []);
  const updateStreams = useCallback((newStreams) => updateFullState({ ...state.present, streams: newStreams }), [state.present, updateFullState]);
  const updateBudget = useCallback((newBudget) => updateFullState({ ...state.present, budget: newBudget }), [state.present, updateFullState]);
  const updateGoal = useCallback((newGoal) => updateFullState({ ...state.present, goal: newGoal }), [state.present, updateFullState]);
  const updateNetWorth = useCallback((newNetWorth) => updateFullState({ ...state.present, netWorth: newNetWorth }), [state.present, updateFullState]);
  const updateUserState = useCallback((newLoc) => updateFullState({ ...state.present, userStateLoc: newLoc }), [state.present, updateFullState]);

  // Save to Supabase
  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save.");
      setIsSaving(false);
      return;
    }

    try {
      await supabase.from('user_profiles').upsert({
        user_id: user.id,
        state_residence: userStateLoc,
        goal_target: goal.target,
        assets: netWorth.assets,
        liabilities: netWorth.liabilities
      });

      await supabase.from('income_streams').delete().eq('user_id', user.id);

      if (streams.length > 0) {
        const streamsPayload = streams.map((stream, index) => ({
          title: stream.title,
          type: stream.type,
          amount: stream.amount || 0,
          hours: stream.hours || 0,
          rate: stream.rate || 0,
          position: index,
          user_id: user.id
        }));
        await supabase.from('income_streams').insert(streamsPayload);
      }

      setSalary(totalIncome); 
      toast.success('Configuration secured to cloud!');
    } catch (error) {
      toast.error('Failed to save to cloud.');
    } finally {
      setIsSaving(false);
    }
  };

  const addStream = (type) => {
    const newStream = { 
      id: crypto.randomUUID(), 
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`, 
      type, 
      amount: type !== 'hourly' ? 50000 : 0, 
      hours: type === 'hourly' ? 10 : 0, 
      rate: type === 'hourly' ? 25 : 0 
    };
    updateStreams([...streams, newStream]);
  };

  // Computed Values
  const totalIncome = useMemo(() => streams.reduce((sum, s) => s.type === 'hourly' ? sum + ((s.hours || 0) * (s.rate || 0) * 52) : sum + (s.amount || 0), 0), [streams]);
  const tax = useMemo(() => calculateTax(totalIncome), [totalIncome]);
  const afterTax = totalIncome - tax;
  const goalProgress = useMemo(() => Math.min(100, Math.max(0, (totalIncome / goal.target) * 100)), [totalIncome, goal.target]);
  const budgetAllocations = useMemo(() => ({ savings: (afterTax * budget.savings) / 100, investments: (afterTax * budget.investments) / 100, expenses: (afterTax * budget.expenses) / 100 }), [afterTax, budget]);
  const netWorthValue = netWorth.assets - netWorth.liabilities;
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    isLoadingInitial, isSaving, state, dispatch, canUndo, canRedo,
    streams, budget, goal, netWorth, userStateLoc,
    updateStreams, updateBudget, updateGoal, updateNetWorth, updateUserState,
    handleSave, addStream,
    totalIncome, tax, afterTax, goalProgress, budgetAllocations, netWorthValue
  };
}