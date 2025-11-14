import React from 'react';
import dayjs from 'dayjs';

export default function CategoryRangeControls({ catRange, setCatRange, customStart, customEnd, setCustomStart, setCustomEnd }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
                <button onClick={() => setCatRange('1M')} className={`whitespace-nowrap px-3 py-1 text-sm rounded ${catRange === '1M' ? 'bg-emerald-500 text-white' : 'bg-transparent border border-white/10 text-slate-200'}`}>Monthly</button>
                <button onClick={() => setCatRange('3M')} className={`whitespace-nowrap px-3 py-1 text-sm rounded ${catRange === '3M' ? 'bg-emerald-500 text-white' : 'bg-transparent border border-white/10 text-slate-200'}`}>3 months</button>
                <button onClick={() => setCatRange('6M')} className={`whitespace-nowrap px-3 py-1 text-sm rounded ${catRange === '6M' ? 'bg-emerald-500 text-white' : 'bg-transparent border border-white/10 text-slate-200'}`}>6 months</button>
            </div>

        </div>
    );
}
