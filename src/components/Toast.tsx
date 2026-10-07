import React from 'react';
import { CheckCircle2, Zap, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-slate-900 border border-slate-700 text-white p-3.5 rounded-xl shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom duration-200"
        >
          <div className="p-1 rounded-full bg-[#059669]/20 text-[#10b981] mt-0.5 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 text-xs">
            <div className="font-semibold text-slate-100 font-mono leading-tight">
              {toast.title}
            </div>
            <div className="text-slate-300 mt-1 leading-snug">
              {toast.description}
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-slate-400 hover:text-white rounded transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
