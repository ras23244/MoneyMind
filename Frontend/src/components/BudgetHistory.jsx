// src/components/History.jsx
import React, { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BudgetProgressCard from "./BudgetProgressCard";

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default function BudgetHistory({ budgets, transactions }) {
    const scrollRef = useRef(null);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);

    // Group budgets by month
    const groupedBudgets = budgets.reduce((acc, budget) => {
        const key = budget.durationType === 'day' ?
            dayjs(budget.day).format('YYYY-MM') :
            budget.month;

        if (!acc[key]) acc[key] = [];
        acc[key].push(budget);
        return acc;
    }, {});



    return (
        <Card className="bg-card-dark border border-white/10 mt-8">
            <CardHeader>
                <CardTitle className="text-white">History</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    ref={scrollRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-black/40"
                >
                    {Object.entries(groupedBudgets).length === 0 ? (
                        <p className="text-white/60">No past budgets yet.</p>
                    ) : (
                        Object.entries(groupedBudgets)
                            .sort(([a], [b]) => b.localeCompare(a)) // Sort months in descending order
                            .map(([month, monthBudgets]) => (
                                <div key={month} className="col-span-3">
                                    <h3 className="text-white/80 text-lg mb-4 mt-2">
                                        {dayjs(month).format('MMMM YYYY')}
                                        <span className="text-sm text-white/40 ml-2">
                                            ({dayjs(month).fromNow()})
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {monthBudgets.map((budget, idx) => (
                                            <BudgetProgressCard
                                                key={budget._id || idx}
                                                budget={budget}
                                                transactions={transactions}
                                                isHistory={true}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}