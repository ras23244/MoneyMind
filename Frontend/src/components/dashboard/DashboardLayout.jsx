import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Home, Receipt, Target, Goal, BarChart3, FileText, Wallet } from 'lucide-react';
import NotificationBell from '../../components/NotificationBell';
import AddTransactionDialog from '../../components/AddTransactionDialog';
import { useDashboard } from '../../context/DashboardContext';

const navigation = [
    { id: 'overview', label: 'Overview', icon: Home, path: '/dashboard' },
    { id: 'transactions', label: 'Transactions', icon: Receipt, path: '/dashboard/transactions' },
    { id: 'budgets', label: 'Budgets', icon: Target, path: '/dashboard/budgets' },
    { id: 'goals', label: 'Goals', icon: Goal, path: '/dashboard/goals' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard/analytics' },
    { id: 'bills', label: 'Bills', icon: FileText, path: '/dashboard/bills' },
    { id: 'accounts', label: 'Accounts', icon: Wallet, path: '/dashboard/accounts' },
];

export default function DashboardLayout() {
    const { user, refetchTransactions } = useDashboard();
    const [open, setOpen] = useState(false);

    const handleTransactionCreated = () => {
        refetchTransactions();
    }

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar navigation={navigation} />
            <main className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Good morning, {user?.fullname?.firstname}</h2>
                            <p className="text-white/60 mt-1">Here's your financial overview</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <Button size="sm" className="bg-white text-black hover:bg-white/90" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" />Add Transaction</Button>
                        </div>
                    </div>

                    <Outlet />
                </div>
            </main>

            <AddTransactionDialog
                open={open}
                setOpen={setOpen}
                userId={user?._id}
                onTransactionCreated={handleTransactionCreated}
            />
        </div>
    );
}
