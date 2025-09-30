import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTransactionTrends = (userId, range = 30) => {
    return useQuery({
        queryKey: ["transactionTrends", userId, range],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}transactions/trends`,
                {
                    params: { range },
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );
            return res.data;
        },
        // 🚀 Set data as fresh for 10 minutes (trends change less frequently)
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        onError: (err) => console.error("❌ [QUERY ERROR trends]:", err),
    });
};