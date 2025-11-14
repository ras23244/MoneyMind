import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CategoryRangeControls from './CategoryRangeControls';
import CategoryBreakdown from './CategoryBreakdown';
import dayjs from 'dayjs';

export default function CategoryModal({ open, setOpen, catRange, setCatRange, customStart, customEnd, setCustomStart, setCustomEnd, modalAgg, modalAggLoading, fallbackOverall = [], monthlyExpenses }) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-[#242124] border border-white/10 text-white max-w-4xl w-full">
                <DialogHeader>
                    <DialogTitle>Spending by Category — Details</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                    <CategoryRangeControls
                        catRange={catRange}
                        setCatRange={setCatRange}
                        customStart={customStart}
                        customEnd={customEnd}
                        setCustomStart={setCustomStart}
                        setCustomEnd={setCustomEnd}
                    />

                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                            {modalAggLoading ? (
                                <div className="text-sm text-slate-400">Loading detailed breakdown...</div>
                            ) : (modalAgg?.overall && modalAgg.overall.length) ? (
                                <CategoryBreakdown categoryBreakdown={modalAgg.overall} monthlyExpenses={modalAgg.overall.reduce((s, c) => s + c.value, 0) || monthlyExpenses} />
                            ) : (Array.isArray(fallbackOverall) && fallbackOverall.length) ? (
                                <CategoryBreakdown categoryBreakdown={fallbackOverall} monthlyExpenses={fallbackOverall.reduce((s, c) => s + c.value, 0) || monthlyExpenses} />
                            ) : (
                                <div className="text-sm text-slate-400">No data available for the selected range.</div>
                            )}
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/6 h-full overflow-auto max-h-[420px]">
                            <h4 className="font-semibold mb-2">Month-wise Top Category</h4>
                            <div className="space-y-2 text-sm">
                                {modalAgg?.monthwise?.length ? modalAgg.monthwise.map((m) => (
                                    <div key={m.month} className="flex justify-between items-center">
                                        <div className="text-slate-300">{dayjs(m.month + '-01').format('MMM YYYY')}</div>
                                        <div className="text-right">
                                            <div className="font-medium">{m.top?.name}</div>
                                            <div className="text-xs text-slate-400">{m.top ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(m.top.value) : '—'}</div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-slate-400">No monthly data in this range.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
