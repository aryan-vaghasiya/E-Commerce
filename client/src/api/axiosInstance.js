import axios from 'axios';
import { store } from "../redux/store"

const BASE_URL = import.meta.env.VITE_API_SERVER;
const TIMEOUT = 100000;

// ============================================
// 1. Public API Instance (No Auth Required)
// ============================================
export const publicApi = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

publicApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
        
        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data
        });
    }
);

// ============================================
// 2. Authenticated API Instance (Requires Token)
// ============================================
export const authApi = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

authApi.interceptors.request.use(
    (config) => {
        const token = store.getState().userReducer.token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear() 
            // window.location.href = '/';
            window.location.href = '/login';
        }
        
        const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
        
        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data
        });
    }
);

// ============================================
// 3. File Upload API Instance (Multipart)
// ============================================
export const fileUploadApi = axios.create({
    baseURL: BASE_URL,
    timeout: 300000,
    headers: {},
});

fileUploadApi.interceptors.request.use(
    (config) => {
        const token = store.getState().userReducer.token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

fileUploadApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.clear() 
            // window.location.href = '/';
            window.location.href = '/login';
        }
        
        const errorMessage = error.response?.data?.error || error.message || 'Error occurred, upload failed';
        
        return Promise.reject({
            message: errorMessage,
            status: error.response?.status,
            data: error.response?.data
        });
    }
);