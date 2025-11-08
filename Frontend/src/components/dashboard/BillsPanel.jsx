import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBills, useBillSummary, useUpdateBillStatus } from '../hooks/useBills';
import AddBillDialog from './AddBillDialog';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, PlusCircle, Wallet, AlertCircle, RefreshCw } from 'lucide-react';

const currency = (n) =>
    new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(n);

export default function BillsPanel({ userId }) {
    const [viewMode, setViewMode] = useState('upcoming');
    const [expanded, setExpanded] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const { data: bills = [], isLoading } = useBills(userId, { days: 30 });
    const { data: summary = {}, isLoading: summaryLoading } = useBillSummary(userId);
    const updateBillStatus = useUpdateBillStatus();

    const listRef = useRef(null);
    const [showScrollUp, setShowScrollUp] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;

        const handleScroll = () => {
            setShowScrollUp(el.scrollTop > 0);
            setShowScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 5);
        };

        handleScroll();
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [bills]);

    const scrollByAmount = (offset) => {
        if (listRef.current) {
            listRef.current.scrollBy({ top: offset, behavior: 'smooth' });
        }
    };

    // Group bills by week
    const groupedBills = bills.reduce((acc, bill) => {
        const weekStart = dayjs(bill.nextDueDate).startOf('week').format('YYYY-MM-DD');
        if (!acc[weekStart]) acc[weekStart] = [];
        acc[weekStart].push(bill);
        return acc;
    }, {});

    if (isLoading || summaryLoading) {
        return <div className="animate-pulse text-slate-400 text-center py-10">Loading bills...</div>;
    }

    return (
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/10 rounded-2xl shadow-lg">
            <CardContent className="p-5 relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-400" />
                        Bills Overview
                    </h3>

                    <div className="flex items-center gap-2">
                        <div className="bg-slate-800/60 rounded-lg px-1.5 py-1 flex gap-1">
                            {['upcoming', 'overdue', 'all'].map((mode) => (
                                <Button
                                    key={mode}
                                    variant={viewMode === mode ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode(mode)}
                                    className={`capitalize text-xs px-3 py-1 rounded-md transition ${viewMode === mode
                                            ? 'bg-blue-500 text-white'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {mode}
                                </Button>
                            ))}
                        </div>

                        <Button
                            onClick={() => setExpanded(!expanded)}
                            variant="ghost"
                            size="sm"
                            className="text-slate-300 hover:bg-white/10 flex items-center gap-1"
                        >
                            {expanded ? (
                                <>
                                    Collapse <ChevronUp className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Show All <ChevronDown className="w-4 h-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <SummaryCard
                        icon={<Wallet className="w-4 h-4 text-blue-400" />}
                        label="Total Due"
                        value={currency(summary.totalUpcoming)}
                    />
                    <SummaryCard
                        icon={<AlertCircle className="w-4 h-4 text-red-400" />}
                        label="Overdue"
                        value={currency(summary.totalOverdue)}
                        highlight="text-red-400"
                    />
                    <SummaryCard
                        icon={<RefreshCw className="w-4 h-4 text-green-400" />}
                        label="Autopay Active"
                        value={`${summary.autopayEnabled || 0}`}
                    />
                </div>

                {/* Bills List (No scrollbar visible) */}
                <div
                    ref={listRef}
                    className="relative space-y-3 overflow-y-auto"
                    style={{
                        maxHeight: '320px',
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE, Edge
                    }}
                >
                    {/* Hide scrollbar for Chrome/Safari */}
                    <style>
                        {`
              div::-webkit-scrollbar {
                display: none;
              }
            `}
                    </style>

                    {Object.entries(groupedBills).map(([weekStart, weekBills]) => (
                        <div key={weekStart}>
                            <div className="sticky top-0 bg-slate-900/60 backdrop-blur-sm py-1 text-sm text-slate-400 border-b border-white/5 mb-2">
                                Week of {dayjs(weekStart).format('MMM D')}
                            </div>
                            <div className="space-y-3">
                                {weekBills.map((bill) => (
                                    <motion.div
                                        key={bill._id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className={`
                      flex items-center justify-between p-4 rounded-xl transition
                      ${bill.isOverdue ? 'bg-red-500/10' : 'bg-white/5 hover:bg-white/10'}
                      ${bill.autopay?.enabled
                                                ? 'border-l-4 border-green-500/70'
                                                : 'border-l border-white/10'
                                            }
                    `}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white">{bill.title}</span>
                                                {bill.autopay?.enabled && (
                                                    <Badge className="bg-green-500/20 text-green-300 text-[10px] px-2 py-0.5">
                                                        Autopay
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-slate-400">
                                                Due {bill.formattedDueDate}
                                                {bill.daysUntilDue === 0 && ' (Today)'}
                                                {bill.daysUntilDue === 1 && ' (Tomorrow)'}
                                                {bill.daysUntilDue > 1 && ` (in ${bill.daysUntilDue} days)`}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="font-semibold text-white">{currency(bill.amount)}</div>
                                                <div className="text-xs text-slate-400">{bill.category}</div>
                                            </div>

                                            {bill.isPending && (
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        updateBillStatus.mutate({
                                                            billId: bill._id,
                                                            status: 'paid',
                                                        })
                                                    }
                                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs rounded-md"
                                                >
                                                    Mark Paid
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Floating Scroll Circles */}
                <motion.button
                    onClick={() => scrollByAmount(-200)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showScrollUp ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-4 top-[40%] z-10 bg-slate-700/80 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                >
                    <ChevronUp className="w-4 h-4" />
                </motion.button>

                <motion.button
                    onClick={() => scrollByAmount(200)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: showScrollDown ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute right-4 bottom-12 z-10 bg-slate-700/80 hover:bg-slate-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.button>

                {/* Add Bill Button */}
                <div className="mt-6">
                    <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 text-white"
                        onClick={() => setOpenAddDialog(true)}
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add New Bill
                    </Button>
                </div>

                <AddBillDialog open={openAddDialog} setOpen={setOpenAddDialog} />
            </CardContent>
        </Card>
    );
}

function SummaryCard({ icon, label, value, highlight }) {
    return (
        <div className="bg-white/5 p-4 rounded-xl flex items-center gap-3 shadow-inner">
            <div className="p-2 bg-white/10 rounded-lg">{icon}</div>
            <div>
                <div className="text-xs text-slate-400">{label}</div>
                <div className={`text-lg font-semibold ${highlight || 'text-white'}`}>{value}</div>
            </div>
        </div>
    );
}
