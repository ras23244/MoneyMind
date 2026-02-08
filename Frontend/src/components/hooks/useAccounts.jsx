import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

/* ----------------------------- */
/* GET all accounts */
/* ----------------------------- */
export const useAccounts = (userId) => {
    return useQuery({
        queryKey: ["accounts", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axiosInstance.get("/account/get-accounts");
            return res.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};

/* ----------------------------- */
/* GET account stats */
/* ----------------------------- */
export const useAccountStats = (userId) => {
    return useQuery({
        queryKey: ["accountStats", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axiosInstance.get("/account/get-account-stats");
            return res.data || {};
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
};

/* ----------------------------- */
/* CREATE account */
/* ----------------------------- */
export const useCreateAccount = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountData) => {
            const res = await axiosInstance.post(
                "/account/link-bank-account",
                accountData
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts", userId] });
            queryClient.invalidateQueries({ queryKey: ["accountStats", userId] });
        },
    });
};

/* ----------------------------- */
/* UPDATE account */
/* ----------------------------- */
export const useUpdateAccount = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updateData }) => {
            const res = await axiosInstance.put(
                `/account/update-account/${id}`,
                updateData
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts", userId] });
            queryClient.invalidateQueries({ queryKey: ["accountStats", userId] });
        },
    });
};

export const useDeleteAccount = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (accountId) => {
            const res = await axiosInstance.delete(
                `/account/delete-account/${accountId}`
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts", userId] });
            queryClient.invalidateQueries({ queryKey: ["accountStats", userId] });
        },
    });
};
