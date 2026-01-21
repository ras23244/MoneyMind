import React, { useState, useMemo } from "react";
import { useUser } from "../context/UserContext";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "./hooks/useGoals";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, PauseCircle, Smile, MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import AddGoalDialog from "./AddGoalDialog";
import GoalMoneyDialog from "./GoalMoneyDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Confetti from "react-confetti";
import GoalsFilter from "./GoalsFilter";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function GoalsPanel({ formatCurrency }) {
    const { user } = useUser();
    const { data: goals = [], isLoading, isError, error } = useGoals(user?._id);
    const createGoalMutation = useCreateGoal(user?._id);
    const updateGoalMutation = useUpdateGoal(user?._id);
    const deleteGoalMutation = useDeleteGoal(user?._id);

    const [openDialog, setOpenDialog] = useState(false);
    const [showPaused, setShowPaused] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [goalMoneyDialog, setGoalMoneyDialog] = useState({ open: false, goal: null, type: "add" });
    const [editingGoal, setEditingGoal] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);

    const [goalFilters, setGoalFilters] = useState({ status: "", priority: "", progress: "", search: "" });

    
    const filteredGoals = useMemo(() => {
        let tempGoals = goals.filter((goal) =>
            showPaused ? goal.status === "paused" : goal.status !== "paused"
        );

        tempGoals = tempGoals.filter((goal) => {
            const percent = (goal.currentAmount / goal.targetAmount) * 100;
            const meetsStatus = !goalFilters.status || goal.status === goalFilters.status;
            const meetsPriority = !goalFilters.priority || goal.priority === Number(goalFilters.priority);
            const meetsSearch = !goalFilters.search || goal.title.toLowerCase().includes(goalFilters.search.toLowerCase());

            let meetsProgress = true;
            if (goalFilters.progress) {
                if (goalFilters.progress === "<50%" && percent >= 50) meetsProgress = false;
                if (goalFilters.progress === "50-80%" && (percent < 50 || percent > 80)) meetsProgress = false;
                if (goalFilters.progress === ">80%" && percent <= 80) meetsProgress = false;
            }

            return meetsStatus && meetsPriority && meetsSearch && meetsProgress;
        });

       
        return tempGoals.sort((a, b) => b.priority - a.priority);
    }, [goals, showPaused, goalFilters]);

    const getGoalMessage = (goal) => {
        const percent = (goal.currentAmount / goal.targetAmount) * 100;
        if (percent >= 90) {
            return (
                <span className="flex items-center text-green-400 font-semibold mt-1">
                    <Smile className="w-5 h-5 mr-1" /> You're almost there!
                </span>
            );
        }
        return null;
    };

    const handleMoneyChange = (goal, amount, type) => {
        const updatedAmount = type === "add" ? goal.currentAmount + amount : Math.max(0, goal.currentAmount - amount);

        updateGoalMutation.mutate(
            { id: goal._id, currentAmount: updatedAmount },
            {
                onSuccess: () => {
                    setGoalMoneyDialog({ open: false, goal: null, type: "add" });
                    if (type === "add") {
                        setShowConfetti(true);
                        toast.success("🎉 Goal Updated! You're getting closer to your goal.", {
                            autoClose: 5000
                        });
                        setTimeout(() => setShowConfetti(false), 5000);
                    } else {
                        toast.success("Goal Updated. Money withdrawn from your goal.", {
                            autoClose: 5000
                        });
                    }
                },
                onError: (err) => {
                    toast.error(`Failed to update goal: ${err.message}`, {
                        autoClose: 5000
                    });
                }
            }
        );
    };

    const handleAddOrEditGoal = (goalData) => {
        if (editingGoal) {
            updateGoalMutation.mutate({ ...goalData, id: editingGoal._id }, {
                onSuccess: () => {
                    setOpenDialog(false);
                    setEditingGoal(null);
                    toast.success("Goal Updated! Your goal has been successfully updated.", {
                        autoClose: 5000
                    });
                }
            });
        } else {
            createGoalMutation.mutate(goalData, {
                onSuccess: () => {
                    setOpenDialog(false);
                    setShowConfetti(true);
                    toast.success("Goal Created! Start saving towards your new goal!", {
                        autoClose: 5000
                    });
                    setTimeout(() => setShowConfetti(false), 5000);
                }
            });
        }
    };

    const confirmDeleteGoal = () => {
        if (!goalToDelete) return;
        deleteGoalMutation.mutate(goalToDelete._id, {
            onSuccess: () => {
                toast.success("Goal deleted.", { autoClose: 4000 });
                setShowDeleteConfirm(false);
                setGoalToDelete(null);
            },
            onError: (err) => {
                toast.error(`Failed to delete goal: ${err.message || err}`, { autoClose: 5000 });
            }
        });
    };

    if (isLoading) {
        return <p className="text-white text-center">Loading goals...</p>;
    }

    if (isError) {
        return <p className="text-red-500 text-center">Error loading goals: {error.message}</p>;
    }

    return (
        <div className="space-y-8 relative">
            <ToastContainer />
            {showConfetti && <Confetti />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Goals</h1>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={() => setOpenDialog(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Goal
                    </Button>
                    <Button onClick={() => setShowPaused(!showPaused)} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                        {showPaused ? "Show Active Goals" : "Show Paused Goals"}
                    </Button>
                </div>
            </div>

            {/* Goals Filter */}
            <GoalsFilter filters={goalFilters} setFilters={setGoalFilters} />

            {/* Goals Grid */}
            {filteredGoals.length === 0 ? (
                <p className="text-center text-white/70">No goals found. Start by adding one!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGoals.map((goal, idx) => {
                        const percent = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                        const safePercent = Math.min(percent, 100);
                        const barColor = percent >= 90 ? "bg-green-600" :
                            percent >= 80 ? "bg-blue-400" :
                                percent >= 50 ? "bg-yellow-400" :
                                    "bg-orange-400"; // A new color for early progress

                        return (
                            <Card key={goal._id || idx} className="bg-[#1f1d1f] border border-white/10 shadow-lg rounded-2xl hover:bg-white/10 relative">
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center justify-between">
                                        <span className="truncate">{goal.title}</span>
                                        <div className="flex items-center gap-2">
                                            {goal.status === "paused" && (
                                                <PauseCircle className="w-5 h-5 text-yellow-400" title="Paused" />
                                            )}
                                            {goal.priority && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">P{goal.priority}</span>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1 rounded-full hover:bg-white/10">
                                                        <MoreVertical className="w-5 h-5 text-white" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-[#242124] border border-white/10 text-gray-300 rounded-xl shadow-lg py-2">
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl" onClick={() => setGoalMoneyDialog({ open: true, goal, type: "add" })}>Add Money</DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl" onClick={() => setGoalMoneyDialog({ open: true, goal, type: "withdraw" })}>Withdraw Money</DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl" onClick={() => { setEditingGoal(goal); setOpenDialog(true); }}>Edit Goal</DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl" onClick={() => { setGoalToDelete(goal); setShowDeleteConfirm(true); }}>Delete Goal</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-white/60">Progress</span>
                                            <span className="text-white font-medium">{percent}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                            <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${safePercent}%` }} />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-[#81c784]">{formatCurrency(goal.currentAmount)}</span>
                                        <span className="text-white/70">{formatCurrency(goal.targetAmount)}</span>
                                    </div>
                                    {getGoalMessage(goal)}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            <AddGoalDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onSave={handleAddOrEditGoal}
                goal={editingGoal}
            />
            <GoalMoneyDialog
                open={goalMoneyDialog.open}
                setOpen={(open) => setGoalMoneyDialog({ ...goalMoneyDialog, open })}
                goal={goalMoneyDialog.goal}
                type={goalMoneyDialog.type}
                onSubmit={handleMoneyChange}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="bg-[#242124] border border-white/10 text-white max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Delete Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-white/70">Are you sure you want to delete the goal "{goalToDelete?.title}"? This action cannot be undone.</p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => { setShowDeleteConfirm(false); setGoalToDelete(null); }} className="flex-1">Cancel</Button>
                            <Button onClick={confirmDeleteGoal} className="flex-1 bg-red-600 hover:bg-red-700">Delete</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}