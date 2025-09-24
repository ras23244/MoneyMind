import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useBudgets = (userId, month) => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ["budgets", userId, month],
        enabled: !!userId && !!month,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}budgets/get-budgets?month=${month}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return res.data.data || [];
        },
    });
};