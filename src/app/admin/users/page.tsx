"use client";

import React from "react";
import { Users, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Customer & Staff Directory</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage registered customer profiles, staff permissions, and role assignments.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-emerald-600/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
          <Users className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>COMING SOON</span>
        </div>
        <h3 className="text-xl font-bold text-white">User Management System</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Comprehensive user permissions, ban controls, activity logs, and customer purchase history will be available here.
        </p>
        <div className="pt-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
