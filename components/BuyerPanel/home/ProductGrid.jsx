"use client";

import { motion } from "framer-motion";
import ProductCard from "@/components/BuyerPanel/products/ProductCard.jsx";

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
			: "grid grid-cols-1 xl:grid-cols-2 gap-8 w-full";

	return (
		<div className={gridClass}>
			{products.map((product, index) => (
				<motion.div
					key={product.id}
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: index * 0.1 }}
					className={viewMode === "list" ? "max-w-7xl mx-auto" : ""}
				>
					<ProductCard product={product} viewMode={viewMode} />
				</motion.div>
			))}
		</div>
	);
}
