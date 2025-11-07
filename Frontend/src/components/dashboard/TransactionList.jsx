const currency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function TransactionList({ transactions, expanded, onToggleExpand, onNavigate }) {
    const displayTransactions = expanded ? transactions : transactions.slice(0, 5);

    return (
        <div className="lg:col-span-2 bg-white/5 rounded-lg p-4 border border-white/6 transition-shadow hover:shadow-lg">
            <div
                role="button"
                tabIndex={0}
                onClick={onToggleExpand}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleExpand(); } }}
                className="flex items-center justify-between mb-5 group cursor-pointer"
            >
                <h3 className="font-semibold">Recent Transactions</h3>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-slate-400">{expanded ? `Showing ${transactions.length}` : 'Showing last 5'}</div>
                   
                </div>
            </div>
            <div className="space-y-3">
                {displayTransactions.map((t) => (
                    <div key={t._id || t.id} className="flex items-center justify-between p-3 bg-white/3 rounded transition-colors hover:bg-white/5">
                        <div className="flex gap-3 items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${Number(t.amount) >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                <div className="text-sm">{(t.category || 'X')[0]}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium">{t.description || t.desc || t.note || t.title}</div>
                                <div className="text-xs text-slate-400">{(t.date || "").slice(0, 10)} • {t.account || t.bank || ''}</div>
                            </div>
                        </div>
                        <div className={`text-sm font-semibold ${Number(t.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {Number(t.amount) >= 0 ? '+' : ''}{currency(Number(t.amount) || 0)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}