// src/components/BalanceCards.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowUpRight, ArrowDownRight, PiggyBank } from "lucide-react";

export default function BalanceCards({
    financialSummary,
    isBalanceVisible,
    setIsBalanceVisible,
    formatCurrency,
}) {
    if (!financialSummary) return null;

    const formatPercentage = (val) =>
        val >= 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Balance */}
            <Card className="bg-slate-900/70 border border-white/10 rounded-xl hover:border-blue-400/40 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
                <CardContent className="p-4 md:p-5">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-slate-400">Total Balance</p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                            className="p-1 text-slate-400 hover:text-white/80"
                        >
                            {isBalanceVisible ? (
                                <Eye className="w-4 h-4" />
                            ) : (
                                <EyeOff className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    <h3 className="text-xl md:text-2xl font-semibold text-white mt-1">
                        {isBalanceVisible
                            ? formatCurrency(financialSummary.totalBalance)
                            : "••••••"}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Net Worth • {formatCurrency(financialSummary.netWorth ?? 0)}
                    </p>
                </CardContent>
            </Card>

            {/* Income */}
            <Card className="bg-slate-900/70 border border-white/10 rounded-xl hover:border-green-400/40 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
                <CardContent className="p-3 md:p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowUpRight className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-slate-400">Income</span>
                    </div>
                    <p className="text-lg md:text-xl font-semibold text-green-400 leading-tight">
                        {formatCurrency(financialSummary.monthlyIncome)}
                    </p>
                    <p className="text-[11px] text-green-400/70 mt-1">
                        {formatPercentage(financialSummary.incomeChange)} from last month
                    </p>
                </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="bg-slate-900/70 border border-white/10 rounded-xl hover:border-red-400/40 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/10">
                <CardContent className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <ArrowDownRight className="w-4 h-4 text-red-400" />
                        <span className="text-xs text-slate-400">Expenses</span>
                    </div>
                    <p className="text-lg md:text-xl font-semibold text-red-400 leading-tight">
                        {formatCurrency(financialSummary.monthlyExpenses)}
                    </p>
                    <p className="text-[11px] text-red-400/70 mt-1">
                        {formatPercentage(financialSummary.expensesChange)} from last month
                    </p>
                </CardContent>
            </Card>

            {/* Savings */}
            <Card className="bg-slate-900/70 border border-white/10 rounded-xl hover:border-blue-400/40 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
                <CardContent className="p-4 md:p-5">
                    <div className="flex items-center gap-2 mb-1">
                        <PiggyBank className="w-4 h-4 text-blue-400" />
                        <span className="text-xs text-slate-400">Savings</span>
                    </div>
                    <p className="text-lg md:text-xl font-semibold text-blue-400 leading-tight">
                        {formatCurrency(financialSummary.monthlySavings)}
                    </p>
                    <p className="text-[11px] text-blue-400/70 mt-1">
                        {formatPercentage(financialSummary.savingsChange)} from last month
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
