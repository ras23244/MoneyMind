// src/hooks/useTransactionBreakdown.js
import { useMemo } from 'react';

export const useTransactionBreakdown = (transactions, selectedTag) => {
    return useMemo(() => {
        const tagsData = {};

        // Calculate data for the main chart
        transactions.forEach((t) => {
            if (t.type === "expense") {
                // Use tags if available, otherwise fall back to category
                const sourceTags = t.tags && t.tags.length > 0 ? t.tags : [t.category];
                sourceTags.forEach((tag) => {
                    const normalizedTag = tag.toLowerCase();
                    tagsData[normalizedTag] = (tagsData[normalizedTag] || 0) + t.amount;
                });
            }
        });

        const mainChartData = Object.keys(tagsData).map((tag) => ({
            name: tag,
            value: tagsData[tag],
        }));

        // Calculate data for the drilldown chart based on the selected tag
        const drilldownData = {};
        if (selectedTag) {
            transactions.forEach((t) => {
                if (t.type === "expense") {
                    const sourceTags = t.tags && t.tags.length > 0 ? t.tags : [t.category];

                    if (sourceTags.map(tag => tag.toLowerCase()).includes(selectedTag)) {
                        const breakdownKey = t.description || t.category || "Uncategorized";
                        drilldownData[breakdownKey] = (drilldownData[breakdownKey] || 0) + t.amount;
                    }
                }
            });
        }

        const drilldownChartData = Object.keys(drilldownData).map((key) => ({
            name: key,
            value: drilldownData[key],
        }));

        return { mainChartData, drilldownChartData };
    }, [transactions, selectedTag]);
};