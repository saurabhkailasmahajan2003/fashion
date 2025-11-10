import axios from 'axios';

// 🌍 Use environment variable or fallback to deployed backend
const baseURL =
  import.meta.env.VITE_API_URL?.trim() ||
  'https://fashion-store-3x1m.onrender.com/api';

// 🛠️ Axios instance
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 🧠 Attach JWT token (if exists)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Handle unauthorized token (auto logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('User API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 🔐 AUTH
export const login = async (email, password) => {
  const { data } = await api.post('/users/login', { email, password });
  return data; // {_id, name, email, token}
};

export const register = async (name, email, password) => {
  const { data } = await api.post('/users/register', { name, email, password });
  return data; // {_id, name, email, token}
};

// 👤 USER PROFILE
export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data; // {_id, name, email, isAdmin}
};

// 👑 ADMIN: Get all users
export const getUsers = async () => {
  const { data } = await api.get('/users');
  return data; // [{_id, name, email, isAdmin, createdAt}]
};

// 🔄 PASSWORD RESET FLOW
export const requestPasswordReset = async (email) => {
  const { data } = await api.post('/users/forgot-password', { email });
  return data; // {message}
};

export const resetPassword = async ({ email, token, password }) => {
  const { data } = await api.post('/users/reset-password', {
    email,
    token,
    password,
  });
  return data; // {message}
};

export default userAPI;
