import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAddTransaction = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (transaction) => {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}transactions/create-transaction`,
                transaction,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: (data) => {
            // Invalidate all matching queries for transactions and trends
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });

            // Refetch all matching queries for transactions and trends
            queryClient.refetchQueries({ queryKey: ["transactions", userId], type: "active" });
            queryClient.refetchQueries({ queryKey: ["transactionTrends", userId], type: "active" });
        },
        onError: (err) => {
            console.error("[useAddTransaction] ❌ Mutation error:", err);
        },
      
    });
};
