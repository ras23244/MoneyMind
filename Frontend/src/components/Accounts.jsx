import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, Wallet, Banknote, TrendingUp, FileDown } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAccounts } from "./hooks/useAccounts";

const Accounts = () => {
    const { user } = useUser();
    const { data: accounts = [], isLoading } = useAccounts(user?._id);
    console.log("Accounts data:", accounts);

    // Dummy investments (can be replaced with a hook later)
    const investments = [
        { id: 1, name: "Mutual Fund SIP", value: "₹15,000" },
        { id: 2, name: "Stocks", value: "₹32,500" },
    ];

    return (
        <div className="p-2 space-y-6  min-h-screen">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#334155] dark:text-white">Accounts</h2>
                <div className="flex justify-end">
                    <Button className="bg-[#4b7a77] hover:bg-[#3b635f] text-white">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Account
                    </Button>
                </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400">
                Manage all your financial connections in one place.
            </p>

            <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="bg-gray-200 dark:bg-gray-800 rounded-xl p-1">
                    <TabsTrigger
                        value="accounts"
                        className="data-[state=active]:bg-[#4b7a77] data-[state=active]:text-white rounded-lg px-4 py-2"
                    >
                        Accounts
                    </TabsTrigger>
                    <TabsTrigger
                        value="investments"
                        className="data-[state=active]:bg-[#4b7a77] data-[state=active]:text-white rounded-lg px-4 py-2"
                    >
                        Investments
                    </TabsTrigger>
                    <TabsTrigger
                        value="import"
                        className="data-[state=active]:bg-[#4b7a77] data-[state=active]:text-white rounded-lg px-4 py-2"
                    >
                        Import / Link Data
                    </TabsTrigger>
                </TabsList>

                {/* ACCOUNTS LIST */}
                <TabsContent value="accounts" className="mt-6 space-y-4">
                    {isLoading ? (
                        <p className="text-gray-500 dark:text-gray-400">Loading accounts...</p>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.map((account) => (
                                <Card
                                    key={account._id}
                                    className="shadow-lg rounded-2xl border dark:border-gray-700"
                                >
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between">
                                            <span>{account.bankName}</span>
                                            {account.type === "Wallet" ? (
                                                <Wallet className="text-[#4b7a77]" />
                                            ) : account.type === "Credit Card" ? (
                                                <Banknote className="text-[#4b7a77]" />
                                            ) : (
                                                <TrendingUp className="text-[#4b7a77]" />
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            {account.type || "Bank Account"}
                                        </p>
                                        <p className="text-xl font-bold text-[#334155] dark:text-white mt-2">
                                            Balance: {account.balance !== undefined && account.balance !== null ? `₹${account.balance}` : "N/A"}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-2">
                                            Account No: {account.accountNumber}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    
                </TabsContent>

                {/* INVESTMENTS VIEW */}
                <TabsContent value="investments" className="mt-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        {investments.map((inv) => (
                            <Card
                                key={inv.id}
                                className="shadow-lg rounded-2xl border dark:border-gray-700"
                            >
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        {inv.name}
                                        <TrendingUp className="text-[#4b7a77]" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-xl font-bold text-[#334155] dark:text-white">
                                        {inv.value}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* IMPORT / LINK DATA */}
                <TabsContent value="import" className="mt-6">
                    <Card className="shadow-lg rounded-2xl border dark:border-gray-700">
                        <CardHeader>
                            <CardTitle>Import or Link Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600 dark:text-gray-300">
                                You can manually import your data from a CSV file or simulate
                                linking digital wallets/UPI for tracking.
                            </p>
                            <div className="flex gap-3">
                                <Button className="bg-[#4b7a77] hover:bg-[#3b635f] text-white">
                                    <FileDown className="mr-2 h-4 w-4" /> Import CSV
                                </Button>
                                <Button variant="outline" className="dark:border-gray-600">
                                    Link Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Accounts;