import { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Banknote, TrendingUp, Edit2, Trash2, Eye } from 'lucide-react';
import { useDeleteAccount } from '../hooks/useAccounts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import RecentTransactions from '../RecentTransactions';

dayjs.extend(relativeTime);

const accountTypeIcons = {
    checking: <Banknote className="w-5 h-5 text-blue-400" />,
    savings: <TrendingUp className="w-5 h-5 text-green-400" />,
    credit: <Banknote className="w-5 h-5 text-red-400" />,
    wallet: <Wallet className="w-5 h-5 text-purple-400" />,
    investment: <TrendingUp className="w-5 h-5 text-yellow-400" />,
};

export default function AccountCard({ account, userId, onEdit, onViewTransactions }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const deleteAccount = useDeleteAccount(userId);

    const handleDelete = () => {
        deleteAccount.mutate(account._id);
        setShowDeleteConfirm(false);
    };

    const currency = (n) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(n);

    return (
        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-slate-600 transition-all hover:shadow-lg">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {accountTypeIcons[account.accountType] || accountTypeIcons.checking}
                        <div>
                            <h3 className="font-semibold text-white">{account.accountName}</h3>
                            <p className="text-xs text-slate-400">{account.bankName}</p>
                        </div>
                    </div>
                    <div className="text-xs px-2 py-1 bg-slate-700/50 rounded text-slate-300">
                        {account.accountType}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Balance Section */}
                <div className="bg-slate-700/30 p-3 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Current Balance</p>
                    <p className="text-2xl font-bold text-white">{currency(account.balance)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                        Last updated {dayjs(account.lastUpdated).fromNow()}
                    </p>
                </div>

                {/* Account Details */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Account No:</span>
                        <span className="text-slate-300 font-mono text-xs">
                            ****{account.accountNumber.slice(-4)}
                        </span>
                    </div>
                    {account.notes && (
                        <div className="flex justify-between">
                            <span className="text-slate-400">Notes:</span>
                            <span className="text-slate-300 text-xs max-w-[150px] text-right">
                                {account.notes}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span className="text-slate-300 text-xs">
                            {dayjs(account.createdAt).format('MMM DD, YYYY')}
                        </span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-300"
                        onClick={() => onEdit(account)}
                    >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs bg-slate-700/40 hover:bg-slate-600/40 text-slate-300"
                        onClick={() => onViewTransactions(account)}
                    >
                        <Eye className="w-3 h-3 mr-1" />
                        Transactions
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="flex-1 text-xs bg-red-600/20 hover:bg-red-600/40 text-red-300"
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                    </Button>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm && (
                    <div className="bg-red-900/20 border border-red-600/30 p-3 rounded-lg text-sm">
                        <p className="text-red-200 mb-2">Are you sure you want to delete this account?</p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs border-red-600 hover:bg-red-900/20"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="flex-1 text-xs bg-red-600 hover:bg-red-700"
                                onClick={handleDelete}
                                disabled={deleteAccount.isPending}
                            >
                                {deleteAccount.isPending ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
