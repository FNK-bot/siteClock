import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isInitialized: false, // Track if we've checked localStorage
    isLoading: false,
    error: null,

    login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { identifier, password });
            localStorage.setItem('user', JSON.stringify(response.data));
            set({ user: response.data, isAuthenticated: true, isLoading: false });
            return true;
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Login failed',
                isLoading: false,
            });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false, isInitialized: true });
    },

    checkAuth: () => {
        const user = localStorage.getItem('user');
        if (user) {
            set({ user: JSON.parse(user), isAuthenticated: true, isInitialized: true });
        } else {
            set({ isInitialized: true });
        }
    },
}));

export default useAuthStore;
