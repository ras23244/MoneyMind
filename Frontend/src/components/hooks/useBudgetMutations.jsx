import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useCreateBudget = (userId, month) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async (budget) => {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}budgets/create-budget`,
                budget,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};

export const useUpdateBudget = (userId, month) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async ({ id, ...budget }) => {
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}budgets/update-budget/${id}`,
                budget,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};

export const useDeleteBudget = (userId, month) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(
                `${import.meta.env.VITE_BASE_URL}budgets/delete-budget/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
        },
    });
};