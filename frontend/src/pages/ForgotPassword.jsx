import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { requestPasswordReset } from '../api/userAPI';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setMessage(res?.message || 'If that email exists, a reset link has been sent');
    } catch (err) {
      setMessage('If that email exists, a reset link has been sent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[28px] shadow-2xl border border-gray-100 max-w-2xl mx-auto overflow-hidden"
        >
          <div className="p-8 sm:p-10">
            <div className="mb-6 text-center">
              <Link to="/" className="inline-block">
                <span className="text-3xl font-black tracking-tight text-gray-900 hover:text-rose-600 transition-colors uppercase">
                  ETRO
                  <span className="block w-6 h-0.5 bg-rose-600 mx-auto mt-1"></span>
                </span>
              </Link>
            </div>
            <h3 className="text-sm tracking-widest text-gray-500 font-semibold text-center">RESET ACCESS</h3>
            <h2 className="mt-1 text-3xl sm:text-4xl font-extrabold text-center">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-emerald-400">Forgot your password?</span>
            </h2>
            <p className="mt-2 text-sm text-gray-600 text-center">Enter your email and we'll send you a link to reset your password.</p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {message && (
                <div className="rounded-md bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm">{message}</div>
              )}
              {error && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4 text-red-800 text-sm">{error}</div>
              )}

              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Email address"
                  className="block w-full pl-4 pr-4 py-3 rounded-full border border-gray-200 shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/60 focus:border-emerald-500/60"
                />
              </div>

              <div className="flex items-center justify-between px-1">
                <span />
                <Link to="/login" className="text-sm text-gray-500 hover:text-emerald-700">Back to login</Link>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-full text-sm font-semibold text-white shadow-lg bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-400 hover:from-emerald-800 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
