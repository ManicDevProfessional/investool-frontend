import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';
import { GlobalContext } from '../context/GlobalContext';
import { supabase } from '../utils/supabaseClient';

// 1. Import your Header component
import Header from './Header';

export default function Login() {
  const { setToken } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('investool_token') || sessionStorage.getItem('investool_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Email validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = touched.email && !isValidEmail(email) && 'Please enter a valid email address';
  const passwordError = touched.password && password.length < 6 && 'Password must be at least 6 characters';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate all fields
    if (!isValidEmail(email)) {
      setErrorMessage('Please enter a valid email address');
      setTouched(prev => ({ ...prev, email: true }));
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setTouched(prev => ({ ...prev, password: true }));
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw new Error(error.message);

      const accessToken = data.session.access_token;
      
      if (rememberMe) {
        localStorage.setItem('investool_token', accessToken);
      } else {
        sessionStorage.setItem('investool_token', accessToken);
      }
      
      setToken(accessToken);
      navigate('/dashboard');
      
    } catch (err) {
      if (err.message.includes('Invalid login credentials')) {
        setErrorMessage('Incorrect email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setErrorMessage('Please verify your email address before signing in.');
      } else {
        setErrorMessage('Unable to sign in. Check your connection or try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 2. Added 'flex-col' to ensure the layout stacks vertically
    <div className="flex flex-col h-screen bg-[#f5f8fa] font-sans">
      
      {/* 3. Render the Header at the top */}
      <Header />

      {/* 4. Added 'w-full' to ensure the flex-1 container stretches horizontally */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto w-full">
        <div className="w-full max-w-md">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <img src={logo} alt="InvesTool" className="h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#64748b] mt-2">
              Secure access to your wealth command center
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#dc2626] rounded-md flex items-start gap-3 animate-slide-in">
              <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#991b1b]">{errorMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#0a192f] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                    ${emailError && touched.email 
                      ? 'border-[#dc2626] focus:ring-[#dc2626]/20' 
                      : 'border-[#e2e8f0] focus:ring-[#9e1b32]/20 focus:border-[#9e1b32]'
                    }`}
                  placeholder="investor@investool.com"
                  required
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                />
              </div>
              {emailError && touched.email && (
                <p id="email-error" className="mt-1 text-xs text-[#dc2626]">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-semibold text-[#0a192f]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-[#9e1b32] hover:text-[#800020] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                    ${passwordError && touched.password 
                      ? 'border-[#dc2626] focus:ring-[#dc2626]/20' 
                      : 'border-[#e2e8f0] focus:ring-[#9e1b32]/20 focus:border-[#9e1b32]'
                    }`}
                  placeholder="••••••••"
                  required
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0a192f] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && touched.password && (
                <p id="password-error" className="mt-1 text-xs text-[#dc2626]">{passwordError}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#e2e8f0] text-[#9e1b32] focus:ring-[#9e1b32]/20 focus:ring-2"
                />
                <span className="text-sm text-[#0a2540] group-hover:text-[#0a192f] transition-colors">
                  Remember me
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9e1b32] hover:bg-[#800020] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Command Center</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-[#64748b]">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-[#9e1b32] hover:text-[#800020] font-semibold transition-colors"
              >
                Create free account
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}