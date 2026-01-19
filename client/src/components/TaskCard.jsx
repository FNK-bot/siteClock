import { useState, useCallback } from 'react';
import useAttendanceStore from '../store/useAttendanceStore';
import { MapPin, Clock, LogOut } from 'lucide-react';

const TaskCard = ({ task, onStatusChange }) => {
    const { clockIn, clockOut, isLoading } = useAttendanceStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAction = async () => {
        setLoading(true);
        setError(null);

        let result;

        if (task.myAttendance?.status === 'clocked-in') {
            result = await clockOut(task._id);
        } else {
            result = await clockIn(task._id);
        }

        if (result.success) {
            if (onStatusChange) onStatusChange();
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const isClockedIn = task.myAttendance?.status === 'clocked-in';
    const isClockedOut = task.myAttendance?.status === 'clocked-out';

    if (isClockedOut) {
        // Don't show card if clocked out? OR show as completed.
        // Requirements say "See today's tasks", usually implies unfinished or review of finished.
        // Let's show it but disabled state.
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900 leading-tight">{task.title}</h3>
                {isClockedOut && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-bold uppercase tracking-wide">Done</span>}
                {isClockedIn && <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full font-bold uppercase tracking-wide flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>Active</span>}
            </div>

            <div className="flex items-center text-gray-500 mb-4 gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    <span>{task.startTime} - {task.endTime}</span>
                </div>
            </div>

            {error && <div className="mb-2 text-xs text-red-600 font-semibold">{error}</div>}

            {!isClockedOut && (
                <button
                    onClick={handleAction}
                    disabled={loading || isLoading}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2
                ${isClockedIn
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                            : 'bg-black text-white hover:bg-gray-800 shadow-sm'
                        } disabled:opacity-50 disabled:scale-100`}
                >
                    {loading ? 'Processing...' : (
                        <>
                            {isClockedIn ? 'Clock Out' : 'Clock In'}
                            {isClockedIn ? <LogOut size={16} /> : <MapPin size={16} />}
                        </>
                    )}
                </button>
            )}

            {isClockedOut && (
                <div className="text-center p-2 bg-gray-50 rounded-lg text-gray-400 text-xs font-bold uppercase tracking-wider">
                    Task Completed
                </div>
            )}
        </div>
    );
};

export default TaskCard;
