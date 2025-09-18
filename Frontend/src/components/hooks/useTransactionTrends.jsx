import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTransactionTrends = (userId, range = 30) => {
    return useQuery({
        queryKey: ["transactionTrends", userId, range],
        enabled: !!userId,
        queryFn: async () => {
            console.log("🚀 [QUERY] Fetching transaction trends for userId:", userId, "range:", range);

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}transactions/trends`,
                {
                    params: { range },
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                }
            );

            console.log("📦 [QUERY SUCCESS] Trends data received:", res.data);
            return res.data;
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        onError: (err) => console.error("❌ [QUERY ERROR trends]:", err),
    });
};
