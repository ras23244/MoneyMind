import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useUser} from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddTransactionDialog({ open, setOpen, userId, onTransactionCreated }) {
    const {user}= useUser();
    console.log("user form transaction dialog",user)
    const [form, setForm] = useState({
        userId: userId,
        description: "",
        amount: "",
        bankName:"",
        type: "expense",
        category: "",
        tags: "",
        date: new Date(),
    });

    const [loading, setLoading] = useState(false);

  
    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const handleTypeChange = (val) => setForm((f) => ({ ...f, type: val }));
    const handleCategoryChange = (val) => setForm((f) => ({ ...f, category: val }));
    const handleDateChange = (date) => setForm((f) => ({ ...f, date }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            console.log("Submitting form:", form);

            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}transactions/create-transaction`,
                { ...form },
                { headers: { Authorization: `Bearer ${token}` } }
            );

           if(res.status===201){
            toast.success("Transaction added successfully!")
           }

            if (onTransactionCreated) {
                onTransactionCreated(res.data); // callback to parent if needed
            }

            setOpen(false); 
            setForm({
                userId,
                description: "",
                amount: "",
                bankAccountId: "",                        
                type: "expense",
                category: "",
                tags: "",
                date: new Date(),
            });
        } catch (error) {
            toast.error("Failed to add transaction. Please try again.");
            console.error("Error creating transaction:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <ToastContainer />
            <DialogContent className="bg-[#242124] border border-white/10 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-white">Add Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Description */}
                    <div>
                        <Label htmlFor="description" className="text-white mb-1">Description</Label>
                        <Input
                            id="description"
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="bg-card border-white/10 text-white"
                            required
                        />
                    </div>

                    {/* Amount */}
                    <div>
                        <Label htmlFor="amount" className="text-white mb-1">Amount</Label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            value={form.amount}
                            onChange={handleChange}
                            className="bg-card border-white/10 text-white"
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="bankName" className="text-white mb-1">
                            Bank Name
                        </Label>

                        <Select
                            value={form.bankAccountId}  // ✅ store account _id in form
                            onValueChange={(val) =>
                                handleChange({ target: { name: "bankAccountId", value: val } })
                            }
                        >
                            <SelectTrigger className="bg-card border-white/10 text-white">
                                <SelectValue placeholder="Select Bank" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#242124] border-white/10 text-white">
                                {user?.bankAccounts?.map((acc) => {
                                    const accNum = acc.accountNumber || "";
                                    const maskedAcc =
                                        accNum.length > 4
                                            ? "*".repeat(accNum.length - 4) + accNum.slice(-4)
                                            : accNum; // if <4 digits, show as is

                                    return (
                                        <SelectItem key={acc._id} value={acc._id}>
                                            {acc.bankName} • {maskedAcc}
                                        </SelectItem>
                                    );
                                })}

                            </SelectContent>
                        </Select>
                    </div>


                    {/* Type & Category */}
                    <div className="flex justify-between gap-4">
                        <div className="flex-1">
                            <Label htmlFor="type" className="text-white mb-1">Type</Label>
                            <Select value={form.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="bg-card border-white/10 text-white">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#242124] border-white/10 text-white">
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1">
                            <Label htmlFor="category" className="text-white mb-1">Category</Label>
                            <Select value={form.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="bg-card border-white/10 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#242124] border-white/10 text-white">
                                    <SelectItem value="Salary">Salary</SelectItem>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Bills">Bills</SelectItem>
                                    <SelectItem value="Shopping">Shopping</SelectItem>
                                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <Label htmlFor="date" className="text-white mb-1">Date</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={
                                form.date instanceof Date && !isNaN(form.date)
                                    ? form.date.toISOString().split("T")[0]
                                    : ""
                            }
                            onChange={(e) => handleDateChange(new Date(e.target.value))}
                            className="bg-card border-white/10 text-white"
                            required
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <Label htmlFor="tags" className="text-white mb-1">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            name="tags"
                            value={form.tags}
                            onChange={handleChange}
                            className="bg-card border-white/10 text-white"
                        />
                    </div>

                    {/* Footer */}
                    <DialogFooter>
                        <Button
                            type="submit"
                            className="bg-white text-black hover:bg-white/90"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </Button>
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="border-white/20 text-white"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
