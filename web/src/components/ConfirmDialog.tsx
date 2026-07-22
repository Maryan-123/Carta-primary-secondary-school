import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useUIStore } from '../store';

export default function ConfirmDialog() {
  const { confirmState, resolveConfirm } = useUIStore();

  if (!confirmState.isOpen) {
    return null;
  }

  const isDanger = confirmState.tone === 'danger';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start gap-4 border-b border-slate-100 px-6 py-5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isDanger ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">{confirmState.title}</h3>
            <p className="text-sm leading-6 text-slate-500">{confirmState.message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5">
          <button
            type="button"
            onClick={() => resolveConfirm(false)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            {confirmState.cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => resolveConfirm(true)}
            className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[linear-gradient(135deg,#1A46FD_0%,#019444_100%)] hover:brightness-105'}`}
          >
            {confirmState.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
