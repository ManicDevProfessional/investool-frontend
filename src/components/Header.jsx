import { useState, useEffect, createElement } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  LayoutDashboard,
  User,
  Calculator,
  Menu,
  X,
  ChevronDown,
  TrendingDown,
  MapPin,
  LineChart,
  Snowflake,
  Flame,
  Landmark,
  CircleDollarSign,
} from 'lucide-react';
import logo from '../assets/logo.png';

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
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-56 bg-[#0a192f] border border-slate-700/50 rounded-xl shadow-2xl py-2 z-50 animate-fade-in-up`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function NavLink({ icon, label, path, currentPath, onClick }) {
  const isActive = currentPath === path;
  return (
    <button
      type="button"
      onClick={() => onClick(path)}
      className={`
        w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200
        ${
          isActive
            ? 'bg-[#9e1b32]/10 text-[#ff7b5c] border-l-2 border-[#9e1b32]'
            : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
        }
      `}
    >
      {createElement(icon, { size: 16 })}
      <span>{label}</span>
    </button>
  );
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

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
      <header
        className={`
        sticky top-0 z-50 transition-all duration-300
        ${
          scrolled
            ? 'bg-[#0a192f]/90 backdrop-blur-xl border-b border-slate-700/50 shadow-lg'
            : 'bg-[#0a192f] border-b border-slate-800/50'
        }
      `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div
              onClick={() => handleNavigation('/dashboard/real-estate')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNavigation('/dashboard/real-estate');
                }
              }}
              role="button"
              tabIndex={0}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img
                src={logo}
                alt="InvesTool Logo"
                className="h-8 w-8 brightness-0 invert transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
                InvesTool
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                  >
                    <LayoutDashboard size={18} />
                    <span>Analytics Hubs</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                }
              >
                {analyticsHubs.map((item) => (
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

              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                  >
                    <Calculator size={18} />
                    <span>Property Engines</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                }
              >
                {propertyEngines.map((item) => (
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

              <DropdownMenu
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-1 px-3 py-2 text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50"
                  >
                    <LineChart size={18} />
                    <span>Wealth Engines</span>
                    <ChevronDown size={14} className="ml-1" />
                  </button>
                }
              >
                {wealthEngines.map((item) => (
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

            <div className="flex items-center gap-3">
              <DropdownMenu
                align="right"
                trigger={
                  <button
                    type="button"
                    className="flex items-center gap-2 focus:outline-none group"
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-[#0a2540] to-[#9e1b32] flex items-center justify-center border border-slate-600 shadow-md transition-transform group-hover:scale-105">
                      <span className="text-white font-bold text-sm">IT</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className="text-slate-400 group-hover:text-white transition-colors"
                    />
                  </button>
                }
              >
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <p className="text-sm font-semibold text-white">InvesTool</p>
                  <p className="text-xs text-slate-400 truncate">Local workspace</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigation('/dashboard/profile')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
              </DropdownMenu>

              <button
                type="button"
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

      <div
        className={`
        fixed inset-0 z-40 transition-all duration-300 ease-in-out md:hidden
        ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}
      `}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') setIsMobileMenuOpen(false);
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />

        <div
          className={`
          absolute top-0 right-0 h-full w-80 bg-[#0a192f] shadow-2xl border-l border-slate-700/50
          transition-transform duration-300 ease-in-out flex flex-col
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-7 brightness-0 invert" />
              <span className="text-xl font-bold text-white">InvesTool</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="mb-4">
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Analytics Hubs
              </p>
              {analyticsHubs.map((item) => (
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

            <div className="mb-4">
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Property Engines
              </p>
              {propertyEngines.map((item) => (
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

            <div className="mb-6">
              <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Wealth Engines
              </p>
              {wealthEngines.map((item) => (
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

            <div className="border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => handleNavigation('/dashboard/profile')}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50"
              >
                <User size={16} />
                <span>Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
