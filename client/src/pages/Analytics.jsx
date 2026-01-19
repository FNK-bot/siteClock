import { useState, useEffect } from 'react';
import { Clock, Users, TrendingUp, Activity } from 'lucide-react';
import useAnalyticsStore from '../store/useAnalyticsStore';
import StatsCard from '../components/StatsCard';
import WorkTimeChart from '../components/WorkTimeChart';
import WorkTimeTrendChart from '../components/WorkTimeTrendChart';
import TopPerformersLeaderboard from '../components/TopPerformersLeaderboard';

const Analytics = () => {
    const {
        workTimeData,
        topPerformers,
        attendanceStats,
        workTimeTrend,
        isLoading,
        error,
        fetchAllAnalytics,
    } = useAnalyticsStore();

    const [timeRange, setTimeRange] = useState('30'); // days

    useEffect(() => {
        fetchAllAnalytics({ period: timeRange, days: 7, limit: 10 });
    }, [timeRange, fetchAllAnalytics]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-semibold mb-2">Error Loading Analytics</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Analytics Dashboard</h1>
                        <p className="text-gray-500 mt-1">Employee performance and work time insights</p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        {[
                            { label: '7 Days', value: '7' },
                            { label: '30 Days', value: '30' },
                            { label: '90 Days', value: '90' },
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setTimeRange(option.value)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${timeRange === option.value
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard
                                title="Total Employees"
                                value={attendanceStats?.overview?.totalEmployees || 0}
                                subtitle={`${attendanceStats?.overview?.activeEmployees || 0} active`}
                                icon={Users}
                                color="blue"
                            />
                            <StatsCard
                                title="Total Hours"
                                value={`${attendanceStats?.overview?.totalHours?.toFixed(1) || 0}h`}
                                subtitle="Total work time"
                                icon={Clock}
                                color="green"
                            />
                            <StatsCard
                                title="Avg Hours/Employee"
                                value={`${attendanceStats?.overview?.avgHoursPerEmployee || 0}h`}
                                subtitle="Average per employee"
                                icon={TrendingUp}
                                color="purple"
                            />
                            <StatsCard
                                title="Total Attendance"
                                value={attendanceStats?.overview?.totalAttendance || 0}
                                subtitle="Clock-in sessions"
                                icon={Activity}
                                color="orange"
                            />
                        </div>

                        {/* Charts Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Work Time Chart */}
                            <WorkTimeChart data={workTimeData} />

                            {/* Work Time Trend */}
                            <WorkTimeTrendChart data={workTimeTrend} />
                        </div>

                        {/* Top Performers */}
                        <TopPerformersLeaderboard performers={topPerformers} />

                        {/* Daily Trend Table */}
                        {attendanceStats?.dailyTrend && attendanceStats.dailyTrend.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Daily Attendance Breakdown</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Attendance</th>
                                                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Unique Employees</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceStats.dailyTrend.map((day) => (
                                                <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                    <td className="py-3 px-4 font-semibold text-gray-700">{day.date}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                                            {day.attendanceCount}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                                            {day.uniqueEmployees}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Analytics;
