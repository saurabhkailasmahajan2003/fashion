import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// CGPEY
export const createCgpeyPayment = async (payload) => {
  const { data } = await api.post('/orders/cgpey/make-payment', payload);
  return data;
};

export const checkCgpeyStatus = async (transactionId) => {
  const { data } = await api.post('/orders/cgpey/check-status', { transaction_id: transactionId });
  return data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const { data } = await api.post('/orders/verify-razorpay-payment', paymentData);
  return data;
};

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

