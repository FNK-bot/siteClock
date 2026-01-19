import { useEffect, useState } from 'react';
import { Users, Briefcase, Clock, TrendingUp } from 'lucide-react';
import useEmployeeStore from '../../store/useEmployeeStore';
import useTaskStore from '../../store/useTaskStore';
import axios from 'axios';
import useAuthStore from '../../store/useAuthStore';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color}`}>
                <Icon size={24} className="text-black" />
            </div>
        </div>
        <h3 className="text-3xl font-black text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
);

const Dashboard = () => {
    const { employees, fetchEmployees } = useEmployeeStore();
    const { tasks, fetchAdminTasks } = useTaskStore();
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        totalTasks: 0,
        completedTasks: 0,
        ongoingTasks: 0,
        pendingTasks: 0,
        todayAttendance: 0,
    });

    useEffect(() => {
        fetchEmployees();
        fetchAdminTasks();
    }, [fetchEmployees, fetchAdminTasks]);

    useEffect(() => {
        const activeEmp = employees.filter(e => e.isActive).length;
        const completed = tasks.filter(t => t.status === 'completed').length;
        const ongoing = tasks.filter(t => t.status === 'started').length;
        const pending = tasks.filter(t => t.status === 'pending').length;

        setStats({
            totalEmployees: employees.length,
            activeEmployees: activeEmp,
            totalTasks: tasks.length,
            completedTasks: completed,
            ongoingTasks: ongoing,
            pendingTasks: pending,
            todayAttendance: 0, // Could fetch from attendance API
        });
    }, [employees, tasks]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, {user?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={stats.totalEmployees}
                    subtitle={`${stats.activeEmployees} active`}
                    icon={Users}
                    color="bg-blue-100"
                />
                <StatCard
                    title="Total Tasks"
                    value={stats.totalTasks}
                    subtitle={`${stats.pendingTasks} pending`}
                    icon={Briefcase}
                    color="bg-primary"
                />
                <StatCard
                    title="Ongoing Tasks"
                    value={stats.ongoingTasks}
                    subtitle="Currently in progress"
                    icon={Clock}
                    color="bg-green-100"
                />
                <StatCard
                    title="Completed"
                    value={stats.completedTasks}
                    subtitle="All time"
                    icon={TrendingUp}
                    color="bg-purple-100"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Tasks</h2>
                <div className="space-y-3">
                    {tasks.slice(0, 5).map(task => (
                        <div key={task._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                            <div>
                                <h3 className="font-bold text-gray-900">{task.title}</h3>
                                <p className="text-sm text-gray-500">{task.employees?.length || 0} employees assigned</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg ${task.status === 'completed' ? 'bg-green-100 text-green-700' :
                                    task.status === 'started' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {task.status}
                            </span>
                        </div>
                    ))}
                    {tasks.length === 0 && (
                        <p className="text-center text-gray-400 py-8">No tasks yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
