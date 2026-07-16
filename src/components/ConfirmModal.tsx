import React, { createContext, useCallback, useContext, useState } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: any) => void) | null;
  isPrompt?: boolean;
  promptPlaceholder?: string;
  inputValue?: string;
}

interface ConfirmContextValue {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  prompt: (opts: ConfirmOptions & { promptPlaceholder?: string }) => Promise<string | null>;
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ConfirmContext = createContext<ConfirmContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────
export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    resolve: null,
    inputValue: '',
  });

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, isOpen: true, resolve, isPrompt: false, inputValue: '' });
    });
  }, []);

  const promptFn = useCallback((opts: ConfirmOptions & { promptPlaceholder?: string }): Promise<string | null> => {
    return new Promise((resolve) => {
      setState({ ...opts, isOpen: true, resolve, isPrompt: true, inputValue: '' });
    });
  }, []);

  const handleConfirm = () => {
    if (state.isPrompt && !state.inputValue?.trim()) return; // Required for prompt
    state.resolve?.(state.isPrompt ? state.inputValue : true);
    setState(s => ({ ...s, isOpen: false, resolve: null }));
  };

  const handleCancel = () => {
    state.resolve?.(state.isPrompt ? null : false);
    setState(s => ({ ...s, isOpen: false, resolve: null }));
  };

  const variantStyles = {
    danger: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-red-50',
      confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-amber-50',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    },
    info: {
      icon: (
        <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-indigo-50',
      confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    },
  };

  const style = variantStyles[state.variant ?? 'danger'];

  return (
    <ConfirmContext.Provider value={{ confirm, prompt: promptFn }}>
      {children}
      {state.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={handleCancel} />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full ${style.iconBg} flex items-center justify-center mx-auto mb-4`}>
              {style.icon}
            </div>
            {/* Title */}
            {state.title && (
              <h3 className="text-base font-bold text-slate-900 text-center mb-2">{state.title}</h3>
            )}
            {/* Message */}
            <p className="text-sm text-slate-600 text-center leading-relaxed mb-6">{state.message}</p>
            
            {/* Prompt Input */}
            {state.isPrompt && (
              <div className="mb-6">
                <textarea
                  autoFocus
                  rows={3}
                  value={state.inputValue}
                  onChange={e => setState(s => ({ ...s, inputValue: e.target.value }))}
                  placeholder={state.promptPlaceholder || "Nhập nội dung..."}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
              >
                {state.cancelText ?? 'Hủy'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={state.isPrompt && !state.inputValue?.trim()}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.confirmBtn} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {state.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within ConfirmProvider');
  return context.confirm;
};

export const usePrompt = () => {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('usePrompt must be used within ConfirmProvider');
  return context.prompt;
};
