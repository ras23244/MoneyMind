// hooks/useFinancialSummary.js
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useFinancialSummary = (userId) => {
    return useQuery({
        queryKey: ["financialSummary", userId],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get(
                "/transactions/financial-summary"
            );
            return res.data.data || {};
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,

        onError: (err) =>
            console.error("❌ [QUERY ERROR financialSummary]:", err),
    });
};
