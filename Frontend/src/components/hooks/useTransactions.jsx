import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTransactions = (userId) => {
    const token = localStorage.getItem("token");

    return useQuery({
        queryKey: ["transactions", userId],
        enabled: !!userId, // ✅ only run if userId exists
        queryFn: async () => {
            console.log("🚀 [QUERY] Fetching transactions for userId:", userId);

            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}transactions/get-transactions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("📦 [QUERY SUCCESS] Transactions data received:", res.data);
            return res.data.data || []; 
        },
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        onError: (err) => console.error("❌ [QUERY ERROR transactions]:", err),
    });
};
