"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ensureSlug } from "@/lib/slugify.js";
import { useProductStore } from "@/store/productStore.js";
import ProductFilters from "@/components/BuyerPanel/products/ProductFilters.jsx";
import ProductGrid from "@/components/BuyerPanel/products/ProductGrid.jsx";

const getFirstValue = (value) => {
        if (!value) return undefined;
        return Array.isArray(value) ? value[0] : value;
};

export default function ProductsPageClient({ searchParams: initialSearchParams = {} }) {
        const urlSearchParams = useSearchParams();

        const { error, fetchProducts, setCurrentCategory, setCurrentSubCategory, setSearchQuery } = useProductStore();

        const { category, subCategory, search } = useMemo(() => {
                const params = {
                        category: getFirstValue(initialSearchParams.category),
                        subCategory: getFirstValue(initialSearchParams.subCategory),
                        search: getFirstValue(initialSearchParams.search),
                };

                if (urlSearchParams) {
                        const categoryParam = urlSearchParams.get("category");
                        const subCategoryParam = urlSearchParams.get("subCategory");
                        const searchParam = urlSearchParams.get("search");

                        if (categoryParam) params.category = categoryParam;
                        if (subCategoryParam) params.subCategory = subCategoryParam;
                        if (searchParam) params.search = searchParam;
                }

                return params;
        }, [initialSearchParams, urlSearchParams]);

        useEffect(() => {
                if (category) {
                        setCurrentCategory(ensureSlug(category));
                }

                if (subCategory) {
                        setCurrentSubCategory(ensureSlug(subCategory));
                }

                if (search) {
                        setSearchQuery(search);
                }

                fetchProducts();
        }, [category, subCategory, search, fetchProducts, setCurrentCategory, setCurrentSubCategory, setSearchQuery]);

        if (error) {
                return (
                        <div className="p-10">
                                <div className="flex min-h-[50vh] items-center justify-center">
                                        <div className="text-center">
                                                <h2 className="mb-2 text-2xl font-bold text-red-600">Error</h2>
                                                <p className="text-gray-600">{error}</p>
                                                <button
                                                        onClick={() => fetchProducts()}
                                                        className="mt-4 rounded bg-black px-4 py-2 text-white"
                                                >
                                                        Try Again
                                                </button>
                                        </div>
                                </div>
                        </div>
                );
        }

        return (
                <div className="px-4 pb-16 pt-8 lg:px-10">
                        <div className="flex flex-col gap-8 lg:flex-row">
                                <div className="flex-shrink-0 lg:w-80">
                                        <ProductFilters />
                                </div>

                                <div className="flex-1">
                                        <ProductGrid />
                                </div>
                        </div>
                </div>
        );
}
