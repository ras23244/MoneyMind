import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useEditTransaction = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ _id, bankAccountId, ...data }) => {
            const res = await axiosInstance.put(
                `/transactions/update-transaction/${_id}`,
                { ...data, bankAccountId }
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["financialSummary", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });
            queryClient.invalidateQueries({ queryKey: ["accountTransactions"] });
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};
