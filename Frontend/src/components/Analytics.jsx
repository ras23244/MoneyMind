// src/components/Analytics.jsx

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

// Placeholder for chart components
// You would replace these with actual chart library components (e.g., from Recharts, Chart.js)
const MonthlyTrendChart = () => (
    <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
        <p>Income vs. Expense Chart Placeholder</p>
    </div>
);

const CategoryBreakdownChart = () => (
    <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
        <p>Category Breakdown Chart Placeholder</p>
    </div>
);

const ComparativeChart = () => (
    <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
        <p>Comparative Chart Placeholder</p>
    </div>
);

const BudgetProgressCircle = ({ title, status, percentage }) => {
    const color = status === "On Track" ? "text-green-400" : status === "Near Limit" ? "text-yellow-400" : "text-red-400";
    const barColor = status === "On Track" ? "border-green-400" : status === "Near Limit" ? "border-yellow-400" : "border-red-400";
    return (
        <Card className="bg-[#1f1d1f] border-2 border-white/10 p-4 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center font-bold text-lg mb-2 ${barColor}`}>
                <span className={color}>{percentage}%</span>
            </div>
            <p className="text-white font-semibold">{title}</p>
            <p className={`text-sm ${color}`}>{status}</p>
        </Card>
    );
};



export default function Analytics() {
    const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
    const periods = ["This Month", "Last Month", "2 Months Ago"];

    const financialHealthScore = 85;
    const getScoreColor = (s) => (s >= 80 ? "text-green-400" : s >= 50 ? "text-yellow-400" : "text-red-400");
    const getScoreMessage = (s) => (s >= 80 ? "Excellent" : s >= 50 ? "Good" : "Needs Attention");

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-10">
            {/* Header and Period Selector */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Analytics</h1>
                <div className="flex items-center space-x-2 bg-[#1f1d1f] p-1 rounded-full border border-white/10">
                    <Button
                        onClick={() => setCurrentPeriodIndex(Math.min(currentPeriodIndex + 1, periods.length - 1))}
                        variant="ghost" size="sm" className="text-white/60 hover:bg-white/10 rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-white font-medium text-sm w-28 text-center">{periods[currentPeriodIndex]}</span>
                    <Button
                        onClick={() => setCurrentPeriodIndex(Math.max(currentPeriodIndex - 1, 0))}
                        variant="ghost" size="sm" className="text-white/60 hover:bg-white/10 rounded-full"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Financial Health Score & Top Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-[#1f1d1f] border border-white/10 p-6 flex flex-col items-center justify-center">
                    <CardTitle className="text-white/80 text-sm mb-2">Financial Health Score</CardTitle>
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                            <circle className={`stroke-current ${getScoreColor(financialHealthScore)}`} strokeWidth="10" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * financialHealthScore) / 100} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }} />
                        </svg>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                            <p className="font-bold text-3xl">{financialHealthScore}</p>
                            <p className="text-xs">{getScoreMessage(financialHealthScore)}</p>
                        </div>
                    </div>
                </Card>
                <Card className="bg-[#1f1d1f] border border-white/10 p-6 flex flex-col justify-center">
                    <CardTitle className="text-white/80 text-sm mb-2">Savings Rate</CardTitle>
                    <p className="text-4xl font-bold text-green-400">22%</p>
                    <div className="flex items-center text-sm mt-2 text-white/60">
                        <TrendingUp className="w-4 h-4 mr-1 text-green-400" /> up 5% from last month
                    </div>
                </Card>
                <Card className="bg-[#1f1d1f] border border-white/10 p-6 flex flex-col justify-center">
                    <CardTitle className="text-white/80 text-sm mb-2">Spending Hotspot</CardTitle>
                    <p className="text-4xl font-bold text-red-400">Dining Out</p>
                    <p className="text-sm mt-2 text-white/60">₹8,500 spent this month</p>
                </Card>
            </div>

            {/* Main Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <Card className="lg:col-span-2 bg-[#1f1d1f] border border-white/10 p-6">
                    <CardHeader>
                        <CardTitle className="text-white">Income vs. Expense</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonthlyTrendChart />
                    </CardContent>
                </Card>
                <Card className="bg-[#1f1d1f] border border-white/10 p-6">
                    <CardHeader>
                        <CardTitle className="text-white">Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CategoryBreakdownChart />
                    </CardContent>
                </Card>
            </div>

            {/* Comparative & Predictive Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-[#1f1d1f] border border-white/10 p-6">
                    <CardHeader>
                        <CardTitle className="text-white">Comparative Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ComparativeChart />
                        <p className="text-sm mt-4 text-white/60">
                            Your spending is **up by 5%** compared to last month.
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1f1d1f] border border-white/10 p-6">
                    <CardHeader>
                        <CardTitle className="text-white">Budget Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <BudgetProgressCircle title="Groceries" status="Near Limit" percentage={85} />
                        <BudgetProgressCircle title="Shopping" status="On Track" percentage={45} />
                        <BudgetProgressCircle title="Utilities" status="Exceeded" percentage={110} />
                        <BudgetProgressCircle title="Transport" status="On Track" percentage={70} />
                    </CardContent>
                </Card>
            </div>

            {/* Financial Story */}
            <Card className="bg-gradient-to-r from-purple-800 to-indigo-800 border-0 p-8 text-center shadow-lg">
                <CardTitle className="text-3xl font-bold text-white mb-2">Your Financial Story for 2024</CardTitle>
                <p className="text-xl text-white/80 mb-4">You saved <span className="text-green-300 font-bold">₹75,000</span> this year!</p>
                <p className="text-white/60 text-sm">Your biggest financial achievement was reaching your 'Emergency Fund' goal in Q3.</p>
                <Button variant="outline" className="mt-6 bg-white/20 text-white hover:bg-white/30 border-white/40">View Full Report</Button>
            </Card>
        </div>
    );
}

export { BudgetProgressCircle };