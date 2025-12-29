import React from 'react';
import { useToast } from '../context/ToastContext';

const Toast = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div
            className="toast-container position-fixed top-0 end-0 p-3"
            style={{ zIndex: 1100 }}
        >
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`toast show align-items-center text-bg-${toast.type} border-0`}
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div className="d-flex">
                        <div className="toast-body d-flex align-items-center gap-2">
                            {toast.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
                            {toast.type === 'danger' && <i className="bi bi-x-circle-fill"></i>}
                            {toast.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
                            {toast.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
                            {toast.message}
                        </div>
                        <button
                            type="button"
                            className="btn-close btn-close-white me-2 m-auto"
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close"
                        ></button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Toast;
