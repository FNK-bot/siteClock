import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import useToastStore from '../store/useToastStore';

const Toast = ({ id, type, message, duration }) => {
    const removeToast = useToastStore((state) => state.removeToast);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (duration > 0) {
            const interval = 50; // Update every 50ms
            const decrement = (100 * interval) / duration;

            const timer = setInterval(() => {
                setProgress((prev) => {
                    const newProgress = prev - decrement;
                    if (newProgress <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    return newProgress;
                });
            }, interval);

            return () => clearInterval(timer);
        }
    }, [duration]);

    const config = {
        success: {
            Icon: CheckCircle,
            bgClass: 'bg-green-50 border-green-200',
            iconClass: 'text-green-600',
            textClass: 'text-green-800',
            progressClass: 'bg-green-500',
        },
        error: {
            Icon: AlertCircle,
            bgClass: 'bg-red-50 border-red-200',
            iconClass: 'text-red-600',
            textClass: 'text-red-800',
            progressClass: 'bg-red-500',
        },
        warning: {
            Icon: AlertTriangle,
            bgClass: 'bg-yellow-50 border-yellow-200',
            iconClass: 'text-yellow-600',
            textClass: 'text-yellow-800',
            progressClass: 'bg-yellow-500',
        },
        info: {
            Icon: Info,
            bgClass: 'bg-blue-50 border-blue-200',
            iconClass: 'text-blue-600',
            textClass: 'text-blue-800',
            progressClass: 'bg-blue-500',
        },
    };

    const { Icon, bgClass, iconClass, textClass, progressClass } = config[type] || config.info;

    return (
        <div className={`rounded-2xl border-2 ${bgClass} shadow-lg animate-in slide-in-from-right duration-300 overflow-hidden`}>
            <div className="flex items-center gap-3 p-4">
                <Icon size={20} className={iconClass} />
                <p className={`flex-1 font-semibold text-sm ${textClass}`}>{message}</p>
                <button
                    onClick={() => removeToast(id)}
                    className="rounded-full p-1 hover:bg-black/10 transition-colors"
                >
                    <X size={16} className={iconClass} />
                </button>
            </div>
            {duration > 0 && (
                <div className="h-1 bg-black/10">
                    <div
                        className={`h-full ${progressClass} transition-all duration-50 ease-linear`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
};

const ToastContainer = () => {
    const toasts = useToastStore((state) => state.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
            <div className="pointer-events-auto space-y-3">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} />
                ))}
            </div>
        </div>
    );
};

export default ToastContainer;
