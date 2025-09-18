import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

export default function TransactionTrendsChart({ data }) {
    return (
        <Card className="lg:col-span-2 bg-card-dark border border-white/10">
            <CardHeader>
                <CardTitle className="text-white">Transaction Trends</CardTitle>
                <p className="text-white/60 text-sm">Daily income vs expenses over time</p>
            </CardHeader>
            <CardContent>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="date"
                                stroke="rgba(255,255,255,0.4)"
                                fontSize={12}
                                tickFormatter={(value) => new Date(value).getDate().toString()}
                            />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(0,0,0,0.8)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "8px",
                                    color: "white",
                                }}
                                formatter={(value, name) => [
                                    new Intl.NumberFormat("en-IN", {
                                        style: "currency",
                                        currency: "INR",
                                        minimumFractionDigits: 0,
                                    }).format(Math.abs(Number(value))),
                                    name === "income" ? "Income" : name === "expenses" ? "Expenses" : "Net",
                                ]}
                                labelFormatter={(label) =>
                                    new Intl.DateTimeFormat("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                    }).format(new Date(label))
                                }
                            />
                            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} />
                            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                            <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
