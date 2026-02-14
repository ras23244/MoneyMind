import React from 'react';
import Analytics from '../../components/Analytics';
import { transactionTrendData } from '@/data/financeData';
import { useDashboard } from '../../context/DashboardContext';

export default function AnalyticsPage() {
    const { formatCurrency } = useDashboard();
    return <Analytics formatCurrency={formatCurrency} transactionTrendData={transactionTrendData} />;
}
