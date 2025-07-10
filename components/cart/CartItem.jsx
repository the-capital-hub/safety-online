"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function CartItem({ item }) {
	const { updateQuantity, removeItem } = useCartStore();

	// Mock size and color data (in real app, this would come from the item)
	const itemSize = item.size || "Large";
	const itemColor =
		item.color || ["Blue", "Yellow", "Red"][Math.floor(Math.random() * 3)];

	const handleQuantityChange = (change) => {
		const newQuantity = item.quantity + change;
		if (newQuantity > 0) {
			updateQuantity(item.id, newQuantity);
		}
	};

	const handleRemove = () => {
		removeItem(item.id);
	};

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardContent className="p-6">
				<div className="flex gap-4">
					{/* Product Image */}
					<div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
						<img
							src={item.image || "/placeholder.svg"}
							alt={item.name}
							className="w-full h-full object-contain p-2"
						/>
					</div>

					{/* Product Details */}
					<div className="flex-1 min-w-0">
						<div className="flex justify-between items-start mb-2">
							<div className="flex-1 min-w-0">
								<h3 className="font-semibold text-lg truncate">{item.name}</h3>
								<div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
									<span>Size: {itemSize}</span>
									<span>Color: {itemColor}</span>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleRemove}
								className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>

						<div className="flex items-center justify-between">
							<div className="text-xl font-bold">
								₹{item.price.toLocaleString()}
							</div>

							{/* Quantity Controls */}
							<div className="flex items-center bg-gray-100 rounded-lg">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleQuantityChange(-1)}
									disabled={item.quantity <= 1}
									className="h-8 w-8 hover:bg-gray-200"
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="font-medium px-3 py-1 min-w-[2rem] text-center">
									{item.quantity}
								</span>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => handleQuantityChange(1)}
									className="h-8 w-8 hover:bg-gray-200"
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
