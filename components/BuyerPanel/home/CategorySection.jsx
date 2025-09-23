"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Grid, List, Search } from "lucide-react";
import ProductGrid from "@/components/BuyerPanel/home/ProductGrid.jsx";

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
			onSearch(localSearch);
		}
	};

	const handleCategoryChange = (category) => {
		setSelectedCategory(category);
	};

	// Loading state
	if (isLoading && products.length === 0) {
		return (
			<section className="py-8 md:py-16 bg-white">
				<div className="px-10">
					<div className="text-center mb-8 md:mb-12">
						<div className="animate-pulse">
							<div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
							<div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="bg-gray-200 rounded-lg h-64"></div>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="py-8 md:py-16 bg-white">
			<div className="px-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mb-8 md:mb-12"
				>
					<p className="text-yellow-500 text-sm font-medium mb-2">Categories</p>
					<h2 className="text-2xl md:text-3xl font-bold">Browse By Category</h2>
				</motion.div>

				{/* Search Bar */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="w-full relative mb-6 max-w-xl mx-auto"
				>
					<form onSubmit={handleSearchSubmit}>
						<Input name="searchQuery"
							placeholder="Search products..."
							value={localSearch}
							onChange={(e) => setLocalSearch(e.target.value)}
							className="pl-10 max-w-xl mx-auto"
						/>
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
					</form>
				</motion.div>

				{/* Category Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="flex flex-wrap gap-2 mb-6 md:mb-8 justify-center"
				>
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? "default" : "outline"}
							className={
								selectedCategory === category ? "bg-black text-white" : ""
							}
							onClick={() => handleCategoryChange(category)}
							size="sm"
						>
							{category}
						</Button>
					))}
				</motion.div>

				{/* Controls */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3 }}
					className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 space-y-4 sm:space-y-0"
				>
					<h3 className="text-lg md:text-xl font-bold">
						Top Products ({pagination?.totalProducts || products.length})
					</h3>
					<div className="flex items-center space-x-4">
						{/* <div className="flex items-center space-x-2 text-sm text-gray-600">
							<Filter className="h-4 w-4" />
							<span>FILTER</span>
						</div> */}
						<div className="md:flex hidden space-x-1">
							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								size="icon"
								onClick={() => setViewMode("grid")}
							>
								<Grid className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "outline"}
								size="icon"
								onClick={() => setViewMode("list")}
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</motion.div>

				{/* Products Grid */}
				<ProductGrid products={products} viewMode={viewMode} />

				{/* Load More Button */}
				{pagination && pagination.hasNextPage && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mt-8 md:mt-12"
					>
						<Button
							variant="outline"
							className="px-8 bg-transparent"
							onClick={onLoadMore}
							disabled={isLoading}
						>
							{isLoading ? "Loading..." : "Load More"}
						</Button>
					</motion.div>
				)}
			</div>
		</section>
	);
}
