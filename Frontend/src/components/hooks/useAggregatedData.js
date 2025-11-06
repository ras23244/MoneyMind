import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const useFinancialSummary = (userId) => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ['financialSummary', userId],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}transactions/financial-summary`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        enabled: !!userId && !!token,
        staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    });
};

export const useCategoryBreakdown = (userId, period = 'month') => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ['categoryBreakdown', userId, period],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}transactions/category-breakdown`, {
                params: { period },
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        enabled: !!userId && !!token,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSpendingHeatmap = (userId) => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ['spendingHeatmap', userId],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}transactions/spending-heatmap`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        enabled: !!userId && !!token,
        staleTime: 5 * 60 * 1000,
    });
};

export const useTrendData = (userId) => {
    const token = localStorage.getItem("token");
    return useQuery({
        queryKey: ['trendData', userId],
        queryFn: async () => {
            const response = await axios.get(`${BASE_URL}transactions/trend-data`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data.data;
        },
        enabled: !!userId && !!token,
        staleTime: 5 * 60 * 1000,
    });
};