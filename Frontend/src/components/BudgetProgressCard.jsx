import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AddBudgetDialog from "./AddBudgetDialog";
import BudgetTransactionsDialog from "./BudgetTransactionsDialog";

export default function BudgetProgressCard({ budget, onUpdate, onDelete, transactions = [] }) {
    const [openEdit, setOpenEdit] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Calculate percent safely
    const percent = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
    let barColor = "bg-green-500";
    if (percent >= 80 && percent < 100) barColor = "bg-yellow-500";
    if (percent >= 100) barColor = "bg-red-600";
    console.log("transacton from budpc", transactions || []);

    // Filter transactions for this budget
    const budgetTxs = transactions.filter(
        tx =>
            tx.type === "expense" &&
            (tx.category === budget.category || tx.tags.includes(budget.category))
    );

    return (
        <Card className="bg-card-dark border border-white/10 group relative">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    {budget.category}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 ml-2"
                        onClick={() => setShowDetails(true)}
                        title="View Details"
                    >
                        <span className="underline">Details</span>
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>₹{budget.spent.toLocaleString("en-IN")} spent</span>
                    <span>₹{budget.amount.toLocaleString("en-IN")}</span>
                </div>
                <Progress
                    value={percent > 100 ? 100 : percent}
                    className={`h-3 bg-gray-700 
                            ${percent >= 100 ? "[&>div]:bg-red-600" :
                            percent >= 80 ? "[&>div]:bg-yellow-500" :
                                "[&>div]:bg-green-500"}`}

                />
                {percent >= 100 && (
                    <p className="text-red-400 text-xs mt-2">Budget exceeded!</p>
                )}
                <div className="flex gap-2 mt-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-white border-white/30"
                        onClick={() => setOpenEdit(true)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-400 border-white/30"
                        onClick={onDelete}
                    >
                        Delete
                    </Button>
                </div>
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
            </CardContent>
        </Card>
    );
}
