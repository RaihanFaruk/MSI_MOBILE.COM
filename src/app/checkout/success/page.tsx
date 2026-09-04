"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Truck,
  ArrowRight,
  CreditCard,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || searchParams.get("orderId") || "MSI-ORDER";
  const orderId = searchParams.get("orderId") || orderNumber;
  const method = searchParams.get("method") || "COD";

  const isOnlinePayment = method !== "COD";

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:py-16 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-lg text-center space-y-6 animate-in zoom-in-95">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Thank You For Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Your order has been recorded in the database. Our warehouse team is now preparing your package for dispatch.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Order Number:</span>
              <strong className="font-mono text-brand-primary text-sm font-bold">{orderNumber.startsWith("#") ? orderNumber : `#${orderNumber}`}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Payment Method:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                {isOnlinePayment ? (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    <span>{method}</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5 text-slate-600" />
                    <span>Cash on Delivery</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Fulfillment Status:</span>
              <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">
                Pending Verification
              </span>
            </div>

            {isOnlinePayment && (
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-brand-primary">
                ℹ️ <strong>Online Payment Note:</strong> SSLCOMMERZ gateway verification webhook active in Chunk 5. Order is securely recorded in database as pending.
              </div>
            )}
          </div>

          {/* Delivery Note */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Truck className="w-4 h-4 text-brand-primary" />
            <span>Estimated Delivery: <strong>24–48 hours across Bangladesh</strong></span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/orders/${orderId}/track`}
              className="flex-1 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
            >
              <Truck className="w-4 h-4" />
              <span>Track Order Live</span>
            </Link>

            <Link
              href="/account/orders"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <span>View in My Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-400">Loading receipt...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
