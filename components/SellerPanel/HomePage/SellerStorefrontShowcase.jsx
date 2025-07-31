"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import {
	avatar,
	Logo,
	Icon,
	Banner,
	Picture1,
	Picture2,
	Picture3,
	Product1,
	Product2,
	Product3,
	Product4,
} from "@/public/images/seller-panel/home/storefront";

import ProductCard from "@/components/SellerPanel/HomePage/ProductCard.jsx";

const products = [
	{
		id: 1,
		title: "Retro reflective Sign",
		price: "₹5,000",
		originalPrice: "₹7,500",
		discount: "33% OFF",
		image: Product1.src,
		rating: 4.5,
		inStock: true,
	},
	{
		id: 2,
		title: "Road Safety",
		price: "₹5,000",
		originalPrice: "₹7,500",
		discount: "33% OFF",
		image: Product2.src,
		rating: 4.8,
		inStock: true,
	},
	{
		id: 3,
		title: "Industrial Safety",
		price: "₹5,000",
		originalPrice: "₹7,500",
		discount: "33% OFF",
		image: Product3.src,
		rating: 4.6,
		inStock: true,
	},
	{
		id: 4,
		title: "Retro reflective Sign",
		price: "₹5,000",
		originalPrice: "₹7,500",
		discount: "33% OFF",
		image: Product4.src,
		rating: 4.7,
		inStock: false,
	},
];

const reviews = [
	{
		id: 1,
		title: "Ethan Williams",
		role: "Digital Marketing Specialist",
		rating: 5,
		comment:
			"Experience a payment app built on simplicity and transparency. No hidden fees, just a seamless experience that makes every transaction a breeze. Pay, buy, goodbye to confusion and hello to straightforward payments.",
		avatar: avatar,
	},
	{
		id: 2,
		title: "Daniel Thompson",
		role: "Product Designer",
		rating: 5,
		comment:
			"Discover a payment app focused on simplicity and transparency. Enjoy a seamless experience with no hidden fees, providing clarity and ease in every transaction. It's designed to put you in control of your payments.",
		avatar: avatar,
	},
	{
		id: 3,
		title: "Daniel Thompson",
		role: "Product Designer",
		rating: 5,
		comment:
			"Discover a payment app focused on simplicity and transparency. Enjoy a seamless experience with no hidden fees, providing clarity and ease in every transaction. It's designed to put you in control of your payments.",
		avatar: avatar,
	},
];

