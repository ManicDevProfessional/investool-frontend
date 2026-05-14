import { useState, useEffect, useMemo, useCallback, useReducer, useContext } from 'react';
import { toast } from 'react-hot-toast';
import { calculateTax } from '../utils/tax';
import { GlobalContext } from '../context/GlobalContext';

const INCOME_PROFILE_STORAGE_KEY = 'investool_income_profile';

const undoReducer = (state, action) => {
  const { past, present, future } = state;
  switch (action.type) {
    case 'SET':
      return { past: [], present: action.payload, future: [] };
    case 'UNDO':
      if (past.length === 0) return state;
      return {
        past: past.slice(0, past.length - 1),
        present: past[past.length - 1],
        future: [present, ...future],
      };
    case 'REDO':
      if (future.length === 0) return state;
      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
      };
    case 'UPDATE':
      if (JSON.stringify(present) === JSON.stringify(action.payload)) return state;
      return { past: [...past, present], present: action.payload, future: [] };
    default:
      return state;
  }
};

function totalIncomeFromStreams(streamList) {
  return streamList.reduce(
    (sum, s) =>
      s.type === 'hourly'
        ? sum + (s.hours || 0) * (s.rate || 0) * 52
        : sum + (s.amount || 0),
    0
  );
}

export function useIncomeEngine() {
  const { setSalary } = useContext(GlobalContext);

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [state, dispatch] = useReducer(undoReducer, {
    past: [],
    present: null,
    future: [],
  });

  const [streams, setStreams] = useState([]);
  const [budget, setBudget] = useState({ savings: 20, investments: 30, expenses: 50 });
  const [goal, setGoal] = useState({ target: 120000 });
  const [netWorth, setNetWorth] = useState({ assets: 50000, liabilities: 20000 });
  const [userStateLoc, setUserStateLoc] = useState('NSW');

  useEffect(() => {
    const initialBudget = { savings: 20, investments: 30, expenses: 50 };
    const initialGoal = { target: 120000 };
    const initialNetWorth = { assets: 50000, liabilities: 20000 };
    const defaultStreams = [
      { id: crypto.randomUUID(), title: 'Primary Career', type: 'salary', amount: 90000 },
      { id: crypto.randomUUID(), title: 'Weekend Hustle', type: 'hourly', hours: 15, rate: 35 },
    ];

    let persisted = null;
    try {
      const raw = localStorage.getItem(INCOME_PROFILE_STORAGE_KEY);
      if (raw) persisted = JSON.parse(raw);
    } catch {
      persisted = null;
    }

    if (persisted && Array.isArray(persisted.streams) && persisted.streams.length > 0) {
      const streamsWithIds = persisted.streams.map((s) => ({
        ...s,
        id: s.id || crypto.randomUUID(),
      }));
      const b =
        persisted.budget && typeof persisted.budget === 'object'
          ? persisted.budget
          : initialBudget;
      const g =
        persisted.goal && typeof persisted.goal === 'object' ? persisted.goal : initialGoal;
      const nw =
        persisted.netWorth && typeof persisted.netWorth === 'object'
          ? persisted.netWorth
          : initialNetWorth;
      const loc =
        typeof persisted.userStateLoc === 'string' ? persisted.userStateLoc : 'NSW';

      setUserStateLoc(loc);
      setStreams(streamsWithIds);
      setBudget(b);
      setGoal(g);
      setNetWorth(nw);
      setSalary(totalIncomeFromStreams(streamsWithIds));

      dispatch({
        type: 'SET',
        payload: {
          streams: streamsWithIds,
          budget: b,
          goal: g,
          netWorth: nw,
          userStateLoc: loc,
        },
      });
    } else {
      setUserStateLoc('NSW');
      setStreams(defaultStreams);
      setBudget(initialBudget);
      setGoal(initialGoal);
      setNetWorth(initialNetWorth);
      setSalary(totalIncomeFromStreams(defaultStreams));

      dispatch({
        type: 'SET',
        payload: {
          streams: defaultStreams,
          budget: initialBudget,
          goal: initialGoal,
          netWorth: initialNetWorth,
          userStateLoc: 'NSW',
        },
      });
    }

    setIsLoadingInitial(false);
  }, [setSalary]);

  useEffect(() => {
    if (state.present) {
      setStreams(state.present.streams);
      setBudget(state.present.budget);
      setGoal(state.present.goal);
      setNetWorth(state.present.netWorth);
      setUserStateLoc(state.present.userStateLoc);
    }
  }, [state.present]);

  const updateFullState = useCallback(
    (newState) => dispatch({ type: 'UPDATE', payload: newState }),
    []
  );
  const updateStreams = useCallback(
    (newStreams) => updateFullState({ ...state.present, streams: newStreams }),
    [state.present, updateFullState]
  );
  const updateBudget = useCallback(
    (newBudget) => updateFullState({ ...state.present, budget: newBudget }),
    [state.present, updateFullState]
  );
  const updateGoal = useCallback(
    (newGoal) => updateFullState({ ...state.present, goal: newGoal }),
    [state.present, updateFullState]
  );
  const updateNetWorth = useCallback(
    (newNetWorth) => updateFullState({ ...state.present, netWorth: newNetWorth }),
    [state.present, updateFullState]
  );
  const updateUserState = useCallback(
    (newLoc) => updateFullState({ ...state.present, userStateLoc: newLoc }),
    [state.present, updateFullState]
  );

  const addStream = (type) => {
    const newStream = {
      id: crypto.randomUUID(),
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type,
      amount: type !== 'hourly' ? 50000 : 0,
      hours: type === 'hourly' ? 10 : 0,
      rate: type === 'hourly' ? 25 : 0,
    };
    updateStreams([...streams, newStream]);
  };

  const totalIncome = useMemo(
    () =>
      streams.reduce(
        (sum, s) =>
          s.type === 'hourly'
            ? sum + (s.hours || 0) * (s.rate || 0) * 52
            : sum + (s.amount || 0),
        0
      ),
    [streams]
  );

  const handleSave = useCallback(() => {
    setIsSaving(true);
    try {
      const payload = {
        streams,
        budget,
        goal,
        netWorth,
        userStateLoc,
      };
      localStorage.setItem(INCOME_PROFILE_STORAGE_KEY, JSON.stringify(payload));
      setSalary(totalIncome);
      toast.success('Saved to this browser.');
    } catch {
      toast.error('Could not save.');
    } finally {
      setIsSaving(false);
    }
  }, [streams, budget, goal, netWorth, userStateLoc, setSalary, totalIncome]);

  const tax = useMemo(() => calculateTax(totalIncome), [totalIncome]);
  const afterTax = totalIncome - tax;
  const goalProgress = useMemo(
    () => Math.min(100, Math.max(0, (totalIncome / goal.target) * 100)),
    [totalIncome, goal.target]
  );
  const budgetAllocations = useMemo(
    () => ({
      savings: (afterTax * budget.savings) / 100,
      investments: (afterTax * budget.investments) / 100,
      expenses: (afterTax * budget.expenses) / 100,
    }),
    [afterTax, budget]
  );
  const netWorthValue = netWorth.assets - netWorth.liabilities;
  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    isLoadingInitial,
    isSaving,
    state,
    dispatch,
    canUndo,
    canRedo,
    streams,
    budget,
    goal,
    netWorth,
    userStateLoc,
    updateStreams,
    updateBudget,
    updateGoal,
    updateNetWorth,
    updateUserState,
    handleSave,
    addStream,
    totalIncome,
    tax,
    afterTax,
    goalProgress,
    budgetAllocations,
    netWorthValue,
  };
}
