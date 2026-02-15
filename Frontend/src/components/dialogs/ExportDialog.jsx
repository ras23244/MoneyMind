import React, { useState, useMemo } from 'react';
import axiosInstance from '../../lib/axiosInstance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Subcomponents for clarity
function PresetButtons({ current, onApply }) {
    const buttons = [
        { id: '7d', label: 'Last 7 days' },
        { id: '30d', label: 'Last 30 days' },
        { id: 'month', label: 'This month' },
        { id: '', label: 'Clear' },
    ];
    return (
        <div className="flex items-center gap-2">
            {buttons.map(b => (
                <button key={b.id} type="button" onClick={() => onApply(b.id)} className={`px-3 py-1 rounded ${current === b.id ? 'bg-emerald-600 text-white' : 'bg-white/5'}`}>
                    {b.label}
                </button>
            ))}
        </div>
    );
}

function DateRange({ startDate, endDate, setStartDate, setEndDate }) {
    return (
        <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="text-xs text-slate-300">Start</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 rounded bg-white/5" />
            </div>
            <div>
                <label className="text-xs text-slate-300">End</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 rounded bg-white/5" />
            </div>
        </div>
    );
}

function TagInput({ tags, tagInput, setTagInput, addTag, removeTag }) {
    return (
        <div>
            <label className="text-xs text-slate-300">Tags</label>
            <div className="flex gap-2 items-center flex-wrap">
                {tags.map(t => (
                    <span key={t} className="px-2 py-1 bg-white/10 rounded flex items-center gap-2">
                        <span className="text-sm">{t}</span>
                        <button onClick={() => removeTag(t)} className="text-xs text-red-400">×</button>
                    </span>
                ))}
                <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="Add tag and press Enter"
                    className="p-2 rounded bg-white/5 flex-1 min-w-[120px]"
                />
            </div>
        </div>
    );
}

function AdvancedFilters({ advancedOpen, setAdvancedOpen, minAmount, maxAmount, setMinAmount, setMaxAmount }) {
    return (
        <>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-slate-300">Type</label>
                </div>
                <div className="flex items-end">
                    <button className="text-sm text-slate-400 underline" onClick={() => setAdvancedOpen(a => !a)}>{advancedOpen ? 'Advanced' : 'Advanced'}</button>
                </div>
            </div>
            {advancedOpen && (
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-slate-300">Min amount</label>
                        <input value={minAmount} onChange={(e) => setMinAmount(e.target.value)} type="number" className="w-full p-2 rounded bg-white/5" />
                    </div>
                    <div>
                        <label className="text-xs text-slate-300">Max amount</label>
                        <input value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} type="number" className="w-full p-2 rounded bg-white/5" />
                    </div>
                </div>
            )}
        </>
    );
}

function PreviewPanel({ params }) {
    return (
        <div className="pt-2">
            <div className="text-xs text-slate-500">Preview parameters:</div>
            <pre className="mt-2 p-2 bg-white/5 rounded text-xs overflow-auto">{JSON.stringify(params, null, 2)}</pre>
        </div>
    );
}

// Main component
export default function ExportDialog({ open, setOpen }) {
    const [preset, setPreset] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [category, setCategory] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState([]);
    const [type, setType] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [search, setSearch] = useState('');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const applyPreset = (p) => {
        const now = new Date();
        if (p === '7d') {
            const s = new Date(); s.setDate(now.getDate() - 6);
            setStartDate(s.toISOString().slice(0, 10));
            setEndDate(now.toISOString().slice(0, 10));
        } else if (p === '30d') {
            const s = new Date(); s.setDate(now.getDate() - 29);
            setStartDate(s.toISOString().slice(0, 10));
            setEndDate(now.toISOString().slice(0, 10));
        } else if (p === 'month') {
            const s = new Date(now.getFullYear(), now.getMonth(), 1);
            const e = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setStartDate(s.toISOString().slice(0, 10));
            setEndDate(e.toISOString().slice(0, 10));
        } else {
            setStartDate(''); setEndDate('');
        }
        setPreset(p);
    };

    const addTag = (t) => {
        const clean = t.trim();
        if (!clean) return;
        if (!tags.includes(clean)) setTags(s => [...s, clean]);
        setTagInput('');
    };

    const removeTag = (t) => setTags(s => s.filter(x => x !== t));

    const paramsFromState = useMemo(() => {
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        if (category) params.category = category;
        if (tags.length) params.tags = tags.join(',');
        if (type) params.type = type;
        if (minAmount) params.minAmount = minAmount;
        if (maxAmount) params.maxAmount = maxAmount;
        if (search) params.search = search;
        return params;
    }, [startDate, endDate, category, tags, type, minAmount, maxAmount, search]);

    const handleExport = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/transactions/export', {
                params: paramsFromState,
                responseType: 'blob',
            });

            const blob = new Blob([res.data], { type: 'text/csv' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(downloadUrl);
            setOpen(false);
        } catch (err) {
            alert('Failed to export transactions');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10">
                <DialogHeader>
                    <DialogTitle>Export Transactions</DialogTitle>
                </DialogHeader>

                <div className='m-1'>
                    <PresetButtons current={preset} onApply={applyPreset} />
                    <DateRange startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="space-y-3">

                        <div>
                            <label className="text-xs text-slate-300">Category</label>
                            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Groceries" className="w-full p-2 rounded bg-white/5" />
                        </div>

                        <TagInput tags={tags} tagInput={tagInput} setTagInput={setTagInput} addTag={addTag} removeTag={removeTag} />
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-300">Search</label>
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="description or category" className="w-full p-2 rounded bg-white/5" />
                        </div>

                        <div>
                            <label className="text-xs text-slate-300">Type</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 rounded bg-white/5">
                                <option value="">Any</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>

                        <AdvancedFilters advancedOpen={advancedOpen} setAdvancedOpen={setAdvancedOpen} minAmount={minAmount} maxAmount={maxAmount} setMinAmount={setMinAmount} setMaxAmount={setMaxAmount} />

                        <PreviewPanel params={paramsFromState} />
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleExport} disabled={loading}>{loading ? 'Exporting...' : 'Download CSV'}</Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
