"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Plus,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Clock,
  Layers,
  AlertCircle,
} from "lucide-react";
import { DbProduct } from "@/types";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    productsCount: 0,
    usersCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
  });
  const [recentProducts, setRecentProducts] = useState<DbProduct[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Total Products
      const { count: prodCount, error: prodErr } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      if (prodErr && prodErr.code !== "PGRST116") {
        console.log("Products count note:", prodErr.message);
      }

      // 2. Total Users / Profiles
      const { count: userCount, error: userErr } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (userErr) {
        console.log("Profiles count note:", userErr.message);
      }

      // 3. Orders & Revenue
      let orderCount = 0;
      let revenue = 0;
      try {
        const { data: ordersData, count: ordCount } = await supabase
          .from("orders")
          .select("total_amount", { count: "exact" });

        orderCount = ordCount || 0;
        if (ordersData) {
          revenue = ordersData.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
        }
      } catch (e) {
        console.log("Orders table optional check:", e);
      }

      setStats({
        productsCount: prodCount ?? 0,
        usersCount: userCount ?? 0,
        ordersCount: orderCount,
        totalRevenue: revenue,
      });

      // 4. Recent 5 Products
      const { data: prodsData, error: recentErr } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentErr) {
        const { data: rawProds } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentProducts(rawProds || []);
      } else {
        setRecentProducts(prodsData || []);
      }
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
      setErrorMsg("Failed to connect to one or more Supabase tables. Ensure tables are created.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics and inventory status from your Supabase PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/products/new"
            className="bg-brand-primary hover:bg-brand-primary-dark active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Products */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Products
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-brand-primary flex items-center justify-center border border-blue-500/20">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : stats.productsCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>In Supabase Database</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Users */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Users
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : stats.usersCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Customer Profiles</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : stats.ordersCount}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
              <span>Orders Placed</span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm hover:border-slate-700 transition-colors flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : formatBDT(stats.totalRevenue)}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-1">
              <span>Gross Sales (BDT)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Products Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            <h2 className="text-base sm:text-lg font-extrabold text-white">
              Recent Products in Database
            </h2>
          </div>

          <Link
            href="/admin/products"
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            Loading recent products from database...
          </div>
        ) : recentProducts.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl space-y-3">
            <Package className="w-12 h-12 text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold text-slate-300">No products found in `products` table</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Your Supabase products table is currently empty. Click the button below to add your first smartphone, laptop, or gadget!
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-2 px-4 rounded-xl text-xs transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add First Product</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/60 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Brand</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 shrink-0 flex items-center justify-center">
                          {p.image_url ? (
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate max-w-xs">{p.name}</p>
                          <span className="text-[10px] text-slate-500">
                            {p.slug || "no-slug"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-semibold uppercase">
                      {p.brand || "—"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-400">
                      {formatBDT(p.price || 0)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          (p.stock || 0) > 10
                            ? "bg-emerald-500/10 text-emerald-400"
                            : (p.stock || 0) > 0
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {p.stock ?? 0} in stock
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 mr-3"
                      >
                        Edit
                      </Link>
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
