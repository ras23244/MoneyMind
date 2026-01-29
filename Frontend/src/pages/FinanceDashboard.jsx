import React, { useState, useMemo, useCallback } from "react";
import Sidebar from '../components/Sidebar';
import BalanceCards from "../components/BalanceCards";
import RecentTransactions from "../components/RecentTransactions";
import BudgetStatus from "../components/BudgetStatus";
import ConnectedAccounts from "../components/ConnectedAccounts";
import GoalsPanel from "../components/GoalsPanel";
import TransactionsPanel from "../components/TransactionsPanel";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Home, Receipt, Target, Goal, BarChart3, Wallet, FileText } from "lucide-react";
import { useUser } from '../context/UserContext';
import AddTransactionDialog from "../components/AddTransactionDialog";
import useGeneral from "../components/hooks/useGeneral";
import Budgets from "../components/Budgets";
import Analytics from "../components/Analytics";
import Accounts from "../components/Accounts";
import CashFlowChart from "../components/CashFlowChart";
import { useBudgets } from "../components/hooks/useBudgets";
import { useTransactions } from "../components/hooks/useTransactions";
import { BudgetProgressCircle } from "../components/Analytics";
import NotesPanel from "../components/NotesPanel";
import budgetImages from "../data/budgetImages";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { useFinancialSummary } from "../components/hooks/useFinancialSummary";
import { transactionTrendData, financialGoals, connectedBanks } from "@/data/financeData";
import Dashboard from "../components/Dashboard";
import NotificationBell from "../components/NotificationBell";
import Bills from "./Bills";

export default function FinanceDashboard() {
    const { user, loading } = useUser();
    const { navigate } = useGeneral();

    // Redirect to link-bank-account if user has no accounts
    React.useEffect(() => {
        if (!loading && user && (!Array.isArray(user.bankAccounts) || user.bankAccounts.length === 0)) {
            navigate('/link-bank-account');
        }
    }, [user, loading, navigate]);

    // Fetch data using hooks
    const { data: budgets = [] } = useBudgets(user?._id);
    const { data: transactions = [], refetch: refetchTransactions } = useTransactions(user?._id);
    const { data: financialSummary, isLoading } = useFinancialSummary(user?._id);

    // State for UI
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    // Memoize static date strings to prevent re-creation
    const today = useMemo(() => new Date().toISOString().split("T")[0], []);
    const month = useMemo(() => new Date().toISOString().slice(0, 7), []);

    // Memoize derived data
    const monthlyBudgets = useMemo(() =>
        budgets.filter(b => b.durationType === "month" && b.category !== "Monthly" && b.month === month),
        [budgets, month]
    );

    const dailyBudgets = useMemo(() =>
        budgets.filter(b => b.durationType === "day" && b.day === today),
        [budgets, today]
    );

    const budgetStatusCategories = useMemo(() =>
        monthlyBudgets.map(budget => ({
            name: budget.category,
            percentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
            spent: budget.spent,
            budget: budget.amount,
            image: budgetImages[budget.category] || budgetImages["default"],
        })),
        [monthlyBudgets]
    );

    const recentTx = useMemo(() => transactions.slice(0, 3), [transactions]);

    // Memoize helper functions with useCallback
    const formatCurrency = useCallback((amount) => {
        if (!isBalanceVisible && Math.abs(amount) > 1000) return "••••••";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }).format(Math.abs(amount));
    }, [isBalanceVisible]);

    const getTransactionsByDate = useCallback((date) => {
        const dateString = new Date(date).toISOString().split("T")[0];
        return transactions.filter((t) => t.date === dateString);
    }, [transactions]);

    // Handle new transaction creation
    const handleTransactionCreated = () => {
        refetchTransactions(); // This will automatically re-fetch the data, updating the `transactions` array
    };

    // --- Render logic for loading and unauthenticated states ---
    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please log in to continue.</div>;
    }
    // Restrict dashboard if no accounts
    if (Array.isArray(user.bankAccounts) && user.bankAccounts.length === 0) {
        return null; // Or a loading spinner, since useEffect will redirect
    }

    // --- Navigation and rendering the main content ---
    const navigation = [
        { id: "overview", label: "Overview", icon: Home },
        { id: "transactions", label: "Transactions", icon: Receipt },
        { id: "budgets", label: "Budgets", icon: Target },
        { id: "goals", label: "Goals", icon: Goal },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "bills", label: "Bills", icon: FileText },
        { id: "accounts", label: "Accounts", icon: Wallet },
    ];

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Good morning, {user?.fullname.firstname}</h2>
                            <p className="text-white/60 mt-1">Here's your financial overview</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <Button size="sm" className="bg-white text-black hover:bg-white/90" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Transaction</Button>
                        </div>
                    </div>

                    {/* Overview */}
                    {activeTab === "overview" && <Dashboard />}

                    {activeTab === "accounts" && <Accounts connectedBanks={connectedBanks} />}
                    {activeTab === "goals" && <GoalsPanel formatCurrency={formatCurrency} financialGoals={financialGoals} />}
                    {activeTab === "budgets" && <Budgets />}
                    {activeTab === "analytics" && <Analytics formatCurrency={formatCurrency} transactionTrendData={transactionTrendData} />}
                    {activeTab === "bills" && <Bills />}
                    {activeTab === "transactions" && <TransactionsPanel selectedDate={selectedDate} setSelectedDate={setSelectedDate} transactions={transactions} formatCurrency={formatCurrency} />}
                </div>
            </main>

            <AddTransactionDialog
                open={open}
                setOpen={setOpen}
                userId={user._id}
                onTransactionCreated={handleTransactionCreated}
            />
        </div>
    );
}