import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../../lib/axiosInstance';

export const forecastQueryKey = (months, lookback) => ['forecast', months, lookback];

export function invalidateForecastCache(queryClient) {
    return queryClient.invalidateQueries({ queryKey: ['forecast'] });
}

export function invalidateForecastForParams(queryClient, months, lookback) {
    return queryClient.invalidateQueries({ queryKey: forecastQueryKey(months, lookback) });
}

const fetchForecast = async ({ queryKey }) => {
    const [, months, lookback] = queryKey;
    const res = await axiosInstance.get('/transactions/forecast', {
        params: { months, lookback },
    });

    const history = (res.data?.data?.history || []).map((h) => ({
        month: h.month,
        net: Math.round(h.net || 0),
    }));

    const forecast = (res.data?.data?.forecast || []).map((f) => ({
        month: f.month,
        forecast: Math.round(f.projectedNet || 0),
    }));

    const combined = [];
    history.forEach((h) => combined.push({ month: h.month, net: h.net }));
    forecast.forEach((f) => combined.push({ month: f.month, forecast: f.forecast }));

    const display = combined.map((row) => {
        let label = row.month;
        try {
            label = new Date(row.month + '-01').toLocaleString(undefined, {
                month: 'short',
            });
        } catch (e) { }

        return { ...row, monthLabel: label };
    });

    return display;
};

export default function useForecast({ months = 3, lookback = 6 } = {}) {
    const query = useQuery({
        queryKey: forecastQueryKey(months, lookback),
        queryFn: fetchForecast,
        staleTime: Infinity,
        cacheTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });

    return {
        data: query.data,
        loading: query.isLoading,
        error: query.error,
        refresh: query.refetch,
    };
}
