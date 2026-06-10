export const customStyles = {
  option: (provided) => ({
    ...provided,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: "18px",
    fontWeight: "400",
    color: "#010B13",
    backgroundColor: "transparent",
    cursor: "pointer",
    "&:hover": {
     background:
      "linear-gradient(0deg, rgba(128, 139, 128, 0.8) 0%, rgba(130, 165, 132, 0.8) 36%, rgba(107, 126, 108, 0.8), rgba(96, 146, 99, 0.8) 100%)",
   
      color: "#010B13",
      fontWeight: "400",
    },
    textAlign: "left",
  }),

  control: (styles) => ({
    ...styles,
    color: "#010B13",
    fontFamily: "Poppins",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: "400",
    lineHeight: "normal",
    boxShadow: "none",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(255, 255, 255, 0.4)",
    display: "flex",
    flexWrap: "nowrap",
    outline: "transparent",
    padding: "0 8px",
  }),

  singleValue: (provided, state) => ({
    ...provided,
    opacity: state.isDisabled ? 0.5 : 1,
    transition: "opacity 300ms",
    color: "#010B13",
    padding: "0",
    "@media screen and (max-width: 767.98px)": {
      paddingLeft: "9px",
    },
  }),

  menu: (provided) => ({
    ...provided,
    background:
      "linear-gradient(0deg, rgba(172, 248, 176, 0.8) 0%, rgba(136, 192, 140, 0.8) 36%, rgba(124, 199, 129, 0.8), rgba(126, 185, 130, 0.8) 100%)",
    borderRadius: "8px",
    backdropFilter: "blur(50px)",
    overflow: "hidden",
  }),

  menuList: (base) => ({
    ...base,
    "::-webkit-scrollbar": {
      display: "none",
    },
    scrollbarWidth: "none",
    paddingTop: "0px",
  }),

  valueContainer: (val) => ({
    ...val,
    padding: "0",
  }),

  placeholder: (provider) => ({
    ...provider,
    color: "rgba(1, 11, 19, 0.60)",
  }),

  input: (provided) => ({
    ...provided,
    margin: "0",
    color: "#010B13",
    minWidth: "100%",
    caretColor: "transparent",
  }),

  indicatorSeparator: () => ({
    display: "none",
  }),

  indicators: () => ({
    cursor: "pointer",
  }),
};
