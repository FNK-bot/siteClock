import { useState, useEffect } from 'react';
import useEmployeeStore from '../store/useEmployeeStore';
import useTaskStore from '../store/useTaskStore';
import { X, Check, Search } from 'lucide-react';
import { format } from 'date-fns';

const CreateTaskModal = ({ onClose, selectedDate }) => {
    const { employees, fetchEmployees } = useEmployeeStore();
    const { createTask, isLoading, error: taskError } = useTaskStore();

    const [formData, setFormData] = useState({
        title: '',
        date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
        startTime: '08:00',
        endTime: '17:00',
        employees: [],
    });

    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const availableEmployees = employees.filter(emp =>
        emp.isActive &&
        !formData.employees.includes(emp._id) &&
        (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.phone?.includes(searchTerm))
    );

    const selectedEmployeesList = employees.filter(emp =>
        formData.employees.includes(emp._id)
    );

    const addEmployee = (employeeId) => {
        setFormData(prev => ({
            ...prev,
            employees: [...prev.employees, employeeId]
        }));
        setSearchTerm('');
        setShowDropdown(false);
    };

    const removeEmployee = (employeeId) => {
        setFormData(prev => ({
            ...prev,
            employees: prev.employees.filter(id => id !== employeeId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.employees.length === 0) {
            setError('Please select at least one employee');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            setError('Start time must be before end time');
            return;
        }

        const success = await createTask(formData);
        if (success) {
            onClose();
        } else if (taskError) {
            setError(taskError);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gradient-to-r from-primary to-yellow-300">
                    <h2 className="text-xl font-bold text-black">Create New Task</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-black/10 transition-colors">
                        <X size={24} className="text-black" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {error && <div className="mb-4 bg-red-50 border border-red-200 p-3 text-red-700 rounded-xl text-sm font-semibold">{error}</div>}

                    <form id="create-task-form" onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-800">Task Title</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Site A Foundation Work"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-800">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-800">Start Time</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-bold text-gray-800">End Time</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-800">Assign Employees</label>

                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search employees by name, ID, or phone..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />

                                {showDropdown && searchTerm && availableEmployees.length > 0 && (
                                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                        {availableEmployees.map(emp => (
                                            <div
                                                key={emp._id}
                                                onClick={() => addEmployee(emp._id)}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0"
                                            >
                                                <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-black font-black text-sm flex-shrink-0">
                                                    {emp.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-gray-900 truncate">{emp.name}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{emp.userId}</p>
                                                </div>
                                                <Check size={18} className="text-primary flex-shrink-0" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[48px] p-3 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                {selectedEmployeesList.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic self-center">No employees selected yet</p>
                                ) : (
                                    selectedEmployeesList.map(emp => (
                                        <div
                                            key={emp._id}
                                            className="inline-flex items-center gap-2 bg-primary text-black px-3 py-2 rounded-xl font-bold text-sm shadow-sm"
                                        >
                                            <div className="h-6 w-6 bg-black rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0">
                                                {emp.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="truncate max-w-[150px]">{emp.name}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeEmployee(emp._id)}
                                                className="hover:bg-black/10 rounded-full p-0.5 transition-colors flex-shrink-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                {selectedEmployeesList.length} employee(s) selected
                            </p>
                        </div>
                    </form>
                </div>

                <div className="border-t border-gray-100 p-6 bg-gray-50">
                    <button
                        type="submit"
                        form="create-task-form"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-primary py-4 font-bold text-black text-lg shadow-lg hover:bg-primary-hover active:scale-95 transition-transform disabled:opacity-50"
                    >
                        {isLoading ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateTaskModal;
