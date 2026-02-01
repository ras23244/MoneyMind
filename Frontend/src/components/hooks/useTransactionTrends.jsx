import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useTransactionTrends = (userId, params = { range: 30 }) => {
    const [pagination, setPagination] = useState(null);

    const query = useQuery({
        queryKey: ["transactionTrends", userId, params],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(`${import.meta.env.VITE_BASE_URL}transactions/trends`, {
                params,
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setPagination(res.data.pagination || null);
            return res.data.data || [];
        },
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        onError: (err) => console.error("[QUERY ERROR trends]:", err),
    });

    return { ...query, pagination };
};