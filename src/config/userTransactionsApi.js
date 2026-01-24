import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const userTransactionsApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Add timeout for better error handling
});

// Add response interceptor for better error handling
userTransactionsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log only in development
    if (import.meta.env.DEV) {
      console.error("API Error:", error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

export const setToken = (token) => {
  if (token) {
    userTransactionsApi.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

export const removeToken = () => {
  delete userTransactionsApi.defaults.headers.common.Authorization;
};

