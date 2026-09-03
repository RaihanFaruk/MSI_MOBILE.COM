"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight, ShieldCheck, Crown } from "lucide-react";

interface HeroSlide {
  id: number;
  badge: string;
  headline: string;
  headlineHighlight: string;
  subtext: string;
  primaryBtnText: string;
  primaryBtnLink: string;
  secondaryBtnText: string;
  secondaryBtnLink: string;
  image: string;
  productName: string;
  offerTag: string;
}

const SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: "THE HAUTE TECH COLLECTION",
    headline: "Unrivaled Craftsmanship &",
    headlineHighlight: "Pure Power",
    subtext: "Experience the pinnacle of mobile engineering with genuine titanium flagships, official brand warranty, and bespoke concierge delivery across Bangladesh.",
    primaryBtnText: "Explore Flagships",
    primaryBtnLink: "#smartphones",
    secondaryBtnText: "Curated Deals",
    secondaryBtnLink: "#flash-sale",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    productName: "iPhone 16 Pro Max • Natural Titanium",
    offerTag: "Privilege Savings ৳16,000",
  },
  {
    id: 2,
    badge: "WORKSTATIONS & ELITE GAMING",
    headline: "Engineered for Supreme",
    headlineHighlight: "Dominance",
    subtext: "Surpass every boundary with Intel 14th Gen & NVIDIA RTX 4090 powerhouse machines from MSI, ASUS ROG & Razer Blade with 2-Year official warranty.",
    primaryBtnText: "View Laptops",
    primaryBtnLink: "#laptops",
    secondaryBtnText: "Specifications",
    secondaryBtnLink: "#laptops",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
    productName: "MSI Raider GE78 HX (RTX 4080)",
    offerTag: "Complimentary Elite Kit",
  },
  {
    id: 3,
    badge: "ACOUSTIC LUXURY & WEARABLES",
    headline: "Acoustic Perfection &",
    headlineHighlight: "Timeless Design",
    subtext: "Immerse yourself in audiophile-grade active noise cancellation and mastercrafted wearable horology from Sony, Apple, Bang & Olufsen.",
    primaryBtnText: "Discover Audio",
    primaryBtnLink: "#gadgets",
    secondaryBtnText: "New Arrivals",
    secondaryBtnLink: "#new-arrivals",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80",
    productName: "Sony WH-1000XM5 • Master ANC",
    offerTag: "Exclusive VIP Edition",
  },
];

export const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <section className="relative bg-obsidian-950 text-white overflow-hidden tech-circuit-pattern border-b border-amber-500/15">
      {/* Background ambient luxury gold lighting */}
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-96 h-96 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 py-10 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Luxury Typography Content */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-5 sm:space-y-7 text-left">
            {/* Promotion Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 backdrop-blur-md text-gold-400 text-xs font-semibold tracking-[0.18em] uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>{slide.badge}</span>
            </div>

            {/* Main Headline with Serif Elegance */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight leading-[1.12] text-white">
              {slide.headline}{" "}
              <span className="font-serif italic font-medium gold-gradient-text block sm:inline">
                {slide.headlineHighlight}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-neutral-400 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed font-light">
              {slide.subtext}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 pt-2">
              <a
                href={slide.primaryBtnLink}
                className="bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 hover:from-gold-300 hover:to-gold-500 active:scale-95 text-obsidian-950 font-black tracking-wider uppercase px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm shadow-xl shadow-gold-500/20 transition-all duration-200 cursor-pointer"
              >
                <span>{slide.primaryBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={slide.secondaryBtnLink}
                className="border border-amber-500/30 hover:border-gold-400/80 bg-obsidian-900/80 hover:bg-gold-500/10 active:scale-95 text-neutral-200 hover:text-gold-300 font-bold tracking-wider uppercase px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm backdrop-blur-md transition-all duration-200 cursor-pointer"
              >
                <span>{slide.secondaryBtnText}</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex items-center gap-6 text-xs text-neutral-400 border-t border-neutral-800/80 w-full">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-gold-400" />
                <span className="font-medium text-neutral-300">100% Genuine Luxury Tech</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                <span className="font-medium text-neutral-300">Official Brand Warranty</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Product Showcase */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Offer floating luxury badge */}
            <div className="absolute top-2 right-4 sm:right-8 z-20 bg-obsidian-900/95 text-gold-400 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-2xl border border-gold-500/40 backdrop-blur-md">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gold-400" />
                <span>{slide.offerTag}</span>
              </span>
            </div>

            {/* Product image with golden backlight glow */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              {/* Gold Halo Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-gold-500/25 via-amber-600/15 to-transparent rounded-full blur-3xl transform scale-95" />

              <div className="relative w-full h-full animate-float">
                <Image
                  src={slide.image}
                  alt={slide.productName}
                  fill
                  priority
                  sizes="(max-width: 640px) 256px, (max-width: 768px) 320px, 384px"
                  className="object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)]"
                />
              </div>
            </div>

            {/* Product Label */}
            <div className="mt-3 bg-obsidian-900/90 backdrop-blur-md px-5 py-2 rounded-full border border-amber-500/25 text-xs font-semibold text-neutral-300 shadow-xl tracking-wide">
              {slide.productName}
            </div>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-800/80">
          <div className="flex items-center gap-2">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index
                    ? "w-8 bg-gradient-to-r from-gold-400 to-gold-600"
                    : "w-2 bg-neutral-700 hover:bg-neutral-500"
                }`}
              />
            ))}
          </div>

          {/* Prev/Next arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
              aria-label="Previous Slide"
              className="p-2 rounded-lg bg-obsidian-900 border border-neutral-800 hover:border-gold-500/40 text-neutral-400 hover:text-gold-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
              aria-label="Next Slide"
              className="p-2 rounded-lg bg-obsidian-900 border border-neutral-800 hover:border-gold-500/40 text-neutral-400 hover:text-gold-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
