import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useDeleteTransaction = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (_id) => {
            await axiosInstance.delete(
                `/transactions/delete-transaction/${_id}`
            );
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["financialSummary", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });

            // ✅ Invalidate Budgets on Transaction Delete
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};
