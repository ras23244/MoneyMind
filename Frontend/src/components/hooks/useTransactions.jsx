import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";

export const useTransactions = (userId) => {
    return useQuery({
        queryKey: ["transactions", userId],
        enabled: !!userId, // ✅ only run if userId exists

        queryFn: async () => {
            const res = await axiosInstance.get(
                "/transactions/get-transactions"
            );
            return res.data.data || [];
        },

        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,

        onError: (err) =>
            undefined,
    });
};
