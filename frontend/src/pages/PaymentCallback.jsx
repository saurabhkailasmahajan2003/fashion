import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function PaymentCallback() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const pendingOrderId = sessionStorage.getItem('pendingOrderId');
        if (!pendingOrderId) {
          setStatus('failed');
          setError('Order information not found');
          return;
        }

        // Poll CGPEY status a few times after redirect
        let attempts = 0;
        const maxAttempts = 20; // ~20s
        const interval = setInterval(async () => {
          attempts += 1;
          try {
            const { data: resp } = await api.post('/orders/cgpey/check-status', { transaction_id: pendingOrderId });
            if (String(resp.status).toLowerCase() === 'success') {
              clearInterval(interval);
              clearCart();
              sessionStorage.removeItem('pendingOrderId');
              sessionStorage.removeItem('pendingOrderData');
              setStatus('success');
              setTimeout(() => navigate(`/order-success?orderId=${pendingOrderId}`), 1500);
            }
          } catch (_) {
            // keep polling
          }
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            setStatus('failed');
            setError('Payment status could not be verified.');
          }
        }, 1000);
      } catch (err) {
        console.error('Payment callback error:', err);
        setStatus('failed');
        setError(err.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [navigate, clearCart]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <Loader className="animate-spin text-primary-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 mx-auto"
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Redirecting to order confirmation...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 mx-auto"
        >
          <XCircle size={48} className="text-red-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">{error || 'There was an issue processing your payment.'}</p>
        <button
          onClick={() => navigate('/checkout')}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}

