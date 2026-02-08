import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    },
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

        if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
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
                await axiosInstance.post('/users/refresh-token');
                processQueue(null);

                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);

                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }

                return Promise.reject(err);
            }
        }
        if (error.response?.status === 401 && !error.response?.data?.code === 'TOKEN_EXPIRED') {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
