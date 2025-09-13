// src/data/financeData.js
export const userData = {
    name: "Alex Johnson",
    totalBalance: 48250.75,
    monthlyIncome: 8500.0,
    monthlyExpenses: 6250.5,
    monthlySavings: 2249.5,
    creditScore: 750,
};

export const allTransactions = [
    { id: 1, type: "income", category: "Salary", amount: 8500.0, date: "2024-01-15", description: "Monthly Salary", bank: "Chase Bank" },
    { id: 2, type: "expense", category: "Food", amount: -45.8, date: "2024-01-15", description: "Grocery Shopping", bank: "Chase Bank" },
    { id: 3, type: "expense", category: "Transport", amount: -12.5, date: "2024-01-14", description: "Uber Ride", bank: "Wells Fargo" },
    { id: 4, type: "expense", category: "Bills", amount: -150.0, date: "2024-01-13", description: "Electricity Bill", bank: "Chase Bank" },
    { id: 5, type: "income", category: "Freelance", amount: 750.0, date: "2024-01-12", description: "Web Design Project", bank: "PayPal" },
    { id: 6, type: "expense", category: "Food", amount: -28.9, date: "2024-01-11", description: "Coffee Shop", bank: "Chase Bank" },
    { id: 7, type: "expense", category: "Shopping", amount: -120.0, date: "2024-01-10", description: "Online Purchase", bank: "Wells Fargo" },
    { id: 8, type: "income", category: "Investment", amount: 240.0, date: "2024-01-09", description: "Stock Dividend", bank: "E*Trade" },
    { id: 9, type: "expense", category: "Transport", amount: -25.0, date: "2024-01-08", description: "Gas Station", bank: "Chase Bank" },
    { id: 10, type: "expense", category: "Entertainment", amount: -65.0, date: "2024-01-07", description: "Movie Theater", bank: "Wells Fargo" },
];

export const transactionTrendData = [
    { date: "2024-01-01", income: 2400, expenses: 1800, net: 600 },
    { date: "2024-01-02", income: 1200, expenses: 2200, net: -1000 },
    { date: "2024-01-03", income: 3200, expenses: 1600, net: 1600 },
    { date: "2024-01-04", income: 1800, expenses: 2800, net: -1000 },
    { date: "2024-01-05", income: 4200, expenses: 1900, net: 2300 },
    { date: "2024-01-06", income: 1600, expenses: 2400, net: -800 },
    { date: "2024-01-07", income: 2800, expenses: 2100, net: 700 },
    { date: "2024-01-08", income: 2200, expenses: 1700, net: 500 },
    { date: "2024-01-09", income: 3400, expenses: 2300, net: 1100 },
    { date: "2024-01-10", income: 1900, expenses: 2600, net: -700 },
    { date: "2024-01-11", income: 2700, expenses: 1800, net: 900 },
    { date: "2024-01-12", income: 3100, expenses: 2200, net: 900 },
    { date: "2024-01-13", income: 2300, expenses: 2700, net: -400 },
    { date: "2024-01-14", income: 2600, expenses: 1900, net: 700 },
    { date: "2024-01-15", income: 4100, expenses: 2100, net: 2000 },
];

export const budgetCategories = [
    {
        name: "Food & Dining",
        spent: 1250.5,
        budget: 1500,
        percentage: 83,
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
        className: "absolute top-10 left-[20%] rotate-[-5deg]",
    },
    {
        name: "Transportation",
        spent: 380.75,
        budget: 500,
        percentage: 76,
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
        className: "absolute top-40 left-[25%] rotate-[-7deg]",
    },
    {
        name: "Entertainment",
        spent: 420.3,
        budget: 600,
        percentage: 70,
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
        className: "absolute top-5 left-[40%] rotate-[8deg]",
    },
    {
        name: "Bills & Utilities",
        spent: 890,
        budget: 1000,
        percentage: 89,
        image: "https://cdn.prod.website-files.com/659dd5a41f44c8d830f6cda8/6706c4d96673d3bee075b136_utah-utilties.webp",
        className: "absolute top-32 left-[55%] rotate-[10deg]",
    },
    {
        name: "Shopping",
        spent: 234.6,
        budget: 400,
        percentage: 59,
        image: "https://images.unsplash.com/photo-1521334884684-d80222895322?q=80&w=1200&auto=format&fit=crop",
        className: "absolute top-20 right-[35%] rotate-[2deg]",
    },
];

export const financialGoals = [
    { name: "Emergency Fund", current: 15000, target: 25000, percentage: 60 },
    { name: "Vacation Fund", current: 2800, target: 5000, percentage: 56 },
    { name: "New Car", current: 8500, target: 20000, percentage: 43 },
];

export const connectedBanks = [
    { name: "Chase Bank", balance: 28450.75, accountType: "Checking", lastSync: "2 hours ago" },
    { name: "Wells Fargo", balance: 15800.0, accountType: "Savings", lastSync: "1 hour ago" },
    { name: "PayPal", balance: 4000.0, accountType: "Digital Wallet", lastSync: "30 mins ago" },
];
