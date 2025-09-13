import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgetPassword from "./components/ForgetPassword";
import VerifyOtp from "./components/VerifyOtp";
import UpdatePassword from "./components/UpdatePassword";
import FinanceDashboard from "./pages/FinanceDashboard";
import { UserProvider } from './context/UserContext';
import LinkBankAccount from "./pages/LinkBankAccount";

function App() {
  
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/link-bank-account" element={<LinkBankAccount />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/dashboard" element={<FinanceDashboard />} />
      </Routes>
    </UserProvider>

  )
}
export default App