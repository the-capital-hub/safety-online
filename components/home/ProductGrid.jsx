"use client";

import { motion } from "framer-motion";
// import ProductCard from "@/components/home/ProductCard.jsx";
import ProductCard from "@/components/products/ProductCard.jsx";

export default function ProductGrid({ products, viewMode = "grid" }) {
	if (products.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-gray-500 text-lg">
					No products found matching your criteria.
				</p>
			</div>
		);
	}

	const gridClass =
		viewMode === "grid"
			? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
			: "space-y-4";

	return (
		<div className={gridClass}>
			{products.map((product, index) => (
				<motion.div
					key={product.id}
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: index * 0.1 }}
					className={viewMode === "list" ? "max-w-md mx-auto" : ""}
				>
					<ProductCard product={product} />
				</motion.div>
			))}
		</div>
	);
}
