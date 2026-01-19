import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/tasks`;

const useTaskStore = create((set) => ({
    tasks: [],
    isLoading: false,
    error: null,

    fetchAdminTasks: async () => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.get(`${API_URL}/admin`, config);
            set({ tasks: response.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error fetching tasks',
                isLoading: false,
            });
        }
    },

    createTask: async (taskData) => {
        set({ isLoading: true, error: null });
        try {
            const { user } = useAuthStore.getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.post(API_URL, taskData, config);
            set((state) => ({
                tasks: [response.data, ...state.tasks],
                isLoading: false,
                error: null,
            }));
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error creating task';
            set({
                error: errorMessage,
                isLoading: false,
            });
            return false;
        }
    },
}));

export default useTaskStore;
