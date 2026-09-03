"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { DbOrder } from "@/types";
import { formatBDT } from "@/utils/formatters";
import {
  Package,
  ShoppingBag,
  Truck,
  ArrowRight,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { getOrderStatusBadge } from "@/utils/orderStatus";

export default function AccountOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchUserOrders() {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setOrders(data as DbOrder[]);
        }
      } catch (err) {
        console.error("Orders fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchUserOrders();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Loading your order history...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 max-w-md text-center space-y-6 shadow-md">
          <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Sign in to View Orders</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Please login with your customer account to view your past purchases and track ongoing deliveries.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login?redirect=/account/orders"
              className="block w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/account" className="hover:text-brand-primary">
                My Account
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Order History</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Package className="w-7 h-7 text-brand-primary" />
              <span>My Orders</span>
            </h1>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 shadow-xs transition-colors self-start sm:self-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-brand-primary" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Orders List / Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-primary flex items-center justify-center mx-auto border border-blue-100">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">No orders placed yet</h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                When you purchase devices, their delivery progress and receipts will appear right here.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs shadow-md shadow-blue-600/20"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const badge = getOrderStatusBadge(order.status);
              const orderDate = new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 p-5 sm:p-6 shadow-xs transition-all space-y-4"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-extrabold text-slate-900">
                        {order.order_number ? order.order_number : `Order #${order.id}`}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{orderDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}
                      >
                        {badge.icon}
                        <span>{badge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Items Snapshot */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Item Thumbnails & Names */}
                    <div className="flex items-center gap-3 overflow-x-auto py-1">
                      {order.items &&
                        order.items.slice(0, 3).map((item, idx) => {
                          const itemName = item.name || item.product_name || "Purchased Product";
                          const itemPrice = item.price ?? item.unit_price ?? 0;
                          return (
                            <div key={idx} className="flex items-center gap-2.5 shrink-0">
                              <div className="relative w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                {item.image_url ? (
                                  <Image
                                    src={item.image_url}
                                    alt={itemName}
                                    fill
                                    className="object-contain p-1"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Package className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                              <div className="text-xs">
                                <p className="font-bold text-slate-800 truncate max-w-44">
                                  {itemName}
                                </p>
                                <span className="text-[11px] text-slate-400">
                                  Qty: {item.quantity || 1} × {formatBDT(itemPrice)}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                      {order.items && order.items.length > 3 && (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg shrink-0">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>

                    {/* Total & Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Total Amount
                        </span>
                        <span className="text-base font-extrabold text-brand-primary">
                          {formatBDT(order.total_amount ?? order.total ?? 0)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/orders/${order.id}/track`}
                          className="inline-flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-brand-primary font-bold text-xs py-2 px-3.5 rounded-xl border border-blue-200 transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </Link>

                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition-all"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
