import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useAccounts = (userId)=>{
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ["accounts", userId],
        enabled: !!userId,
        queryFn: async () => {
            const res = await axios.get(
                `${import.meta.env.VITE_BASE_URL}account/get-accounts`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Fetched accounts:", res.data);
            return res.data || [];
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
}