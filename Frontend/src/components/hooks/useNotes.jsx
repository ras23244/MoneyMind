import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useNotes = (userId) => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ["notes", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}notes/get-notes`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};

export const useCreateNote = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async (newNote) => {
            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}notes/create-note`,
                newNote,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["notes", userId]);
        },
    });
};
export const useUpdateNote = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async (updatedNote) => {
            const res = await axios.put(
                `${import.meta.env.VITE_BASE_URL}notes/update-note/${updatedNote.id}`,
                updatedNote,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["notes", userId]);
        },
    });
};
export const useDeleteNote = (userId) => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");
    return useMutation({
        mutationFn: async (noteId) => {
            const res = await axios.delete(
                `${import.meta.env.VITE_BASE_URL}notes/delete-note/${noteId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["notes", userId]);
        },
    });
};      