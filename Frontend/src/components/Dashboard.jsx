import React, { useState, useMemo } from 'react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import AddBillDialog from './dashboard/AddBillDialog';
import { useUser } from "../context/UserContext";
import { useTransactions } from "./hooks/useTransactions";
import { useBudgets } from "./hooks/useBudgets";
import { useGoals } from "./hooks/useGoals";
import { useAccounts } from "./hooks/useAccounts";
import { useBills, useBillSummary } from './hooks/useBills';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import AddBudgetDialog from "./AddBudgetDialog";
import { useCreateBudget } from "./hooks/useBudgetMutations";
import AddGoalDialog from "./AddGoalDialog";
import { useCreateGoal } from "./hooks/useGoals";
import dayjs from "dayjs";
import NotesPanel from './NotesPanel';

import CategoryBreakdown from './dashboard/CategoryBreakdown';
import TransactionList from './dashboard/TransactionList';
import BudgetsList from './dashboard/BudgetsList';
import GoalsList from './dashboard/GoalsList';
import BillsPanel from './dashboard/BillsPanel';
import {
    useFinancialSummary,
    useCategoryBreakdown,
    useSpendingHeatmap,
    useTrendData
} from './hooks/useAggregatedData';

const currency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
    const { user, loading: userLoading } = useUser();
    const [showBalance, setShowBalance] = useState(true);
    const [showNotes, setShowNotes] = useState(false);
    const [dateRange] = useState('6M');
    const navigate = useNavigate();

    // expandable section states
    const [budgetsExpanded, setBudgetsExpanded] = useState(false);
    const [goalsExpanded, setGoalsExpanded] = useState(false);
    const [accountsExpanded, setAccountsExpanded] = useState(false);
    const [txExpanded, setTxExpanded] = useState(false);
    const [openBudgetDialog, setOpenBudgetDialog] = useState(false);
    const createBudgetMutation = useCreateBudget(user?._id);
    const [openGoalDialog, setOpenGoalDialog] = useState(false);
    const [openAddBillDialog, setOpenAddBillDialog] = useState(false);
    const createGoalMutation = useCreateGoal(user?._id);

    // --- Fetch real backend data ---
    const { data: transactions = [], isLoading: txLoading } = useTransactions(user?._id);
    const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(user?._id, {});
    const { data: goals = [], isLoading: goalsLoading } = useGoals(user?._id);
    const { data: accounts = [], isLoading: accountsLoading } = useAccounts(user?._id);
    const { data: bills = [], isLoading: billsLoading } = useBills(user?._id, { days: 30 });
    const { data: billsSummary = {}, isLoading: billsSummaryLoading } = useBillSummary(user?._id);
    const { data: financialSummary = {}, isLoading: summaryLoading } = useFinancialSummary(user?._id);

    // Optimized data fetching with backend aggregations
    const { data: categoryBreakdownData = [], isLoading: categoryBreakdownLoading } = useCategoryBreakdown(user?._id);
    const { data: spendingHeatmap = [], isLoading: spendingHeatmapLoading } = useSpendingHeatmap(user?._id);
    const { data: monthlyTrends = [], isLoading: trendsLoading } = useTrendData(user?._id);

    const loading = userLoading || txLoading || budgetsLoading || goalsLoading ||
        accountsLoading || summaryLoading || categoryBreakdownLoading ||
        spendingHeatmapLoading || trendsLoading || billsLoading || billsSummaryLoading;

    // Use backend-calculated metrics directly
    const {
        totalBalance = 0,
        monthlyIncome = 0,
        monthlyExpenses = 0,
        monthlySavings = 0,
        netWorth = totalBalance,
    } = financialSummary;

    const disposableAfterBudgets = useMemo(() => {
        const totalBudgetAmount = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        return (monthlyIncome || 0) - totalBudgetAmount;
    }, [budgets, monthlyIncome]);

    // Use backend-calculated data directly
    const categoryBreakdown = categoryBreakdownData;
    const trendData = monthlyTrends;

    // Budgets UI mapping (use available spent/amount values)
    const budgetsUi = useMemo(() => budgets.map(b => ({
        name: b.category || 'Other',
        spent: Number(b.spent) || 0,
        limit: Number(b.amount) || 0,
    })), [budgets]);

    // Goals UI mapping
    const goalsUi = useMemo(() => goals.map(g => ({
        name: g.title || g.name || 'Goal',
        current: Number(g.currentAmount ?? g.current) || 0,
        target: Number(g.targetAmount ?? g.target) || 0,
    })), [goals]);

    // Accounts UI mapping
    const accountsUi = useMemo(() => accounts.map(a => ({
        name: a.name || a.bankName || 'Account',
        balance: Number(a.balance) || 0,
        type: a.type || a.accountType || 'Account',
        lastSync: a.lastSync || '—',
    })), [accounts]);

    // Upcoming bills: prefer backend summary, else infer from transactions with "bill" category
    const billsUi = useMemo(() => {
        if (financialSummary.upcomingBills && financialSummary.upcomingBills.length) {
            return financialSummary.upcomingBills;
        }
        return transactions
            .filter((t) => (t.category || '').toLowerCase().includes('bill') || (t.description || '').toLowerCase().includes('bill'))
            .slice(0, 6)
            .map((t, i) => ({
                id: t._id || t.id || i,
                title: t.description || t.note || t.category || 'Bill',
                due: (t.date || '').slice(0, 10),
                amount: Math.abs(Number(t.amount || 0)),
            }));
    }, [financialSummary, transactions]);

    //
    // Use backend-calculated heatmap data
    const heatmap = spendingHeatmap;

    // Insights simple rules
    const insights = useMemo(() => {
        const res = [];
        if (monthlyExpenses > monthlyIncome * 0.6) res.push('You spent a large portion of your income this month — consider trimming non-essential spends.');
        if (monthlySavings > 0) res.push('Good job — you are saving consistently this month!');
        if (categoryBreakdown[0]?.value > monthlyExpenses * 0.3) res.push(`Big chunk of spending is on ${categoryBreakdown[0].name}. Review that category.`);
        if (budgetsUi.some(b => b.limit > 0 && b.spent / b.limit >= 0.9)) res.push('Some budgets are near their limit — check them.');
        return res;
    }, [monthlyExpenses, monthlyIncome, monthlySavings, categoryBreakdown, budgetsUi]);

    // CSV export
    const exportCSV = () => {
        const rows = [['Date', 'Description', 'Category', 'Amount', 'Account']];
        transactions.forEach(t => rows.push([t.date || '', t.description || t.desc || t.note || '', t.category || '', t.amount || 0, t.account || '']));
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddBudget = (newBudget) => {
        createBudgetMutation.mutate({
            ...newBudget,
            month: newBudget.month || dayjs().format("YYYY-MM"),
        });
        setOpenBudgetDialog(false);
    };

    const handleAddGoal = (goalData) => {
        createGoalMutation.mutate(
            {
                ...goalData,
                createdAt: dayjs().format(),
            },
            {
                onSuccess: () => {
                    setOpenGoalDialog(false);
                },
            }
        );
    };

    if (loading) return <div className="p-6">Loading dashboard...</div>;
    if (!user) return <div className="p-6">Please log in to view dashboard.</div>;

    return (
        <div className="p-4 max-w-[1300px] mx-auto">

            {/* Top: Actions + Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-100">Overview</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowBalance(s => !s)} className="px-3 py-2 bg-slate-700/80 rounded-md text-sm text-white hover:bg-slate-700/95 transition">{showBalance ? 'Hide Balances' : 'Show Balances'}</button>
                    <button onClick={exportCSV} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-md text-white text-sm">Export CSV</button>
                </div>
            </div>

            {/* Overview cards */}
            <section aria-labelledby="overview-heading" className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-4 bg-slate-800/40 rounded-lg border border-white/6">
                        <p className="text-sm text-slate-300">Total Balance</p>
                        <p className="text-xl font-semibold mt-2 text-slate-100">{showBalance ? currency(totalBalance) : '••••••'}</p>
                        <p className="text-xs text-slate-400 mt-1">Net worth: {currency(netWorth)}</p>
                    </div>

                    <div className="p-4 bg-slate-800/40 rounded-lg border border-white/6">
                        <p className="text-sm text-slate-300">Income (This month)</p>
                        <p className="text-xl font-semibold mt-2 text-slate-100">{currency(monthlyIncome)}</p>
                        <p className="text-xs text-slate-400 mt-1">Trend vs last month: +5%</p>
                    </div>

                    <div className="p-4 bg-slate-800/40 rounded-lg border border-white/6">
                        <p className="text-sm text-slate-300">Expenses (This month)</p>
                        <p className="text-xl font-semibold mt-2 text-slate-100">{currency(monthlyExpenses)}</p>
                        <p className="text-xs text-slate-400 mt-1">Recurring bills: {bills.length}</p>
                    </div>

                    <div className="p-4 bg-slate-800/40 rounded-lg border border-white/6">
                        <p className="text-sm text-slate-300">Savings</p>
                        <p className="text-xl font-semibold mt-2 text-slate-100">{currency(monthlySavings)}</p>
                        <p className="text-xs text-slate-400 mt-1">Disposable: {currency(disposableAfterBudgets)}</p>
                    </div>
                </div>
            </section>

            {/* Insights & Visuals - BillsPanel is now here */}
            <section aria-labelledby="insights-heading" className="mb-8">
                <h2 id="insights-heading" className="text-sm font-medium text-slate-300 mb-3">Insights & Analysis</h2>
                {/* CHANGED: Parent grid from lg:grid-cols-3 to lg:grid-cols-4 */}
                <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.1fr_1.1fr] gap-6">

                    {/* UPDATED: Upcoming Bills component now spans 2 columns (lg:col-span-2) */}
                    <div className=" bg-slate-800/40 rounded-lg p-4 border border-white/6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Upcoming Bills</h3>
                            <div className="flex gap-2">
                                <span className="text-sm text-slate-400">
                                    Total Due: {currency(billsSummary.totalUpcoming || 0)}
                                </span>
                                <Button size="sm" onClick={() => navigate('/bills')} variant="outline">
                                    Manage Bills
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {bills.slice(0, 5).map((bill) => (
                                <div
                                    key={bill._id}
                                    className={`
                                        flex items-center justify-between p-3 rounded
                                        ${bill.isOverdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'}
                                        ${bill.autopay?.enabled ? 'border-l-2 border-green-500' : ''}
                                    `}
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{bill.title}</span>
                                            {bill.autopay?.enabled && (
                                                <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                                                    Autopay
                                                </span>
                                            )}
                                            {bill.isOverdue && (
                                                <span className="text-xs bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                                                    Overdue
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            Due {bill.formattedDueDate}
                                            {bill.daysUntilDue === 0 && " (Today)"}
                                            {bill.daysUntilDue === 1 && " (Tomorrow)"}
                                            {bill.daysUntilDue > 1 && ` (in ${bill.daysUntilDue} days)`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="font-semibold">{currency(bill.amount)}</div>
                                            <div className="text-xs text-slate-400">{bill.category}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {bills.length === 0 && (
                                <div className="text-slate-400 text-center py-4">
                                    No upcoming bills
                                </div>
                            )}

                            {bills.length > 5 && (
                                <button
                                    onClick={() => navigate('/bills')}
                                    className="w-full text-sm text-slate-400 hover:text-slate-300 py-2"
                                >
                                    View {bills.length - 5} more bills...
                                </button>
                            )}
                        </div>

                        <div className="mt-4">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={() => setOpenAddBillDialog(true)}
                            >
                                Add New Bill
                            </Button>
                        </div>
                    </div>

                    {/* These two components now implicitly take 1 column each in the new lg:grid-cols-4 layout */}
                    <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold">Notes & Insights</h3>
                            <Button size="sm" variant="outline" onClick={() => setShowNotes((s) => !s)}>{showNotes ? "Hide" : "Notes"}</Button>
                        </div>

                        <div className="min-h-[220px]">
                            {showNotes ? (
                                <NotesPanel />
                            ) : (
                                <div className="space-y-3 text-sm">
                                    {insights.length ? (
                                        <ul className="list-disc list-inside text-slate-300">
                                            {insights.map((ins, i) => <li key={i}>{ins}</li>)}
                                        </ul>
                                    ) : (
                                        <div className="text-slate-400">No insights currently. Check back later.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6">
                        <h3 className="font-semibold mb-3">Alerts</h3>
                        {(() => {
                            const alerts = [];
                            (billsUi || []).forEach((b) => {
                                if (!b.due) return;
                                const days = dayjs(b.due).diff(dayjs(), 'day');
                                if (days <= 7 && days >= 0) {
                                    alerts.push({
                                        id: `bill-${b.id}`,
                                        icon: '💳',
                                        title: `${b.title}`,
                                        text: `Due in ${days} day${days !== 1 ? 's' : ''} • ${currency(b.amount)}`,
                                        priority: 'high',
                                        color: 'bg-yellow-200 text-yellow-800',
                                    });
                                }
                            });

                            (budgetsUi || []).forEach((b, idx) => {
                                if (!b.limit || b.limit <= 0) return;
                                const pct = (b.spent / b.limit) * 100;
                                if (pct >= 100) {
                                    alerts.push({
                                        id: `budget-exceeded-${idx}`,
                                        icon: '💰',
                                        title: `${b.name} budget exceeded`,
                                        text: `${Math.round(pct)}% used (${currency(b.spent)} of ${currency(b.limit)})`,
                                        priority: 'high',
                                        color: 'bg-red-200 text-red-800',
                                    });
                                } else if (pct >= 75) {
                                    alerts.push({
                                        id: `budget-near-${idx}`,
                                        icon: '💰',
                                        title: `${b.name} near threshold`,
                                        text: `${Math.round(pct)}% used`,
                                        priority: 'medium',
                                        color: 'bg-orange-100 text-orange-800',
                                    });
                                }
                            });

                            (goalsUi || []).forEach((g, idx) => {
                                if (!g.target || g.target <= 0) return;
                                const pct = (g.current / g.target) * 100;
                                if (pct >= 75) {
                                    alerts.push({
                                        id: `goal-${idx}`,
                                        icon: '🎯',
                                        title: `${g.name} reached ${Math.round(pct)}%`,
                                        text: `${currency(g.current)} of ${currency(g.target)}`,
                                        priority: 'positive',
                                        color: 'bg-green-100 text-green-800',
                                    });
                                }
                            });

                            const sumByMonth = (monthOffset = 0) => {
                                const map = {};
                                const target = dayjs().subtract(monthOffset, 'month').format('YYYY-MM');
                                (transactions || []).forEach((t) => {
                                    if (!t.date || t.date.slice(0, 7) !== target) return;
                                    const key = t.category || 'Other';
                                    const amt = Number(t.amount || 0);
                                    map[key] = (map[key] || 0) + Math.abs(amt);
                                });
                                return map;
                            };
                            const current = sumByMonth(0);
                            const prev = sumByMonth(1);
                            Object.keys(current).forEach((cat) => {
                                const cur = current[cat] || 0;
                                const pv = prev[cat] || 0;
                                if (pv > 0 && cur / pv >= 2) {
                                    alerts.push({
                                        id: `anom-${cat}`,
                                        icon: '⚠️',
                                        title: `Spending anomaly: ${cat}`,
                                        text: `Spent ${Math.round(cur / Math.max(1, pv))}× vs last month (${currency(cur)})`,
                                        priority: 'high',
                                        color: 'bg-orange-100 text-orange-800',
                                    });
                                }
                            });

                            (financialSummary.reminders || []).forEach((r, i) => {
                                alerts.push({
                                    id: `rem-${i}`,
                                    icon: '🕒',
                                    title: r.title || 'Reminder',
                                    text: r.note || '',
                                    priority: 'low',
                                    color: 'bg-slate-100 text-slate-800',
                                });
                            });

                            if (!alerts.length) {
                                return <div className="text-slate-400">No alerts right now — your finances look stable.</div>;
                            }

                            const priorityOrder = { high: 0, medium: 1, positive: 2, low: 3 };
                            alerts.sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4));

                            return (
                                <div className="space-y-3">
                                    {alerts.map((al) => (
                                        <div key={al.id} className="flex items-start gap-3 p-3 rounded border border-white/6 bg-white/2">
                                            <div className="text-2xl leading-none">{al.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-medium text-sm">{al.title}</div>
                                                    <div className={`text-xs px-2 py-0.5 rounded ${al.color}`}>{al.priority.toUpperCase()}</div>
                                                </div>
                                                <div className="text-xs text-slate-300 mt-1">{al.text}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* Goals / Budgets / Accounts (reordered to show goals first) */}
            <section aria-labelledby="planning-heading" className="mb-8">
                <h2 id="planning-heading" className="text-sm font-medium text-slate-300 mb-3">Planning</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GoalsList
                        goals={goalsUi}
                        expanded={goalsExpanded}
                        onToggleExpand={() => setGoalsExpanded(s => !s)}
                        onAddGoal={() => setOpenGoalDialog(true)}
                    />

                    <BudgetsList
                        budgets={budgetsUi}
                        expanded={budgetsExpanded}
                        onToggleExpand={() => setBudgetsExpanded(s => !s)}
                        onAddBudget={() => setOpenBudgetDialog(true)}
                    />

                    <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6 transition-shadow hover:shadow-lg">
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setAccountsExpanded((s) => !s)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setAccountsExpanded((s) => !s); } }}
                            className="flex items-center justify-between mb-3 group cursor-pointer"
                        >
                            <h3 className="font-semibold">Accounts</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); navigate('/accounts'); }} title="Manage accounts" className="p-1 rounded hover:bg-white/5">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setAccountsExpanded((s) => !s); }} className="p-1 rounded hover:bg-white/5">
                                    {accountsExpanded ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {(accountsExpanded ? accountsUi : accountsUi.slice(0, 3)).map((a) => (
                                <div key={a.name} className="flex justify-between items-center transition-colors hover:bg-white/5 rounded p-2">
                                    <div>
                                        <div className="text-sm font-medium">{a.name}</div>
                                        <div className="text-xs text-slate-400">{a.type} • {a.lastSync}</div>
                                    </div>
                                    <div className="text-sm font-semibold">{currency(a.balance)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => navigate('/accounts/link')} className="px-3 py-2 bg-emerald-500 rounded text-white text-sm flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10 14l6-6M4 20l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                Link
                            </button>
                            <button onClick={() => navigate('/accounts')} className="px-3 py-2 bg-transparent border border-white/10 rounded text-white text-sm">Manage</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Activity: Transactions, Category Breakdown, Heatmap */}
            <section aria-labelledby="activity-heading" className="mb-10">
                <h2 id="activity-heading" className="text-sm font-medium text-slate-300 mb-3">Activity</h2>
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    {/* UPDATED: TransactionList component now spans 3 columns (lg:col-span-3) */}
                    <div className="lg:col-span-3">
                        <TransactionList
                            transactions={transactions.slice(0, 5)}
                            expanded={false}
                            onToggleExpand={() => navigate('/transactions')}
                            onNavigate={() => navigate('/transactions')}
                        />
                    </div>

                    {/* UPDATED: Category Breakdown component now spans 2 columns (lg:col-span-2) */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6">
                            <h3 className="font-semibold mb-3">Spending by Category</h3>
                            <CategoryBreakdown categoryBreakdown={categoryBreakdown} monthlyExpenses={monthlyExpenses} />
                        </div>
                    </div>

                    {/* Spending Heatmap remains at 2 columns */}
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6">
                            <h3 className="font-semibold mb-3">Spending Heatmap</h3>
                            <div className="space-y-4">
                                {heatmap.map((week, weekIndex) => (
                                    <div key={weekIndex} className="grid grid-cols-7 gap-1">
                                        {week.map((value, dayIndex) => (
                                            <div
                                                key={`${weekIndex}-${dayIndex}`}
                                                className={`
                                                    text-[10px] text-center py-2 rounded
                                                    ${value === 0 ? 'bg-white/3' :
                                                        value < 1000 ? 'bg-green-500/20' :
                                                            value < 5000 ? 'bg-green-500/40' :
                                                                'bg-green-500/60'}
                                                `}
                                            >
                                                <div className="text-[9px] font-medium">
                                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][dayIndex]}
                                                </div>
                                                <div className="text-[9px] mt-1">{currency(value)}</div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                                <div className="flex justify-between text-xs text-slate-400 mt-2">
                                    <span>Less</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 rounded bg-white/3"></div>
                                        <div className="w-3 h-3 rounded bg-green-500/20"></div>
                                        <div className="w-3 h-3 rounded bg-green-500/40"></div>
                                        <div className="w-3 h-3 rounded bg-green-500/60"></div>
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
                <div>Last synced: {financialSummary.lastSynced || "a few minutes ago"}</div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-transparent border border-white/10 rounded">Settings</button>
                    <button className="px-3 py-2 bg-transparent border border-white/10 rounded">Download Report (PDF)</button>
                </div>
            </footer>

            <AddBudgetDialog
                open={openBudgetDialog}
                setOpen={setOpenBudgetDialog}
                onSave={handleAddBudget}
            />

            <AddGoalDialog
                open={openGoalDialog}
                setOpen={setOpenGoalDialog}
                onSave={handleAddGoal}
            />

            <AddBillDialog
                open={openAddBillDialog}
                setOpen={setOpenAddBillDialog}
            />

        </div>
    );

}