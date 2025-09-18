import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useDeleteTransaction = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (_id) => {
            const res = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}transactions/delete-transaction/${_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
            queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });
        },
    });
};