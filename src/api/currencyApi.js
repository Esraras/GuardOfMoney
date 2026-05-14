import axios from "axios";

const ROOT = import.meta.env.VITE_API_URL || "https://guard-of-money.vercel.app";
const API_BASE_URL = `${ROOT.replace(/\/?$/, "")}/api`;
const CACHE_KEY = "currencyRatesCache";
const CACHE_DURATION = 3600000; // 1 hour

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    try {
      const tokenData = localStorage.getItem("persist:auth");
      if (tokenData) {
        const token = JSON.parse(JSON.parse(tokenData).token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Token parsing error:", error.message);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/current");
    return response.data;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to get current user:", error.message);
    }
    throw error;
  }
};

const FALLBACK_RATES = [
  { currencyCodeA: 840, currencyCodeB: 980, rateBuy: 32.5, rateSell: 32.7 }, // USD
  { currencyCodeA: 978, currencyCodeB: 980, rateBuy: 35.1, rateSell: 35.4 }, // EUR
];

export const getCurrencyRates = async () => {
  try {
    // Try to get cached data first
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const { timestamp, rates } = JSON.parse(cachedData);
        if (new Date().getTime() - timestamp < CACHE_DURATION) {
          return rates;
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("Cache parse error:", error.message);
        }
      }
    }

    // Fetch fresh data from backend API
    try {
      const response = await axios.get(`${API_BASE_URL}/currency-rates`, {
        timeout: 5000,
      });

      const rawRates = Array.isArray(response.data)
        ? response.data
        : response.data?.rates || response.data?.data || [];

      const finalRates = (Array.isArray(rawRates) ? rawRates : [])
        .filter(
          (rate) =>
            (rate.currencyCodeA === 840 || rate.currencyCodeA === 978) &&
            rate.currencyCodeB === 980
        )
        .map((rate) => ({
          currencyCodeA: rate.currencyCodeA,
          currencyCodeB: rate.currencyCodeB,
          rateBuy: parseFloat(rate.rateBuy),
          rateSell: parseFloat(rate.rateSell),
        }))
        .filter((rate) => !isNaN(rate.rateBuy) && !isNaN(rate.rateSell));

      if (finalRates.length >= 2) {
        // Cache the fresh data
        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({
              timestamp: new Date().getTime(),
              rates: finalRates,
            })
          );
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn("Failed to cache rates:", error.message);
          }
        }
        return finalRates;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("Currency rates API error:", error.message);
      }
    }

    // Return fallback rates if everything fails
    return FALLBACK_RATES;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Currency rates error:", error.message);
    }
    return FALLBACK_RATES;
  }
};

