"use client";

import { useState, useMemo } from "react";
import { useHomeData } from "@/hooks/useHomeData";
import NavigationBar from "@/components/BuyerPanel/NavigationBar.jsx";
import HeroSection from "@/components/BuyerPanel/home/HeroSection.jsx";
import ProductShowcase from "@/components/BuyerPanel/home/ProductShowcase.jsx";
import CategorySection from "@/components/BuyerPanel/home/CategorySection.jsx";
import SupportSection from "@/components/BuyerPanel/home/SupportSection.jsx";
import FeaturedSection from "@/components/BuyerPanel/home/FeaturedSection.jsx";
import TrustedCompanies from "@/components/BuyerPanel/home/TrustedCompanies.jsx";

export default function HomePage() {
        const [searchQuery, setSearchQuery] = useState("");
        const [selectedCategory, setSelectedCategory] = useState("All");
        const [currentPage, setCurrentPage] = useState(1);

        const {
                discountedProducts,
                topSellingProducts,
                bestSellingProduct,
                featuredProducts,
                categoryProducts,
                categories,
                pagination,
                isLoading,
                error,
                refetch,
        } = useHomeData(selectedCategory, searchQuery, currentPage);

        const heroSpotlight = useMemo(() => {
                return (
                        bestSellingProduct ||
                        discountedProducts?.[0] ||
                        topSellingProducts?.[0] ||
                        featuredProducts?.[0] ||
                        null
                );
        }, [bestSellingProduct, discountedProducts, topSellingProducts, featuredProducts]);

        const handleSearch = (query) => {
                setSearchQuery(query);
                setCurrentPage(1);
        };

        const handleCategoryChange = (category) => {
                setSelectedCategory(category);
                setCurrentPage(1);
        };

        const handleLoadMore = () => {
                if (pagination?.hasNextPage) {
                        setCurrentPage((prev) => prev + 1);
                }
        };

        if (error) {
                return (
                        <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                        <p className="text-red-500 mb-4">Error loading page: {error}</p>
                                        <button
                                                onClick={refetch}
                                                className="px-4 py-2 bg-black text-white rounded"
                                        >
                                                Retry
                                        </button>
                                </div>
                        </div>
                );
        }

        return (
                <div className="min-h-[calc(100vh-68px)] bg-white">
                        <NavigationBar />
                        <HeroSection spotlightProduct={heroSpotlight} categories={categories} />
                        <TrustedCompanies />
                        <ProductShowcase products={discountedProducts} />
                        <CategorySection
                                products={categoryProducts}
                                categories={categories}
                                searchQuery={searchQuery}
                                selectedCategory={selectedCategory}
                                setSelectedCategory={handleCategoryChange}
                                onSearch={handleSearch}
                                pagination={pagination}
                                onLoadMore={handleLoadMore}
                                isLoading={isLoading}
                        />
                        <FeaturedSection
                                topSellingProducts={topSellingProducts}
                                bestSellingProduct={bestSellingProduct}
                                featuredProducts={featuredProducts}
                        />
                        <SupportSection />
                </div>
        );
}
