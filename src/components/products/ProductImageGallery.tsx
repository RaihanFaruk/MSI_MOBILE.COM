"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  isOutOfStock?: boolean;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  isWishlisted = false,
  onToggleWishlist,
  isOutOfStock = false,
}) => {
  const imagesList = images && images.length > 0
    ? images
    : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = imagesList[activeIndex] || imagesList[0];

  // Image loading skeleton states
  const [isMainLoading, setIsMainLoading] = useState(true);

  // Desktop Hover Lens / Magnifier State
  const [isHovered, setIsHovered] = useState(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile & Desktop Lightbox Modal State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  // Handle Desktop Mouse Movement for Magnifier Lens
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  // Lightbox Navigation
  const handleNextImage = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % imagesList.length);
    setLightboxScale(1);
  }, [imagesList.length]);

  const handlePrevImage = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
    setLightboxScale(1);
  }, [imagesList.length]);

  // Lock body scroll when Lightbox is open and handle Escape key
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsLightboxOpen(false);
          setLightboxScale(1);
        } else if (e.key === "ArrowRight") {
          handleNextImage();
        } else if (e.key === "ArrowLeft") {
          handlePrevImage();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isLightboxOpen, handleNextImage, handlePrevImage]);

  // Mobile Touch Gestures for Lightbox (Swipe & Pinch)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialDistance(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newScale = Math.max(1, Math.min(3.5, currentDist / initialDistance));
      setLightboxScale(newScale);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null && lightboxScale === 1 && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      const deltaY = e.changedTouches[0].clientY - (touchStartY || 0);

      // Horizontal swipe threshold: 50px (and horizontal > vertical)
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          handleNextImage();
        } else {
          handlePrevImage();
        }
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setInitialDistance(null);
  };

  const handleDoubleTapZoom = () => {
    setLightboxScale((prev) => (prev > 1 ? 1 : 2.2));
  };

  return (
    <div className="space-y-4 select-none">
      {/* Main Interactive Product Image Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setIsLightboxOpen(true)}
        className="relative w-full h-80 sm:h-96 md:h-[430px] bg-white rounded-3xl border border-slate-200/90 flex items-center justify-center p-6 shadow-xs overflow-hidden cursor-crosshair group"
      >
        {/* Skeleton shimmer while loading */}
        {isMainLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse rounded-3xl" />
        )}

        {/* Base Normal Image */}
        <Image
          src={activeImage}
          alt={productName}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          onLoad={() => setIsMainLoading(false)}
          className={`object-contain p-6 transition-opacity duration-300 ${
            isMainLoading ? "opacity-0" : "opacity-100"
          } ${isHovered ? "opacity-30 lg:opacity-20" : "opacity-100"}`}
        />

        {/* Desktop Magnifier Lens Effect */}
        {isHovered && !isMainLoading && (
          <div
            className="hidden lg:block absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: "260%",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Subtle Crosshair indicator */}
            <div
              className="absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 border-2 border-brand-primary/60 bg-blue-500/10 rounded-2xl shadow-lg backdrop-blur-[0.5px]"
              style={{
                left: `${zoomPos.x}%`,
                top: `${zoomPos.y}%`,
              }}
            />
          </div>
        )}

        {/* Floating Controls Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          {/* Wishlist Button */}
          {onToggleWishlist && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist();
              }}
              className="p-2.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
              title="Toggle Wishlist"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isWishlisted
                    ? "fill-rose-600 text-rose-600"
                    : "text-slate-400 hover:text-rose-500"
                }`}
              />
            </button>
          )}

          {/* Fullscreen Zoom Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="p-2.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 shadow-sm text-slate-600 hover:text-brand-primary hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title="Open Fullscreen Zoom"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Out of Stock Ribbon */}
        {isOutOfStock && (
          <div className="absolute top-4 left-4 bg-rose-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-md z-10">
            Out of Stock
          </div>
        )}

        {/* Micro-hint on Mobile/Tablet */}
        <div className="lg:hidden absolute bottom-3 right-4 bg-slate-900/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none">
          <ZoomIn className="w-3 h-3" />
          <span>Tap to Zoom</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {imagesList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {imagesList.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveIndex(idx);
                setIsMainLoading(true);
              }}
              className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-white border-2 p-1 shrink-0 overflow-hidden transition-all cursor-pointer ${
                activeIndex === idx
                  ? "border-brand-primary shadow-sm scale-102"
                  : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Mobile & Desktop Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Product Image Zoom Lightbox"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 animate-in fade-in duration-200"
          onClick={() => {
            setIsLightboxOpen(false);
            setLightboxScale(1);
          }}
        >
          {/* Top Bar: Title, Count Badge, Close */}
          <div
            className="flex items-center justify-between text-white py-2 px-3 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
                {productName}
              </span>
              <span className="text-[11px] font-bold bg-white/20 px-2.5 py-0.5 rounded-full text-slate-200">
                {activeIndex + 1} / {imagesList.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Reset Zoom or Zoom in */}
              <button
                type="button"
                onClick={handleDoubleTapZoom}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title={lightboxScale > 1 ? "Zoom Out" : "Zoom In"}
              >
                {lightboxScale > 1 ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxScale(1);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Central Image with Pinch-to-Zoom & Swipe */}
          <div
            className="relative flex-1 w-full flex items-center justify-center overflow-hidden touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleTapZoom}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full h-full max-w-4xl max-h-[75vh] flex items-center justify-center transition-transform duration-150"
              style={{
                transform: `scale(${lightboxScale})`,
              }}
            >
              <Image
                src={activeImage}
                alt={productName}
                fill
                sizes="100vw"
                priority
                className="object-contain"
              />
            </div>

            {/* Navigation Arrows for Multi-image Products */}
            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer z-50"
                  title="Previous Image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all cursor-pointer z-50"
                  title="Next Image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {imagesList.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 py-3 overflow-x-auto z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setLightboxScale(1);
                  }}
                  className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 border-2 p-0.5 shrink-0 overflow-hidden transition-all cursor-pointer ${
                    activeIndex === idx
                      ? "border-brand-primary scale-110 bg-white"
                      : "border-white/20 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumb ${idx + 1}`}
                    fill
                    sizes="60px"
                    className="object-contain p-0.5"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
