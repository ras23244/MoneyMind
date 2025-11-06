import { Button } from "@/components/ui/button";

const currency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const percent = (n) => `${Math.round(n)}%`;

export default function BudgetsList({ budgets, expanded, onToggleExpand, onAddBudget }) {
    const displayBudgets = expanded ? budgets : budgets.slice(0, 3);

    return (
        <div className="bg-white/5 rounded-lg p-4 border border-white/6 transition-shadow hover:shadow-lg">
            <div
                role="button"
                tabIndex={0}
                onClick={onToggleExpand}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggleExpand(); } }}
                className="flex items-center justify-between mb-3 group cursor-pointer"
            >
                <h3 className="font-semibold">Budgets</h3>
                <div className="mt-4 flex gap-2 items-center">
                    <Button
                        onClick={(e) => { e.stopPropagation(); onAddBudget(); }}
                        className="text-sm px-3 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 5v14M5 12h14"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Button>
                </div>
            </div>
            <div className="space-y-3">
                {displayBudgets.map((b) => {
                    const pct = Math.min(100, (b.spent / Math.max(1, b.limit)) * 100);
                    return (
                        <div key={b.name} className="transition-colors hover:bg-white/5 rounded p-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-sm font-medium">{b.name}</div>
                                    <div className="text-xs text-slate-400">{currency(b.spent)} of {currency(b.limit)}</div>
                                </div>
                                <div className="text-sm font-semibold">{percent(pct)}</div>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded mt-2 overflow-hidden">
                                <div style={{ width: `${pct}%` }} className={`h-2 ${pct > 90 ? 'bg-red-500' : 'bg-emerald-400'}`} />
                            </div>
                        </div>
                    );
                })}

                {budgets.length > 3 && (
                    <div className="flex justify-center mt-3">
                        <button
                            onClick={() => onToggleExpand()}
                            className="p-1 rounded hover:bg-white/10 transition"
                        >
                            {expanded ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M18 15l-6-6-6 6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M6 9l6 6 6-6"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}