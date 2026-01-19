import { useState } from 'react';
import useEmployeeStore from '../store/useEmployeeStore';
import useToastStore from '../store/useToastStore';
import { X } from 'lucide-react';

const AddEmployeeModal = ({ onClose }) => {
    const createEmployee = useEmployeeStore((state) => state.createEmployee);
    const isLoading = useEmployeeStore((state) => state.isLoading);
    const { success, error: showError } = useToastStore();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await createEmployee(formData);
        if (result.success) {
            success(`Employee ${formData.name} created successfully with ID: ${result.employee.userId}`);
            onClose();
        } else {
            showError(result.message || 'Failed to create employee');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20 p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-gradient-to-r from-primary to-yellow-300">
                    <h2 className="text-xl font-bold text-black">Add New Employee</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-black/10 transition-colors">
                        <X size={20} className="text-black" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Full Name *</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Phone Number (Optional)</label>
                            <input
                                type="tel"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+974 1234 5678"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">Temporary Password *</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Minimum 6 characters"
                                minLength={6}
                            />
                            <p className="mt-2 text-xs text-gray-500">A unique User ID will be auto-generated for login</p>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full rounded-xl bg-primary py-3 font-bold text-black shadow-lg hover:bg-primary-hover disabled:opacity-50 transition-all"
                            >
                                {isLoading ? 'Creating...' : 'Create Employee'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
