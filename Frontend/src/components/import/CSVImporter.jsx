import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, AlertCircle } from 'lucide-react';
import { useBulkAddTransactions } from '../hooks/useBulkAddTransactions';
import { useUser } from '../../context/UserContext';
import { useAccounts } from '../hooks/useAccounts';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CSVImporter({ onComplete }) {
    const { user } = useUser();
    const userId = user?._id;
    const { data: accounts = [] } = useAccounts(userId);

    const bulkAddMutation = useBulkAddTransactions(userId);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [targetAccount, setTargetAccount] = useState("");
    const [progress, setProgress] = useState({ done: 0, total: 0 });

    useEffect(() => {
        if (accounts && accounts.length > 0) {
            setTargetAccount((prev) => prev || accounts[0]._id);
        }
    }, [accounts]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Parse CSV preview
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').slice(0, 4); // Show first 3 rows
                setPreview(lines);
            };
            reader.readAsText(selectedFile);
        }
    };

    const normalizeRow = (values) => {
        const [dateRaw, descriptionRaw, amountRaw, typeRaw, categoryRaw] = values.map(v => (v || "").trim());
        let date = dateRaw;
        if (date && !/^\d{4}-\d{2}-\d{2}/.test(date)) {
            const parsed = new Date(date);
            if (!isNaN(parsed)) date = parsed.toISOString();
        }

        return {
            userId,
            description: descriptionRaw || "",
            amount: parseFloat(amountRaw) || 0,
            bankAccountId: targetAccount || (accounts[0]?._id) || "",
            type: (typeRaw || "expense").toLowerCase().startsWith("inc") ? "income" : "expense",
            category: categoryRaw || "Uncategorized",
            date: date || new Date().toISOString(),
        };
    };

    const handleImport = async () => {
        if (!file) return;
        if (!userId) {
            toast.error("You must be logged in to import transactions.");
            return;
        }
        if (!targetAccount) {
            toast.error("Please select a target account to import transactions into.");
            return;
        }

        setLoading(true);
        setProgress({ done: 0, total: 0 });

        try {
            const text = await file.text();
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length <= 1) {
                toast.info("CSV appears empty or missing data rows.");
                setLoading(false);
                return;
            }

            const rows = lines.slice(1);
            setProgress({ done: 0, total: rows.length });

            const txs = rows.map((line) => {
                const values = line.split(',');
                return normalizeRow(values);
            });

            await new Promise((resolve) => {
                bulkAddMutation.mutate(txs, {
                    onSuccess: (resp) => {
                        const inserted = resp.inserted || resp.insertedCount || (resp.data ? resp.data.length : 0);
                        const attempted = txs.length;
                        const failed = attempted - (inserted || 0);
                        toast.success(`${inserted || 0} transactions imported. ${failed} failed.`);
                        setFile(null);
                        setPreview(null);
                        if (onComplete) onComplete({ inserted: inserted || 0, attempted, failed });
                        resolve();
                    },
                    onError: (err) => {
                        console.error('Bulk import error', err);
                        toast.error('Bulk import failed. See console for details.');
                        resolve();
                    }
                });
            });
        } catch (error) {
            console.error('Import error:', error);
            toast.error('Import failed. Check console for details.');
        } finally {
            setLoading(false);
            setProgress({ done: 0, total: 0 });
        }
    };

    return (
        <div className="space-y-4">
            <ToastContainer />
            {accounts && accounts.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2">Import Into Account</label>
                    <select
                        value={targetAccount}
                        onChange={(e) => setTargetAccount(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white"
                    >
                        {accounts.map((acc) => {
                            const accNum = acc.accountNumber || "";
                            const maskedAcc = accNum.length > 4 ? "*".repeat(accNum.length - 4) + accNum.slice(-4) : accNum;
                            return (
                                <option key={acc._id} value={acc._id}>{`${acc.bankName} • ${maskedAcc}`}</option>
                            );
                        })}
                    </select>
                </div>
            )}

            <div className="bg-blue-900/30 border border-blue-600/30 p-4 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5" />
                <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">CSV Format Required</p>
                    <p>Please use this format: Date, Description, Amount,Type, Category</p>
                    <p className="mt-1 text-xs">Example: 2025-11-11, Grocery, 500,Expense, Food</p>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Select CSV File</label>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm"
                    />
                    <FileDown className="w-5 h-5 text-slate-400" />
                </div>
            </div>

            {preview && (
                <div>
                    <p className="text-sm font-medium mb-2">Preview</p>
                    <div className="bg-slate-800 p-3 rounded-lg text-xs font-mono space-y-1 max-h-40 overflow-y-auto">
                        {preview.map((line, idx) => (
                            <div key={idx} className="text-slate-300">
                                {line}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="space-y-2">
                    <div className="text-sm text-slate-300">Importing {progress.done}/{progress.total}...</div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: progress.total ? `${(progress.done / progress.total) * 100}%` : '0%' }} />
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        setFile(null);
                        setPreview(null);
                        if (onComplete) onComplete({ cancelled: true });
                    }}
                    className="border-slate-600 hover:bg-slate-800"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleImport}
                    disabled={!file || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? 'Importing...' : 'Import Transactions'}
                </Button>
            </div>
        </div>
    );
}
