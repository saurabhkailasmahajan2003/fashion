import axios from 'axios';

// 🌍 Use environment variable or fallback to Render backend
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://fashion-store-3x1m.onrender.com/api';

// 🛠️ Create Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🧠 Attach JWT token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Global error handling (401 auto redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Payment API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 💳 CGPEY Payment APIs
export const createCgpeyPayment = async (payload) => {
  const { data } = await api.post('/orders/cgpey/make-payment', payload);
  return data; // expected: payment initiation response
};

export const checkCgpeyStatus = async (transactionId) => {
  const { data } = await api.post('/orders/cgpey/check-status', {
    transaction_id: transactionId,
  });
  return data; // expected: transaction status
};

// 💰 Razorpay Payment Verification
export const verifyRazorpayPayment = async (paymentData) => {
  const { data } = await api.post('/orders/verify-razorpay-payment', paymentData);
  return data; // expected: success/failure verification
};

// 🧾 Create Order (after payment)
export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data; // expected: order confirmation
};

export default paymentAPI;
