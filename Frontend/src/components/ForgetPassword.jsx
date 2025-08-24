import React from 'react';
import { useState } from 'react';
import './Login.css';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import TextField from "@mui/material/TextField";
import Divider from '@mui/material/Divider';
import useGeneral from './hooks/useGeneral';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ForgetPassword() {
    const { navigate } = useGeneral();

    const initialState = {
        email: '',

    }

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required'),
    });

    const handleSubmit = async (values) => {
        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}users/forget-password`,
                { email: values.email || localStorage.getItem('email') }
            );
            if (res.status === 200) {
                toast.success('OTP sent to your email!');
                localStorage.setItem('email', values.email || localStorage.getItem('email'));
                setTimeout(() => {
                    navigate('/verify-otp');
                }, 1000);
            }


        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Failed to send OTP. Please try again.'
            );
        }
    };

    return (
        <div className="login-container">
            <ToastContainer />
            <div className="login-left">
                <div className="login-form-wrapper">
                    <div className="logo-container">
                        <div className="logo">
                            <span className="logo-icon">O</span>
                        </div>
                    </div>

                    <div className="form-header">
                        <h1>Get Started</h1>
                        <p>Welcome to Filianta - Let's Find your account</p>
                    </div>

                    <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ values, handleChange, handleBlur, touched, errors }) => (
                            <Form className="login-form">

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <TextField
                                        type="email"
                                        id="email"
                                        name="email"
                                        label="Email"
                                        fullWidth
                                        variant="outlined"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                    />
                                </div>

                                <button

                                    type="submit" className="signup-btn">
                                    Send OTP
                                </button>

                                <Divider className='pt-2'>OR</Divider>
                                <button
                                    onClick={() => navigate('/login')}
                                    type="button"
                                    className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
                                >
                                    Back to Login
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>

        </div>
    );
}

export default ForgetPassword;