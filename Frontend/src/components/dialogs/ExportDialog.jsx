import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ExportDialog({ open, setOpen }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [type, setType] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');

    const handleExport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (category) params.category = category;
            if (tags) params.tags = tags;
            if (type) params.type = type;
            if (minAmount) params.minAmount = minAmount;
            if (maxAmount) params.maxAmount = maxAmount;
            if (search) params.search = search;

            const url = `${import.meta.env.VITE_BASE_URL}transactions/export`;
            const res = await axios.get(url, {
                params,
                responseType: 'blob',
                headers: { Authorization: `Bearer ${token}` },
            });

            const blob = new Blob([res.data], { type: 'text/csv' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = 'transactions.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            setOpen(false);
        } catch (err) {
            console.error('Export error', err);
            alert('Failed to export transactions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Transactions</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-2 mt-2">
                    <label className="text-sm">Start date</label>
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="p-2 rounded bg-white/5" />
                    <label className="text-sm">End date</label>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="p-2 rounded bg-white/5" />
                    <label className="text-sm">Category</label>
                    <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="p-2 rounded bg-white/5" />
                    <label className="text-sm">Tags (comma separated)</label>
                    <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tag1,tag2" className="p-2 rounded bg-white/5" />
                    <label className="text-sm">Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 rounded bg-white/5">
                        <option value="">Any</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <label className="text-sm">Min amount</label>
                    <input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} placeholder="0" type="number" className="p-2 rounded bg-white/5" />
                    <label className="text-sm">Max amount</label>
                    <input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} placeholder="" type="number" className="p-2 rounded bg-white/5" />
                    <label className="text-sm">Search</label>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search description/category" className="p-2 rounded bg-white/5" />
                </div>

                <DialogFooter className="mt-4">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleExport} disabled={loading}>{loading ? 'Exporting...' : 'Export CSV'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
