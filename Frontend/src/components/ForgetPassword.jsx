import React from "react";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import useGeneral from "./hooks/useGeneral";
import axiosInstance from "../lib/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ForgetPassword() {
    const { navigate } = useGeneral();

    const initialState = {
        email: "",
    };

    const validationSchema = Yup.object().shape({
        email: Yup.string().email("Invalid email").required("Required"),
    });

    const handleSubmit = async (values) => {
        try {
            const res = await axiosInstance.post(
                "/users/forget-password",
                { email: values.email }
            );

            if (res.status === 200) {
                toast.success("OTP sent to your email!");

                setTimeout(() => {
                    navigate("/verify-otp", { state: { email: values.email } });
                }, 1000);
            }
        } catch (err) {
            toast.error(
                err.response?.data?.message || "Failed to send OTP!"
            );
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden">
            <ToastContainer />

            {/* Background Glow */}
            <div className="absolute w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] top-[-15%] left-[-10%] animate-pulse" />
            <div className="absolute w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[120px] bottom-[-20%] right-[-10%] animate-pulse" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Forgot Password
                    </h2>
                    <p className="text-white/50 text-sm">
                        Enter your email to receive a verification code
                    </p>
                </div>

                <Formik
                    initialValues={initialState}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, handleChange, handleBlur, touched, errors }) => (
                        <Form className="space-y-6">

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

                            {/* Send OTP Button */}
                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/40"
                            >
                                Send OTP
                            </button>

                            {/* Divider */}
                            <div className="text-center text-white/40 text-xs uppercase">
                                OR
                            </div>

                            {/* Back to Login */}
                            <button
                                type="button"
                                onClick={() => navigate("/login")}
                                className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 transition"
                            >
                                Back to Login
                            </button>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default ForgetPassword;
