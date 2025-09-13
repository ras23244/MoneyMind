import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import {
    DraggableCardBody,
    DraggableCardContainer,
} from "@/components/ui/draggable-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PiggyBank,
    CreditCard,
    Eye,
    EyeOff,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Calendar as CalendarIcon,
    Filter,
    Search,
    Target,
    Bell,
    Download,
    Menu,
    Home,
    BarChart3,
    Wallet,
    Settings,
    Receipt,
    Goal
} from 'lucide-react';
import { motion } from "framer-motion";
import useGeneral from './hooks/useGeneral';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";


const FinanceDashboard = () => {
    const { navigate } = useGeneral();
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        description: "",
        amount: "",
        type: "expense",
        category: "",
        tags: "",
    });
    const [loading, setLoading] = useState(false);

    // Mock financial data
    const userData = {
        name: "Alex Johnson",
        totalBalance: 48250.75,
        monthlyIncome: 8500.00,
        monthlyExpenses: 6250.50,
        monthlySavings: 2249.50,
        creditScore: 750
    };

    // Extended transactions data with more dates
    const allTransactions = [
        { id: 1, type: 'income', category: 'Salary', amount: 8500.00, date: '2024-01-15', description: 'Monthly Salary', bank: 'Chase Bank' },
        { id: 2, type: 'expense', category: 'Food', amount: -45.80, date: '2024-01-15', description: 'Grocery Shopping', bank: 'Chase Bank' },
        { id: 3, type: 'expense', category: 'Transport', amount: -12.50, date: '2024-01-14', description: 'Uber Ride', bank: 'Wells Fargo' },
        { id: 4, type: 'expense', category: 'Bills', amount: -150.00, date: '2024-01-13', description: 'Electricity Bill', bank: 'Chase Bank' },
        { id: 5, type: 'income', category: 'Freelance', amount: 750.00, date: '2024-01-12', description: 'Web Design Project', bank: 'PayPal' },
        { id: 6, type: 'expense', category: 'Food', amount: -28.90, date: '2024-01-11', description: 'Coffee Shop', bank: 'Chase Bank' },
        { id: 7, type: 'expense', category: 'Shopping', amount: -120.00, date: '2024-01-10', description: 'Online Purchase', bank: 'Wells Fargo' },
        { id: 8, type: 'income', category: 'Investment', amount: 240.00, date: '2024-01-09', description: 'Stock Dividend', bank: 'E*Trade' },
        { id: 9, type: 'expense', category: 'Transport', amount: -25.00, date: '2024-01-08', description: 'Gas Station', bank: 'Chase Bank' },
        { id: 10, type: 'expense', category: 'Entertainment', amount: -65.00, date: '2024-01-07', description: 'Movie Theater', bank: 'Wells Fargo' }
    ];

    // Transaction trend data for chart
    const transactionTrendData = [
        { date: '2024-01-01', income: 2400, expenses: 1800, net: 600 },
        { date: '2024-01-02', income: 1200, expenses: 2200, net: -1000 },
        { date: '2024-01-03', income: 3200, expenses: 1600, net: 1600 },
        { date: '2024-01-04', income: 1800, expenses: 2800, net: -1000 },
        { date: '2024-01-05', income: 4200, expenses: 1900, net: 2300 },
        { date: '2024-01-06', income: 1600, expenses: 2400, net: -800 },
        { date: '2024-01-07', income: 2800, expenses: 2100, net: 700 },
        { date: '2024-01-08', income: 2200, expenses: 1700, net: 500 },
        { date: '2024-01-09', income: 3400, expenses: 2300, net: 1100 },
        { date: '2024-01-10', income: 1900, expenses: 2600, net: -700 },
        { date: '2024-01-11', income: 2700, expenses: 1800, net: 900 },
        { date: '2024-01-12', income: 3100, expenses: 2200, net: 900 },
        { date: '2024-01-13', income: 2300, expenses: 2700, net: -400 },
        { date: '2024-01-14', income: 2600, expenses: 1900, net: 700 },
        { date: '2024-01-15', income: 4100, expenses: 2100, net: 2000 }
    ];

    const recentTransactions = allTransactions.slice(0, 5);
    const budgetCategories = [
        {
            name: 'Food & Dining',
            spent: 1250.50,
            budget: 1500,
            color: 'bg-orange-500',
            percentage: 83,
            image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            className: "absolute top-10 left-[20%] rotate-[-5deg]" // food
        },
        {
            name: 'Transportation',
            spent: 380.75,
            budget: 500,
            color: 'bg-blue-500',
            percentage: 76,
            image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
            className: "absolute top-40 left-[25%] rotate-[-7deg]" // car / transport
        },
        {
            name: 'Entertainment',
            spent: 420.30,
            budget: 600,
            color: 'bg-purple-500',
            percentage: 70,
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420",
            className: "absolute top-5 left-[40%] rotate-[8deg]"// movie theater
        },
        {
            name: 'Bills & Utilities',
            spent: 890.00,
            budget: 1000,
            color: 'bg-red-500',
            percentage: 89,
            image: "https://cdn.prod.website-files.com/659dd5a41f44c8d830f6cda8/6706c4d96673d3bee075b136_utah-utilties.webp",
            className: "absolute top-32 left-[55%] rotate-[10deg]"// electricity/lightbulb
        },
        {
            name: 'Shopping',
            spent: 234.60,
            budget: 400,
            color: 'bg-green-500',
            percentage: 59,
            image: "https://images.unsplash.com/photo-1521334884684-d80222895322",
            className: "absolute top-20 right-[35%] rotate-[2deg]" // shopping bags
        }
    ];

    const financialGoals = [
        { name: 'Emergency Fund', current: 15000, target: 25000, percentage: 60 },
        { name: 'Vacation Fund', current: 2800, target: 5000, percentage: 56 },
        { name: 'New Car', current: 8500, target: 20000, percentage: 43 }
    ];

    const connectedBanks = [
        { name: 'Chase Bank', balance: 28450.75, accountType: 'Checking', lastSync: '2 hours ago' },
        { name: 'Wells Fargo', balance: 15800.00, accountType: 'Savings', lastSync: '1 hour ago' },
        { name: 'PayPal', balance: 4000.00, accountType: 'Digital Wallet', lastSync: '30 mins ago' }
    ];

    const items = [
        {
            title: "Tyler Durden",
            image:
                "https://images.unsplash.com/photo-1732310216648-603c0255c000?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            className: "absolute top-10 left-[20%] rotate-[-5deg]",
        },
        {
            title: "The Narrator",
            image:
                "https://images.unsplash.com/photo-1697909623564-3dae17f6c20b?q=80&w=2667&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            className: "absolute top-40 left-[25%] rotate-[-7deg]",
        },
        {
            title: "Iceland",
            image:
                "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            className: "absolute top-5 left-[40%] rotate-[8deg]",
        },
        {
            title: "Japan",
            image:
                "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=3648&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            className: "absolute top-32 left-[55%] rotate-[10deg]",
        },
        {
            title: "Norway",
            image:
                "https://images.unsplash.com/photo-1421789665209-c9b2a435e3dc?q=80&w=3542&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            className: "absolute top-20 right-[35%] rotate-[2deg]",
        },
        {
            title: "New Zealand",
            image:
                "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=3070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            className: "absolute top-24 left-[45%] rotate-[-7deg]",
        },
        {
            title: "Canada",
            image:
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            className: "absolute top-8 left-[30%] rotate-[4deg]",
        },
    ];
    // Format currency (hide if balance visibility is off and amount > 1000)
    const formatCurrency = (amount) => {
        if (!isBalanceVisible && amount > 1000) return '••••••';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(Math.abs(amount));
    };

   
    // Format date string into "Wed, Jan 3" format
    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateString));
    };

    const navigation = [
        { id: 'overview', label: 'Overview', icon: Home },
        { id: 'transactions', label: 'Transactions', icon: Receipt },
        { id: 'budgets', label: 'Budgets', icon: Target },
        { id: 'goals', label: 'Goals', icon: Goal },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'accounts', label: 'Accounts', icon: Wallet }
    ];

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleTypeChange = (value) => {
        setForm({ ...form, type: value });
    };

    const handleCategoryChange = (value) => {
        setForm({ ...form, category: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Replace with your backend API call
            // await axios.post("/api/transactions", form);
            // Reset form and close modal
            setForm({ description: "", amount: "", type: "expense", category: "", tags: "" });
            setOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-card-dark border-r border-white/10 p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-white text-xl font-bold">FinanceTracker</h1>
                        <p className="text-white/60 text-sm">Personal Finance</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                                    ? 'bg-white text-black'
                                    : 'text-white/70 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{userData.creditScore}</span>
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">Credit Score</p>
                            <p className="text-green-400 text-xs">Excellent</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Good morning, {userData.name}</h2>
                            <p className="text-white/60 mt-1">Here's your financial overview</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="border-white/20 text-white ">
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </Button>
                            <Button
                                size="sm"
                                className="bg-white text-black hover:bg-white/90"
                                onClick={() => setOpen(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Transaction
                            </Button>
                        </div>
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Balance Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <Card className="bg-balance-card border border-white/10 shadow-elegant hover:bg-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-balance-text text-sm">Total Balance</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <h3 className="text-2xl font-bold text-white">
                                                        {formatCurrency(userData.totalBalance)}
                                                    </h3>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                                                        className="p-1 text-white/40 hover:text-white/70"
                                                    >
                                                        {isBalanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card-dark border border-white/10 hover:bg-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ArrowUpRight className="w-5 h-5 text-green-400" />
                                            <span className="text-white/70 text-sm">Income</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-400">
                                            {formatCurrency(userData.monthlyIncome)}
                                        </p>
                                        <p className="text-green-400/60 text-xs mt-1">+12.5% from last month</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card-dark border border-white/10 hover:bg-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <ArrowDownRight className="w-5 h-5 text-red-400" />
                                            <span className="text-white/70 text-sm">Expenses</span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-400">
                                            {formatCurrency(userData.monthlyExpenses)}
                                        </p>
                                        <p className="text-red-400/60 text-xs mt-1">+8.2% from last month</p>
                                    </CardContent>
                                </Card>

                                <Card className="bg-card-dark border border-white/10 hover:bg-white/10">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <PiggyBank className="w-5 h-5 text-blue-400" />
                                            <span className="text-white/70 text-sm">Savings</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-400">
                                            {formatCurrency(userData.monthlySavings)}
                                        </p>
                                        <p className="text-blue-400/60 text-xs mt-1">+15.3% from last month</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Recent Transactions */}
                                <Card className="lg:col-span-2 bg-card-dark border border-white/10">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-white">Recent Transactions</CardTitle>
                                            <Button variant="outline" size="sm" className="border-white/20 text-white">
                                                <Search className="w-4 h-4 mr-2" />
                                                Search
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {recentTransactions.map((transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-400/20' : 'bg-red-400/20'
                                                            }`}>
                                                            {transaction.type === 'income' ? (
                                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <TrendingDown className="w-4 h-4 text-red-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{transaction.description}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                                                                    {transaction.category}
                                                                </Badge>
                                                                <span className="text-xs text-white/50">{transaction.bank}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Budget Overview */}

                                <DraggableCardContainer className="relative flex min-h-screen w-full items-center justify-center overflow-clip">
                                    <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-neutral-400 md:text-4xl dark:text-neutral-800">
                                        Your Budget Status
                                    </p>

                                    {budgetCategories.map((item) => (
                                        <DraggableCardBody className={item.className}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="pointer-events-none relative z-10 h-80 w-80 object-cover"
                                            />
                                            <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">
                                                {item.name}
                                            </h3>
                                            <div className="mt-3 px-4">
                                                <Progress value={item.percentage} className="h-2 bg-neutral-200" />
                                                <p className="mt-2 text-sm text-center text-neutral-600 dark:text-neutral-400">
                                                    ${item.spent} of ${item.budget}
                                                </p>
                                            </div>
                                        </DraggableCardBody>
                                    ))}
                                </DraggableCardContainer>

                            </div>
                        </div>
                    )}

                    {/* Connected Accounts Tab */}
                    {activeTab === 'accounts' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white">Connected Accounts</h3>
                                <Button className="bg-white text-black hover:bg-white/90">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Link Bank Account
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {connectedBanks.map((bank, index) => (
                                    <Card key={index} onClick={() => navigate('/dash')} className="bg-card-dark border border-white/10">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                                                        <CreditCard className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white font-semibold">{bank.name}</h4>
                                                        <p className="text-white/60 text-sm">{bank.accountType}</p>
                                                    </div>
                                                </div>
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-2xl font-bold text-white">
                                                    {formatCurrency(bank.balance)}
                                                </p>
                                                <p className="text-white/50 text-xs">Last sync: {bank.lastSync}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Financial Goals Tab */}
                    {activeTab === 'goals' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white">Financial Goals</h3>
                                <Button className="bg-white text-black hover:bg-white/90">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Goal
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {financialGoals.map((goal, index) => (
                                    <Card key={index} className="bg-card-dark border border-white/10">
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-white font-semibold">{goal.name}</h4>
                                                    <Target className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-white/70">Progress</span>
                                                        <span className="text-white">{goal.percentage}%</span>
                                                    </div>
                                                    <Progress value={goal.percentage} className="h-3 bg-white/10" />
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-white/70">{formatCurrency(goal.current)}</span>
                                                        <span className="text-white/70">{formatCurrency(goal.target)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-white">Transactions</h3>
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" className="border-white/20 text-white">
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Button className="bg-white text-black hover:bg-white/90">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Transaction
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Transaction Trend Chart */}
                                <Card className="lg:col-span-2 bg-card-dark border border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-white">Transaction Trends</CardTitle>
                                        <p className="text-white/60 text-sm">Daily income vs expenses over time</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={transactionTrendData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                    <XAxis
                                                        dataKey="date"
                                                        stroke="rgba(255,255,255,0.4)"
                                                        fontSize={12}
                                                        tickFormatter={(value) => new Date(value).getDate().toString()}
                                                    />
                                                    <YAxis
                                                        stroke="rgba(255,255,255,0.4)"
                                                        fontSize={12}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '8px',
                                                            color: 'white'
                                                        }}
                                                        formatter={(value, name) => [
                                                            `$${Math.abs(Number(value)).toLocaleString()}`,
                                                            name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net'
                                                        ]}
                                                        labelFormatter={(label) => formatDate(label)}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="income"
                                                        stroke="#22c55e"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="expenses"
                                                        stroke="#ef4444"
                                                        strokeWidth={2}
                                                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="net"
                                                        stroke="#3b82f6"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Calendar */}
                                <Card className="bg-card-dark border border-white/10">
                                    <CardHeader>
                                        <CardTitle className="text-white">Select Date</CardTitle>
                                        <p className="text-white/60 text-sm">Click a date to view transactions</p>
                                    </CardHeader>
                                    <CardContent>
                                        <Calendar
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={(date) => date && setSelectedDate(date)}
                                            className="w-full bg-transparent text-white border-0"
                                            classNames={{
                                                months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                                                month: "space-y-4 w-full flex flex-col",
                                                table: "w-full h-full border-collapse space-y-1",
                                                head_row: "",
                                                row: "w-full mt-2",
                                                head_cell: "text-white/50 rounded-md w-8 font-normal text-[0.8rem]",
                                                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-white/10 [&:has([aria-selected].day-outside)]:bg-white/5 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                                                day: "h-8 w-8 p-0 font-normal text-white hover:bg-white/10 hover:text-white rounded-md transition-colors",
                                                day_range_end: "day-range-end",
                                                day_selected: "bg-white text-black hover:bg-white hover:text-black focus:bg-white focus:text-black",
                                                day_today: "bg-white/20 text-white font-semibold",
                                                day_outside: "text-white/30 opacity-50 aria-selected:bg-white/5 aria-selected:text-white/30 aria-selected:opacity-30",
                                                day_disabled: "text-white/30 opacity-50",
                                                day_range_middle: "aria-selected:bg-white/10 aria-selected:text-white",
                                                day_hidden: "invisible",
                                                caption: "flex justify-center pt-1 relative items-center text-white",
                                                caption_label: "text-sm font-medium text-white",
                                                nav: "space-x-1 flex items-center",
                                                nav_button: "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-white/20 bg-transparent hover:bg-white/10 hover:text-white h-7 w-7 bg-transparent p-0 text-white/70",
                                                nav_button_previous: "absolute left-1",
                                                nav_button_next: "absolute right-1"
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Transactions for Selected Date */}
                            <Card className="bg-card-dark border border-white/10">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-white">
                                                Transactions for {formatDate(selectedDate.toISOString())}
                                            </CardTitle>
                                            <p className="text-white/60 text-sm mt-1">
                                                {getTransactionsByDate(selectedDate).length} transaction(s) found
                                            </p>
                                        </div>
                                        <CalendarIcon className="w-5 h-5 text-white/40" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {getTransactionsByDate(selectedDate).length > 0 ? (
                                            getTransactionsByDate(selectedDate).map((transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-400/20' : 'bg-red-400/20'
                                                            }`}>
                                                            {transaction.type === 'income' ? (
                                                                <TrendingUp className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <TrendingDown className="w-4 h-4 text-red-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-white">{transaction.description}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs">
                                                                    {transaction.category}
                                                                </Badge>
                                                                <span className="text-xs text-white/50">{transaction.bank}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                                                            }`}>
                                                            {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                                                        </p>
                                                        <p className="text-xs text-white/40 mt-1">
                                                            {new Date(transaction.date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <CalendarIcon className="w-12 h-12 text-white/20 mx-auto mb-4" />
                                                <p className="text-white/60">No transactions found for this date</p>
                                                <p className="text-white/40 text-sm mt-1">Try selecting a different date</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Transaction Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="bg-[#242124] border border-white/10 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-white">Add Transaction</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 ">
                        <div>
                            <Label htmlFor="description" className="text-white mb-1">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="bg-card border-white/10 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="amount" className="text-white mb-1">Amount</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                value={form.amount}
                                onChange={handleChange}
                                className="bg-card border-white/10 text-white"
                                required
                            />
                        </div>
                        <div className='flex justify-between'>
                        <div>
                            <Label htmlFor="type" className="text-white mb-1">Type</Label>
                            <Select value={form.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="bg-card border-white/10 text-white">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                    <SelectContent className="bg-[#242124] border-white/10 text-white">
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="category" className="text-white mb-1">Category</Label>
                            <Select value={form.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="bg-card border-white/10 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#242124] border-white/10 text-white">
                                    <SelectItem value="Salary">Salary</SelectItem>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Transport">Transport</SelectItem>
                                    <SelectItem value="Bills">Bills</SelectItem>
                                    <SelectItem value="Shopping">Shopping</SelectItem>
                                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        </div>
                        <div>
                            <Label htmlFor="tags" className="text-white mb-1">Tags (comma separated)</Label>
                            <Input
                                id="tags"
                                name="tags"
                                value={form.tags}
                                onChange={handleChange}
                                className="bg-card border-white/10 text-white"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-white text-black hover:bg-white/90" disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </Button>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="border-white/20 text-white">
                                    Cancel
                                </Button>
                            </DialogClose>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FinanceDashboard;