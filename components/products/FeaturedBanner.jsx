"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore, useProductStore } from "@/lib/store";

export default function FeaturedBanner() {
	const { addItem } = useCartStore();
	const { getFeaturedProduct } = useProductStore();
	const product = getFeaturedProduct();

	const handleAddToCart = () => {
		addItem(product);
	};

	return (
		<motion.section
			className="rounded-xl bg-gradient-to-r from-red-50 to-orange-50 overflow-hidden"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="grid grid-cols-1 lg:grid-cols-2 items-center">
				<div className="p-8 lg:p-12">
					<div className="text-sm font-medium text-red-600 mb-2">
						Best Product
					</div>
					<div className="text-sm text-gray-600 mb-4">
						Top Selling Product in Safety
					</div>
					{/* Product title */}
					<h2 className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
						{product.name || "FIRE SAFETY - YOUR FIRST LINE OF DEFENSE"}
					</h2>
					{/* Product description */}
					<p className="text-gray-600 mb-6 max-w-md">
						{product.description ||
							"If you're talking about safety at a gate (French for trainstation), this could involve fire surveillance, emergency procedures, or traveler safety tips."}
					</p>
					<div className="flex items-center gap-4">
						<Button
							className="bg-black text-white hover:bg-gray-800"
							onClick={handleAddToCart}
						>
							BUY NOW <ArrowRight className="ml-2 h-4 w-4" />
						</Button>
						{/* <div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full h-8 w-8"
							>
								<ChevronLeft className="h-4 w-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full h-8 w-8"
							>
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div> */}
					</div>
				</div>
				{/* Product image */}
				<div className="relative h-64 lg:h-96">
					<Image
						src={product.image}
						alt={product.name}
						width={500}
						height={500}
						className="w-full h-full object-contain p-8"
					/>
				</div>
			</div>
		</motion.section>
	);
}
