import React, { useState } from "react";
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

export default function Budgets() {
    const { user } = useUser();
    const month = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const { data: budgets = [], isLoading } = useBudgets(user?._id, month);
    const { data: transactions = [] } = useTransactions(user?._id);
    const createBudgetMutation = useCreateBudget(user?._id, month);
    const updateBudgetMutation = useUpdateBudget(user?._id, month);
    const deleteBudgetMutation = useDeleteBudget(user?._id, month);

    const [openDialog, setOpenDialog] = useState(false);
    const [showPieChart, setShowPieChart] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(month);

    // Calculate totals
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const disposableIncome = totalBudget - totalSpent;

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

    const budgetsWithSpent = budgets.map(budget => {
        // Calculate spent from transactions
        const transactionSpent = transactions
            .filter(tx =>
                tx.type === "expense" &&
                tx.date.startsWith(month) &&
                (tx.category === budget.category || tx.tags.includes(budget.category))
            )
            .reduce((sum, tx) => sum + tx.amount, 0);

        // Add user-entered spent (if any) to transaction spent
        const manualSpent = Number(budget.spent) || 0;
        const spent = transactionSpent + manualSpent;

        return { ...budget, spent };
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Budgets</h1>
                <div className="flex gap-2">
                    <Button
                        onClick={() => setOpenDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Budget
                    </Button>
                    <Button
                        onClick={() => setShowPieChart(!showPieChart)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        {showPieChart ? "Hide Breakdown" : "Show Breakdown"}
                    </Button>
                </div>
            </div>
            <MonthlyBudgetCard budgets={budgets} />
            {showPieChart ? (
                <div className="flex gap-6">
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
                        {/* Status message */}
                        <div className={`mb-4 text-lg font-semibold ${savedOrOverspent >= 0 ? "text-green-400" : "text-red-400"
                            }`}>
                            {statusMessage}
                        </div>
                        <BudgetBreakdownChart budgets={budgets.filter(b => b.month === selectedMonth && b.category !== "Monthly")} />
                    </div>
                    <div className="flex-1">
                        {/* Show budget cards for selected month */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {selectedMonthBudgets.map((budget, idx) => (
                                <BudgetProgressCard
                                    key={budget._id || idx}
                                    budget={budget}
                                    onUpdate={updatedBudget => handleUpdateBudget(budget._id, updatedBudget)}
                                    onDelete={() => handleDeleteBudget(budget._id)}
                                    transactions={transactions || []}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Default view */}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {budgetsWithSpent
                            .filter(b => b.category !== "Monthly")
                            .map((budget, idx) => (
                                <BudgetProgressCard
                                    key={budget._id || idx}
                                    budget={budget}
                                    onUpdate={updatedBudget => handleUpdateBudget(budget._id, updatedBudget)}
                                    onDelete={() => handleDeleteBudget(budget._id)}
                                    transactions={transactions || []}
                                />
                            ))}
                    </div>
                </>
            )}
            <AddBudgetDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onSave={handleAddBudget}
            />
        </div>
    );
}