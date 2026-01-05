import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// params may include: range, startDate, endDate, granularity, page, limit
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
            // server returns { success: true, data: [...], pagination: {...} }
            setPagination(res.data.pagination || null);
            return res.data.data || [];
        },
        // trends can be considered fresh for a bit
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        onError: (err) => console.error("❌ [QUERY ERROR trends]:", err),
    });

    return { ...query, pagination };
};