"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, PackageCheck, Sparkles, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroImg } from "@/public/images/home";

const highlightItems = [
        {
                icon: ShieldCheck,
                title: "Certified Safety",
                description: "BIS and CE compliant range",
        },
        {
                icon: PackageCheck,
                title: "2,500+ SKUs",
                description: "In-stock industrial essentials",
        },
        {
                icon: Clock3,
                title: "Express Dispatch",
                description: "Ships within 24 hours",
        },
        {
                icon: Sparkles,
                title: "Bulk Pricing",
                description: "Exclusive deals for businesses",
        },
];

const formatCurrency = (value) => {
        if (typeof value !== "number") return null;
        return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
        }).format(value);
};

export default function HeroSection({ spotlightProduct, categories = [] }) {
        const quickCategories = categories.slice(0, 6);
        const heroImage = spotlightProduct?.images?.[0] || spotlightProduct?.image;
        const heroPrice = spotlightProduct?.salePrice || spotlightProduct?.price;

        return (
                <section className="relative overflow-hidden bg-gradient-to-br from-[#fff7ed] via-white to-white">
                        <div className="absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[#fde68a]/40 blur-3xl" />
                        <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-[#fb923c]/20 blur-3xl" />

                        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:flex lg:items-center lg:gap-16 lg:py-24">
                                <div className="max-w-3xl space-y-8">
                                        <span className="inline-flex items-center gap-2 rounded-full bg-[#fff7ed] px-4 py-1 text-xs font-semibold tracking-wide text-[#b45309] ring-1 ring-[#fbbf24]/60">
                                                India&apos;s trusted safety marketplace
                                        </span>
                                        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl lg:text-6xl">
                                                Industrial Safety Gear for Every Worksite
                                        </h1>
                                        <p className="max-w-2xl text-lg leading-relaxed text-slate-600">
                                                Discover premium PPE, fire safety and road protection equipment curated for manufacturing plants, warehouses, infrastructure projects and facility management teams.
                                        </p>

                                        <div className="flex flex-wrap gap-3">
                                                <Button asChild className="rounded-full bg-[#f97316] px-6 py-3 text-base font-semibold hover:bg-[#ea580c]">
                                                        <Link href="/products">Shop Safety Gear</Link>
                                                </Button>
                                                <Button
                                                        asChild
                                                        variant="outline"
                                                        className="rounded-full border-[#f97316]/30 bg-white px-6 py-3 text-base font-semibold text-[#b45309] hover:border-[#f97316] hover:text-[#9a3412]"
                                                >
                                                        <Link href="/contact">Talk to an Expert</Link>
                                                </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                                {highlightItems.map(({ icon: Icon, title, description }) => (
                                                        <div
                                                                key={title}
                                                                className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
                                                        >
                                                                <Icon className="mb-3 h-6 w-6 text-[#f97316]" />
                                                                <p className="text-sm font-semibold text-slate-900">{title}</p>
                                                                <p className="text-xs text-slate-500">{description}</p>
                                                        </div>
                                                ))}
                                        </div>
                                </div>

                                <div className="relative mt-12 w-full max-w-xl flex-shrink-0 lg:mt-0">
                                        <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-[#fde68a] via-[#fcd34d] to-[#f97316] opacity-90 blur-2xl" />
                                        <div className="relative overflow-hidden rounded-[40px] bg-white shadow-2xl">
                                                <div className="relative h-80 w-full bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#334155]">
                                                        <Image
                                                                src={heroImage || HeroImg}
                                                                alt={spotlightProduct?.title || "Safety professional"}
                                                                fill
                                                                sizes="(max-width: 1024px) 100vw, 480px"
                                                                priority
                                                                className="object-cover object-center"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
                                                </div>
                                                <div className="space-y-4 px-8 py-6">
                                                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[#f97316]">
                                                                <span>{spotlightProduct ? "In-demand pick" : "Ready stock"}</span>
                                                                {spotlightProduct?.discountPercentage ? (
                                                                        <span className="rounded-full bg-[#f97316]/10 px-3 py-1 text-[#b45309]">
                                                                                {spotlightProduct.discountPercentage}% off
                                                                        </span>
                                                                ) : null}
                                                        </div>
                                                        <div>
                                                                <h2 className="text-2xl font-bold text-slate-900">
                                                                        {spotlightProduct?.title || "Head-to-toe safety kits"}
                                                                </h2>
                                                                <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                                                                        {spotlightProduct?.description ||
                                                                                "Shop helmets, gloves, suits, eyewear and harnesses tailored for demanding worksites across India."}
                                                                </p>
                                                        </div>
                                                        <div className="flex items-end justify-between">
                                                                <div>
                                                                        {heroPrice ? (
                                                                                <p className="text-2xl font-semibold text-slate-900">{formatCurrency(heroPrice)}</p>
                                                                        ) : (
                                                                                <p className="text-2xl font-semibold text-slate-900">Bulk rates available</p>
                                                                        )}
                                                                        {spotlightProduct?.price && spotlightProduct?.salePrice && spotlightProduct.price > spotlightProduct.salePrice ? (
                                                                                <p className="text-sm text-slate-500 line-through">
                                                                                        {formatCurrency(spotlightProduct.price)}
                                                                                </p>
                                                                        ) : null}
                                                                </div>
                                                                {spotlightProduct?.id ? (
                                                                        <Button asChild className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                                                                                <Link href={`/products/${spotlightProduct.id}`}>
                                                                                        View product
                                                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                                                </Link>
                                                                        </Button>
                                                                ) : null}
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        </div>

                        {quickCategories.length > 0 ? (
                                <div className="relative mx-auto max-w-7xl px-6 pb-10">
                                        <div className="rounded-3xl border border-[#fed7aa] bg-[#fff7ed] px-6 py-5 shadow-sm md:flex md:items-center md:justify-between">
                                                <div className="max-w-lg">
                                                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f97316]">Shop by category</p>
                                                        <h3 className="mt-1 text-xl font-semibold text-slate-900">Find exactly what your team needs</h3>
                                                </div>
                                                <div className="mt-4 flex flex-wrap gap-3 md:mt-0 md:max-w-2xl md:justify-end">
                                                        {quickCategories.map((category) => (
                                                                <Link
                                                                        key={category}
                                                                        href={`/products?category=${encodeURIComponent(category)}`}
                                                                        className="inline-flex items-center rounded-full border border-[#f97316]/30 bg-white px-4 py-2 text-sm font-medium text-[#9a3412] transition hover:border-[#f97316] hover:bg-[#f97316]/10"
                                                                >
                                                                        {category}
                                                                </Link>
                                                        ))}
                                                </div>
                                        </div>
                                </div>
                        ) : null}
                </section>
        );
}
