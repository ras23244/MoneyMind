import React, { useState, useMemo } from 'react';
import AddBillDialog from './dashboard/AddBillDialog';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';
import BalanceCards from './BalanceCards';
import dayjs from 'dayjs';
import NotesPanel from './NotesPanel';

import AlertsPanel from './dashboard/AlertsPanel';
import TransactionList from './dashboard/TransactionList';

export default function Dashboard() {
    const {
        user,
        loading,
        transactions = [],
        budgets = [],
        goals = [],
        bills = [],
        billsSummary = {},
        financialSummary = {},
        categoryBreakdownData = [],
        spendingHeatmap = [],
        monthlyTrends = [],
        isBalanceVisible,
        setIsBalanceVisible,
        selectedDate,
        setSelectedDate,
        formatCurrency
    } = useDashboard();

    const [showBalance, setShowBalanceLocal] = useState(isBalanceVisible ?? true);
    const [dateRange] = useState('6M');
    const navigate = useNavigate();
    const [openAddBillDialog, setOpenAddBillDialog] = useState(false);

    const disposableAfterBudgets = useMemo(() => {
        const totalBudgetAmount = (budgets || []).reduce((s, b) => s + (Number(b.amount) || 0), 0);
        return (financialSummary?.monthlyIncome || 0) - totalBudgetAmount;
    }, [budgets, financialSummary]);

    const budgetsUi = useMemo(() => (budgets || []).map(b => ({
        name: b.category || 'Other',
        spent: Number(b.spent) || 0,
        limit: Number(b.amount) || 0
    })), [budgets]);

    const goalsUi = useMemo(() => (goals || []).map(g => ({
        name: g.title || g.name || 'Goal',
        current: Number(g.currentAmount ?? g.current) || 0,
        target: Number(g.targetAmount ?? g.target) || 0
    })), [goals]);

    const billsUi = useMemo(() => {
        if (financialSummary && financialSummary.upcomingBills && financialSummary.upcomingBills.length) {
            return financialSummary.upcomingBills;
        }
        return (transactions || [])
            .filter((t) => (t.category || '').toLowerCase().includes('bill') || (t.description || '').toLowerCase().includes('bill'))
            .slice(0, 6)
            .map((t, i) => ({
                id: t._id || t.id || i,
                title: t.description || t.note || t.category || 'Bill',
                due: (t.date || '').slice(0, 10),
                amount: Math.abs(Number(t.amount || 0))
            }));
    }, [financialSummary, transactions]);

    const recentTransactions = (transactions || [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const heatmap = spendingHeatmap || [];
    const _defaultHeatmap = Array.from({ length: 4 }, () => Array.from({ length: 7 }, () => 0));
    const heatmapRows = Array.isArray(heatmap) && heatmap.length === 4 && heatmap.every(r => Array.isArray(r) && r.length === 7)
        ? heatmap
        : _defaultHeatmap;

    const {
        totalBalance = 0,
        monthlyIncome = 0,
        monthlyExpenses = 0,
        monthlySavings = 0
    } = financialSummary || {};

    const insights = useMemo(() => {
        const res = [];
        if (monthlyExpenses > monthlyIncome * 0.6) res.push('You spent a large portion of your income this month — consider trimming non-essential spends.');
        if (monthlySavings > 0) res.push('Good job — you are saving consistently this month!');
        if (categoryBreakdownData?.[0]?.value > monthlyExpenses * 0.3) res.push(`Big chunk of spending is on ${categoryBreakdownData[0].name}. Review that category.`);
        if (budgetsUi.some(b => b.limit > 0 && b.spent / b.limit >= 0.9)) res.push('Some budgets are near their limit — check them.');
        return res;
    }, [monthlyExpenses, monthlyIncome, monthlySavings, categoryBreakdownData, budgetsUi]);

    if (loading) return <div className="p-6">Loading dashboard...</div>;
    if (!user) return <div className="p-6">Please log in to view dashboard.</div>;

    const balanceData = {
        totalBalance: financialSummary.totalBalance ?? totalBalance,
        monthlyIncome: financialSummary.monthlyIncome ?? monthlyIncome,
        monthlyExpenses: financialSummary.monthlyExpenses ?? monthlyExpenses,
        monthlySavings: financialSummary.monthlySavings ?? monthlySavings,
        incomeChange: typeof financialSummary.incomeChange !== 'undefined' ? financialSummary.incomeChange : 0,
        expensesChange: typeof financialSummary.expensesChange !== 'undefined' ? financialSummary.expensesChange : 0,
        savingsChange: typeof financialSummary.savingsChange !== 'undefined' ? financialSummary.savingsChange : 0,
        netWorth: financialSummary.netWorth ?? totalBalance
    };

    return (
        <div className="p-4 max-w-[1300px] mx-auto min-h-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-100">Overview</h1>
                </div>
            </div>

            <section aria-labelledby="overview-heading" className="mb-8">
                <BalanceCards
                    financialSummary={balanceData}
                    isBalanceVisible={showBalance}
                    setIsBalanceVisible={setShowBalanceLocal}
                    formatCurrency={formatCurrency}
                />
            </section>

            <section aria-labelledby="insights-heading" className="mb-8">
                <h2 id="insights-heading" className="text-sm font-medium text-slate-300 mb-3">Insights & Analysis</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[520px] min-h-0">
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6 flex flex-col min-h-0">
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <NotesPanel />
                        </div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6 flex flex-col min-h-0">
                        <h3 className="font-semibold mb-3">Alerts</h3>
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <AlertsPanel
                                transactions={transactions}
                                billsUi={billsUi}
                                budgetsUi={budgetsUi}
                                goalsUi={goalsUi}
                                financialSummary={financialSummary}
                                currency={formatCurrency}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section aria-labelledby="activity-heading" className="mb-10">
                <h2 id="activity-heading" className="text-sm font-medium text-slate-300 mb-3">Activity</h2>
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    <div className="lg:col-span-2">
                        <TransactionList
                            transactions={recentTransactions}
                            expanded={false}
                            onToggleExpand={() => navigate('/dashboard/transactions')}
                            onNavigate={() => navigate('/dashboard/transactions')}
                        />
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-slate-800/60 rounded-xl p-4 border border-white/10 shadow-md max-w-[850px] mx-auto">
                            <h3 className="font-semibold mb-4 text-slate-100 text-lg text-center">Spending Heatmap</h3>

                            <div className="flex flex-col gap-2">
                                {heatmapRows.map((week, weekIndex) => (
                                    <div key={weekIndex} className="grid grid-cols-7 gap-2 justify-center">
                                        {week.map((value, dayIndex) => {
                                            const todayDay = dayjs().day();
                                            const offsetWithinWeek = (todayDay - dayIndex + 7) % 7;
                                            const daysSince = offsetWithinWeek + weekIndex * 7;
                                            const cellDate = dayjs().startOf('day').subtract(daysSince, 'day');
                                            const label = cellDate.format('D MMM');

                                            let bgColor = 'bg-white/10';
                                            if (value > 0 && value < 1000) bgColor = 'bg-emerald-500/20';
                                            else if (value >= 1000 && value < 5000) bgColor = 'bg-emerald-500/40';
                                            else if (value >= 5000) bgColor = 'bg-emerald-500/60';

                                            return (
                                                <div
                                                    key={`${weekIndex}-${dayIndex}`}
                                                    className={`group flex flex-col items-center justify-center rounded-lg ${bgColor} p-2 sm:p-3 min-h-[60px] transition-all duration-200 border border-white/5 text-center hover:scale-105 hover:border-emerald-400/30 hover:shadow-md hover:shadow-emerald-500/10 hover:brightness-110`}
                                                >
                                                    <span className="text-[11px] text-slate-300 leading-tight group-hover:text-emerald-300 transition-colors duration-200">{label}</span>
                                                    <span className="text-xs font-medium text-slate-100 group-hover:text-white transition-colors duration-200">{formatCurrency(value)}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}

                                {/* Legend */}
                                <div className="flex justify-between items-center text-xs text-slate-400 mt-3 px-2">
                                    <span>Less</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 rounded bg-white/10"></div>
                                        <div className="w-3 h-3 rounded bg-emerald-500/20"></div>
                                        <div className="w-3 h-3 rounded bg-emerald-500/40"></div>
                                        <div className="w-3 h-3 rounded bg-emerald-500/60"></div>
                                    </div>
                                    <span>More</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/10 pt-4 mt-6 flex items-center justify-between text-sm text-slate-400">
                <div>Last synced: {financialSummary.lastSynced || 'a few minutes ago'}</div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-transparent border border-white/10 rounded">Settings</button>
                    <button className="px-3 py-2 bg-transparent border border-white/10 rounded">Download Report (PDF)</button>
                </div>
            </footer>

            <AddBillDialog open={openAddBillDialog} setOpen={setOpenAddBillDialog} />
        </div>
    );
}
