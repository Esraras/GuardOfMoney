import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import {
  getTransactionSummary,
  getCategories,
} from "../../services/services-api.js";
import { setToken } from "../../config/userTransactionsApi.js";

export const getTransactionsSummaryByPeriod = createAsyncThunk(
  "statistics/getTransactionsSummaryByPeriod",
  async (params, thunkAPI) => {
    try {
      let token = thunkAPI.getState().auth.token;
      // If Redux rehydration hasn't run yet, try to read persisted token from localStorage
      if (!token) {
        try {
          const savedDataLocal = JSON.parse(localStorage.getItem("persist:auth"));
          const savedToken =
            savedDataLocal?.token === "null"
              ? null
              : savedDataLocal?.token?.slice(1, -1);
          token = savedToken || null;
        } catch (err) {
          token = null;
        }
      }

      if (!token) {
        throw new Error("No token found");
      }
      setToken(token);
      const data = await getTransactionSummary(params);

      if (!Array.isArray(data)) {
        return data;
      }

      const categoriesSummary = data.reduce((acc, transaction) => {
        const total = Number(transaction.amount || 0);
        const categoryId = transaction.categoryId || "unknown";
        const categoryName =
          transaction.category?.name ||
          (transaction.type === "INCOME" ? "Income" : "Other");
        const categoryIcon = transaction.category?.icon || "";

        if (!acc[categoryId]) {
          acc[categoryId] = {
            categoryId,
            name: categoryName,
            icon: categoryIcon,
            total: 0,
          };
        }

        acc[categoryId].total += total;
        return acc;
      }, {});

      const summaryArray = Object.values(categoriesSummary);
      const periodTotal = summaryArray.reduce(
        (sum, item) => sum + Number(item.total || 0),
        0
      );

      return { categoriesSummary: summaryArray, periodTotal };
    } catch (error) {
      toast.error(error.response?.data?.message || "İşlem özeti alınamadı");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getTransactionsCategories = createAsyncThunk(
  "statistics/getTransactionsCategories",
  async (_, thunkAPI) => {
    try {
      let token = thunkAPI.getState().auth.token;
      if (!token) {
        try {
          const savedDataLocal = JSON.parse(localStorage.getItem("persist:auth"));
          const savedToken =
            savedDataLocal?.token === "null"
              ? null
              : savedDataLocal?.token?.slice(1, -1);
          token = savedToken || null;
        } catch (err) {
          token = null;
        }
      }

      if (!token) {
        throw new Error("No token found");
      }
      setToken(token);
      const data = await getCategories();
      return data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Categories could not be retrieved"
      );
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);