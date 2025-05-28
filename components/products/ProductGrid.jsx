"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Grid, List } from "lucide-react";
import { useState } from "react";
import { useProductStore } from "@/lib/store";
import ProductCard from "@/components/products/ProductCard.jsx";

export default function ProductGrid() {
	const [viewMode, setViewMode] = useState("grid");
	const { filteredProducts, currentPage, setCurrentPage } = useProductStore();

	const itemsPerPage = 9;
	const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const currentProducts = filteredProducts.slice(startIndex, endIndex);

	const handlePageChange = (page) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<div>
					<h1 className="text-2xl font-bold">All Products</h1>
					<p className="text-gray-600">
						Showing {currentProducts.length} of {filteredProducts.length}{" "}
						products
					</p>
				</div>

				<div className="flex items-center space-x-2">
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

			{/* Products Grid */}
			{currentProducts.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-gray-500 text-lg">
						No products found matching your criteria.
					</p>
				</div>
			) : (
				<motion.div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
							: "space-y-4"
					}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					{currentProducts.map((product, index) => (
						<motion.div
							key={product.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
						>
							<ProductCard product={product} viewMode={viewMode} />
						</motion.div>
					))}
				</motion.div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center space-x-2 mt-8">
					<Button
						variant="outline"
						size="icon"
						onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
						disabled={currentPage === 1}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>

					{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
						<Button
							key={page}
							variant={currentPage === page ? "default" : "outline"}
							size="icon"
							className={currentPage === page ? "bg-black text-white" : ""}
							onClick={() => handlePageChange(page)}
						>
							{page}
						</Button>
					))}

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
			)}
		</div>
	);
}
