import axios from 'axios';

// ✅ FIX: We added '/api' to the end so it matches your server
const BASE_URL = window.location.hostname === 'localhost'
  ? "http://localhost:10000/api"           // Local: localhost:10000/api
  : "https://olg-backend.onrender.com/api"; // Live: ...onrender.com/api

const api = axios.create({
  baseURL: BASE_URL, 
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
