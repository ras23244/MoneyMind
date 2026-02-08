import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBills, useBillSummary, useUpdateBillStatus, useDeleteBill } from '../hooks/useBills';
import AddBillDialog from './AddBillDialog';
import dayjs from 'dayjs';

const currency = n =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

export default function BillsPanel() {
    const [open, setOpen] = useState(false);

    const { data: bills = [], isLoading } = useBills({ days: 30 });
    const { data: summary = {} } = useBillSummary();

    const markPaid = useUpdateBillStatus();
    const deleteBill = useDeleteBill();

    if (isLoading) return <p className="text-center">Loading…</p>;

    return (
        <Card className="bg-[#1f1d1f] border border-white/10 shadow-lg rounded-2xlrelative">
            <CardContent className="space-y-4">

                <div className="grid grid-cols-2 gap-3">
                    <Summary label="Upcoming" value={currency(summary.totalUpcoming || 0)} />
                    <Summary label="Overdue" value={currency(summary.totalOverdue || 0)} />
                </div>

                {bills.map(bill => {
                    const daysLeft = dayjs(bill.nextDueDate).diff(dayjs(), 'day');
                    const overdue = daysLeft < 0;

                    return (
                        <div key={bill._id} className="p-3 rounded-2xl bg-white/5 flex justify-between">
                            <div>
                                <div className="font-semibold">{bill.title}</div>
                                <div className="text-sm text-slate-400">
                                    Due {dayjs(bill.nextDueDate).format('MMM D')}
                                    {overdue && ' (Overdue)'}
                                </div>
                            </div>

                            <div className="flex gap-2 items-center">
                                <div>{currency(bill.amount)}</div>

                                {bill.status === 'pending' && (
                                    <Button
                                        size="sm"
                                        onClick={() => markPaid.mutate({ billId: bill._id, status: 'paid' })}
                                    >
                                        Pay
                                    </Button>
                                )}

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteBill.mutate(bill._id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    );
                })}

                <Button className="w-full bg-blue-700" onClick={() => setOpen(true)}>
                    Add Bill
                </Button>

                <AddBillDialog open={open} setOpen={setOpen} />
            </CardContent>
        </Card>
    );
}

const Summary = ({ label, value }) => (
    <div className="bg-white/5 p-3 rounded-1xl">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
    </div>
);
