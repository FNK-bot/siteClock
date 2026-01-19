import { useState, useEffect } from 'react';
import useTaskStore from '../store/useTaskStore';
import useAuthStore from '../store/useAuthStore';
import CreateTaskModal from '../components/CreateTaskModal';
import AddEmployeeModal from '../components/AddEmployeeModal';
import ManageTaskEmployees from '../components/ManageTaskEmployees';
import TaskAttendanceModal from '../components/TaskAttendanceModal';
import Analytics from './Analytics';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    addMonths,
    subMonths,
    parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Users, LogOut, Clock, BarChart3, UserPlus } from 'lucide-react';

const AdminDashboard = () => {
    const { tasks, fetchAdminTasks, isLoading } = useTaskStore();
    const logout = useAuthStore((state) => state.logout);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [managingTask, setManagingTask] = useState(null);
    const [viewingTaskAttendance, setViewingTaskAttendance] = useState(null);
    const [activeView, setActiveView] = useState('tasks'); // 'tasks' or 'analytics'

    useEffect(() => {
        fetchAdminTasks();
    }, [fetchAdminTasks]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Group tasks by date string (YYYY-MM-DD) for easier lookup
    const tasksByDate = tasks.reduce((acc, task) => {
        const dateStr = format(parseISO(task.date), 'yyyy-MM-dd');
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(task);
        return acc;
    }, {});

    const selectedDateTasks = tasks.filter(task =>
        isSameDay(parseISO(task.date), selectedDate)
    );

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Header */}
            <header className="bg-white px-6 py-4 shadow-sm sticky top-0 z-10 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-xl">
                            <Clock size={20} className="text-black" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-none">SiteClock</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Admin Panel</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={logout}
                            className="p-3 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-red-500"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setActiveView('tasks')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'tasks'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <Clock size={18} />
                        Tasks & Calendar
                    </button>
                    <button
                        onClick={() => setActiveView('analytics')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${activeView === 'analytics'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        <BarChart3 size={18} />
                        Analytics
                    </button>
                </div>
            </header>


            {/* Main Content */}
            {activeView === 'tasks' ? (
                <main className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-8">

                    {/* Calendar Section */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-2">
                            {/* Calendar Header */}
                            <div className="flex items-center justify-between p-4">
                                <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ChevronLeft size={24} className="text-gray-600" />
                                </button>
                                <h2 className="text-lg font-bold text-gray-800">
                                    {format(currentMonth, 'MMMM yyyy')}
                                </h2>
                                <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <ChevronRight size={24} className="text-gray-600" />
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="py-2">{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 text-sm gap-1">
                                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-16 rounded-lg" />
                                ))}

                                {daysInMonth.map(day => {
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const dayTasks = tasksByDate[dateStr] || [];
                                    const isSelected = isSameDay(day, selectedDate);
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <div
                                            key={day.toString()}
                                            onClick={() => setSelectedDate(day)}
                                            className={`
                                        h-16 rounded-2xl relative cursor-pointer transition-all border
                                        ${isSelected
                                                    ? 'bg-primary border-primary shadow-lg scale-105 z-10'
                                                    : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                                                }
                                    `}
                                        >
                                            <span className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full font-bold text-sm ${isSelected ? 'bg-black text-white' : isToday ? 'bg-gray-900 text-white' : 'text-gray-700'
                                                }`}>
                                                {format(day, 'd')}
                                            </span>
                                            <div className="absolute bottom-2 right-2 flex gap-1">
                                                {dayTasks.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {dayTasks.some(t => t.status === 'pending') && <span className="h-2 w-2 rounded-full bg-yellow-400 border border-white"></span>}
                                                        {dayTasks.some(t => t.status === 'started') && <span className="h-2 w-2 rounded-full bg-blue-500 border border-white"></span>}
                                                        {dayTasks.some(t => t.status === 'completed') && <span className="h-2 w-2 rounded-full bg-green-500 border border-white"></span>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowEmployeeModal(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-800 font-bold rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
                            >
                                <div className="bg-gray-100 p-2 rounded-full">
                                    <Users size={20} />
                                </div>
                                <span>Staff</span>
                            </button>

                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 hover:shadow-xl transform active:scale-95 transition-all"
                            >
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Plus size={20} />
                                </div>
                                <span>New Task</span>
                            </button>
                        </div>
                    </div>

                    {/* Task List Section */}
                    <div className="w-full md:w-[420px]">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                    <span className="bg-primary/20 text-black px-2 py-1 rounded-md text-sm">
                                        {format(selectedDate, 'MMM d')}
                                    </span>
                                    Tasks
                                </h3>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {isLoading && <p className="text-center text-gray-500 py-4">Loading tasks...</p>}

                                {!isLoading && selectedDateTasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 text-center">
                                        <Clock size={48} className="mb-4 opacity-20" />
                                        <p className="font-medium">No tasks scheduled.</p>
                                        <p className="text-sm mt-1">Tap "New Task" to create one.</p>
                                    </div>
                                )}

                                {selectedDateTasks.map(task => (
                                    <div key={task._id} className="group border border-gray-100 rounded-2xl p-4 hover:shadow-lg transition-all hover:border-primary/30 bg-white">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-lg text-gray-900 leading-tight">{task.title}</h4>
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                task.status === 'started' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {task.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Clock size={14} />
                                                {task.startTime} - {task.endTime}
                                            </div>
                                            <button
                                                onClick={() => setViewingTaskAttendance(task)}
                                                className="text-xs font-bold text-gray-500 hover:text-black hover:underline underline-offset-4 transition-all"
                                            >
                                                View Status
                                            </button>
                                        </div>

                                        <div className="pt-3 border-t border-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned Staff</p>
                                                <button
                                                    onClick={() => setManagingTask(task)}
                                                    className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                                                >
                                                    <UserPlus size={14} />
                                                    <span>Manage</span>
                                                </button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {task.employees.map(emp => (
                                                    <span key={emp._id} className="text-xs bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full text-gray-600 font-medium">
                                                        {emp.name}
                                                    </span>
                                                ))}
                                                {task.employees.length === 0 && <span className="text-xs text-gray-400 italic">No staff assigned</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </main>
            ) : (
                <Analytics />
            )}

            {showCreateModal && (
                <CreateTaskModal
                    selectedDate={selectedDate}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {showEmployeeModal && (
                <AddEmployeeModal
                    onClose={() => setShowEmployeeModal(false)}
                />
            )}

            {managingTask && (
                <ManageTaskEmployees
                    task={managingTask}
                    onClose={() => setManagingTask(null)}
                    onUpdate={(updatedTask) => {
                        fetchAdminTasks();
                        setManagingTask(updatedTask);
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;
