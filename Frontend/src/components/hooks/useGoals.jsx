import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

/**
 * GET goals
 */
export const useGoals = (userId) => {
    return useQuery({
        queryKey: ["goals", userId],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get("/goals/get-goals");
            return res.data.data || [];
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};

/**
 * CREATE goal
 */
export const useCreateGoal = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (goal) => {
            const res = await axiosInstance.post(
                "/goals/create-goal",
                goal
            );
            return res.data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", userId] });
        },
    });
};

/**
 * UPDATE goal
 */
export const useUpdateGoal = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...goal }) => {
            const res = await axiosInstance.put(
                `/goals/update-goal/${id}`,
                goal
            );
            return res.data.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", userId] });
        },
    });
};

/**
 * DELETE goal
 */
export const useDeleteGoal = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await axiosInstance.delete(
                `/goals/delete-goal/${id}`
            );
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["goals", userId] });
        },
    });
};
