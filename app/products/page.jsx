"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductFilters from "@/components/products/ProductFilters.jsx";
import ProductGrid from "@/components/products/ProductGrid.jsx";
// import CategoryNav from "@/components/products/CategoryNav.jsx";
import FeaturedBanner from "@/components/products/FeaturedBanner.jsx";
import { useProductStore } from "@/lib/store";

export default function ProductsPage() {
	const searchParams = useSearchParams();
	const { setCurrentCategory } = useProductStore();

	useEffect(() => {
		const category = searchParams.get("category") || "all";
		setCurrentCategory(category);
	}, [searchParams, setCurrentCategory]);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 lg:px-10 py-8">
				{/* Featured Banner */}
				<div className="mb-8">
					<FeaturedBanner />
				</div>

				{/* Category Navigation */}
				{/* <div className="mb-8">
					<CategoryNav />
				</div> */}

				{/* Main Content */}
				<div className="flex flex-col lg:flex-row gap-8">
					{/* Filters Sidebar */}
					<aside className="lg:w-80 flex-shrink-0">
						<ProductFilters />
					</aside>

					{/* Products Grid */}
					<main className="flex-1">
						<ProductGrid />
					</main>
				</div>
			</div>
		</div>
	);
}
