"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { DbOrder, OrderStatus } from "@/types";
import { formatBDT } from "@/utils/formatters";
import {
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Phone,
  ArrowLeft,
  Loader2,
  AlertCircle,
  XCircle,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

interface TimelineStep {
  key: OrderStatus;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "pending",
    title: "Order Placed",
    desc: "Order recorded in our system and awaiting processing",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    key: "confirmed",
    title: "Order Confirmed",
    desc: "Order verified and sent to fulfillment center",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    key: "processing",
    title: "Packed & Quality Checked",
    desc: "Device serial numbers recorded & tamper-proof sealed",
    icon: <Package className="w-4 h-4" />,
  },
  {
    key: "shipped",
    title: "Handed Over to Courier",
    desc: "Dispatched from Dhaka Central Hub",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    key: "out_for_delivery",
    title: "Out for Delivery",
    desc: "Delivery rider is on the way to your address",
    icon: <Truck className="w-4 h-4" />,
  },
  {
    key: "delivered",
    title: "Delivered Successfully",
    desc: "Package handed over and payment settled",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "out_for_delivery":
      return 4;
    case "delivered":
      return 5;
    case "cancelled":
    case "returned":
      return -1;
    default:
      return 0;
  }
};

export default function OrderTrackingPage() {
  const params = useParams();
  const { user, isAdmin } = useAuth();
  const orderId = params.id as string;

  const [order, setOrder] = useState<DbOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneAuthRequired, setPhoneAuthRequired] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");
  const [verifyingPhone, setVerifyingPhone] = useState(false);

  const fetchOrderData = useCallback(async (phoneFilter?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from("orders").select("*").eq("id", orderId);

      if (phoneFilter) {
        query = query.eq("customer_phone", phoneFilter.trim());
      }

      const { data, error: dbError } = await query.single();

      if (dbError || !data) {
        if (!phoneFilter && !user) {
          setPhoneAuthRequired(true);
        } else {
          setError("No matching order found with the provided details.");
        }
        return;
      }

      // If user is logged in, verify ownership
      if (user && !isAdmin && data.user_id && data.user_id !== user.id) {
        setError("You do not have authorization to view this order.");
        return;
      }

      setOrder(data as DbOrder);
      setPhoneAuthRequired(false);
    } catch (err: unknown) {
      console.error("Order tracking error:", err);
      setError("Failed to load tracking data.");
    } finally {
      setLoading(false);
      setVerifyingPhone(false);
    }
  }, [orderId, user, isAdmin]);

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId, fetchOrderData]);

  const handleGuestPhoneVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestPhone.trim()) return;
    setVerifyingPhone(true);
    fetchOrderData(guestPhone.trim());
  };

  if (loading && !verifyingPhone) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm font-semibold">
          <Loader2 className="w-5 h-5 animate-spin text-brand-primary" />
          <span>Retrieving live tracking status...</span>
        </div>
      </div>
    );
  }

  // Guest Phone Verification Form
  if (phoneAuthRequired) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-md mx-4">
          <div className="w-16 h-16 bg-blue-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Track Order #{orderId}</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
              For privacy protection, please enter the mobile number used when placing this order.
            </p>
          </div>

          <form onSubmit={handleGuestPhoneVerify} className="space-y-3.5">
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={verifyingPhone}
              className="w-full bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {verifyingPhone ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Track Package</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex items-center justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 max-w-md text-center space-y-5 shadow-md mx-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tracking Information Unavailable</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {error || "We could not find an active order matching this reference."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Store</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";
  const isReturned = order.status === "returned";

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Live Shipment Tracking
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Truck className="w-6 h-6 text-brand-primary" />
                <span>Order #{order.id}</span>
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {user && (
                <Link
                  href={`/account/orders/${order.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-3.5 rounded-xl transition-colors"
                >
                  <span>Receipt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">Destination City</span>
              <strong className="text-slate-900">{order.shipping_address?.district || "Dhaka"}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Estimated Delivery</span>
              <strong className="text-brand-primary">24 – 48 Hours Across Bangladesh</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Payment Mode</span>
              <strong className="text-slate-900 uppercase">
                {order.payment_method} ({order.payment_status})
              </strong>
            </div>
          </div>
        </div>

        {/* Status Alerts if Cancelled or Returned */}
        {isCancelled && (
          <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3.5 text-rose-800">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Order Cancelled</h3>
              <p className="text-xs text-rose-600 mt-0.5">
                This order has been cancelled and will not be dispatched. If you made an online payment, a full refund is initiated.
              </p>
            </div>
          </div>
        )}

        {isReturned && (
          <div className="p-5 rounded-2xl bg-slate-100 border border-slate-300 flex items-center gap-3.5 text-slate-800">
            <RotateCcw className="w-6 h-6 text-slate-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Order Returned</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                The parcel was returned to origin. Please contact customer support if you need assistance.
              </p>
            </div>
          </div>
        )}

        {/* Visual Progress Timeline (when not cancelled/returned) */}
        {!isCancelled && !isReturned && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>Shipment Progression</span>
            </h2>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {TIMELINE_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={step.key} className="relative flex items-start gap-4">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-0.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                        isCurrent
                          ? "bg-brand-primary text-white border-brand-primary ring-4 ring-blue-100 animate-pulse"
                          : isPassed
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-300 border-slate-200"
                      }`}
                    >
                      {isPassed && !isCurrent ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        step.icon
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-xs sm:text-sm font-bold ${
                            isCurrent
                              ? "text-brand-primary font-black"
                              : isPassed
                              ? "text-slate-900"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-50 text-brand-primary border border-blue-200 px-2 py-0.5 rounded-full font-extrabold uppercase">
                            Current Status
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items Snapshot Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-primary" />
              <span>Package Contents ({order.items?.length || 0})</span>
            </span>
            <span className="text-xs font-bold text-brand-primary">
              Total: {formatBDT(order.total_amount)}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {order.items &&
              order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3"
                >
                  <div className="relative w-12 h-12 bg-white rounded-xl overflow-hidden border border-slate-200 shrink-0">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Package className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 text-xs">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <span className="text-slate-500">
                      Qty: <strong>{item.quantity}</strong> × {formatBDT(item.price)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to MSI Mobile Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
