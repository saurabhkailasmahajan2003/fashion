import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timeouts = useRef({});

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((i) => i.id !== id));
    if (timeouts.current[id]) {
      clearTimeout(timeouts.current[id]);
      delete timeouts.current[id];
    }
  }, []);

  const push = useCallback((toast) => {
    const id = ++idCounter;
    const payload = { id, variant: 'info', duration: 3000, ...toast };
    setToasts((t) => [...t, payload]);
    timeouts.current[id] = setTimeout(() => remove(id), payload.duration);
    return id;
  }, [remove]);

  const value = useMemo(() => ({ push, remove }), [push, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container */}
      <div className="pointer-events-none fixed top-4 right-4 z-[1000] flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ toast, onClose }) {
  const { title, description, variant = 'info' } = toast;
  const styles = {
    success: 'bg-emerald-600 text-white border-emerald-700',
    error: 'bg-red-600 text-white border-red-700',
    info: 'bg-gray-900 text-white border-gray-800',
    warning: 'bg-amber-500 text-white border-amber-600',
  }[variant] || 'bg-gray-900 text-white border-gray-800';

  return (
    <div className={`pointer-events-auto min-w-[280px] max-w-[360px] rounded-lg border shadow-lg ${styles} overflow-hidden animate-[fadeIn_150ms_ease-out]`}>
      <div className="p-3">
        {title && <div className="font-semibold">{title}</div>}
        {description && <div className="text-sm/5 opacity-90 mt-0.5">{description}</div>}
      </div>
      <div className="flex justify-end px-3 pb-2">
        <button onClick={onClose} className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20">Close</button>
      </div>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

/* Tailwind keyframes (via utilities):
Add this to your tailwind config if you want smoother animations. Keeping minimal here. */
