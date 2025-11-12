import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api.js';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const e = sp.get('email') || '';
    const t = sp.get('token') || '';
    setEmail(e);
    setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const token = new URLSearchParams(location.search).get('token');
      const emailParam = new URLSearchParams(location.search).get('email');
      const { data: res } = await api.post('/users/reset-password', { email: emailParam, token, password });
      setMessage(res?.message || 'Password reset successful. You can now login.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-50 via-orange-50 to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border border-gray-100"
      >
        <div>
          <Link to="/" className="flex justify-center mb-6">
            <span className="text-4xl font-black tracking-tight text-gray-900 hover:text-rose-600 transition-colors uppercase">
              ETRO
              <span className="block w-6 h-0.5 bg-rose-600 mx-auto mt-1"></span>
            </span>
          </Link>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {message && (
            <div className="rounded-md bg-green-50 p-4 text-green-800 text-sm">{message}</div>
          )}
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-red-800 text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-50" readOnly={!!email} />
            </div>
            <div>
              <label className="block text-sm text-gray-700">New Password</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="w-full px-3 py-3 border border-gray-300 rounded-md" placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Confirm Password</label>
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required className="w-full px-3 py-3 border border-gray-300 rounded-md" placeholder="Re-enter new password" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm text-pink-600 hover:text-pink-700">Back to login</Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
