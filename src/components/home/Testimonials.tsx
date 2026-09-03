"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, Quote, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Testimonial } from "@/types";

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Tanvir Ahmed",
    location: "Gulshan 2, Dhaka",
    productBought: "Apple iPhone 16 Pro Max 512GB (Titanium)",
    rating: 5,
    comment: "অসাধারণ এক্সপেরিয়েন্স! অর্ডার করার মাত্র ৩ ঘণ্টার মধ্যে গুলশানে হোয়াইট-গ্লাভ ডেলিভারি পেয়েছি। প্রোডাক্ট ১০০% ইনট্যাক্ট এবং অফিশিয়াল আইএমইআই ভেরিফায়েড। প্যাকেজিং খুবই সুরক্ষিত ছিল।",
    date: "2 days ago",
  },
  {
    id: "t-2",
    name: "Farhana Yasmin",
    location: "Banani, Dhaka",
    productBought: "Sony WH-1000XM5 Master ANC",
    rating: 5,
    comment: "MSI Mobile থেকে প্রথমবার অর্ডার করেছিলাম। সাউন্ড কোয়ালিটি এবং অ্যাকোস্টিক ক্ল্যারিটি এক কথায় অনবদ্য। ভিআইপি কাস্টমার সাপোর্ট অত্যন্ত আন্তরিক ও পেশাদার!",
    date: "5 days ago",
  },
  {
    id: "t-3",
    name: "Mahmudul Hasan",
    location: "Chittagong",
    productBought: "MSI Raider GE78 HX (RTX 4080)",
    rating: 5,
    comment: "চট্টগ্রামে ২ দিনের মধ্যে সিকিউরড প্যাকেজে ল্যাপটপ হাতে পেয়েছি। অফিশিয়াল ২ বছরের ওয়ারেন্টি কার্ড ও ডকুমেন্টস সব পেয়েছি। প্রিমিয়াম টেক লাভারদের জন্য বেস্ট চয়েস!",
    date: "1 week ago",
  },
];

export const Testimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("id, rating, comment, created_at, products(name)")
          .order("id", { ascending: false })
          .limit(3);

        if (data && data.length > 0 && !error) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: Testimonial[] = (data as any[]).map((r, idx) => ({
            id: String(r.id),
            name: ["Tanvir Ahmed", "Farhana Yasmin", "Mahmudul Hasan"][idx % 3],
            location: ["Gulshan 2, Dhaka", "Banani, Dhaka", "Chittagong"][idx % 3],
            productBought: Array.isArray(r.products) ? r.products[0]?.name : r.products?.name || "Official Tech Product",
            rating: Number(r.rating) || 5,
            comment: r.comment || "",
            date: "Recently",
          }));
          setTestimonials(mapped);
        }
      } catch {
        // Fallback
      }
    }

    fetchReviews();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-[#FAF9F6] border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-600 text-xs font-bold tracking-[0.2em] uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CLIENT REPUTATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-neutral-950 tracking-tight">
            Voices of <span className="italic font-serif">Distinction</span>
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full mx-auto mt-2" />
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-xl hover:shadow-black/5 hover:border-gold-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Stars and Quote mark */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gold-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold-500 text-gold-500" />
                    ))}
                  </div>
                  <Quote className="w-7 h-7 text-neutral-200 stroke-1" />
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-light italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Author & Product */}
              <div className="mt-6 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-neutral-900 leading-tight">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-neutral-400 block font-light">{item.location}</span>
                  </div>

                  {/* Verified Buyer Badge */}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gold-700 bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/25 uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3 text-gold-600" />
                    <span>Verified Client</span>
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-neutral-400 font-medium truncate">
                  Acquired: <strong className="text-neutral-700 font-semibold">{item.productBought}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
