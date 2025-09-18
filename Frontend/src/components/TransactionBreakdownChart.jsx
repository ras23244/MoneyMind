// TransactionBreakdownChart.jsx
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = [
    "#3B82F6", "#22C55E", "#EAB308", "#F97316",
    "#A855F7", "#06B6D4", "#EC4899", "#F43F5E",
];

export default function TransactionBreakdownChart({
    mainChartData = [],
    drilldownChartData = [],
    selectedTag,
    setSelectedTag,
}) {
    if (!mainChartData || mainChartData.length === 0) {
        return <p className="text-white/60 text-center mt-4">No transaction breakdown data</p>;
    }

    return (
        <div className="lg:col-span-2 bg-card-dark border border-white/10 mt-6 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white text-lg font-semibold">Transaction Breakdown by Tags</h3>
                {selectedTag && (
                    <Button variant="ghost" onClick={() => setSelectedTag(null)}>
                        Back to All Tags
                    </Button>
                )}
            </div>

            <div className="flex justify-center gap-4">
                <ResponsiveContainer width={selectedTag ? "50%" : "100%"} height={350}>
                    <PieChart>
                        <Pie
                            data={mainChartData || []}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            innerRadius={60}
                            labelLine
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            onClick={(data) => setSelectedTag(data?.name)}
                        >
                            {(mainChartData || []).map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="#1f2937"
                                    strokeWidth={2}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "rgba(17, 24, 39, 0.95)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: "8px",
                                color: "#fff",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {selectedTag && drilldownChartData && drilldownChartData.length > 0 && (
                    <ResponsiveContainer width="50%" height={350}>
                        <PieChart>
                            <Pie
                                data={drilldownChartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                innerRadius={60}
                                labelLine
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {drilldownChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#1f2937"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                                    border: "1px solid rgba(255,255,255,0.15)",
                                    borderRadius: "8px",
                                    color: "#fff",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
