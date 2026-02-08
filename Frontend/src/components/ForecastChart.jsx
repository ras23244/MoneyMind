import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';
import axiosInstance from '../lib/axiosInstance';

export default function ForecastChart({ months = 3, lookback = 6 }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.get("/transactions/forecast", {
                    params: { months, lookback },
                });

                if (cancelled) return;

                const history = (res.data?.data?.history || []).map((h) => ({
                    month: h.month,
                    net: Math.round(h.net || 0),
                }));

                const forecast = (res.data?.data?.forecast || []).map((f) => ({
                    month: f.month,
                    forecast: Math.round(f.projectedNet || 0),
                }));

                // Combine history + forecast into timeline
                const combined = [];
                history.forEach((h) => combined.push({ month: h.month, net: h.net }));
                forecast.forEach((f) => combined.push({ month: f.month, forecast: f.forecast }));

                // Convert month to short label for UI
                const display = combined.map((row) => {
                    let label = row.month;
                    try {
                        label = new Date(row.month + "-01").toLocaleString(undefined, {
                            month: "short",
                        });
                    } catch (e) { }

                    return { ...row, monthLabel: label };
                });

                setData(display);
            } catch (err) {
                console.error("Forecast fetch error", err);
                setError(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [months, lookback]);


    return (
        <Card className="bg-[#1f1d1f] border border-white/10 p-4">
            <CardHeader>
                <CardTitle className="text-white">Cashflow Forecast</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    {loading ? (
                        <p className="text-white">Loading forecast...</p>
                    ) : error ? (
                        <p className="text-red-400">Error loading forecast</p>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="monthLabel" stroke="rgba(255,255,255,0.6)" />
                                <YAxis stroke="rgba(255,255,255,0.6)" />
                                <Tooltip formatter={(v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v)} />
                                <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="forecast" stroke="#60a5fa" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
