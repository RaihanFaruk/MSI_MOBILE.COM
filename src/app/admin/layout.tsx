"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Users,
  ExternalLink,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Tag,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Users", href: "/admin/users", icon: Users },
  ];

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Verifying Admin Permissions...</p>
      </div>
    );
  }

  // 2. Unauthorized State (Not logged in or not admin)
  if (!user || profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden tech-circuit-pattern">
        <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl p-8 rounded-2xl border border-slate-800 shadow-2xl text-center relative z-10 space-y-5">
          <div className="w-16 h-16 bg-rose-500/15 border border-rose-500/30 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              {!user
                ? "You must be logged in with an authorized Administrator account to view the MSI Mobile Admin Panel."
                : `Logged in as ${user.email} (Role: ${profile?.role || "customer"}). This account does not have Admin privileges.`}
            </p>
          </div>

          <div className="p-3.5 bg-blue-950/40 border border-blue-900/50 rounded-xl text-[11px] text-blue-300 text-left">
            <strong>💡 How to assign Admin Role:</strong>
            <p className="mt-1 text-slate-400 font-mono">
              UPDATE profiles SET role = &apos;admin&apos; WHERE email = &apos;{user?.email || "your-email@example.com"}&apos;;
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!user ? (
              <Link
                href="/login"
                className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
              >
                <span>Log In as Admin</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                onClick={() => signOut()}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all"
              >
                Sign Out & Switch Account
              </button>
            )}

            <Link
              href="/"
              className="flex-1 border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center transition-all"
            >
              Back to Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin Layout
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div>
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="bg-brand-accent text-white font-black text-sm px-2 py-0.5 rounded shadow-sm">
                MSI
              </span>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm text-white tracking-tight leading-none">
                  ADMIN<span className="text-blue-400"> PANEL</span>
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  Store Management
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-brand-primary text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/60">
          {/* Live Store link */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors border border-slate-700/60"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>View Live Store</span>
            </div>
            <span className="text-[10px] text-slate-500">msi.com</span>
          </Link>

          {/* Admin User Info */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {profile?.full_name?.charAt(0).toUpperCase() || "A"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">
                    {profile?.full_name || "Administrator"}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
                <span className="text-[10px] text-slate-400 truncate block">
                  {user?.email}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/admin" className="hover:text-white transition-colors">
                Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-white font-bold capitalize">
                {pathname === "/admin" ? "Dashboard" : pathname.replace("/admin/", "").split("/")[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Supabase Connected</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
