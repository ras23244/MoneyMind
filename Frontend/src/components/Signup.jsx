import React, { useState } from "react";
import PasswordStrengthBar from "react-password-strength-bar";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useGeneral from "./hooks/useGeneral";

function Signup() {
    const { navigate } = useGeneral();
    const [showPassword, setShowPassword] = useState(false);

    const initialState = {
        name: "",
        email: "",
        password: "",
    };

    const validationSchema = Yup.object().shape({
        name: Yup.string().min(2, "Too Short!").required("Required"),
        email: Yup.string().email("Invalid email").required("Required"),
        password: Yup.string().min(6, "Too Short!").required("Required"),
    });

    const handleSubmit = async (values) => {
        try {
            const [firstname, ...rest] = values.name.trim().split(" ");
            const lastname = rest.join(" ") || " ";

            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}users/register`,
                {
                    fullname: { firstname, lastname },
                    email: values.email,
                    password: values.password,
                },
                { withCredentials: true }
            );

            if (res.status === 201) {
                toast.success("Registration successful!");
                navigate("/login");
            }
        } catch (err) {
            toast.error("Registration failed!");
        }
    };

    const handleGoogleSignup = () => {
        window.open(`${import.meta.env.VITE_BASE_URL}auth/google`, "_self");
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden">
            <ToastContainer />

            {/* Background Glow */}
            <div className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] top-[-10%] left-[-10%] animate-pulse" />
            <div className="absolute w-[600px] h-[600px] bg-green-400/10 rounded-full blur-[150px] bottom-[-20%] right-[-10%] animate-pulse" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Create Account
                    </h2>
                    <p className="text-white/50 text-sm">
                        Start your financial journey with MoneyMind.
                    </p>
                </div>

                <Formik
                    initialValues={initialState}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange, handleBlur, touched, errors }) => (
                        <Form className="space-y-5">
                            {/* Full Name */}
                            <div>
                                <label className="block text-xs uppercase text-white/50 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="John Doe"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                {touched.name && errors.name && (
                                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                                )}
                            </div>

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
                                    <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-xs uppercase text-white/50 mb-2">
                                    Password
                                </label>
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
                                    <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                                )}

                                <PasswordStrengthBar password={values.password} />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/40"
                            >
                                Create Account
                            </button>

                            {/* OR */}
                            <div className="text-center text-white/40 text-xs uppercase">
                                OR
                            </div>

                            {/* Google */}
                            <button
                                type="button"
                                onClick={handleGoogleSignup}
                                className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 transition"
                            >
                                Continue with Google
                            </button>

                            {/* Footer */}
                            <div className="text-center text-sm text-white/60 mt-6">
                                Already have an account?
                                <span
                                    onClick={() => navigate("/login")}
                                    className="text-emerald-400 ml-1 cursor-pointer hover:underline"
                                >
                                    Login
                                </span>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default Signup;
