import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useBudgets = (userId, filters = {}) => {
    // Remove empty values so queryKey & request stay clean
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(
            ([_, v]) => v !== undefined && v !== null && v !== ""
        )
    );

    return useQuery({
        queryKey: ["budgets", userId, cleanFilters],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get(
                "/budgets/get-budgets",
                { params: cleanFilters } // 👈 axios handles query string
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
