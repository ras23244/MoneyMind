import { Card, CardContent } from "@/components/ui/card";
import { Wallet, TrendingUp, Calendar, Activity } from 'lucide-react';

export default function AccountStats({ stats, isLoading }) {
    if (isLoading) {
        return <div className="text-slate-400">Loading stats...</div>;
    }

    const currency = (n) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(n || 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Accounts */}
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-900/10 border-blue-600/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-300 mb-1">Total Accounts</p>
                            <p className="text-2xl font-bold text-white">{stats.totalAccounts}</p>
                        </div>
                        <Wallet className="w-8 h-8 text-blue-400 opacity-50" />
                    </div>
                </CardContent>
            </Card>

            {/* Total Balance */}
            <Card className="bg-gradient-to-br from-green-900/30 to-green-900/10 border-green-600/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-300 mb-1">Total Balance</p>
                            <p className="text-2xl font-bold text-white">{currency(stats.totalBalance)}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
                    </div>
                </CardContent>
            </Card>

            {/* Average Balance */}
            <Card className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 border-purple-600/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-300 mb-1">Average Balance</p>
                            <p className="text-2xl font-bold text-white">{currency(stats.averageBalance)}</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-400 opacity-50" />
                    </div>
                </CardContent>
            </Card>

            {/* Account Types */}
            <Card className="bg-gradient-to-br from-orange-900/30 to-orange-900/10 border-orange-600/30">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-300 mb-1">Account Types</p>
                            <div className="text-sm text-orange-100 space-y-1">
                                {Object.entries(stats.accountsByType || {}).map(([type, count]) => (
                                    <div key={type} className="capitalize">
                                        {type}: <span className="font-semibold">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Calendar className="w-8 h-8 text-orange-400 opacity-50" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
