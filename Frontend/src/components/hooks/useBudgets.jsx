import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useBudgets = (userId, filters) => {
    const token = localStorage.getItem("token");

    // Construct query parameters from the filters object
    const queryParams = new URLSearchParams(filters).toString();

    return useQuery({
        // Add filters to the queryKey to refetch when they change
        queryKey: ["budgets", userId, filters],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}budgets/get-budgets?${queryParams}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.data || [];
        },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,

        keepPreviousData: true,
        placeholderData: (prev) => prev,
    });
};