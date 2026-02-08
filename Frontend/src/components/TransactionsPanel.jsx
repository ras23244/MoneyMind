// src/components/TransactionsPanel.jsx
import React, { useState, useMemo } from "react";
import ExportDialog from "./dialogs/ExportDialog";
import { useTransactions } from "./hooks/useTransactions";
import { useUser } from "../context/UserContext";
import AddTransactionDialog from "./AddTransactionDialog";
import ImportCSVDialog from "./dialogs/ImportCSVDialog";
import { Button } from "@/components/ui/button";
import TransactionDetailsPanel from "./TransactionDetailsPanel";
import TransactionTrendsChart from "./TransactionTrendsChart";
import TransactionCalendar from "./TransactionCalendar";
import TransactionsList from "./TransactionList";
import ImageImportDialog from "./dialogs/ImageImportDialog";

const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

export default function TransactionsPanel({ selectedDate, setSelectedDate, formatCurrency }) {
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [openExportDialog, setOpenExportDialog] = useState(false);
    const [limit, setLimit] = useState(3);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [openImageImportDialog, setOpenImageImportDialog] = useState(false);

    const { user } = useUser();
    const userId = user?._id;

    const { data: allTransactions = [], isLoading, error } = useTransactions(userId);

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

    if (isLoading) return <p className="text-white">Loading financial data...</p>;
    if (error) return <p className="text-red-500">Error loading transactions</p>;

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-bold text-white">Transactions</p>
                <div className="flex gap-2">
                    <Button
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        onClick={() => setOpenImageImportDialog(true)}
                    >
                        Add Receipt
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setOpenImportDialog(true)}
                    >
                        Import CSV
                    </Button>
                    <Button
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setOpenExportDialog(true)}
                    >
                        Export
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TransactionTrendsChart userId={userId} />
                <TransactionCalendar
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                />
            </div>

            <hr className="my-6 border-t-2 border-gray-700" />

            <TransactionsList
                userId={userId}
                transactions={filteredTransactions}
                search={search}
                setSearch={setSearch}
                limit={limit}
                setLimit={setLimit}
                selectedDate={selectedDate}
                setSelectedTransaction={setSelectedTransaction}
                setEditing={setEditing}
                setOpenDialog={setOpenDialog}
                formatCurrency={formatCurrency}
            />

            <TransactionDetailsPanel
                transaction={selectedTransaction}
                onClose={() => setSelectedTransaction(null)}
            />

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

            <ImageImportDialog open={openImageImportDialog} setOpen={setOpenImageImportDialog} />
            <ImportCSVDialog open={openImportDialog} setOpen={setOpenImportDialog} />
            <ExportDialog open={openExportDialog} setOpen={setOpenExportDialog} />
        </>
    );
}
