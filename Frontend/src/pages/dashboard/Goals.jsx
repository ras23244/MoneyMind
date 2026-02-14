import React from 'react';
import GoalsPanel from '../../components/GoalsPanel';
import { transactionTrendData, financialGoals, connectedBanks } from '@/data/financeData';
import { useDashboard } from '../../context/DashboardContext';

export default function GoalsPage() {
    const { formatCurrency } = useDashboard();
    return <GoalsPanel formatCurrency={formatCurrency} financialGoals={financialGoals} />;
}
