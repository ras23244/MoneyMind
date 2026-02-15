import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

/* ----------------------------- */
/* GET account transactions */
/* ----------------------------- */
export const useAccountTransactions = (accountId) => {
    return useQuery({
        queryKey: ["accountTransactions", accountId],
        enabled: !!accountId,
        queryFn: async () => {
            const res = await axiosInstance.get(
                `/transactions/get-account-transactions/${accountId}`
            );
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        keepPreviousData: true,
        placeholderData: (prev) => prev,
        onError: (err) =>
            undefined,
    });
};

/* ----------------------------- */
/* CREATE account transaction */
/* ----------------------------- */
export const useCreateAccountTransaction = (accountId, userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transactionData) => {
            const res = await axiosInstance.post(
                "/transactions/create-transaction",
                { ...transactionData, accountId }
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["accountTransactions", accountId],
            });

            if (userId) {
                [
                    ["financialSummary", userId],
                    ["transactions", userId],
                    ["transactionTrends", userId],
                    ["budgets", userId],
                ].forEach((key) =>
                    queryClient.invalidateQueries({ queryKey: key })
                );
            }
        },
    });
};

/* ----------------------------- */
/* UPDATE account transaction */
/* ----------------------------- */
export const useUpdateAccountTransaction = (accountId, userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updateData }) => {
            const res = await axiosInstance.put(
                `/transactions/update-transaction/${id}`,
                updateData
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["accountTransactions", accountId],
            });

            if (userId) {
                [
                    ["financialSummary", userId],
                    ["transactions", userId],
                    ["transactionTrends", userId],
                    ["budgets", userId],
                ].forEach((key) =>
                    queryClient.invalidateQueries({ queryKey: key })
                );
            }
        },
    });
};

/* ----------------------------- */
/* DELETE account transaction */
/* ----------------------------- */
export const useDeleteAccountTransaction = (accountId, userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (transactionId) => {
            const res = await axiosInstance.delete(
                `/transactions/delete-transaction/${transactionId}`
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["accountTransactions", accountId],
            });

            if (userId) {
                [
                    ["financialSummary", userId],
                    ["transactions", userId],
                    ["transactionTrends", userId],
                    ["budgets", userId],
                ].forEach((key) =>
                    queryClient.invalidateQueries({ queryKey: key })
                );
            }
        },
    });
};
