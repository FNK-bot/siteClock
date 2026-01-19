import { Outlet, NavLink } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { Clock, LogOut, LayoutDashboard, Briefcase, Users } from 'lucide-react';

const AdminLayout = () => {
    const logout = useAuthStore((state) => state.logout);

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { path: '/admin/tasks', label: 'Tasks', icon: Briefcase },
        { path: '/admin/employees', label: 'Employees', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-xl">
                            <Clock size={24} className="text-black" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-none">SiteClock</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Admin</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                                    ? 'bg-black text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl font-bold text-red-600 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
