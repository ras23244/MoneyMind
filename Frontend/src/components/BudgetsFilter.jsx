import React from "react";

export default function BudgetsFilter({ filters, setFilters, categories = [], months = [], durations = [], durationTypes = [] }) {
    const statuses = [
        { key: "safe", label: "Safe (<75%)" },
        { key: "near-limit", label: "Near Limit (75–100%)" },
        { key: "exceeded", label: "Exceeded (>100%)" },
    ]

    return (
        <div className="flex flex-wrap gap-4 mb-4">
            {/* Category Filter */}
            <select
                value={filters.category || ""}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Categories</option>
                {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {/* Status Filter */}
            <select
                value={filters.status || ""}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Status</option>
                {statuses.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                ))}
            </select>

            {/* Month Filter */}
            <select
                value={filters.month || ""}
                onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Months</option>
                {months.map((m) => (
                    <option key={m} value={m}>{m}</option>
                ))}
            </select>

            {/* Duration Type Filter */}
            <select
                value={filters.durationType || ""}
                onChange={(e) => setFilters({ ...filters, durationType: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Types</option>
                <option value="month">Monthly</option>
                <option value="day">Daily</option>
            </select>

            {/* Duration Filter */}
            <select
                value={filters.duration || ""}
                onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Durations</option>
                {[1, 3, 6, 12].map((d) => (
                    <option key={d} value={d}>{d} {d === 1 ? "month" : "months"}</option>
                ))}
            </select>

            {/* Search Box */}
            <input
                type="text"
                placeholder="Search Budgets"
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            />
        </div>
    );
}
