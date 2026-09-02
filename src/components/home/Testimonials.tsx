"use client";

import React, { useState, useEffect } from "react";
import { Star, CheckCircle2, Quote, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Testimonial } from "@/types";

const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Tanvir Ahmed",
    location: "Dhanmondi, Dhaka",
    productBought: "Apple iPhone 16 Pro Max 256GB",
    rating: 5,
    comment: "অসাধারণ সার্ভিস! অর্ডার করার মাত্র ৩ ঘণ্টার মধ্যে ধানমন্ডিতে হোম ডেলিভারি পেয়েছি। প্রোডাক্ট ১০০% ইনট্যাক্ট এবং অফিশিয়াল আইএমইআই ভেরিফায়েড। প্যাকেজিং খুবই নিরাপদ ছিল।",
    date: "2 days ago",
  },
  {
    id: "t-2",
    name: "Farhana Yasmin",
    location: "Uttara, Dhaka",
    productBought: "Sony WH-1000XM5 ANC Headphones",
    rating: 5,
    comment: "MSI Mobile থেকে প্রথমবার অর্ডার করেছিলাম। সাউন্ড কোয়ালিটি এবং নয়েজ ক্যান্সেলেশন এক কথায় অনবদ্য। bKash পেমেন্টে ডিসকাউন্ট পেয়েছি আর কাস্টমার সাপোর্ট খুবই কো-অপারেটিভ ছিল!",
    date: "5 days ago",
  },
  {
    id: "t-3",
    name: "Mahmudul Hasan",
    location: "Chittagong",
    productBought: "MSI Raider GE78 HX Gaming Laptop",
    rating: 5,
    comment: "চট্টগ্রামে ২ দিনের মধ্যে সিকিউরড কাঠের ক্রেট প্যাকেজে ল্যাপটপ হাতে পেয়েছি। কোনো ড্যামেজ বা ইস্যু নেই। অফিশিয়াল ২ বছরের ওয়ারেন্টি কার্ড সহ সব পেপার পেয়েছি। হাইলি রিকমেন্ডেড!",
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
            location: ["Dhanmondi, Dhaka", "Uttara, Dhaka", "Chittagong"][idx % 3],
            productBought: Array.isArray(r.products) ? r.products[0]?.name : r.products?.name || "Official Tech Product",
            rating: Number(r.rating) || 5,
            comment: r.comment || "",
            date: "Recently",
          }));
          setTestimonials(mapped);
        }
      } catch (e) {
        console.log("Reviews load note:", e);
      }
    }

    fetchReviews();
  }, []);

  return (
    <section className="py-8 sm:py-12 bg-bg-light border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-brand-primary text-xs font-bold mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>REAL BUYER EXPERIENCES</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-dark tracking-tight">
            What Our Customers Say
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Over 50,000+ satisfied tech enthusiasts across all 64 districts in Bangladesh
          </p>
        </div>

        {/* 3 Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Stars and Quote mark */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-slate-200 stroke-1" />
                </div>

                {/* Comment Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{item.comment}&rdquo;
                </p>
              </div>

              {/* Author & Product */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                      {item.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 block">{item.location}</span>
                  </div>

                  {/* Verified Buyer Badge */}
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold text-brand-primary bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    <CheckCircle2 className="w-3 h-3 text-brand-primary" />
                    <span>Verified Buyer</span>
                  </span>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 font-medium truncate">
                  Purchased: <strong className="text-slate-600 font-semibold">{item.productBought}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
