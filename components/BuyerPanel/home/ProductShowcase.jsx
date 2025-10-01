"use client";

import Image from "next/image";
import Link from "next/link";

const formatCurrency = (value) => {
        if (typeof value !== "number") return null;
        return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
        }).format(value);
};

const getProductImage = (product) => {
        return product?.images?.[0] || product?.image || "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";
};

const getProductId = (product) => product?.id || product?._id;

export default function ProductShowcase({ products = [] }) {
        if (!products?.length) {
                return null;
        }

        const heroProduct = products[0];
        const featureGrid = products.slice(1, 5);
        const sliderProducts = products.slice(5, 12);

        return (
                <section className="bg-[#0f172a] py-16 text-white">
                        <div className="mx-auto max-w-7xl px-6">
                                <div className="flex flex-col gap-12">
                                        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                        <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#facc15]">
                                                                Deals of the day
                                                        </span>
                                                        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Exclusive savings on worksite essentials</h2>
                                                        <p className="mt-2 max-w-2xl text-base text-slate-200">
                                                                Secure time-bound discounts on certified PPE, welding gear, fire safety equipment and more.
                                                        </p>
                                                </div>
                                                <Link
                                                        href="/products"
                                                        className="inline-flex items-center rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                                                >
                                                        Explore catalogue
                                                </Link>
                                        </div>

                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                                <Link
                                                        href={`/products/${getProductId(heroProduct)}`}
                                                        className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#facc15] via-[#f97316] to-[#ef4444] p-1"
                                                >
                                                        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] bg-slate-950/90">
                                                                <div className="p-8">
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#f97316]/80">spotlight</p>
                                                                        <h3 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">
                                                                                {heroProduct.title}
                                                                        </h3>
                                                                        <p className="mt-3 text-sm text-slate-300 line-clamp-4">{heroProduct.description}</p>
                                                                        <div className="mt-6 flex items-baseline gap-3">
                                                                                {heroProduct.salePrice ? (
                                                                                        <>
                                                                                                <span className="text-3xl font-semibold text-white">{formatCurrency(heroProduct.salePrice)}</span>
                                                                                                {heroProduct.price && heroProduct.price > heroProduct.salePrice ? (
                                                                                                        <span className="text-sm text-slate-300 line-through">{formatCurrency(heroProduct.price)}</span>
                                                                                                ) : null}
                                                                                        </>
                                                                                ) : heroProduct.price ? (
                                                                                        <span className="text-3xl font-semibold text-white">{formatCurrency(heroProduct.price)}</span>
                                                                                ) : (
                                                                                        <span className="text-lg font-semibold text-white">Talk to sales</span>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                                <div className="relative flex h-64 items-center justify-center overflow-hidden">
                                                                        <Image
                                                                                src={getProductImage(heroProduct)}
                                                                                alt={heroProduct.title}
                                                                                fill
                                                                                sizes="(max-width: 1024px) 100vw, 360px"
                                                                                className="object-contain transition duration-500 group-hover:scale-105"
                                                                        />
                                                                        {heroProduct.discountPercentage ? (
                                                                                <span className="absolute right-5 top-5 rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase text-[#ea580c]">
                                                                                        {heroProduct.discountPercentage}% off
                                                                                </span>
                                                                        ) : null}
                                                                </div>
                                                        </div>
                                                </Link>

                                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-2">
                                                        {featureGrid.map((product) => (
                                                                <Link
                                                                        key={getProductId(product)}
                                                                        href={`/products/${getProductId(product)}`}
                                                                        className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/5 p-6 transition hover:border-white/30 hover:bg-white/10"
                                                                >
                                                                        <div className="flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
                                                                                <div className="space-y-3">
                                                                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#facc15]/80">Limited offer</p>
                                                                                        <h3 className="text-xl font-semibold text-white">{product.title}</h3>
                                                                                        <p className="text-sm text-slate-200 line-clamp-3">{product.description}</p>
                                                                                        <div className="flex items-baseline gap-3 text-white">
                                                                                                {product.salePrice ? (
                                                                                                        <>
                                                                                                                <span className="text-2xl font-semibold">{formatCurrency(product.salePrice)}</span>
                                                                                                                {product.price && product.price > product.salePrice ? (
                                                                                                                        <span className="text-sm text-slate-300 line-through">{formatCurrency(product.price)}</span>
                                                                                                                ) : null}
                                                                                                        </>
                                                                                                ) : product.price ? (
                                                                                                        <span className="text-2xl font-semibold">{formatCurrency(product.price)}</span>
                                                                                                ) : (
                                                                                                        <span className="text-lg font-semibold">Contact us</span>
                                                                                                )}
                                                                                        </div>
                                                                                </div>
                                                                                <div className="relative h-40 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-slate-900/60 sm:w-40">
                                                                                        <Image
                                                                                                src={getProductImage(product)}
                                                                                                alt={product.title}
                                                                                                fill
                                                                                                sizes="(max-width: 640px) 100vw, 160px"
                                                                                                className="object-contain transition duration-500 group-hover:scale-105"
                                                                                        />
                                                                                </div>
                                                                        </div>
                                                                </Link>
                                                        ))}
                                                </div>
                                        </div>

                                        {sliderProducts.length > 0 ? (
                                                <div className="space-y-4">
                                                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                                                <div>
                                                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#facc15]/80">
                                                                                More ways to save
                                                                        </p>
                                                                        <h3 className="text-xl font-semibold text-white">Hand-picked combos &amp; accessories</h3>
                                                                </div>
                                                        </div>
                                                        <div className="-mx-6 overflow-x-auto pb-2">
                                                                <div className="ml-6 flex gap-4">
                                                                        {sliderProducts.map((product) => (
                                                                                <Link
                                                                                        key={getProductId(product)}
                                                                                        href={`/products/${getProductId(product)}`}
                                                                                        className="group flex w-64 flex-col overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-5 text-left transition hover:border-white/20 hover:bg-white/10"
                                                                                >
                                                                                        <div className="relative h-32 w-full overflow-hidden rounded-xl bg-slate-900/60">
                                                                                                <Image
                                                                                                        src={getProductImage(product)}
                                                                                                        alt={product.title}
                                                                                                        fill
                                                                                                        sizes="256px"
                                                                                                        className="object-contain transition duration-500 group-hover:scale-105"
                                                                                                />
                                                                                        </div>
                                                                                        <h4 className="mt-4 line-clamp-2 text-sm font-semibold text-white">{product.title}</h4>
                                                                                        <p className="mt-1 text-xs text-slate-300 line-clamp-2">{product.description}</p>
                                                                                        <div className="mt-3 text-sm font-semibold text-white">
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
                                </div>
                        </div>
                </section>
        );
}
