"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	ShoppingCart,
	Heart,
	Share2,
	Minus,
	Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useProductStore } from "@/lib/store";
import ProductCard from "@/components/products/ProductCard.jsx";

export default function ProductDetail({ product }) {
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const router = useRouter();
	const { addItem } = useCartStore();
	const { products } = useProductStore();

	// Get related products
	const relatedProducts =
		product.relatedProducts
			?.map((id) => products.find((p) => p.id === id))
			.filter(Boolean) || [];

	const handleAddToCart = () => {
		for (let i = 0; i < quantity; i++) {
			addItem(product);
		}
	};

	const handleQuantityChange = (change) => {
		const newQuantity = quantity + change;
		if (newQuantity >= 1) {
			setQuantity(newQuantity);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 lg:px-10 py-8">
				{/* Breadcrumb */}
				<div className="mb-6">
					<Link
						href="/products"
						className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Products
					</Link>
				</div>

				{/* Product Details */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
					{/* Product Images */}
					<div className="space-y-6">
						<motion.div
							className="bg-white rounded-lg overflow-hidden shadow-sm"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="relative h-96 lg:h-[500px]">
								<img
									src={
										product.gallery?.[selectedImage] ||
										product.image ||
										"/placeholder.svg"
									}
									alt={product.name}
									className="w-full h-full object-contain p-8"
								/>
							</div>
						</motion.div>

						{/* Image Gallery */}
						{product.gallery && product.gallery.length > 1 && (
							<div className="flex space-x-4 justify-center">
								{product.gallery.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`relative w-20 h-20 border-2 rounded-lg overflow-hidden ${
											selectedImage === index
												? "border-black"
												: "border-gray-200"
										}`}
									>
										<img
											src={image || "/placeholder.svg"}
											alt={`${product.name} view ${index + 1}`}
											className="w-full h-full object-contain p-2"
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product Info */}
					<motion.div
						className="space-y-6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<div>
							<Badge variant="secondary" className="mb-4">
								{product.category?.replace("-", " ").toUpperCase()}
							</Badge>
							<h1 className="text-3xl lg:text-4xl font-bold mb-4">
								{product.name}
							</h1>
							<p className="text-xl lg:text-2xl font-semibold text-green-600 mb-6">
								₹ {product.price.toLocaleString()}
							</p>
						</div>

						<div className="prose max-w-none">
							<p className="text-gray-600">{product.longDescription}</p>
						</div>

						{/* Quantity and Add to Cart */}
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<span className="font-medium">Quantity:</span>
								<div className="flex items-center border rounded-lg">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleQuantityChange(-1)}
										disabled={quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="px-4 py-2 font-medium">{quantity}</span>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleQuantityChange(1)}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									onClick={handleAddToCart}
									className="flex-1 bg-black text-white hover:bg-gray-800"
									size="lg"
								>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
								</Button>
								<Button variant="outline" size="lg">
									<Heart className="h-5 w-5 mr-2" />
									Wishlist
								</Button>
								<Button variant="outline" size="lg">
									<Share2 className="h-5 w-5" />
								</Button>
							</div>
						</div>

						{/* Stock Status */}
						<div className="flex items-center space-x-2">
							<div
								className={`w-3 h-3 rounded-full ${
									product.inStock ? "bg-green-500" : "bg-red-500"
								}`}
							/>
							<span
								className={product.inStock ? "text-green-600" : "text-red-600"}
							>
								{product.inStock ? "In Stock" : "Out of Stock"}
							</span>
						</div>
					</motion.div>
				</div>

				{/* Product Features */}
				{product.features && (
					<motion.div
						className="mb-16"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<h2 className="text-2xl font-bold mb-8">Product Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{product.features.map((feature, index) => (
								<div key={index} className="bg-white rounded-lg p-6 shadow-sm">
									<h3 className="font-semibold text-lg mb-3">
										{feature.title}
									</h3>
									<p className="text-gray-600">{feature.description}</p>
								</div>
							))}
						</div>
					</motion.div>
				)}

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.6 }}
					>
						<h2 className="text-2xl font-bold mb-8">Related Products</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{relatedProducts.map((relatedProduct) => (
								<ProductCard key={relatedProduct.id} product={relatedProduct} />
							))}
						</div>
					</motion.div>
				)}
			</div>
		</div>
	);
}
