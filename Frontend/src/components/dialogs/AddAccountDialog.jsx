import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateAccount } from '../hooks/useAccounts';

export default function AddAccountDialog({ open, setOpen, userId }) {
    const createAccount = useCreateAccount(userId);
    const [formData, setFormData] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        accountType: 'checking',
        balance: 0,
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'balance' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createAccount.mutate(formData, {
            onSuccess: () => {
                setOpen(false);
                setFormData({
                    accountName: '',
                    accountNumber: '',
                    bankName: '',
                    accountType: 'checking',
                    balance: 0,
                    notes: ''
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Account Name</label>
                        <input
                            type="text"
                            name="accountName"
                            value={formData.accountName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="e.g., My Checking Account"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Bank Name</label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="e.g., HDFC Bank"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Account Number</label>
                        <input
                            type="text"
                            name="accountNumber"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="XXXXXXXXXX"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Account Type</label>
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                        >
                            <option value="checking">Checking</option>
                            <option value="savings">Savings</option>
                            <option value="credit">Credit</option>
                            <option value="wallet">Wallet</option>
                            <option value="investment">Investment</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Current Balance</label>
                        <input
                            type="number"
                            name="balance"
                            value={formData.balance}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="₹0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="3"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                            placeholder="Add any notes about this account"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-slate-600 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={createAccount.isPending}
                        >
                            {createAccount.isPending ? 'Adding...' : 'Add Account'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
