import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useEditTransaction = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async ({ _id, bankAccountId, ...data }) => {
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}transactions/update-transaction/${_id}`,
                { ...data, bankAccountId },
                { headers: { Authorization: `Bearer ${token}` } }
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