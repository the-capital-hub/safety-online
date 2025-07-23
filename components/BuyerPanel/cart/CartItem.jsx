// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Minus, Plus, Trash2 } from "lucide-react";
// import { useCartStore } from "@/lib/store";

// export default function CartItem({ item }) {
// 	const { updateQuantity, removeItem } = useCartStore();

// 	// Mock size and color data (in real app, this would come from the item)
// 	const itemSize = item.size || "Large";
// 	const itemColor =
// 		item.color || ["Blue", "Yellow", "Red"][Math.floor(Math.random() * 3)];

// 	const handleQuantityChange = (change) => {
// 		const newQuantity = item.quantity + change;
// 		if (newQuantity > 0) {
// 			updateQuantity(item.id, newQuantity);
// 		}
// 	};

// 	const handleRemove = () => {
// 		removeItem(item.id);
// 	};

// 	return (
// 		<Card className="hover:shadow-md transition-shadow">
// 			<CardContent className="p-6">
// 				<div className="flex gap-4">
// 					{/* Product Image */}
// 					<div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
// 						<img
// 							src={item.image || "/placeholder.svg"}
// 							alt={item.name}
// 							className="w-full h-full object-contain p-2"
// 						/>
// 					</div>

// 					{/* Product Details */}
// 					<div className="flex-1 min-w-0">
// 						<div className="flex justify-between items-start mb-2">
// 							<div className="flex-1 min-w-0">
// 								<h3 className="font-semibold text-lg truncate">{item.name}</h3>
// 								<div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
// 									<span>Size: {itemSize}</span>
// 									<span>Color: {itemColor}</span>
// 								</div>
// 							</div>
// 							<Button
// 								variant="ghost"
// 								size="icon"
// 								onClick={handleRemove}
// 								className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
// 							>
// 								<Trash2 className="h-4 w-4" />
// 							</Button>
// 						</div>

// 						<div className="flex items-center justify-between">
// 							<div className="text-xl font-bold">
// 								₹{item.price.toLocaleString()}
// 							</div>

// 							{/* Quantity Controls */}
// 							<div className="flex items-center bg-gray-100 rounded-lg">
// 								<Button
// 									variant="ghost"
// 									size="icon"
// 									onClick={() => handleQuantityChange(-1)}
// 									disabled={item.quantity <= 1}
// 									className="h-8 w-8 hover:bg-gray-200"
// 								>
// 									<Minus className="h-4 w-4" />
// 								</Button>
// 								<span className="font-medium px-3 py-1 min-w-[2rem] text-center">
// 									{item.quantity}
// 								</span>
// 								<Button
// 									variant="ghost"
// 									size="icon"
// 									onClick={() => handleQuantityChange(1)}
// 									className="h-8 w-8 hover:bg-gray-200"
// 								>
// 									<Plus className="h-4 w-4" />
// 								</Button>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</CardContent>
// 		</Card>
// 	);
// }

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore.js";
import Image from "next/image";

export default function CartItem({ item }) {
	const [quantity, setQuantity] = useState(item.quantity);
	const [isUpdating, setIsUpdating] = useState(false);
	const { updateQuantityLocal, removeItemLocal } = useCartStore();

	const handleQuantityChange = async (newQuantity) => {
		if (newQuantity < 1) return;

		setIsUpdating(true);
		setQuantity(newQuantity);

		try {
			await updateQuantityLocal(item.id, newQuantity);
		} catch (error) {
			console.error("Failed to update quantity:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleRemove = () => {
		removeItemLocal(item.id);
	};

	const discountPercentage =
		item.originalPrice && item.originalPrice > item.price
			? Math.round(
					((item.originalPrice - item.price) / item.originalPrice) * 100
			  )
			: 0;

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.3 }}
		>
			<Card className="overflow-hidden hover:shadow-md transition-shadow">
				<CardContent className="p-0">
					<div className="flex flex-col sm:flex-row">
						{/* Product Image */}
						<div className="relative w-full sm:w-32 h-32 bg-gray-50 flex-shrink-0">
							<Image
								src={
									item.image ||
									"/placeholder.svg?height=128&width=128&text=Product"
								}
								alt={item.name}
								fill
								className="object-contain p-2"
							/>
							{discountPercentage > 0 && (
								<Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
									{discountPercentage}% OFF
								</Badge>
							)}
						</div>

						{/* Product Details */}
						<div className="flex-1 p-4">
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
								{/* Product Info */}
								<div className="flex-1">
									<h3 className="font-semibold text-lg mb-1 line-clamp-2">
										{item.name}
									</h3>
									<p className="text-gray-600 text-sm mb-2 line-clamp-2">
										{item.description}
									</p>

									{/* Price */}
									<div className="flex items-center gap-2 mb-3">
										<span className="text-xl font-bold">
											₹{item.price.toLocaleString()}
										</span>
										{item.originalPrice && item.originalPrice > item.price && (
											<span className="text-sm text-gray-500 line-through">
												₹{item.originalPrice.toLocaleString()}
											</span>
										)}
									</div>

									{/* Stock Status */}
									<div className="flex items-center gap-2 mb-3">
										<div
											className={`w-2 h-2 rounded-full ${
												item.inStock ? "bg-green-500" : "bg-red-500"
											}`}
										/>
										<span
											className={`text-sm ${
												item.inStock ? "text-green-600" : "text-red-600"
											}`}
										>
											{item.inStock ? "In Stock" : "Out of Stock"}
										</span>
									</div>
								</div>

								{/* Quantity and Actions */}
								<div className="flex flex-col items-end gap-3">
									{/* Quantity Controls */}
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 bg-transparent"
											onClick={() => handleQuantityChange(quantity - 1)}
											disabled={quantity <= 1 || isUpdating}
										>
											<Minus className="h-3 w-3" />
										</Button>

										<Input
											type="number"
											value={quantity}
											onChange={(e) => {
												const newQty = Number.parseInt(e.target.value) || 1;
												handleQuantityChange(newQty);
											}}
											className="w-16 h-8 text-center"
											min="1"
											disabled={isUpdating}
										/>

										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 bg-transparent"
											onClick={() => handleQuantityChange(quantity + 1)}
											disabled={isUpdating}
										>
											<Plus className="h-3 w-3" />
										</Button>
									</div>

									{/* Item Total */}
									<div className="text-right">
										<p className="text-sm text-gray-600">Total</p>
										<p className="text-lg font-bold">
											₹{(item.price * quantity).toLocaleString()}
										</p>
									</div>

									{/* Action Buttons */}
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 bg-transparent"
										>
											<Heart className="h-3 w-3" />
										</Button>
										<Button
											variant="outline"
											size="icon"
											className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
											onClick={handleRemove}
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
