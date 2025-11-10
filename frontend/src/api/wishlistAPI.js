import axios from 'axios';

// 🌍 Use deployed backend by default, or fall back to local
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://fashion-store-3x1m.onrender.com/api';

// 🛠️ Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🔐 Attach JWT token automatically (if present)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Handle unauthorized access (auto logout on 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Wishlist API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ❤️ Get current user's wishlist
export const getMyWishlist = async () => {
  const { data } = await api.get('/wishlist/mine');
  return data; // {user, products: [productIds]}
};

// 💫 Toggle wishlist item (add/remove)
export const toggleWishlist = async (productId) => {
  const { data } = await api.post('/wishlist/toggle', { productId });
  return data; // {user, products: [productIds]}
};

export default wishliastAPI;
