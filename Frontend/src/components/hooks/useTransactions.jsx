import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTransactions = (userId) => {
    const token = localStorage.getItem("token");

    return useQuery({
        queryKey: ["transactions", userId],
        enabled: !!userId, // ✅ only run if userId exists
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}transactions/get-transactions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return res.data.data || [];
        },
        // 🚀 Set data as fresh for 5 minutes (no background fetch on switch/refocus)
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        onError: (err) => console.error("❌ [QUERY ERROR transactions]:", err),
    });
};