// src/components/Budgets.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import BudgetHistory from "./BudgetHistory";
import DisposableIncomeChartModal from "./DisposableIncomeChartModal";
import dayjs from "dayjs";

export default function Budgets() {
    const scrollRef = useRef(null);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);
    const { user } = useUser();

    // All filters are managed in a single state object.
    const [filters, setFilters] = useState({
        category: "",
        minAmount: "",
        maxAmount: "",
        search: "",
        duration: "",
        month: "",
        durationType: "",
        status: "",
    });

    // Pass the filters directly to the useBudgets hook. React Query will handle refetching when filters change.
    const { data: budgets = [] } = useBudgets(user?._id, filters);
    const { data: transactions = [] } = useTransactions(user?._id);

    const createBudgetMutation = useCreateBudget(user?._id);
    const updateBudgetMutation = useUpdateBudget(user?._id);
    const deleteBudgetMutation = useDeleteBudget(user?._id);

    const [openDialog, setOpenDialog] = useState(false);
    const [showPieChart, setShowPieChart] = useState(false);
    // This state is now used only for the pie chart's month selection, not for filtering the main list.
    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
    const [showHistory, setShowHistory] = useState(false);
    const [showDisposableModal, setShowDisposableModal] = useState(false);

    // Memoized computation of budgets with spent amounts. This now operates on the already-filtered data from the backend.
    const budgetsWithSpent = useMemo(() => {
        const transactionsLookup = transactions.reduce((map, tx) => {
            if (tx.type === "expense") {
                const month = tx.date?.slice(0, 7);
                if (month) {
                    if (!map[month]) map[month] = [];
                    map[month].push(tx);
                }
            }
            return map;
        }, {});

        return budgets.map((budget) => {
            const relevantTxs = budget.durationType === "day"
                ? transactions.filter(tx => tx.date === budget.day && (tx.category === budget.category))
                : (transactionsLookup[budget.month] || []).filter(tx => tx.category === budget.category);

            const transactionSpent = relevantTxs.reduce((sum, tx) => sum + tx.amount, 0);
            const manualSpent = Number(budget.spent) || 0;
            return { ...budget, spent: transactionSpent + manualSpent };
        });
    }, [budgets, transactions]);

    // This is the client-side filtering function, which now only handles criteria that the backend doesn't,
    // like the 'status' which is a calculated value.
    const applyClientSideFilters = useCallback(
        (list) => {
            return list.filter((budget) => {
                const { status, minAmount, maxAmount } = filters;

                // Status filter (based on utilization)
                const utilization = budget.amount ? budget.spent / budget.amount : 0;
                if (status === "safe" && utilization >= 0.75) return false;
                if (status === "near-limit" && (utilization < 0.75 || utilization > 1)) return false;
                if (status === "exceeded" && utilization <= 1) return false;

                // Amount filters (optional, can be done on backend for efficiency)
                if (minAmount && budget.amount < Number(minAmount)) return false;
                if (maxAmount && budget.amount > Number(maxAmount)) return false;

                return true;
            });
        },
        [filters]
    );

    // This is the final list of budgets after both backend and frontend filtering.
    const filteredBudgets = useMemo(() => applyClientSideFilters(budgetsWithSpent), [budgetsWithSpent, applyClientSideFilters]);

    // Monthly disposable income data for the chart.
    const monthlyData = useMemo(() => {
        const allMonths = [...new Set(budgetsWithSpent.map(b => b.month))].filter(Boolean).sort();
        return allMonths.map(m => {
            const monthBudgets = budgetsWithSpent.filter(b => b.month === m);
            const budgetSum = monthBudgets.reduce((sum, b) => sum + b.amount, 0);
            const spentSum = monthBudgets.reduce((sum, b) => sum + b.spent, 0);
            return { month: m, disposable: budgetSum - spentSum };
        });
    }, [budgetsWithSpent]);

    const currentMonthDisposable = useMemo(() => {
        const currentMonth = dayjs().format("YYYY-MM");
        return monthlyData.find(d => d.month === currentMonth)?.disposable || 0;
    }, [monthlyData]);

    const categories = useMemo(() => [...new Set(budgets.map(b => b.category))].filter(Boolean), [budgets]);
    const months = useMemo(() => [...new Set(budgets.map(b => b.month))].filter(Boolean), [budgets]);
    const durations = useMemo(() => [...new Set(budgets.map(b => b.duration))].filter(d => d != null).sort((a, b) => a - b), [budgets]);
    const durationTypes = useMemo(() => [...new Set(budgets.map(b => b.durationType))].filter(Boolean), [budgets]);

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
            el.scrollBy({ top: 150, behavior: "smooth" });
        } else if (atBottom) {
            el.scrollBy({ top: -150, behavior: "smooth" });
        } else {
            el.scrollBy({ top: 150, behavior: "smooth" });
        }
    };

    const handleAddBudget = (newBudget) => {
        createBudgetMutation.mutate({ ...newBudget, month: newBudget.month || dayjs().format("YYYY-MM") });
        setOpenDialog(false);
    };

    const handleUpdateBudget = (id, updatedBudget) => {
        updateBudgetMutation.mutate({ id, ...updatedBudget, month: updatedBudget.month || dayjs().format("YYYY-MM") });
    };

    const handleDeleteBudget = (id) => {
        deleteBudgetMutation.mutate(id);
    };

    
    // To show history, we simply set the duration filter.
    // The previous 'filteredCurrentBudgets' and 'filteredHistoryBudgets' are no longer needed.
    // The main filteredBudgets list will contain the correct data based on the filters.

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
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                        {showHistory ? "Hide History" : "Show History"}
                    </Button>
                </div>
            </div>

            {/* Conditionally render content based on showHistory state */}
            {showHistory ? (
                <BudgetHistory budgets={filteredBudgets} transactions={transactions} />
            ) : (
                <>
                    <MonthlyBudgetCard budgets={filteredBudgets} />

                    <Card className="bg-card-dark border border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">Disposable Income</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-400">
                                ₹{currentMonthDisposable.toLocaleString("en-IN")}
                            </p>
                            <p className="text-sm text-white/60 mb-3">
                                After accounting for budgets & recurring expenses
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowDisposableModal(true)}
                                className="text-white border-white/30 hover:bg-white/10"
                            >
                                View Trend
                            </Button>
                        </CardContent>
                    </Card>

                    {showDisposableModal && (
                        <DisposableIncomeChartModal
                            data={monthlyData}
                            open={showDisposableModal}
                            setOpen={setShowDisposableModal}
                        />
                    )}

                    <div className="flex justify-between items-center">
                        <BudgetsFilter
                            filters={filters}
                            setFilters={setFilters}
                            categories={categories}
                            months={months}
                            durations={durations}
                            durationTypes={durationTypes}
                        />
                        <Button
                            onClick={() => setShowPieChart(!showPieChart)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {showPieChart ? "Hide Breakdown" : "Show Breakdown"}
                        </Button>
                    </div>

                    {showPieChart ? (
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                                <div className="mb-4">
                                    <label className="text-white/80 mr-2">Select Month:</label>
                                    <input
                                        type="month"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="bg-black/40 border-white/20 text-white px-2 py-1 rounded"
                                    />
                                </div>
                                <BudgetBreakdownChart budgets={budgetsWithSpent.filter(b => b.month === selectedMonth)} />
                            </div>
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {budgetsWithSpent.filter(b => b.month === selectedMonth).map((budget, idx) => (
                                    <BudgetProgressCard
                                        key={budget._id || idx}
                                        budget={budget}
                                        onUpdate={(updatedBudget) => handleUpdateBudget(budget._id, updatedBudget)}
                                        onDelete={() => handleDeleteBudget(budget._id)}
                                        transactions={transactions || []}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                ref={scrollRef}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-black/40"
                            >
                                {filteredBudgets.length > 0 ? (
                                    filteredBudgets.map((budget, idx) => (
                                        <BudgetProgressCard
                                            key={budget._id || idx}
                                            budget={budget}
                                            onUpdate={(updatedBudget) => handleUpdateBudget(budget._id, updatedBudget)}
                                            onDelete={() => handleDeleteBudget(budget._id)}
                                            transactions={transactions || []}
                                        />
                                    ))
                                ) : (
                                    <p className="text-white/50 col-span-3 text-center">No budgets found matching the filters.</p>
                                )}
                            </div>

                            {filteredBudgets.length > 6 && (
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