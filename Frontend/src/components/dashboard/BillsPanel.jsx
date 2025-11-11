import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBills, useBillSummary, useUpdateBillStatus, useDeleteBill } from '../hooks/useBills';
import AddBillDialog from './AddBillDialog';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    PlusCircle,
    Wallet,
    AlertCircle,
    RefreshCw,
    Edit3,
    Trash2,
    Pencil
} from 'lucide-react';

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


    const deleteBillMutation = useDeleteBill(userId);
    const editBillMutation = useUpdateBillStatus(userId);

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

    const groupedBills = bills.reduce((acc, bill) => {
        const weekStart = dayjs(bill.nextDueDate).startOf('week').format('YYYY-MM-DD');
        if (!acc[weekStart]) acc[weekStart] = [];
        acc[weekStart].push(bill);
        return acc;
    }, {});

    if (isLoading || summaryLoading) {
        return <div className="animate-pulse text-slate-400 text-center py-10">Loading bills...</div>;
    }

    const [editingBill, setEditingBill] = useState(null);

    const handleEditBill = (bill) => {
        setEditingBill(bill);
        setOpenAddDialog(true);
    };

    const handleDeleteBill = (billId) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            deleteBillMutation.mutate(billId, {
                onSuccess: () => {
                    console.log('Bill deleted successfully');
                },
                onError: (error) => {
                    console.error('Error deleting bill:', error);
                }
            });
        }
    };



    return (
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/10 rounded-2xl shadow-lg">
            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-400" />
                        Bills
                    </h3>

                </div>

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

                <div
                    ref={listRef}
                    className="relative space-y-3 overflow-y-auto"
                    style={{
                        maxHeight: '320px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <style>{`div::-webkit-scrollbar { display: none; }`}</style>

                    {Object.entries(groupedBills).map(([weekStart, weekBills]) => (
                        <div key={weekStart}>
                            <div className="sticky top-0 bg-slate-900/60 backdrop-blur-sm py-1 text-sm text-slate-400 border-b border-white/5 mb-2">
                                Week of {dayjs(weekStart).format('MMM D')}
                            </div>

                            <div className="space-y-3">
                                {weekBills.map((bill) => (
                                    <BillItem
                                        key={bill._id}
                                        bill={bill}
                                        updateBillStatus={updateBillStatus}
                                        handleEditBill={handleEditBill}
                                        handleDeleteBill={handleDeleteBill}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

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

                <div className="mt-6">
                    <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 text-white"
                        onClick={() => setOpenAddDialog(true)}
                    >
                        <PlusCircle className="w-4 h-4" />
                        Add Bill
                    </Button>
                </div>

                <AddBillDialog open={openAddDialog} setOpen={setOpenAddDialog} editingBill={editingBill} />
            </CardContent>
        </Card>
    );
}

function BillItem({ bill, updateBillStatus, handleEditBill, handleDeleteBill }) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-between p-4 rounded-xl transition
                ${bill.isOverdue ? 'bg-red-500/10' : 'bg-white/5 hover:bg-white/10'}
                ${bill.autopay?.enabled ? 'border-l-4 border-green-500/70' : 'border-l border-white/10'}
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
                {!hovered ? (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        className="text-right"
                    >
                        <div className="font-semibold text-white">{currency(bill.amount)}</div>
                        <div className="text-xs text-slate-400">{bill.category}</div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                    >
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditBill(bill);
                            }}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBill(bill._id);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}

                {bill.isPending && (
                    <Button
                        size="sm"
                        onClick={() =>
                            updateBillStatus.mutate({ billId: bill._id, status: 'paid' })
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 text-xs rounded-md"
                    >
                        Mark Paid
                    </Button>
                )}
            </div>
        </motion.div>
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
