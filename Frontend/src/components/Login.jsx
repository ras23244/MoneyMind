import React, { use } from 'react';
import { useState } from 'react';
import './Login.css';
import PasswordStrengthBar from 'react-password-strength-bar';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import TextField from "@mui/material/TextField";
import Divider from '@mui/material/Divider';
import useGeneral from './hooks/useGeneral';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../context/UserContext';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { navigate } = useGeneral();
  const { login } = useUser();

  const initialState = {
    email: '',
    password: '',
  }

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Required'),
    password: Yup.string().min(6, 'Too Short!').required('Required'),
  });

  const handleSubmit = async (values) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}users/login`, {
        email: values.email,
        password: values.password
      }, {
        withCredentials: true // Important: Send/receive cookies
      });

      if (res.status === 200) {
        console.log("Login successful:", res.data);
        toast.success('Login successful!');
        login(res.data.user);
        // Redirect based on bankAccounts
        if (Array.isArray(res.data.user.bankAccounts) && res.data.user.bankAccounts.length > 0) {
          navigate("/dashboard");
        } else {
          navigate("/link-bank-account");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Server response:", err.response?.data);
      const errorMessage = err.response?.data?.message || 'Login failed!';
      toast.error(errorMessage);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
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
            <p>Welcome to Filianta - Let's create your account</p>
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

                <div className="form-group">
                  <div className="password-header">
                    <label htmlFor="password">Password</label>
                    <button type="button" onClick={() => navigate('/forget-password')} className="forgot-link">
                      Forgot?
                    </button>
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
                  Login
                </button>

                <Divider className='pt-2'>OR</Divider>
                <button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 533.5 544.3"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M533.5 278.4c0-17.4-1.6-34-4.7-50.1H272v94.8h147.5c-6.4 34.7-25.8 64.1-55.1 83.8l89.1 69.1c52-47.9 82-118.6 82-197.6z"
                      fill="#4285f4"
                    />
                    <path
                      d="M272 544.3c74.7 0 137.3-24.7 183-67.3l-89.1-69.1c-24.7 16.6-56.4 26.4-93.9 26.4-72.3 0-133.7-48.8-155.4-114.3H25.3v71.6c45.5 90.1 138.9 152.7 246.7 152.7z"
                      fill="#34a853"
                    />
                    <path
                      d="M116.6 319.9c-10.4-30.4-10.4-63.3 0-93.7v-71.6H25.3C-8.4 221-8.4 323.3 25.3 410.9l91.3-71z"
                      fill="#fbbc04"
                    />
                    <path
                      d="M272 107.1c39.9 0 75.8 13.8 104.1 40.9l77.8-77.8C409.3 24.6 346.7 0 272 0 164.2 0 70.8 62.6 25.3 152.7l91.3 71.6c21.6-65.5 83.1-114.3 155.4-114.3z"
                      fill="#ea4335"
                    />
                  </svg>
                  Continue with Google
                </button>


                <div className="login-footer">
                  <span>Don't have an account? </span>
                  <button type="button" className="login-link" onClick={() => navigate('/signup')}>
                    Sign up
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      <div className="login-right">
        <div className="hero-content">
          <h2 className="hero-title">
            Enter<br />
            the Future<br />
            of Payments,<br />
            today
          </h2>

          <div className="dashboard-preview">
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-logo">
                  <span className="card-logo-icon">O</span>
                </div>
              </div>

              <div className="balance-section">
                <div className="balance-amount">12,347.23 $</div>
                <div className="balance-label">Combined balance</div>
              </div>

              <div className="card-details">
                <div className="card-row">
                  <div className="card-info">
                    <div className="card-name">Primary Card</div>
                    <div className="card-number">3495 •••• •••• 6917</div>
                  </div>
                  <div className="card-amount">2,546.64$</div>
                </div>

                <div className="card-row">
                  <div className="card-info">
                    <div className="visa-logo">VISA</div>
                  </div>
                  <button className="view-all-btn">View All</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;