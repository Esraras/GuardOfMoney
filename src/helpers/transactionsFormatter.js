export function getFormattedTransactions(
  transactions,
  categories,
  sortConfig = { key: "date", direction: "desc" }
) {
  const formattedTransactions = transactions.map((transaction) =>
    getFormattedTransaction(transaction, categories)
  );

  return sortTransactions(formattedTransactions, sortConfig);
}

export function sortTransactions(transactions, sortConfig) {
  return [...transactions].sort((a, b) => {
    if (sortConfig.key === "date") {
      return sortConfig.direction === "asc"
        ? String(a.date || "").localeCompare(String(b.date || ""))
        : String(b.date || "").localeCompare(String(a.date || ""));
    } else if (sortConfig.key === "type") {
      return sortConfig.direction === "asc"
        ? String(a.type || "").localeCompare(String(b.type || ""))
        : String(b.type || "").localeCompare(String(a.type || ""));
    } else if (sortConfig.key === "category") {
      return sortConfig.direction === "asc"
        ? String(a.category || "").localeCompare(String(b.category || ""))
        : String(b.category || "").localeCompare(String(a.category || ""));
    } else if (sortConfig.key === "comment") {
      const aComment = a.comment || "";
      const bComment = b.comment || "";
      return sortConfig.direction === "asc"
        ? String(aComment).localeCompare(String(bComment))
        : String(bComment).localeCompare(String(aComment));
    } else if (sortConfig.key === "sum") {
      return sortConfig.direction === "asc" ? a.sum - b.sum : b.sum - a.sum;
    }

    return sortConfig.direction === "asc"
      ? String(a.date || "").localeCompare(String(b.date || ""))
      : String(b.date || "").localeCompare(String(a.date || ""));
  });
}

function getFormattedTransaction(transaction, categories) {
  const {
    transactionDate,
    date,
    amount: sum,
    categoryId,
    type,
    comment,
    description,
    id,
  } = transaction;

  const rawDate = transactionDate || date;
  const transactionDateValue = rawDate ? new Date(rawDate) : new Date();
  const category =
    type === "INCOME" ? "Income" : getCategoryName(categoryId, categories);

  const newTransaction = {
    id,
    date: transactionDateValue ? new Date(transactionDateValue) : new Date(),
    type: type || "",
    category,
    comment: comment || description || "",
    sum: Math.abs(sum || 0),
  };
  return newTransaction;
}

function getCategoryName(id, categories) {
  if (!categories || !id) return "Unknown";
  const cat = categories.find((item) => item.id === id);
  return cat?.name || "Unknown";
}

export function getHeadTransaction() {
  return ["date", "type", "category", "comment", "sum"];
}

export function getStyleByType(type) {
  const currentColor =
    type === "-" ? "var(--red-color)" : "var(--yellow-color)";
  return {
    color: currentColor,
  };
}
