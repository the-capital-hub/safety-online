"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import ProductCarousel from "@/components/BuyerPanel/home/ProductCarousel.jsx";
import FeaturedProduct from "@/components/BuyerPanel/home/FeaturedProduct.jsx";
import ServiceGuarantees from "@/components/BuyerPanel/home/ServiceGuarantees.jsx";
import { ProductCardVarient } from "@/components/BuyerPanel/home/ProductCardVarient.jsx";
import BannerImg from "@/public/images/home/Banner.png";

export default function FeaturedSection({
	topSellingProducts = [],
	bestSellingProduct = null,
	featuredProducts = [],
}) {
	return (
		<section className="py-8 md:py-16 bg-gray-50">
			{topSellingProducts && topSellingProducts.length > 0 && (
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
						<ProductCarousel products={topSellingProducts} showDots={true} />
					</motion.div>
				</div>
			)}

			<div className="px-10">
				{/* Best Selling Product */}
				{bestSellingProduct && <FeaturedProduct product={bestSellingProduct} />}
			</div>

			<Image
				src={BannerImg}
				alt="Banner"
				className="w-full h-auto mb-12 md:mb-16 object-cover"
			/>

			{featuredProducts && featuredProducts.length > 0 && (
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

						<div className="grid grid-cols-1 lg:grid-cols-3 md:gap-6">
							{/* First Product - vertical */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								className="w-full col-span-1 mb-6 md:mb-0"
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
									>
										<ProductCardVarient
											product={product}
											variant="horizontal"
										/>
									</motion.div>
								))}
							</div>
						</div>
					</motion.div>

					{/* Service Guarantees */}
					<ServiceGuarantees />
				</div>
			)}
		</section>
	);
}
