import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useGoals = (userId) => {
    const token = localStorage.getItem("token");
    
    return useQuery({
        queryKey: ["goals", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}goals/get-goals`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.data || [];
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};

export const useCreateGoal = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async (goal) => {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}goals/create-goal`,
                goal,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", userId] });
        },
    });
};

export const useUpdateGoal = (userId) => {
    const queryClient = useQueryClient();
   
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async ({ id, ...goal }) => {
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}goals/update-goal/${id}`,
                goal,
                { headers: { Authorization: `Bearer ${token}` } }
            );
          
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", userId] });
        },
    });
};

export const useDeleteGoal = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async (id) => {
            await axios.delete(
                `${import.meta.env.VITE_BASE_URL}goals/delete-goal/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", userId] });
        },
    });
};