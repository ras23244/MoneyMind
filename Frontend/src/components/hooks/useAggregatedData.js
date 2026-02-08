import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

/**
 * Financial summary
 */
export const useFinancialSummary = (userId) => {
    return useQuery({
        queryKey: ["financialSummary", userId],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get(
                "/transactions/financial-summary"
            );
            return res.data.data;
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

/**
 * Category breakdown
 */
export const useCategoryBreakdown = (userId, period = "month") => {
    return useQuery({
        queryKey: ["categoryBreakdown", userId, period],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get(
                "/transactions/category-breakdown",
                { params: { period } }
            );
            return res.data.data;
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

/**
 * Spending heatmap
 */
export const useSpendingHeatmap = (userId) => {
    return useQuery({
        queryKey: ["spendingHeatmap", userId],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get(
                "/transactions/spending-heatmap"
            );
            return res.data.data;
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

/**
 * Trend data
 */
export const useTrendData = (userId) => {
    return useQuery({
        queryKey: ["trendData", userId],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get(
                "/transactions/trend-data"
            );
            return res.data.data;
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};

/**
 * Category aggregation
 */
export const useCategoryAggregation = (
    userId,
    { range = "1M", start, end } = {}
) => {
    return useQuery({
        queryKey: ["categoryAggregation", userId, range, start, end],
        enabled: !!userId,

        queryFn: async () => {
            const params = start && end
                ? { start, end }
                : { range };

            const res = await axiosInstance.get(
                "/transactions/category-aggregation",
                { params }
            );
            return res.data.data;
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });
};
