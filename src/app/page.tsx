"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { TopBar } from "@/components/header/TopBar";
import { Header } from "@/components/header/Header";
import { CategoryNav } from "@/components/header/CategoryNav";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TrustBadges } from "@/components/home/TrustBadges";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FlashSaleBanner } from "@/components/home/FlashSaleBanner";
import { BestDeals } from "@/components/home/BestDeals";
import { BrandsRow } from "@/components/home/BrandsRow";
import { NewArrivals } from "@/components/home/NewArrivals";
import { TrendingNow } from "@/components/home/TrendingNow";
import { SmartphonesSection } from "@/components/home/SmartphonesSection";
import { PowerfulLaptops } from "@/components/home/PowerfulLaptops";
import { GadgetsSection } from "@/components/home/GadgetsSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Testimonials } from "@/components/home/Testimonials";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { Footer } from "@/components/footer/Footer";
import {
  ProductSectionSkeleton,
  FlashSaleSkeleton,
  TestimonialsSkeleton,
} from "@/components/home/skeletons/HomeSkeletons";

// Code splitting: Heavy / interactive below-the-fold components
const QuickViewModal = dynamic(
  () => import("@/components/common/QuickViewModal").then((mod) => mod.QuickViewModal),
  { ssr: false }
);

const ToastContainer = dynamic(
  () => import("@/components/common/Toast").then((mod) => mod.ToastContainer),
  { ssr: false }
);

const Newsletter = dynamic(
  () => import("@/components/home/Newsletter").then((mod) => mod.Newsletter),
  { ssr: false }
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-white antialiased">
      {/* ========================================================================= */}
      {/* ⚡ INSTANT SHELL (Header, Navigation, Hero & Static Badges)                 */}
      {/* ========================================================================= */}
      {/* Tier 1: Top Utility Bar */}
      <TopBar />

      {/* Tier 2: Main Header with Search & Cart */}
      <Header />

      {/* Tier 3: Category Navigation Bar (Desktop) */}
      <CategoryNav />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Carousel (LCP optimized with sizes & priority) */}
        <HeroCarousel />

        {/* 2. Trust Badges Row (Static shell) */}
        <TrustBadges />

        {/* 3. Shop by Categories */}
        <CategoryGrid />

        {/* ========================================================================= */}
        {/* 🌊 PROGRESSIVE STREAMING (Data-Dependent Sections with Skeletons)         */}
        {/* ========================================================================= */}

        {/* 4. Flash Sale Banner with Live Countdown Timer */}
        <Suspense fallback={<FlashSaleSkeleton />}>
          <FlashSaleBanner />
        </Suspense>

        {/* 5. Best Deals */}
        <Suspense
          fallback={
            <ProductSectionSkeleton
              title="Best Deals"
              subtitle="Exclusive handpicked discounts on top tech"
              bgLight
            />
          }
        >
          <BestDeals />
        </Suspense>

        {/* 6. Popular Brands Pills (Static shell) */}
        <BrandsRow />

        {/* 7. New Arrivals */}
        <Suspense
          fallback={
            <ProductSectionSkeleton
              title="New Arrivals"
              subtitle="Just landed in our inventory with official warranty"
            />
          }
        >
          <NewArrivals />
        </Suspense>

        {/* 8. Trending Now 🔥 */}
        <Suspense
          fallback={
            <ProductSectionSkeleton
              title="Trending Now"
              subtitle="Most viewed & ordered devices in Bangladesh this week"
              bgLight
            />
          }
        >
          <TrendingNow />
        </Suspense>

        {/* 9. Latest Smartphones (Brand Filters) */}
        <Suspense
          fallback={
            <ProductSectionSkeleton
              title="Latest Smartphones"
              subtitle="Official global & TRCS verified devices with BTRC approval"
            />
          }
        >
          <SmartphonesSection />
        </Suspense>

        {/* 10. Powerful Laptops */}
        <Suspense
          fallback={
            <ProductSectionSkeleton
              title="Powerful Laptops & Workstations"
              subtitle="High-performance machines for gaming, 3D rendering and professional creators"
              count={2}
              bgLight
            />
          }
        >
          <PowerfulLaptops />
        </Suspense>

        {/* 11. Gadgets & Accessories */}
        <Suspense
          fallback={
            <ProductSectionSkeleton
              title="Gadgets & Accessories"
              subtitle="Premium audio, fast chargers, power banks and lifestyle gear"
            />
          }
        >
          <GadgetsSection />
        </Suspense>

        {/* 12. Promo CTA Banner (Static shell) */}
        <PromoBanner />

        {/* 13. Customer Testimonials */}
        <Suspense fallback={<TestimonialsSkeleton />}>
          <Testimonials />
        </Suspense>

        {/* 14. Why Choose Us (Static shell) */}
        <WhyChooseUs />

        {/* 15. Newsletter (Dynamically loaded below the fold) */}
        <Newsletter />
      </main>

      {/* 16. Footer */}
      <Footer />

      {/* Global Modals (Lazy client-only) */}
      <QuickViewModal />
      <ToastContainer />
    </div>
  );
}
