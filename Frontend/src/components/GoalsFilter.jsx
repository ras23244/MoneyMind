import React from "react";

export default function GoalsFilter({ filters, setFilters }) {
    const statuses = ["active", "paused"];
    const priorities = [1, 2, 3, 4, 5]; // adjust as needed
    const progressRanges = [
        { label: "<50%", min: 0, max: 50 },
        { label: "50-80%", min: 50, max: 80 },
        { label: ">80%", min: 80, max: 100 },
    ];

    return (
        <div className="flex flex-wrap gap-4 mb-4">
            {/* Status Filter */}
            <select
                value={filters.status || ""}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Status</option>
                {statuses.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
            </select>

            {/* Priority Filter */}
            <select
                value={filters.priority || ""}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Priorities</option>
                {priorities.map((p) => (
                    <option key={p} value={p}>P{p}</option>
                ))}
            </select>

            {/* Progress Filter */}
            <select
                value={filters.progress || ""}
                onChange={(e) => setFilters({ ...filters, progress: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            >
                <option value="">All Progress</option>
                {progressRanges.map((r) => (
                    <option key={r.label} value={r.label}>{r.label}</option>
                ))}
            </select>

            {/* Search Box */}
            <input
                type="text"
                placeholder="Search Goals"
                value={filters.search || ""}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="p-2 rounded bg-[#1f1d1f] text-white border border-white/20"
            />
        </div>
    );
}
