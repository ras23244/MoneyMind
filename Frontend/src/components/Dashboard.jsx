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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUser } from "../context/UserContext";
import { useTransactions } from "./hooks/useTransactions";
import { useBudgets } from "./hooks/useBudgets";
import { useGoals } from "./hooks/useGoals";

import { useBills, useBillSummary } from './hooks/useBills';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import AddBudgetDialog from "./AddBudgetDialog";
import { useCreateBudget } from "./hooks/useBudgetMutations";
import BalanceCards from './BalanceCards';
import AddGoalDialog from "./AddGoalDialog";
import { useCreateGoal } from "./hooks/useGoals";
import dayjs from "dayjs";
import NotesPanel from './NotesPanel';
import CategoryBreakdown from './dashboard/CategoryBreakdown';
import CategoryModal from './dashboard/CategoryModal';
import AlertsPanel from './dashboard/AlertsPanel';
import InsightsPanel from './dashboard/InsightsPanel';
import TransactionList from './dashboard/TransactionList';

import BillsPanel from './dashboard/BillsPanel';
import {
    useFinancialSummary,
    useCategoryBreakdown,
    useSpendingHeatmap,
    useTrendData
} from './hooks/useAggregatedData';
import { useCategoryAggregation } from './hooks/useAggregatedData';

