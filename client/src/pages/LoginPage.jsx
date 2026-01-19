import { useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Clock } from 'lucide-react';

const LoginPage = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(identifier, password);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <div className="w-full max-w-sm rounded-3xl bg-white p-10 shadow-xl border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-primary p-4 rounded-2xl mb-4 shadow-sm">
                        <Clock size={40} className="text-black" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">SiteClock</h1>
                    <p className="text-gray-500 font-medium">Welcome back!</p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl bg-red-100 p-4 text-red-700 text-sm font-semibold text-center border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-800">User ID or Email</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            placeholder="EMP123456 or admin@siteclock.com"
                            required
                        />
                        <p className="mt-2 text-xs text-gray-500">Enter your User ID (for employees) or email (for admin)</p>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-bold text-gray-800">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium pr-12"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-primary py-4 font-bold text-black text-lg shadow-lg hover:shadow-xl hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
