"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart, ArrowRight } from "lucide-react";

function ProductCardVarient({ product, variant = "vertical" }) {
	if (variant === "horizontal") {
		return (
			<Card className="w-full hover:shadow-lg transition-shadow duration-300 overflow-hidden">
				<CardContent className="p-0 flex justify-between h-full">
					{/* Left side - Product Info */}
					<div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
						<div>
							<div className="flex justify-between items-start">
								<div className="flex-1">
									<h3 className="font-bold text-lg md:text-xl mb-2 line-clamp-2">
										{product.name || product.title}
									</h3>
									{product.subtitle && (
										<p className="text-gray-600 text-sm mb-2">
											{product.subtitle}
										</p>
									)}
									<p className="text-gray-600 text-sm mb-4 line-clamp-3">
										{product.description}
									</p>
								</div>
							</div>

							<div className="flex flex-col mb-4">
								<p className="flex font-bold text-xl md:text-2xl mb-2">
									{product.price}
								</p>
								{product.originalPrice && (
									<p className="text-gray-500 line-through text-sm">
										{product.originalPrice}
										<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">
											25% OFF
										</span>
									</p>
								)}
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

						{/* Action Buttons */}
						<div className="flex justify-between items-center">
							<div className="flex space-x-2">
								<Button variant="outline" size="icon" className="rounded-full">
									<ShoppingCart className="h-4 w-4" />
								</Button>
								<Button variant="outline" size="icon" className="rounded-full">
									<Heart className="h-4 w-4" />
								</Button>
							</div>
							<Button className="bg-black text-white hover:bg-gray-800 transition-colors rounded-full">
								BUY NOW
								<ArrowRight className="h-4 w-4" />
							</Button>
						</div>
					</div>

					{/* Right side - Product Image */}
					<div className="flex-1 w-full h-[300px] overflow-hidden">
						<Image
							src={product.image || "/placeholder.svg"}
							alt={product.name || product.title}
							width={300}
							height={300}
							className="w-full h-[300px] object-contain"
						/>
					</div>
				</CardContent>
			</Card>
		);
	}

	// Default vertical variant
	return (
		<Card className="w-full h-full hover:shadow-lg transition-shadow duration-300">
			<CardContent className="h-full relative p-0 flex flex-col">
				{/* Product Info Header */}
				<div className="flex justify-between items-start p-4 md:p-6 flex-shrink-0">
					<div className="flex-1">
						<h3 className="font-bold text-base md:text-lg mb-1 line-clamp-2">
							{product.name || product.title}
						</h3>
						{product.subtitle && (
							<p className="text-gray-600 text-sm line-clamp-1">
								{product.subtitle}
							</p>
						)}
						<div className="flex items-center mt-2">
							<p className="font-bold text-lg md:text-xl">{product.price}</p>
							{product.originalPrice && (
								<>
									<p className="text-gray-500 line-through ml-2 text-sm">
										{product.originalPrice}
									</p>
									<span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">
										25% OFF
									</span>
								</>
							)}
						</div>
					</div>
					{product.colors && (
						<div className="flex space-x-1 flex-shrink-0 ml-2">
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

				{/* Product Description */}
				{product.description && (
					<div className="px-4 md:px-6 pb-2 flex-shrink-0">
						<p className="text-gray-600 text-sm line-clamp-2">
							{product.description}
						</p>
					</div>
				)}

				{/* Product Image - Takes remaining space */}
				<div className="relative flex-1 px-4 md:px-6 pb-16 md:pb-20">
					<div className="w-full h-full overflow-hidden relative">
						<img
							src={product.image || "/placeholder.svg"}
							alt={product.name || product.title}
							className="w-full h-full object-cover rounded-lg"
						/>
					</div>
				</div>

				{/* Action Buttons - Fixed at bottom */}
				<div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/90 backdrop-blur-sm rounded-lg p-2">
					<div className="flex space-x-2">
						<Button
							variant="outline"
							size="icon"
							className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
						>
							<ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
						>
							<Heart className="h-3 w-3 sm:h-4 sm:w-4" />
						</Button>
					</div>
					<Button className="bg-black text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-800 transition-colors rounded-full">
						BUY NOW
						<ArrowRight className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export { ProductCardVarient };
