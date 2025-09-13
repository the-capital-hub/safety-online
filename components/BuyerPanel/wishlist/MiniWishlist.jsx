"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Heart, X, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function MiniWishlist() {
	const router = useRouter();
	const {
		items,
		isOpen,
		closeWishlist,
		removeItem,
		clearWishlist,
		getTotalItems,
		isLoading,
		moveToCart,
		moveAllToCart,
	} = useWishlistStore();

	const { addItem: addToCart } = useCartStore();

	const handleViewWishlist = () => {
		closeWishlist();
		router.push("/wishlist");
	};

	const handleMoveToCart = async (productId) => {
		await moveToCart(productId, addToCart);
	};

	const handleMoveAllToCart = async () => {
		await moveAllToCart(addToCart);
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black bg-opacity-50 z-50"
				onClick={closeWishlist}
			>
				<motion.div
					initial={{ x: "100%" }}
					animate={{ x: 0 }}
					exit={{ x: "100%" }}
					className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl"
					onClick={(e) => e.stopPropagation()}
				>
					<Card className="h-full rounded-none border-0 flex flex-col">
						<CardHeader className="flex-shrink-0">
							<div className="flex items-center justify-between">
								<CardTitle className="flex items-center gap-2">
									<Heart className="h-5 w-5 text-red-500" />
									Wishlist ({getTotalItems()})
								</CardTitle>
								<Button variant="ghost" size="icon" onClick={closeWishlist}>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>

						<CardContent className="flex-1 flex flex-col p-0">
							{items.length === 0 ? (
								<div className="flex-1 flex items-center justify-center p-6">
									<div className="text-center">
										<Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
										<p className="text-gray-600 mb-2">Your wishlist is empty</p>
										<p className="text-sm text-gray-500">
											Save items you love for later
										</p>
									</div>
								</div>
							) : (
								<>
									{/* Wishlist Items */}
									<div className="flex-1 overflow-y-auto p-4 space-y-4">
										{items.map((item) => (
											<div
												key={item.id}
												className="flex gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow"
											>
												<div className="relative w-16 h-16 bg-gray-50 rounded flex-shrink-0">
													<Image
														src={
															item.image ||
															"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
														}
														alt={item.name}
														fill
														className="object-contain p-1"
													/>
												</div>
												<div className="flex-1 min-w-0">
													<h4 className="font-medium text-sm line-clamp-2 mb-1">
														{item.name}
													</h4>
													<div className="flex items-center gap-2 mb-2">
														<p className="text-sm font-bold">
															₹{item.price.toLocaleString()}
														</p>
														{item.originalPrice &&
															item.originalPrice > item.price && (
																<p className="text-xs text-gray-500 line-through">
																	₹{item.originalPrice.toLocaleString()}
																</p>
															)}
													</div>
													<div className="flex items-center gap-1">
														<Button
															variant="outline"
															size="sm"
															className="flex-1 h-7 text-xs bg-black text-white hover:bg-gray-800"
															onClick={() => handleMoveToCart(item.id)}
															disabled={isLoading || !item.inStock}
														>
															<ShoppingCart className="h-3 w-3 mr-1" />
															{item.inStock ? "Add to Cart" : "Out of Stock"}
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
															onClick={() => removeItem(item.id)}
															disabled={isLoading}
														>
															<X className="h-3 w-3" />
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>

									{/* Wishlist Actions */}
									<div className="flex-shrink-0 p-4 border-t bg-gray-50">
										<div className="space-y-2 mb-4">
											<div className="flex justify-between text-sm">
												<span>Total Items</span>
												<span className="font-medium">{getTotalItems()}</span>
											</div>
											<Separator />
										</div>

										<div className="space-y-2">
											<Button
												onClick={handleMoveAllToCart}
												className="w-full bg-black text-white hover:bg-gray-800"
												disabled={
													isLoading || items.every((item) => !item.inStock)
												}
											>
												<ShoppingCart className="h-4 w-4 mr-2" />
												Move All to Cart
											</Button>
											<div className="flex gap-2">
												<Button
													onClick={handleViewWishlist}
													variant="outline"
													className="flex-1 bg-transparent"
													disabled={isLoading}
												>
													View Wishlist
												</Button>
												<Button
													onClick={clearWishlist}
													variant="outline"
													size="icon"
													className="text-red-600 hover:text-red-700 hover:bg-red-50"
													disabled={isLoading}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>

										<p className="text-xs text-gray-500 text-center mt-3">
											Items saved for later shopping
										</p>
									</div>
								</>
							)}
						</CardContent>
					</Card>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
