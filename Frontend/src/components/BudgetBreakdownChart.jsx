import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa", "#34d399"];

export default function BudgetBreakdownChart({ budgets }) {
    if (!budgets || budgets.length === 0) {
        return <p className="text-white/60 text-sm">No budgets added yet.</p>;
    }

    const data = budgets.map((b, i) => ({
        name: b.category,
        value: b.amount,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(val) => `₹${val.toLocaleString("en-IN")}`}
                    contentStyle={{ backgroundColor: "white", border: "none" }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}