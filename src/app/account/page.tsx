"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import {
  User,
  Package,
  Heart,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile, isAdmin } = useAuth();
  const { wishlist } = useStore();

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Orders Stats
  const [ordersCount, setOrdersCount] = useState(0);
  const [spentTotal, setSpentTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Sync profile fields
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setAddress(profile.address || "");
      setDistrict(profile.district || "Dhaka");
    }
  }, [profile]);

  // Fetch customer order stats
  useEffect(() => {
    if (!user) {
      setOrdersLoading(false);
      return;
    }

    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, total_amount, status")
          .eq("user_id", user?.id);

        if (!error && data) {
          setOrdersCount(data.length);
          const total = data.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
          setSpentTotal(total);
        }
      } catch {
        // Fallback for user stats calculation
      } finally {
        setOrdersLoading(false);
      }
    }

    fetchStats();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          district: district.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Loading your account...</span>
        </div>
      </div>
    );
  }

  // Unauthorized State
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 max-w-md text-center space-y-6 shadow-md">
          <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Sign in to your Account</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Please login or create an account to view your profile, manage saved delivery addresses, and track real-time orders.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <Link
              href="/login?redirect=/account"
              className="block w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Header Profile Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-primary to-blue-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {profile?.full_name || "Customer"}
                </h1>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  isAdmin ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-blue-50 text-brand-primary border-blue-200"
                }`}>
                  {isAdmin ? "Admin" : "Verified Customer"}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 py-2.5 px-4 rounded-xl transition-colors"
              >
                <span>Admin Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2.5 px-4 rounded-xl transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid (3 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/account/orders"
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-brand-primary hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-blue-50 text-brand-primary group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Orders
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {ordersLoading ? "..." : ordersCount}
                </h3>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Purchased
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                {ordersLoading ? "..." : formatBDT(spentTotal)}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Saved Wishlist
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">{wishlist.length} Items</h3>
            </div>
          </div>
        </div>

        {/* Profile Settings Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-brand-primary" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Personal & Delivery Details</h2>
            </div>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>View Order History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your profile and default delivery address have been updated successfully!</span>
            </div>
          )}

          {saveError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  City / District
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="Dhaka">Dhaka (Inside City)</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Rajshahi">Rajshahi</option>
                  <option value="Khulna">Khulna</option>
                  <option value="Barisal">Barisal</option>
                  <option value="Rangpur">Rangpur</option>
                  <option value="Mymensingh">Mymensingh</option>
                  <option value="Gazipur">Gazipur</option>
                  <option value="Narayanganj">Narayanganj</option>
                  <option value="Other">Other Districts</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Default Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House, Road, Area, Landmark for fast checkout auto-fill..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
