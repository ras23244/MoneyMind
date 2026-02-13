// src/components/ConnectedAccounts.jsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function ConnectedAccounts({ connectedBanks, formatCurrency, navigate }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedBanks.map((bank, idx) => (
                <Card key={idx} onClick={() => navigate?.("/dashboard")} className="bg-card-dark border border-white/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-white font-semibold">{bank.name}</h4>
                                    <p className="text-white/60 text-sm">{bank.accountType}</p>
                                </div>
                            </div>
                            <div className="w-2 h-2 bg-green-400 rounded-full" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-bold text-white">{formatCurrency(bank.balance)}</p>
                            <p className="text-white/50 text-xs">Last sync: {bank.lastSync}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
