import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { useUser } from '../../context/UserContext';

export default function AlertsPanel({ transactions = [], billsUi = [], budgetsUi = [], goalsUi = [], financialSummary = {}, currency = (n) => n }) {
    const { notifications = [] } = useUser();
    const alerts = useMemo(() => {
        const list = [];

        // Add high-priority socket notifications (unread only)
        (notifications || []).forEach((notif) => {
            if (notif.priority === 'high' && !notif.read) {
                const iconMap = {
                    budget_threshold: '⚠️',
                    bill_due: '💳',
                    bill_overdue: '🚨',
                    goal_progress: '🎯',
                    transaction_anomaly: '⚠️',
                    account_linked: '🔗',
                };
                list.push({
                    id: `notif-${notif.id}`,
                    icon: iconMap[notif.type] || '📢',
                    title: notif.title,
                    text: notif.body,
                    priority: 'high',
                    color: 'bg-red-200 text-red-800',
                    ts: new Date(notif.createdAt).getTime(),
                });
            }
        });

        (billsUi || []).forEach((b) => {
            if (!b.due) return;
            const days = dayjs(b.due).diff(dayjs(), 'day');
            if (days <= 7 && days >= 0) {
                list.push({
                    id: `bill-${b.id}`,
                    icon: '💳',
                    title: `${b.title}`,
                    text: `Due in ${days} day${days !== 1 ? 's' : ''} • ${currency(b.amount)}`,
                    priority: 'high',
                    color: 'bg-yellow-200 text-yellow-800',
                    ts: Date.now() - (days * 24 * 60 * 60 * 1000),
                });
            }
        });

        (budgetsUi || []).forEach((b, idx) => {
            if (!b.limit || b.limit <= 0) return;
            const pct = (b.spent / b.limit) * 100;
            if (pct >= 100) {
                list.push({
                    id: `budget-exceeded-${idx}`,
                    icon: '💰',
                    title: `${b.name} budget exceeded`,
                    text: `${Math.round(pct)}% used (${currency(b.spent)} of ${currency(b.limit)})`,
                    priority: 'high',
                    color: 'bg-red-200 text-red-800',
                    ts: Date.now() + Math.round(pct) * 1000,
                    pct
                });
            } else if (pct >= 75) {
                list.push({
                    id: `budget-near-${idx}`,
                    icon: '💰',
                    title: `${b.name} near threshold`,
                    text: `${Math.round(pct)}% used`,
                    priority: 'medium',
                    color: 'bg-orange-100 text-orange-800',
                    ts: Date.now() + Math.round(pct) * 1000,
                    pct
                });
            }
        });

        (goalsUi || []).forEach((g, idx) => {
            if (!g.target || g.target <= 0) return;
            const pct = (g.current / g.target) * 100;
            let daysLeft = null;
            try {
                const original = goalsUi[idx];
                if (original && original.endDate) {
                    daysLeft = dayjs(original.endDate).diff(dayjs(), 'day');
                }
            } catch (e) {
                daysLeft = null;
            }

            if (pct >= 75 || (daysLeft !== null && daysLeft <= 7 && daysLeft >= 0)) {
                const title = pct >= 75 ? `${g.name} reached ${Math.round(pct)}%` : `${g.name} ending soon`;
                const text = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left • ${currency(g.current)} of ${currency(g.target)}` : `${currency(g.current)} of ${currency(g.target)}`;
                list.push({
                    id: `goal-${idx}`,
                    icon: '🎯',
                    title,
                    text,
                    priority: 'positive',
                    color: 'bg-green-100 text-green-800',
                    ts: Date.now() + Math.round(pct) * 1000 + (daysLeft !== null ? Math.max(0, 7 - daysLeft) * 1000 : 0),
                    pct,
                });
            }
        });

        const sumByMonth = (monthOffset = 0) => {
            const map = {};
            const target = dayjs().subtract(monthOffset, 'month').format('YYYY-MM');
            (transactions || []).forEach((t) => {
                if (!t.date || t.date.slice(0, 7) !== target) return;
                const key = t.category || 'Other';
                const amt = Number(t.amount || 0);
                map[key] = (map[key] || 0) + Math.abs(amt);
            });
            return map;
        };

        const current = sumByMonth(0);
        const prev = sumByMonth(1);
        Object.keys(current).forEach((cat) => {
            const cur = current[cat] || 0;
            const pv = prev[cat] || 0;
            if (pv > 0 && cur / pv >= 2) {
                list.push({
                    id: `anom-${cat}`,
                    icon: '⚠️',
                    title: `Spending anomaly: ${cat}`,
                    text: `Spent ${Math.round(cur / Math.max(1, pv))}× vs last month (${currency(cur)})`,
                    priority: 'high',
                    color: 'bg-orange-100 text-orange-800',
                    ts: Date.now() + Math.round(cur / Math.max(1, pv)) * 1000,
                });
            }
        });

        (financialSummary.reminders || []).forEach((r, i) => {
            list.push({
                id: `rem-${i}`,
                icon: '🕒',
                title: r.title || 'Reminder',
                text: r.note || '',
                priority: 'low',
                color: 'bg-slate-100 text-slate-800',
                ts: r.date ? Number(new Date(r.date)) : Date.now(),
            });
        });

        const priorityOrder = { high: 0, medium: 1, positive: 2, low: 3 };
        list.sort((a, b) => (b.ts || 0) - (a.ts || 0) || ((priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4)));
        return list;
    }, [transactions, billsUi, budgetsUi, goalsUi, financialSummary, currency, notifications]);

    if (!alerts.length) return <div className="text-slate-400">No alerts right now — your finances look stable.</div>;

    return (
        <div className="space-y-3 custom-scroll ">
            {alerts.map((al) => (
                <div key={al.id} className="flex items-start gap-3 p-3 rounded border border-white/6 bg-white/2">
                    <div className="text-2xl leading-none">{al.icon}</div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">{al.title}</div>
                            <div className={`text-xs px-2 py-0.5 rounded ${al.color}`}>{al.priority.toUpperCase()}</div>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">{al.text}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
