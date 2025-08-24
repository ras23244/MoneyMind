import React, { useRef, useState,useEffect } from 'react';
import { TextField, Button, Typography, Stack, Box } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { MdVerifiedUser } from "react-icons/md";
import Countdown from 'react-countdown';
import './Login.css';
import useGeneral from './hooks/useGeneral';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VerifyOtp = () => {
    const [timerKey, setTimerKey] = useState(0); // for restarting countdown
    const [isResendEnabled, setIsResendEnabled] = useState(false);
    const {navigate} = useGeneral();

    const initialState = {
        otp1: '',
        otp2: '',
        otp3: '',
        otp4: '',
        otp5: '',
        otp6: '',
    };

    const validationSchema = Yup.object().shape({
        otp1: Yup.string().required('Required'),
        otp2: Yup.string().required('Required'),
        otp3: Yup.string().required('Required'),
        otp4: Yup.string().required('Required'),
        otp5: Yup.string().required('Required'),
        otp6: Yup.string().required('Required'),
    });

    const otpArray = ['otp1', 'otp2', 'otp3', 'otp4', 'otp5', 'otp6'];
    const inputRefs = useRef([]);

    const handleOtpChange = (e, index, setFieldValue) => {
        const { value } = e.target;
        const cleanedValue = value.replace(/[^0-9]/g, '');

        setFieldValue(otpArray[index], cleanedValue);

        if (cleanedValue && index < otpArray.length - 1) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const restartTimer = () => {
        setTimerKey(prev => prev + 1);
        setIsResendEnabled(false);
    };

    const submitHandler = async (values) => {
        
        const otp = values.otp1 + values.otp2 + values.otp3 + values.otp4 + values.otp5 + values.otp6;  
        
        const res = await axios.post(`${import.meta.env.VITE_BASE_URL}users/verify-otp`, { otp });
     
        if(res.status === 200){
            toast.success("OTP verified successfully!");
            setTimeout(() => {
                navigate('/update-password');
            }, 1000);
            
        }
        else{
            toast.error("OTP verification failed!");
        }
        
        restartTimer();
    };

    const resendHandler = async () => {
        try {
            const email = localStorage.getItem('email'); 
            if (!email) {
                toast.error('No email found. Please go back and try again.');
                return;
            }


            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}users/forget-password`,
                { email }
            );

            if (res.status === 200) {
                toast.success('OTP sent to your email!');
                restartTimer(); 
            }

        } catch (err) {
            toast.error(
                err.response?.data?.message || 'Failed to send OTP. Please try again.'
            );
        }
    };


    useEffect(()=>{
        const fetchData = async () => {
            const email = localStorage.getItem('email');
            if (email) {
                const res = await axios.post(`${import.meta.env.VITE_BASE_URL}users/get-time`, { email });
                if (res.status === 200) {
                    console.log("Time fetched successfully:", res.data.time);
                }
            }
        };
        fetchData();
    }, []);

    return (
        <div className="login-container">
             <ToastContainer />
            <Box
                sx={{
                    maxWidth: 400,
                    margin: 'auto',
                    background: 'white',
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
                    Verify OTP
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                    Please enter the 6-digit code sent to your email
                </Typography>

                <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={submitHandler}>
                    {({ values, handleBlur, handleSubmit, setFieldValue }) => (
                        <Form onSubmit={handleSubmit}>
                            <Stack direction="row" spacing={1} justifyContent="center" mb={3}>
                                {otpArray.map((name, index) => (
                                    <TextField
                                        key={name}
                                        name={name}
                                        value={values[name]}
                                        inputRef={(el) => (inputRefs.current[index] = el)}
                                        onChange={(e) => handleOtpChange(e, index, setFieldValue)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        onBlur={handleBlur}
                                        inputProps={{
                                            maxLength: 1,
                                            style: { textAlign: 'center', fontSize: '1.5rem' },
                                        }}
                                        sx={{ width: 50 }}
                                        variant="outlined"
                                    />
                                ))}
                            </Stack>

                            <Button
                                className="bg-[#2d5a3d]"
                                type="submit"
                                fullWidth
                                variant="contained"
                                startIcon={<MdVerifiedUser />}
                                sx={{ mb: 2 }}
                            >
                                Verify OTP
                            </Button>

                            <button type="button" onClick={() => navigate('/login')} className="signup-btn mb-3 h-2 flex items-center justify-center">
                                Back to Login
                            </button>

                        

                            <div className="text-center mt-3">
                                <Countdown
                                    key={timerKey}
                                    date={Date.now() + 1 * 60 * 1000}
                                    renderer={({ minutes, seconds, completed }) => {
                                        if (completed) {
                                            setTimeout(() => setIsResendEnabled(true), 0);
                                            return null; // don't render text, button will show
                                        } else {
                                            return (
                                                !isResendEnabled &&(
                                                    <span className="text-gray-500">
                                                        {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
                                                    </span>
                                                )
                                            );
                                        }
                                    }}
                                />

                                {isResendEnabled && (
                                    <Button
                                        onClick={resendHandler}
                                        variant="outlined"
                                        color="primary"
                                        className="mt-2"
                                    >
                                        Resend OTP
                                    </Button>
                                )}
                            </div>

                        </Form>
                    )}
                </Formik>
            </Box>
        </div>
    );
};

export default VerifyOtp;
