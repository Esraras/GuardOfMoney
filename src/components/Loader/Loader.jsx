import { memo } from "react";
import { Vortex } from "react-loader-spinner";
import styles from "./Loader.module.css";

const LOADER_COLORS = [
  "#1E4D2B",
  "#173721",
  "#A3BBA2",
  "#E5E4E2",
];

const Loader = () => {
  return (
    <div className={styles.loaderContainer}>
      <Vortex
        visible
        height="80"
        width="80"
        ariaLabel="vortex-loading"
        wrapperStyle={{}}
        wrapperClass="vortex-wrapper"
        colors={LOADER_COLORS}
      />
    </div>
  );
};

export default memo(Loader);