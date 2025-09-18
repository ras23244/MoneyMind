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

// ✅ Import your new components
import TransactionTrendsChart from "./TransactionTrendsChart";
import TransactionCalendar from "./TransactionCalendar";
import TransactionBreakdownChart from "./TransactionBreakdownChart";
import TransactionsList from "./TransactionList";

export default function TransactionsPanel({ selectedDate, setSelectedDate, formatCurrency }) {
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [limit, setLimit] = useState(5);
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

    // Edit + Delete
    const handleEdit = (transaction) => {
        setEditing(transaction);      // Set the transaction to edit
        setOpenDialog(true);   
    };

    const handleDelete = (_id) => {
        deleteTransactionMutation.mutate(_id);
    };

    // 🔹 Filter transactions
    const filteredTransactions = useMemo(() => {
        const dateToShow = selectedDate || new Date();

        return allTransactions.filter((t) => {
            const txDate = new Date(t.date);
            const txYear = txDate.getUTCFullYear();
            const txMonth = txDate.getUTCMonth();
            const txDay = txDate.getUTCDate();

            const selectedYear = dateToShow.getUTCFullYear();
            const selectedMonth = dateToShow.getUTCMonth();
            const selectedDay = dateToShow.getUTCDate();

            const datesMatch = txYear === selectedYear && txMonth === selectedMonth && txDay === selectedDay;

            if (!search) return datesMatch;

            return (
                datesMatch &&
                (t.description.toLowerCase().includes(search.toLowerCase()) ||
                    t.category.toLowerCase().includes(search.toLowerCase()))
            );
        });
    }, [search, allTransactions, selectedDate]);

    // 🔹 Pie chart data
    const { mainChartData, drilldownChartData } = useMemo(() => {
        const tagsData = {};
        allTransactions.forEach((t) => {
            if (t.type === "expense" && t.tags) {
                const tags = Array.isArray(t.tags) ? t.tags : t.tags.split(",").map((tag) => tag.trim());
                tags.forEach((tag) => {
                    const normalizedTag = tag.toLowerCase();
                    tagsData[normalizedTag] = (tagsData[normalizedTag] || 0) + t.amount;
                });
            }
        });

        const mainChartData = Object.keys(tagsData).map((tag) => ({
            name: tag,
            value: tagsData[tag],
        }));

        const drilldownData = {};
        if (selectedTag) {
            allTransactions.forEach((t) => {
                if (
                    t.type === "expense" &&
                    t.tags &&
                    t.tags.map((tag) => tag.trim().toLowerCase()).includes(selectedTag)
                ) {
                    const breakdownKey = t.description || t.category || "Uncategorized";
                    drilldownData[breakdownKey] = (drilldownData[breakdownKey] || 0) + t.amount;
                }
            });
        }

        const drilldownChartData = Object.keys(drilldownData).map((key) => ({
            name: key,
            value: drilldownData[key],
        }));

        return { mainChartData, drilldownChartData };
    }, [allTransactions, selectedTag]);

    if (trendsLoading || txLoading) return <p className="text-white">Loading...</p>;
    if (trendsError || txError) return <p className="text-red-500">Error loading transactions.</p>;

    return (
        <>
            {/* Trends + Calendar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TransactionTrendsChart data={transactionTrendData} />
                <TransactionCalendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            </div>

            {/* Pie Charts */}
            <TransactionBreakdownChart
                mainChartData={mainChartData}
                drilldownChartData={drilldownChartData}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
            />

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
                setEditing={setEditing}
                setOpenDialog={setOpenDialog}
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
