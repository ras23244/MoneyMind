import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GoalMoneyDialog({ open, setOpen, goal, type, onSubmit }) {
    const [amount, setAmount] = useState("");
    const [hoverState, setHoverState] = useState(null);

    const handleSubmit = () => {
        if (!amount || !goal) return;
        onSubmit(goal, Number(amount), type);
        setAmount("");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-[#242124] border border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>
                        {type === "add" ? "Add Money to Goal" : "Withdraw Money from Goal"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="bg-black/40 border-white/20 text-white"
                    />

                    <div className="flex flex-col items-center">
                        <div className="h-8 flex items-center justify-center">
                            {hoverState === "add" && (
                                <span className="text-3xl animate-bounce">😊</span>
                            )}
                            {hoverState === "withdraw" && (
                                <span className="text-3xl animate-bounce">😢</span>
                            )}
                        </div>

                        <div className="w-full">
                            <Button
                                onClick={handleSubmit}
                                onMouseEnter={() => setHoverState(type)}
                                onMouseLeave={() => setHoverState(null)}
                                className={`w-full ${type === "add"
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-red-600 hover:bg-red-700"
                                    } text-white`}
                            >
                                {type === "add" ? "Add" : "Withdraw"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
