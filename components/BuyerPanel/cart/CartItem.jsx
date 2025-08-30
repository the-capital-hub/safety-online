"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, X, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Image from "next/image";

export default function CartItem({ item }) {
	const { updateQuantity, removeItem, isLoading } = useCartStore();

	const handleQuantityChange = (newQuantity) => {
		if (newQuantity < 1) {
			removeItem(item.id);
		} else {
			updateQuantity(item.id, newQuantity);
		}
	};

	const handleRemove = () => {
		removeItem(item.id);
	};

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.2 }}
		>
			<Card className="overflow-hidden">
				<CardContent className="p-6">
					<div className="flex gap-4">
						{/* Product Image */}
						<div className="relative w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
							<Image
								src={
									item.image ||
									"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
								}
								alt={item.name}
								fill
								className="object-contain p-2"
							/>
						</div>

						{/* Product Details */}
						<div className="flex-1 min-w-0">
							<div className="flex justify-between items-start mb-2">
								<div className="flex-1 min-w-0 pr-4">
									<h3 className="font-semibold text-lg line-clamp-2 mb-1">
										{item.name}
									</h3>
									<p className="text-gray-600 text-sm line-clamp-2 mb-2">
										{item.description}
									</p>
									<div className="flex items-center gap-2">
										<p className="text-xl font-bold">
											₹{item.price.toLocaleString()}
										</p>
										{item.originalPrice && item.originalPrice > item.price && (
											<p className="text-sm text-gray-500 line-through">
												₹{item.originalPrice.toLocaleString()}
											</p>
										)}
									</div>
								</div>

								{/* Remove Button */}
								<Button
									variant="ghost"
									size="icon"
									className="text-gray-400 hover:text-red-600 flex-shrink-0"
									onClick={handleRemove}
									disabled={isLoading}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							{/* Quantity Controls and Actions */}
							<div className="flex items-center justify-between mt-4">
								<div className="flex items-center gap-3">
									<div className="flex items-center border rounded-lg">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-r-none"
											onClick={() => handleQuantityChange(item.quantity - 1)}
											disabled={isLoading}
										>
											<Minus className="h-3 w-3" />
										</Button>
										<div className="w-12 h-8 flex items-center justify-center border-x text-sm font-medium">
											{item.quantity}
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 rounded-l-none"
											onClick={() => handleQuantityChange(item.quantity + 1)}
											disabled={isLoading}
										>
											<Plus className="h-3 w-3" />
										</Button>
									</div>

									<p className="text-sm text-gray-600">
										{item.inStock ? "In Stock" : "Out of Stock"}
									</p>
								</div>

								{/* Wishlist Button - Need to add functionality */}
								{/* <Button
									variant="outline"
									size="sm"
									className="flex items-center gap-2"
								>
									<Heart className="h-4 w-4" />
									Save for Later
								</Button> */}
							</div>

							{/* Item Total */}
							<div className="mt-3 pt-3 border-t">
								<div className="flex justify-between items-center">
									<span className="text-sm text-gray-600">Item Total:</span>
									<span className="font-bold text-lg">
										₹{(item.price * item.quantity).toLocaleString()}
									</span>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
