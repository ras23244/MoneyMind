// src/components/RecentTransactions.jsx
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function RecentTransactions({ recentTransactions, formatCurrency }) {
    return (
        <Card className="lg:col-span-2 bg-card-dark border border-white/10">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Recent Transactions</CardTitle>
                    <Button variant="outline" size="sm" className="border-white/20 text-white">
                        <Search className="w-4 h-4 mr-2" />
                        Search
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-400/20" : "bg-red-400/20"}`}>
                                    {transaction.type === "income" ? (
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                    ) : (
                                        <TrendingDown className="w-4 h-4 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-white">{transaction.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                                            {transaction.category}
                                        </Badge>
                                        <span className="text-xs text-white/50">{transaction.bank}</span>
                                    </div>
                                </div>
                            </div>
                            <p className={`font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}>
                                {transaction.type === "income" ? "+" : ""}{formatCurrency(transaction.amount)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
            <div className="flex justify-center items-center">
                <Button variant="outline" size="sm" className="border-white/20 text-white">
                    View All
                </Button>
            </div>
        </Card>
    );
}
