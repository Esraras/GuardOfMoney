import { userTransactionsApi } from "../config/userTransactionsApi";

// Get all transactions (statistics will use the transactions endpoint)
export const getTransactionSummary = async (params) => {
  const { data } = await userTransactionsApi.get("/transactions", {
    params,
  });
  return data;
};

// Get categories
export const getCategories = async () => {
  const { data } = await userTransactionsApi.get("/categories");
  return data;
};

export const getTransactionsCategories = async () => {
  const { data } = await userTransactionsApi.get("/categories");
  return data;
};