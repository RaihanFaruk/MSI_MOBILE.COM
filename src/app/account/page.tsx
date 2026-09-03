"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/context/StoreContext";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import { getOrderStatusBadge } from "@/utils/orderStatus";
import { DbOrder, SavedAddress } from "@/types";
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
  Lock,
  KeyRound,
  Plus,
  Trash2,
  X,
  Eye,
  EyeOff,
  Home,
  Building,
  Check,
  Calendar,
  Truck,
} from "lucide-react";

type AccountTab = "overview" | "orders" | "addresses" | "profile" | "security";

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, loading, signOut, refreshProfile, isAdmin } = useAuth();
  const { wishlist } = useStore();

  const [activeTab, setActiveTab] = useState<AccountTab>("overview");

  // Profile Form States
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Saved Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressTitle, setAddressTitle] = useState("Home");
  const [addressRecipient, setAddressRecipient] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressDistrict, setAddressDistrict] = useState("Dhaka");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync profile fields
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  // Load Saved Addresses
  const loadAddresses = useCallback(() => {
    if (!user) return;
    try {
      const storageKey = `msi_addresses_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setAddresses(JSON.parse(saved));
      } else if (profile?.address) {
        // Seed default address from profile if empty
        const initialAddress: SavedAddress = {
          id: "default-1",
          title: "Home",
          recipient_name: profile.full_name || user.email?.split("@")[0] || "Customer",
          phone: profile.phone || "",
          district: profile.district || "Dhaka",
          street_address: profile.address,
          is_default: true,
        };
        setAddresses([initialAddress]);
        localStorage.setItem(storageKey, JSON.stringify([initialAddress]));
      }
    } catch {
      // LocalStorage fallback
    }
  }, [user, profile]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // Fetch customer orders
  useEffect(() => {
    if (!user) {
      setOrdersLoading(false);
      return;
    }

    async function fetchOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data as DbOrder[]);
        }
      } catch {
        // Fallback
      } finally {
        setOrdersLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  // Handle Profile Update (Name & Phone only)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      await refreshProfile();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Profile update error:", err);
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change via Supabase Auth
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccess("Your account password has been changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: unknown) {
      console.error("Password change error:", err);
      const msg = err instanceof Error ? err.message : "Failed to change password. Please try again.";
      setPasswordError(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Address Save (Add / Edit)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!addressStreet.trim() || !addressRecipient.trim()) {
      setAddressError("Please provide recipient name and street address.");
      return;
    }

    setAddressError(null);

    const isFirst = addresses.length === 0;
    let updated: SavedAddress[];

    if (editingAddressId) {
      updated = addresses.map((addr) =>
        addr.id === editingAddressId
          ? {
              ...addr,
              title: addressTitle,
              recipient_name: addressRecipient.trim(),
              phone: addressPhone.trim(),
              district: addressDistrict,
              street_address: addressStreet.trim(),
            }
          : addr
      );
    } else {
      const newAddr: SavedAddress = {
        id: `addr-${Date.now()}`,
        title: addressTitle,
        recipient_name: addressRecipient.trim(),
        phone: addressPhone.trim(),
        district: addressDistrict,
        street_address: addressStreet.trim(),
        is_default: isFirst,
      };
      updated = [...addresses, newAddr];
    }

    setAddresses(updated);
    try {
      localStorage.setItem(`msi_addresses_${user.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // If default or first address, sync to Supabase profile
    const defaultAddr = updated.find((a) => a.is_default) || updated[0];
    if (defaultAddr) {
      try {
        await supabase
          .from("profiles")
          .update({
            address: defaultAddr.street_address,
            district: defaultAddr.district,
            phone: defaultAddr.phone || phone,
          })
          .eq("id", user.id);
        refreshProfile();
      } catch {
        // Sync note
      }
    }

    setIsAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressSuccess("Delivery address saved successfully!");
    setTimeout(() => setAddressSuccess(null), 4000);
  };

  // Set Address as Default
  const handleSetDefaultAddress = async (id: string) => {
    if (!user) return;

    const updated = addresses.map((addr) => ({
      ...addr,
      is_default: addr.id === id,
    }));

    setAddresses(updated);
    try {
      localStorage.setItem(`msi_addresses_${user.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }

    const selected = updated.find((a) => a.id === id);
    if (selected) {
      try {
        await supabase
          .from("profiles")
          .update({
            address: selected.street_address,
            district: selected.district,
            phone: selected.phone || phone,
          })
          .eq("id", user.id);
        refreshProfile();
      } catch {
        // Sync note
      }
    }

    setAddressSuccess(`"${selected?.title || "Address"}" is now your default delivery address.`);
    setTimeout(() => setAddressSuccess(null), 4000);
  };

  // Delete Address
  const handleDeleteAddress = (id: string) => {
    if (!user) return;
    const updated = addresses.filter((addr) => addr.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.is_default)) {
      updated[0].is_default = true;
    }
    setAddresses(updated);
    try {
      localStorage.setItem(`msi_addresses_${user.id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setAddressSuccess("Address removed from your address book.");
    setTimeout(() => setAddressSuccess(null), 4000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Calculations
  const ordersCount = orders.length;
  const spentTotal = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const recentOrders = orders.slice(0, 3);
  const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];

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

  // Unauthorized State (Protected Route)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-md">
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
              className="block w-full text-center bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20 active:scale-[0.99]"
            >
              Sign In
            </Link>
            <Link
              href="/signup?redirect=/account"
              className="block w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all active:scale-[0.99]"
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
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-brand-primary to-blue-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
              {profile?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
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

          <div className="flex items-center gap-2.5 flex-wrap">
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
              className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Global Success Notification */}
        {addressSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{addressSuccess}</span>
            </div>
            <button onClick={() => setAddressSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Account Tabs Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/80">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 border-b-2 ${
              activeTab === "overview"
                ? "border-brand-primary text-brand-primary bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 border-b-2 ${
              activeTab === "orders"
                ? "border-brand-primary text-brand-primary bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({ordersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("addresses")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 border-b-2 ${
              activeTab === "addresses"
                ? "border-brand-primary text-brand-primary bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 border-b-2 ${
              activeTab === "profile"
                ? "border-brand-primary text-brand-primary bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-3 text-xs sm:text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 border-b-2 ${
              activeTab === "security"
                ? "border-brand-primary text-brand-primary bg-white shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Security & Password</span>
          </button>

          <Link
            href="/wishlist"
            className="px-4 py-3 text-xs sm:text-sm font-bold text-slate-500 hover:text-rose-600 hover:bg-slate-100/50 rounded-t-xl transition-all flex items-center gap-2 shrink-0 ml-auto"
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Wishlist ({wishlist.length})</span>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & DASHBOARD                                              */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats Grid (3 cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab("orders")}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-brand-primary hover:shadow-md transition-all group flex items-center justify-between text-left"
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
              </button>

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

              <Link
                href="/wishlist"
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-rose-300 hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Saved Wishlist
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900">{wishlist.length} Items</h3>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 transition-colors" />
              </Link>
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Recent Orders</h2>
                </div>
                <Link
                  href="/account/orders"
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                >
                  <span>View All Orders</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {ordersLoading ? (
                <div className="py-12 flex justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-primary" />
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs sm:text-sm text-slate-500">You have not placed any orders yet.</p>
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition-all"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Explore Products</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((ord) => {
                    const badge = getOrderStatusBadge(ord.status);
                    return (
                      <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-extrabold text-sm text-slate-900">
                              Order #{ord.order_number}
                            </span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {ord.created_at
                                ? new Date(ord.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </span>
                            <span>•</span>
                            <span className="font-bold text-slate-700">{formatBDT(ord.total_amount)}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/orders/${ord.id}/track`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 px-3 rounded-lg transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5 text-brand-primary" />
                            <span>Track</span>
                          </Link>
                          <Link
                            href={`/account/orders/${ord.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary bg-blue-50 hover:bg-blue-100 py-2 px-3 rounded-lg transition-colors"
                          >
                            <span>Receipt</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Default Delivery Address Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Default Delivery Address</h2>
                </div>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Manage Address Book</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {defaultAddress ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span>{defaultAddress.recipient_name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-brand-primary text-[10px] font-extrabold uppercase">
                      {defaultAddress.title} (Default)
                    </span>
                  </div>
                  <p className="text-slate-600">{defaultAddress.street_address}, {defaultAddress.district}</p>
                  {defaultAddress.phone && <p className="text-slate-500 font-mono text-xs">📞 {defaultAddress.phone}</p>}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <p>No default address saved yet.</p>
                  <button
                    onClick={() => {
                      setActiveTab("addresses");
                      setIsAddressModalOpen(true);
                    }}
                    className="mt-2 text-brand-primary font-bold hover:underline"
                  >
                    + Add New Address
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY ORDERS LIST                                                    */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-brand-primary" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">My Order History</h2>
                  <p className="text-xs text-slate-500">Track all purchases and real-time package statuses.</p>
                </div>
              </div>
              <Link
                href="/account/orders"
                className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
              >
                <span>Full Orders Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {ordersLoading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                <p className="text-xs">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">No Orders Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You have not placed any orders with MSI MOBILE.COM yet. Explore our authentic flagships and accessories.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Shopping</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => {
                  const badge = getOrderStatusBadge(ord.status);
                  const itemsCount = ord.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1;

                  return (
                    <div
                      key={ord.id}
                      className="border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all bg-slate-50/50 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-black text-base text-slate-900">
                              Order #{ord.order_number}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Placed on{" "}
                            {ord.created_at
                              ? new Date(ord.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
                          <span className="text-base font-extrabold text-brand-primary">
                            {formatBDT(ord.total_amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-slate-600 font-medium">
                          📦 {itemsCount} {itemsCount === 1 ? "item" : "items"} • Payment: <strong className="uppercase text-slate-800">{ord.payment_method || "COD"}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/orders/${ord.id}/track`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 py-2 px-3.5 rounded-xl transition-all shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-brand-primary" />
                            <span>Live Tracking</span>
                          </Link>
                          <Link
                            href={`/account/orders/${ord.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-dark py-2 px-4 rounded-xl transition-all shadow-md shadow-blue-600/20"
                          >
                            <span>Receipt & Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SAVED ADDRESSES (ADDRESS BOOK)                                     */}
        {/* ========================================================================= */}
        {activeTab === "addresses" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-brand-primary" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Saved Delivery Addresses</h2>
                  <p className="text-xs text-slate-500">Manage multiple delivery addresses for instant 1-click checkout.</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressTitle("Home");
                  setAddressRecipient(profile?.full_name || "");
                  setAddressPhone(profile?.phone || "");
                  setAddressDistrict(profile?.district || "Dhaka");
                  setAddressStreet("");
                  setAddressError(null);
                  setIsAddressModalOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm text-slate-500">No saved addresses found. Add one to speed up future checkouts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`rounded-2xl p-5 border transition-all space-y-3 relative flex flex-col justify-between ${
                      addr.is_default
                        ? "bg-blue-50/40 border-brand-primary/40 shadow-xs"
                        : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {addr.title.toLowerCase() === "home" ? (
                            <Home className="w-4 h-4 text-brand-primary" />
                          ) : (
                            <Building className="w-4 h-4 text-brand-primary" />
                          )}
                          <span className="font-extrabold text-sm text-slate-900">{addr.title}</span>
                        </div>
                        {addr.is_default && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand-primary text-white">
                            <Check className="w-3 h-3" />
                            <span>Default</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-700 space-y-1">
                        <p className="font-bold text-slate-900">{addr.recipient_name}</p>
                        <p className="text-slate-600 leading-relaxed">
                          {addr.street_address}, <strong className="text-slate-800">{addr.district}</strong>
                        </p>
                        {addr.phone && (
                          <p className="text-slate-500 font-mono text-[11px] pt-1">
                            📞 {addr.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      {!addr.is_default ? (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[11px] font-bold text-brand-primary hover:underline cursor-pointer"
                        >
                          Set as Default
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-semibold">Primary Address</span>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => {
                            setEditingAddressId(addr.id);
                            setAddressTitle(addr.title);
                            setAddressRecipient(addr.recipient_name);
                            setAddressPhone(addr.phone);
                            setAddressDistrict(addr.district);
                            setAddressStreet(addr.street_address);
                            setAddressError(null);
                            setIsAddressModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                          title="Edit Address"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-100/60 transition-colors cursor-pointer"
                          title="Delete Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EDIT PROFILE                                                      */}
        {/* ========================================================================= */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-6 h-6 text-brand-primary" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Profile Details</h2>
                  <p className="text-xs text-slate-500">Update your customer name and contact phone number.</p>
                </div>
              </div>
            </div>

            {profileSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {profileError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
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
                  Email Address <span className="text-slate-400 font-normal lowercase">(read-only, linked to authentication)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user.email || ""}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-xs sm:text-sm cursor-not-allowed"
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
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
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SECURITY & PASSWORD                                               */}
        {/* ========================================================================= */}
        {activeTab === "security" && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-6 h-6 text-brand-primary" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">Change Account Password</h2>
                  <p className="text-xs text-slate-500">Update your credentials to keep your MSI MOBILE.COM account safe.</p>
                </div>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT ADDRESS MODAL                                                  */}
      {/* ========================================================================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <h3 className="text-lg font-bold text-slate-900">
                  {editingAddressId ? "Edit Delivery Address" : "Add Delivery Address"}
                </h3>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addressError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addressError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Label
                  </label>
                  <select
                    value={addressTitle}
                    onChange={(e) => setAddressTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City / District
                  </label>
                  <select
                    value={addressDistrict}
                    onChange={(e) => setAddressDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Recipient Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addressRecipient}
                  onChange={(e) => setAddressRecipient(e.target.value)}
                  placeholder="e.g. Raihan Faruk"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Street Address / House / Road
                </label>
                <textarea
                  rows={2}
                  required
                  value={addressStreet}
                  onChange={(e) => setAddressStreet(e.target.value)}
                  placeholder="House #, Road #, Area, Nearby Landmark..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Address</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
