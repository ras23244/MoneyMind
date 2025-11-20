import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useBulkAddTransactions = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (transactions) => {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}transactions/bulk-create-transactions`,
                { transactions },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
            queryClient.invalidateQueries(["financialSummary", userId]);
            queryClient.refetchQueries({ queryKey: ["transactions", userId], type: "active" });
            queryClient.refetchQueries({ queryKey: ["transactionTrends", userId], type: "active" });
        },
        onError: (err) => {
            console.error("[useBulkAddTransactions] ❌ Mutation error:", err);
        },
    });
};

export default useBulkAddTransactions;
