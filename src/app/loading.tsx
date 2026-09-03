import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-brand-primary/20 border-t-brand-primary animate-spin" />
        <span className="absolute text-brand-primary font-black text-xs tracking-tighter">
          MSI
        </span>
      </div>
      <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
        Loading Store...
      </p>
    </div>
  );
}
