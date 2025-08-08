"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, ArrowRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function ProductCard({ product, viewMode = "grid" }) {
	const router = useRouter();
	const { addItem, isLoading } = useCartStore();

	const handleViewProduct = () => {
		router.push(`/products/${product.id || product._id}`);
	};

	const handleAddToCart = async (e) => {
		e.stopPropagation();

		// Use the unified addItem function
		await addItem({
			id: product.id || product._id,
			name: product.title,
			description: product.description,
			price: product.salePrice || product.price,
			originalPrice: product.price,
			image: product.images?.[0] || product.image,
			inStock: product.inStock,
		});
	};

	const handleBuyNow = async (e) => {
		e.stopPropagation();

		// Redirect to checkout with buy now parameters
		router.push(`/checkout?buyNow=true&id=${product.id || product._id}&qty=1`);
	};

	if (viewMode === "list") {
		return (
			<Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group">
				<CardContent className="p-6">
					<div className="flex flex-col sm:flex-row gap-6">
						<div className="relative w-full sm:w-48 h-48 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
							<Image
								src={
									product.images?.[0] ||
									product.image ||
									"/placeholder.svg?height=192&width=192&text=Product"
								}
								alt={product.title}
								fill
								className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
								onClick={handleViewProduct}
							/>
							{product.discountPercentage > 0 && (
								<Badge className="absolute top-2 left-2 bg-red-500 text-white">
									{product.discountPercentage}% OFF
								</Badge>
							)}
							{product.type === "featured" && (
								<Badge className="absolute top-2 right-2 bg-blue-500 text-white">
									Featured
								</Badge>
							)}
						</div>

						<div className="flex-1 space-y-4">
							<div onClick={handleViewProduct}>
								<h3 className="text-xl font-semibold hover:text-blue-600 transition-colors">
									{product.title}
								</h3>
								<p className="text-gray-600 mt-2 line-clamp-2">
									{product.description}
								</p>
								<div className="flex items-center gap-2 mt-2">
									<div className="flex items-center">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												className="h-4 w-4 fill-yellow-400 text-yellow-400"
											/>
										))}
									</div>
									<span className="text-sm text-gray-500">(4.5)</span>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<p className="text-2xl font-bold">
											₹{(product.salePrice || product.price).toLocaleString()}
										</p>
										{product.price > (product.salePrice || product.price) && (
											<p className="text-lg text-gray-500 line-through">
												₹{product.price.toLocaleString()}
											</p>
										)}
									</div>
									<p
										className={`text-sm ${
											product.inStock ? "text-green-600" : "text-red-600"
										}`}
									>
										{product.inStock ? "In Stock" : "Out of Stock"}
									</p>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										className="rounded-full bg-transparent"
									>
										<Heart className="h-4 w-4" />
									</Button>
									<Button
										onClick={handleAddToCart}
										disabled={!product.inStock || isLoading}
										variant="outline"
										className="rounded-full bg-transparent"
									>
										<ShoppingCart className="h-4 w-4 mr-2" />
										Add to Cart
									</Button>
									<Button
										onClick={handleBuyNow}
										disabled={!product.inStock || isLoading}
										className="bg-black text-white hover:bg-gray-800 rounded-full"
									>
										Buy Now
										<ArrowRight className="ml-2 h-4 w-4" />
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
		<motion.div
			whileHover={{ y: -5 }}
			transition={{ duration: 0.2 }}
			className="h-full"
		>
			<Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col">
				<CardContent className="p-0 flex-1 flex flex-col">
					<div className="relative overflow-hidden">
						<div className="relative h-64 bg-gray-50 rounded-t-xl overflow-hidden">
							<Image
								src={
									product.images?.[0] ||
									product.image ||
									"/placeholder.svg?height=256&width=256&text=Product"
								}
								alt={product.title}
								fill
								className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
								onClick={handleViewProduct}
							/>

							{/* Badges */}
							<div className="absolute top-2 left-2 flex flex-col gap-1">
								{product.discountPercentage > 0 && (
									<Badge className="bg-red-500 text-white">
										{product.discountPercentage}% OFF
									</Badge>
								)}
								{product.type === "featured" && (
									<Badge className="bg-blue-500 text-white">Featured</Badge>
								)}
							</div>

							{/* Quick view overlay */}
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
								<Button
									variant="secondary"
									size="icon"
									className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
									onClick={handleViewProduct}
								>
									<Eye className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="p-6 flex-1 flex flex-col">
						<div className="flex-1" onClick={handleViewProduct}>
							<h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
								{product.title}
							</h3>
							<p className="text-gray-600 text-sm mb-3 line-clamp-2">
								{product.description}
							</p>

							{/* Rating */}
							<div className="flex items-center gap-2 mb-3">
								<div className="flex items-center">
									{[...Array(5)].map((_, i) => (
										<Star
											key={i}
											className="h-3 w-3 fill-yellow-400 text-yellow-400"
										/>
									))}
								</div>
								<span className="text-xs text-gray-500">(4.5)</span>
							</div>
						</div>

						{/* Price */}
						<div className="space-y-2 mb-4">
							<div className="flex items-center gap-2">
								<p className="text-xl font-bold">
									₹{(product.salePrice || product.price).toLocaleString()}
								</p>
								{product.price > (product.salePrice || product.price) && (
									<p className="text-sm text-gray-500 line-through">
										₹{product.price.toLocaleString()}
									</p>
								)}
							</div>
							<p
								className={`text-xs ${
									product.inStock ? "text-green-600" : "text-red-600"
								}`}
							>
								{product.inStock ? "In Stock" : "Out of Stock"}
							</p>
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between gap-2">
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="icon"
									className="rounded-full border-gray-300 hover:border-gray-400 bg-transparent"
								>
									<Heart className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									onClick={handleAddToCart}
									disabled={!product.inStock || isLoading}
									className="rounded-full border-gray-300 hover:border-gray-400 bg-transparent"
								>
									<ShoppingCart className="h-4 w-4" />
								</Button>
							</div>

							<Button
								onClick={handleBuyNow}
								disabled={!product.inStock || isLoading}
								className="bg-black text-white hover:bg-gray-800 rounded-full flex-1 max-w-[120px]"
								size="sm"
							>
								Buy Now
								<ArrowRight className="ml-1 h-3 w-3" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
