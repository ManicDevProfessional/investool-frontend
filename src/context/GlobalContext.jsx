import { createContext, useState, useEffect, useCallback } from 'react';

export const GlobalContext = createContext();

const SALARY_STORAGE_KEY = 'investool_salary';

function readStoredSalary() {
  try {
    const raw = localStorage.getItem(SALARY_STORAGE_KEY);
    if (raw == null) return 90000;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 90000;
  } catch {
    return 90000;
  }
}

export function GlobalProvider({ children }) {
  const [salary, setSalary] = useState(readStoredSalary);
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(SALARY_STORAGE_KEY, String(salary));
    } catch {
      /* ignore quota / private mode */
    }
  }, [salary]);

  const fetchAnalytics = useCallback(async () => {
    setIsFetchingAnalytics(true);
    try {
      const response = await fetch(
        `http://localhost:8000/portfolios/1/analytics?user_salary=${salary}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }

      const data = await response.json();
      setAnalytics(data);
      setChartData([
        {
          name: 'Annual Cashflow',
          Income: data.gross_annual_rent,
          Expenses: data.total_annual_expenses,
        },
      ]);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setAnalytics(null);
      setChartData([]);
    } finally {
      setIsFetchingAnalytics(false);
    }
  }, [salary]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const value = {
    salary,
    setSalary,
    analytics,
    chartData,
    isFetchingAnalytics,
    fetchAnalytics,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}
