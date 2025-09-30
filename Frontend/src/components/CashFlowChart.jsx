import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { date: "Jun 23", balance: 11500 },
    { date: "Jun 30", balance: 11480 },
    { date: "Jul 07", balance: 11450 },
    { date: "Jul 14", balance: 11300 },
    { date: "Jul 21", balance: 11250 },
    { date: "Jul 28", balance: 12600 },
    { date: "Aug 04", balance: 12550 },
    { date: "Aug 11", balance: 12480 },
    { date: "Aug 18", balance: 12390 },
    { date: "Aug 25", balance: 13600 },
];

export default function CashFlowChart() {
    return (
        <div className="bg-[#1e1e1e] p-4 rounded-2xl shadow border border-white/10">
            
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4b7a77" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#4b7a77" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#ccc" />
                    <YAxis stroke="#ccc" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "#2a2a2a",
                            border: "1px solid #4b7a77",
                            color: "#fff",
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#4b7a77"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBalance)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