const currency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
    const { user, loading: userLoading } = useUser();
    const [showBalance, setShowBalance] = useState(true);
    const [dateRange] = useState('6M');
    const navigate = useNavigate();

    // expandable section states
    const [budgetsExpanded, setBudgetsExpanded] = useState(false);
    const [goalsExpanded, setGoalsExpanded] = useState(false);
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

    const { data: bills = [], isLoading: billsLoading } = useBills(user?._id, { days: 30 });
    const { data: billsSummary = {}, isLoading: billsSummaryLoading } = useBillSummary(user?._id);
    const { data: financialSummary = {}, isLoading: summaryLoading } = useFinancialSummary(user?._id);

    // Optimized data fetching with backend aggregations
    const { data: categoryBreakdownData = [], isLoading: categoryBreakdownLoading } = useCategoryBreakdown(user?._id);
    const { data: spendingHeatmap = [], isLoading: spendingHeatmapLoading } = useSpendingHeatmap(user?._id);
    const { data: monthlyTrends = [], isLoading: trendsLoading } = useTrendData(user?._id);

    const loading = userLoading || txLoading || budgetsLoading || goalsLoading ||
        summaryLoading || categoryBreakdownLoading ||
        spendingHeatmapLoading || trendsLoading || billsLoading || billsSummaryLoading;

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

    const categoryBreakdown = categoryBreakdownData;
    const trendData = monthlyTrends;

    // Category breakdown UI state (for quick view and modal)
    const [catRange, setCatRange] = useState('1M'); // '1M' | '3M' | '6M' | 'custom'
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [customStart, setCustomStart] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [customEnd, setCustomEnd] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));

    const aggregateFromTxs = (txs, start, end) => {
        const map = {};
        (txs || []).forEach((t) => {
            if (!t.date) return;
            const d = dayjs(t.date).startOf('day');
            if (d.isBefore(dayjs(start).startOf('day')) || d.isAfter(dayjs(end).endOf('day'))) return;
            const amt = Math.abs(Number(t.amount || 0));
            if (!amt) return;
            const cat = t.category || t.description || 'Other';
            map[cat] = (map[cat] || 0) + amt;
        });
        return Object.keys(map).map(k => ({ name: k, value: map[k] })).sort((a, b) => b.value - a.value);
    };

    const budgetsUi = useMemo(() => budgets.map(b => ({
        name: b.category || 'Other',
        spent: Number(b.spent) || 0,
        limit: Number(b.amount) || 0,
    })), [budgets]);

    const goalsUi = useMemo(() => goals.map(g => ({
        name: g.title || g.name || 'Goal',
        current: Number(g.currentAmount ?? g.current) || 0,
        target: Number(g.targetAmount ?? g.target) || 0,
    })), [goals]);



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

    const { data: currentAgg = { overall: [], monthwise: [] }, isLoading: currentAggLoading } = useCategoryAggregation(user?._id, { range: '1M' });
    const { data: modalAgg = { overall: [], monthwise: [] }, isLoading: modalAggLoading } = useCategoryAggregation(user?._id, catRange === 'custom' ? { start: customStart, end: customEnd } : { range: catRange });

    const currentRangeStart = dayjs().startOf('month');
    const currentRangeEnd = dayjs().endOf('month');
    const fallbackCurrent = aggregateFromTxs(transactions, currentRangeStart, currentRangeEnd);

    let modalRangeStart;
    let modalRangeEnd = dayjs().endOf('day');
    if (catRange === '1M') modalRangeStart = dayjs().startOf('month');
    else if (catRange === '3M') modalRangeStart = dayjs().startOf('month').subtract(2, 'month');
    else if (catRange === '6M') modalRangeStart = dayjs().startOf('month').subtract(5, 'month');
    else modalRangeStart = dayjs(customStart);
    const fallbackModalOverall = aggregateFromTxs(transactions, modalRangeStart, modalRangeEnd);

    console.log("transactions from dashboard", transactions)

    const recentTransactions = transactions
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    console.log("recentTransactions", recentTransactions);


    const heatmap = spendingHeatmap;
    console.log("Heatmap data:", heatmap);
    const _defaultHeatmap = Array.from({ length: 4 }, () => Array.from({ length: 7 }, () => 0));
    const heatmapRows = Array.isArray(heatmap) && heatmap.length === 4 && heatmap.every(r => Array.isArray(r) && r.length === 7)
        ? heatmap
        : _defaultHeatmap;


    const insights = useMemo(() => {
        const res = [];
        if (monthlyExpenses > monthlyIncome * 0.6) res.push('You spent a large portion of your income this month — consider trimming non-essential spends.');
        if (monthlySavings > 0) res.push('Good job — you are saving consistently this month!');
        if (categoryBreakdown[0]?.value > monthlyExpenses * 0.3) res.push(`Big chunk of spending is on ${categoryBreakdown[0].name}. Review that category.`);
        if (budgetsUi.some(b => b.limit > 0 && b.spent / b.limit >= 0.9)) res.push('Some budgets are near their limit — check them.');
        return res;
    }, [monthlyExpenses, monthlyIncome, monthlySavings, categoryBreakdown, budgetsUi]);


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

    const balanceData = {
        totalBalance: financialSummary.totalBalance ?? totalBalance,
        monthlyIncome: financialSummary.monthlyIncome ?? monthlyIncome,
        monthlyExpenses: financialSummary.monthlyExpenses ?? monthlyExpenses,
        monthlySavings: financialSummary.monthlySavings ?? monthlySavings,
        incomeChange: typeof financialSummary.incomeChange !== 'undefined' ? financialSummary.incomeChange : 0,
        expensesChange: typeof financialSummary.expensesChange !== 'undefined' ? financialSummary.expensesChange : 0,
        savingsChange: typeof financialSummary.savingsChange !== 'undefined' ? financialSummary.savingsChange : 0,
        netWorth: financialSummary.netWorth ?? totalBalance,
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
                    setIsBalanceVisible={setShowBalance}
                    formatCurrency={currency}
                />
            </section>


            <section aria-labelledby="insights-heading" className="mb-8">
                <h2 id="insights-heading" className="text-sm font-medium text-slate-300 mb-3">Insights & Analysis</h2>
                <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1.1fr_1.1fr] gap-6 h-[520px] min-h-0">

                    <div className="h-full min-h-0 overflow-hidden">
                        <BillsPanel userId={user?._id} onNavigate={() => navigate('/bills')} />
                    </div>

                    <div className="flex flex-col gap-3 h-full min-h-0">
                        <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6 flex flex-col min-h-0">
                          
                            <div className="flex-1 min-h-0 overflow-y-auto">
                                <NotesPanel />
                            </div>
                        </div>

                        <div className="bg-slate-800/40 rounded-lg p-3 border border-white/6 overflow-auto" style={{ maxHeight: '400px' }}>
                            <InsightsPanel budgets={budgetsUi} goals={goalsUi} currency={currency} />
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
                                currency={currency}
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
                            onToggleExpand={() => navigate('/transactions')}
                            onNavigate={() => navigate('/transactions')}
                        />
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/40 rounded-lg p-4 border border-white/6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">Spending by Category</h3>
                                <div className="flex items-center gap-2">
                                    <div className="text-sm text-slate-400">Showing: Current month</div>
                                    <button onClick={() => setCatModalOpen(true)} className="px-3 py-1 bg-slate-700/40 rounded text-sm text-white">See more</button>
                                </div>
                            </div>
                            <div className="mt-3">
                                {currentAggLoading ? (
                                    <div className="text-sm text-slate-400">Loading category breakdown...</div>
                                ) : (currentAgg.overall && currentAgg.overall.length) ? (
                                    <CategoryBreakdown categoryBreakdown={currentAgg.overall} monthlyExpenses={currentAgg.overall.reduce((s, c) => s + c.value, 0) || monthlyExpenses} />
                                ) : (fallbackCurrent && fallbackCurrent.length) ? (
                                    <CategoryBreakdown categoryBreakdown={fallbackCurrent} monthlyExpenses={fallbackCurrent.reduce((s, c) => s + c.value, 0) || monthlyExpenses} />
                                ) : (
                                    <div className="text-sm text-slate-400">No category spending data available for this period.</div>
                                )}
                            </div>
                            <CategoryModal
                                open={catModalOpen}
                                setOpen={setCatModalOpen}
                                catRange={catRange}
                                setCatRange={setCatRange}
                                customStart={customStart}
                                customEnd={customEnd}
                                setCustomStart={setCustomStart}
                                setCustomEnd={setCustomEnd}
                                modalAgg={modalAgg}
                                modalAggLoading={modalAggLoading}
                                fallbackOverall={fallbackModalOverall}
                                monthlyExpenses={monthlyExpenses}
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-slate-800/60 rounded-xl p-4 border border-white/10 shadow-md max-w-[850px] mx-auto">
                            <h3 className="font-semibold mb-4 text-slate-100 text-lg text-center">
                                Spending Heatmap
                            </h3>

                            <div className="flex flex-col gap-2">
                                {heatmapRows.map((week, weekIndex) => (
                                    <div
                                        key={weekIndex}
                                        className="grid grid-cols-7 gap-2 justify-center"
                                    >
                                        {week.map((value, dayIndex) => {
                                            const todayDay = dayjs().day();
                                            const offsetWithinWeek = (todayDay - dayIndex + 7) % 7;
                                            const daysSince = offsetWithinWeek + weekIndex * 7;
                                            const cellDate = dayjs().startOf("day").subtract(daysSince, "day");
                                            const label = cellDate.format("D MMM");

                                            let bgColor = "bg-white/10";
                                            if (value > 0 && value < 1000) bgColor = "bg-emerald-500/20";
                                            else if (value >= 1000 && value < 5000) bgColor = "bg-emerald-500/40";
                                            else if (value >= 5000) bgColor = "bg-emerald-500/60";

                                            return (
                                                <div
                                                    key={`${weekIndex}-${dayIndex}`}
                                                    className={`group flex flex-col items-center justify-center rounded-lg ${bgColor}
                                                        p-2 sm:p-3 min-h-[60px] transition-all duration-200 border border-white/5 text-center
                                                        hover:scale-105 hover:border-emerald-400/30 hover:shadow-md hover:shadow-emerald-500/10 hover:brightness-110
                `}
                                                >
                                                    <span className="text-[11px] text-slate-300 leading-tight group-hover:text-emerald-300 transition-colors duration-200">
                                                        {label}
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-100 group-hover:text-white transition-colors duration-200">
                                                        {currency(value)}
                                                    </span>
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