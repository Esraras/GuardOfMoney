import styles from "./AddTransactionForm.module.css";
import { useEffect, useState } from "react";
import clsx from "clsx";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  selectCategories,
  selectStatError,
  selectStatLoading,
} from "../../redux/Statistics/selectors";
import { useSelector, useDispatch } from "react-redux";
import Select from "react-select";
import { customStyles } from "./customStyles";
import { addTransactions } from "../../redux/transactions/operations";
import { closeAddModal } from "../../redux/Modals/slice";
import { getTransactionsCategories } from "../../redux/Statistics/operations";
import CustomDropIndicator from "../CustomDropIndicator/CustomDropIndicator";
import { toast } from "react-toastify";

function AddTransactionForm() {
  const categoriesFromAPI = useSelector(selectCategories);
  const categoriesLoading = useSelector(selectStatLoading);
  const categoriesError = useSelector(selectStatError);
  const dispatch = useDispatch();

  useEffect(() => {
    if (
      !categoriesLoading &&
      !categoriesError &&
      (!categoriesFromAPI || categoriesFromAPI.length === 0)
    ) {
      dispatch(getTransactionsCategories());
    }
  }, [categoriesFromAPI, categoriesError, categoriesLoading, dispatch]);

  const categories = categoriesFromAPI || [];
  const [isChecked, setIsChecked] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const handleChange = () => {
    setIsChecked(!isChecked);
  };

  const categoriesForSelect = categories
    .filter((category) => category.name?.toLowerCase() !== "income")
    .map((category) => ({
      value: category.id,
      label: category.name,
    }));

  const selectDefaultValue = categoriesForSelect.find(
    (item) => item.label === "Main expenses",
  );

  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (!selectedOption && selectDefaultValue) {
      setSelectedOption(selectDefaultValue);
    }
  }, [selectedOption, selectDefaultValue]);

  const currentDate = new Date();

  const schema = yup.object().shape({
    amount: yup.number().required("Number invalid value"),
    date: yup
      .date()
      .required("Date is required")
      .default(() => currentDate),
    switch: yup.boolean(),
    category: yup.string(),
    description: yup.string().required("Enter a comment"),
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      date: currentDate,
      switch: false,
      description: "",
    },
  });

  const onSubmit = (data) => {
    if (!categories || categories.length === 0) {
      toast.error("Categories are not loaded yet. Please wait and try again.");
      return;
    }

    if (!isChecked) {
      // Income
      const incomeCategory = categories.find(
        (el) =>
          el.type === "INCOME" ||
          el.name?.toLowerCase() === "income"
      );

      if (!incomeCategory) {
        toast.error("Income category not found");
        return;
      }

      data.categoryId = incomeCategory.id;
      data.type = "INCOME";
      data.amount = Math.abs(data.amount);
    } else {
      // Expense
      if (selectedOption) {
        data.categoryId = selectedOption.value;
      } else {
        toast.error("Please select an expense category");
        return;
      }
      data.type = "EXPENSE";
      data.amount = Math.abs(data.amount) * -1;
    }

    dispatch(addTransactions(data))
      .unwrap()
      .then(() => {
        toast.success("Transaction added successfully");
        dispatch(closeAddModal());
      })
      .catch((error) => {
        toast.error(error || "Failed to add transaction");
      });
  };

  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const handleMenuOpen = () => {
    setMenuIsOpen(true);
  };

  const handleMenuClose = () => {
    setMenuIsOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <div className={styles.switch__wrapper}>
        <span
          className={clsx(styles.span_text, !isChecked && styles.income_active)}
        >
          Income
        </span>
        <label htmlFor="switch" className={styles.switch}>
          <input
            {...register("switch")}
            type="checkbox"
            id="switch"
            checked={isChecked}
            onChange={handleChange}
            className={styles.switch__input}
          />
          <span className={styles.switch__slider}></span>
        </label>
        <span
          className={clsx(styles.span_text, isChecked && styles.expense_active)}
        >
          Expense
        </span>
      </div>
      {isChecked && (
        <div className={styles.comment}>
          {categoriesLoading ? (
            <div className={styles.comment_err}>Loading categories...</div>
          ) : categoriesError ? (
            <div className={styles.comment_err}>Failed to load categories</div>
          ) : categoriesForSelect.length === 0 ? (
            <div className={styles.comment_err}>
              No categories available. Please create categories first.
            </div>
          ) : (
            <Select
              classNamePrefix="react-select"
              styles={customStyles}
              className={styles.select_form}
              value={selectedOption}
              onChange={setSelectedOption}
              options={categoriesForSelect}
              placeholder="Select a category"
              onMenuOpen={handleMenuOpen}
              onMenuClose={handleMenuClose}
              components={{
                DropdownIndicator: () => {
                  return menuIsOpen ? (
                    <CustomDropIndicator up={true} />
                  ) : (
                    <CustomDropIndicator up={false} />
                  );
                },
              }}
            />
          )}
        </div>
      )}
      <div className={styles.sum_data_wrap}>
        <div className={styles.sum_wrap}>
          <input
            {...register("amount")}
            type="number"
            autoComplete="off"
            placeholder="0.00"
            className={styles.sum}
            autoFocus
            onKeyPress={(event) => {
              if (!/[0-9.]/.test(event.key)) {
                event.preventDefault();
              }
            }}
          />
          {errors.amount && (
            <span className={styles.comment_err}>{"Enter a number"}</span>
          )}
        </div>
        <div
          className={styles.data_wrap}
          onClick={() => setIsDatePickerOpen(true)}
        >
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <>
                <DatePicker
                  selected={field.value || currentDate}
                  onChange={(date) => field.onChange(date)}
                  dateFormat="dd.MM.yyyy"
                  open={isDatePickerOpen}
                  onClickOutside={() => setIsDatePickerOpen(false)}
                  className={styles.customDatePicker}
                  calendarClassName={styles.calendarClassName}
                  maxDate={currentDate}
                  showPopperArrow={false}
                  popperClassName={styles.calendarPopper}
                  locale={enUS}
                  renderCustomHeader={({
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                  }) => (
                    <div className={styles.customHeader}>
                      <button
                        type="button"
                        onClick={decreaseMonth}
                        disabled={prevMonthButtonDisabled}
                        className={styles.navButton}
                      >
                        {"<"}
                      </button>
                      <div className={styles.currentMonth}>
                        {date.toLocaleString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <button
                        type="button"
                        onClick={increaseMonth}
                        disabled={nextMonthButtonDisabled}
                        className={styles.navButton}
                      >
                        {">"}
                      </button>
                    </div>
                  )}
                />
              </>
            )}
          />
          <div className={styles.svg_wrap}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <g clipPath="url(#clip0_60_133)">
                <path
                  d="M9 11H7V13H9V11ZM13 11H11V13H13V11ZM17 11H15V13H17V11ZM19 4H18V2H16V4H8V2H6V4H5C3.89 4 3.01 4.9 3.01 6L3 20C3 21.1 3.89 22 5 22H19C20.1 22 21 21.1 21 20V6C21 4.9 20.1 4 19 4ZM19 20H5V9H19V20Z"
                  fill="#734AEF"
                />
              </g>
              <defs>
                <clipPath id="clip0_60_133">
                  <rect width="24" height="24" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <div className={clsx(styles.comment_bottom)}>
        <input
          {...register("description")}
          type="text"
          className={styles.input}
          placeholder="Comment"
          autoComplete="off"
        />
        {errors.description && (
          <span className={styles.comment_err}>
            {errors.description.message}
          </span>
        )}
      </div>
      <button className={clsx(styles.btn, styles.btn_add)} type="submit">
        Add
      </button>
      <button
        className={clsx(styles.btn, styles.btn_cancel)}
        type="button"
        onClick={() => {
          dispatch(closeAddModal());
        }}
      >
        Cancel
      </button>
    </form>
  );
}

export default AddTransactionForm;
