import React from 'react';
import TransactionsPanel from '../../components/TransactionsPanel';
import { useDashboard } from '../../context/DashboardContext';

export default function Transactions() {
    const { transactions, selectedDate, setSelectedDate, formatCurrency } = useDashboard();
    return <TransactionsPanel selectedDate={selectedDate} setSelectedDate={setSelectedDate} transactions={transactions} formatCurrency={formatCurrency} />;
}