export default function SellerStorefrontShowcase() {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 30, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.6,
			},
		},
	};

	const cardVariants = {
		hidden: { scale: 0.9, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.5,
			},
		},
	};

	return (
		<section className="py-20 bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={containerVariants}
				>
					<motion.div variants={itemVariants} className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Seller Storefront Pages
						</h2>
						<p className="text-xl text-gray-600">
							Each seller gets a dedicated micro-site with
						</p>
					</motion.div>

					<div className="space-y-16">
						{/* Brand Logo & Banner */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-bold text-gray-900 mb-8">
								1. Brand Logo & Banner
							</h3>
							<motion.div
								variants={cardVariants}
								whileHover={{ y: -5 }}
								className="relative bg-gradient-to-r from-blue-100 to-green-100 rounded-3xl p-8 shadow-lg"
							>
								<div className="flex items-center justify-between mb-6">
									<div className="flex items-center gap-4">
										<div className="w-16 h-16 flex items-center justify-center">
											<img src={Logo.src} alt="Logo" />
										</div>
										<div className="absolute top-4 right-4">
											<img
												src={Icon.src}
												alt="Icon"
												className="w-12 h-12 text-blue-500"
											/>
										</div>
									</div>
								</div>

								<div className="flex flex-col md:flex-row items-center justify-between gap-8">
									<div className="md:w-1/2">
										<h1 className="text-4xl font-bold text-gray-900 mb-4">
											FIRE SAFETY - YOUR FIRST LINE OF DEFENSE
										</h1>
										<p className="text-gray-700 leading-relaxed">
											If you're talking about safety at a "gare" (French for
											train station), this could involve surveillance, emergency
											procedures, or traveler safety tips.
										</p>
									</div>
									<div className="md:w-1/2">
										<Image
											src={Banner.src}
											alt="Fire Safety Equipment"
											width={400}
											height={300}
											className="object-cover rounded-2xl ml-auto"
										/>
									</div>
								</div>
							</motion.div>
						</motion.div>

						{/* Description + Certifications */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-bold text-gray-900 mb-8">
								2. Description + Certifications
							</h3>
							<motion.div
								variants={cardVariants}
								className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
							>
								<div className="flex flex-col gap-4">
									<div className="space-y-3  border-b border-gray-200 pb-4">
										<h4 className="text-xl font-bold text-gray-900 mb-4">
											Certifications
										</h4>
										<div className="space-y-3">
											<div className="flex items-center gap-3">
												<span className="text-gray-700">
													Pack of 10 Helmets
												</span>
											</div>
											<p className="text-sm text-gray-600 ml-8">
												This set includes 10 high-quality yellow safety helmets,
												ideal for outfitting multiple team members or ensuring
												you have a ready supply for various projects.
											</p>
										</div>
									</div>
									<div>
										<h4 className="text-xl font-bold text-gray-900 mb-4">
											Product Description
										</h4>
										<p className="text-gray-700 text-sm leading-relaxed">
											The ANTRA Yellow Heavy Duty Safety Helmets are designed to
											offer superior head protection for workers in outdoor and
											industrial environments. Each helmet is carefully crafted
											to meet or exceed standards, ensuring high-quality safety
											for demanding work conditions.
										</p>
									</div>
								</div>
							</motion.div>
						</motion.div>

						{/* Product Listings */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-bold text-gray-900 mb-8">
								3. Product Listings
							</h3>
							<motion.div
								variants={containerVariants}
								className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
							>
								{products.map((product) => (
									<ProductCard key={product.id} product={product} />
								))}
							</motion.div>
						</motion.div>

						{/* Ratings & Reviews */}
						<motion.div variants={itemVariants}>
							<h3 className="text-2xl font-bold text-gray-900 mb-8">
								4. Ratings & Reviews
							</h3>
							<motion.div
								variants={containerVariants}
								className="grid grid-cols-1 md:grid-cols-3 gap-6"
							>
								{reviews.map((review) => (
									<motion.div
										key={review.id}
										variants={cardVariants}
										whileHover={{ y: -5 }}
										className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
									>
										<div className="flex items-center gap-1 mb-4">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													className={`w-4 h-4 ${
														i < review.rating
															? "text-yellow-400 fill-current"
															: "text-gray-300"
													}`}
												/>
											))}
										</div>

										<p className="text-gray-700 text-sm mb-4 leading-relaxed">
											{review.comment}
										</p>

										<div className="flex items-center gap-3">
											<Image
												src={review.avatar || "/placeholder.svg"}
												alt={review.name}
												width={40}
												height={40}
												className="rounded-full"
											/>
											<div>
												<h5 className="font-semibold text-gray-900">
													{review.name}
												</h5>
												<p className="text-sm text-gray-600">{review.role}</p>
											</div>
										</div>
									</motion.div>
								))}
							</motion.div>
						</motion.div>

						{/* Additional Features */}
						<motion.div variants={itemVariants}>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
								{/* Fulfillment Coverage */}
								<motion.div
									variants={cardVariants}
									whileHover={{ scale: 1.05 }}
									className="text-center"
								>
									<h4 className="text-xl font-bold text-gray-900 mb-4">
										5. Fulfillment Pincode Coverage
									</h4>
									<Image
										src={Picture1.src}
										width={400}
										height={400}
										className="w-4/6 mx-auto object-contain rounded-2xl"
										alt="Fulfillment Pincode Coverage"
									/>
								</motion.div>

								{/* Response Time */}
								<motion.div
									variants={cardVariants}
									whileHover={{ scale: 1.05 }}
									className="text-center"
								>
									<h4 className="text-xl font-bold text-gray-900 mb-4">
										6. Response Time Indicator
									</h4>

									<Image
										src={Picture2.src}
										width={500}
										height={500}
										className="w-3/6 mx-auto object-contain rounded-2xl"
										alt="Fulfillment Pincode Coverage"
									/>
								</motion.div>

								{/* WhatsApp Contact */}
								<motion.div
									variants={cardVariants}
									whileHover={{ scale: 1.05 }}
									className="text-center"
								>
									<h4 className="text-xl font-bold text-gray-900 mb-4">
										7. WhatsApp Contact
									</h4>

									<Image
										src={Picture3.src}
										width={500}
										height={500}
										className="w-3/6 mx-auto object-contain rounded-2xl"
										alt="Fulfillment Pincode Coverage"
									/>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
