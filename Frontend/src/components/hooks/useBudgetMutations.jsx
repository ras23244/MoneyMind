import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

/**
 * CREATE budget
 */
export const useCreateBudget = (userId, month) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (budget) => {
            const res = await axiosInstance.post(
                "/budgets/create-budget",
                budget
            );
            return res.data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};

/**
 * UPDATE budget
 */
export const useUpdateBudget = (userId, month) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...budget }) => {
            const res = await axiosInstance.put(
                `/budgets/update-budget/${id}`,
                budget
            );
            return res.data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};

/**
 * DELETE budget
 */
export const useDeleteBudget = (userId, month) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await axiosInstance.delete(
                `/budgets/delete-budget/${id}`
            );
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};
