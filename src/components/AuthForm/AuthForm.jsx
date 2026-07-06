import { Formik, Form } from "formik";
import { Link, useNavigate } from "react-router-dom";
import { googleLogin } from "../../redux/auth/operations";
import { GoogleLogin } from "@react-oauth/google";
import { Icon } from "../../Icons";
import CustomField from "../CustomField/CustomField";
import Bar from "../Bar/Bar";
import style from "./authForm.module.css";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useState } from "react";

const AuthForm = ({ type, validationSchema, initialValues, onSubmit }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const credential = credentialResponse?.credential;
    if (!credential) {
      toast.error("Google login did not return a valid token.");
      setLoading(false);
      return;
    }

    try {
      const data = await dispatch(googleLogin(credential)).unwrap();
      toast.success(`Welcome back, ${data.user.name || data.user.email}!`);
      navigate("/dashboard");
    } catch (authError) {
      toast.error(authError || "Google login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    toast.error("Google login failed or was cancelled.");
    setError(error?.message || String(error));
    setLoading(false);
  };

  return (
    <div
      className={`${type === "register" ? style.register : style.login} ${
        style.formWrapper
      }`}
    >
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}
      >
        {({ values: { confirmPassword, password } }) => (
          <Form className={style.form}>
            <Icon id="#icon-logo_mobile" className={style.icon_mob}></Icon>
            {type == "register" && (
              <CustomField type="text" name="username" placeholder="Name" />
            )}
            <CustomField type="text" name="email" placeholder="E-mail" />
            <CustomField
              type="password"
              name="password"
              placeholder="Password"
            />
            {type === "register" && (
              <CustomField
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
              />
            )}
            {type === "register" && (
              <Bar password={password} confirmPassword={confirmPassword} />
            )}

            <button
              className={`${style.button_main} ${style.colored} `}
              type="submit"
            >
              {type === "register" ? "Register" : "Login"}
            </button>

            <Link to={type === "register" ? "/login" : "/register"}>
              <button
                className={`${style.button_secondary} ${style.whiteButton}`}
                type="button"
              >
                {type === "register" ? "Login" : "Register"}
              </button>
            </Link>

            <div
              className={style.googleButtonContainer}
              style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_blue" // Tasarımına göre: "outline", "filled_blue", veya "filled_black" yapabilirsin
                shape="pill" // Buton köşeleri: "rectangular", "pill", "circle", "square"
                size="large" // Boyut: "small", "medium", "large"
                text="signin_with" // Buton metni: "signin_with", "signup_with", "continue_with"
                width="300px" // Diğer butonlarının genişliğine eşitlemek için burayı px cinsinden ayarlayabilirsin
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AuthForm;
