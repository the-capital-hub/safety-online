"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye, ArrowRight } from "lucide-react";
import { Product12 } from "@/public/images/home";

export default function FeaturedProduct() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			className="mb-12 md:mb-16"
		>
			<h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
				Best Selling Products
			</h2>
			<Card className="bg-white">
				<CardContent className="p-6 md:p-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-center">
						<div className="relative order-2 lg:order-1">
							<Badge className="absolute top-4 left-4 bg-black text-white z-10">
								50% OFF
							</Badge>
							<Image
								src={Product12.src}
								alt="LADWA Traffic Cones"
								width={400}
								height={400}
								className="w-full h-auto rounded max-h-[400px] object-contain"
							/>
						</div>
						<div className="order-1 lg:order-2">
							<h3 className="text-xl md:text-2xl lg:text-4xl font-bold mb-4">
								LADWA 4 Pcs 750mm Impact Resistant Road Traffic Safety Cones
								with Reflective Strips Collar
							</h3>

							<p className="text-gray-600 mb-6 text-sm md:text-base lg:text-lg">
								This LADWA 4 Pcs 750mm Impact Resistant Road Traffic Safety
								Cones with Reflective Strips Collar are durable and highly
								visible traffic management tools designed to enhance safety in
								various environments.
							</p>

							<p className="text-2xl md:text-3xl font-bold mb-1">₹ 5,000</p>

							<div className="flex items-center mb-6">
								<span className="text-gray-500 line-through mr-2">₹ 8000</span>
								<span className="text-green-500">25% off</span>
							</div>

							<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
								<Button className="bg-black text-white px-4 py-2 md:py-3 rounded-full w-full md:w-fit">
									BUY NOW
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
								<Button className="bg-black text-white px-4 py-2 md:py-3 rounded-full w-full md:w-fit">
									Add to Cart
									<ShoppingCart className="ml-2 h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
