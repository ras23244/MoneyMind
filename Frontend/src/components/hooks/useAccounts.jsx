import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAccounts = (userId) => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ["accounts", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}account/get-accounts`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Fetched accounts:", res.data);
            return res.data || [];
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
}

export const useAccountStats = (userId) => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ["accountStats", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}account/get-account-stats`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data || {};
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
    });
}

export const useCreateAccount = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (accountData) => {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}account/link-bank-account`,
                accountData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts", userId] });
            queryClient.invalidateQueries({ queryKey: ["accountStats", userId] });
        },
    });
}

export const useUpdateAccount = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async ({ id, ...updateData }) => {
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}account/update-account/${id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts", userId] });
            queryClient.invalidateQueries({ queryKey: ["accountStats", userId] });
        },
    });
}

export const useDeleteAccount = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (accountId) => {
            const res = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}account/delete-account/${accountId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["accounts", userId] });
            queryClient.invalidateQueries({ queryKey: ["accountStats", userId] });
        },
    });
}