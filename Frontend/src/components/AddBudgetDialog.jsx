import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import budgetImages from "../data/budgetImages";

export default function AddBudgetDialog({ open, setOpen, onSave, initialBudget }) {
    const [form, setForm] = useState({
        category: "",
        amount: "",
        spent: "",
        duration: 1,
        durationType: "month",
        day: "",
    });
    const [error, setError] = useState("");

    useEffect(() => {
        if (initialBudget) {
            setForm({
                category: initialBudget.category || "",
                amount: initialBudget.amount || "",
                spent: initialBudget.spent || "",
                duration: initialBudget.duration || 1,
                durationType: initialBudget.durationType || "month",
                day: initialBudget.day || "",
            });
        } else {
            setForm({
                category: "",
                amount: "",
                spent: "",
                duration: 1,
                durationType: "month",
                day: "",
            });
        }
        setError("");
    }, [initialBudget, open]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = () => {
        if (!form.category || !form.amount) return;
        if (form.durationType === "month" && Number(form.duration) > 12) {
            setError("Budgets beyond 12 months are not allowed.");
            return;
        }
        if (form.durationType === "day" && !form.day) {
            setError("Please select a date for daily budget.");
            return;
        }
        onSave({
            category: form.category,
            amount: Number(form.amount),
            spent: form.spent !== "" ? Number(form.spent) : undefined,
            duration: Number(form.duration),
            durationType: form.durationType,
            day: form.durationType === "day" ? form.day : undefined,
        });
        setForm({
            category: "",
            amount: "",
            spent: "",
            duration: 1,
            durationType: "month",
            day: "",
        });
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
                        <div className="relative">
                            {/* Input for typing */}
                            <Input
                                name="category"
                                placeholder="Select or type category"
                                value={form.category}
                                onChange={handleChange}
                                className="bg-black/40 border-white/20 text-white pr-10 mt-2"
                            />

                            {/* Dropdown for predefined categories */}
                            <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value })}>
                                <SelectTrigger className="absolute top-0 right-0 h-full w-8 border-0 bg-transparent text-white flex items-center justify-center cursor-pointer">
                                </SelectTrigger>
                                <SelectContent className="bg-[#242124] border-white/10 text-white max-h-60 overflow-y-auto">
                                    {Object.keys(budgetImages)
                                        .filter((c) => c !== "default")
                                        .map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
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
                    <div>
                        <Label className="text-white/80">Budget Type</Label>
                        <select
                            name="durationType"
                            value={form.durationType}
                            onChange={handleChange}
                            className="bg-black/40 border-white/20 text-white mt-2 p-2 rounded"
                        >
                            <option value="month">Monthly Budget</option>
                            <option value="day">Daily Budget</option>
                        </select>
                    </div>
                    {form.durationType === "month" ? (
                        <div>
                            <Label className="text-white/80">Duration (months)</Label>
                            <Input
                                name="duration"
                                type="number"
                                min={1}
                                max={12}
                                value={form.duration}
                                onChange={handleChange}
                                className="bg-black/40 border-white/20 text-white mt-2"
                            />
                        </div>
                    ) : (
                        <div>
                            <Label className="text-white/80">Date</Label>
                            <Input
                                name="day"
                                type="date"
                                value={form.day}
                                onChange={handleChange}
                                className="bg-black/40 border-white/20 text-white mt-2"
                            />
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm">{error}</p>}
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