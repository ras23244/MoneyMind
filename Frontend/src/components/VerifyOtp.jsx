import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import Countdown from "react-countdown";
import { MdVerifiedUser } from "react-icons/md";
import useGeneral from "./hooks/useGeneral";
import axiosInstance from "../lib/axiosInstance";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyOtp = () => {
    const [timerKey, setTimerKey] = useState(0);
    const [isResendEnabled, setIsResendEnabled] = useState(false);
    const { navigate } = useGeneral();
    const location = useLocation();
    const email = location.state?.email;

    const inputRefs = useRef([]);

    const otpFields = ["otp1", "otp2", "otp3", "otp4", "otp5", "otp6"];

    const initialState = otpFields.reduce((acc, k) => ({ ...acc, [k]: "" }), {});

    const validationSchema = Yup.object(
        otpFields.reduce(
            (acc, k) => ({ ...acc, [k]: Yup.string().required() }),
            {}
        )
    );

    const handleOtpChange = (e, index, setFieldValue) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setFieldValue(otpFields[index], value);

        if (value && index < otpFields.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !e.target.value && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const restartTimer = () => {
        setTimerKey((k) => k + 1);
        setIsResendEnabled(false);
    };

    const submitHandler = async (values) => {
        try {
            const otp = otpFields.map((k) => values[k]).join("");
            const res = await axiosInstance.post("/users/verify-otp", { otp });

            if (res.status === 200) {
                toast.success("OTP verified successfully!");
                setTimeout(() => {
                    navigate("/update-password", { state: { email } });
                }, 1000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "OTP verification failed!");
        }
        restartTimer();
    };

    const resendHandler = async () => {
        try {
            if (!email) {
                navigate("/forget-password");
                return;
            }
            await axiosInstance.post("/users/forget-password", { email });
            toast.success("OTP resent!");
            restartTimer();
        } catch {
            toast.error("Failed to resend OTP");
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
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Verify OTP
                    </h2>
                    <p className="text-white/50 text-sm">
                        Enter the 6-digit code sent to your email
                    </p>
                </div>

                <Formik
                    initialValues={initialState}
                    validationSchema={validationSchema}
                    onSubmit={submitHandler}
                >
                    {({ values, setFieldValue, handleBlur }) => (
                        <Form className="space-y-6">
                            {/* OTP Inputs */}
                            <div className="flex justify-center gap-3">
                                {otpFields.map((name, index) => (
                                    <input
                                        key={name}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        value={values[name]}
                                        onChange={(e) =>
                                            handleOtpChange(e, index, setFieldValue)
                                        }
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onBlur={handleBlur}
                                        maxLength={1}
                                        className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <button
                                type="submit"
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/40 flex items-center justify-center gap-2"
                            >
                                <MdVerifiedUser size={20} />
                                Verify OTP
                            </button>

                            {/* Timer / Resend */}
                            <div className="text-center text-white/50 text-sm">
                                <Countdown
                                    key={timerKey}
                                    date={Date.now() + 60 * 1000}
                                    renderer={({ minutes, seconds, completed }) => {
                                        if (completed) {
                                            setTimeout(() => setIsResendEnabled(true), 0);
                                            return null;
                                        }
                                        return (
                                            <span>
                                                Resend in {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                                            </span>
                                        );
                                    }}
                                />
                            </div>

                            {isResendEnabled && (
                                <button
                                    type="button"
                                    onClick={resendHandler}
                                    className="w-full bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 transition"
                                >
                                    Resend OTP
                                </button>
                            )}

                            {/* Back */}
                            <div className="text-center text-sm text-white/60 mt-4">
                                <span
                                    onClick={() => navigate("/login")}
                                    className="cursor-pointer hover:text-emerald-400"
                                >
                                    Back to Login
                                </span>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default VerifyOtp;
