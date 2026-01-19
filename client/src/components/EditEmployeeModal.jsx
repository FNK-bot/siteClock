import { useState } from 'react';
import useEmployeeStore from '../store/useEmployeeStore';
import useToastStore from '../store/useToastStore';
import { X } from 'lucide-react';

const EditEmployeeModal = ({ employee, onClose }) => {
    const updateEmployee = useEmployeeStore((state) => state.updateEmployee);
    const isLoading = useEmployeeStore((state) => state.isLoading);
    const { success, error: showError } = useToastStore();

    const [formData, setFormData] = useState({
        name: employee.name || '',
        phone: employee.phone || '',
        email: employee.email || '',
        isActive: employee.isActive !== false,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await updateEmployee(employee._id, formData);
        if (result.success) {
            success(`Employee ${formData.name} updated successfully`);
            onClose();
        } else {
            showError(result.message || 'Failed to update employee');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gradient-to-r from-primary to-yellow-300">
                    <h2 className="text-xl font-bold text-black">Edit Employee</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-black/10 transition-colors">
                        <X size={20} className="text-black" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">User ID</p>
                        <p className="text-sm font-mono font-bold text-gray-900">{employee.userId}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Full Name</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                            />
                            <label htmlFor="isActive" className="text-sm font-bold text-gray-700">
                                Active Employee
                            </label>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl bg-primary py-3 font-bold text-black shadow-lg hover:bg-primary-hover disabled:opacity-50 transition-all"
                            >
                                {isLoading ? 'Updating...' : 'Update Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
