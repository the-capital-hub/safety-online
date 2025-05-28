"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";

export default function ProductCard1({ product }) {
	return (
		<Card className="w-full h-full max-h-[calc(0.8*(100vh-136px))] hover:shadow-lg transition-shadow aspect-w-16 aspect-h-9">
			<CardContent className="h-full relative p-0 flex flex-col">
				<div className="flex justify-between items-start p-4 md:p-6">
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

				<div className="relative flex-grow aspect-w-16 aspect-h-9">
					<img
						src={product.image || "/placeholder.svg"}
						alt={product.title}
						className="absolute inset-0 w-full h-full object-fill rounded-lg"
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

// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { ShoppingCart, Heart } from "lucide-react";

// export default function ProductCard1({ product }) {
// 	return (
// 		<Card className="w-full h-full hover:shadow-lg transition-shadow duration-300">
// 			<CardContent className="h-full relative p-0 flex flex-col">
// 				{/* Product Info Header */}
// 				<div className="flex justify-between items-start p-4 md:p-6 flex-shrink-0">
// 					<div className="flex-1">
// 						<h3 className="font-bold text-sm sm:text-base lg:text-lg mb-1 line-clamp-2">
// 							{product.title}
// 						</h3>
// 						{product.subtitle && (
// 							<p className="text-gray-600 text-xs sm:text-sm line-clamp-1">
// 								{product.subtitle}
// 							</p>
// 						)}
// 						<p className="font-bold text-base sm:text-lg lg:text-xl mt-2">
// 							{product.price}
// 						</p>
// 					</div>
// 					{product.colors && (
// 						<div className="flex space-x-1 flex-shrink-0 ml-2">
// 							{product.colors.map((color, i) => (
// 								<div
// 									key={i}
// 									className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
// 										color === "blue"
// 											? "bg-blue-500"
// 											: color === "black"
// 											? "bg-black"
// 											: color === "red"
// 											? "bg-red-500"
// 											: "bg-orange-500"
// 									}`}
// 								/>
// 							))}
// 						</div>
// 					)}
// 				</div>

// 				{/* Product Description */}
// 				{product.description && (
// 					<div className="px-4 md:px-6 pb-2 flex-shrink-0">
// 						<p className="text-gray-600 text-xs sm:text-sm line-clamp-2">
// 							{product.description}
// 						</p>
// 					</div>
// 				)}

// 				{/* Product Image - Takes remaining space */}
// 				<div className="relative flex-1 px-4 md:px-6 pb-16 md:pb-20">
// 					<div className="w-fit h-fit overflow-hidden relative">
// 						<img
// 							src={product.image || "/placeholder.svg"}
// 							alt={product.title}
// 							className="w-fit h-fit object-fill rounded-lg"
// 						/>
// 					</div>
// 				</div>

// 				{/* Action Buttons - Fixed at bottom */}
// 				<div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-white/80 backdrop-blur-sm rounded-lg p-2">
// 					<div className="flex space-x-2">
// 						<Button
// 							variant="outline"
// 							size="icon"
// 							className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
// 						>
// 							<ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
// 						</Button>
// 						<Button
// 							variant="outline"
// 							size="icon"
// 							className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
// 						>
// 							<Heart className="h-3 w-3 sm:h-4 sm:w-4" />
// 						</Button>
// 					</div>
// 					<Button className="bg-black text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-800 transition-colors">
// 						BUY NOW
// 					</Button>
// 				</div>
// 			</CardContent>
// 		</Card>
// 	);
// }
