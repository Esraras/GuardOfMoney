import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  userTransactionsApi,
  setToken,
  removeToken,
} from "../../config/userTransactionsApi";

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (credentials, thunkApi) => {
    try {
      const { data } = await userTransactionsApi.post(
        "/auth/sign-up",
        credentials
      );
      setToken(data.token);
      return data;
    } catch (error) {
      const serverData = error.response?.data;
      const serverMsg =
        serverData?.message || (serverData ? JSON.stringify(serverData) : null);
      return thunkApi.rejectWithValue(serverMsg || error.message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials, thunkAPI) => {
    try {
      const { data } = await userTransactionsApi.post(
        "/auth/sign-in",
        credentials
      );
      setToken(data.token);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (credential, thunkAPI) => {
    try {
      const { data } = await userTransactionsApi.post("/auth/google-login", {
        credential,
      });

      setToken(data.token);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || error.message || String(error)
      );
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, thunkApi) => {
    try {
      const { data } = await userTransactionsApi.delete("/auth/sign-out");
      removeToken();
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const refreshThunk = createAsyncThunk(
  "auth/refresh",
  async (_, thunkApi) => {
    const savedToken = thunkApi.getState().auth.token;
    if (savedToken) {
      setToken(savedToken);
    } else {
      return thunkApi.rejectWithValue("Token doesn't exist");
    }

    try {
      const { data } = await userTransactionsApi.get("/auth/current");
      return data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

export const getBalanceThunk = createAsyncThunk(
  "getBalance",
  async (_, thunkApi) => {
    try {
      const { data } = await userTransactionsApi.get("/auth/current");
      return data.balance;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);
