import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

// Create axios instance with secure defaults
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Send cookies with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple refresh attempts
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

// Response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        // Check if error is token expiration
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
                // Try to refresh the token
                await axiosInstance.post('/users/refresh-token');
                processQueue(null);

                // Retry original request with new token
                return axiosInstance(originalRequest);
            } catch (err) {
                processQueue(err, null);

                // Redirect to login on refresh failure
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }

                return Promise.reject(err);
            }
        }

        // Handle other 401 errors (invalid token, token not present)
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
