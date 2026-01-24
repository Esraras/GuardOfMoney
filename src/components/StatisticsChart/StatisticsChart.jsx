import "animate.css";
import { useMemo, memo } from "react";
import { Doughnut } from "react-chartjs-2";
import "chart.js/auto";

import { useSelector } from "react-redux";
import styles from "./StatisticsChart.module.css";
import {
  selectSummary,
  selectPeriodTotal,
  selectStatLoading,
} from "../../redux/Statistics/selectors";
import { getTrasactionCategoryColor } from "../../constants/TransactionConstants";
import LoadingSpinner from "../common/LoadingSpinner/Loader";

const StatisticsChart = () => {
  const isLoading = useSelector(selectStatLoading);
  const balanceForSpecificPeriod = useSelector(selectPeriodTotal);
  const filteredCategories = useSelector(selectSummary) || [];

  // Memoize expensive calculations
  const { chartData, chartOptions, formattedBalance } = useMemo(() => {
    const formatNumber = (balanceAmount) => {
      if (balanceAmount === undefined || balanceAmount === null) return "0.00";
      return balanceAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const chartLabels = filteredCategories.length
      ? filteredCategories.map((item) => item.name)
      : ["There is no data for selected date"];

    const chartValues = filteredCategories.length
      ? filteredCategories.map((item) => (item.total ? item.total * -1 : 0))
      : [100];

    const chartBackgroundColors = filteredCategories.length
      ? filteredCategories.map((item) => getTrasactionCategoryColor(item.name))
      : ["rgba(255, 255, 255, 0.6)"];

    return {
      chartData: {
        labels: chartLabels,
        datasets: [
          {
            data: chartValues,
            backgroundColor: chartBackgroundColors,
            borderWidth: 0,
            hoverOffset: 5,
          },
        ],
      },
      chartOptions: {
        cutout: "70%",
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
          },
        },
        elements: {
          arc: {
            hoverOffset: 4,
          },
        },
      },
      formattedBalance: formatNumber(
        balanceForSpecificPeriod
          ? balanceForSpecificPeriod.toFixed(2)
          : "0.00"
      ),
    };
  }, [filteredCategories, balanceForSpecificPeriod]);

  const textAnimatioClasses =
    "animate__animated  animate__zoomIn animate__slow";

  return (
    <div className={styles.chartContainer}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div style={{ width: "100%", height: "100%" }}>
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div className={`${styles.balance} ${textAnimatioClasses}`}>
            ₺ {formattedBalance}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(StatisticsChart);
