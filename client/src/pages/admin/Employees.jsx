import { useState, useEffect } from 'react';
import useEmployeeStore from '../../store/useEmployeeStore';
import useToastStore from '../../store/useToastStore';
import AddEmployeeModal from '../../components/AddEmployeeModal';
import EditEmployeeModal from '../../components/EditEmployeeModal';
import Dialog from '../../components/Dialog';
import { Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const Employees = () => {
    const { employees, fetchEmployees, deleteEmployee } = useEmployeeStore();
    const { success, error: showError } = useToastStore();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [deletingEmployee, setDeletingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.phone?.includes(searchTerm)
    );

    const handleDelete = async () => {
        if (!deletingEmployee) return;

        const result = await deleteEmployee(deletingEmployee._id);
        if (result.success) {
            success(`Employee ${deletingEmployee.name} has been deactivated`);
            setDeletingEmployee(null);
        } else {
            showError(result.message || 'Failed to deactivate employee');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Employee Management</h1>
                    <p className="text-gray-500">{employees.length} total employees, {employees.filter(e => e.isActive).length} active</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 hover:shadow-xl transform active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    <span>Add Employee</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, user ID, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Employee</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredEmployees.map(employee => (
                                <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                                                {employee.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-gray-900">{employee.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-mono text-sm text-gray-600">{employee.userId}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{employee.phone || 'N/A'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600 truncate max-w-[200px] block">{employee.email || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {employee.isActive ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                <CheckCircle size={14} />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                                <XCircle size={14} />
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingEmployee(employee)}
                                                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => setDeletingEmployee(employee)}
                                                disabled={!employee.isActive}
                                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Deactivate"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile List */}
                <div className="md:hidden divide-y divide-gray-100">
                    {filteredEmployees.map(employee => (
                        <div key={employee._id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-black font-black flex-shrink-0">
                                        {employee.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 truncate">{employee.name}</h3>
                                        <p className="text-xs font-mono text-gray-500">{employee.userId}</p>
                                    </div>
                                </div>
                                {employee.isActive ? (
                                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                ) : (
                                    <XCircle size={20} className="text-red-500 flex-shrink-0" />
                                )}
                            </div>

                            <div className="space-y-2 mb-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-500 font-medium">Phone:</span>
                                    <span className="text-gray-900 font-semibold">{employee.phone || 'N/A'}</span>
                                </div>
                                {employee.email && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500 font-medium">Email:</span>
                                        <span className="text-gray-900 text-xs truncate max-w-[60%]">{employee.email}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingEmployee(employee)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    <Edit2 size={16} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => setDeletingEmployee(employee)}
                                    disabled={!employee.isActive}
                                    className="px-4 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredEmployees.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                            <Search size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                            {searchTerm ? 'No employees found matching your search' : 'No employees yet. Add your first employee to get started.'}
                        </p>
                    </div>
                )}
            </div>

            {showAddModal && (
                <AddEmployeeModal onClose={() => setShowAddModal(false)} />
            )}

            {editingEmployee && (
                <EditEmployeeModal
                    employee={editingEmployee}
                    onClose={() => setEditingEmployee(null)}
                />
            )}

            {deletingEmployee && (
                <Dialog
                    isOpen={true}
                    onClose={() => setDeletingEmployee(null)}
                    title="Deactivate Employee"
                    message={`Are you sure you want to deactivate ${deletingEmployee.name}? They will no longer be able to access the system.`}
                    type="warning"
                    confirmText="Deactivate"
                    cancelText="Cancel"
                    showCancel={true}
                    onConfirm={handleDelete}
                />
            )}
        </div>
    );
};

export default Employees;
