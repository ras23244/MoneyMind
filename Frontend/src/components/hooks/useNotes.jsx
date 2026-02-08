import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

/**
 * GET notes
 */
export const useNotes = (userId) => {
    return useQuery({
        queryKey: ["notes", userId],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get("/notes/get-notes");
            return res.data;
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};

/**
 * CREATE note
 */
export const useCreateNote = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newNote) => {
            const res = await axiosInstance.post(
                "/notes/create-note",
                newNote
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", userId] });
        },
    });
};

/**
 * UPDATE note
 */
export const useUpdateNote = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...updatedNote }) => {
            const res = await axiosInstance.put(
                `/notes/update-note/${id}`,
                updatedNote
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", userId] });
        },
    });
};

/**
 * DELETE note
 */
export const useDeleteNote = (userId) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (noteId) => {
            const res = await axiosInstance.delete(
                `/notes/delete-note/${noteId}`
            );
            return res.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notes", userId] });
        },
    });
};
