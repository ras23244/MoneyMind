import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useBulkAddTransactions = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transactions) => {
            const res = await axiosInstance.post(
                "/transactions/bulk-create-transactions",
                { transactions }
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
            queryClient.invalidateQueries({ queryKey: ["financialSummary", userId] });
        },

        onError: (err) => {
        },
    });
};

export default useBulkAddTransactions;
