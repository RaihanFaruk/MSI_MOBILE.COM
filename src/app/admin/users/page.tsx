"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Loader2,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "customer" | string;
  phone?: string;
  address?: string;
  district?: string;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Profiles fetch note:", error.message);
      } else {
        setUsers(data || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (u.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (u.phone || "").includes(searchQuery);

    const matchesSearch = nameMatch || emailMatch || phoneMatch;
    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const customerCount = totalCount - adminCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Customer & Staff Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              {totalCount} Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View registered customers, admin staff accounts, and contact details.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Total Profiles</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white">{totalCount}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Customers</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-emerald-400">{customerCount}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-1">
          <span className="text-xs text-slate-400 font-semibold block">Administrators</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-purple-400">{adminCount}</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            aria-label="Search users by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              roleFilter === "all" ? "bg-brand-primary text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter("customer")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              roleFilter === "customer" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setRoleFilter("admin")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              roleFilter === "admin" ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* User Directory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-xs">Loading user directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No accounts found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || roleFilter !== "all"
                ? "No users match your active filter."
                : "Customer and staff profiles will appear here once registered."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Contact Info</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                          {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block">
                            {u.full_name || "Guest / Customer"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ID: {u.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4 text-slate-400">
                      {u.district ? (
                        <span>
                          {u.district}
                          {u.address ? `, ${u.address.slice(0, 20)}...` : ""}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.role === "admin"
                            ? "bg-purple-500/10 border border-purple-500/30 text-purple-400"
                            : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <>
                            <ShieldCheck className="w-3 h-3" />
                            <span>Administrator</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Customer</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-5 py-4 whitespace-nowrap text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>
                          {u.created_at
                            ? new Date(u.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Active"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
