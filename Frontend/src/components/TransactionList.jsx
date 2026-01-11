import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Search, Download, Calendar as CalendarIcon, TrendingUp, TrendingDown, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TransactionList({
    transactions = [],
    search,
    setSearch,
    formatCurrency,
    handleEdit,
    handleDelete,
    limit,
    setLimit,
    setSelectedTransaction,
    selectedDate,
}) {
    console.log("selectedDate in TransactionList:", selectedDate);

    const formattedDate = selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : '';

    return (
        <Card className="bg-card-dark border border-white/10 mt-6">
            <CardHeader>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-white">
                            Transactions for {formattedDate}
                        </CardTitle>
                        <p className="text-white/60 text-sm mt-1">
                            {transactions.length} transaction(s) found
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-white/40" />
                            <Input
                                placeholder="Search transactions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 bg-card border-white/10 text-white"
                            />
                        </div>
                       
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {transactions.length > 0 ? (
                        transactions.slice(0, limit).map((transaction) => (
                            <div
                                key={transaction._id}
                                onClick={() => setSelectedTransaction(transaction)}
                                className="flex items-center justify-between cursor-pointer p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-400/20" : "bg-red-400/20"
                                            }`}
                                    >
                                        {transaction.type === "income" ? (
                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{transaction.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className="bg-white/10 text-white/70 text-xs">
                                                {transaction.category}
                                            </Badge>
                                            <span className="text-xs text-white/50">{transaction.bankName}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount + Hover Actions */}
                                <div className="flex items-center gap-3">
                                    <p
                                        className={`font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"
                                            }`}
                                    >
                                        {transaction.type === "income" ? "+" : ""}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-yellow-400 hover:text-yellow-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(transaction);
                                            }}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-red-400 hover:text-red-300"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(transaction._id);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">No transactions found</p>
                            <p className="text-white/40 text-sm mt-1">Try adjusting search</p>
                        </div>
                    )}

                    {transactions.length > limit && (
                        <div className="text-center mt-4">
                            <Button
                                variant="outline"
                                className="border-white/20 text-white"
                                onClick={() => setLimit((prevLimit) => prevLimit + 5)}
                            >
                                Show More
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}