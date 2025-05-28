"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";

export default function ProductCard({ product, viewMode = "grid" }) {
	const router = useRouter();
	const { addItem } = useCartStore();

	const handleViewProduct = () => {
		router.push(`/products/${product.id}`);
	};

	const handleAddToCart = (e) => {
		e.stopPropagation();
		addItem(product);
	};

	if (viewMode === "list") {
		return (
			<Card
				className="hover:shadow-lg transition-shadow cursor-pointer"
				onClick={handleViewProduct}
			>
				<CardContent className="p-6">
					<div className="flex flex-col sm:flex-row gap-6">
						<div className="relative w-full sm:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
							<img
								src={product.image || "/placeholder.svg"}
								alt={product.name}
								className="w-full h-full object-contain p-4"
							/>
						</div>
						<div className="flex-1 space-y-4">
							<div>
								<h3 className="text-xl font-semibold">{product.name}</h3>
								<p className="text-gray-600 mt-2">{product.description}</p>
							</div>
							<div className="flex items-center justify-between">
								<p className="text-2xl font-bold">
									₹ {product.price.toLocaleString()}
								</p>
								<div className="flex space-x-2">
									<Button variant="outline" size="icon">
										<Heart className="h-4 w-4" />
									</Button>
									<Button
										onClick={handleAddToCart}
										className="bg-black text-white hover:bg-gray-800"
									>
										<ShoppingCart className="h-4 w-4 mr-2" />
										Add to Cart
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
			<Card
				className="hover:shadow-lg transition-shadow cursor-pointer group"
				onClick={handleViewProduct}
			>
				<CardContent className="p-0">
					<div className="relative overflow-hidden">
						<div className="relative h-64 bg-gray-100">
							<img
								src={product.image || "/placeholder.svg"}
								alt={product.name}
								className="w-full h-full object-contain p-4"
							/>
							{/* Overlay on hover */}
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
								<Button
									variant="secondary"
									size="icon"
									className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								>
									<Eye className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="p-6">
						<h3 className="font-semibold text-lg mb-2 line-clamp-2">
							{product.name}
						</h3>
						<p className="text-gray-600 text-sm mb-4 line-clamp-2">
							{product.description}
						</p>

						<div className="flex items-center justify-between">
							<p className="text-xl font-bold">
								₹ {product.price.toLocaleString()}
							</p>
							<div className="flex space-x-2">
								<Button
									variant="outline"
									size="icon"
									onClick={(e) => e.stopPropagation()}
								>
									<Heart className="h-4 w-4" />
								</Button>
								<Button
									size="sm"
									onClick={handleAddToCart}
									className="bg-black text-white hover:bg-gray-800"
								>
									<ShoppingCart className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
