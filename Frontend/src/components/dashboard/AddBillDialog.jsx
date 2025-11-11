import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateBill, useUpdateBillStatus } from '../hooks/useBills';
import dayjs from 'dayjs';

export default function AddBillDialog({ open, setOpen, editingBill = null }) {
    const createBill = useCreateBill();
    const updateBill = useUpdateBillStatus();
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        dueDate: dayjs().format('YYYY-MM-DD'),
        category: '',
        frequency: 'monthly',
        reminderDays: 3,
        recurring: true,
        autopay: {
            enabled: false,
            accountId: ''
        }
    });

    useEffect(() => {
        if (editingBill) {
            setFormData({
                title: editingBill.title,
                amount: editingBill.amount.toString(),
                dueDate: dayjs(editingBill.dueDate).format('YYYY-MM-DD'),
                category: editingBill.category,
                frequency: editingBill.frequency,
                reminderDays: editingBill.reminderDays,
                recurring: editingBill.recurring,
                autopay: {
                    enabled: editingBill.autopay?.enabled || false,
                    accountId: editingBill.autopay?.accountId || ''
                }
            });
        }
    }, [editingBill]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // sanitize payload to avoid sending empty autopay.accountId
        const payload = {
            ...formData,
            amount: Number(formData.amount),
            reminderDays: Number(formData.reminderDays)
        };

        if (payload.autopay && payload.autopay.accountId === '') {
            // remove empty accountId so backend won't try to cast it to ObjectId
            delete payload.autopay.accountId;
        }

        if (editingBill) {
            updateBill.mutate(
                { billId: editingBill._id, ...payload },
                {
                    onSuccess: () => {
                        setOpen(false);
                        setFormData({
                            title: '',
                            amount: '',
                            dueDate: dayjs().format('YYYY-MM-DD'),
                            category: '',
                            frequency: 'monthly',
                            reminderDays: 3,
                            recurring: true,
                            autopay: {
                                enabled: false,
                                accountId: ''
                            }
                        });
                    }
                }
            );
        } else {
            createBill.mutate(payload, {
                onSuccess: () => {
                    setOpen(false);
                    setFormData({
                        title: '',
                        amount: '',
                        dueDate: dayjs().format('YYYY-MM-DD'),
                        category: '',
                        frequency: 'monthly',
                        reminderDays: 3,
                        recurring: true,
                        autopay: {
                            enabled: false,
                            accountId: ''
                        }
                    });
                }
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-slate-900 text-white border border-white/10">
                <DialogHeader>
                    <DialogTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData(d => ({ ...d, title: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-blue-500 outline-none"
                            placeholder="e.g., Electricity Bill"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Amount</label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.amount}
                            onChange={(e) => setFormData(d => ({ ...d, amount: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-blue-500 outline-none"
                            placeholder="₹"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Due Date</label>
                        <input
                            type="date"
                            required
                            value={formData.dueDate}
                            onChange={(e) => setFormData(d => ({ ...d, dueDate: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(d => ({ ...d, category: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-blue-500 outline-none"
                            required
                        >
                            <option value="">Select Category</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Rent">Rent</option>
                            <option value="Insurance">Insurance</option>
                            <option value="Subscriptions">Subscriptions</option>
                            <option value="Loan">Loan</option>
                            <option value="Credit Card">Credit Card</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Frequency</label>
                        <select
                            value={formData.frequency}
                            onChange={(e) => setFormData(d => ({ ...d, frequency: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-blue-500 outline-none"
                        >
                            <option value="one-time">One Time</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Remind me before (days)</label>
                        <input
                            type="number"
                            min="0"
                            max="30"
                            value={formData.reminderDays}
                            onChange={(e) => setFormData(d => ({ ...d, reminderDays: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/5 rounded border border-white/10 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.recurring}
                            onChange={(e) => setFormData(d => ({ ...d, recurring: e.target.checked }))}
                            id="recurring"
                        />
                        <label htmlFor="recurring" className="text-sm">Recurring Bill</label>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.autopay.enabled}
                            onChange={(e) => setFormData(d => ({
                                ...d,
                                autopay: { ...d.autopay, enabled: e.target.checked }
                            }))}
                            id="autopay"
                        />
                        <label htmlFor="autopay" className="text-sm">Enable Autopay</label>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-white/10 hover:bg-white/5"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600"
                            disabled={createBill.isLoading}
                        >
                            {editingBill
                                ? (updateBill.isLoading ? 'Updating...' : 'Update Bill')
                                : (createBill.isLoading ? 'Adding...' : 'Add Bill')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}