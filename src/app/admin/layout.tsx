"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
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
  Star,
  Bell,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
export const LOW_STOCK_THRESHOLD = 5;

// ─── Toast Type ───────────────────────────────────────────────────────────────
interface ToastItem {
  id: number;
  text: string;
  subtext?: string;
  type: "success" | "info" | "warning";
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const pathname = usePathname();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [unreadOrderCount, setUnreadOrderCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastIdRef = useRef(0);

  // ─── Toast helpers ─────────────────────────────────────────────────────────
  const addToast = useCallback((text: string, subtext?: string, type: ToastItem["type"] = "info") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, text, subtext, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Low Stock Fetch ───────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchLowStock() {
      try {
        const { count } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .lt("stock", LOW_STOCK_THRESHOLD);

        if (count !== null && count !== undefined) {
          setLowStockCount(count);
        }
      } catch (e) {
        console.log("Low stock count check note:", e);
      }
    }

    if (user && profile?.role === "admin") {
      fetchLowStock();
    }
  }, [user, profile]);

  // ─── Supabase Realtime — new orders ───────────────────────────────────────
  useEffect(() => {
    if (!user || profile?.role !== "admin") return;

    const channel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as {
            id?: string | number;
            order_number?: string;
            customer_name?: string;
            total_amount?: number;
          };

          const customerName = order.customer_name || "A customer";
          const orderIdentifier = order.order_number || `#${order.id}`;
          const amount = order.total_amount
            ? `৳${Number(order.total_amount).toLocaleString("en-BD")}`
            : "";

          // Show toast
          addToast(
            `🛒 New Order Received!`,
            `${customerName} placed an order${amount ? ` for ${amount}` : ""}. (${orderIdentifier})`,
            "success"
          );

          // Only increment unread badge if not already on /admin/orders
          if (!window.location.pathname.startsWith("/admin/orders")) {
            setUnreadOrderCount((prev) => prev + 1);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[Admin] Realtime: Listening for new orders...");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile, addToast]);

  // ─── Reset unread count when navigating to /admin/orders ──────────────────
  useEffect(() => {
    if (pathname.startsWith("/admin/orders")) {
      setUnreadOrderCount(0);
    }
  }, [pathname]);

  // ─── Nav Items ─────────────────────────────────────────────────────────────
  const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      label: "Products",
      href: "/admin/products",
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: "amber" as const,
    },
    { label: "Categories", href: "/admin/categories", icon: Layers },
    { label: "Coupons", href: "/admin/coupons", icon: Tag },
    {
      label: "Orders",
      href: "/admin/orders",
      icon: ShoppingCart,
      badge: unreadOrderCount > 0 ? unreadOrderCount : undefined,
      badgeColor: "rose" as const,
    },
    { label: "Customers", href: "/admin/customers", icon: UserCheck },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Users", href: "/admin/users", icon: Users },
  ];

  // ─── Loading State ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
        <p className="text-sm font-semibold text-slate-400">Verifying Admin Permissions...</p>
      </div>
    );
  }

  // ─── Unauthorized State ────────────────────────────────────────────────────
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
                Sign Out &amp; Switch Account
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

  // ─── Authorized Admin Layout ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ── Toast Notifications ── */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs max-w-sm animate-in slide-in-from-right fade-in duration-300 ${
              toast.type === "success"
                ? "bg-slate-900 border-emerald-500/40 shadow-emerald-900/20"
                : toast.type === "warning"
                ? "bg-slate-900 border-amber-500/40 shadow-amber-900/20"
                : "bg-slate-900 border-blue-500/40 shadow-blue-900/20"
            }`}
          >
            {/* Icon */}
            <div
              className={`shrink-0 mt-0.5 ${
                toast.type === "success"
                  ? "text-emerald-400"
                  : toast.type === "warning"
                  ? "text-amber-400"
                  : "text-blue-400"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : toast.type === "warning" ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white">{toast.text}</p>
              {toast.subtext && (
                <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{toast.subtext}</p>
              )}
              {/* Link to orders page for order toasts */}
              {toast.type === "success" && toast.text.includes("Order") && (
                <Link
                  href="/admin/orders"
                  className="inline-block mt-1.5 text-emerald-400 font-bold text-[11px] hover:underline"
                >
                  View Orders →
                </Link>
              )}
            </div>

            {/* Dismiss */}
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 print:hidden ${
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

              const badgeColorClass =
                item.badgeColor === "rose"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-brand-primary text-white shadow-md shadow-blue-600/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${badgeColorClass} ${
                        item.badgeColor === "rose" ? "animate-pulse" : ""
                      }`}
                    >
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden print:overflow-visible print:bg-white print:text-black">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between print:hidden">
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
            {/* Unread orders bell in top navbar */}
            {unreadOrderCount > 0 && (
              <Link
                href="/admin/orders"
                className="relative p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition-colors"
                title={`${unreadOrderCount} new order${unreadOrderCount > 1 ? "s" : ""}`}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {unreadOrderCount > 9 ? "9+" : unreadOrderCount}
                </span>
              </Link>
            )}

            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>System Online</span>
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto print:p-0 print:m-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
