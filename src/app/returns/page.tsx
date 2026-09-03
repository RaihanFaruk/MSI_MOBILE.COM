import React from "react";
import { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { RotateCcw, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Return & Replacement Policy — MSI MOBILE.COM",
  description: "Read MSI MOBILE's hassle-free 7-day replacement guarantee and official warranty claim procedures in Bangladesh.",
};

export default function ReturnsPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 text-brand-primary mb-3">
              <RotateCcw className="w-6 h-6" />
              <span className="text-xs uppercase tracking-widest font-extrabold">Customer Assurance</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Returns & Warranty Policy</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              7-Day Instant Replacement Guarantee on Manufacturing Defects
            </p>
          </div>

          {/* Content */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span>১. ৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি (7-Day Replacement)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                পণ্য ডেলিভারি পাওয়ার ৭ দিনের মধ্যে যদি কোনো ফ্যাক্টরি ত্রুটি (Manufacturing Defect / Hardware Fault) দেখা দেয়, তবে গ্রাহক সম্পূর্ণ বিনামূল্যে ডিভাইস রিপ্লেসমেন্ট পাবেন। এর জন্য মূল বক্স, আনুষঙ্গিক ক্যাবল/চার্জার এবং ইনভয়েস অক্ষত থাকতে হবে।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-rose-500" />
                <span>২. যেসব ক্ষেত্রে রিটার্ন প্রযোজ্য নয় (Non-Returnable Cases)</span>
              </h2>
              <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
                <li>শারীরিক ক্ষতি, হাত থেকে পড়ে যাওয়া, বা তরল পদার্থ প্রবেশের ফলে সৃষ্ট ক্ষতি (Water/Liquid Damage)।</li>
                <li>ডিভাইসের অফিসিয়াল সফটওয়্যার অননুমোদিতভাবে মডিফাই (Root / Custom ROM / Jailbreak) করা হলে।</li>
                <li>ইনট্যাক্ট সিল ভাঙার পর কোনো ত্রুটি ছাড়া শুধুমাত্র পছন্দ পরিবর্তন বা মাইন্ড চেঞ্জের কারণে।</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                <span>৩. রিফান্ড প্রক্রিয়া (Refund Processing)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                যদি একই মডেলের ডিভাইস স্টকে না থাকে বা বিকল্প পণ্য গ্রাহক নিতে সম্মত না হন, তবে পণ্য আমাদের অফিসে পৌঁছানোর ৩ থেকে ৫ কর্মদিবসের মধ্যে যে মাধ্যমে পেমেন্ট করা হয়েছিল (বিকাশ/নগদ/ব্যাংক কার্ড) সেই মাধ্যমে সম্পূর্ণ টাকা রিফান্ড করে দেওয়া হয়।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-primary" />
                <span>৪. রিটার্ন বা ওয়ারেন্টি ক্লেইম করার নিয়ম</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                রিটার্ন বা ওয়ারেন্টি সার্ভিসের জন্য আপনার অর্ডার নম্বর ও সমস্যার বিবরণ সহ আমাদের হেল্পলাইন <strong>+880 1999-MSIMOB</strong> অথবা <strong>support@msimobile.com.bd</strong>-এ যোগাযোগ করুন।
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
