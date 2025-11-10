import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({
  baseURL,
  timeout: 10000
});

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

export const fetchProducts = async (params = {}) => {
  const qs = buildQueryString(params);
  const { data } = await api.get(`/products${qs}`);
  return data; // {products, page, pages, total}
};

export const fetchProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const createProduct = async (product) => {
  const token = localStorage.getItem('token');
  const { data } = await api.post('/products', product, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  return data;
};

export const deleteProduct = async (id) => {
  const token = localStorage.getItem('token');
  const { data } = await api.delete(`/products/${id}`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  return data;
};

export const updateProduct = async (id, product) => {
  const token = localStorage.getItem('token');
  const { data } = await api.put(`/products/${id}`, product, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  return data;
};


