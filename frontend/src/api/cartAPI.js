import axios from 'axios';

// 🌍 Base API URL — use environment variable or fallback to Render backend
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://fashion-store-3x1m.onrender.com/api';

// 🛠️ Create Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🧠 Automatically attach JWT token (if available)
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

// 🚨 Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Cart API Error:', error.response?.data || error.message);

    // Handle expired or invalid token
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// 🛒 Fetch current user's cart
export const getMyCart = async () => {
  const { data } = await api.get('/cart/mine');
  return data; // Expected: { user, items: [{ product, qty, ... }] }
};

// 🛍️ Update user cart
export const updateCart = async (items) => {
  // Transform cart items for backend format: [{ product: id, qty }]
  const cartItems = items.map((item) => ({
    product: item.product,
    qty: item.qty,
  }));

  const { data } = await api.put('/cart/mine', { items: cartItems });
  return data;
};

export default cartAPI;
