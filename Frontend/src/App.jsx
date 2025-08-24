import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgetPassword from "./components/ForgetPassword";
import VerifyOtp from "./components/VerifyOtp";
import UpdatePassword from "./components/UpdatePassword";
import ProfilePage from "./components/ProfilePage";
import HomePage from "./pages/HomePage";
import FinomicDashboard from "./components/FimonicDashboard";
import FinanceDashboard from "./components/FinanceDashboard";
import { UserProvider } from './context/UserContext';

function App() {
  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/dashboard" element={<FinanceDashboard />} />
        <Route path='/dash' element={<FinomicDashboard />} />
      </Routes>
    </UserProvider>

  )
}
export default App