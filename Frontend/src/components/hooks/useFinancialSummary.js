// hooks/useFinancialSummary.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFinancialSummary = (userId) => {
    const token = localStorage.getItem("token");

    return useQuery({
        queryKey: ["financialSummary", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}transactions/financial-summary`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.data || {};
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        onError: (err) => console.error("❌ [QUERY ERROR financialSummary]:", err),
    });
};
