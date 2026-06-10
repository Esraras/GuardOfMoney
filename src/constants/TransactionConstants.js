import { ca } from "date-fns/locale";

const mapCategoriesToOptions = (categories = []) =>
  categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

const getTransactionId = (transactionCategory, categories = []) => {
  const transactionTargeted = categories.find(
    (item) => item.name === transactionCategory,
  );

  return transactionTargeted?.id || null;
};

const getTransactionCategory = (transactionId, categories = []) => {
  const transactionTargeted = categories.find(
    (item) => item.id === transactionId,
  );

  return transactionTargeted?.name || "Unknown";
};

const formatData = (unixData) => {
  const year = new Date(unixData).getFullYear();
  const mounth = new Date(unixData).getMonth() + 1;
  const day = new Date(unixData).getDate();

  const doubleDigitsFormatMounth = String(mounth).padStart(2, 0);
  const doubleDigitsFormatDay = String(day).padStart(2, 0);

  return `${doubleDigitsFormatDay}.${doubleDigitsFormatMounth}.${year}`;
};

const Months_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();

const YEARS_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

const getTrasactionCategoryColor = (category) => {
  switch (category) {
    case "Ana Harcamalar":
      return "#fac686";

    case "Ürün":
      return "#e792a9";

    case "Araba":
      return "#ee866c";

    case "Özbakım":
      return "#9187c4";

    case "Çocuk Bakım":
      return "#96db93";

    case "Ev Giderleri":
      return "#41586e";

    case "Eğitim":
      return "#7fc5c5";

    case "Gündelik":
      return "#8d5230";

    case "Diğer":
      return "#f89861";

    case "Eğlence":
      return "#99415e";

    case "Income":
      return "#f0f76b";

    default:
      return "rgb(163, 144, 144)";
  }
};

export {
  mapCategoriesToOptions,
  getTransactionId,
  getTransactionCategory,
  formatData,
  Months_OPTIONS,
  YEARS_OPTIONS,
  getTrasactionCategoryColor,
};
