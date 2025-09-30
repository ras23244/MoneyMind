import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddGoalDialog({ open, setOpen, onSave, goal }) {
    const [form, setForm] = useState({
        title: "",
        description: "",
        targetAmount: "",
        currentAmount: "",
        startDate: "",
        endDate: "",
        priority: 1,
    });

    // Autofill when editing
    useEffect(() => {
        if (goal) {
            setForm({
                title: goal.title || "",
                description: goal.description || "",
                targetAmount: goal.targetAmount || "",
                currentAmount: goal.currentAmount || "",
                startDate: goal.startDate ? goal.startDate.slice(0, 10) : "",
                endDate: goal.endDate ? goal.endDate.slice(0, 10) : "",
                priority: goal.priority || 1,
            });
        } else {
            setForm({
                title: "",
                description: "",
                targetAmount: "",
                currentAmount: "",
                startDate: "",
                endDate: "",
                priority: 1,
            });
        }
    }, [goal, open]);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = () => {
        if (!form.title || !form.targetAmount || !form.startDate || !form.endDate) return;

        onSave({
            ...form,
            id: goal?._id, 
            targetAmount: Number(form.targetAmount),
            currentAmount: Number(form.currentAmount) || 0,
            priority: Number(form.priority) || 1,
        });

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-[#242124] border border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>{goal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Label>Title</Label>
                    <Input name="title" value={form.title} onChange={handleChange} />
                    <Label>Description</Label>
                    <Input name="description" value={form.description} onChange={handleChange} />
                    <Label>Target Amount</Label>
                    <Input name="targetAmount" type="number" value={form.targetAmount} onChange={handleChange} />
                    <Label>Current Amount</Label>
                    <Input name="currentAmount" type="number" value={form.currentAmount} onChange={handleChange} />
                    <Label>Start Date</Label>
                    <Input name="startDate" type="date" value={form.startDate} onChange={handleChange} />
                    <Label>End Date</Label>
                    <Input name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                    <Label>Priority</Label>
                    <Input name="priority" type="number" value={form.priority} onChange={handleChange} min={1} />
                    <Button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        {goal ? "Update Goal" : "Save Goal"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
