"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatBDT } from "@/utils/formatters";
import {
  Printer,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
} from "lucide-react";

interface OrderItem {
  id?: string | number;
  name?: string;
  title?: string;
  price?: number;
  quantity?: number;
  color?: string;
  storage?: string;
}

interface OrderData {
  id: string | number;
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: Record<string, unknown> | string;
  items?: OrderItem[];
  subtotal?: number;
  shipping_fee?: number;
  discount_amount?: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  status: string;
  created_at: string;
}

export default function AdminOrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) return;
      setLoading(true);
      try {
        const { data, error: dbError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single();

        if (dbError || !data) {
          throw new Error(dbError?.message || `Order #${orderId} was not found.`);
        }

        setOrder(data);
      } catch (err: unknown) {
        console.error("Invoice order fetch error:", err);
        setError(err instanceof Error ? err.message : "Failed to load order invoice.");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const handlePrint = () => {
    window.print();
  };

  // Helper to safely format address object or string
  const formatAddress = (addr?: Record<string, unknown> | string) => {
    if (!addr) return "Not specified";
    if (typeof addr === "string") {
      try {
        const parsed = JSON.parse(addr);
        if (typeof parsed === "object" && parsed !== null) {
          return formatAddressObject(parsed);
        }
      } catch {
        return addr;
      }
      return addr;
    }
    return formatAddressObject(addr);
  };

  const formatAddressObject = (obj: Record<string, unknown>) => {
    const parts = [
      obj.street || obj.address || obj.address_line1,
      obj.thana || obj.area,
      obj.district || obj.city,
      obj.division,
      obj.postal_code ? `Postal Code: ${obj.postal_code}` : null,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : JSON.stringify(obj);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Preparing printable invoice...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-base font-bold text-white">Invoice Not Available</h2>
        <p className="text-xs text-slate-400">{error || "The requested order could not be loaded."}</p>
        <button
          onClick={() => router.push("/admin/orders")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>
      </div>
    );
  }

  // Calculate items subtotal fallback
  const itemsList = Array.isArray(order.items) ? order.items : [];
  const calculatedSubtotal =
    order.subtotal ||
    itemsList.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0) ||
    order.total_amount;
  const shippingFee = order.shipping_fee !== undefined ? Number(order.shipping_fee) : 0;
  const discountAmount = order.discount_amount !== undefined ? Number(order.discount_amount) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (Hidden on Print) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden shadow-lg">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </Link>
          <span className="text-xs text-slate-400">
            Invoice for Order <strong className="text-white">#{order.id}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-blue-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="invoice-document"
        className="bg-white text-slate-900 rounded-2xl shadow-xl p-8 sm:p-12 border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:rounded-none"
      >
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-blue-600 text-white font-black text-lg px-2.5 py-1 rounded">
                MSI
              </span>
              <span className="font-extrabold text-xl tracking-tight text-slate-950">
                MOBILE.COM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed max-w-xs">
              4th Floor, Sena Shopping Complex, Savar, Dhaka, Bangladesh
            </p>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              Hotline: +880 1999-600222 | Web: msi-mobile-com.vercel.app
            </p>
          </div>

          <div className="sm:text-right">
            <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-widest rounded-md border border-blue-200 mb-2">
              Official Invoice
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              #{order.order_number || `ORD-${order.id}`}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Order Date:{" "}
              <strong className="text-slate-800">
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </p>
            <div className="flex sm:justify-end gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                {order.payment_method || "COD"} - {order.payment_status || "Unpaid"}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-300">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Billed & Shipped To:
            </h4>
            <p className="font-extrabold text-sm text-slate-900">
              {order.customer_name || "Valued Customer"}
            </p>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{order.customer_phone || "Not provided"}</span>
            </p>
            {order.customer_email && (
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{order.customer_email}</span>
              </p>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Delivery Destination:
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{formatAddress(order.shipping_address)}</span>
            </p>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-900 text-[11px] uppercase tracking-wider font-extrabold">
                <th className="py-3 px-2 w-10 text-center">SL</th>
                <th className="py-3 px-3">Item Description</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {itemsList.length > 0 ? (
                itemsList.map((item, idx) => {
                  const itemPrice = Number(item.price) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  const itemTotal = itemPrice * itemQty;

                  return (
                    <tr key={idx} className="text-slate-800">
                      <td className="py-3.5 px-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-3">
                        <p className="font-extrabold text-slate-900 text-xs">
                          {item.name || item.title || "Product Item"}
                        </p>
                        {(item.color || item.storage) && (
                          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                            {[item.color, item.storage].filter(Boolean).join(" • ")}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                        {formatBDT(itemPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-900">
                        {itemQty}
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">
                        {formatBDT(itemTotal)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    Product items summary attached with checkout payload
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Calculation */}
        <div className="flex justify-end pt-4 border-t-2 border-slate-200">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatBDT(calculatedSubtotal)}</span>
            </div>

            {shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Shipping & Handling:</span>
                <span className="font-semibold text-slate-900">{formatBDT(shippingFee)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount Applied:</span>
                <span>-{formatBDT(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-slate-950 pt-2 border-t-2 border-slate-900">
              <span>Grand Total:</span>
              <span className="text-blue-600">{formatBDT(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Notes & Authorized Signature */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-1">
              Warranty & Return Terms:
            </h5>
            <p className="leading-relaxed text-[11px]">
              7-day official replacement warranty for verified manufacturing defects. Please preserve this invoice for warranty and support claims.
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-slate-700 font-bold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thank you for shopping with MSI MOBILE.COM!</span>
            </div>
          </div>

          <div className="sm:text-right flex flex-col justify-end items-start sm:items-end">
            <div className="w-44 border-b border-slate-400 mb-1.5" />
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider">
              Authorized Signature & Seal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
