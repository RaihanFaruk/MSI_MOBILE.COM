import React from "react";
import { Metadata } from "next";
import { Header } from "@/components/header/Header";
import { Footer } from "@/components/footer/Footer";
import { FileCode2, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions — MSI MOBILE.COM",
  description: "Read the official terms and conditions for purchasing genuine smartphones, laptops, and gadgets from MSI MOBILE.COM in Bangladesh.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-slate-50 min-h-screen py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
          {/* Header */}
          <div className="bg-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 text-brand-primary mb-3">
              <Scale className="w-6 h-6" />
              <span className="text-xs uppercase tracking-widest font-extrabold">Agreement</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Terms & Conditions</h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2">
              Please read these terms carefully before placing an order on MSI MOBILE.COM
            </p>
          </div>

          {/* Content */}
          <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xs space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-brand-primary" />
                <span>১. অর্ডার ও মূল্য নির্ধারণ (Order & Pricing)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                MSI MOBILE.COM-এ প্রদর্শিত সকল মূল্য বাংলাদেশি টাকায় (BDT ৳) এবং এতে প্রয়োজনীয় ট্যাক্স অন্তর্ভুক্ত। কোনো প্রযুক্তিগত ত্রুটির কারণে পণ্যের মূল্যে গরমিল দেখা দিলে, অর্ডার কনফার্মেশনের পূর্বে গ্রাহককে অবগত করে সংশোধিত মূল্যে অর্ডার অনুমোদন বা বাতিলের পূর্ণ অধিকার কর্তৃপক্ষ সংরক্ষণ করে।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                <span>২. ১০০% অরিজিনাল পণ্যের গ্যারান্টি (Authenticity Guarantee)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                আমরা সরাসরি অফিসিয়াল ব্র্যান্ড ডিস্ট্রিবিউটর থেকে ইনট্যাক্ট ও অথেন্টিক প্রোডাক্ট সরবরাহ করি। প্রতিটি ডিভাইসের সাথে অফিসিয়াল ব্র্যান্ডের নির্দিষ্ট ওয়ারেন্টি নীতিমালা প্রযোজ্য হবে।
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-brand-primary" />
                <span>৩. ক্যাশ অন ডেলিভারি ও অর্ডার বাতিল (COD & Cancellations)</span>
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                ক্যাশ অন ডেলিভারিতে অর্ডার করার পর পার্সেল ডেলিভারিম্যান থেকে গ্রহণের সময় পণ্য চেক করে পেমেন্ট সম্পন্ন করতে হবে। পার্সেল ডেলিভারির উদ্দেশ্যে প্রেরিত হওয়ার পর অহেতুক পণ্য গ্রহণে অস্বীকৃতি জানালে পরবর্তী সময়ে উক্ত একাউন্টের সিওডি সুবিধা সীমিত করা হতে পারে।
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
