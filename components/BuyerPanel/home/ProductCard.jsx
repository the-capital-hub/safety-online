"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductCard({ product }) {
	return (
		<Card className="w-full h-full hover:shadow-lg transition-shadow">
			<CardContent className="p-4 md:p-6 relative">
				<div className="flex justify-between items-start mb-4">
					<div>
						<h3 className="font-bold text-base md:text-lg mb-1">
							{product.title}
						</h3>
						{product.subtitle && (
							<p className="text-gray-600 text-sm">{product.subtitle}</p>
						)}
						<p className="font-bold text-lg md:text-xl mt-2">{product.price}</p>
					</div>
					{product.colors && (
						<div className="flex space-x-1">
							{product.colors.map((color, i) => (
								<div
									key={i}
									className={`w-3 h-3 rounded-full ${
										color === "blue"
											? "bg-blue-500"
											: color === "black"
											? "bg-black"
											: color === "red"
											? "bg-red-500"
											: "bg-orange-500"
									}`}
								/>
							))}
						</div>
					)}
				</div>

				{product.description && (
					<p className="text-gray-600 text-sm mb-4 line-clamp-3">
						{product.description}
					</p>
				)}

				<div className="relative mb-4">
					<img
						src={product.image || "/placeholder.svg"}
						alt={product.title}
						className="w-full h-32 md:h-48 object-contain rounded"
					/>
				</div>

				<div className="flex justify-between items-center absolute bottom-4 left-4 right-4">
					<div className="flex space-x-2">
						<Button variant="outline" size="icon" className="rounded-full">
							<ShoppingCart className="h-4 w-4" />
						</Button>
						<Button variant="outline" size="icon" className="rounded-full">
							<Heart className="h-4 w-4" />
						</Button>
					</div>
					<Button className="bg-black text-white text-sm">BUY NOW</Button>
				</div>
			</CardContent>
		</Card>
	);
}
