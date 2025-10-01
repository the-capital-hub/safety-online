"use client";

import Image from "next/image";
import Link from "next/link";
import ServiceGuarantees from "@/components/BuyerPanel/home/ServiceGuarantees.jsx";

const formatCurrency = (value) => {
        if (typeof value !== "number") return null;
        return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
        }).format(value);
};

const getProductId = (product) => product?.id || product?._id;
const getProductImage = (product) => product?.images?.[0] || product?.image || "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";

export default function FeaturedSection({
        topSellingProducts = [],
        bestSellingProduct = null,
        featuredProducts = [],
}) {
        const hasTopSelling = topSellingProducts?.length > 0;
        const hasBestSelling = !!bestSellingProduct;
        const hasFeatured = featuredProducts?.length > 0;

        if (!hasTopSelling && !hasBestSelling && !hasFeatured) {
                        return null;
        }

        const topSellingShowcase = topSellingProducts.slice(0, 8);
        const curatedFeatured = featuredProducts.slice(0, 6);

        return (
                <section className="relative overflow-hidden bg-white py-16">
                        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-[#fff7ed] to-transparent" aria-hidden />
                        <div className="relative mx-auto max-w-7xl px-6 space-y-16">
                                {hasBestSelling ? (
                                        <div className="grid gap-8 overflow-hidden rounded-[40px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] p-1 text-white lg:grid-cols-2">
                                                <div className="flex h-full flex-col justify-between rounded-[30px] bg-slate-900/40 p-10">
                                                        <div className="space-y-5">
                                                                <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#facc15]">
                                                                        Best seller spotlight
                                                                </span>
                                                                <h3 className="text-3xl font-semibold leading-tight sm:text-4xl">{bestSellingProduct.title}</h3>
                                                                <p className="text-base text-slate-200 line-clamp-4">{bestSellingProduct.description}</p>
                                                                <div className="flex items-baseline gap-3">
                                                                        {bestSellingProduct.salePrice ? (
                                                                                <>
                                                                                        <span className="text-3xl font-semibold text-white">{formatCurrency(bestSellingProduct.salePrice)}</span>
                                                                                        {bestSellingProduct.price && bestSellingProduct.price > bestSellingProduct.salePrice ? (
                                                                                                <span className="text-sm text-slate-300 line-through">{formatCurrency(bestSellingProduct.price)}</span>
                                                                                        ) : null}
                                                                                </>
                                                                        ) : bestSellingProduct.price ? (
                                                                                <span className="text-3xl font-semibold text-white">{formatCurrency(bestSellingProduct.price)}</span>
                                                                        ) : (
                                                                                <span className="text-lg font-semibold text-white">Contact for pricing</span>
                                                                        )}
                                                                </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#facc15]/70">
                                                                <span>Ready stock</span>
                                                                <span>OEM warranty</span>
                                                                <span>Bulk deals</span>
                                                        </div>
                                                </div>
                                                <Link
                                                        href={`/products/${getProductId(bestSellingProduct)}`}
                                                        className="relative block overflow-hidden rounded-[30px] bg-slate-900/30"
                                                >
                                                        <Image
                                                                src={getProductImage(bestSellingProduct)}
                                                                alt={bestSellingProduct.title}
                                                                fill
                                                                sizes="(max-width: 1024px) 100vw, 480px"
                                                                className="object-contain"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
                                                        <span className="absolute right-6 top-6 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-[#facc15]">
                                                                View
                                                        </span>
                                                </Link>
                                        </div>
                                ) : null}

                                {hasTopSelling ? (
                                        <div className="space-y-6">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                                        <div>
                                                                <span className="inline-flex items-center rounded-full bg-[#fff7ed] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#f97316]">
                                                                        Buyer favourites
                                                                </span>
                                                                <h3 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Top selling products this week</h3>
                                                        </div>
                                                        <Link
                                                                href="/products?sort=top-selling"
                                                                className="inline-flex items-center rounded-full border border-[#f97316]/30 px-5 py-2 text-sm font-semibold text-[#9a3412] transition hover:border-[#f97316] hover:bg-[#f97316]/10"
                                                        >
                                                                View all
                                                        </Link>
                                                </div>
                                                <div className="-mx-6 overflow-x-auto pb-4">
                                                        <div className="ml-6 flex gap-5">
                                                                {topSellingShowcase.map((product) => (
                                                                        <Link
                                                                                key={getProductId(product)}
                                                                                href={`/products/${getProductId(product)}`}
                                                                                className="group flex w-64 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#f97316]/40 hover:shadow-lg"
                                                                        >
                                                                                <div className="relative h-40 w-full overflow-hidden rounded-2xl bg-slate-50">
                                                                                        <Image
                                                                                                src={getProductImage(product)}
                                                                                                alt={product.title}
                                                                                                fill
                                                                                                sizes="256px"
                                                                                                className="object-contain transition duration-500 group-hover:scale-105"
                                                                                        />
                                                                                </div>
                                                                                <h4 className="mt-4 line-clamp-2 text-base font-semibold text-slate-900">{product.title}</h4>
                                                                                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{product.description}</p>
                                                                                <div className="mt-3 text-sm font-semibold text-slate-900">
                                                                                        {product.salePrice
                                                                                                ? formatCurrency(product.salePrice)
                                                                                                : product.price
                                                                                                ? formatCurrency(product.price)
                                                                                                : "Enquire"}
                                                                                </div>
                                                                        </Link>
                                                                ))}
                                                        </div>
                                                </div>
                                        </div>
                                ) : null}

                                {hasFeatured ? (
                                        <div className="space-y-6">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                                        <div>
                                                                <span className="inline-flex items-center rounded-full bg-[#fff7ed] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#f97316]">
                                                                        Curated collections
                                                                </span>
                                                                <h3 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Featured upgrades for modern facilities</h3>
                                                        </div>
                                                </div>
                                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                        {curatedFeatured.map((product) => (
                                                                <Link
                                                                        key={getProductId(product)}
                                                                        href={`/products/${getProductId(product)}`}
                                                                        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#f97316]/40 hover:shadow-lg"
                                                                >
                                                                        <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                                                                                <Image
                                                                                        src={getProductImage(product)}
                                                                                        alt={product.title}
                                                                                        fill
                                                                                        sizes="(max-width: 768px) 100vw, 320px"
                                                                                        className="object-contain transition duration-500 group-hover:scale-105"
                                                                                />
                                                                        </div>
                                                                        <div className="flex flex-1 flex-col gap-3 p-6">
                                                                                <h4 className="text-lg font-semibold text-slate-900">{product.title}</h4>
                                                                                <p className="text-sm text-slate-600 line-clamp-3">{product.description}</p>
                                                                                <div className="mt-auto text-base font-semibold text-slate-900">
                                                                                        {product.salePrice
                                                                                                ? formatCurrency(product.salePrice)
                                                                                                : product.price
                                                                                                ? formatCurrency(product.price)
                                                                                                : "Request quote"}
                                                                                </div>
                                                                        </div>
                                                                </Link>
                                                        ))}
                                                </div>
                                        </div>
                                ) : null}

                                <ServiceGuarantees />
                        </div>
                </section>
        );
}
