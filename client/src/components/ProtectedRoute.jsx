import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated, isInitialized } = useAuthStore();

    // Show loading while checking localStorage
    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                    <p className="mt-4 text-gray-600 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />; // Or unauthorized page
    }

    return <Outlet />;
};

export default ProtectedRoute;
