import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

export default function GoalsPanel({ financialGoals, formatCurrency }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialGoals.map((goal, idx) => (
                <Card key={idx} className="bg-card-dark border border-white/10">
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
    );
}
