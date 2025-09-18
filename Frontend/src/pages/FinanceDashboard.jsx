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
                            <BalanceCards userData={userData} isBalanceVisible={isBalanceVisible} setIsBalanceVisible={setIsBalanceVisible} formatCurrency={formatCurrency} />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <RecentTransactions recentTransactions={recentTx} formatCurrency={formatCurrency} />
                                <div className="lg:col-span-1">
                                    <BudgetStatus initialCategories={budgetCategories} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Connected accounts */}
                    {activeTab === "accounts" && <ConnectedAccounts connectedBanks={connectedBanks} formatCurrency={formatCurrency} navigate={(p) => console.log("navigate", p)} />}

                    {/* Goals */}
                    {activeTab === "goals" && <GoalsPanel financialGoals={financialGoals} formatCurrency={formatCurrency} />}

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