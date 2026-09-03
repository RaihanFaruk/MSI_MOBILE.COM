import React from "react";

/**
 * Skeleton for standard product card matching ProductCard.tsx layout exactly
 */
export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col justify-between bg-white rounded-xl border border-slate-100 shadow-xs p-0 overflow-hidden animate-pulse">
      {/* Image container skeleton */}
      <div className="relative aspect-square w-full bg-slate-100/80 flex items-center justify-center p-4">
        <div className="w-1/2 h-1/2 bg-slate-200/70 rounded-xl" />
      </div>

      {/* Card Details skeleton */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div className="space-y-2">
          {/* Brand pill */}
          <div className="w-16 h-3 bg-slate-200 rounded-full" />
          {/* Title 2 lines */}
          <div className="w-full h-4 bg-slate-200 rounded-md" />
          <div className="w-2/3 h-4 bg-slate-200 rounded-md" />
          {/* Specs tag */}
          <div className="w-24 h-4 bg-slate-100 rounded-md mt-1" />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="space-y-1">
            <div className="w-20 h-5 bg-slate-200 rounded-md" />
            <div className="w-12 h-3 bg-slate-100 rounded-md" />
          </div>
          <div className="w-8 h-8 rounded-lg bg-slate-200" />
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
    <section className={`py-8 sm:py-12 border-b border-slate-200/60 ${bgLight ? "bg-bg-light" : "bg-white"}`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header skeleton */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-200" />
            <div className="space-y-1.5">
              <div className="w-36 sm:w-48 h-6 bg-slate-200 rounded-lg" />
              <div className="w-48 sm:w-64 h-3.5 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="w-20 sm:w-28 h-4 bg-slate-200 rounded-md" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Skeleton for Flash Sale Section with Countdown Banner
 */
export const FlashSaleSkeleton: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 bg-navy-dark text-white relative overflow-hidden border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        {/* Flash Sale Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30" />
            <div className="space-y-1.5">
              <div className="w-40 sm:w-56 h-6 bg-slate-800 rounded-lg" />
              <div className="w-48 h-3.5 bg-slate-800/80 rounded-md" />
            </div>
          </div>

          {/* Countdown timer placeholder */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-12 sm:w-14 h-12 bg-slate-800/90 rounded-xl border border-slate-700/60" />
            ))}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-xl p-0 overflow-hidden animate-pulse flex flex-col justify-between"
            >
              <div className="aspect-square bg-slate-800/60 flex items-center justify-center p-4">
                <div className="w-1/2 h-1/2 bg-slate-700/50 rounded-xl" />
              </div>
              <div className="p-3 sm:p-4 space-y-2.5">
                <div className="w-16 h-3 bg-slate-800 rounded-full" />
                <div className="w-full h-4 bg-slate-800 rounded-md" />
                <div className="w-20 h-5 bg-slate-800 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Skeleton for Testimonials Section
 */
export const TestimonialsSkeleton: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-navy-dark text-white border-b border-slate-800 animate-pulse">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="w-40 h-6 bg-slate-800 rounded-lg mx-auto" />
          <div className="w-64 h-3.5 bg-slate-800/80 rounded-md mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="w-4 h-4 bg-amber-500/20 rounded-full" />
                ))}
              </div>
              <div className="space-y-2">
                <div className="w-full h-3.5 bg-slate-800 rounded-md" />
                <div className="w-4/5 h-3.5 bg-slate-800 rounded-md" />
                <div className="w-3/5 h-3.5 bg-slate-800 rounded-md" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-slate-800" />
                <div className="space-y-1">
                  <div className="w-24 h-3.5 bg-slate-800 rounded-md" />
                  <div className="w-16 h-2.5 bg-slate-800/80 rounded-md" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
