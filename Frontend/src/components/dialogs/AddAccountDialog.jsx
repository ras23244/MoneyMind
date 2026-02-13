import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCreateAccount } from '../hooks/useAccounts';

export default function AddAccountDialog({ open, setOpen, userId }) {
    const createAccount = useCreateAccount(userId);

    const [formData, setFormData] = useState({
        bankName: '',
        accountNumber: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        createAccount.mutate(formData, {
            onSuccess: () => {
                setOpen(false);
                setFormData({
                    bankName: '',
                    accountNumber: '',
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 text-white border-slate-700">
                <DialogHeader>
                    <DialogTitle>Link Bank Account</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Bank Name
                        </label>
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
                        <label className="block text-sm font-medium mb-1">
                            Account Number
                        </label>
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
                            {createAccount.isPending ? 'Linking...' : 'Link Account'}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}
