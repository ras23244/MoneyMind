import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgetPassword from "./components/ForgetPassword";
import VerifyOtp from "./components/VerifyOtp";
import UpdatePassword from "./components/UpdatePassword";
import { UserProvider } from './context/UserContext';
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LinkBankAccountPage from "./pages/LinkBankAccountPage";
import DashboardPage from "./pages/DashboardPage";
import Overview from "./pages/dashboard/Overview";
import Transactions from "./pages/dashboard/Transactions";
import BudgetsPage from "./pages/dashboard/Budgets";
import GoalsPage from "./pages/dashboard/Goals";
import AnalyticsPage from "./pages/dashboard/Analytics";
import BillsPage from "./pages/dashboard/Bills";
import AccountsPage from "./pages/dashboard/Accounts";

function App() {

  return (
    <UserProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/link-bank-account" element={<LinkBankAccountPage />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Dashboard routes - Protected by authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }>
          <Route index element={<Overview />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<BudgetsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="bills" element={<BillsPage />} />
          <Route path="accounts" element={<AccountsPage />} />
        </Route>

      </Routes>
    </UserProvider>
  )
}
export default App