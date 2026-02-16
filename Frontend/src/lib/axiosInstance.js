import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach access token from localStorage to each request
axiosInstance.interceptors.request.use((config) => {
    try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) { }
    return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    isRefreshing = false;
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return axiosInstance(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
                const resp = await axiosInstance.post('/users/refresh-token', {}, {
                    headers: {
                        'x-refresh-token': refreshToken || ''
                    }
                });

                const newTokens = resp.data?.tokens;
                if (newTokens?.accessToken) {
                    try { localStorage.setItem('accessToken', newTokens.accessToken); } catch (e) { }
                }
                if (newTokens?.refreshToken) {
                    try { localStorage.setItem('refreshToken', newTokens.refreshToken); } catch (e) { }
                }

                processQueue(null, newTokens?.accessToken);

                originalRequest.headers = originalRequest.headers || {};
                if (newTokens?.accessToken) originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);

                if (typeof window !== 'undefined') {

                    window.location.href = '/login';
                }

                return Promise.reject(err);
            }
        }
        if (error.response?.status === 401 && !error.response?.data?.code === 'TOKEN_EXPIRED') {
            if (typeof window !== 'undefined') {

                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
