"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { DbOrder } from "@/types";
import { formatBDT } from "@/utils/formatters";
import { getOrderStatusBadge } from "@/utils/orderStatus";
import {
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Phone,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function OrderDetailsPage() {
  const params = useParams();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.id as string;

  useEffect(() => {
    if (!orderId) return;
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const { data, error: dbError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (dbError || !data) {
          setError("Order not found or you do not have permission to view it.");
          return;
        }

        // Ownership enforcement
        if (data.user_id && data.user_id !== user?.id && !isAdmin) {
          setError("Access Denied: You cannot view orders belonging to another customer.");
          return;
        }

        setOrder(data as DbOrder);
      } catch (err: unknown) {
        console.error("Order fetch error:", err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, user, authLoading, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Loading order receipt...</span>
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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Sign in to View Order</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              Please sign in to your account to view this order&apos;s itemized receipt.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href={`/login?redirect=/account/orders/${orderId}`}
              className="block w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-blue-600/20"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 max-w-md text-center space-y-5 shadow-md">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Order Notice</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {error || "We could not find the requested order receipt."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to My Orders</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const badge = getOrderStatusBadge(order.status);
  const formattedDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/account" className="hover:text-brand-primary">
                My Account
              </Link>
              <span>/</span>
              <Link href="/account/orders" className="hover:text-brand-primary">
                Orders
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">#{order.id}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Order #{order.id}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${badge.color}`}
              >
                {badge.icon}
                <span>{badge.label}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Placed on {formattedDate}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href={`/orders/${order.id}/track`}
              className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-blue-600/20 transition-all"
            >
              <Truck className="w-4 h-4" />
              <span>Live Order Tracking</span>
            </Link>

            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Orders</span>
            </Link>
          </div>
        </div>

        {/* 2 Columns: Items Breakdown (7 cols) + Shipping/Payment Summary (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-primary" />
                <span>Purchased Items ({order.items?.length || 0})</span>
              </h3>

              <div className="divide-y divide-slate-100">
                {order.items &&
                  order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative w-16 h-16 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.name}
                              fill
                              className="object-contain p-1.5"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 block">
                            Qty: <strong>{item.quantity}</strong> × {formatBDT(item.price)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                          {formatBDT(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
                Payment Breakdown
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">
                    {formatBDT(
                      order.subtotal ||
                        order.items?.reduce((sum, it) => sum + it.price * it.quantity, 0) ||
                        order.total_amount
                    )}
                  </span>
                </div>

                {order.discount_amount && order.discount_amount > 0 ? (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount</span>
                    <span>-{formatBDT(order.discount_amount)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-800">
                    {order.shipping_charge === 0 ? "৳0 (Free Delivery)" : formatBDT(order.shipping_charge || 0)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm">
                  <span className="font-extrabold text-slate-900">Total Paid / Payable</span>
                  <span className="text-lg font-black text-brand-primary">
                    {formatBDT(order.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Meta (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Delivery Address Box */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Delivery Address
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customer_name}</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customer_phone}</span>
                </p>
                <div className="pt-1 text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <p className="font-semibold text-slate-800">{order.shipping_address?.district}</p>
                  <p>{order.shipping_address?.address}</p>
                </div>
              </div>
            </div>

            {/* Payment Method & Status */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <CreditCard className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Method
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Method:</span>
                  <strong className="text-slate-900 uppercase">{order.payment_method}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                      order.payment_status === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
