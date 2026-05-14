import { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

// ----------------------------------------------------------------------
// 1. Helper: Decode JWT and check expiration
// ----------------------------------------------------------------------
const isTokenValid = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now() + 5000;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// ----------------------------------------------------------------------
// 2. Create Context
// ----------------------------------------------------------------------
export const GlobalContext = createContext();

// ----------------------------------------------------------------------
// 3. Provider Component
// ----------------------------------------------------------------------
export function GlobalProvider({ children }) {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [salary, setSalary] = useState(90000);
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [isFetchingAnalytics, setIsFetchingAnalytics] = useState(false);

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('investool_token');
    sessionStorage.removeItem('investool_token');
    setToken(null);
    setAnalytics(null);
    setChartData([]);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase signOut warning:', error);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearAuthData();
      // FIX: Removed the hard redirect to /login here. 
      // React Router's <ProtectedRoute> will automatically handle kicking users 
      // to /login ONLY if they are actively viewing a protected page.
    }
  }, [clearAuthData]);

  const checkTokenValidity = useCallback(() => {
    return isTokenValid(token);
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    if (!token || !checkTokenValidity()) {
      if (token) handleLogout(); 
      return;
    }

    setIsFetchingAnalytics(true);
    try {
      const response = await fetch(`http://localhost:8000/portfolios/1/analytics?user_salary=${salary}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        await handleLogout();
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) throw new Error(`Failed to fetch analytics: ${response.status}`);

      const data = await response.json();
      setAnalytics(data);
      setChartData([
        {
          name: 'Annual Cashflow',
          Income: data.gross_annual_rent,
          Expenses: data.total_annual_expenses,
        }
      ]);
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setAnalytics(null);
    } finally {
      setIsFetchingAnalytics(false);
    }
  }, [token, salary, checkTokenValidity, handleLogout]);

  useEffect(() => {
    if (token && checkTokenValidity()) {
      fetchAnalytics();
    }
  }, [token, salary, fetchAnalytics, checkTokenValidity]);

  useEffect(() => {
    const storedToken = localStorage.getItem('investool_token');
    if (storedToken && isTokenValid(storedToken)) {
      setToken(storedToken);
    } else if (storedToken) {
      localStorage.removeItem('investool_token');
      sessionStorage.removeItem('investool_token');
    }
    setIsLoading(false); 
  }, []);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      if (!checkTokenValidity()) {
        handleLogout();
      }
    }, 60000); 
    return () => clearInterval(interval);
  }, [token, checkTokenValidity, handleLogout]);

  // ------------------------------------------------------------------
  // 4. Expose context values
  // ------------------------------------------------------------------
const value = {
    token,
    setToken,
    isLoading,        
    handleLogout, // Change this from 'logout: handleLogout' to just 'handleLogout'
    checkTokenValidity, 
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