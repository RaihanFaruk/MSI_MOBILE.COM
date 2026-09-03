import React from "react";

export const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`bg-slate-200/80 animate-pulse rounded-md ${className}`}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 p-3 sm:p-4 shadow-2xs space-y-3">
      {/* Image box shimmer */}
      <div className="w-full aspect-square bg-slate-100 animate-pulse rounded-xl sm:rounded-2xl" />

      {/* Brand & Rating */}
      <div className="flex items-center justify-between pt-1">
        <div className="w-16 h-3 bg-slate-200 animate-pulse rounded" />
        <div className="w-12 h-3 bg-slate-200 animate-pulse rounded" />
      </div>

      {/* Title */}
      <div className="space-y-1.5">
        <div className="w-full h-3.5 bg-slate-200 animate-pulse rounded" />
        <div className="w-3/4 h-3.5 bg-slate-100 animate-pulse rounded" />
      </div>

      {/* Price & Button */}
      <div className="flex items-center justify-between pt-2">
        <div className="w-20 h-5 bg-slate-200 animate-pulse rounded-lg" />
        <div className="w-8 h-8 bg-slate-200 animate-pulse rounded-xl" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 6,
}) => {
  return (
    <div className="w-full divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="p-4 flex items-center justify-between gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-slate-100 animate-pulse rounded"
              style={{ width: `${Math.floor(60 + Math.random() * 40)}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
