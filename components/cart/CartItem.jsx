"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store";

export default function CartItem({ item }) {
	const { updateQuantity, removeItem } = useCartStore();

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
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col sm:flex-row gap-6">
					{/* Product Image */}
					<div className="relative w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
						<img
							src={item.image || "/placeholder.svg"}
							alt={item.name}
							className="w-full h-full object-contain p-4"
						/>
					</div>

					{/* Product Details */}
					<div className="flex-1 space-y-4">
						<div>
							<h3 className="text-lg font-semibold">{item.name}</h3>
							<p className="text-gray-600 text-sm line-clamp-2">
								{item.description}
							</p>
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							{/* Quantity Controls */}
							<div className="flex items-center space-x-3">
								<Button
									variant="outline"
									size="icon"
									onClick={() => handleQuantityChange(-1)}
									disabled={item.quantity <= 1}
								>
									<Minus className="h-4 w-4" />
								</Button>
								<span className="font-medium min-w-[2rem] text-center">
									{item.quantity}
								</span>
								<Button
									variant="outline"
									size="icon"
									onClick={() => handleQuantityChange(1)}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>

							{/* Price and Remove */}
							<div className="flex items-center justify-between sm:justify-end space-x-4">
								<div className="text-right">
									<p className="font-semibold text-lg">
										₹ {(item.price * item.quantity).toLocaleString()}
									</p>
									{item.quantity > 1 && (
										<p className="text-sm text-gray-600">
											₹ {item.price.toLocaleString()} each
										</p>
									)}
								</div>
								<Button
									variant="ghost"
									size="icon"
									onClick={handleRemove}
									className="text-red-600 hover:text-red-700 hover:bg-red-50"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
