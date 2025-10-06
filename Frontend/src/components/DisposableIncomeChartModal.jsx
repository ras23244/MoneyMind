// src/components/DisposableIncomeChartModal.jsx
import React, { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, BarChart2, X } from "lucide-react"; // Added X for close button
import { Button } from "@/components/ui/button";

export default function DisposableIncomeChartModal({ data, open, setOpen }) {
    const [view, setView] = useState("monthly"); // 'monthly' | 'cumulative'

    if (!open) return null; // Don't render anything if modal is closed

    // Compute cumulative data
    const cumulativeData = data.map((item, idx) => ({
        ...item,
        cumulative: data
            .slice(0, idx + 1)
            .reduce((sum, cur) => sum + cur.disposable, 0),
    }));

    const displayedData =
        view === "monthly"
            ? data
            : cumulativeData.map((d) => ({ ...d, disposable: d.cumulative }));

    // Format month short
    const formatMonth = (monthStr) => {
        const date = new Date(`${monthStr}-01`); // e.g., "2025-01-01"
        return date.toLocaleString("default", { month: "short" }); // "Jan", "Feb"
    };


    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const value = payload[0].value;
            return (
                <div className="bg-white dark:bg-gray-800 p-2 rounded shadow text-sm">
                    {view === "monthly" ? `Monthly: ₹${value}` : `Cumulative: ₹${value}`}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            <div className="w-full max-w-3xl p-4">
                <Card className="relative">
                    {/* Close Button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 hover:bg-red-900"
                        onClick={() => setOpen(false)}
                    >
                        <X size={20} />
                    </Button>

                    <CardHeader className="flex justify-between items-center">
                        <CardTitle>
                            {view === "monthly"
                                ? "Monthly Disposable Income"
                                : "Cumulative Disposable Income"}
                        </CardTitle>
                        <Button
                        className="mr-6 hover:bg-gray-200 dark:hover:bg-gray-700"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                                setView((prev) =>
                                    prev === "monthly" ? "cumulative" : "monthly"
                                )
                            }
                        >
                            {view === "monthly" ? <TrendingUp size={20} /> : <BarChart2 size={20} />}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={displayedData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={formatMonth}
                                    stroke="#8884d8"
                                />
                                <YAxis stroke="#8884d8" />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="disposable"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
