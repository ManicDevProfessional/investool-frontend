import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, Loader2, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import logo from '../assets/logo.png';
import { GlobalContext } from '../context/GlobalContext';
import { supabase } from '../utils/supabaseClient';

// 1. Import your Header component
import Header from './Header'; // Renamed to Header for clarity

export default function Signup() {
  const { setToken } = useContext(GlobalContext);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false });

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('investool_token') || sessionStorage.getItem('investool_token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Validation
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const nameError = touched.fullName && fullName.length < 2 && 'Please enter your name';
  const emailError = touched.email && !isValidEmail(email) && 'Please enter a valid email address';
  const passwordError = touched.password && password.length < 6 && 'Password must be at least 6 characters';

  const handleSignup = async (e) => {
    // ... (keep your existing handleSignup logic)
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (fullName.length < 2 || !isValidEmail(email) || password.length < 6) {
      setTouched({ fullName: true, email: true, password: true });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName, 
          }
        }
      });

      if (error) throw new Error(error.message);

      if (data.user && !data.session) {
        setSuccessMessage('Account created! Please check your email for the verification link.');
        return;
      }

      if (data.session) {
        const accessToken = data.session.access_token;
        localStorage.setItem('investool_token', accessToken);
        setToken(accessToken);
        navigate('/dashboard');
      }
      
    } catch (err) {
      if (err.message.includes('User already registered')) {
        setErrorMessage('An account with this email already exists.');
      } else {
        setErrorMessage(err.message || 'Unable to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 2. Add 'flex-col' to make the layout stack vertically instead of side-by-side
    <div className="flex flex-col h-screen bg-[#f5f8fa] font-sans">
      
      {/* 3. Render the Header at the top */}
      <Header />

      {/* 4. flex-1 allows this container to take up all remaining vertical space */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto w-full">
        <div className="w-full max-w-md">
          
          {/* Brand Header */}
          <div className="text-center mb-8">
            <img src={logo} alt="InvesTool" className="h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#0a192f] tracking-tight">
              Join InvesTool
            </h1>
            <p className="text-[#64748b] mt-2">
              Create your free account to save your wealth analytics
            </p>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start gap-3 animate-slide-in">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#dc2626] rounded-md flex items-start gap-3 animate-slide-in">
              <AlertCircle className="w-5 h-5 text-[#dc2626] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#991b1b]">{errorMessage}</p>
            </div>
          )}

          {/* Signup Form */}
          {!successMessage && (
            <form onSubmit={handleSignup} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
              
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-[#0a192f] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, fullName: true }))}
                    className={`w-full pl-10 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all
                      ${nameError && touched.fullName 
                        ? 'border-[#dc2626] focus:ring-[#dc2626]/20' 
                        : 'border-[#e2e8f0] focus:ring-[#9e1b32]/20 focus:border-[#9e1b32]'
                      }`}
                    placeholder="John Doe"
                    required
                  />
                </div>
                {nameError && touched.fullName && (
                  <p className="mt-1 text-xs text-[#dc2626]">{nameError}</p>
                )}
              </div>

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
                  />
                </div>
                {emailError && touched.email && (
                  <p className="mt-1 text-xs text-[#dc2626]">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#0a192f] mb-2">
                  Password
                </label>
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#0a192f] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && touched.password && (
                  <p className="mt-1 text-xs text-[#dc2626]">{passwordError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#9e1b32] hover:bg-[#800020] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Login Link */}
              <p className="text-center text-sm text-[#64748b]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#9e1b32] hover:text-[#800020] font-semibold transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}