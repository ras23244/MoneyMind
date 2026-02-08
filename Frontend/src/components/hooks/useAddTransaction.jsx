import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useAddTransaction = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transaction) => {
            const res = await axiosInstance.post(
                "/transactions/create-transaction",
                transaction
            );
            return res.data;
        },

        onSuccess: () => {
            // 🔄 Transactions list
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });

            // 📈 Trends
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
            queryClient.invalidateQueries({ queryKey: ["financialSummary", userId] });
        },

        onError: (err) => {
            console.error("[useAddTransaction] ❌ Mutation error:", err);
        },
    });
};
