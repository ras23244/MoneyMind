// src/components/TransactionsPanel.jsx
import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { useTransactionTrends } from "./hooks/useTransactionTrends";
import { useTransactions } from "./hooks/useTransactions";
import { useUser } from "../context/UserContext";
import AddTransactionDialog from "./AddTransactionDialog";
import { useEditTransaction } from "./hooks/useEditTransaction";
import { useDeleteTransaction } from "./hooks/useDeleteTransaction";
import TransactionDetailsPanel from "./TransactionDetailsPanel";
import TransactionTrendsChart from "./TransactionTrendsChart";
import TransactionCalendar from "./TransactionCalendar";
import TransactionBreakdownChart from "./TransactionBreakdownChart";
import TransactionsList from "./TransactionList";
import { useTransactionBreakdown } from "./hooks/useTransactionBreakdown"; // ⬅️ New custom hook

// Helper function for date comparison
const isSameDay = (d1, d2) => {
    return (
        d1.getUTCFullYear() === d2.getUTCFullYear() &&
        d1.getUTCMonth() === d2.getUTCMonth() &&
        d1.getUTCDate() === d2.getUTCDate()
    );
};

export default function TransactionsPanel({ selectedDate, setSelectedDate, formatCurrency }) {
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [limit, setLimit] = useState(3);
    const [selectedTag, setSelectedTag] = useState(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const { user } = useUser();
    const userId = user?._id;

    // Queries
    const { data: transactionTrendData = [], isLoading: trendsLoading, error: trendsError } =
        useTransactionTrends(userId);
    const { data: allTransactions = [], isLoading: txLoading, error: txError } = useTransactions(userId);

    const editTransactionMutation = useEditTransaction(userId);
    const deleteTransactionMutation = useDeleteTransaction(userId);

    // Export to Excel
    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(filteredTransactions);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transactions");
        XLSX.writeFile(wb, "transactions.xlsx");
    };

    // Edit + Delete actions
    const handleEdit = (transaction) => {
        setEditing(transaction);
        setOpenDialog(true);
    };

    const handleDelete = (_id) => {
        deleteTransactionMutation.mutate(_id);
    };

    // 🔹 Filter transactions using a memoized function
    const filteredTransactions = useMemo(() => {
        const dateToShow = selectedDate || new Date();
        const searchLower = search.toLowerCase();

        return allTransactions.filter((t) => {
            const txDate = new Date(t.date);
            const datesMatch = isSameDay(txDate, dateToShow);

            if (!search) return datesMatch;

            return (
                datesMatch &&
                (t.description.toLowerCase().includes(searchLower) ||
                    t.category.toLowerCase().includes(searchLower))
            );
        });
    }, [search, allTransactions, selectedDate]);

    // 🔹 Pie chart data using custom hook
    const { mainChartData, drilldownChartData } = useTransactionBreakdown(allTransactions, selectedTag);

    // Consolidated loading and error state
    if (trendsLoading || txLoading) {
        return <p className="text-white">Loading financial data...</p>;
    }

    if (trendsError || txError) {
        return <p className="text-red-500">Error loading data. Trends: {trendsError?.message}, Transactions: {txError?.message}</p>;
    }

    return (
        <>
            {/* Trends + Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TransactionTrendsChart data={transactionTrendData} />
                <TransactionCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>

            <hr className="my-6 border-t-2 border-gray-700" />

            {/* Pie Charts */}
            {/* <TransactionBreakdownChart
                mainChartData={mainChartData}
                drilldownChartData={drilldownChartData}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
            /> */}

            <hr className="my-6 border-t-2 border-gray-700" />

            {/* Transaction List */}
            <TransactionsList
                selectedDate={selectedDate}
                search={search}
                setSearch={setSearch}
                transactions={filteredTransactions}
                limit={limit}
                setLimit={setLimit}
                setSelectedTransaction={setSelectedTransaction}
                formatCurrency={formatCurrency}
                handleExport={handleExport}
                handleDelete={handleDelete}
                handleEdit={handleEdit}
            />

            {/* Transaction Detail Popup */}
            <TransactionDetailsPanel transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />

            {/* Add/Edit Dialog */}
            <AddTransactionDialog
                open={openDialog}
                setOpen={setOpenDialog}
                userId={userId}
                transaction={editing}
                onTransactionCreated={() => {
                    setEditing(null);
                    setOpenDialog(false);
                }}
            />
        </>
    );
}