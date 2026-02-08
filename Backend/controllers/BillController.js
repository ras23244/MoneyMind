const Bill = require('../models/BillModel');
const dayjs = require('dayjs');
const notify = require('../utils/notify');

exports.createBill = async (req, res) => {
    try {
        const {
            title,
            amount,
            dueDate,
            frequency = 'monthly',
            reminderDays = 3,
            recurring = true
        } = req.body;

        const userId = req.user.id;

        if (!title || !amount || !dueDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: title, amount, dueDate'
            });
        }

        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number'
            });
        }

        const isRecurring =
            frequency === 'one-time' ? false : recurring;

        const bill = await Bill.create({
            userId,
            title,
            amount: Number(amount),
            dueDate: new Date(dueDate),
            frequency,
            reminderDays,
            recurring: isRecurring
        });

        await notify({
            userId,
            type: 'bill_created',
            title: 'New bill added',
            body: `${title} due ${dayjs(bill.nextDueDate).format('MMM D')}`,
            data: { billId: bill._id.toString() },
            priority: 'low'
        });

        res.status(201).json({
            success: true,
            data: bill
        });
    } catch (error) {
        res.status(error.name === 'ValidationError' ? 400 : 500).json({
            success: false,
            error:
                error.name === 'ValidationError'
                    ? Object.values(error.errors)
                        .map(err => err.message)
                        .join(', ')
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

        res.status(200).json({
            success: true,
            data: bills
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
        const billId = req.params.id || req.params.billId;
        const { status } = req.body;
        const userId = req.user.id;

        const bill = await Bill.findOne({ _id: billId, userId });
        if (!bill) {
            return res.status(404).json({
                success: false,
                error: 'Bill not found'
            });
        }

        // Only handle paid transition
        if (status === 'paid') {

            // Non-recurring or one-time bill → just mark paid
            if (!bill.recurring || bill.frequency === 'one-time') {
                bill.status = 'paid';
            }
            // Recurring bill → move nextDueDate forward
            else {
                const baseDate = bill.nextDueDate || bill.dueDate;

                let nextDue;
                switch (bill.frequency) {
                    case 'daily':
                        nextDue = dayjs(baseDate).add(1, 'day');
                        break;
                    case 'weekly':
                        nextDue = dayjs(baseDate).add(1, 'week');
                        break;
                    case 'monthly':
                        nextDue = dayjs(baseDate).add(1, 'month');
                        break;
                    case 'yearly':
                        nextDue = dayjs(baseDate).add(1, 'year');
                        break;
                }

                bill.nextDueDate = nextDue.toDate();
                bill.status = 'pending'; // reset for next cycle
            }
        }
        // Allow manual status update if needed
        else {
            bill.status = status;
        }

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
