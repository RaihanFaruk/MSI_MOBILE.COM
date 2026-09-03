import React from "react";
import { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — MSI MOBILE.COM",
  description: "Learn how MSI MOBILE.COM collects, protects, and uses your personal and order data in compliance with standard e-commerce privacy regulations in Bangladesh.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 text-brand-primary mb-3">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs uppercase tracking-widest font-extrabold">Legal & Security</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Privacy Policy</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Last updated: September 2026 • Effective for all MSI MOBILE customers in Bangladesh
            </p>
          </div>

          {/* Content Sections */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand-primary" />
                <span>১. তথ্য সংগ্রহ ও ব্যবহার (Information Collection)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                MSI MOBILE.COM আপনার অর্ডার প্রসেসিং, ডেলিভারি সম্পন্নকরণ এবং কাস্টমার সার্ভিসের জন্য প্রয়োজনীয় তথ্য যেমন— আপনার নাম, ডেলিভারি ঠিকানা, মোবাইল নম্বর ও ইমেইল সংগ্রহ করে। আমরা আপনার তথ্যের সর্বোচ্চ নিরাপত্তা নিশ্চিত করি।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-primary" />
                <span>২. পেমেন্ট ও লেনদেনের নিরাপত্তা (Payment Security)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                আমরা কখনোই আপনার ক্রেডিট/ডেবিট কার্ডের সিভিভি (CVV) বা বিকাশ/নগদের গোপন পিন আমাদের সার্ভারে সংরক্ষণ করি না। সব ধরনের অনলাইন পেমেন্ট বাংলাদেশের বাংলাদেশ ব্যাংক অনুমোদিত এসএসএল (SSL Encrypted) সুরক্ষিত গেটওয়ের মাধ্যমে সম্পন্ন হয়।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-primary" />
                <span>৩. তৃতীয় পক্ষের সাথে তথ্য শেয়ারিং (Third-Party Sharing)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                শুধুমাত্র আপনার পার্সেল আপনার ঠিকানায় পৌঁছে দেওয়ার উদ্দেশ্যে আমাদের অনুমোদিত কুরিয়ার পার্টনারদের (যেমন— RedX, Steadfast, Pathao) সাথে আপনার নাম, ফোন নম্বর ও ডেলিভারি ঠিকানা শেয়ার করা হয়। কোনো প্রকার বাণিজ্যিক বিজ্ঞাপন বা স্প্যামিংয়ের জন্য কোনো তৃতীয় পক্ষের কাছে গ্রাহকের ডাটা বিক্রি করা হয় না।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                <span>৪. আপনার অধিকার ও নিয়ন্ত্রণ (Your Rights)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                আপনি যেকোনো সময় আপনার MSI Mobile একাউন্টে লগইন করে আপনার সংরক্ষিত প্রোফাইল তথ্য আপডেট বা পরিবর্তন করতে পারেন। প্রয়োজনে একাউন্ট মুছে ফেলার জন্য আমাদের সাপোর্ট সেন্টারে যোগাযোগ করতে পারেন।
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
