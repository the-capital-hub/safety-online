"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ProductCarousel from "@/components/BuyerPanel/home/ProductCarousel.jsx";
import FeaturedProduct from "@/components/BuyerPanel/home/FeaturedProduct.jsx";
import ServiceGuarantees from "@/components/BuyerPanel/home/ServiceGuarantees.jsx";
import { ProductCardVarient } from "@/components/BuyerPanel/home/ProductCardVarient.jsx";
import BannerImg from "@/public/images/home/Banner.png";
import {
	Product10,
	Product11,
	Product13,
	Product14,
	Product15,
	Product3,
} from "@/public/images/home/index.js";

export default function FeaturedSection() {
	const topProducts = [
		{
			id: 1,
			name: "Retro reflective Sign",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product11.src,
		},
		{
			id: 2,
			name: "Road Safety",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product10.src,
		},
		{
			id: 3,
			name: "Industrial Safety",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product3.src,
		},
	];

	const featuredProducts = [
		{
			id: 1,
			name: "SAFETY AND EFFICIENCY",
			description:
				"Often used for childproofing homes or securing pets, safety gates block off staircases or rooms to prevent accidents.",
			price: "₹ 5,000",
			originalPrice: "₹ 7,000",
			image: Product14.src,
			colors: ["blue", "black", "red", "orange"],
		},
		{
			id: 2,
			name: "SAFETY AND EFFICIENCY",
			description:
				"If you're talking about safety at a 'gate' safety gates block off staircases or rooms to prevent accidents.",
			price: "₹ 5,000",
			originalPrice: "₹ 7,000",
			image: Product13.src,
			colors: ["blue", "black", "red"],
		},
		{
			id: 3,
			name: "Convex Mirror",
			description:
				"If you're talking about safety at a 'gate' safety gates block off staircases or rooms to prevent accidents.",
			price: "₹ 5,000",
			originalPrice: "₹ 7,000",
			image: Product15.src,
			colors: ["blue", "black", "red"],
		},
	];

	return (
		<section className="py-8 md:py-16 bg-gray-50">
			<div className="px-10">
				{/* Top Selling Products */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12 md:mb-16"
				>
					<h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
						Top Selling Products
					</h2>
					<ProductCarousel products={topProducts} showDots={true} />
				</motion.div>
			</div>

			<div className="px-10">
				{/* Best Selling Product */}
				<FeaturedProduct />
			</div>

			<Image
				src={BannerImg}
				alt="Banner"
				className="w-full h-auto mb-12 md:mb-16 object-cover"
			/>

			<div className="px-10">
				{/* Featured Products Grid */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-12 md:mb-16"
				>
					<h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
						Featured Products
					</h2>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* First Product - vertical */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							className="w-full col-span-1"
						>
							<ProductCardVarient
								product={featuredProducts[0]}
								variant="vertical"
							/>
						</motion.div>

						{/* Remaining Products - Horizontal */}
						<div className="col-span-2 flex flex-col gap-6">
							{featuredProducts.slice(1).map((product, index) => (
								<motion.div
									key={product.id}
									initial={{ opacity: 0, y: 30 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: index * 0.1 }}
									// className="h-[400px] md:h-[450px]"
								>
									<ProductCardVarient product={product} variant="horizontal" />
								</motion.div>
							))}
						</div>
					</div>
				</motion.div>

				{/* Service Guarantees */}
				<ServiceGuarantees />
			</div>
		</section>
	);
}
