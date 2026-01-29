import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import ForecastChart from './ForecastChart';
import CategoryBreakdown from './dashboard/CategoryBreakdown';
import InsightsPanel from './dashboard/InsightsPanel';
import { useUser } from "../context/UserContext";
import { useBudgets } from "./hooks/useBudgets";
import { useGoals } from "./hooks/useGoals";
import { useCategoryBreakdown } from './hooks/useAggregatedData';
import { useFinancialSummary } from "./hooks/useFinancialSummary";

const MonthlyTrendChart = () => (
    <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
        <p>Income vs. Expense Chart Placeholder</p>
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
    const { user } = useUser();
    const { data: budgets = [] } = useBudgets(user?._id);
    const { data: goals = [] } = useGoals(user?._id);
    const { data: categoryBreakdown = [] } = useCategoryBreakdown(user?._id);
    const { data: financialSummary = {} } = useFinancialSummary(user?._id);

    const formatCurrency = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(Math.abs(amount));

    const budgetsUi = budgets.map(b => ({
        name: b.category || 'Other',
        spent: Number(b.spent) || 0,
        limit: Number(b.amount) || 0,
    }));

    const goalsUi = goals.map(g => ({
        name: g.title || g.name || 'Goal',
        current: Number(g.currentAmount ?? g.current) || 0,
        target: Number(g.targetAmount ?? g.target) || 0,
    }));

    const [currentPeriodIndex, setCurrentPeriodIndex] = useState(0);
    const periods = ["This Month", "Last Month", "2 Months Ago"];

    const financialHealthScore = 85;
    const getScoreColor = (s) => (s >= 80 ? "text-green-400" : s >= 50 ? "text-yellow-400" : "text-red-400");
    const getScoreMessage = (s) => (s >= 80 ? "Excellent" : s >= 50 ? "Good" : "Needs Attention");

    const CategoryBreakdownChart = () => (
        <CategoryBreakdown categoryBreakdown={categoryBreakdown} monthlyExpenses={financialSummary.monthlyExpenses || 0} />
    );
    return (
        <div className="min-h-screen bg-background text-white ">
            {/* Header and Period Selector */}
            <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold">Analytics</h1>
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

           

            {/* Comparative & Predictive Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card className="bg-[#1f1d1f] border border-white/10 p-6">
                    <CardHeader>
                        <CardTitle className="text-white">Comparative & Predictive Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ForecastChart />
                        <p className="text-sm mt-4 text-white/60">
                            Your projected monthly net values are shown (dashed line).
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-[#1f1d1f] border border-white/10 p-6">
                    <CardHeader>
                        <CardTitle className="text-white">Top Budgets & Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InsightsPanel budgets={budgetsUi} goals={goalsUi} currency={(n) => `₹${n}`} />
                    </CardContent>
                </Card>
            </div>


        </div>
    );
}

export { BudgetProgressCircle };