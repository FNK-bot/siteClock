import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Dialog = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info', // 'success', 'error', 'warning', 'info'
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    showCancel = false
}) => {
    if (!isOpen) return null;

    const iconConfig = {
        success: { Icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
        error: { Icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
        warning: { Icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
        info: { Icon: Info, color: 'text-blue-600', bg: 'bg-blue-100' },
    };

    const { Icon, color, bg } = iconConfig[type];

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 p-4 animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${bg}`}>
                            <Icon size={24} className={color} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 leading-relaxed">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    {showCancel && (
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-bold text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 rounded-xl px-6 py-3 font-bold text-white shadow-lg transition-all ${type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                                type === 'error' ? 'bg-red-600 hover:bg-red-700' :
                                    type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                        'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dialog;
