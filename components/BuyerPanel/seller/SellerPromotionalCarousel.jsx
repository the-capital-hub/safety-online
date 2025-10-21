"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_IMAGE =
        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";

const sanitizeBanners = (banners = [], fallbackTitle = "") =>
        Array.isArray(banners)
                ? banners
                                .filter((banner) => banner && typeof banner.imageUrl === "string" && banner.imageUrl.trim())
                                .map((banner, index) => ({
                                        id: banner.id || banner._id?.toString?.() || `banner-${index}`,
                                        imageUrl: banner.imageUrl.trim(),
                                        title: banner.title?.trim() || fallbackTitle,
                                        description: banner.description?.trim() || "",
                                }))
                : [];

export default function SellerPromotionalCarousel({ banners = [], sellerName = "Trusted Seller" }) {
        const sanitizedBanners = useMemo(
                () => sanitizeBanners(banners, sellerName),
                [banners, sellerName]
        );

        const [emblaRef, emblaApi] = useEmblaCarousel({
                loop: sanitizedBanners.length > 1,
                align: "start",
        });
        const [selectedIndex, setSelectedIndex] = useState(0);

        const scrollPrev = useCallback(() => {
                if (emblaApi) emblaApi.scrollPrev();
        }, [emblaApi]);

        const scrollNext = useCallback(() => {
                if (emblaApi) emblaApi.scrollNext();
        }, [emblaApi]);

        const scrollTo = useCallback(
                (index) => {
                        if (emblaApi) emblaApi.scrollTo(index);
                },
                [emblaApi]
        );

        useEffect(() => {
                if (!emblaApi) return undefined;

                const handleSelect = () => {
                        setSelectedIndex(emblaApi.selectedScrollSnap());
                };

                handleSelect();
                emblaApi.on("select", handleSelect);

                return () => {
                        emblaApi.off("select", handleSelect);
                };
        }, [emblaApi]);

        useEffect(() => {
                if (!emblaApi || sanitizedBanners.length <= 1) {
                        return undefined;
                }

                const interval = setInterval(() => {
                        emblaApi.scrollNext();
                }, 6000);

                return () => clearInterval(interval);
        }, [emblaApi, sanitizedBanners.length]);

        useEffect(() => {
                if (selectedIndex >= sanitizedBanners.length) {
                        setSelectedIndex(0);
                }
        }, [selectedIndex, sanitizedBanners.length]);

        if (!sanitizedBanners.length) {
                return null;
        }

        return (
                <section className="bg-white border-b">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                                        <div>
                                                <h2 className="text-2xl font-semibold text-gray-900">
                                                        Latest brand highlights
                                                </h2>
                                                <p className="text-sm text-gray-500">
                                                        Showcase current promotions curated by {sellerName}.
                                                </p>
                                        </div>
                                        {sanitizedBanners.length > 1 && (
                                                <div className="hidden sm:flex items-center gap-2">
                                                        <button
                                                                type="button"
                                                                onClick={scrollPrev}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
                                                                aria-label="Previous promotion"
                                                        >
                                                                <ChevronLeft className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                                type="button"
                                                                onClick={scrollNext}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm transition hover:bg-gray-100"
                                                                aria-label="Next promotion"
                                                        >
                                                                <ChevronRight className="h-5 w-5" />
                                                        </button>
                                                </div>
                                        )}
                                </div>

                                <div className="relative">
                                        <div
                                                ref={emblaRef}
                                                className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
                                        >
                                                <div className="flex">
                                                        {sanitizedBanners.map((banner) => (
                                                                <div
                                                                        key={banner.id}
                                                                        className="flex-[0_0_100%] min-w-0"
                                                                >
                                                                        <div className="relative h-64 sm:h-80 md:h-96">
                                                                                <Image
                                                                                        src={banner.imageUrl || FALLBACK_IMAGE}
                                                                                        alt={banner.title || sellerName}
                                                                                        fill
                                                                                        priority={false}
                                                                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 85vw, 1100px"
                                                                                        className="object-cover"
                                                                                />
                                                                                <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/35 to-black/10" />
                                                                                <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 text-white">
                                                                                        <h3 className="text-2xl sm:text-3xl font-semibold drop-shadow">
                                                                                                {banner.title || sellerName}
                                                                                        </h3>
                                                                                        {banner.description && (
                                                                                                <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/85">
                                                                                                        {banner.description}
                                                                                                </p>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </div>
                                                        ))}
                                                </div>
                                        </div>

                                        {sanitizedBanners.length > 1 && (
                                                <>
                                                        <button
                                                                type="button"
                                                                onClick={scrollPrev}
                                                                className="absolute left-3 top-1/2 hidden -translate-y-1/2 transform rounded-full border border-gray-200 bg-white/95 p-2 text-gray-700 shadow-md transition hover:bg-white sm:flex"
                                                                aria-label="Previous promotion"
                                                        >
                                                                <ChevronLeft className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                                type="button"
                                                                onClick={scrollNext}
                                                                className="absolute right-3 top-1/2 hidden -translate-y-1/2 transform rounded-full border border-gray-200 bg-white/95 p-2 text-gray-700 shadow-md transition hover:bg-white sm:flex"
                                                                aria-label="Next promotion"
                                                        >
                                                                <ChevronRight className="h-5 w-5" />
                                                        </button>
                                                </>
                                        )}
                                </div>

                                {sanitizedBanners.length > 1 && (
                                        <div className="mt-6 flex items-center justify-center gap-2">
                                                {sanitizedBanners.map((banner, index) => {
                                                        const isActive = selectedIndex === index;
                                                        return (
                                                                <button
                                                                        key={banner.id}
                                                                        type="button"
                                                                        onClick={() => scrollTo(index)}
                                                                        className={`h-2.5 w-2.5 rounded-full transition ${
                                                                                isActive
                                                                                        ? "bg-gray-900"
                                                                                        : "bg-gray-300 hover:bg-gray-400"
                                                                        }`}
                                                                >
                                                                        <span className="sr-only">Go to slide {index + 1}</span>
                                                                </button>
                                                        );
                                                })}
                                        </div>
                                )}
                        </div>
                </section>
        );
}
