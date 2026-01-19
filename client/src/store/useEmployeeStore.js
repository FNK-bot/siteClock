import { create } from 'zustand';
import axios from 'axios';
import useAuthStore from './useAuthStore';

const API_URL = 'http://localhost:5000/api/auth';

const useEmployeeStore = create((set) => ({
    employees: [],
    isLoading: false,
    error: null,

    fetchEmployees: async () => {
        set({ isLoading: true });
        try {
            const { user } = useAuthStore.getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.get(`${API_URL}/employees`, config);
            set({ employees: response.data, isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error fetching employees',
                isLoading: false,
            });
        }
    },

    createEmployee: async (employeeData) => {
        set({ isLoading: true });
        try {
            const { user } = useAuthStore.getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.post(`${API_URL}/register`, employeeData, config);
            set((state) => ({
                employees: [response.data, ...state.employees],
                isLoading: false
            }));
            return { success: true, employee: response.data };
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error creating employee',
                isLoading: false,
            });
            return { success: false, message: error.response?.data?.message || 'Error creating employee' };
        }
    },

    updateEmployee: async (id, employeeData) => {
        set({ isLoading: true });
        try {
            const { user } = useAuthStore.getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const response = await axios.put(`${API_URL}/employee/${id}`, employeeData, config);
            set((state) => ({
                employees: state.employees.map(emp => emp._id === id ? response.data : emp),
                isLoading: false
            }));
            return { success: true, data: response.data };
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error updating employee',
                isLoading: false,
            });
            return { success: false, message: error.response?.data?.message };
        }
    },

    deleteEmployee: async (id) => {
        set({ isLoading: true });
        try {
            const { user } = useAuthStore.getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.delete(`${API_URL}/employee/${id}`, config);
            set((state) => ({
                employees: state.employees.map(emp => emp._id === id ? { ...emp, isActive: false } : emp),
                isLoading: false
            }));
            return { success: true };
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Error deleting employee',
                isLoading: false,
            });
            return { success: false, message: error.response?.data?.message };
        }
    }
}));

export default useEmployeeStore;
