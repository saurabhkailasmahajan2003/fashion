import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL,
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

export const getMyCart = async () => {
  const { data } = await api.get('/cart/mine');
  return data; // {user, items: [{product, qty, ...}]}
};

export const updateCart = async (items) => {
  // Transform items to backend format: [{product: id, qty}]
  const cartItems = items.map(item => ({
    product: item.product,
    qty: item.qty
  }));
  const { data } = await api.put('/cart/mine', { items: cartItems });
  return data;
};

