import axios from 'axios';

// ✅ REMOVE '/api' from here
const api = axios.create({
  baseURL: 'https://olg-backend.onrender.com', 
});

// Automatically attach Token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
