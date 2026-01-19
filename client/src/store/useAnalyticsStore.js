import { create } from 'zustand';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/analytics`;

const useAnalyticsStore = create((set, get) => ({
    workTimeData: [],
    topPerformers: [],
    attendanceStats: null,
    workTimeTrend: [],
    isLoading: false,
    error: null,

    // Get work time analytics
    fetchWorkTime: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const queryParams = new URLSearchParams(params).toString();
            const response = await axios.get(
                `${API_URL}/work-time${queryParams ? '?' + queryParams : ''}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            set({ workTimeData: response.data, isLoading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Failed to fetch work time data',
                isLoading: false,
            });
        }
    },

    // Get top performers
    fetchTopPerformers: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const queryParams = new URLSearchParams(params).toString();
            const response = await axios.get(
                `${API_URL}/top-performers${queryParams ? '?' + queryParams : ''}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            set({ topPerformers: response.data, isLoading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Failed to fetch top performers',
                isLoading: false,
            });
        }
    },

    // Get attendance statistics
    fetchAttendanceStats: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const queryParams = new URLSearchParams(params).toString();
            const response = await axios.get(
                `${API_URL}/attendance-stats${queryParams ? '?' + queryParams : ''}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            set({ attendanceStats: response.data, isLoading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Failed to fetch attendance stats',
                isLoading: false,
            });
        }
    },

    // Get work time trend
    fetchWorkTimeTrend: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const queryParams = new URLSearchParams(params).toString();
            const response = await axios.get(
                `${API_URL}/work-time-trend${queryParams ? '?' + queryParams : ''}`,
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );
            set({ workTimeTrend: response.data, isLoading: false });
        } catch (err) {
            set({
                error: err.response?.data?.message || 'Failed to fetch work time trend',
                isLoading: false,
            });
        }
    },

    // Fetch all analytics data
    fetchAllAnalytics: async (params = {}) => {
        const { fetchWorkTime, fetchTopPerformers, fetchAttendanceStats, fetchWorkTimeTrend } = get();
        await Promise.all([
            fetchWorkTime(params),
            fetchTopPerformers(params),
            fetchAttendanceStats(params),
            fetchWorkTimeTrend(params),
        ]);
    },

    // Clear analytics data
    clearAnalytics: () => {
        set({
            workTimeData: [],
            topPerformers: [],
            attendanceStats: null,
            workTimeTrend: [],
            error: null
        });
    }
}));

export default useAnalyticsStore;
