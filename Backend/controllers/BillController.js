const Bill = require('../models/BillModel');
const dayjs = require('dayjs');

exports.createBill = async (req, res) => {
    try {
        const { title, amount, dueDate, category, frequency, reminderDays, notes, recurring, autopay } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!title || !amount || !dueDate || !category) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, amount, dueDate, and category are required'
            });
        }

        // Validate amount is a positive number
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number'
            });
        }

        // Sanitize autopay.accountId to avoid passing empty string to ObjectId field
        const autopayData = { enabled: false };
        if (autopay) {
            autopayData.enabled = !!autopay.enabled;
            // only include accountId when it's a non-empty string
            if (autopay.accountId && String(autopay.accountId).trim() !== '') {
                autopayData.accountId = autopay.accountId;
            }
        }

        const billData = {
            userId,
            title,
            amount: Number(amount),
            dueDate: new Date(dueDate),
            category,
            frequency: frequency || 'monthly',
            reminderDays: reminderDays || 3,
            notes,
            recurring: recurring ?? true,
            autopay: autopayData
        };

        const bill = await Bill.create(billData);

        res.status(201).json({
            success: true,
            data: bill
        });
    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            error: error.name === 'ValidationError'
                ? Object.values(error.errors).map(err => err.message).join(', ')
                : 'An error occurred while creating the bill'
        });
    }
};

exports.getUpcomingBills = async (req, res) => {
    try {
        const userId = req.user.id;
        const { days = 30, status } = req.query;

        const today = dayjs().startOf('day');
        const endDate = dayjs().add(days, 'days').endOf('day');

        const query = {
            userId,
            nextDueDate: {
                $gte: today.toDate(),
                $lte: endDate.toDate()
            }
        };

        if (status) {
            query.status = status;
        }

        const bills = await Bill.find(query)
            .sort({ nextDueDate: 1 })
            .populate('autopay.accountId', 'name balance');

        // Enhance bills with additional info
        const enhancedBills = bills.map(bill => {
            const daysUntilDue = dayjs(bill.nextDueDate).diff(today, 'day');
            const isOverdue = daysUntilDue < 0;

            return {
                ...bill.toObject(),
                daysUntilDue,
                isOverdue,
                statusColor: isOverdue ? 'red' : daysUntilDue <= 3 ? 'yellow' : 'green',
                formattedDueDate: dayjs(bill.nextDueDate).format('MMM D, YYYY'),
                isPending: bill.status === 'pending'
            };
        });

        res.status(200).json({
            success: true,
            data: enhancedBills,
            summary: {
                total: enhancedBills.reduce((sum, bill) => sum + bill.amount, 0),
                count: enhancedBills.length,
                overdue: enhancedBills.filter(b => b.isOverdue).length,
                autopayEnabled: enhancedBills.filter(b => b.autopay?.enabled).length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateBillStatus = async (req, res) => {
    try {
        // route uses :id in params; accept either 'id' or 'billId' for robustness
        const billId = req.params.id || req.params.billId;
        const { status, transactionId } = req.body;
        const userId = req.user.id;

        const bill = await Bill.findOne({ _id: billId, userId });
        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        // If marking as paid
        if (status === 'paid') {
            // Update payment history
            bill.paymentHistory.push({
                date: new Date(),
                amount: bill.amount,
                status: 'paid',
                transactionId
            });
            bill.lastPaidDate = new Date();

            // If recurring, set next due date
            if (bill.recurring) {
                const nextDue = dayjs(bill.dueDate);
                switch (bill.frequency) {
                    case 'daily':
                        bill.nextDueDate = nextDue.add(1, 'day');
                        break;
                    case 'weekly':
                        bill.nextDueDate = nextDue.add(1, 'week');
                        break;
                    case 'monthly':
                        bill.nextDueDate = nextDue.add(1, 'month');
                        break;
                    case 'yearly':
                        bill.nextDueDate = nextDue.add(1, 'year');
                        break;
                }
            }
        }

        bill.status = status;
        await bill.save();

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getBillSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = dayjs().startOf('day');

        // Get bills due in next 30 days
        const upcomingBills = await Bill.find({
            userId,
            nextDueDate: {
                $gte: today.toDate(),
                $lte: today.add(30, 'days').toDate()
            }
        }).sort({ nextDueDate: 1 });

        // Get overdue bills
        const overdueBills = await Bill.find({
            userId,
            nextDueDate: { $lt: today.toDate() },
            status: 'pending'
        });

        // Calculate summaries
        const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
        const totalOverdue = overdueBills.reduce((sum, bill) => sum + bill.amount, 0);

        // Group by week
        const weeklyBreakdown = upcomingBills.reduce((acc, bill) => {
            const weekStart = dayjs(bill.nextDueDate).startOf('week').format('YYYY-MM-DD');
            if (!acc[weekStart]) {
                acc[weekStart] = { total: 0, count: 0, bills: [] };
            }
            acc[weekStart].total += bill.amount;
            acc[weekStart].count++;
            acc[weekStart].bills.push({
                title: bill.title,
                amount: bill.amount,
                dueDate: bill.nextDueDate
            });
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: {
                totalUpcoming,
                totalOverdue,
                overdueCount: overdueBills.length,
                upcomingCount: upcomingBills.length,
                weeklyBreakdown,
                overdueBills: overdueBills.map(b => ({
                    ...b.toObject(),
                    daysOverdue: today.diff(dayjs(b.nextDueDate), 'day')
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.toggleAutopay = async (req, res) => {
    try {
        // route uses :id in params; accept either 'id' or 'billId'
        const billId = req.params.id || req.params.billId;
        const { enabled, accountId } = req.body;
        const userId = req.user.id;

        // Build update object carefully to avoid casting empty string to ObjectId
        const update = { 'autopay.enabled': !!enabled };
        if (accountId && String(accountId).trim() !== '') {
            update['autopay.accountId'] = accountId;
        } else {
            // explicitly unset the accountId when not provided/empty
            update['$unset'] = { 'autopay.accountId': '' };
        }

        const bill = await Bill.findOneAndUpdate(
            { _id: billId, userId },
            update,
            { new: true }
        );

        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        console.error('Error toggling autopay:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteBill = async (req, res) => {
    try {
        const billId = req.params.id;
        const userId = req.user.id;

        const bill = await Bill.findOneAndDelete({ _id: billId, userId });

        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        console.error('Error deleting bill:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
