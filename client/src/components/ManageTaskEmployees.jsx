import { useState, useEffect } from 'react';
import useEmployeeStore from '../store/useEmployeeStore';
import useAuthStore from '../store/useAuthStore';
import useToastStore from '../store/useToastStore';
import { X, UserPlus, Search } from 'lucide-react';
import axios from 'axios';

const ManageTaskEmployees = ({ task, onClose, onUpdate }) => {
    const { employees, fetchEmployees } = useEmployeeStore();
    const { user } = useAuthStore();
    const { success, error: showError } = useToastStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Filter available employees (not already assigned)
    const availableEmployees = employees.filter(emp =>
        emp.isActive &&
        !task.employees.some(taskEmp => taskEmp._id === emp._id) &&
        (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.userId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleEmployee = (employee) => {
        if (selectedEmployees.some(e => e._id === employee._id)) {
            setSelectedEmployees(selectedEmployees.filter(e => e._id !== employee._id));
        } else {
            setSelectedEmployees([...selectedEmployees, employee]);
        }
    };

    const handleAddEmployees = async () => {
        if (selectedEmployees.length === 0) {
            showError('Please select at least one employee');
            return;
        }

        setIsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const employeeIds = selectedEmployees.map(e => e._id);
            const response = await axios.put(
                `http://localhost:5000/api/tasks/${task._id}/employees/add`,
                { employeeIds },
                config
            );

            success(`${selectedEmployees.length} employee(s) added to task`);
            setSelectedEmployees([]);
            setSearchTerm('');
            if (onUpdate) onUpdate(response.data);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to add employees');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveEmployee = async (employeeId) => {
        setIsLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            const response = await axios.put(
                `http://localhost:5000/api/tasks/${task._id}/employees/remove`,
                { employeeId },
                config
            );

            success('Employee removed from task');
            if (onUpdate) onUpdate(response.data);
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to remove employee');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gradient-to-r from-primary to-yellow-300">
                    <div>
                        <h2 className="text-xl font-bold text-black">Manage Task Employees</h2>
                        <p className="text-sm text-gray-700 mt-1">{task.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-black/10 transition-colors"
                    >
                        <X size={20} className="text-black" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Currently Assigned Employees */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            Assigned Employees ({task.employees.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {task.employees.map(employee => (
                                <div
                                    key={employee._id}
                                    className="flex items-center gap-2 bg-primary px-3 py-2 rounded-xl text-sm font-semibold text-black"
                                >
                                    <span>{employee.name}</span>
                                    <span className="text-xs opacity-70">({employee.userId})</span>
                                    <button
                                        onClick={() => handleRemoveEmployee(employee._id)}
                                        disabled={isLoading || task.employees.length === 1}
                                        className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={task.employees.length === 1 ? "Cannot remove last employee" : "Remove"}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Search & Add Employees */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                            Add Employees
                        </h3>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by name or user ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                        </div>

                        {/* Selected Employees Chips */}
                        {selectedEmployees.length > 0 && (
                            <div className="mb-4">
                                <p className="text-xs text-gray-500 font-semibold mb-2">Selected ({selectedEmployees.length}):</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedEmployees.map(employee => (
                                        <div
                                            key={employee._id}
                                            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold"
                                        >
                                            <span>{employee.name}</span>
                                            <button
                                                onClick={() => toggleEmployee(employee)}
                                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available Employees List */}
                        <div className="border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="max-h-60 overflow-y-auto">
                                {availableEmployees.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <UserPlus size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="font-medium">
                                            {searchTerm ? 'No employees found' : 'All employees are already assigned'}
                                        </p>
                                    </div>
                                ) : (
                                    availableEmployees.map(employee => {
                                        const isSelected = selectedEmployees.some(e => e._id === employee._id);
                                        return (
                                            <div
                                                key={employee._id}
                                                onClick={() => toggleEmployee(employee)}
                                                className={`flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-50 hover:bg-blue-100'
                                                        : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-black font-black text-sm">
                                                        {employee.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{employee.name}</p>
                                                        <p className="text-xs text-gray-500 font-mono">{employee.userId}</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }}
                                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                                />
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Add Button */}
                        {selectedEmployees.length > 0 && (
                            <button
                                onClick={handleAddEmployees}
                                disabled={isLoading}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-2xl shadow-lg hover:bg-gray-800 hover:shadow-xl transform active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                <UserPlus size={20} />
                                <span>{isLoading ? 'Adding...' : `Add ${selectedEmployees.length} Employee(s)`}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageTaskEmployees;
