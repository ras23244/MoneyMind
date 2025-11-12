import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAccountTransactions, useDeleteAccountTransaction, useUpdateAccountTransaction } from '../hooks/useAccountTransaction';
import { useUser } from "../../context/UserContext";
import { Edit2, Trash2, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import dayjs from 'dayjs';

export default function AccountTransactionsModal({ open, setOpen, account }) {
    const { data: transactions = [], isLoading } = useAccountTransactions(account?._id);
    const { user } = useUser();
    const deleteTransaction = useDeleteAccountTransaction(account?._id, user?._id);
    const updateTransaction = useUpdateAccountTransaction(account?._id, user?._id);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Get unique categories from transactions
    const categories = useMemo(() => {
        return [...new Set(transactions.map(t => t.category).filter(Boolean))];
    }, [transactions]);

    // Filter transactions
    const filteredTransactions = useMemo(() => {
        return transactions.filter(tx => {
            const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.note?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || tx.type === filterType;
            const matchesCategory = filterCategory === 'all' || tx.category === filterCategory;

            return matchesSearch && matchesType && matchesCategory;
        });
    }, [transactions, searchTerm, filterType, filterCategory]);

    // Calculate stats
    const stats = useMemo(() => {
        const income = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        return { income, expense, net: income - expense };
    }, [filteredTransactions]);

    const currency = (n) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(n);

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction._id);
        setEditForm({
            description: transaction.description,
            amount: transaction.amount,
            category: transaction.category,
            note: transaction.note,
            type: transaction.type,
        });
    };

    const handleSaveEdit = () => {
        updateTransaction.mutate(
            { id: editingTransaction, ...editForm },
            {
                onSuccess: () => {
                    setEditingTransaction(null);
                    setEditForm({});
                }
            }
        );
    };

    const handleDelete = (id) => {
        deleteTransaction.mutate(id, {
            onSuccess: () => {
                setDeleteConfirm(null);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl bg-slate-900 text-white border-slate-700 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="sticky top-0 bg-slate-900 z-10 pb-4 border-b border-slate-700">
                    <DialogTitle className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Transactions for</p>
                            <p className="text-lg font-semibold">{account?.accountName}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setOpen(false)}
                            className="hover:bg-slate-700"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-900/30 border border-green-600/30 p-3 rounded-lg">
                            <p className="text-xs text-green-300 mb-1">Income</p>
                            <p className="text-lg font-semibold text-green-400">{currency(stats.income)}</p>
                        </div>
                        <div className="bg-red-900/30 border border-red-600/30 p-3 rounded-lg">
                            <p className="text-xs text-red-300 mb-1">Expenses</p>
                            <p className="text-lg font-semibold text-red-400">{currency(stats.expense)}</p>
                        </div>
                        <div className={`border p-3 rounded-lg ${stats.net >= 0
                            ? 'bg-blue-900/30 border-blue-600/30'
                            : 'bg-orange-900/30 border-orange-600/30'
                            }`}>
                            <p className="text-xs mb-1" style={{ color: stats.net >= 0 ? '#93c5fd' : '#fed7aa' }}>
                                Net
                            </p>
                            <p className="text-lg font-semibold" style={{ color: stats.net >= 0 ? '#60a5fa' : '#fb923c' }}>
                                {currency(stats.net)}
                            </p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="space-y-3">
                        <Input
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white placeholder-slate-500"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>

                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Transactions List */}
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400">Loading transactions...</div>
                    ) : filteredTransactions.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">No transactions found</div>
                    ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction._id}
                                    className="bg-slate-800/50 border border-slate-700 p-4 rounded-lg hover:bg-slate-800/80 transition"
                                >
                                    {editingTransaction === transaction._id ? (
                                        // Edit Mode
                                        <div className="space-y-3">
                                            <Input
                                                value={editForm.description}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="Description"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Input
                                                    type="number"
                                                    value={editForm.amount}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                                                    className="bg-slate-700 border-slate-600 text-white"
                                                    placeholder="Amount"
                                                />
                                                <Input
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                                                    className="bg-slate-700 border-slate-600 text-white"
                                                    placeholder="Category"
                                                />
                                            </div>
                                            <Input
                                                value={editForm.note}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
                                                className="bg-slate-700 border-slate-600 text-white"
                                                placeholder="Note"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveEdit}
                                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                                    disabled={updateTransaction.isPending}
                                                >
                                                    {updateTransaction.isPending ? 'Saving...' : 'Save'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingTransaction(null);
                                                        setEditForm({});
                                                    }}
                                                    className="flex-1 border-slate-600 hover:bg-slate-700"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className={`p-2 rounded-lg ${transaction.type === 'income'
                                                    ? 'bg-green-900/30'
                                                    : 'bg-red-900/30'
                                                    }`}>
                                                    {transaction.type === 'income' ? (
                                                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">{transaction.description}</p>
                                                    <div className="flex gap-2 text-xs text-slate-400">
                                                        <span>{transaction.category}</span>
                                                        <span>•</span>
                                                        <span>{dayjs(transaction.date).format('MMM DD, YYYY')}</span>
                                                    </div>
                                                    {transaction.note && (
                                                        <p className="text-xs text-slate-500 mt-1">{transaction.note}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <p className={`font-semibold text-lg ${transaction.type === 'income'
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                                    }`}>
                                                    {transaction.type === 'income' ? '+' : '-'}{currency(transaction.amount)}
                                                </p>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-blue-400 hover:bg-blue-900/20"
                                                    onClick={() => handleEdit(transaction)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-400 hover:bg-red-900/20"
                                                    onClick={() => setDeleteConfirm(transaction._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Delete Confirmation */}
                                    {deleteConfirm === transaction._id && (
                                        <div className="mt-3 p-3 bg-red-900/20 border border-red-600/30 rounded text-sm text-red-200 space-y-2">
                                            <p>Delete this transaction?</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                                    onClick={() => handleDelete(transaction._id)}
                                                    disabled={deleteTransaction.isPending}
                                                >
                                                    {deleteTransaction.isPending ? 'Deleting...' : 'Delete'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1 border-red-600 hover:bg-red-900/20"
                                                    onClick={() => setDeleteConfirm(null)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
