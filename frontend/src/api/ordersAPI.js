import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const getMyOrders = async () => {
  const { data } = await api.get('/orders/mine');
  return data; // expected: array of orders
};

export const getAllOrders = async () => {
  const { data } = await api.get('/orders');
  return data;
};

export const markOrderDelivered = async (id) => {
  const { data } = await api.put(`/orders/${id}/deliver`);
  return data;
};

export default api;
