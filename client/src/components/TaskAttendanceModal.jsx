import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import { X, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const TaskAttendanceModal = ({ task, onClose }) => {
    const { user } = useAuthStore();
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendance = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const response = await axios.get(
                `http://localhost:5000/api/tasks/${task._id}/attendance`,
                config
            );
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load attendance data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchAttendance, 30000);
        return () => clearInterval(interval);
    }, [task._id]);

    const formatTime = (dateString) => {
        if (!dateString) return '--';
        return format(new Date(dateString), 'HH:mm');
    };

    const formatWorkingTime = (minutes) => {
        if (minutes === 0) return '0m';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        return `${hours}h ${mins}m`;
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'working':
                return {
                    icon: Clock,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                    textColor: 'text-blue-700',
                    iconColor: 'text-blue-600',
                    label: 'Working',
                };
            case 'clocked-out':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                    textColor: 'text-green-700',
                    iconColor: 'text-green-600',
                    label: 'Completed',
                };
            case 'not-started':
                return {
                    icon: XCircle,
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-700',
                    iconColor: 'text-gray-400',
                    label: 'Not Started',
                };
            default:
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    textColor: 'text-gray-700',
                    iconColor: 'text-gray-400',
                    label: 'Unknown',
                };
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gradient-to-r from-primary to-yellow-300">
                    <div>
                        <h2 className="text-xl font-bold text-black">Task Attendance Status</h2>
                        <p className="text-sm text-gray-700 mt-1">{task.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchAttendance}
                            disabled={isLoading}
                            className="rounded-full p-2 hover:bg-black/10 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw size={20} className={`text-black ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 hover:bg-black/10 transition-colors"
                        >
                            <X size={20} className="text-black" />
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {data && (
                    <div className="p-6 bg-gray-50 border-b border-gray-200 grid grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-4 border border-gray-200">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Total</p>
                            <p className="text-2xl font-black text-gray-900">{data.summary.total}</p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Working</p>
                            <p className="text-2xl font-black text-blue-700">{data.summary.working}</p>
                        </div>
                        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                            <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-1">Completed</p>
                            <p className="text-2xl font-black text-green-700">{data.summary.completed}</p>
                        </div>
                        <div className="bg-gray-100 rounded-2xl p-4 border border-gray-300">
                            <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Not Started</p>
                            <p className="text-2xl font-black text-gray-700">{data.summary.notStarted}</p>
                        </div>
                    </div>
                )}

                {/* Employee List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading && (
                        <div className="flex items-center justify-center h-64">
                            <RefreshCw size={32} className="animate-spin text-gray-400" />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                            <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                            <p className="text-red-700 font-semibold">{error}</p>
                        </div>
                    )}

                    {data && !isLoading && (
                        <div className="space-y-3">
                            {data.employees.map(({ employee, status, clockInTime, clockOutTime, workingTime }) => {
                                const config = getStatusConfig(status);
                                const StatusIcon = config.icon;

                                return (
                                    <div
                                        key={employee._id}
                                        className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-4 transition-all`}
                                    >
                                        <div className="flex items-start justify-between">
                                            {/* Employee Info */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-black font-black text-lg flex-shrink-0">
                                                    {employee.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-900 truncate">{employee.name}</h4>
                                                    <p className="text-sm text-gray-600 font-mono">{employee.userId}</p>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${config.bgColor} border ${config.borderColor}`}>
                                                <StatusIcon size={18} className={config.iconColor} />
                                                <span className={`font-bold text-sm ${config.textColor}`}>{config.label}</span>
                                            </div>
                                        </div>

                                        {/* Time Details */}
                                        <div className="mt-4 grid grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Clock In</p>
                                                <p className={`text-sm font-bold ${clockInTime ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {formatTime(clockInTime)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Clock Out</p>
                                                <p className={`text-sm font-bold ${clockOutTime ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {formatTime(clockOutTime)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Working Time</p>
                                                <p className={`text-sm font-bold ${status === 'working' ? 'text-blue-600' : 'text-gray-900'}`}>
                                                    {formatWorkingTime(workingTime)}
                                                    {status === 'working' && (
                                                        <span className="ml-1 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {data.employees.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <p className="font-medium">No employees assigned to this task</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskAttendanceModal;
