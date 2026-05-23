import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

let id = 0;

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3500) => {
        const toastId = ++id;
        setToasts(prev => [...prev, { id: toastId, message, type, leaving: false }]);
        setTimeout(() => {
            setToasts(prev => prev.map(t => t.id === toastId ? { ...t, leaving: true } : t));
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 320);
        }, duration);
    }, []);

    const dismiss = (toastId) => {
        setToasts(prev => prev.map(t => t.id === toastId ? { ...t, leaving: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toastId)), 320);
    };

    const toast = {
        success: (msg, d) => addToast(msg, 'success', d),
        error:   (msg, d) => addToast(msg, 'error', d),
        info:    (msg, d) => addToast(msg, 'info', d),
    };

    const icons = { success: CheckCircle, error: XCircle, info: Info };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                {toasts.map(t => {
                    const Icon = icons[t.type];
                    return (
                        <div key={t.id} className={`toast toast-${t.type} ${t.leaving ? 'leaving' : ''}`}>
                            <Icon size={18} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{t.message}</span>
                            <button
                                onClick={() => dismiss(t.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7, padding: 2, display: 'flex' }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
