import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import AddBudgetDialog from "./AddBudgetDialog";

export default function MonthlyBudgetCard({ budgets }) {
    const [open, setOpen] = useState(false);

    if (!budgets || budgets.length === 0) {
        return (
            <Card className="bg-card-dark border border-white/10">
                <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-white">Monthly Budget</CardTitle>

                </CardHeader>
                <CardContent>
                    <p className="text-white/60 text-sm">No budgets set for this month.</p>
                </CardContent>

                <AddBudgetDialog open={open} onOpenChange={setOpen} />
            </Card>
        );
    }

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const percent = (totalSpent / totalBudget) * 100;

    let barColor = "bg-green-500";
    if (percent >= 80 && percent < 100) barColor = "bg-yellow-500";
    if (percent >= 100) barColor = "bg-red-600";

    return (
        <Card className="bg-card-dark border border-white/10">
            <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-white">Monthly Budget</CardTitle>
                <span className="text-xs text-white/60">
                    {budgets[0]?.durationType === "day"
                        ? `Daily Budget (${budgets[0]?.day})`
                        : `Duration: ${budgets[0]?.duration || 1} month(s)`}
                </span>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>₹{totalSpent.toLocaleString("en-IN")} spent</span>
                    <span>₹{totalBudget.toLocaleString("en-IN")}</span>
                </div>
                <Progress
                    value={percent > 100 ? 100 : percent}
                    className={`h-3 bg-gray-700 
    ${percent >= 100 ? "[&>div]:bg-red-600" :
                            percent >= 80 ? "[&>div]:bg-yellow-500" :
                                "[&>div]:bg-green-500"}`}
                />
                {percent >= 100 && (
                    <p className="text-red-400 text-xs mt-2">Monthly budget exceeded!</p>
                )}
            </CardContent>
        </Card>
    );
}
