"use client";

import React from "react";
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
import { Newsletter } from "@/components/home/Newsletter";
import { Footer } from "@/components/footer/Footer";
import { QuickViewModal } from "@/components/common/QuickViewModal";
import { ToastContainer } from "@/components/common/Toast";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-white antialiased">
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

        {/* 2. Trust Badges Row */}
        <TrustBadges />

        {/* 3. Shop by Categories */}
        <CategoryGrid />

        {/* 4. Flash Sale Banner with Live Countdown Timer */}
        <FlashSaleBanner />

        {/* 5. Best Deals */}
        <BestDeals />

        {/* 6. Popular Brands Pills */}
        <BrandsRow />

        {/* 7. New Arrivals */}
        <NewArrivals />

        {/* 8. Trending Now 🔥 */}
        <TrendingNow />

        {/* 9. Latest Smartphones (Brand Filters) */}
        <SmartphonesSection />

        {/* 10. Powerful Laptops */}
        <PowerfulLaptops />

        {/* 11. Gadgets & Accessories */}
        <GadgetsSection />

        {/* 12. Promo CTA Banner */}
        <PromoBanner />

        {/* 13. Customer Testimonials */}
        <Testimonials />

        {/* 14. Why Choose Us */}
        <WhyChooseUs />

        {/* 15. Newsletter */}
        <Newsletter />
      </main>

      {/* 16. Footer */}
      <Footer />

      {/* Global Modals */}
      <QuickViewModal />
      <ToastContainer />
    </div>
  );
}
