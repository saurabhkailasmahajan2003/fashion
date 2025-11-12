import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useUser } from '../context/UserContext.jsx';
import api from '../api.js';
import { motion } from 'framer-motion';
import { Loader, CreditCard, MapPin } from 'lucide-react';

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const { user, loading: userLoading } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    // Validation
    if (!form.name || !form.email || !form.phone || !form.address || !form.city || !form.postalCode) {
      setError('Please fill in all required fields');
      setProcessing(false);
      return;
    }

    try {
      // Prepare order items
      const orderItems = items.map(item => ({
        product: item.product,
        name: item.data?.name || 'Product',
        qty: item.qty,
        price: item.data?.price || 0,
        image: item.data?.images?.[0] || item.data?.image || '',
        data: item.data
      }));

      console.log('Creating order with items:', orderItems);
      console.log('Total amount:', totals.totalPrice);

      // Create CGPEY payment intent
      const payload = {
        orderItems,
        shippingAddress: {
          name: form.name,
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          postalCode: form.postalCode,
          country: form.country,
          phone: form.phone
        }
      };

      console.log('Sending CGPEY payload:', payload);
      const { data: resp } = await api.post('/orders/cgpey/make-payment', payload);
      console.log('CGPEY response:', resp);

      if (!resp || !resp.orderId) {
        throw new Error('Failed to create payment intent.');
      }

      const orderId = resp.orderId;
      sessionStorage.setItem('pendingOrderId', orderId);
      sessionStorage.setItem('pendingOrderData', JSON.stringify({ orderId, items }));

      // Open intent if provided
      const intentUrl = resp?.cgpey?.intentData;
      if (intentUrl && typeof window !== 'undefined') {
        window.location.href = intentUrl;
      }

      // Simple polling for status (in case user returns to app)
      let attempts = 0;
      const maxAttempts = 60; // ~3 minutes at 3s interval
      const interval = setInterval(async () => {
        attempts += 1;
        try {
          const { data: status } = await api.post('/orders/cgpey/check-status', { transaction_id: orderId });
          if (String(status.status).toLowerCase() === 'success') {
            clearInterval(interval);
            clearCart();
            navigate(`/order-success?orderId=${orderId}`);
          }
        } catch (e) {
          // ignore and keep polling
        }
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setProcessing(false);
        }
      }, 3000);
    } catch (err) {
      console.error('Payment error:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Failed to initiate payment';
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = 'Payment service not found. Please check if the backend server is running.';
        } else if (err.response.status === 401) {
          errorMessage = 'Please log in to continue with payment.';
          setTimeout(() => navigate('/login?redirect=/checkout'), 2000);
        } else if (err.response.status === 400) {
          // Show the detailed error message from backend
          const backendMessage = err.response.data?.message || 'Invalid order details. Please check your information.';
          // Replace newlines with spaces for display
          errorMessage = backendMessage.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        } else {
          errorMessage = err.response.data?.message || `Payment error: ${err.response.status}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setProcessing(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, userLoading, navigate]);

  // Show loading while checking user
  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary-600" size={40} />
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect above)
  if (!user) {
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to proceed with checkout.</p>
          <button
            onClick={() => navigate('/shop')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-6 py-4 rounded-lg shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold">Payment Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError('')}
                className="flex-shrink-0 text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handlePayment} className="md:col-span-2 space-y-6 bg-white p-6 rounded-xl shadow-lg">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-primary-600" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    className="rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <input
                    type="email"
                    className="rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    placeholder="Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <input
                  type="tel"
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    className="rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  <input
                    className="rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                  <input
                    className="rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    placeholder="Postal Code"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  />
                </div>
                <input
                  className="w-full rounded-md border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={processing || loading}
              className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing || loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Pay ₹{totals.totalPrice.toFixed(2)}
                </>
              )}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg h-max">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="divide-y divide-gray-200 space-y-4">
              {items.map((item) => (
                <div key={item.product} className="flex gap-4 pt-4">
                  <img
                    src={item.data?.images?.[0] || item.data?.image || 'https://via.placeholder.com/100'}
                    alt={item.data?.name}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.data?.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">₹{(item.data?.price || 0) * item.qty}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Items Price</span>
                <span>₹{totals.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax</span>
                <span>₹{totals.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span>₹{totals.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{totals.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
