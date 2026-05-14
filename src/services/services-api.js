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
export const getBudgets = async (params) => {
  const { data } = await userTransactionsApi.get("/budgets", {
    params,
  });
  return data;
};

export const createBudget = async (budgetData) => {
  const { data } = await userTransactionsApi.post("/budgets", budgetData);
  return data;
};

export const updateBudget = async (id, budgetData) => {
  const { data } = await userTransactionsApi.patch(`/budgets/${id}`, budgetData);
  return data;
};

export const deleteBudget = async (id) => {
  const { data } = await userTransactionsApi.delete(`/budgets/${id}`);
  return data;
};
export const getTransactionsCategories = async () => {
  const { data } = await userTransactionsApi.get("/categories");
  return data;
};