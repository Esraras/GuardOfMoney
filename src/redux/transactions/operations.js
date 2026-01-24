import { createAsyncThunk } from "@reduxjs/toolkit";
import { userTransactionsApi, setToken } from "../../config/userTransactionsApi";
import { getBalanceThunk } from "../auth/operations";
import { getTransactionsSummaryByPeriod } from "../Statistics/operations";

// Get all transactions
export const getTransactions = createAsyncThunk(
  "transactions/all",
  async (_, thunkApi) => {
    try {
      const token = thunkApi.getState().auth.token;
      if (!token) {
        throw new Error("No token found");
      }
      setToken(token);
      const { data } = await userTransactionsApi.get("/transactions");
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch transactions"
      );
    }
  }
);

// Add transaction
export const addTransactions = createAsyncThunk(
  "transactions/add",
  async (transaction, thunkApi) => {
    try {
      const token = thunkApi.getState().auth.token;
      if (!token) {
        throw new Error("No token found");
      }
      setToken(token);
      const { data } = await userTransactionsApi.post(
        "/transactions",
        transaction
      );
      // Refresh balance and statistics after adding
      thunkApi.dispatch(getBalanceThunk());
      thunkApi.dispatch(getTransactionsSummaryByPeriod());
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to add transaction"
      );
    }
  }
);

// Delete transaction
export const deleteTransactions = createAsyncThunk(
  "transactions/delete",
  async (id, thunkApi) => {
    try {
      const token = thunkApi.getState().auth.token;
      if (!token) {
        throw new Error("No token found");
      }
      setToken(token);
      await userTransactionsApi.delete(`/transactions/${id}`);
      // Refresh data after deletion
      thunkApi.dispatch(getBalanceThunk());
      thunkApi.dispatch(getTransactions());
      thunkApi.dispatch(getTransactionsSummaryByPeriod());
      return id;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete transaction"
      );
    }
  }
);

// Edit transaction
export const editTransactions = createAsyncThunk(
  "transactions/edit",
  async ({ id, transaction }, thunkApi) => {
    try {
      const token = thunkApi.getState().auth.token;
      if (!token) {
        throw new Error("No token found");
      }
      setToken(token);

      const response = await userTransactionsApi.patch(
        `/transactions/${id}`,
        transaction
      );

      if (!response.data) {
        throw new Error("No data received from API");
      }

      // Refresh data after edit
      thunkApi.dispatch(getBalanceThunk());
      thunkApi.dispatch(getTransactions());
      thunkApi.dispatch(getTransactionsSummaryByPeriod());

      return response.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to edit transaction"
      );
    }
  }
);

// Fetch transactions by category
export const fetchTransactionsByCategory = createAsyncThunk(
  "transactions/fetchByCategory",
  async (category, thunkApi) => {
    try {
      const token = thunkApi.getState().auth.token;
      if (!token) {
        throw new Error("No token found");
      }
      setToken(token);
      const { data } = await userTransactionsApi.get(
        `/transactions/category/${category}`
      );
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch category transactions"
      );
    }
  }
);
