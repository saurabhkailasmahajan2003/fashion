import axios from 'axios';

// 🌍 Use VITE_API_URL if available, otherwise fallback to Render backend
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://fashion-store-3x1m.onrender.com/api';

// 🛠️ Create Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🧠 Automatically attach token to every request
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

// 🚨 Handle global API errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Order API Error:', error.response?.data || error.message);

    // Redirect to login if token expired or invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// 🧾 Fetch logged-in user's orders
export const getMyOrders = async () => {
  const { data } = await api.get('/orders/mine');
  return data; // Expected: array of user's orders
};

// 📦 Fetch all orders (for admin)
export const getAllOrders = async () => {
  const { data } = await api.get('/orders');
  return data; // Expected: array of all orders
};

// 🚚 Mark specific order as delivered (admin only)
export const markOrderDelivered = async (id) => {
  const { data } = await api.put(`/orders/${id}/deliver`);
  return data; // Expected: updated order object
};

export default ordersAPI;
