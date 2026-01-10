import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useBudgets = (userId, filters) => {
    const token = localStorage.getItem("token");

    // Construct query parameters from the filters object (only include non-empty values)
    const params = new URLSearchParams();
    if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") params.append(k, v);
        });
    }
    const queryParams = params.toString();

    return useQuery({
        // Add serialized params to the queryKey to refetch when they change
        queryKey: ["budgets", userId, queryParams],
        enabled: !!userId,
        queryFn: async () => {
            const url = `${import.meta.env.VITE_BASE_URL}budgets/get-budgets${queryParams ? `?${queryParams}` : ""}`;
            const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
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