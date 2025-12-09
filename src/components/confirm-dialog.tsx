'use client';

import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="rounded-xl border border-slate-100 bg-white shadow-lg w-full max-w-sm animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="flex items-start gap-4 border-b border-slate-100 p-6">
            <div className={`rounded-full p-2 ${isDangerous ? 'bg-red-50' : 'bg-blue-50'}`}>
              <AlertCircle
                className={`h-5 w-5 ${isDangerous ? 'text-red-600' : 'text-blue-600'}`}
                strokeWidth={2}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-600">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 p-6">
            <button
              onClick={onCancel}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
