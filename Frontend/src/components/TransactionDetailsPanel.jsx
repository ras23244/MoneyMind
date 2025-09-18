import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function TransactionDetailsPanel({ transaction, onClose }) {
    if (!transaction) return null;  // ✅ Move this to the very top

    const modalRef = useRef(null);

    // Close modal when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 ">
            <div
                ref={modalRef}
                className="w-full max-w-md bg-card-dark rounded-2xl shadow-2xl animate-fade-in border border-white/20"
            >
                <Card className="border-none bg-transparent">
                    <CardHeader className="flex justify-between items-center border-b border-white/10">
                        <CardTitle className="text-white">Transaction Details</CardTitle>
                        <button
                            onClick={onClose}
                            className="text-white/60 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </CardHeader>
                    <CardContent className="text-white space-y-4 mt-4 ">
                        <div>
                            <p className="text-sm text-white/60">Description</p>
                            <p className="text-lg">{transaction.description}</p>
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Amount</p>
                            <p
                                className={`text-xl font-bold ${transaction.type === "income"
                                        ? "text-green-400"
                                        : "text-red-400"
                                    }`}
                            >
                                {transaction.type === "income" ? "+" : "-"} ₹
                                {transaction.amount.toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Category</p>
                            <p>{transaction.category}</p>
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Tags</p>
                            <p>{transaction.tags?.join(", ") || "None"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-white/60">Date</p>
                            <p>{new Date(transaction.date).toLocaleString()}</p>
                        </div>
                      
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
