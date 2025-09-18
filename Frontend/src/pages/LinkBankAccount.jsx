import React, { useState,useEffect } from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import TextField from '@mui/material/TextField'
import useGeneral from '../components/hooks/useGeneral'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '../components/Login.css'
import { useUser } from '../context/UserContext'

const LinkBankAccount = () => {
    const { navigate } = useGeneral()
    const [loading, setLoading] = useState(false)  // ✅ loading state
    const { user, patchUser,setUser } = useUser()

    const initialState = {
        email: '',
        bankName: '',
        accountNumber: '',
    }

    const validationSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required'),
        bankName: Yup.string().required('Required'),
        accountNumber: Yup.string().required('Required'),
    })

    const handleSubmit = async (values) => {
        const token = localStorage.getItem("token")
        setLoading(true)   // start loading
        try {
            console.log("values are received in handler", values)
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}account/link-bank-account`,
                values,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            if (res.status === 201) {
                toast.success("Bank account linked successfully! Redirecting...")
                patchUser(res.data.user)
                navigate('/dashboard')// navigate after delay
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to link bank account")
        } finally {
            setLoading(false)  // stop loading
        }
    }


   

    return (
        <div className="login-container">
            <ToastContainer />
            <div className="login-left">
                <div className="login-form-wrapper">
                    <Formik initialValues={initialState} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        {({ values, handleChange, handleBlur, touched, errors }) => (
                            <Form className="login-form">
                                <div className='text-center text-2xl mb-4 font-bold text-black'>
                                    <span>Please link Your Bank Account</span>
                                </div>

                                {/* Email */}
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <TextField
                                        type="email"
                                        id="email"
                                        name="email"
                                        label="Enter Email used for Registration"
                                        fullWidth
                                        variant="outlined"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.email}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                    />
                                </div>

                                {/* Bank Name */}
                                <div className="form-group">
                                    <label htmlFor="bankName">Bank Name</label>
                                    <TextField
                                        type="text"
                                        id="bankName"
                                        name="bankName"
                                        label="Bank Name"
                                        fullWidth
                                        variant="outlined"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.bankName}
                                        error={touched.bankName && Boolean(errors.bankName)}
                                        helperText={touched.bankName && errors.bankName}
                                    />
                                </div>

                                {/* Account Number */}
                                <div className="form-group">
                                    <label htmlFor="accountNumber">Account Number</label>
                                    <TextField
                                        type="text"
                                        id="accountNumber"
                                        name="accountNumber"
                                        label="Account Number"
                                        fullWidth
                                        variant="outlined"
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        value={values.accountNumber}
                                        error={touched.accountNumber && Boolean(errors.accountNumber)}
                                        helperText={touched.accountNumber && errors.accountNumber}
                                    />
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    className="signup-btn"
                                    disabled={loading}   // disable while loading
                                >
                                    {loading ? "Please wait, reviewing your credentials..." : "Link Account"}
                                </button>

                                <div className="login-footer">
                                    <span>Link Account Automatically </span>
                                    <button
                                        type="button"
                                        className="login-link"
                                        onClick={() => navigate('/signup')}
                                        disabled={loading}
                                    >
                                        Link via Account Aggregator
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    )
}

export default LinkBankAccount
