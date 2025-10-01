import React, { useState } from "react";
import Sidebar from '../components/Sidebar'
import BalanceCards from "../components/BalanceCards";
import RecentTransactions from "../components/RecentTransactions";
import BudgetStatus from "../components/BudgetStatus";
import ConnectedAccounts from "../components/ConnectedAccounts";
import GoalsPanel from "../components/GoalsPanel";
import TransactionsPanel from "../components/TransactionsPanel";
import { userData, transactionTrendData, budgetCategories, financialGoals, connectedBanks, allTransactions as initialTransactions } from "@/data/financeData";
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
import { BudgetProgressCircle } from "../components/Analytics";
import NotesPanel from "../components/NotesPanel";
import budgetImages from "../data/budgetImages"; 
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function FinanceDashboard() {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading...</div>; // or spinner
    }

    if (!user) {
        return <div>Please log in to continue.</div>;
        // or navigate("/login")
    }

    const { navigate } = useGeneral();

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [transactions, setTransactions] = useState(initialTransactions);
    const [showNotes, setShowNotes] = useState(false);

    // Get current month for budgets
    const today = new Date().toISOString().split("T")[0];
    const month = new Date().toISOString().slice(0, 7);
    const { data: budgets = [] } = useBudgets(user?._id, month);

    // Filter monthly budgets (not daily, not "Monthly" meta-budget)
    const monthlyBudgets = budgets.filter(
        b => b.durationType === "month" && b.category !== "Monthly" && b.month === month
    );



    // Map to BudgetStatus card format
    const budgetStatusCategories = monthlyBudgets.map(budget => ({
        name: budget.category,
        percentage: budget.amount > 0 ? Math.round((budget.spent / budget.amount) * 100) : 0,
        spent: budget.spent,
        budget: budget.amount,
        image: budgetImages[budget.category] || budgetImages["default"], 
    }));
    

    // Filter daily budgets
    const dailyBudgets = budgets.filter(
        b => b.durationType === "day" && b.day === today
    );

    // helper functions
    const formatCurrency = (amount) => {
        if (!isBalanceVisible && Math.abs(amount) > 1000) return "••••••";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }).format(Math.abs(amount));
    };


    const getTransactionsByDate = (date) => {
        const dateString = new Date(date).toISOString().split("T")[0];
        return transactions.filter((t) => t.date === dateString);
    };

    const navigation = [
        { id: "overview", label: "Overview", icon: Home },
        { id: "transactions", label: "Transactions", icon: Receipt },
        { id: "budgets", label: "Budgets", icon: Target },
        { id: "goals", label: "Goals", icon: Goal },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "accounts", label: "Accounts", icon: Wallet },
    ];

    const recentTx = transactions.slice(0, 3);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar navigation={navigation} activeTab={activeTab} setActiveTab={setActiveTab} creditScore={userData.creditScore} />

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
                            {/* Balance Cards */}
                            <BalanceCards
                                userData={userData}
                                isBalanceVisible={isBalanceVisible}
                                setIsBalanceVisible={setIsBalanceVisible}
                                formatCurrency={formatCurrency}
                            />

                            {/* Top Row: Daily Budgets (Left 2/3) + Insights (Right 1/3) */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Daily Budgets (2/3 width) */}
                                {dailyBudgets.length > 0 && (
                                    <div className="lg:col-span-2 bg-[#1e1e1e] dark:bg-[#1e1e1e] rounded-2xl shadow p-2 h-[max-content]">
                                        <h2 className="text-lg font-semibold mb-2">Daily Budgets</h2>

                                        <InfiniteMovingCards
                                            items={dailyBudgets.map((budget) => {
                                                const percent =
                                                    budget.amount > 0
                                                        ? Math.round((budget.spent / budget.amount) * 100)
                                                        : 0;
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
                                                    name: ``,
                                                    title: ``,
                                                };
                                            })}
                                            direction="left"
                                            speed="normal"
                                            pauseOnHover={true}
                                            className="max-w-full"
                                        />
                                    </div>
                                )}


                                {/* Insights (1/3 width) */}
                                <div className="bg-[#1e1e1e] dark:bg-[#1e1e1e] rounded-2xl shadow p-4 flex flex-col h-[500px]">
                                    {/* Header with toggle */}
                                    <div className="flex items-center justify-between mb-3">
                                        <h2 className="text-lg font-semibold">Insights</h2>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setShowNotes((prev) => !prev)}
                                        >
                                            {showNotes ? "Notes" : "Notes"}
                                        </Button>
                                    </div>

                                    {/* Conditional Rendering */}
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


                            </div>

                            {/* Bottom Row: Cash Flow (Left 2/3) + Monthly Budget (Right 1/3) */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Cash Flow Overview (2/3 width) */}
                                <div className="lg:col-span-2 rounded-2xl shadow p-4">
                                    <h2 className="text-lg font-semibold mb-4">Cash Flow Overview</h2>
                                    <CashFlowChart />
                                </div>

                                {/* Monthly Budget Status (1/3 width) */}
                                <div className="lg:col-span-1 bg-[#1e1e1e] dark:bg-[#1e1e1e]  rounded-2xl shadow p-4">
                                    <h2 className="text-lg font-semibold mb-4">Monthly Budget Status</h2>
                                    <BudgetStatus initialCategories={budgetStatusCategories} />
                                </div>
                            </div>
                        </div>
                    )}




                    {activeTab === "accounts" && (
                        <Accounts />
                    )}

                    {/* Goals */}
                    {activeTab === "goals" && <GoalsPanel formatCurrency={formatCurrency} />}

                    {/* Budgets */}
                    {activeTab === "budgets" && <Budgets />}

                    {/* Analytics */}
                    {activeTab === "analytics" && (
                        <Analytics />
                    )}

                    {/* Transactions */}
                    {activeTab === "transactions" && (
                        <TransactionsPanel

                            selectedDate={selectedDate}
                            setSelectedDate={setSelectedDate}

                            formatCurrency={formatCurrency}

                        />
                    )}
                </div>
            </main>

            {/* Add Transaction Dialog */}
            <AddTransactionDialog
                open={open}
                setOpen={setOpen}
                userId={user._id}
                onTransactionCreated={(newTx) => {
                    // ✅ update state with new transaction
                    setTransactions((prev) => [newTx, ...prev]);
                }}
            />
        </div>
    );
}