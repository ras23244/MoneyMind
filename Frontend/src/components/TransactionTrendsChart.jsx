import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { useTransactionTrends } from "./hooks/useTransactionTrends";

export default function TransactionTrendsChart({ userId }) {
    const today = new Date();
    const defaultEnd = today.toISOString().slice(0, 10);
    const defaultStart = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 29)
        .toISOString()
        .slice(0, 10);

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState(defaultEnd);
    const [granularity, setGranularity] = useState("day");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(30);

    const params = useMemo(() => ({ startDate, endDate, granularity, page, limit }), [startDate, endDate, granularity, page, limit]);

    const { data = [], isLoading, error, pagination } = useTransactionTrends(userId, params);

    const handlePrev = () => {
        if (page > 1) setPage((p) => p - 1);
    };
    const handleNext = () => {
        if (!pagination || page < pagination.pages) setPage((p) => p + 1);
    };

    // Reset to first page when filters change
    const handleStartDateChange = (v) => { setStartDate(v); setPage(1); };
    const handleEndDateChange = (v) => { setEndDate(v); setPage(1); };
    const handleGranularityChange = (v) => { setGranularity(v); setPage(1); };
    const handleLimitChange = (v) => { setLimit(Number(v)); setPage(1); };

    return (
        <Card className="lg:col-span-2 bg-card-dark border border-white/10">
            <CardHeader>
                <div className="flex items-start justify-between w-full gap-4">
                   

                    <div className="flex gap-2 items-center">
                        <label className="text-white/70 text-sm">From</label>
                        <input type="date" value={startDate} onChange={(e) => handleStartDateChange(e.target.value)} className="bg-black/40 border border-white/20 text-white p-1 rounded" />
                        <label className="text-white/70 text-sm">To</label>
                        <input type="date" value={endDate} onChange={(e) => handleEndDateChange(e.target.value)} className="bg-black/40 border border-white/20 text-white p-1 rounded" />

                        <select value={granularity} onChange={(e) => handleGranularityChange(e.target.value)} className="bg-black/40 border border-white/20 text-white p-1 rounded">
                            <option value="day">Day</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                        </select>

                        <select value={limit} onChange={(e) => handleLimitChange(e.target.value)} className="bg-black/40 border border-white/20 text-white p-1 rounded">
                            <option value={10}>10</option>
                            <option value={30}>30</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>

                        <button onClick={handlePrev} disabled={page <= 1} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Prev</button>
                        <div className="text-white/70 px-2">{page}{pagination ? ` / ${pagination.pages}` : ''}</div>
                        <button onClick={handleNext} disabled={pagination ? page >= pagination.pages : false} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50">Next</button>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-80">
                    {isLoading ? (
                        <p className="text-white">Loading trends...</p>
                    ) : error ? (
                        <p className="text-red-400">Error loading trends</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="rgba(255,255,255,0.4)"
                                    fontSize={12}
                                    tickFormatter={(value) => {
                                        try { return new Date(value).getDate().toString(); } catch (e) { return value; }
                                    }}
                                />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "rgba(0,0,0,0.8)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "8px",
                                        color: "white",
                                    }}
                                    formatter={(value, name) => [
                                        new Intl.NumberFormat("en-IN", {
                                            style: "currency",
                                            currency: "INR",
                                            minimumFractionDigits: 0,
                                        }).format(Math.abs(Number(value))),
                                        name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Net",
                                    ]}
                                    labelFormatter={(label) => {
                                        try {
                                            return new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(label));
                                        } catch (e) { return label; }
                                    }}
                                />
                                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
                                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
