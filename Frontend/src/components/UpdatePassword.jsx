import React from 'react';
import { useState } from 'react';
import './Login.css';
import PasswordStrengthBar from 'react-password-strength-bar';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import TextField from "@mui/material/TextField";
import useGeneral from './hooks/useGeneral';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UpdatePassword() {
    const [showPassword, setShowPassword] = useState(false);
    const { navigate } = useGeneral();
    const initialState = {
        currentPassword:'',
        password: '',
    }

    const validationSchema = Yup.object().shape({
        password: Yup.string().min(6, 'Too Short!').required('Required'),
    });

    const handleSubmit = async (values) => {
        try {
            const email = localStorage.getItem("email");
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}users/update-password`,
                {
                    email,
                    currentPassword: values.currentPassword,
                    password: values.password, 
                }
            );

            if (res.status === 200) {
                toast.success("Password updated successfully!");
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update password");
        }
    };


    return (
        <div className="login-container">
            <ToastContainer />
            <div className="login-left">

                <div className="login-form-wrapper">
                    <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ values, handleChange, handleBlur, touched, errors }) => (
                            <Form className="login-form">
                                <div className='text-center text-2xl mb-4 font-bold'>
                                    <span>Update Password</span>
                                </div>

                                <div className="form-group">
                                    <div className="password-header">
                                        <label htmlFor="password">Current Password</label>

                                    </div>
                                    <div className="password-input-wrapper">
                                        <TextField
                                            type={showPassword ? "text" : "password"}
                                            id="currentPassword"
                                            name="currentPassword"
                                            label="Current Password"
                                            fullWidth
                                            variant="outlined"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.currentPassword}
                                            error={touched.currentPassword && Boolean(errors.currentPassword)}
                                            helperText={touched.currentPassword && errors.currentPassword}
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>

                                </div>

                                <div className="form-group">
                                    <div className="password-header">
                                        <label htmlFor="password">New Password</label>
                                    
                                    </div>
                                    <div className="password-input-wrapper">
                                        <TextField
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            label="Password"
                                            fullWidth
                                            variant="outlined"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.password}
                                            error={touched.password && Boolean(errors.password)}
                                            helperText={touched.password && errors.password}
                                        />

                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? '👁️' : '👁️‍🗨️'}
                                        </button>
                                    </div>
                                    <PasswordStrengthBar className="pt-3" password={values.password} />
                                </div>

                                <button type="submit" className="signup-btn">
                                    Update
                                </button>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>


        </div>
    );
}

export default UpdatePassword;