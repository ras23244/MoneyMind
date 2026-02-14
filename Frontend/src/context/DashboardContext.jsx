import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from './UserContext';
import { useBudgets } from '../components/hooks/useBudgets';
import { useTransactions } from '../components/hooks/useTransactions';
import { useFinancialSummary } from '../components/hooks/useFinancialSummary';
import { useGoals } from '../components/hooks/useGoals';
import { useBills, useBillSummary } from '../components/hooks/useBills';
import { useCategoryBreakdown, useSpendingHeatmap, useTrendData } from '../components/hooks/useAggregatedData';
import { useNavigate } from 'react-router-dom';

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
    const { user, loading } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user && (!Array.isArray(user.bankAccounts) || user.bankAccounts.length === 0)) {
            navigate('/link-bank-account');
        }
    }, [user, loading, navigate]);

    const { data: budgets = [] } = useBudgets(user?._id);
    const { data: transactions = [], refetch: refetchTransactions } = useTransactions(user?._id);
    const { data: financialSummary = {}, isLoading: summaryLoading } = useFinancialSummary(user?._id);
    const { data: goals = [], isLoading: goalsLoading } = useGoals(user?._id);
    const { data: bills = [], isLoading: billsLoading } = useBills(user?._id, { days: 30 });
    const { data: billsSummary = {}, isLoading: billsSummaryLoading } = useBillSummary(user?._id);
    const { data: categoryBreakdownData = [], isLoading: categoryBreakdownLoading } = useCategoryBreakdown(user?._id);
    const { data: spendingHeatmap = [], isLoading: spendingHeatmapLoading } = useSpendingHeatmap(user?._id);
    const { data: monthlyTrends = [], isLoading: trendsLoading } = useTrendData(user?._id);

    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const formatCurrency = useCallback((amount) => {
        if (!isBalanceVisible && Math.abs(amount) > 1000) return "••••••";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2
        }).format(Math.abs(amount));
    }, [isBalanceVisible]);

    const loadingCombined = loading || summaryLoading || goalsLoading || billsLoading || billsSummaryLoading || categoryBreakdownLoading || spendingHeatmapLoading || trendsLoading;

    const value = useMemo(() => ({
        user,
        loading: loadingCombined,
        budgets,
        transactions,
        refetchTransactions,
        financialSummary,
        goals,
        bills,
        billsSummary,
        categoryBreakdownData,
        spendingHeatmap,
        monthlyTrends,
        isBalanceVisible,
        setIsBalanceVisible,
        selectedDate,
        setSelectedDate,
        formatCurrency
    }), [user, loadingCombined, budgets, transactions, refetchTransactions, financialSummary, goals, bills, billsSummary, categoryBreakdownData, spendingHeatmap, monthlyTrends, isBalanceVisible, selectedDate, formatCurrency]);

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
    return ctx;
}

export default DashboardContext;
