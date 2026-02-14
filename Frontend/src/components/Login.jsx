import React, { useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import useGeneral from "./hooks/useGeneral";
import axiosInstance from "../lib/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUser } from "../context/UserContext";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { navigate } = useGeneral();
  const { login } = useUser();

  const initialState = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Too Short!").required("Required"),
  });

  const handleSubmit = async (values) => {
    try {
      const res = await axiosInstance.post(
        '/users/login',
        {
          email: values.email,
          password: values.password,
        }
      );

      if (res.status === 200) {
        toast.success("Login successful!");
        login(res.data.user);

        if (
          Array.isArray(res.data.user.bankAccounts) &&
          res.data.user.bankAccounts.length > 0
        ) {
          navigate("/dashboard");
        } else {
          navigate("/link-bank-account");
        }
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed!";
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden">
      <ToastContainer />

      {/* Background Glow */}
      <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] top-[-15%] left-[-10%] animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[120px] bottom-[-20%] right-[-10%] animate-pulse" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-white/50 text-sm">
            Login to continue your MoneyMind journey.
          </p>
        </div>

        <Formik
          initialValues={initialState}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, handleBlur, touched, errors }) => (
            <Form className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs uppercase text-white/50 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                {touched.email && errors.email && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase text-white/50">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forget-password")}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 pr-12 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                  >
                    {showPassword ? "🙈" : "👁"}
                  </button>
                </div>

                {touched.password && errors.password && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.password}
                  </p>
                )}

                <PasswordStrengthBar
                  className="mt-3"
                  password={values.password}
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/40"
              >
                Login
              </button>

              {/* OR */}
              <div className="text-center text-white/40 text-xs uppercase">
                OR
              </div>

              {/* Google Login */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-3"
              >
                Continue with Google
              </button>

              {/* Footer */}
              <div className="text-center text-sm text-white/60 mt-6">
                Don't have an account?
                <span
                  onClick={() => navigate("/signup")}
                  className="text-emerald-400 ml-1 cursor-pointer hover:underline"
                >
                  Sign up
                </span>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
