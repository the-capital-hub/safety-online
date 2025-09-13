"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function WishlistPage() {
	const router = useRouter();
	const {
		items,
		removeItem,
		clearWishlist,
		getTotalItems,
		isLoading,
		fetchWishlist,
		moveToCart,
		moveAllToCart,
	} = useWishlistStore();

	const { addItem: addToCart } = useCartStore();

	useEffect(() => {
		fetchWishlist();
	}, [fetchWishlist]);

	const handleMoveToCart = async (productId) => {
		await moveToCart(productId, addToCart);
	};

	const handleMoveAllToCart = async () => {
		if (items.length === 0) {
			toast.error("Your wishlist is empty");
			return;
		}
		await moveAllToCart(addToCart);
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.5,
			},
		},
	};

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => router.back()}
							className="rounded-full"
						>
							<ArrowLeft className="h-5 w-5" />
						</Button>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
								<Heart className="h-8 w-8 text-red-500" />
								My Wishlist
							</h1>
							<p className="text-gray-600 mt-1">
								{getTotalItems()} {getTotalItems() === 1 ? "item" : "items"}{" "}
								saved
							</p>
						</div>
					</div>

					{items.length > 0 && (
						<div className="flex items-center gap-2">
							<Button
								onClick={handleMoveAllToCart}
								className="bg-black text-white hover:bg-gray-800"
								disabled={isLoading || items.every((item) => !item.inStock)}
							>
								<ShoppingCart className="h-4 w-4 mr-2" />
								Move All to Cart
							</Button>
							<Button
								onClick={clearWishlist}
								variant="outline"
								className="text-red-600 hover:text-red-700 hover:bg-red-50"
								disabled={isLoading}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Clear All
							</Button>
						</div>
					)}
				</div>

				{/* Loading State */}
				{isLoading && items.length === 0 && (
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
					</div>
				)}

				{/* Empty State */}
				{!isLoading && items.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center py-16"
					>
						<Heart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
						<h2 className="text-2xl font-semibold text-gray-900 mb-2">
							Your wishlist is empty
						</h2>
						<p className="text-gray-600 mb-8 max-w-md mx-auto">
							Save items you love for later. Start browsing and add products to
							your wishlist.
						</p>
						<Link href="/products">
							<Button className="bg-black text-white hover:bg-gray-800">
								Continue Shopping
							</Button>
						</Link>
					</motion.div>
				)}

				{/* Wishlist Items */}
				{items.length > 0 && (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
					>
						{items.map((item) => (
							<motion.div key={item.id} variants={itemVariants}>
								<Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
									<div className="relative aspect-square bg-gray-100">
										<Image
											src={
												item.image ||
												"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
											}
											alt={item.name}
											fill
											className="object-contain p-4"
										/>
										<Button
											variant="ghost"
											size="icon"
											className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
											onClick={() => removeItem(item.id)}
											disabled={isLoading}
										>
											<Heart className="h-4 w-4 fill-current" />
										</Button>
										{!item.inStock && (
											<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
												<span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium">
													Out of Stock
												</span>
											</div>
										)}
									</div>
									<CardContent className="p-4">
										<h3 className="font-medium text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
											{item.name}
										</h3>
										<div className="flex items-center gap-2 mb-3">
											<span className="font-bold text-lg">
												₹{item.price.toLocaleString()}
											</span>
											{item.originalPrice &&
												item.originalPrice > item.price && (
													<span className="text-sm text-gray-500 line-through">
														₹{item.originalPrice.toLocaleString()}
													</span>
												)}
										</div>
										<div className="flex gap-2">
											<Button
												onClick={() => handleMoveToCart(item.id)}
												className="flex-1 bg-black text-white hover:bg-gray-800"
												disabled={isLoading || !item.inStock}
											>
												<ShoppingCart className="h-4 w-4 mr-2" />
												{item.inStock ? "Add to Cart" : "Out of Stock"}
											</Button>
											<Button
												variant="outline"
												size="icon"
												className="text-red-600 hover:text-red-700 hover:bg-red-50"
												onClick={() => removeItem(item.id)}
												disabled={isLoading}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
										{item.addedAt && (
											<p className="text-xs text-gray-500 mt-2">
												Added {new Date(item.addedAt).toLocaleDateString()}
											</p>
										)}
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				)}

				{/* Continue Shopping */}
				{items.length > 0 && (
					<div className="text-center mt-12">
						<Link href="/products">
							<Button variant="outline" size="lg">
								Continue Shopping
							</Button>
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
