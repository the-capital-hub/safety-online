"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, ArrowRight, Star, StarHalf } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProductCard({ product, viewMode = "grid" }) {
        const router = useRouter();

        const handleViewProduct = () => {
                router.push(`/products/${product.id || product._id}`);
        };

        const renderStars = (rating, size = "h-4 w-4") => {
                const fullStars = Math.floor(rating || 0);
                const hasHalfStar = (rating || 0) - fullStars >= 0.5;
                const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

                return (
                        <>
                                {Array.from({ length: fullStars }).map((_, i) => (
                                        <Star
                                                key={`full-${i}`}
                                                className={`${size} fill-yellow-400 text-yellow-400`}
                                        />
                                ))}
                                {hasHalfStar && (
                                        <StarHalf
                                                key="half"
                                                className={`${size} fill-yellow-400 text-yellow-400`}
                                        />
                                )}
                                {Array.from({ length: emptyStars }).map((_, i) => (
                                        <Star
                                                key={`empty-${i}`}
                                                className={`${size} text-gray-300`}
                                        />
                                ))}
                        </>
                );
        };

        if (viewMode === "list") {
                return (
                        <Card
                                onClick={handleViewProduct}
                                className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                        >
                                <CardContent className="p-6">
					<div className="flex flex-col sm:flex-row gap-6">
						<div className="relative w-full sm:w-48 h-48 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
							<Image
								src={
									product.images[0] ||
									"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
								}
								alt={product.title}
								fill
								className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
							/>
							{product.discountPercentage > 0 && (
								<Badge className="absolute top-2 left-2 bg-red-500 text-white">
									{product.discountPercentage}% OFF
								</Badge>
							)}
							{product.type === "featured" && (
								<Badge className="absolute top-2 right-2 bg-blue-500 text-white">
									Featured
								</Badge>
							)}
						</div>

						<div className="flex-1 space-y-4">
							<div>
								<h3 className="text-xl font-semibold hover:text-blue-600 transition-colors">
									{product.title}
								</h3>
								<p className="text-gray-600 mt-2 line-clamp-2">
									{product.description}
								</p>
                                                                <div className="flex items-center gap-2 mt-2">
                                                                        <div className="flex items-center">
                                                                                {renderStars(product.rating, "h-4 w-4")}
                                                                        </div>
                                                                        <span className="text-sm text-gray-500">
                                                                                ({product.rating?.toFixed(1) || 0})
                                                                        </span>
                                                                </div>
							</div>

							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<div className="flex items-center gap-2">
										<p className="text-2xl font-bold">
											₹{product.price.toLocaleString()}
										</p>
										{product.originalPrice > product.price && (
											<p className="text-lg text-gray-500 line-through">
												₹{product.originalPrice.toLocaleString()}
											</p>
										)}
									</div>
									<p
										className={`text-sm ${
											product.inStock ? "text-green-600" : "text-red-600"
										}`}
									>
										{product.status}
									</p>
								</div>

								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="icon"
										className="rounded-full bg-transparent"
									>
										<Heart className="h-4 w-4" />
									</Button>
									<Button
										disabled={!product.inStock}
										variant="outline"
										className="rounded-full bg-transparent"
									>
										<ShoppingCart className="h-4 w-4 mr-2" />
										Add to Cart
									</Button>
									<Button
										disabled={!product.inStock}
										className="bg-black text-white hover:bg-gray-800 rounded-full"
									>
										Buy Now
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

        return (
                <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                >
                        <Card
                                onClick={handleViewProduct}
                                className="hover:shadow-xl transition-all duration-300 cursor-pointer group h-full flex flex-col"
                        >
                                <CardContent className="p-0 flex-1 flex flex-col">
					<div className="relative overflow-hidden">
						<div className="relative h-64 bg-gray-50 rounded-t-xl overflow-hidden">
							<Image
								src={
									product.image ||
									"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
								}
								alt={product.title}
								fill
								className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
							/>

							{/* Badges */}
							<div className="absolute top-2 left-2 flex flex-col gap-1">
								{product.discount && (
									<Badge className="bg-red-500 text-white">
										{product.discount}
									</Badge>
								)}
								{product.type === "featured" && (
									<Badge className="bg-blue-500 text-white">Featured</Badge>
								)}
							</div>

							{/* Quick view overlay */}
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
								<Button
									variant="secondary"
									size="icon"
									className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
								>
									<Eye className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>

					<div className="p-6 flex-1 flex flex-col">
						<div className="flex-1">
							<h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
								{product.title}
							</h3>
							<p className="text-gray-600 text-sm mb-3 line-clamp-2">
								{product.description}
							</p>

							{/* Rating */}
                                                        <div className="flex items-center gap-2 mb-3">
                                                                <div className="flex items-center">
                                                                        {renderStars(product.rating, "h-3 w-3")}
                                                                </div>
                                                                <span className="text-xs text-gray-500">
                                                                        ({product.rating?.toFixed(1) || 0})
                                                                </span>
                                                        </div>
						</div>

						{/* Price */}
						<div className="space-y-2 mb-4">
							<div className="flex flex-col items-start gap-2">
								<p className="text-xl font-bold">
									₹{product.price.toLocaleString()}
								</p>
								{product.originalPrice > product.price && (
									<div className="flex items-center gap-2">
										<p className="text-sm text-gray-500 line-through">
											₹{product.originalPrice.toLocaleString()}
										</p>
										<p className="text-sm text-green-600 font-semibold">
											{product.discount}
										</p>
									</div>
								)}
							</div>
							{/* <p
								className={`text-xs ${
									product.inStock ? "text-green-600" : "text-red-600"
								}`}
							>
								{product.inStock ? "In stock" : "Out of stock"}
							</p> */}
						</div>

						{/* Actions */}
						<div className="flex items-center justify-between gap-2">
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="icon"
									className="rounded-full border-gray-300 hover:border-gray-400 bg-transparent"
								>
									<Heart className="h-4 w-4" />
								</Button>
								<Button
									variant="outline"
									size="icon"
									// disabled={!product.inStock}
									className="rounded-full border-gray-300 hover:border-gray-400 bg-transparent"
								>
									<ShoppingCart className="h-4 w-4" />
								</Button>
							</div>

							<Button
								// disabled={!product.inStock}
								className="bg-black text-white hover:bg-gray-800 rounded-full flex-1 max-w-[120px]"
								size="sm"
							>
								Buy Now
								<ArrowRight className="ml-1 h-3 w-3" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
