import { describe, it, expect, beforeEach, vi } from 'vitest';
import useAnalyticsStore from '../../store/useAnalyticsStore';

describe('useAnalyticsStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useAnalyticsStore.setState({
            workTimeData: [],
            topPerformers: [],
            attendanceStats: null,
            workTimeTrend: [],
            isLoading: false,
            error: null,
        });
    });

    describe('Initial State', () => {
        it('should have correct initial state', () => {
            const state = useAnalyticsStore.getState();

            expect(state.workTimeData).toEqual([]);
            expect(state.topPerformers).toEqual([]);
            expect(state.attendanceStats).toBeNull();
            expect(state.workTimeTrend).toEqual([]);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('State Management', () => {
        it('should update workTimeData when set', () => {
            const mockData = [{ employee: { name: 'John' }, totalHours: 40 }];

            useAnalyticsStore.setState({ workTimeData: mockData });

            const state = useAnalyticsStore.getState();
            expect(state.workTimeData).toEqual(mockData);
        });

        it('should update topPerformers when set', () => {
            const mockPerformers = [
                { rank: 1, employee: { name: 'Alice' }, performanceScore: 500 }
            ];

            useAnalyticsStore.setState({ topPerformers: mockPerformers });

            const state = useAnalyticsStore.getState();
            expect(state.topPerformers).toEqual(mockPerformers);
        });

        it('should update attendanceStats when set', () => {
            const mockStats = {
                overview: { totalEmployees: 10, totalHours: 400 },
                dailyTrend: []
            };

            useAnalyticsStore.setState({ attendanceStats: mockStats });

            const state = useAnalyticsStore.getState();
            expect(state.attendanceStats).toEqual(mockStats);
        });

        it('should update workTimeTrend when set', () => {
            const mockTrend = [{ date: '2024-01-01', totalHours: 40 }];

            useAnalyticsStore.setState({ workTimeTrend: mockTrend });

            const state = useAnalyticsStore.getState();
            expect(state.workTimeTrend).toEqual(mockTrend);
        });

        it('should update isLoading state', () => {
            useAnalyticsStore.setState({ isLoading: true });
            expect(useAnalyticsStore.getState().isLoading).toBe(true);

            useAnalyticsStore.setState({ isLoading: false });
            expect(useAnalyticsStore.getState().isLoading).toBe(false);
        });

        it('should update error state', () => {
            const errorMessage = 'Test error';

            useAnalyticsStore.setState({ error: errorMessage });

            const state = useAnalyticsStore.getState();
            expect(state.error).toBe(errorMessage);
        });
    });

    describe('clearAnalytics', () => {
        it('should clear all analytics data', () => {
            // Set some data first
            useAnalyticsStore.setState({
                workTimeData: [{ test: 'data' }], topPerformers: [{ test: 'performer' }],
                attendanceStats: { test: 'stats' },
                workTimeTrend: [{ test: 'trend' }],
                error: 'Some error'
            });

            // Clear analytics
            useAnalyticsStore.getState().clearAnalytics();

            const state = useAnalyticsStore.getState();
            expect(state.workTimeData).toEqual([]);
            expect(state.topPerformers).toEqual([]);
            expect(state.attendanceStats).toBeNull();
            expect(state.workTimeTrend).toEqual([]);
            expect(state.error).toBeNull();
        });

        it('should preserve other state properties', () => {
            useAnalyticsStore.setState({
                workTimeData: [{ test: 'data' }],
                isLoading: false
            });

            useAnalyticsStore.getState().clearAnalytics();

            // isLoading should remain unchanged
            expect(useAnalyticsStore.getState().isLoading).toBe(false);
        });
    });

    describe('Store Functions', () => {
        it('should have all required fetch functions', () => {
            const state = useAnalyticsStore.getState();

            expect(typeof state.fetchWorkTime).toBe('function');
            expect(typeof state.fetchTopPerformers).toBe('function');
            expect(typeof state.fetchAttendanceStats).toBe('function');
            expect(typeof state.fetchWorkTimeTrend).toBe('function');
            expect(typeof state.fetchAllAnalytics).toBe('function');
            expect(typeof state.clearAnalytics).toBe('function');
        });
    });
});
