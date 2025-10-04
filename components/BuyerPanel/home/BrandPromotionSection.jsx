"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Percent } from "lucide-react";

const FALLBACK_IMAGE =
        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";

export default function BrandPromotionSection({ banners = [] }) {
        const sanitizedBanners = useMemo(
                () =>
                        banners.map((banner) => ({
                                id: banner.id,
                                brandName: banner.brandName,
                                bannerImage: banner.bannerImage || FALLBACK_IMAGE,
                                discountPercentage: Number.isFinite(Number(banner.discountPercentage))
                                        ? Number(banner.discountPercentage)
                                        : 0,
                                tagline: banner.tagline || "",
                        })),
                [banners]
        );

        const [activeIndex, setActiveIndex] = useState(0);
        const [isInteracting, setIsInteracting] = useState(false);

        useEffect(() => {
                if (!sanitizedBanners.length) {
                        return undefined;
                }

                const interval = setInterval(() => {
                        if (!isInteracting) {
                                setActiveIndex((prev) => (prev + 1) % sanitizedBanners.length);
                        }
                }, 6000);

                return () => clearInterval(interval);
        }, [isInteracting, sanitizedBanners.length]);

        useEffect(() => {
                if (activeIndex >= sanitizedBanners.length) {
                        setActiveIndex(0);
                }
        }, [activeIndex, sanitizedBanners.length]);

        if (!sanitizedBanners.length) {
                return null;
        }

        const activeBanner = sanitizedBanners[activeIndex];

        const handleSelect = (index) => {
                setActiveIndex(index);
        };

        return (
                <section className="px-4 sm:px-6 lg:px-10 py-8">
                        <div className="bg-white shadow-lg rounded-3xl border border-gray-100 overflow-hidden">
                                <div className="flex flex-col lg:flex-row">
                                        <div className="relative flex-1 min-h-[260px] lg:min-h-[320px]">
                                                <AnimatePresence mode="wait">
                                                        <motion.div
                                                                key={activeBanner.id}
                                                                initial={{ opacity: 0, scale: 1.02 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.98 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="absolute inset-0"
                                                        >
                                                                <Image
                                                                        src={activeBanner.bannerImage || FALLBACK_IMAGE}
                                                                        alt={`${activeBanner.brandName} promotional banner`}
                                                                        fill
                                                                        priority
                                                                        sizes="(max-width: 1024px) 100vw, 65vw"
                                                                        className="object-cover"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
                                                                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 text-white">
                                                                        <div className="flex items-center gap-2 text-sm uppercase tracking-wide text-white/80">
                                                                                <Sparkles className="h-4 w-4" />
                                                                                Premium Offers
                                                                        </div>
                                                                        <div>
                                                                                <motion.h3
                                                                                        key={`${activeBanner.id}-heading`}
                                                                                        initial={{ y: 20, opacity: 0 }}
                                                                                        animate={{ y: 0, opacity: 1 }}
                                                                                        transition={{ duration: 0.45 }}
                                                                                        className="text-3xl sm:text-4xl lg:text-5xl font-bold"
                                                                                >
                                                                                        {activeBanner.brandName}
                                                                                </motion.h3>
                                                                                <motion.p
                                                                                        key={`${activeBanner.id}-subtitle`}
                                                                                        initial={{ y: 12, opacity: 0 }}
                                                                                        animate={{ y: 0, opacity: 1 }}
                                                                                        transition={{ duration: 0.45, delay: 0.05 }}
                                                                                        className="mt-3 text-base sm:text-lg max-w-xl text-white/85"
                                                                                >
                                                                                        {activeBanner.tagline ||
                                                                                                `Up to ${activeBanner.discountPercentage}% off on selected products`}
                                                                                </motion.p>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm sm:text-base text-white/80">
                                                                                <Percent className="h-4 w-4" />
                                                                                Unlock exclusive safety gear deals from trusted brands
                                                                        </div>
                                                                </div>
                                                        </motion.div>
                                                </AnimatePresence>
                                        </div>

                                        <div className="w-full lg:w-[340px] border-t lg:border-t-0 lg:border-l border-gray-100 bg-gray-50/80">
                                                <div className="p-6 sm:p-8 space-y-6">
                                                        <div className="space-y-1">
                                                                <h4 className="text-lg font-semibold text-gray-900">
                                                                        Spotlight Brands
                                                                </h4>
                                                                <p className="text-sm text-gray-500">
                                                                        Hover or tap on a brand to reveal the latest offer.
                                                                </p>
                                                        </div>

                                                        <div
                                                                className="grid gap-3"
                                                                onMouseEnter={() => setIsInteracting(true)}
                                                                onMouseLeave={() => setIsInteracting(false)}
                                                        >
                                                                {sanitizedBanners.map((banner, index) => {
                                                                        const isActive = index === activeIndex;
                                                                        const discountLabel = banner.tagline
                                                                                ? banner.tagline
                                                                                : `Up to ${banner.discountPercentage}% off`;
                                                                        return (
                                                                                <button
                                                                                        key={banner.id}
                                                                                        type="button"
                                                                                        onMouseEnter={() => handleSelect(index)}
                                                                                        onFocus={() => handleSelect(index)}
                                                                                        onClick={() => handleSelect(index)}
                                                                                        className={`group relative flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all ${
                                                                                                isActive
                                                                                                        ? "border-black bg-white shadow-lg shadow-black/5"
                                                                                                        : "border-transparent bg-white/70 hover:border-black/20"
                                                                                        }`}
                                                                                >
                                                                                        <span className="text-sm font-semibold text-gray-900">
                                                                                                {banner.brandName}
                                                                                        </span>
                                                                                        <span
                                                                                                className={`text-xs font-medium uppercase tracking-wide ${
                                                                                                        isActive
                                                                                                                ? "text-black"
                                                                                                                : "text-gray-500"
                                                                                                }`}
                                                                                        >
                                                                                                {discountLabel}
                                                                                        </span>
                                                                                        {isActive && (
                                                                                                <motion.span
                                                                                                        layoutId="active-brand-indicator"
                                                                                                        className="absolute -right-1 -top-1 rounded-full border border-black/10 bg-black px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white"
                                                                                                >
                                                                                                        Now Showing
                                                                                                </motion.span>
                                                                                        )}
                                                                                </button>
                                                                        );
                                                                })}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
}
