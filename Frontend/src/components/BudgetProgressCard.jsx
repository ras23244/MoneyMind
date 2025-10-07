import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AddBudgetDialog from "./AddBudgetDialog";
import BudgetTransactionsDialog from "./BudgetTransactionsDialog";

export default function BudgetProgressCard({ budget, onUpdate, onDelete, transactions = [] }) {
    const [openEdit, setOpenEdit] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Calculate percent safely
    const percent = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    const safePercent = Math.min(percent, 100);

    let barColor = "bg-green-500";
    if (percent >= 80 && percent < 100) barColor = "bg-yellow-500";
    if (percent >= 100) barColor = "bg-red-600";

    // Filter transactions for this budget
    const budgetTxs = transactions.filter((tx) => {
        if (tx.type !== "expense") return false;

        // Normalize categories to lowercase for case-insensitive comparison
        const budgetCategory = budget.category?.toLowerCase();
        const txCategory = tx.category?.toLowerCase();
        const txTags = tx.tags?.map((tag) => tag.toLowerCase()) || [];

        const matchesCategory =
            txCategory === budgetCategory || txTags.includes(budgetCategory);

        if (!matchesCategory) return false;

        // Get transaction date
        const txDate = new Date(tx.date || tx.createdAt);

        // Compare based on duration type
        if (budget.durationType === "day") {
            // Compare YYYY-MM-DD
            const txDay = txDate.toISOString().split("T")[0];
            return txDay === budget.day;
        }

        if (budget.durationType === "month") {
            // Compare YYYY-MM
            const txMonth = txDate.toISOString().slice(0, 7);
            return txMonth === budget.month;
        }

        // Default: not included
        return false;
    });


    return (
        <Card className="bg-[#1f1d1f] border border-white/10 shadow-lg rounded-2xl hover:bg-white/10 relative">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span className="truncate">{budget.category}</span>

                    {/* Dropdown Menu (3 dots) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-full hover:bg-white/10">
                                <MoreVertical className="w-5 h-5 text-white" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#242124] border border-white/10 text-gray-300 rounded-xl shadow-lg py-2">
                            <DropdownMenuItem
                                className="hover:bg-white/10 rounded-xl"
                                onClick={() => setShowDetails(true)}
                            >
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-white/10 rounded-xl"
                                onClick={() => setOpenEdit(true)}
                            >
                                Edit Budget
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="hover:bg-white/10 rounded-xl text-red-400"
                                onClick={onDelete}
                            >
                                Delete Budget
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/60">Progress</span>
                        <span className="text-white font-medium">{Math.round(percent)}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${safePercent}%` }}
                        />
                    </div>
                </div>

                {/* Amounts */}
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-green-400">₹{budget.spent.toLocaleString("en-IN")}</span>
                    <span className="text-white/70">₹{budget.amount.toLocaleString("en-IN")}</span>
                </div>

                {/* Warning */}
                {percent >= 100 && (
                    <p className="text-red-400 text-xs mt-2">Budget exceeded!</p>
                )}
            </CardContent>

            {/* Modals */}
            <AddBudgetDialog
                open={openEdit}
                setOpen={setOpenEdit}
                onSave={(updatedBudget) => {
                    onUpdate(updatedBudget);
                    setOpenEdit(false);
                }}
                initialBudget={budget}
            />
            <BudgetTransactionsDialog
                open={showDetails}
                setOpen={setShowDetails}
                transactions={budgetTxs}
                category={budget.category}
            />
        </Card>
    );
}
