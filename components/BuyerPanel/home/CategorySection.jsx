"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Grid, List, Search } from "lucide-react";
import ProductGrid from "@/components/BuyerPanel/home/ProductGrid.jsx";

const SectionBadge = ({ children }) => (
        <span className="inline-flex items-center rounded-full bg-[#fff7ed] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#f97316]">
                {children}
        </span>
);

export default function CategorySection({
        products = [],
        categories = [],
        searchQuery = "",
        selectedCategory = "All",
        setSelectedCategory,
        onSearch,
        pagination,
        onLoadMore,
        isLoading = false,
}) {
        const [localSearch, setLocalSearch] = useState(searchQuery);
        const [viewMode, setViewMode] = useState("grid");

        const handleSearchSubmit = (e) => {
                e.preventDefault();
                if (onSearch) {
                        onSearch(localSearch.trim());
                }
        };

        const handleCategoryChange = (category) => {
                setSelectedCategory(category);
        };

        return (
                <section className="relative overflow-hidden bg-[#f8fafc] py-16">
                        <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-white to-transparent" aria-hidden />
                        <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#bfdbfe]/50 blur-3xl" aria-hidden />
                        <div className="absolute -right-32 top-16 h-80 w-80 rounded-full bg-[#fde68a]/60 blur-3xl" aria-hidden />

                        <div className="relative mx-auto max-w-7xl px-6">
                                <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="max-w-3xl space-y-4">
                                                <SectionBadge>Shop by requirement</SectionBadge>
                                                <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
                                                        Browse our curated industrial catalogue
                                                </h2>
                                                <p className="text-base leading-relaxed text-slate-600">
                                                        Filter products by category, search for specific SKUs or toggle between grid and list views to compare specifications effortlessly.
                                                </p>
                                        </div>

                                        <form onSubmit={handleSearchSubmit} className="w-full max-w-md">
                                                <div className="relative">
                                                        <Input
                                                                name="searchQuery"
                                                                placeholder="Search helmets, gloves, fire extinguishers..."
                                                                value={localSearch}
                                                                onChange={(e) => setLocalSearch(e.target.value)}
                                                                className="h-12 rounded-full border border-slate-200 bg-white pl-12 pr-12 text-sm focus-visible:ring-[#f97316]"
                                                        />
                                                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                        <Button
                                                                type="submit"
                                                                size="sm"
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-[#f97316] px-4 text-xs font-semibold uppercase tracking-wide hover:bg-[#ea580c]"
                                                        >
                                                                Search
                                                        </Button>
                                                </div>
                                        </form>
                                </div>

                                {categories.length > 0 ? (
                                        <div className="mt-10 flex flex-wrap gap-3 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur">
                                                {categories.map((category) => {
                                                        const isActive = selectedCategory === category;
                                                        return (
                                                                <Button
                                                                        key={category}
                                                                        type="button"
                                                                        variant="ghost"
                                                                        onClick={() => handleCategoryChange(category)}
                                                                        className={`rounded-full border px-5 py-2 text-sm font-medium shadow-sm transition ${
                                                                                isActive
                                                                                        ? "border-[#f97316] bg-[#f97316]/10 text-[#b45309]"
                                                                                        : "border-transparent text-slate-600 hover:border-[#f97316]/30 hover:bg-[#f97316]/5 hover:text-[#9a3412]"
                                                                        }`}
                                                                >
                                                                        {category}
                                                                </Button>
                                                        );
                                                })}
                                        </div>
                                ) : null}

                                <div className="mt-10 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#f97316]/80">
                                                                {selectedCategory === "All" ? "All categories" : selectedCategory}
                                                        </p>
                                                        <h3 className="text-2xl font-semibold text-slate-900">
                                                                {pagination?.totalProducts || products.length} products ready to dispatch
                                                        </h3>
                                                </div>
                                                <div className="flex items-center gap-2 self-start rounded-full bg-slate-100 p-1 text-slate-500">
                                                        <Button
                                                                type="button"
                                                                variant={viewMode === "grid" ? "default" : "ghost"}
                                                                size="icon"
                                                                onClick={() => setViewMode("grid")}
                                                                className={`h-10 w-10 rounded-full ${viewMode === "grid" ? "bg-[#f97316] text-white hover:bg-[#ea580c]" : "bg-transparent text-slate-500 hover:text-[#ea580c]"}`}
                                                        >
                                                                <Grid className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                                type="button"
                                                                variant={viewMode === "list" ? "default" : "ghost"}
                                                                size="icon"
                                                                onClick={() => setViewMode("list")}
                                                                className={`h-10 w-10 rounded-full ${viewMode === "list" ? "bg-[#f97316] text-white hover:bg-[#ea580c]" : "bg-transparent text-slate-500 hover:text-[#ea580c]"}`}
                                                        >
                                                                <List className="h-4 w-4" />
                                                        </Button>
                                                </div>
                                        </div>

                                        <div className="mt-8">
                                                {isLoading && products.length === 0 ? (
                                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                                {[...Array(6)].map((_, index) => (
                                                                        <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                                                                ))}
                                                        </div>
                                                ) : (
                                                        <ProductGrid products={products} viewMode={viewMode} />
                                                )}
                                        </div>

                                        {pagination && pagination.hasNextPage ? (
                                                <div className="mt-10 flex justify-center">
                                                        <Button
                                                                variant="outline"
                                                                className="rounded-full border-[#f97316]/30 px-10 py-3 font-semibold text-[#b45309] hover:border-[#f97316] hover:bg-[#f97316]/10"
                                                                onClick={onLoadMore}
                                                                disabled={isLoading}
                                                        >
                                                                {isLoading ? "Loading..." : "Load more results"}
                                                        </Button>
                                                </div>
                                        ) : null}
                                </div>
                        </div>
                </section>
        );
}
