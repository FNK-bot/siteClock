import { useState, useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import useAttendanceStore from '../store/useAttendanceStore';
import {
    LogOut,
    LayoutList,
    History as HistoryIcon,
    Clock,
    Home,
    Briefcase,
    Calendar,
    MapPin,
    UserCircle
} from 'lucide-react';
import axios from 'axios';
import TaskCard from '../components/TaskCard';
import { format } from 'date-fns';

const API_URL = 'http://localhost:5000/api/tasks';

const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${color}`}>
            <Icon size={24} className="text-black" />
        </div>
        <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-black text-gray-900">{value}</p>
        </div>
    </div>
);

const EmployeeDashboard = () => {
    const { user, logout } = useAuthStore();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home'); // 'home', 'tasks', 'history'
    const { history, stats, fetchHistory, fetchStats } = useAttendanceStore();

    const fetchMyTasks = async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const response = await axios.get(`${API_URL}/my`, config);
            setTasks(response.data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'home') {
            fetchStats();
        } else if (activeTab === 'tasks') {
            fetchMyTasks();
        } else if (activeTab === 'history') {
            fetchHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* App Bar */}
            <header className="bg-white px-5 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                        <Clock size={20} className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 leading-none">SITECLOCK</h1>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">Employee Portal</p>
                    </div>
                </div>
                <button onClick={logout} className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                    <LogOut size={20} className="text-red-500" />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-5 pb-24 overflow-y-auto">

                {/* VIEW: HOME / DASHBOARD */}
                {activeTab === 'home' && (
                    <div className="max-w-md mx-auto space-y-6">

                        {/* Profile Card */}
                        <div className="bg-black text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <UserCircle size={100} />
                            </div>
                            <div className="relative z-10">
                                <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center mb-4 text-black font-black text-2xl">
                                    {user?.name?.charAt(0)}
                                </div>
                                <h2 className="text-2xl font-bold mb-1">{user?.name}</h2>
                                <p className="text-gray-400 text-sm mb-4">{user?.email}</p>
                                <div className="inline-block bg-white/10 px-3 py-1 rounded-lg text-xs font-mono text-gray-300">
                                    ID: {user?._id?.slice(-6).toUpperCase()}
                                </div>
                            </div>
                        </div>

                        {/* Analytics Grid */}
                        <h3 className="text-lg font-bold text-gray-800 px-1">Overview</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <StatsCard
                                title="Hours Worked"
                                value={stats?.totalHours || '0'}
                                icon={Clock}
                                color="bg-primary"
                            />
                            <StatsCard
                                title="Completed"
                                value={stats?.completedTasks || '0'}
                                icon={Briefcase}
                                color="bg-green-100"
                            />
                            <StatsCard
                                title="Upcoming"
                                value={stats?.upcomingTasks || '0'}
                                icon={Calendar}
                                color="bg-blue-100"
                            />
                            <StatsCard
                                title="Days Active"
                                value={stats?.daysPresent || '0'}
                                icon={MapPin}
                                color="bg-purple-100"
                            />
                        </div>
                    </div>
                )}

                {/* VIEW: TASKS */}
                {activeTab === 'tasks' && (
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-black mb-6 text-gray-900 tracking-tight">Today's Tasks</h2>

                        {loading && <div className="text-center py-8 text-gray-500 font-medium">Loading tasks...</div>}

                        {!loading && tasks.length === 0 && (
                            <div className="text-center py-12 px-6 rounded-3xl bg-white shadow-sm border border-gray-100 mt-4">
                                <Clock size={48} className="mx-auto mb-4 text-gray-200" />
                                <p className="text-lg text-gray-800 font-bold">No tasks today</p>
                                <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
                            </div>
                        )}

                        <div className="space-y-5">
                            {tasks.map(task => (
                                <TaskCard
                                    key={task._id}
                                    task={task}
                                    onStatusChange={fetchMyTasks}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* VIEW: HISTORY */}
                {activeTab === 'history' && (
                    <div className="max-w-md mx-auto">
                        <h2 className="text-2xl font-black mb-6 text-gray-900 tracking-tight">Attendance Log</h2>
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            {history.length === 0 && <div className="p-10 text-center text-gray-400 font-medium">No history found.</div>}
                            {history.map((record, idx) => (
                                <div key={record._id} className={`p-5 ${idx !== history.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-base">{record.task?.title || 'Unknown Task'}</h3>
                                        <div className="text-right">
                                            <span className="block text-xs font-bold text-gray-400 uppercase">Date</span>
                                            <span className="text-sm font-bold text-gray-800">
                                                {format(new Date(record.clockInTime), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm mt-3 bg-gray-50 p-3 rounded-xl">
                                        <span className="text-green-700 font-bold flex flex-col">
                                            <span className="text-[10px] text-green-500 uppercase tracking-wider">Clock In</span>
                                            {format(new Date(record.clockInTime), 'h:mm a')}
                                        </span>
                                        {record.clockOutTime ? (
                                            <span className="text-red-700 font-bold flex flex-col items-end">
                                                <span className="text-[10px] text-red-500 uppercase tracking-wider">Clock Out</span>
                                                {format(new Date(record.clockOutTime), 'h:mm a')}
                                            </span>
                                        ) : (
                                            <span className="text-blue-600 font-black self-center bg-blue-100 px-3 py-1 rounded-lg">ACTIVE</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 pb-6 safe-area-pb shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-50">
                <button
                    onClick={() => setActiveTab('home')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all w-20 
                ${activeTab === 'home'
                            ? 'text-black font-bold'
                            : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Home size={24} strokeWidth={activeTab === 'home' ? 3 : 2} />
                    <span className="text-[10px] uppercase tracking-wide">Home</span>
                </button>

                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all w-20 
                ${activeTab === 'tasks'
                            ? 'text-black font-bold'
                            : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <div className="relative">
                        <LayoutList size={24} strokeWidth={activeTab === 'tasks' ? 3 : 2} />
                        {stats?.upcomingTasks > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></span>}
                    </div>
                    <span className="text-[10px] uppercase tracking-wide">Tasks</span>
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all w-20 
                ${activeTab === 'history'
                            ? 'text-black font-bold'
                            : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <HistoryIcon size={24} strokeWidth={activeTab === 'history' ? 3 : 2} />
                    <span className="text-[10px] uppercase tracking-wide">History</span>
                </button>
            </nav>
        </div>
    );
};

export default EmployeeDashboard;
