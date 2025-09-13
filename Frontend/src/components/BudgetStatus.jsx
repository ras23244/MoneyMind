import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function BudgetStatus({ initialCategories }) {
    const [cards, setCards] = useState(initialCategories);
    const [dragged, setDragged] = useState(Array(initialCategories.length).fill(false));

    const DRAG_THRESHOLD = 100;

    // Reset cards and dragged state
    const resetCards = () => {
        console.log("RESTACK")
        setCards(initialCategories);
        setDragged(Array(initialCategories.length).fill(false));
    };

    const handleDragEnd = (index, info) => {
        const distance = Math.hypot(info.offset.x, info.offset.y);
        if (distance > DRAG_THRESHOLD) {
            setDragged((prev) => {
                const next = [...prev];
                next[index] = true;
                // If all cards have been dragged, reset after a short delay
                if (next.every(Boolean)) {
                    console.log("All cards dragged");
                    setTimeout(resetCards, 100);
                }
                return next;
            });
        }
    };

    return (
        <div className="relative flex min-h-[28rem] w-full items-center justify-center overflow-clip">
            <p className="absolute top-6 text-center text-xl font-black text-neutral-400 md:text-2xl z-20">
                Your Budget Status
            </p>
            {cards.map((cat, index) => (
                <motion.div
                    key={cat.name}
                    drag
                    dragElastic={0.18}
                    dragConstraints={false} // allow free drag
                    onDragEnd={(e, info) => handleDragEnd(index, info)}
                    whileTap={{ scale: 0.98 }}
                    className={`absolute left-0 w-80 h-[26rem] bg-neutral-100 dark:bg-neutral-900 rounded-md shadow-2xl transform-3d`}
                    style={{
                        top: 0, // all cards stacked at the same position
                        zIndex: cards.length - index,
                        cursor: "grab",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                        opacity: dragged[index] ? 0 : 1, // fade out when dragged
                        pointerEvents: dragged[index] ? "none" : "auto",
                        transition: "opacity 0.4s",
                    }}
                >
                    <img
                        src={cat.image}
                        alt={cat.name}
                        className="pointer-events-none relative z-10 h-60 w-full object-cover rounded-lg"
                    />
                    <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-center text-xl font-bold text-neutral-700 dark:text-neutral-300">{cat.name}</h3>
                            <p className="text-center text-sm text-neutral-500 mt-1">{cat.percentage}% used</p>
                        </div>
                        <div className="mt-2">
                            <Progress value={cat.percentage} className="h-2 bg-neutral-200" />
                            <p className="mt-2 text-sm text-center text-neutral-600 dark:text-neutral-400">
                                ${cat.spent} of ${cat.budget}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
