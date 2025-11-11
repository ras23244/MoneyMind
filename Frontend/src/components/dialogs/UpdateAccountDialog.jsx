import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUpdateAccount } from '../hooks/useAccounts';

export default function UpdateAccountDialog({ open, setOpen, account, userId }) {
    const updateAccount = useUpdateAccount(userId);
    const [formData, setFormData] = useState({
        accountName: '',
        balance: 0,
        notes: '',
        accountType: 'checking'
    });

    useEffect(() => {
        if (account) {
            setFormData({
                accountName: account.accountName || '',
                balance: account.balance || 0,
                notes: account.notes || '',
                accountType: account.accountType || 'checking'
            });
        }
    }, [account]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'balance' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateAccount.mutate({ id: account._id, ...formData }, {
            onSuccess: () => {
                setOpen(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Update Account</DialogTitle>
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
                            disabled={updateAccount.isPending}
                        >
                            {updateAccount.isPending ? 'Updating...' : 'Update Account'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
