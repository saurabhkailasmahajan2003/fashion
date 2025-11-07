import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // Check for redirect parameter
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/profile';
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Card that matches reference style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[28px] shadow-2xl border border-gray-100 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Illustration with large rounded corner feel */}
            <div className="relative hidden lg:block bg-gradient-to-br from-emerald-200/30 via-white to-emerald-100/40">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -left-10 -top-10 w-64 h-64 rounded-full bg-emerald-300/40 blur-3xl" />
                <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-emerald-500/30 blur-3xl" />
              </div>
              <div className="h-full w-full p-10 flex items-center justify-center">
                <img
                  src="/images/login-illustration.svg"
                  alt="Login"
                  className="max-w-md w-full drop-shadow-xl"
                  onError={(e)=>{e.currentTarget.style.display='none';}}
                />
              </div>
            </div>

            {/* Right Form Pane */}
            <div className="p-8 sm:p-10">
              <div className="mb-6">
                <Link to="/" className="inline-block">
                  <span className="text-3xl font-black tracking-tight text-gray-900 hover:text-rose-600 transition-colors uppercase">
                    ETRO
                    <span className="block w-6 h-0.5 bg-rose-600 mt-1"></span>
                  </span>
                </Link>
              </div>
              <h3 className="text-sm tracking-widest text-gray-500 font-semibold">WELCOME BACK</h3>
              <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold text-gray-900">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-400">LOGIN PAGE</span>
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                New here?{' '}
                <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-600">Create a new account</Link>
              </p>

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">{error}</h3>
                      </div>
                    </div>
                  </div>
                )}
                {/* Email */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-2 flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow text-white">
                      <Mail size={16} />
                    </div>
                  </div>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-14 pr-4 py-3 rounded-full border border-gray-200 shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-2 flex items-center">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow text-white">
                      <Lock size={16} />
                    </div>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-14 pr-12 py-3 rounded-full border border-gray-200 shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between px-1">
                  <span />
                  <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-emerald-700">Forgot password?</Link>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-400 hover:from-emerald-800 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Signing in...' : 'SIGN IN'}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
