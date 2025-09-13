// src/components/BalanceCards.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";

export default function BalanceCards({ userData, isBalanceVisible, setIsBalanceVisible, formatCurrency }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-balance-card border border-white/10 shadow-elegant hover:bg-white/10">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-balance-text text-sm">Total Balance</p>
                            <div className="flex items-center gap-2 mt-1">
                                <h3 className="text-2xl font-bold text-white">{formatCurrency(userData.totalBalance)}</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                                    className="p-1 text-white/40 hover:text-white/70"
                                >
                                    {isBalanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card-dark border border-white/10 hover:bg-white/10">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                        <span className="text-white/70 text-sm">Income</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(userData.monthlyIncome)}</p>
                    <p className="text-green-400/60 text-xs mt-1">+12.5% from last month</p>
                </CardContent>
            </Card>

            <Card className="bg-card-dark border border-white/10 hover:bg-white/10">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                        <span className="text-white/70 text-sm">Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(userData.monthlyExpenses)}</p>
                    <p className="text-red-400/60 text-xs mt-1">+8.2% from last month</p>
                </CardContent>
            </Card>

            <Card className="bg-card-dark border border-white/10 hover:bg-white/10">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <PiggyBank className="w-5 h-5 text-blue-400" />
                        <span className="text-white/70 text-sm">Savings</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(userData.monthlySavings)}</p>
                    <p className="text-blue-400/60 text-xs mt-1">+15.3% from last month</p>
                </CardContent>
            </Card>
        </div>
    );
}
