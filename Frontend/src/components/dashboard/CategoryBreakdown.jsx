import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#4ade80', '#60a5fa', '#f97316', '#f43f5e', '#a78bfa'];

const currency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const percent = (n) => `${Math.round(n)}%`;

export default function CategoryBreakdown({ categoryBreakdown, monthlyExpenses }) {
    return (
        <div className="bg-white/5 rounded-lg p-4 border border-white/6">
            <h3 className="font-semibold mb-2">Spending by Category</h3>
            <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={categoryBreakdown} dataKey="value" nameKey="name" outerRadius={70} innerRadius={40}>
                            {categoryBreakdown.map((entry, index) => (
                                <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(v) => currency(v)} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
                {categoryBreakdown.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span style={{ background: COLORS[i % COLORS.length] }} className="w-3 h-3 rounded-sm inline-block" />
                            <div>
                                <div className="text-sm font-medium">{c.name}</div>
                                <div className="text-xs text-slate-400">{percent((c.value / Math.max(1, monthlyExpenses)) * 100)}</div>
                            </div>
                        </div>
                        <div className="text-sm font-semibold">{currency(c.value)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}