"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/lib/auth-context";
import { formatBDT } from "@/utils/formatters";
import {
  CreditCard,
  Truck,
  MapPin,
  Phone,
  User,
  Mail,
  AlertCircle,
  Loader2,
  Lock,
  CheckCircle2,
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const {
    cart,
    cartCount,
    cartSubtotal,
    discountAmount,
    shippingCharge,
    cartTotal,
    appliedCoupon,
    clearCart,
  } = useStore();

  // Form States
  const [name, setName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState(profile?.address || "");
  const [district, setDistrict] = useState(profile?.district || "Dhaka");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "bKash" | "Nagad" | "Card">("COD");
  const [saveAddress, setSaveAddress] = useState(true);

  // Status States
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync profile data once loaded
  useEffect(() => {
    if (profile?.full_name && !name) setName(profile.full_name);
    if (user?.email && !email) setEmail(user.email);
    if (profile?.phone && !phone) setPhone(profile.phone);
    if (profile?.address && !address) setAddress(profile.address);
    if (profile?.district && !district) setDistrict(profile.district);
  }, [profile, user, name, email, phone, address, district]);

  // If cart is empty and not submitting, redirect to /cart
  useEffect(() => {
    if (cart.length === 0 && !submitting) {
      router.push("/cart");
    }
  }, [cart, submitting, router]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);

    if (!name.trim() || !phone.trim() || !address.trim() || !district.trim()) {
      setErrorMessage("Please fill in all required shipping address fields.");
      setSubmitting(false);
      return;
    }

    // Validate real integer IDs for all items in cart
    const invalidItems = cart.filter((item) => {
      const pId = Number(item.product.id);
      return isNaN(pId) || pId <= 0;
    });

    if (invalidItems.length > 0) {
      setErrorMessage("One or more items in your cart has an invalid product identifier. Please remove and re-add the item from the catalog.");
      setSubmitting(false);
      return;
    }

    // Format items payload with real integer product_id and variation_id
    const orderItemsPayload = cart.map((item) => {
      const pId = Number(item.product.id);
      const vId = item.selectedVariationId ? Number(item.selectedVariationId) : null;
      return {
        product_id: pId,
        variation_id: vId && !isNaN(vId) && vId > 0 ? vId : null,
        quantity: item.quantity,
        client_unit_price: item.product.price,
      };
    });

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id || null,
          customer_name: name.trim(),
          customer_email: email ? email.trim() : null,
          customer_phone: phone.trim(),
          shipping_address: {
            address: address.trim(),
            district: district.trim(),
            save_to_profile: saveAddress,
          },
          items: orderItemsPayload,
          expected_subtotal: cartSubtotal,
          expected_total: cartTotal,
          payment_method: paymentMethod,
          coupon_code: appliedCoupon?.code || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 409) {
          setErrorMessage(data.message || "Stock unavailable: One or more selected items is out of stock. Please update your cart.");
        } else if (res.status === 400 && data.code === "PRICE_MISMATCH") {
          setErrorMessage("Prices have changed since you added items to your cart. Please review your cart total.");
        } else {
          setErrorMessage(data.message || "Failed to process your order. Please check item stock.");
        }
        setSubmitting(false);
        return;
      }

      // Order created successfully!
      clearCart();
      router.push(`/checkout/success?orderId=${data.order_id}&method=${paymentMethod}`);
    } catch (err: unknown) {
      console.error("Order submission error:", err);
      const msg = err instanceof Error ? err.message : "Failed to connect to checkout service.";
      setErrorMessage(msg);
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        {/* Checkout Header */}
        <div className="border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/cart" className="hover:text-brand-primary">
              Cart
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Secure Checkout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-brand-primary" />
            <span>Shipping & Payment</span>
          </h1>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-600 text-xs font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Columns: Shipping + Payment Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Address Box */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    1. Shipping Information
                  </h3>
                </div>

                <div className="space-y-3.5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Raihan Ahmed"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone & Email (2 cols) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Email Address (Optional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* District & City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      District / City <span className="text-rose-500">*</span>
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

                  {/* Full Street Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Delivery Street Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House #, Road #, Area, Landmark..."
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 focus:border-brand-primary rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                    />
                  </div>

                  {user && (
                    <label className="flex items-center gap-2 text-xs text-slate-600 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="rounded border-slate-300 text-brand-primary focus:ring-0 w-4 h-4"
                      />
                      <span>Save this delivery address to my account profile</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CreditCard className="w-4 h-4 text-brand-primary" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    2. Payment Method
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: COD */}
                  <label
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === "COD"
                        ? "border-brand-primary bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="mt-1 text-brand-primary focus:ring-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-brand-primary" />
                        <span>Cash on Delivery</span>
                      </span>
                      <p className="text-[11px] text-slate-500">Pay cash upon device inspection at your doorstep</p>
                    </div>
                  </label>

                  {/* Option 2: bKash */}
                  <label
                    onClick={() => setPaymentMethod("bKash")}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === "bKash"
                        ? "border-brand-primary bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "bKash"}
                      onChange={() => setPaymentMethod("bKash")}
                      className="mt-1 text-brand-primary focus:ring-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-pink-600 font-extrabold text-sm">bKash</span>
                        <span>Direct Gateway</span>
                      </span>
                      <p className="text-[11px] text-slate-500">Instant verification via SSLCOMMERZ gateway</p>
                    </div>
                  </label>

                  {/* Option 3: Nagad */}
                  <label
                    onClick={() => setPaymentMethod("Nagad")}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === "Nagad"
                        ? "border-brand-primary bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "Nagad"}
                      onChange={() => setPaymentMethod("Nagad")}
                      className="mt-1 text-brand-primary focus:ring-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-amber-600 font-extrabold text-sm">Nagad</span>
                        <span>Payment</span>
                      </span>
                      <p className="text-[11px] text-slate-500">Fast 0% fee digital payment</p>
                    </div>
                  </label>

                  {/* Option 4: Debit/Credit Card */}
                  <label
                    onClick={() => setPaymentMethod("Card")}
                    className={`p-4 rounded-xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === "Card"
                        ? "border-brand-primary bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "Card"}
                      onChange={() => setPaymentMethod("Card")}
                      className="mt-1 text-brand-primary focus:ring-0"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                        <span>Debit / Credit Card</span>
                      </span>
                      <p className="text-[11px] text-slate-500">Visa, Mastercard, Amex via SSLCOMMERZ</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Order Summary Breakdown */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 sticky top-24">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                  Items Snapshot ({cartCount})
                </h3>

                {/* Items Mini List */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 text-xs">
                      <div className="relative w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                        <span className="text-[10px] text-slate-500">Qty: {item.quantity}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">
                        {formatBDT(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">{formatBDT(cartSubtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount ({appliedCoupon?.code})</span>
                      <span>-{formatBDT(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-slate-900">
                      {shippingCharge === 0 ? "৳0 (Free)" : formatBDT(shippingCharge)}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                    <span className="text-sm font-extrabold text-slate-900">Final Total</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-brand-primary block leading-tight">
                        {formatBDT(cartTotal)}
                      </span>
                      <span className="text-[10px] text-slate-400">Server Verified at Checkout</span>
                    </div>
                  </div>
                </div>

                {/* Place Order CTA Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brand-primary hover:bg-brand-primary-dark active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {paymentMethod === "COD" ? "Confirm Order (COD)" : `Pay with ${paymentMethod}`}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/cart"
                    className="text-xs text-slate-500 hover:text-brand-primary font-semibold"
                  >
                    ← Edit Cart Items
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
