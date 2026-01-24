import { memo } from "react";
import css from "./Balance.module.css";
import { selectUserBalance } from "../../redux/auth/selectors.js";
import { useSelector } from "react-redux";

const Balance = () => {
  const balance = useSelector(selectUserBalance);

  return (
    <div className={css.balanceCard}>
      <div className={css.balanceContent}>
        <span className={css.label}>YOUR BALANCE</span>
        <div className={css.amountRow}>
          <span className={css.currency}>₴</span>
          <span className={css.balance}>{balance}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(Balance);
