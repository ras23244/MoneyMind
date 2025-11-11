import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle, FileDown } from "lucide-react";
import { useUser } from "../context/UserContext";
import { useAccounts, useAccountStats } from "./hooks/useAccounts";
import AddAccountDialog from "./dialogs/AddAccountDialog";
import UpdateAccountDialog from "./dialogs/UpdateAccountDialog";
import ImportCSVDialog from "./dialogs/ImportCSVDialog";
import AccountCard from "./cards/AccountCard";
import AccountStats from "./cards/AccountStats";

const Accounts = () => {
    const { user } = useUser();
    const { data: accounts = [], isLoading } = useAccounts(user?._id);
    const { data: stats = {}, isLoading: statsLoading } = useAccountStats(user?._id);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [openImportDialog, setOpenImportDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);

    // Group accounts by type
    const groupedAccounts = useMemo(() => {
        return accounts.reduce((acc, account) => {
            const type = account.accountType || 'checking';
            if (!acc[type]) acc[type] = [];
            acc[type].push(account);
            return acc;
        }, {});
    }, [accounts]);

    const handleEditAccount = (account) => {
        setSelectedAccount(account);
        setOpenUpdateDialog(true);
    };

    const handleViewTransactions = (account) => {
        console.log('View transactions for:', account);
        // TODO: Navigate to transactions filtered by this account
    };

    return (
        <div className="p-6 space-y-6 min-h-screen bg-gradient-to-b from-slate-950 to-slate-900">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Accounts</h2>
                    <p className="text-slate-400 mt-1">Manage all your financial connections</p>
                </div>
                <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setOpenAddDialog(true)}
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Account
                </Button>
            </div>

            {/* Stats Section */}
            {!isLoading && (
                <div>
                    <AccountStats stats={stats} isLoading={statsLoading} />
                </div>
            )}

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="bg-slate-800 border border-slate-700 p-1">
                    <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        All Accounts
                    </TabsTrigger>
                    {Object.keys(groupedAccounts).map((type) => (
                        <TabsTrigger
                            key={type}
                            value={type}
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white capitalize"
                        >
                            {type} ({groupedAccounts[type].length})
                        </TabsTrigger>
                    ))}
                    <TabsTrigger
                        value="import"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                        Import / Link
                    </TabsTrigger>
                </TabsList>

                {/* All Accounts Tab */}
                <TabsContent value="all" className="mt-6 space-y-4">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400">Loading accounts...</div>
                    ) : accounts.length === 0 ? (
                        <Card className="bg-slate-800 border-slate-700">
                            <CardContent className="p-8 text-center">
                                <p className="text-slate-400 mb-4">No accounts yet</p>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => setOpenAddDialog(true)}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Account
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {accounts.map((account) => (
                                <AccountCard
                                    key={account._id}
                                    account={account}
                                    userId={user?._id}
                                    onEdit={handleEditAccount}
                                    onViewTransactions={handleViewTransactions}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Account Type Tabs */}
                {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                    <TabsContent key={type} value={type} className="mt-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {typeAccounts.map((account) => (
                                <AccountCard
                                    key={account._id}
                                    account={account}
                                    userId={user?._id}
                                    onEdit={handleEditAccount}
                                    onViewTransactions={handleViewTransactions}
                                />
                            ))}
                        </div>
                    </TabsContent>
                ))}

                {/* Import / Link Data Tab */}
                <TabsContent value="import" className="mt-6">
                    <Card className="bg-slate-800 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Import or Link Transactions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-300">
                                Import your transaction data from a CSV file to populate your accounts and track spending patterns.
                            </p>
                            <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30 space-y-3">
                                <h4 className="font-semibold text-white">CSV Format Guide</h4>
                                <div className="text-sm text-slate-300 space-y-2">
                                    <p><span className="font-mono bg-slate-900 px-2 py-1 rounded">Date, Description, Amount, Category</span></p>
                                    <p className="text-slate-400">Example: 2025-11-11, Grocery Store, 500, Food</p>
                                </div>
                            </div>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 w-full"
                                onClick={() => setOpenImportDialog(true)}
                            >
                                <FileDown className="mr-2 h-4 w-4" /> Import CSV File
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AddAccountDialog
                open={openAddDialog}
                setOpen={setOpenAddDialog}
                userId={user?._id}
            />
            <UpdateAccountDialog
                open={openUpdateDialog}
                setOpen={setOpenUpdateDialog}
                account={selectedAccount}
                userId={user?._id}
            />
            <ImportCSVDialog
                open={openImportDialog}
                setOpen={setOpenImportDialog}
            />
        </div>
    );
};

export default Accounts;