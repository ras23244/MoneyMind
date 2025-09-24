import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function BudgetTransactionsDialog({ open, setOpen, transactions, category }) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-[#242124] border border-white/10 max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Transactions for <span className="text-blue-400">{category}</span>
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {transactions.length === 0 ? (
                        <p className="text-white/60 text-center">No transactions found for this category.</p>
                    ) : (
                        transactions.map(tx => (
                            <Card key={tx._id} className="bg-black/40 border border-white/10">
                                <CardContent className="py-2 px-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-white font-semibold">{tx.description}</div>
                                            <div className="text-xs text-white/60">
                                                {new Date(tx.date).toLocaleString("en-IN")}
                                            </div>
                                        </div>
                                        <div className="text-green-400 font-bold text-lg">
                                            ₹{tx.amount.toLocaleString("en-IN")}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}