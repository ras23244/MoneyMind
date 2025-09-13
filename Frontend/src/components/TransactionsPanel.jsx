// src/components/TransactionsPanel.jsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function TransactionsPanel({
    transactionTrendData,
    selectedDate,
    setSelectedDate,
    allTransactions,
    formatCurrency,
    getTransactionsByDate,
})
{


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 bg-card-dark border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Transaction Trends</CardTitle>
                        <p className="text-white/60 text-sm">Daily income vs expenses over time</p>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={transactionTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickFormatter={(value) => new Date(value).getDate().toString()} />
                                    <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "rgba(0,0,0,0.8)",
                                            border: "1px solid rgba(255,255,255,0.1)",
                                            borderRadius: "8px",
                                            color: "white",
                                        }}
                                        formatter={(value, name) => [`$${Math.abs(Number(value)).toLocaleString()}`, name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Net"]}
                                        labelFormatter={(label) => new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(new Date(label))}
                                    />
                                    <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }} />
                                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }} />
                                    <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", strokeWidth: 2, r: 5 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card-dark border border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">Select Date</CardTitle>
                        <p className="text-white/60 text-sm">Click a date to view transactions</p>
                    </CardHeader>
                    <CardContent>
                        <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} className="w-full bg-transparent text-white border-0" />
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-card-dark border border-white/10 mt-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white">Transactions for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
                            <p className="text-white/60 text-sm mt-1">{getTransactionsByDate(selectedDate).length} transaction(s) found</p>
                        </div>
                        <CalendarIcon className="w-5 h-5 text-white/40" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {getTransactionsByDate(selectedDate).length > 0 ? (
                            getTransactionsByDate(selectedDate).map((transaction) => (
                                <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-400/20" : "bg-red-400/20"}`}>
                                            {transaction.type === "income" ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{transaction.description}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">{transaction.category}</Badge>
                                                <span className="text-xs text-white/50">{transaction.bank}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>{transaction.type === "income" ? "+" : ""}{formatCurrency(transaction.amount)}</p>
                                        <p className="text-xs text-white/40 mt-1">{new Date(transaction.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                <p className="text-white/60">No transactions found for this date</p>
                                <p className="text-white/40 text-sm mt-1">Try selecting a different date</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
