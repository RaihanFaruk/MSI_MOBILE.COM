import React from "react";

/**
 * Skeleton for standard product card matching luxury ProductCard.tsx layout exactly
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-0 overflow-hidden animate-pulse">
      {/* Image container skeleton */}
      <div className="relative aspect-square w-full bg-neutral-100/90 flex items-center justify-center p-4">
        <div className="w-1/2 h-1/2 bg-neutral-200/70 rounded-xl" />
      </div>

      {/* Card Details skeleton */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-2">
          {/* Brand pill */}
          <div className="w-16 h-2.5 bg-neutral-200 rounded-full" />
          {/* Title 2 lines */}
          <div className="w-full h-4 bg-neutral-200 rounded-md" />
          <div className="w-2/3 h-4 bg-neutral-200 rounded-md" />
          {/* Specs tag */}
          <div className="w-24 h-3 bg-neutral-100 rounded-md mt-1" />
        </div>

        <div className="pt-2.5 border-t border-neutral-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="w-20 h-5 bg-neutral-200 rounded-md" />
            <div className="w-12 h-3 bg-neutral-100 rounded-md" />
          </div>
          <div className="w-8 h-8 rounded-xl bg-neutral-200" />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for standard 4-column product grid section
 */
export const ProductSectionSkeleton: React.FC<{
  title?: string;
  subtitle?: string;
  count?: number;
  bgLight?: boolean;
}> = ({
  count = 4,
  bgLight = false,
}) => {
  return (
    <section className={`py-10 sm:py-14 border-b border-neutral-200/60 ${bgLight ? "bg-[#FAF9F6]" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header skeleton */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 animate-pulse">
          <div className="space-y-1.5">
            <div className="w-24 h-3 bg-neutral-200 rounded" />
            <div className="w-44 sm:w-64 h-6 bg-neutral-200 rounded-lg" />
          </div>
          <div className="w-20 h-4 bg-neutral-200 rounded" />
        </div>

        {/* 4 Cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Skeleton for the Flash Sale banner & grid
 */
export const FlashSaleSkeleton: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner Skeleton */}
        <div className="bg-obsidian-950 rounded-2xl p-5 text-white mb-6 animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4 border border-gold-500/20">
          <div className="w-48 h-8 bg-neutral-800 rounded-xl" />
          <div className="w-36 h-10 bg-neutral-800 rounded-xl" />
        </div>

        {/* 4 Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Skeleton for Laptop section (LaptopCard layout)
 */
export const LaptopSectionSkeleton: React.FC = () => {
  return (
    <section className="py-10 sm:py-14 bg-[#FAF9F6] border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 sm:mb-8 animate-pulse">
          <div className="space-y-1.5">
            <div className="w-24 h-3 bg-neutral-200 rounded" />
            <div className="w-44 sm:w-64 h-6 bg-neutral-200 rounded-lg" />
          </div>
          <div className="w-20 h-4 bg-neutral-200 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-neutral-200/80 p-4 animate-pulse flex flex-col sm:flex-row gap-4"
            >
              <div className="w-full sm:w-5/12 h-44 bg-neutral-100 rounded-xl" />
              <div className="flex-1 space-y-2 py-1">
                <div className="w-20 h-3 bg-neutral-200 rounded" />
                <div className="w-full h-5 bg-neutral-200 rounded" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-4 bg-neutral-100 rounded" />
                  <div className="h-4 bg-neutral-100 rounded" />
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <div className="w-24 h-6 bg-neutral-200 rounded" />
                  <div className="w-20 h-8 bg-neutral-200 rounded-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Skeleton for Category Circular Grid
 */
export const CategoryGridSkeleton: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-white border-b border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-100" />
              <div className="w-12 h-3 bg-neutral-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
