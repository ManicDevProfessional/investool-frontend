import React, { useContext, useEffect } from 'react'; // <-- FIX: Imported React for the ErrorBoundary
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion'; 

// Context
import { GlobalContext } from './context/GlobalContext';

// Auth Pages
import Login from './components/Login';
import Signup from './components/Signup';

// Dashboard Components
import Header from './components/Header';
import HomeDashboard from './components/HomeDashboard';
import RealEstateDashboard from './components/RealEstateDashboard';
import StocksDashboard from './components/StocksDashboard';
import RentvestingCalculator from './components/rentvesting/RentvestingCalculator';
import YieldCashflowCalculator from './components/yield/YieldCashFlowCalculator';
import NegativeGearing from './components/negative-gearing/NegativeGearing';
import PurchasingCostsCalculator from './components/purchasing-costs/PurchasingCostsCalculator';
import Profile from './components/profile/Profile';
import DcfSandbox from './components/DcfSandbox';
import DividendSnowball from './components/DividentSnowfall';
import FireProjector from './components/FireProjector';
import CgtEstimator from './components/CgtEstimator';
// ----------------------------------------------------------------------
// 1. Auth Guard Components
// ----------------------------------------------------------------------

const ProtectedRoute = ({ children }) => {
  const { token, isLoading, logout, checkTokenValidity } = useContext(GlobalContext);
  const location = useLocation();

  useEffect(() => {
    if (token && !checkTokenValidity()) {
      logout(); 
    }
  }, [token, checkTokenValidity, logout]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0a192f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#64748b]">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { token, isLoading } = useContext(GlobalContext);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="w-16 h-16 border-4 border-[#0a192f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ----------------------------------------------------------------------
// 2. Dashboard Layout
// ----------------------------------------------------------------------

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <footer className="text-center py-6 text-sm text-slate-400 border-t border-slate-200 mt-auto">
        © {new Date().getFullYear()} InvesTool – Financial Tools
      </footer>
    </div>
  );
};

// ----------------------------------------------------------------------
// 3. UI States
// ----------------------------------------------------------------------

const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="relative">
      <div className="text-9xl font-bold text-slate-200">404</div>
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-slate-600">
        🧭
      </div>
    </div>
    <h1 className="text-3xl font-bold text-[#0a192f] mt-4">Page not found</h1>
    <p className="text-slate-500 mt-2 max-w-md">
      The financial tool you're looking for doesn't exist yet – or has moved.
    </p>
    <button
      onClick={() => window.history.back()}
      className="mt-6 px-6 py-2 bg-[#0a192f] text-white rounded-xl hover:bg-[#1e293b] transition-colors"
    >
      ← Go Back
    </button>
  </div>
);

const ComingSoon = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl animate-pulse flex items-center justify-center mb-6">
      <span className="text-3xl">🔧</span>
    </div>
    <h2 className="text-2xl font-bold text-[#0a192f]">Tool in Development</h2>
    <p className="text-slate-500 mt-2 max-w-md">
      We're crunching the numbers – this calculator will be available soon.
    </p>
    <a href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-[#0a192f] font-medium hover:underline">
      ← Return to Command Center
    </a>
  </div>
);

// ----------------------------------------------------------------------
// 4. Error Boundary
// ----------------------------------------------------------------------

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-700">Something went wrong</h1>
            <p className="mt-2 text-red-600">Please refresh the page or contact support.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ----------------------------------------------------------------------
// 5. Master App Component
// ----------------------------------------------------------------------

export default function App() {
  return (
    <ErrorBoundary>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0a192f',
            color: '#fff',
            borderRadius: '16px',
            padding: '12px 20px',
            fontWeight: '500',
            border: '1px solid #334155',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#0a192f' },
            duration: 3000,
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a192f' },
            duration: 5000,
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<HomeDashboard />} />

          <Route path="real-estate" element={<RealEstateDashboard />} />
          <Route path="stocks" element={<StocksDashboard />} />
          <Route path="rentvesting" element={<RentvestingCalculator />} />
          <Route path="yield-calculator" element={<YieldCashflowCalculator />} />
          <Route path="negative-gearing" element={<NegativeGearing />} />
          <Route path="purchasing-costs" element={<PurchasingCostsCalculator />} />
          <Route path="dcf-sandbox" element={<DcfSandbox />} />

          <Route path="dividend-snowball" element={<DividendSnowball />} />
          <Route path="fire-projector" element={<FireProjector />} />
          <Route path="cgt-estimator" element={<CgtEstimator />} />

          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}