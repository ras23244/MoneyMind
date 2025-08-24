import React, { useState } from 'react';
import { ChevronDown, Eye, EyeOff, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FinomicDashboard = () => {
    const [isBalanceVisible, setIsBalanceVisible] = useState(true);
    const [selectedCurrency, setSelectedCurrency] = useState('US Dollar');

    const balance = 234567.89;

    const formatCurrency = (amount) => {
        if (!isBalanceVisible) return '••••••';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <div className="flex items-center justify-center min-h-screen p-8">
                <div className="w-full max-w-md">
                    {/* Balance Card - Exact Finomic Design */}
                    <div
                        className="relative bg-balance-card rounded-3xl p-8 shadow-float"
                        style={{
                            background: 'linear-gradient(145deg, #0a0b0d, #1a1b1f)',
                            backdropFilter: 'blur(20px)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-white text-lg font-medium">Your Balance</h2>

                            {/* Currency Selector */}
                            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                                <span className="text-white/70 text-sm">{selectedCurrency}</span>
                                <ChevronDown className="w-4 h-4 text-white/50" />
                            </div>
                        </div>

                        {/* Balance Label */}
                        <div className="mb-2">
                            <p className="text-balance-text text-sm font-medium">Balance</p>
                        </div>

                        {/* Balance Amount */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h1 className="text-balance-amount text-4xl font-bold tracking-tight">
                                    {formatCurrency(balance)}
                                </h1>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                                    className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5"
                                >
                                    {isBalanceVisible ? (
                                        <Eye className="w-5 h-5" />
                                    ) : (
                                        <EyeOff className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>

                            {/* Copy Button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="p-2 text-white/40 hover:text-white/70 hover:bg-white/5"
                            >
                                <Copy className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Card Number */}
                        <div className="flex items-center justify-between">
                            <p className="text-white/30 text-sm font-mono tracking-wider">
                                •••• •••• •••• 8394
                            </p>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                                <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>

                        {/* Subtle glow effect */}
                        <div
                            className="absolute inset-0 rounded-3xl opacity-20"
                            style={{
                                background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 70%)',
                            }}
                        />
                    </div>

                    {/* Additional Info Cards */}
                    <div className="mt-6 space-y-4">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-card-dark rounded-2xl p-6 border border-white/5">
                                <p className="text-balance-text text-sm mb-2">This Month</p>
                                <p className="text-white text-xl font-semibold">+$4,250</p>
                                <p className="text-green-400 text-xs mt-1">+12.5%</p>
                            </div>

                            <div className="bg-card-dark rounded-2xl p-6 border border-white/5">
                                <p className="text-balance-text text-sm mb-2">Expenses</p>
                                <p className="text-white text-xl font-semibold">-$2,840</p>
                                <p className="text-red-400 text-xs mt-1">+8.2%</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button className="flex-1 bg-white text-black hover:bg-white/90 h-12 rounded-xl font-medium">
                                Send Money
                            </Button>
                            <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 h-12 rounded-xl font-medium">
                                Request
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinomicDashboard;