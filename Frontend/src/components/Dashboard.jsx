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
import { useUser } from "../context/UserContext";
import { useTransactions } from "./hooks/useTransactions";
import { useBudgets } from "./hooks/useBudgets";
import { useGoals } from "./hooks/useGoals";
import { useAccounts } from "./hooks/useAccounts";
import { useFinancialSummary } from "./hooks/useFinancialSummary";
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import AddBudgetDialog from "./AddBudgetDialog";
import { useCreateBudget } from "./hooks/useBudgetMutations";
import AddGoalDialog from "./AddGoalDialog";
import { useCreateGoal } from "./hooks/useGoals";
import dayjs from "dayjs";
import NotesPanel from './NotesPanel';

const currency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const percent = (n) => `${Math.round(n)}%`;
const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#f43f5e', '#a78bfa'];

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
    const createGoalMutation = useCreateGoal(user?._id);

    // --- Fetch real backend data ---
    const { data: transactions = [], isLoading: txLoading } = useTransactions(user?._id);
    const { data: budgets = [], isLoading: budgetsLoading } = useBudgets(user?._id, {});
    const { data: goals = [], isLoading: goalsLoading } = useGoals(user?._id);
    const { data: accounts = [], isLoading: accountsLoading } = useAccounts(user?._id);
    const { data: financialSummary = {}, isLoading: summaryLoading } = useFinancialSummary(user?._id);

    const loading = userLoading || txLoading || budgetsLoading || goalsLoading || accountsLoading || summaryLoading;

    // current month key YYYY-MM
    const monthKey = useMemo(() => new Date().toISOString().slice(0, 7), []);

    // Derived summary metrics (prefer backend summary, fallback to computed values)
    const totalBalance = financialSummary.totalBalance ?? accounts.reduce((s, a) => s + (Number(a.balance) || 0), 0);
    const monthlyIncome = financialSummary.monthlyIncome ?? transactions
        .filter(t => t.date && t.date.slice(0, 7) === monthKey && Number(t.amount) > 0)
        .reduce((s, t) => s + Number(t.amount || 0), 0);
    const monthlyExpenses = financialSummary.monthlyExpenses ?? Math.abs(transactions
        .filter(t => t.date && t.date.slice(0, 7) === monthKey && Number(t.amount) < 0)
        .reduce((s, t) => s + Number(t.amount || 0), 0));
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const disposableAfterBudgets = financialSummary.disposableAfterBudgets ?? (() => {
        const totalBudgetAmount = budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        return (monthlyIncome || 0) - totalBudgetAmount;
    })();
    const netWorth = financialSummary.netWorth ?? totalBalance;

    // Category breakdown (current month expenses)
    const categoryBreakdown = useMemo(() => {
        const map = {};
        transactions.forEach((t) => {
            if (!t.date || t.date.slice(0, 7) !== monthKey) return;
            const amt = Number(t.amount || 0);
            if (amt >= 0) return;
            const key = t.category || 'Other';
            map[key] = (map[key] || 0) + Math.abs(amt);
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6);
    }, [transactions, monthKey]);

    

    // Trend data for last 6 months based on transactions
    const trendData = useMemo(() => {
        const monthMap = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toISOString().slice(0, 7);
            monthMap[key] = { income: 0, expenses: 0, label: d.toLocaleString('en-US', { month: 'short' }) };
        }
        transactions.forEach((t) => {
            if (!t.date) return;
            const key = t.date.slice(0, 7);
            if (!monthMap[key]) return;
            const amt = Number(t.amount || 0);
            if (amt >= 0) monthMap[key].income += amt;
            else monthMap[key].expenses += Math.abs(amt);
        });
        return Object.keys(monthMap).map(k => ({
            month: monthMap[k].label,
            income: Math.round(monthMap[k].income),
            expenses: Math.round(monthMap[k].expenses)
        }));
    }, [transactions]);

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
    // Heatmap: last 28 days spends
    const heatmap = useMemo(() => {
        const days = {};
        const today = new Date();
        for (let i = 27; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            days[d.toISOString().slice(0, 10)] = 0;
        }
        transactions.forEach((t) => {
            if (!t.date) return;
            const dateKey = t.date.slice(0, 10);
            if (days.hasOwnProperty(dateKey)) days[dateKey] += Math.abs(Number(t.amount || 0));
        });
        const keys = Object.keys(days).sort(); // oldest -> newest
        const weeks = [];
        for (let w = 0; w < 4; w++) {
            const week = [];
            for (let d = 0; d < 7; d++) {
                const idx = w * 7 + d;
                week.push(Math.round(days[keys[idx]] || 0));
            }
            weeks.push(week);
        }
        return weeks;
    }, [transactions]);

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
        <div className="p-6 max-w-[1300px] mx-auto">
            {/* Top actions */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowBalance(s => !s)} className="px-3 py-2 bg-slate-800 rounded-md text-sm text-white">
                        {showBalance ? 'Hide Balances' : 'Show Balances'}
                    </button>
                    <button onClick={exportCSV} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-md text-white text-sm">
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-lg border border-white/6">
                    <p className="text-sm text-slate-300">Total Balance</p>
                    <p className="text-xl font-semibold mt-2">{showBalance ? currency(totalBalance) : '••••••'}</p>
                    <p className="text-xs text-slate-400 mt-1">Net worth: {currency(netWorth)}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/6">
                    <p className="text-sm text-slate-300">Income (This month)</p>
                    <p className="text-xl font-semibold mt-2">{currency(monthlyIncome)}</p>
                    <p className="text-xs text-slate-400 mt-1">Trend vs last month: +5%</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/6">
                    <p className="text-sm text-slate-300">Expenses (This month)</p>
                    <p className="text-xl font-semibold mt-2">{currency(monthlyExpenses)}</p>
                    <p className="text-xs text-slate-400 mt-1">Recurring bills: {billsUi.length}</p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/6">
                    <p className="text-sm text-slate-300">Savings</p>
                    <p className="text-xl font-semibold mt-2">{currency(monthlySavings)}</p>
                    <p className="text-xs text-slate-400 mt-1">Disposable: {currency(disposableAfterBudgets)}</p>
                </div>
            </div>

            {/* Charts + insights row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4 border border-white/6">
                    <h3 className="font-semibold mb-2">Spending by Category</h3>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" outerRadius={70} innerRadius={40}>
                                    {categoryBreakdown.map((entry, index) => (
                                        <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v) => currency(v)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2">
                        {categoryBreakdown.map((c, i) => (
                            <div key={c.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span style={{ background: COLORS[i % COLORS.length] }} className="w-3 h-3 rounded-sm inline-block" />
                                    <div>
                                        <div className="text-sm font-medium">{c.name}</div>
                                        <div className="text-xs text-slate-400">{percent((c.value / Math.max(1, monthlyExpenses)) * 100)}</div>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold">{currency(c.value)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/6 col-span-1 lg:col-span-2">
                    <div className="bg-[#1e1e1e] rounded-2xl shadow p-4 flex flex-col h-[500px]">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold">Insights</h2>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowNotes((prev) => !prev)}
                            >
                                {showNotes ? "Notes" : "Notes"}
                            </Button>
                        </div>
                        {showNotes ? (
                            <NotesPanel />
                        ) : (
                            <div className="overflow-y-auto flex-1 pr-1">
                                <ul className="space-y-2 text-sm">
                                    <li className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                                        ⚠️ You’ve already spent 80% of your Food budget.
                                    </li>
                                    <li className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        🎉 You saved ₹10,000 this month – 20% more than usual!
                                    </li>
                                    <li className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                        🔮 Forecast: You may overspend on Shopping next month.
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Middle row: Budgets, Goals, Accounts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Budgets */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Budgets</h3>
                        <div className="mt-4 flex gap-2">
                        
                            <Button
                                onClick={() => setOpenBudgetDialog(true)}
                                className="text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 5v14M5 12h14"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                
                            </Button>
                        </div>

                    </div>
                    <div className="space-y-3">
                        {(budgetsExpanded ? budgetsUi : budgetsUi.slice(0, 3)).map((b) => {
                            const pct = Math.min(100, (b.spent / Math.max(1, b.limit)) * 100);
                            return (
                                <div key={b.name}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium">{b.name}</div>
                                            <div className="text-xs text-slate-400">{currency(b.spent)} of {currency(b.limit)}</div>
                                        </div>
                                        <div className="text-sm font-semibold">{percent(pct)}</div>
                                    </div>
                                    <div className="w-full bg-white/10 h-2 rounded mt-2 overflow-hidden">
                                        <div style={{ width: `${pct}%` }} className={`h-2 ${pct > 90 ? 'bg-red-500' : 'bg-emerald-400'}`} />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Expand/Collapse Button */}
                        {budgetsUi.length > 3 && (
                            <div className="flex justify-center mt-3">
                                <button
                                    onClick={() => setBudgetsExpanded((s) => !s)}
                                    className="p-1 rounded hover:bg-white/10 transition"
                                >
                                    {budgetsExpanded ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M18 15l-6-6-6 6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M6 9l6 6 6-6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    
                </div>

                {/* Goals */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Goals</h3>
                        <div className="mt-4 flex gap-2">
                            <Button
                                onClick={() => setOpenGoalDialog(true)}
                                className="text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 5v14M5 12h14"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(goalsExpanded ? goalsUi : goalsUi.slice(0, 3)).map((g) => {
                            const pct = Math.min(100, (g.current / Math.max(1, g.target)) * 100);
                            return (
                                <div key={g.name}>
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="text-sm font-medium">{g.name}</div>
                                            <div className="text-xs text-slate-400">{currency(g.current)} of {currency(g.target)}</div>
                                        </div>
                                        <div className="text-sm font-semibold">{percent(pct)}</div>
                                    </div>
                                    <div className="w-full bg-white/10 h-2 rounded mt-2 overflow-hidden">
                                        <div style={{ width: `${pct}%` }} className="h-2 bg-blue-400" />
                                    </div>
                                </div>
                            );
                        })}

                        {/* Expand/Collapse Button */}
                        {goalsUi.length > 3 && (
                            <div className="flex justify-center mt-3">
                                <button
                                    onClick={() => setGoalsExpanded((s) => !s)}
                                    className="p-1 rounded hover:bg-white/10 transition"
                                >
                                    {goalsExpanded ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M18 15l-6-6-6 6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path
                                                d="M6 9l6 6 6-6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    
                </div>

                {/* Accounts */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Accounts</h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => navigate('/accounts')} title="Manage accounts" className="p-1 rounded hover:bg-white/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            </button>
                            <button onClick={() => setAccountsExpanded((s) => !s)} className="p-1 rounded hover:bg-white/5">
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
                            <div key={a.name} className="flex justify-between items-center">
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

            {/* Recent transactions + Upcoming bills + Heatmap + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2 bg-white/5 rounded-lg p-4 border border-white/6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">Recent Transactions</h3>
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-slate-400">{txExpanded ? `Showing ${transactions.length}` : 'Showing last 5'}</div>
                            <button onClick={() => navigate('/transactions')} title="Open transactions" className="p-1 rounded hover:bg-white/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </button>
                            <button onClick={() => setTxExpanded(s => !s)} className="p-1 rounded hover:bg-white/5">
                                {txExpanded ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {(txExpanded ? transactions : transactions.slice(0, 5)).map((t) => (
                            <div key={t._id || t.id} className="flex items-center justify-between p-3 bg-white/3 rounded">
                                <div className="flex gap-3 items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${Number(t.amount) >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                        <div className="text-sm">{(t.category || 'X')[0]}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{t.description || t.desc || t.note || t.title}</div>
                                        <div className="text-xs text-slate-400">{(t.date || "").slice(0, 10)} • {t.account || t.bank || ''}</div>
                                    </div>
                                </div>
                                <div className={`text-sm font-semibold ${Number(t.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {Number(t.amount) >= 0 ? '+' : ''}{currency(Number(t.amount) || 0)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/6">
                    <h3 className="font-semibold mb-3">Upcoming Bills</h3>
                    <div className="space-y-2 mb-4">
                        {billsUi.map((b) => (
                            <div key={b.id} className="flex justify-between text-sm">
                                <div>
                                    <div className="font-medium">{b.title}</div>
                                    <div className="text-xs text-slate-400">Due {b.due}</div>
                                </div>
                                <div className="text-sm font-semibold">{currency(Number(b.amount) || 0)}</div>
                            </div>
                        ))}
                    </div>

                    <h3 className="font-semibold mb-2">Weekly Spend Heatmap</h3>
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {heatmap[0].map((v, i) => (
                            <div key={`h0-${i}`} className="text-[10px] text-center py-2 bg-white/3 rounded">
                                <div className="text-xs font-medium">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</div>
                                <div className="text-xs mt-1">{currency(v)}</div>
                            </div>
                        ))}
                    </div>

                    <h3 className="font-semibold mb-2">Quick Insights</h3>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
                        {insights.map((ins, idx) => (
                            <li key={idx}>{ins}</li>
                        ))}
                    </ul>

                    <div className="mt-4">
                        <button className="w-full px-3 py-2 bg-indigo-600 rounded text-white text-sm">Ask Assistant</button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-slate-400">
                <div>Last synced: {financialSummary.lastSynced || "a few minutes ago"}</div>
                <div className="flex gap-2">
                    <button className="px-3 py-2 bg-transparent border border-white/10 rounded">Settings</button>
                    <button className="px-3 py-2 bg-transparent border border-white/10 rounded">Download Report (PDF)</button>
                </div>
            </div>
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


        </div>

        
    );
    
}
