import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import useAuthStore from './useAuthStore';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/attendance`;

const useAttendanceStore = create(
    persist(
        (set, get) => ({
            history: [],
            stats: null,
            queue: [],
            isLoading: false,
            error: null,

            addToQueue: (type, payload) => {
                set((state) => ({
                    queue: [...state.queue, { type, payload, timestamp: Date.now() }]
                }));
            },

            removeFromQueue: (timestamp) => {
                set((state) => ({
                    queue: state.queue.filter(item => item.timestamp !== timestamp)
                }));
            },

            clockIn: async (taskId, latitude, longitude) => {
                set({ isLoading: true });

                const payload = { taskId };
                if (latitude !== undefined && longitude !== undefined) {
                    payload.latitude = latitude;
                    payload.longitude = longitude;
                }

                if (!navigator.onLine) {
                    get().addToQueue('clock-in', payload);
                    set({ isLoading: false });
                    return { success: true, data: { message: 'Offline: Clock-in queued' }, offline: true };
                }

                try {
                    const { user } = useAuthStore.getState();
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const response = await axios.post(`${API_URL}/clock-in`, payload, config);
                    set({ isLoading: false });
                    return { success: true, data: response.data };
                } catch (error) {
                    set({ error: error.response?.data?.message || 'Clock in failed', isLoading: false });
                    return { success: false, message: error.response?.data?.message || 'Clock in failed' };
                }
            },

            clockOut: async (taskId, latitude, longitude) => {
                set({ isLoading: true });

                const payload = { taskId };
                if (latitude !== undefined && longitude !== undefined) {
                    payload.latitude = latitude;
                    payload.longitude = longitude;
                }

                if (!navigator.onLine) {
                    get().addToQueue('clock-out', payload);
                    set({ isLoading: false });
                    return { success: true, data: { message: 'Offline: Clock-out queued' }, offline: true };
                }

                try {
                    const { user } = useAuthStore.getState();
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const response = await axios.post(`${API_URL}/clock-out`, payload, config);
                    set({ isLoading: false });
                    return { success: true, data: response.data };
                } catch (error) {
                    set({ error: error.response?.data?.message || 'Clock out failed', isLoading: false });
                    return { success: false, message: error.response?.data?.message || 'Clock out failed' };
                }
            },

            fetchHistory: async () => {
                set({ isLoading: true });
                try {
                    const { user } = useAuthStore.getState();
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const response = await axios.get(`${API_URL}/history`, config);
                    set({ history: response.data, isLoading: false });
                } catch (error) {
                    set({ isLoading: false, error: 'Failed to fetch history' });
                }
            },

            fetchStats: async () => {
                set({ isLoading: true });
                try {
                    const { user } = useAuthStore.getState();
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const response = await axios.get(`${API_URL}/stats`, config);
                    set({ stats: response.data, isLoading: false });
                } catch (error) {
                    set({ isLoading: false, error: 'Failed to fetch stats' });
                }
            },

            syncQueue: async () => {
                const { queue, removeFromQueue } = get();
                const { user } = useAuthStore.getState();
                if (queue.length === 0 || !user) return;

                console.log('Syncing queue...', queue.length);
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                for (const item of queue) {
                    try {
                        const url = item.type === 'clock-in' ? `${API_URL}/clock-in` : `${API_URL}/clock-out`;
                        await axios.post(url, item.payload, config);
                        removeFromQueue(item.timestamp);
                        console.log(`Synced ${item.type} for task ${item.payload.taskId}`);
                    } catch (error) {
                        console.error(`Failed to sync item ${item.timestamp}`, error);
                        if (error.response?.status === 400) {
                            removeFromQueue(item.timestamp);
                        }
                    }
                }
            }
        }),
        {
            name: 'attendance-storage',
            partialize: (state) => ({ queue: state.queue }),
        }
    )
);

window.addEventListener('online', () => {
    useAttendanceStore.getState().syncQueue();
});

export default useAttendanceStore;
