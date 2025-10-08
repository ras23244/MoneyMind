import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useEditTransaction = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async ({ _id, ...data }) => {
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}transactions/update-transaction/${_id}`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["financialSummary", userId]);
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });

            // ✅ Invalidate Budgets on Transaction Edit
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};