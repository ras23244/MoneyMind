import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../lib/axiosInstance";
export const useTransactionTrends = (userId, params = { range: 30 }) => {
    const [pagination, setPagination] = useState(null);

    const query = useQuery({
        queryKey: ["transactionTrends", userId, params],
        enabled: !!userId,

        queryFn: async () => {
            const res = await axiosInstance.get("/transactions/trends", {
                params, // 👈 query params here
            });

            setPagination(res.data.pagination || null);
            return res.data.data || [];
        },

        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,

        onError: (err) =>
            undefined,
    });

    return { ...query, pagination };
};
