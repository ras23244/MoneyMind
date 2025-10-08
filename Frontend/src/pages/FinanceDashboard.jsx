import React, { useState, useMemo, useCallback } from "react";
import Sidebar from '../components/Sidebar';
import BalanceCards from "../components/BalanceCards";
import RecentTransactions from "../components/RecentTransactions";
import BudgetStatus from "../components/BudgetStatus";
import ConnectedAccounts from "../components/ConnectedAccounts";
import GoalsPanel from "../components/GoalsPanel";
import TransactionsPanel from "../components/TransactionsPanel";
import { Button } from "@/components/ui/button";
import { Bell, Plus, Home, Receipt, Target, Goal, BarChart3, Wallet } from "lucide-react";
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

export default function FinanceDashboard() {
    const { user, loading } = useUser();
    const { navigate } = useGeneral();

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

    // --- Navigation and rendering the main content ---
    const navigation = [
        { id: "overview", label: "Overview", icon: Home },
        { id: "transactions", label: "Transactions", icon: Receipt },
        { id: "budgets", label: "Budgets", icon: Target },
        { id: "goals", label: "Goals", icon: Goal },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
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
                            <Button variant="outline" size="sm" className="border-white/20 text-white"><Bell className="w-4 h-4 mr-2" />Notifications</Button>
                            <Button size="sm" className="bg-white text-black hover:bg-white/90" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Transaction</Button>
                        </div>
                    </div>

                    {/* Overview */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <BalanceCards
                                financialSummary={financialSummary}
                                isBalanceVisible={isBalanceVisible}
                                setIsBalanceVisible={setIsBalanceVisible}
                                formatCurrency={formatCurrency}
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {dailyBudgets.length > 0 ? (
                                        <div className="bg-[#1e1e1e] rounded-2xl shadow p-2 h-[max-content]">
                                            <h2 className="text-lg font-semibold mb-2">Daily Budgets</h2>
                                            <InfiniteMovingCards
                                                items={dailyBudgets.map((budget) => {
                                                    const percent = budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0;
                                                    let status = "On Track";
                                                    if (percent >= 100) status = "Exceeded";
                                                    else if (percent >= 80) status = "Near Limit";
                                                    return {
                                                        quote: (
                                                            <BudgetProgressCircle
                                                                key={budget._id}
                                                                title={budget.category}
                                                                status={status}
                                                                percentage={percent}
                                                            />
                                                        ),
                                                        name: '',
                                                        title: '',
                                                    };
                                                })}
                                                direction="left"
                                                speed="normal"
                                                pauseOnHover={true}
                                                className="max-w-full"
                                            />
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl shadow p-4">
                                            <h2 className="text-lg font-semibold mb-4">Cash Flow Overview</h2>
                                            <CashFlowChart />
                                        </div>
                                    )}
                                    {dailyBudgets.length > 0 && (
                                        <div className="rounded-2xl shadow p-4">
                                            <h2 className="text-lg font-semibold mb-4">Cash Flow Overview</h2>
                                            <CashFlowChart />
                                        </div>
                                    )}
                                </div>
                                <div className="lg:col-span-1 space-y-6">
                                    <div className="bg-[#1e1e1e] rounded-2xl shadow p-4 flex flex-col h-[500px]">
                                        <div className="flex items-center justify-between mb-3">
                                            <h2 className="text-lg font-semibold">Insights</h2>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowNotes((prev) => !prev)}
                                            >
                                                {showNotes ? "Hide Notes" : "View Notes"}
                                            </Button>
                                        </div>
                                        {showNotes ? (
                                            <NotesPanel />
                                        ) : (
                                            <div className="overflow-y-auto flex-1 pr-1">
                                                <ul className="space-y-2 text-sm">
                                                    <li className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                                        ⚠️ You’ve already spent 80% of your Food budget.
                                                    </li>
                                                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                        🎉 You saved ₹10,000 this month – 20% more than usual!
                                                    </li>
                                                    <li className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                                        🔮 Forecast: You may overspend on Shopping next month.
                                                    </li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="bg-[#1e1e1e] rounded-2xl shadow p-4">
                                        <h2 className="text-lg font-semibold mb-4">Monthly Budget Status</h2>
                                        <BudgetStatus initialCategories={budgetStatusCategories} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "accounts" && <Accounts connectedBanks={connectedBanks} />}
                    {activeTab === "goals" && <GoalsPanel formatCurrency={formatCurrency} financialGoals={financialGoals} />}
                    {activeTab === "budgets" && <Budgets />}
                    {activeTab === "analytics" && <Analytics transactionTrendData={transactionTrendData} />}
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