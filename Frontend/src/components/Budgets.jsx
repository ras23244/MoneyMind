import React, { useState, useRef, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useBudgets } from "./hooks/useBudgets";
import { useCreateBudget, useUpdateBudget, useDeleteBudget } from "./hooks/useBudgetMutations";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import AddBudgetDialog from "./AddBudgetDialog";
import BudgetProgressCard from "./BudgetProgressCard";
import BudgetBreakdownChart from "./BudgetBreakdownChart";
import MonthlyBudgetCard from "./MonthlyBudgetCard";
import { useTransactions } from "./hooks/useTransactions";
import BudgetsFilter from "./BudgetsFilter";
import BudgetHistory from "./BudgetHistory"; // ✅ already created

export default function Budgets() {
    const scrollRef = useRef(null);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);

    const { user } = useUser();
    const month = new Date().toISOString().slice(0, 7);
    console.log("Current Month:", month);

    const { data: budgets = [] } = useBudgets(user?._id);
    const { data: transactions = [] } = useTransactions(user?._id);

    const createBudgetMutation = useCreateBudget(user?._id, month);
    const updateBudgetMutation = useUpdateBudget(user?._id, month);
    const deleteBudgetMutation = useDeleteBudget(user?._id, month);

    const [openDialog, setOpenDialog] = useState(false);
    const [showPieChart, setShowPieChart] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(month);
    const [filters, setFilters] = useState({ category: "", minAmount: "", maxAmount: "" });
    const [showHistory, setShowHistory] = useState(false);

    // Scroll handler with tolerance
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;
        const tolerance = 2;
        setAtTop(el.scrollTop <= tolerance);
        setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight <= tolerance);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    const handleScrollIndicatorClick = () => {
        const el = scrollRef.current;
        if (!el) return;
        if (atTop) {
            el.scrollBy({ top: Math.min(150, el.scrollHeight - el.scrollTop - el.clientHeight), behavior: "smooth" });
        } else if (atBottom) {
            el.scrollBy({ top: -Math.min(150, el.scrollTop), behavior: "smooth" });
        } else {
            el.scrollBy({ top: 150, behavior: "smooth" });
        }
    };

    const handleAddBudget = (newBudget) => {
        createBudgetMutation.mutate({ ...newBudget, month });
        setOpenDialog(false);
    };

    const handleUpdateBudget = (id, updatedBudget) => {
        updateBudgetMutation.mutate({ id, ...updatedBudget, month });
    };

    const handleDeleteBudget = (id) => {
        deleteBudgetMutation.mutate(id);
    };


    const today = new Date().toISOString().slice(0, 10);  // yyyy-mm-dd
    const currentMonth = new Date().toISOString().slice(0, 7); // yyyy-mm
    console.log("Today's Date:", today);
    console.log("Current Month:", currentMonth);

    // compute budgets with spent
    const budgetsWithSpent = budgets.map(budget => {
        const transactionSpent = transactions
            .filter(tx =>
                tx.type === "expense" &&
                ((budget.durationType === "daily" && tx.date === budget.date) ||
                    (budget.durationType === "monthly" && tx.date.startsWith(budget.month))) &&
                (tx.category === budget.category || tx.tags.includes(budget.category))
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

        const manualSpent = Number(budget.spent) || 0;
        return { ...budget, spent: transactionSpent + manualSpent };
    });


    const selectedMonthBudgets = budgetsWithSpent.filter(
        b => b.month === selectedMonth && b.category !== "Monthly"
    );


    const selectedMonthTotalBudget = selectedMonthBudgets.reduce((sum, b) => sum + b.amount, 0);
    const selectedMonthTotalSpent = selectedMonthBudgets.reduce((sum, b) => sum + b.spent, 0);
    const savedOrOverspent = selectedMonthTotalBudget - selectedMonthTotalSpent;

    const statusMessage = savedOrOverspent >= 0
        ? `You saved ₹${savedOrOverspent.toLocaleString("en-IN")} this month.`
        : `You overspent by ₹${Math.abs(savedOrOverspent).toLocaleString("en-IN")} this month!`;

    console.log("budgets:", budgets);
    console.log("Budgets with Spent:", budgetsWithSpent);
   const currentBudgets = budgetsWithSpent.filter(b => {
        if (b.durationType === "day") return b.day === today; // use 'day' instead of 'date'
        if (b.durationType === "month") return b.month === currentMonth;
        return false;
    });

    const historyBudgets = budgetsWithSpent.filter(b => {
        if (b.durationType === "day") return b.day < today; // use 'day' instead of 'date'
        if (b.durationType === "month") return b.month < currentMonth;
        return false;
    });

    console.log("Current Budgets:", currentBudgets);
    console.log("History Budgets:", historyBudgets);

    const totalBudget = budgetsWithSpent.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0);
    const disposableIncome = totalBudget - totalSpent;

    const durations = [...new Set(budgets.map(b => b.duration))];
    const durationTypes = [...new Set(budgets.map(b => b.durationType))];

    const filteredBudgets = budgetsWithSpent.filter(budget => {
        if (filters.category && budget.category !== filters.category) return false;
        if (filters.month && budget.month !== filters.month) return false;
        if (filters.status) {
            const utilization = budget.spent / budget.amount;
            if (filters.status === "safe" && utilization >= 0.75) return false;
            if (filters.status === "near-limit" && (utilization < 0.75 || utilization > 1)) return false;
            if (filters.status === "exceeded" && utilization <= 1) return false;
        }
        if (filters.search && !budget.category.toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.durationType && budget.durationType !== filters.durationType) return false;
        if (filters.duration && String(budget.duration) !== String(filters.duration)) return false;
        return true;
    });

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Budgets</h1>
                <div className="flex gap-2">
                    <Button onClick={() => setOpenDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Budget
                    </Button>
                    <Button
                        onClick={() => setShowHistory(!showHistory)}
                        className="bg-gray-600 hover:bg-gray-700 text-white mb-4"
                    >
                        {showHistory ? "Hide History" : "History"}
                    </Button>
                </div>
            </div>

            {showHistory ? (
                <BudgetHistory budgets={historyBudgets} transactions={transactions} />
            ) : (
                <>
                    <MonthlyBudgetCard budgets={currentBudgets} />

                    <Card className="bg-card-dark border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Disposable Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-400">
                                ₹{disposableIncome.toLocaleString("en-IN")}
                            </p>
                            <p className="text-sm text-white/60">
                                After accounting for budgets & recurring expenses
                            </p>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center">
                        <BudgetsFilter
                            filters={filters}
                            setFilters={setFilters}
                            categories={[...new Set(budgets.map(b => b.category))]}
                            months={[...new Set(budgets.map(b => b.month))]}
                            durations={durations}
                            durationTypes={durationTypes}
                        />
                        <Button
                            onClick={() => setShowPieChart(!showPieChart)}
                            className="bg-green-600 hover:bg-green-700 text-white mb-4"
                        >
                            {showPieChart ? "Hide Breakdown" : "Show Breakdown"}
                        </Button>
                    </div>

                    {showPieChart ? (
                        <div className="flex gap-6">
                            {/* Left side: pie chart + summary */}
                            <div className="flex-1">
                                <div className="mb-4">
                                    <label className="text-white/80 mr-2">Select Month:</label>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={e => setSelectedMonth(e.target.value)}
                                        className="bg-black/40 border-white/20 text-white px-2 py-1 rounded"
                                    />
                                </div>
                                <div
                                    className={`mb-4 text-lg font-semibold ${savedOrOverspent >= 0 ? "text-green-400" : "text-red-400"
                                        }`}
                                >
                                    {statusMessage}
                                </div>
                                <BudgetBreakdownChart budgets={filteredBudgets} />
                            </div>

                            {/* Right side: budget progress cards */}
                            <div className="flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredBudgets.map((budget, idx) => (
                                        <BudgetProgressCard
                                            key={budget._id || idx}
                                            budget={budget}
                                            onUpdate={updatedBudget =>
                                                handleUpdateBudget(budget._id, updatedBudget)
                                            }
                                            onDelete={() => handleDeleteBudget(budget._id)}
                                            transactions={transactions || []}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Normal scrollable budgets view
                        <div className="relative">
                            <div
                                ref={scrollRef}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-black/40"
                            >
                                {currentBudgets.map((budget, idx) => (
                                    <BudgetProgressCard
                                        key={budget._id || idx}
                                        budget={budget}
                                        onUpdate={updatedBudget =>
                                            handleUpdateBudget(budget._id, updatedBudget)
                                        }
                                        onDelete={() => handleDeleteBudget(budget._id)}
                                        transactions={transactions || []}
                                    />
                                ))}
                            </div>

                            {currentBudgets.length > 6 && (
                                <div
                                    className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce text-2xl cursor-pointer select-none"
                                    onClick={handleScrollIndicatorClick}
                                >
                                    {atTop ? "▼" : atBottom ? "▲" : "▼"}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}


            <AddBudgetDialog open={openDialog} setOpen={setOpenDialog} onSave={handleAddBudget} />
        </div>
    );
}
