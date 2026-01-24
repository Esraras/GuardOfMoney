import { memo } from "react";
import { Vortex } from "react-loader-spinner";
import styles from "./Loader.module.css";

const LOADER_COLORS = [
  "#FFB627",
  "#9E40BA",
  "#7000FF",
  "#4A56E2",
  "#FFC727",
  "#734AEF",
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