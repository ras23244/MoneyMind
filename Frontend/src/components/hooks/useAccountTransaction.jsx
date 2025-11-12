import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAccountTransactions = (accountId) => {
    const token = localStorage.getItem("token");

    return useQuery({
        queryKey: ["accountTransactions", accountId],
        enabled: !!accountId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}transactions/get-account-transactions/${accountId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        keepPreviousData: true,
        placeholderData: (prev) => prev,
        onError: (err) => console.error("❌ [QUERY ERROR transactions]:", err),
    });
};

export const useCreateAccountTransaction = (accountId, userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (transactionData) => {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}transactions/create-transaction`,
                { ...transactionData, accountId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accountTransactions", accountId] });
            if (userId) {
                queryClient.invalidateQueries(["financialSummary", userId]);
                queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
                queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });

                // ✅ Invalidate Budgets on Transaction Edit
                queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
            }
        },
    });
};

export const useUpdateAccountTransaction = (accountId, userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async ({ id, ...updateData }) => {
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}transactions/update-transaction/${id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accountTransactions", accountId] });
            if (userId) {
                queryClient.invalidateQueries(["financialSummary", userId]);
                queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
                queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });

                // ✅ Invalidate Budgets on Transaction Edit
                queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
            }
        },
    });
};

export const useDeleteAccountTransaction = (accountId, userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (transactionId) => {
            const res = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}transactions/delete-transaction/${transactionId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accountTransactions", accountId] });
            if (userId) {
                queryClient.invalidateQueries(["financialSummary", userId]);
                queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
                queryClient.invalidateQueries({ queryKey: ["transactionTrends", userId] });
                queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
            }
        },
    });
};