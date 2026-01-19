import { useState, useEffect } from 'react';
import useTaskStore from '../../store/useTaskStore';
import CreateTaskModal from '../../components/CreateTaskModal';
import ManageTaskEmployees from '../../components/ManageTaskEmployees';
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
import { ChevronLeft, ChevronRight, Plus, Clock, UserPlus } from 'lucide-react';

const Tasks = () => {
    const { tasks, fetchAdminTasks, isLoading } = useTaskStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [managingTask, setManagingTask] = useState(null);

    useEffect(() => {
        fetchAdminTasks();
    }, [fetchAdminTasks]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Task Management</h1>
                    <p className="text-gray-500">Schedule and manage site tasks</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 hover:shadow-xl transform active:scale-95 transition-all w-full md:w-auto"
                >
                    <Plus size={20} />
                    <span>New Task</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-4">
                        <div className="flex items-center justify-between p-4">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronLeft size={24} className="text-gray-600" />
                            </button>
                            <h2 className="text-lg font-bold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h2>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronRight size={24} className="text-gray-600" />
                            </button>
                        </div>

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
                                        className={`h-16 rounded-2xl relative cursor-pointer transition-all border ${isSelected
                                            ? 'bg-primary border-primary shadow-lg scale-105 z-10'
                                            : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                                            }`}
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
                </div>

                {/* Task List */}
                <div className="lg:col-span-1">
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
                            {isLoading && <p className="text-center text-gray-500 py-4">Loading...</p>}

                            {!isLoading && selectedDateTasks.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 text-center">
                                    <Clock size={48} className="mb-4 opacity-20" />
                                    <p className="font-medium">No tasks scheduled</p>
                                </div>
                            )}

                            {selectedDateTasks.map(task => (
                                <div key={task._id} className="border border-gray-100 rounded-2xl p-4 hover:shadow-lg transition-all hover:border-primary/30 bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-lg text-gray-900 leading-tight">{task.title}</h4>
                                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            task.status === 'started' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Clock size={14} />
                                            {task.startTime} - {task.endTime}
                                        </div>
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
            </div>

            {showCreateModal && (
                <CreateTaskModal
                    selectedDate={selectedDate}
                    onClose={() => setShowCreateModal(false)}
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

export default Tasks;
