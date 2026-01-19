import { create } from 'zustand';

// Toast store for managing notifications
const useToastStore = create((set, get) => ({
    toasts: [],

    addToast: (toast) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            type: 'info', // 'success', 'error', 'warning', 'info'
            message: '',
            duration: 4000, // 4 seconds default
            ...toast,
        };

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));

        // Auto remove after duration
        if (newToast.duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, newToast.duration);
        }

        return id;
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },

    // Helper methods
    success: (message, duration) => {
        return get().addToast({ type: 'success', message, duration });
    },

    error: (message, duration) => {
        return get().addToast({ type: 'error', message, duration });
    },

    warning: (message, duration) => {
        return get().addToast({ type: 'warning', message, duration });
    },

    info: (message, duration) => {
        return get().addToast({ type: 'info', message, duration });
    },
}));

export default useToastStore;
