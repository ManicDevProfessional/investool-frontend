import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, TrendingUp, LayoutDashboard, User, Calculator, Menu,
  X, ChevronDown, TrendingDown, MapPin, LineChart, Snowflake,
  Flame, Landmark, CircleDollarSign, LogOut, Settings, HelpCircle
} from 'lucide-react';
import { GlobalContext } from '../context/GlobalContext';
import { supabase } from '../utils/supabaseClient';
import logo from '../assets/logo.png';

// ============================================================
// Dropdown Menu Component
// ============================================================
function DropdownMenu({ trigger, children, align = 'left' }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.dropdown-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="dropdown-container relative">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-56 bg-[#0a192f] border border-slate-700/50 rounded-xl shadow-2xl py-2 z-50 animate-fade-in-up`}>
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================
// NavLink Component (for dropdown items)
// ============================================================
function NavLink({ icon: Icon, label, path, currentPath, onClick }) {
  const isActive = currentPath === path;
  return (
    <button
      onClick={() => onClick(path)}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200
        ${isActive 
          ? 'bg-[#9e1b32]/10 text-[#ff7b5c] border-l-2 border-[#9e1b32]' 
          : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
        }
      `}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

// ============================================================
// Main Header Component
// ============================================================
export default function Header() {
  const { handleLogout } = useContext(GlobalContext); // Assuming you updated your context export to match this
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState({ isAuthenticated: false, name: '', email: '', initials: '' });
  const [scrolled, setScrolled] = useState(false);

  // Fetch user on mount and listen to auth changes
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name || 'Investor';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        setUserData({ isAuthenticated: true, name, email, initials });
      } else {
        setUserData({ isAuthenticated: false, name: '', email: '', initials: '' });
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name || 'Investor';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        setUserData({ isAuthenticated: true, name, email, initials });
      } else {
        setUserData({ isAuthenticated: false, name: '', email: '', initials: '' });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Handle scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleNavigation = (path) => navigate(path);

  // Combined Log Out Function
  const handleSignOut = async () => {
    try {
      // 1. Sign out of Supabase to terminate the active session
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // 2. Clear both potential token storages
      localStorage.removeItem('investool_token');
      sessionStorage.removeItem('investool_token');

      // 3. Clear the local component state
      setUserData({ isAuthenticated: false, name: '', email: '', initials: '' });

      // 4. Call your context logout to clear global state
      if (typeof handleLogout === 'function') {
        await handleLogout();
      }

      // 5. Force navigation to the login page
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  // Navigation structure for dropdowns
  const analyticsHubs = [
    { icon: Home, label: 'Real Estate Hub', path: '/dashboard/real-estate' },
    { icon: TrendingUp, label: 'Stocks & Wealth', path: '/dashboard/stocks' },
  ];

  const propertyEngines = [
    { icon: Calculator, label: 'Rentvesting', path: '/dashboard/rentvesting' },
    { icon: TrendingDown, label: 'Yield & Cashflow', path: '/dashboard/yield-calculator' },
    { icon: CircleDollarSign, label: 'Negative Gearing', path: '/dashboard/negative-gearing' },
    { icon: MapPin, label: 'Purchasing Costs', path: '/dashboard/purchasing-costs' },
  ];

  const wealthEngines = [
    { icon: LineChart, label: 'DCF Sandbox', path: '/dashboard/dcf-sandbox' },
    { icon: Snowflake, label: 'Dividend Snowball', path: '/dashboard/dividend-snowball' },
    { icon: Flame, label: 'FIRE Projector', path: '/dashboard/fire-projector' },
    { icon: Landmark, label: 'CGT Estimator', path: '/dashboard/cgt-estimator' },
  ];

  return (
    <>
      {/* Header */}
      <header className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled 
          ? 'bg-[#0a192f]/90 backdrop-blur-xl border-b border-slate-700/50 shadow-lg' 
          : 'bg-[#0a192f] border-b border-slate-800/50'
        }
      `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo */}
            <div 
              onClick={() => handleNavigation('/dashboard/real-estate')}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img 
                src={logo} 
                alt="InvesTool Logo" 
                className="h-8 w-8 brightness-0 invert transition-transform duration-300 group-hover:scale-105" 
                onError={(e) => e.target.style.display = 'none'}
              />
              <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                InvesTool
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {/* Analytics Hubs Dropdown */}
              <DropdownMenu
                trigger={
                  <button className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
                    <LayoutDashboard size={18} />
                    <span>Analytics Hubs</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                }
              >
                {analyticsHubs.map(item => (
                  <NavLink
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    currentPath={location.pathname}
                    onClick={handleNavigation}
                  />
                ))}
              </DropdownMenu>

              {/* Property Engines Dropdown */}
              <DropdownMenu
                trigger={
                  <button className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
                    <Calculator size={18} />
                    <span>Property Engines</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                }
              >
                {propertyEngines.map(item => (
                  <NavLink
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    currentPath={location.pathname}
                    onClick={handleNavigation}
                  />
                ))}
              </DropdownMenu>

              {/* Wealth Engines Dropdown */}
              <DropdownMenu
                trigger={
                  <button className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
                    <LineChart size={18} />
                    <span>Wealth Engines</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                }
              >
                {wealthEngines.map(item => (
                  <NavLink
                    key={item.path}
                    icon={item.icon}
                    label={item.label}
                    path={item.path}
                    currentPath={location.pathname}
                    onClick={handleNavigation}
                  />
                ))}
              </DropdownMenu>
            </div>

            {/* Right Section: User & Mobile Menu */}
            <div className="flex items-center gap-3">
              {userData.isAuthenticated ? (
                <DropdownMenu
                  align="right"
                  trigger={
                    <button className="flex items-center gap-2 focus:outline-none group">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#0a2540] to-[#9e1b32] flex items-center justify-center border border-slate-600 shadow-md transition-transform group-hover:scale-105">
                        <span className="text-white font-bold text-sm">{userData.initials}</span>
                      </div>
                      <ChevronDown size={16} className="text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                  }
                >
                  <div className="px-4 py-3 border-b border-slate-700/50">
                    <p className="text-sm font-semibold text-white truncate">{userData.name}</p>
                    <p className="text-xs text-slate-400 truncate">{userData.email}</p>
                  </div>
                  <button
                    onClick={() => handleNavigation('/dashboard/profile')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/dashboard/settings')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => window.open('/help', '_blank')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                  >
                    <HelpCircle size={16} />
                    <span>Help & Support</span>
                  </button>
                  <div className="border-t border-slate-700/50 my-1"></div>
                  <button
                    onClick={handleSignOut} // Updated Here
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Secure Log Out</span>
                  </button>
                </DropdownMenu>
              ) : (
                <button
                  onClick={() => handleNavigation('/login')}
                  className="px-4 py-2 rounded-lg bg-[#9e1b32] hover:bg-[#b82541] text-white font-medium transition-all shadow-md"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`
        fixed inset-0 z-40 transition-all duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}
      `}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer Content */}
        <div className={`
          absolute top-0 right-0 h-full w-80 bg-[#0a192f] shadow-2xl border-l border-slate-700/50
          transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          {/* Drawer Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-7 brightness-0 invert" />
              <span className="text-xl font-bold text-white">InvesTool</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Drawer Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Analytics Hubs */}
            <div className="mb-4">
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Analytics Hubs</p>
              {analyticsHubs.map(item => (
                <NavLink
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  currentPath={location.pathname}
                  onClick={handleNavigation}
                />
              ))}
            </div>

            {/* Property Engines */}
            <div className="mb-4">
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Property Engines</p>
              {propertyEngines.map(item => (
                <NavLink
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  currentPath={location.pathname}
                  onClick={handleNavigation}
                />
              ))}
            </div>

            {/* Wealth Engines */}
            <div className="mb-6">
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Wealth Engines</p>
              {wealthEngines.map(item => (
                <NavLink
                  key={item.path}
                  icon={item.icon}
                  label={item.label}
                  path={item.path}
                  currentPath={location.pathname}
                  onClick={handleNavigation}
                />
              ))}
            </div>

            {/* Extra links for mobile */}
            <div className="border-t border-slate-800 pt-4">
              <button
                onClick={() => handleNavigation('/dashboard/profile')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50"
              >
                <User size={16} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => handleNavigation('/dashboard/settings')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button
                onClick={() => window.open('/help', '_blank')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50"
              >
                <HelpCircle size={16} />
                <span>Help & Support</span>
              </button>
            </div>
          </div>

          {/* User info & logout in drawer (if authenticated) */}
          {userData.isAuthenticated && (
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a2540] to-[#9e1b32] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{userData.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{userData.name}</p>
                  <p className="text-xs text-slate-400 truncate">{userData.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut} // Updated Here
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-700/50 text-rose-400 hover:bg-rose-950/30 transition-colors"
              >
                <LogOut size={16} />
                <span>Secure Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}