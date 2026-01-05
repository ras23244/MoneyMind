import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useBills = (userId, options = {}) => {
    const token = localStorage.getItem("token");
    const { days = 30, status } = options;

    return useQuery({
        queryKey: ['bills', userId, days, status],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}bills/get-bills`, {
                params: { days, status },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        enabled: !!userId && !!token,
        gcTime: 30 * 60 * 1000,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useBillSummary = (userId) => {
    const token = localStorage.getItem("token");

    return useQuery({
        queryKey: ['billSummary', userId],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}bills/summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        enabled: !!userId && !!token,
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreateBill = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (billData) => {
            const response = await axios.post(`${BASE_URL}bills/create-bill`, billData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bills']);
            queryClient.invalidateQueries(['billSummary']);
        }
    });
};

export const useUpdateBillStatus = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async ({ billId, status, transactionId }) => {
            const response = await axios.patch(`${BASE_URL}bills/update-bill/${billId}/status`,
                { status, transactionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bills']);
            queryClient.invalidateQueries(['billSummary']);
        }
    });
};

export const useToggleAutopay = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async ({ billId, enabled, accountId }) => {
            const response = await axios.patch(`${BASE_URL}bills/update-bill/${billId}/autopay`,
                { enabled, accountId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bills']);
        }
    });
};

export const useDeleteBill = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    return useMutation({
        mutationFn: async (billId) => {
            const response = await axios.delete(`${BASE_URL}bills/delete-bill/${billId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['bills']);
            queryClient.invalidateQueries(['billSummary']);
        }
    });
};
