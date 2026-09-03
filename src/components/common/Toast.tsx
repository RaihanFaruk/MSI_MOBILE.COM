"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Info, AlertCircle, X, Sparkles } from "lucide-react";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-obsidian-950/95 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-amber-500/30 flex items-start gap-3.5 transform transition-all duration-300 animate-in slide-in-from-bottom-5"
        >
          {toast.type === "success" && (
            <Sparkles className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
          )}
          {toast.type === "info" && (
            <Info className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
          )}
          {toast.type === "warning" && (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white tracking-wide leading-tight">{toast.title}</h4>
            <p className="text-xs text-neutral-400 mt-0.5 leading-snug line-clamp-2 font-light">
              {toast.message}
            </p>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
