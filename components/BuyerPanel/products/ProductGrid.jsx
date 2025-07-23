"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	ChevronLeft,
	ChevronRight,
	Grid,
	List,
	SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useProductStore } from "@/store/productStore.js";
import ProductCard from "@/components/BuyerPanel/products/ProductCard.jsx";

export default function ProductGrid() {
	const [viewMode, setViewMode] = useState("grid");

	const {
		filteredProducts,
		currentPage,
		totalPages,
		isLoading,
		setCurrentPage,
		setSorting,
		sortBy,
		sortOrder,
	} = useProductStore();

	const handlePageChange = (page) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleSortChange = (value) => {
		const [sortField, order] = value.split("-");
		setSorting(sortField, order);
	};

	const getSortValue = () => {
		return `${sortBy}-${sortOrder}`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg p-6 shadow-sm">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">Products</h1>
						<p className="text-gray-600 mt-1">
							{isLoading
								? "Loading products..."
								: `Showing ${filteredProducts.length} products`}
						</p>
					</div>

					<div className="flex items-center gap-4">
						{/* Sort Dropdown */}
						<Select value={getSortValue()} onValueChange={handleSortChange}>
							<SelectTrigger className="w-48">
								<SlidersHorizontal className="h-4 w-4 mr-2" />
								<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="createdAt-desc">Newest First</SelectItem>
								<SelectItem value="createdAt-asc">Oldest First</SelectItem>
								<SelectItem value="price-asc">Price: Low to High</SelectItem>
								<SelectItem value="price-desc">Price: High to Low</SelectItem>
								<SelectItem value="name-asc">Name: A to Z</SelectItem>
								<SelectItem value="name-desc">Name: Z to A</SelectItem>
							</SelectContent>
						</Select>

						{/* View Mode Toggle */}
						<div className="flex items-center border rounded-lg">
							<Button
								variant={viewMode === "grid" ? "default" : "ghost"}
								size="sm"
								onClick={() => setViewMode("grid")}
								className="rounded-r-none"
							>
								<Grid className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "ghost"}
								size="sm"
								onClick={() => setViewMode("list")}
								className="rounded-l-none"
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Products Grid/List */}
			{isLoading ? (
				<div className="bg-white rounded-lg p-12 shadow-sm">
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
					</div>
				</div>
			) : filteredProducts.length === 0 ? (
				<div className="bg-white rounded-lg p-12 shadow-sm text-center">
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						No products found
					</h3>
					<p className="text-gray-600">
						Try adjusting your filters or search terms.
					</p>
				</div>
			) : (
				<motion.div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
							: "space-y-6"
					}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					{filteredProducts.map((product, index) => (
						<motion.div
							key={product.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.05 }}
						>
							<ProductCard product={product} viewMode={viewMode} />
						</motion.div>
					))}
				</motion.div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex justify-between items-center bg-white rounded-lg px-4 py-3 shadow-sm">
					<p className="text-center text-sm">
						Page {currentPage} of {totalPages}
					</p>
					<div className="">
						<div className="flex items-center justify-center space-x-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>

							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								let pageNum;
								if (totalPages <= 5) {
									pageNum = i + 1;
								} else if (currentPage <= 3) {
									pageNum = i + 1;
								} else if (currentPage >= totalPages - 2) {
									pageNum = totalPages - 4 + i;
								} else {
									pageNum = currentPage - 2 + i;
								}

								return (
									<Button
										key={pageNum}
										variant={currentPage === pageNum ? "default" : "outline"}
										size="icon"
										className={
											currentPage === pageNum ? "bg-black text-white" : ""
										}
										onClick={() => handlePageChange(pageNum)}
									>
										{pageNum}
									</Button>
								);
							})}

							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									handlePageChange(Math.min(totalPages, currentPage + 1))
								}
								disabled={currentPage === totalPages}
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
