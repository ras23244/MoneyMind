import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddBudgetDialog({ open, setOpen, onSave, initialBudget }) {
    const [form, setForm] = useState({ category: "", amount: "", spent: "" });

    useEffect(() => {
        if (initialBudget) {
            setForm({
                category: initialBudget.category || "",
                amount: initialBudget.amount || "",
                spent: initialBudget.spent || "",
            });
        } else {
            setForm({ category: "", amount: "", spent: "" });
        }
    }, [initialBudget, open]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (!form.category || !form.amount) return;
        onSave({
            category: form.category,
            amount: Number(form.amount),
            spent: form.spent !== "" ? Number(form.spent) : undefined,
        });
        setForm({ category: "", amount: "", spent: "" });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-[#242124] border border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>{initialBudget ? "Edit Budget" : "Add New Budget"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label className="text-white/80 mb-1">Category</Label>
                        <Input
                            name="category"
                            placeholder="e.g. Food, Rent, Shopping"
                            value={form.category}
                            onChange={handleChange}
                            className="bg-black/40 border-white/20 text-white mt-2"
                        />
                    </div>
                    <div>
                        <Label className="text-white/80">Amount (₹)</Label>
                        <Input
                            name="amount"
                            type="number"
                            placeholder="Enter budget amount"
                            value={form.amount}
                            onChange={handleChange}
                            className="bg-black/40 border-white/20 text-white mt-2"
                        />
                    </div>
                    <div>
                        <Label className="text-white/80">Already Spent (₹)</Label>
                        <Input
                            name="spent"
                            type="number"
                            placeholder="Optional"
                            value={form.spent}
                            onChange={handleChange}
                            className="bg-black/40 border-white/20 text-white mt-2"
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {initialBudget ? "Update Budget" : "Save Budget"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}