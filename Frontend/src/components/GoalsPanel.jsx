import React, { useState } from "react";
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
import Confetti from "react-confetti";
import GoalsFilter from "./GoalsFilter"; // Import your filter component

export default function GoalsPanel({ formatCurrency }) {
    const { user } = useUser();
    const { data: goals = [] } = useGoals(user?._id);

    const createGoalMutation = useCreateGoal(user?._id);
    const updateGoalMutation = useUpdateGoal(user?._id);
    const deleteGoalMutation = useDeleteGoal(user?._id);

    const [openDialog, setOpenDialog] = useState(false);
    const [showPaused, setShowPaused] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [goalMoneyDialog, setGoalMoneyDialog] = useState({ open: false, goal: null, type: "add" });
    const [successMsg, setSuccessMsg] = useState("");
    const [editingGoal, setEditingGoal] = useState(null);

    // Filter state
    const [goalFilters, setGoalFilters] = useState({ status: "", priority: "", progress: "", search: "" });

    // Apply filters to goals
    const filteredGoals = goals
        .filter((goal) => (showPaused ? goal.status === "paused" : goal.status !== "paused"))
        .filter((goal) => {
            if (goalFilters.status && goal.status !== goalFilters.status) return false;
            if (goalFilters.priority && goal.priority !== Number(goalFilters.priority)) return false;
            if (goalFilters.progress) {
                const percent = (goal.currentAmount / goal.targetAmount) * 100;
                if (goalFilters.progress === "<50%" && percent >= 50) return false;
                if (goalFilters.progress === "50-80%" && (percent < 50 || percent > 80)) return false;
                if (goalFilters.progress === ">80%" && percent <= 80) return false;
            }
            if (goalFilters.search && !goal.title.toLowerCase().includes(goalFilters.search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => b.priority - a.priority); // maintain sorting

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

    const handleAddGoal = (newGoal) => {
        createGoalMutation.mutate(newGoal, {
            onSuccess: () => {
                setOpenDialog(false);
                setEditingGoal(null);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000);
            },
        });
    };

    const handleEditGoal = (updatedGoal) => {
        updateGoalMutation.mutate(updatedGoal, {
            onSuccess: () => {
                setOpenDialog(false);
                setEditingGoal(null);
            },
        });
    };

    const handleMoneyChange = (goal, amount, type) => {
        const updatedAmount =
            type === "add" ? goal.currentAmount + amount : Math.max(0, goal.currentAmount - amount);
        updateGoalMutation.mutate({ id: goal._id, currentAmount: updatedAmount });
        setGoalMoneyDialog({ open: false, goal: null, type: "add" });

        if (type === "add") {
            setShowConfetti(true);
            setSuccessMsg("Yaayy 🎉 You’re getting closer to your goal!");
            setTimeout(() => {
                setShowConfetti(false);
                setSuccessMsg("");
            }, 5000);
        }
    };

    const handlePauseGoal = (goal, pauseUntil) => {
        updateGoalMutation.mutate({ id: goal._id, status: "paused", pauseUntil });
    };

    const handlePriorityChange = (goal, newPriority) => {
        updateGoalMutation.mutate({ id: goal._id, priority: newPriority });
    };

    return (
        <div className="space-y-8 relative">
            {showConfetti && <Confetti />}
            {successMsg && (
                <p className="text-green-400 font-bold text-2xl text-center fixed top-20 left-0 right-0 z-50 animate-fadeIn">
                    {successMsg}
                </p>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-2xl font-bold text-white">Goals</h1>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={() => setOpenDialog(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <PlusCircle className="w-4 h-4 mr-2" /> Add Goal
                    </Button>
                    <Button
                        onClick={() => setShowPaused(!showPaused)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    >
                        {showPaused ? "Show Active Goals" : "Show Paused Goals"}
                    </Button>
                    <Button
                        onClick={() => alert("AI suggestion coming soon!")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        Get AI Suggestion
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

                        let barColor = "bg-yellow-400";
                        if (percent > 40 && percent < 70) barColor = "bg-[]#fff176";
                        if (percent >= 80 && percent < 90) barColor = "bg-blue-400";
                        if (percent >= 90) barColor = "bg-green-600";

                        return (
                            <Card
                                key={goal._id || idx}
                                className="bg-[#1f1d1f] border border-white/10 shadow-lg rounded-2xl hover:bg-white/10 relative"
                            >
                                <CardHeader>
                                    <CardTitle className="text-white flex items-center justify-between">
                                        <span className="truncate">{goal.title}</span>
                                        <div className="flex items-center gap-2">
                                            {goal.status === "paused" && (
                                                <PauseCircle
                                                    className="w-5 h-5 text-yellow-400"
                                                    title="Paused"
                                                />
                                            )}
                                            {goal.priority && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                                                    P{goal.priority}
                                                </span>
                                            )}

                                            {/* Dropdown Menu (3 dots) */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-1 rounded-full hover:bg-white/10">
                                                        <MoreVertical className="w-5 h-5 text-white" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-[#242124] border border-white/10 text-gray-300 rounded-xl shadow-lg py-2 ">
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl"
                                                        onClick={() =>
                                                            setGoalMoneyDialog({ open: true, goal, type: "add" })
                                                        }
                                                    >
                                                        Add Money
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl"
                                                        onClick={() =>
                                                            setGoalMoneyDialog({ open: true, goal, type: "withdraw" })
                                                        }
                                                    >
                                                        Withdraw Money
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl"
                                                        onClick={() =>
                                                            handlePriorityChange(
                                                                goal,
                                                                prompt("Set new priority (number):", goal.priority)
                                                            )
                                                        }
                                                    >
                                                        Change Priority
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl"
                                                        onClick={() =>
                                                            updateGoalMutation.mutate({
                                                                id: goal._id,
                                                                status:
                                                                    goal.status === "active"
                                                                        ? "paused"
                                                                        : "active",
                                                            })
                                                        }
                                                    >
                                                        {goal.status === "active" ? "Pause Goal" : "Start Goal"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="hover:bg-white/10 rounded-xl"
                                                        onClick={() => {
                                                            setEditingGoal(goal);
                                                            setOpenDialog(true);
                                                        }}
                                                    >
                                                        Edit Goal
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem className="hover:bg-white/10 rounded-xl"
                                                        onClick={() => deleteGoalMutation.mutate(goal._id)}
                                                    >
                                                        Delete Goal
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardTitle>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-white/60">Progress</span>
                                            <span className="text-white font-medium">{percent}%</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${barColor} transition-all duration-500`}
                                                style={{ width: `${safePercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Amounts */}
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-[#81c784]">
                                            {formatCurrency(goal.currentAmount)}
                                        </span>
                                        <span className="text-white/70">
                                            {formatCurrency(goal.targetAmount)}
                                        </span>
                                    </div>

                                    {/* Near Goal Message */}
                                    {getGoalMessage(goal)}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <AddGoalDialog
                open={openDialog}
                setOpen={setOpenDialog}
                onSave={editingGoal ? handleEditGoal : handleAddGoal}
                goal={editingGoal}
            />
            <GoalMoneyDialog
                open={goalMoneyDialog.open}
                setOpen={(open) => setGoalMoneyDialog({ ...goalMoneyDialog, open })}
                goal={goalMoneyDialog.goal}
                type={goalMoneyDialog.type}
                onSubmit={handleMoneyChange}
            />
        </div>
    );
}
