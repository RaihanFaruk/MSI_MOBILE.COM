import React from "react";
import { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { Truck, Clock, MapPin, ShieldCheck, Box } from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping & Delivery Information — MSI MOBILE.COM",
  description: "Learn about MSI MOBILE's super-fast nationwide delivery times, shipping charges across Bangladesh, and packaging safety standards.",
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 text-brand-primary mb-3">
              <Truck className="w-6 h-6" />
              <span className="text-xs uppercase tracking-widest font-extrabold">Delivery Network</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Shipping & Delivery Times</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Fast, Secured & Insured Nationwide Delivery in 64 Districts of Bangladesh
            </p>
          </div>

          {/* Delivery Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-brand-primary font-bold text-sm sm:text-base">
                <MapPin className="w-5 h-5" />
                <span>ঢাকা সিটির ভেতরে (Inside Dhaka)</span>
              </div>
              <p className="text-2xl font-black text-slate-900">৳৬০ ডেলিভারি চার্জ</p>
              <p className="text-xs text-slate-600">সময়: ২৪ থেকে ৪৮ ঘণ্টার মধ্যে হোম ডেলিভারি</p>
            </div>

            <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm sm:text-base">
                <Truck className="w-5 h-5" />
                <span>ঢাকার বাইরে সমগ্র বাংলাদেশ (Outside Dhaka)</span>
              </div>
              <p className="text-2xl font-black text-slate-900">৳১২০ ডেলিভারি চার্জ</p>
              <p className="text-xs text-slate-600">সময়: ২ থেকে ৪ কর্মদিবসের মধ্যে সুরক্ষিত কুরিয়ার ডেলিভারি</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Box className="w-5 h-5 text-brand-primary" />
                <span>১. বাবল-র‌্যাপড সিকিউরড প্যাকেজিং (Secured Packaging)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                যেহেতু স্মার্টফোন ও ল্যাপটপ সংবেদনশীল ইলেকট্রনিক পণ্য, তাই প্রতিটি পার্সেল ৩-লেয়ার বাবল র‌্যাপ ও ওয়াটারপ্রুফ সিকিউরিটি ট্যাপার-এভিডেন্ট প্যাকেজিংয়ে সিল করে পাঠানো হয়।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-brand-primary" />
                <span>২. লাইভ পার্সেল ট্র্যাকিং (Live Tracking)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                অর্ডার নিশ্চিত হওয়ার সাথে সাথেই আপনাকে একটি ইউনিক ট্র্যাকিং আইডি দেওয়া হয়। আমাদের ওয়েবসাইটের <strong>Track Order</strong> পেজে গিয়ে আপনি যেকোনো সময় আপনার পার্সেলের অবস্থান ও ডেলিভারি স্ট্যাটাস দেখতে পারবেন।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-primary" />
                <span>৩. ডেলিভারির সময় পণ্য যাচাই (Open Box Inspection)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                ডেলিভারিম্যানের উপস্থিতিতে পার্সেলের বাইরের প্যাকেজ অক্ষত আছে কিনা তা যাচাই করুন এবং পণ্য বুঝে নিয়ে ক্যাশ অন ডেলিভারি পেমেন্ট সম্পন্ন করুন।
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
