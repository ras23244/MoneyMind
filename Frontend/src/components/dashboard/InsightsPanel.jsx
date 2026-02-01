import React, { useMemo } from 'react';

export default function InsightsPanel({ budgets = [], goals = [], currency = (n) => n }) {
    const topBudgets = useMemo(() => {
        return budgets
            .filter(b => (b.limit || 0) > 0)
            .slice()
            .sort((a, b) => (b.spent || 0) - (a.spent || 0))
            .slice(0, 3);
    }, [budgets]);

    const topGoals = useMemo(() => {
        return goals
            .slice()
            .map(g => ({ ...g, progress: g.target ? (g.current / g.target) : 0 }))
            .sort((a, b) => (b.progress || 0) - (a.progress || 0))
            .slice(0, 3);
    }, [goals]);

    return (
        <div className="bg-slate-800/40 rounded-lg p-3 border border-white/6">
            <div className="grid grid-cols-1 gap-3">                                                                                                           
                <div>
                    <div className="text-sm text-slate-300 mb-2">Top Budgets</div>
                    {topBudgets.length ? (
                        <ul className="space-y-2">
                            {topBudgets.map((b, i) => {
                                const pct = b.limit ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
                                return (
                                    <li key={i} className="bg-white/5 p-2 rounded flex items-center justify-between">
                                        <div className="text-sm">{b.name}</div>
                                        <div className="w-36 ml-4">
                                            <div className="h-2 bg-white/10 rounded overflow-hidden">
                                                <div className={`h-2 bg-emerald-400 rounded`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">{pct}% used</div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-xs text-slate-400">No budget data available.</div>
                    )}
                </div>

                <div>
                    <div className="text-sm text-slate-300 mb-2">Top Goals</div>
                    {topGoals.length ? (
                        <ul className="space-y-2">
                            {topGoals.map((g, i) => {
                                const pct = Math.min(100, Math.round((g.progress || 0) * 100));
                                return (
                                    <li key={i} className="bg-white/5 p-2 rounded flex items-center justify-between">
                                        <div className="text-sm">{g.name}</div>
                                        <div className="w-36 ml-4">
                                            <div className="h-2 bg-white/10 rounded overflow-hidden">
                                                <div className={`h-2 bg-amber-400 rounded`} style={{ width: `${pct}%` }} />
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">{pct}%</div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="text-xs text-slate-400">No goal data available.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
