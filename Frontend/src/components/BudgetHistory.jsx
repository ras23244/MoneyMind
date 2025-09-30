// src/components/History.jsx
import React, { useRef, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BudgetProgressCard from "./BudgetProgressCard";

export default function BudgetHistory({ budgets, transactions }) {
    const scrollRef = useRef(null);
    const [atTop, setAtTop] = useState(true);
    const [atBottom, setAtBottom] = useState(false);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const tolerance = 2;
        setAtTop(el.scrollTop <= tolerance);
        setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight <= tolerance);
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
    }, []);

    const handleScrollIndicatorClick = () => {
        const el = scrollRef.current;
        if (!el) return;

        if (atTop) {
            el.scrollBy({ top: 150, behavior: "smooth" });
        } else if (atBottom) {
            el.scrollBy({ top: -150, behavior: "smooth" });
        } else {
            el.scrollBy({ top: 150, behavior: "smooth" });
        }
    };

    return (
        <Card className="bg-card-dark border border-white/10 mt-8">
            <CardHeader>
                <CardTitle className="text-white">History</CardTitle>
            </CardHeader>
            <CardContent>
                <div
                    ref={scrollRef}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-black/40"
                >
                    {budgets.length === 0 ? (
                        <p className="text-white/60">No past budgets yet.</p>
                    ) : (
                        budgets.map((budget, idx) => (
                            <BudgetProgressCard
                                key={budget._id || idx}
                                budget={budget}
                                transactions={transactions}
                                isHistory={true}
                            />
                        ))
                    )}
                </div>

                {budgets.length > 6 && (
                    <div
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/50 animate-bounce text-2xl cursor-pointer select-none"
                        onClick={handleScrollIndicatorClick}
                    >
                        {atTop ? "▼" : atBottom ? "▲" : "▼"}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
