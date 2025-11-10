import axios from 'axios';

// 🌍 API base URL: use environment variable or fallback to your Render backend
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://fashion-store-3x1m.onrender.com/api';

// 🛠️ Create Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
});

// 🧠 Interceptor: Automatically attach JWT token to every request
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

// 🚨 Interceptor: Global error handler (optional but helpful)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    // Example: Handle expired/invalid token
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// 🔍 Helper for building query strings
const buildQueryString = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'boolean') sp.set(key, value ? 'true' : 'false');
    else sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

// 🛒 Product API functions
export const fetchProducts = async (params = {}) => {
  const qs = buildQueryString(params);
  const { data } = await api.get(`/products${qs}`);
  return data; // returns {products, page, pages, total}
};

export const fetchProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (product) => {
  const { data } = await api.post('/products', product);
  return data;
};

export const updateProduct = async (id, product) => {
  const { data } = await api.put(`/products/${id}`, product);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

export default productAPI;


