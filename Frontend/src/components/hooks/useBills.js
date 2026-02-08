import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useBills = (userId, options = {}) => {
    const { days = 30, status } = options;

    return useQuery({
        queryKey: ["bills", userId, days, status],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axiosInstance.get("/bills/get-bills", {
                params: { days, status },
            });
            return res.data.data;
        },
        gcTime: 30 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
    });
};


export const useBillSummary = (userId) => {
    return useQuery({
        queryKey: ["billSummary", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axiosInstance.get("/bills/summary");
            return res.data.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};


export const useCreateBill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (billData) => {
            const res = await axiosInstance.post("/bills/create-bill", billData);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills"] });
            queryClient.invalidateQueries({ queryKey: ["billSummary"] });
        },
    });
};


export const useUpdateBillStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ billId, status, transactionId }) => {
            const res = await axiosInstance.patch(
                `/bills/update-bill/${billId}/status`,
                { status, transactionId }
            );
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills"] });
            queryClient.invalidateQueries({ queryKey: ["billSummary"] });
        },
    });
};

export const useToggleAutopay = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ billId, enabled, accountId }) => {
            const res = await axiosInstance.patch(
                `/bills/update-bill/${billId}/autopay`,
                { enabled, accountId }
            );
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills"] });
        },
    });
};

export const useDeleteBill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (billId) => {
            const res = await axiosInstance.delete(
                `/bills/delete-bill/${billId}`
            );
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bills"] });
            queryClient.invalidateQueries({ queryKey: ["billSummary"] });
        },
    });
};
