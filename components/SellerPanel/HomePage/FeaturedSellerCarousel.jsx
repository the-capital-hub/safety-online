"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Star, Shield, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import avatar1 from "@/public/images/avatar/avatar1.png";
import avatar2 from "@/public/images/avatar/avatar2.png";
import avatar3 from "@/public/images/avatar/avatar3.png";
import product1 from "@/public/images/seller-panel/home/product-categories/Image1.png";
import product2 from "@/public/images/seller-panel/home/product-categories/Image2.png";
import product3 from "@/public/images/seller-panel/home/product-categories/Image3.png";

const sellers = [
	{
		id: 1,
		name: "Rahul Kumar",
		avatar: avatar1,
		logo: "🏢",
		location:
			"Explore the vibrant city of Maplewood, located at 12345 Elm Street, in the scenic Blue Ridge area.",
		rating: 4.5,
		reviews: "4.5 Rating",
		verified: true,
		featuredProduct: {
			name: "Yellow Color Heavy Duty Helmet",
			image: product1,
			seller: "Cameron Williamson",
			price: "₹299",
			views: "1,368",
		},
	},
	{
		id: 2,
		name: "Priya Sharma",
		avatar: avatar2,
		logo: "🔥",
		location:
			"Located in the heart of Mumbai, Maharashtra, serving industrial clients nationwide.",
		rating: 4.8,
		reviews: "4.8 Rating",
		verified: true,
		featuredProduct: {
			name: "Fire Safety Equipment Kit",
			image: product2,
			seller: "Priya Sharma",
			price: "₹1,299",
			views: "2,156",
		},
	},
	{
		id: 3,
		name: "Amit Patel",
		avatar: avatar3,
		logo: "🦺",
		location:
			"Based in Ahmedabad, Gujarat, specializing in reflective safety gear and PPE equipment.",
		rating: 4.9,
		reviews: "4.9 Rating",
		verified: true,
		featuredProduct: {
			name: "High Visibility Safety Jacket",
			image: product3,
			seller: "Amit Patel",
			price: "₹599",
			views: "987",
		},
	},
];

export default function FeaturedSellerCarousel() {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: true,
		align: "center",
		skipSnaps: false,
	});
	const [selectedIndex, setSelectedIndex] = useState(0);

	const scrollNext = useCallback(() => {
		if (emblaApi) emblaApi.scrollNext();
	}, [emblaApi]);

	const onSelect = useCallback((emblaApi) => {
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, []);

	useEffect(() => {
		if (!emblaApi) return;

		onSelect(emblaApi);
		emblaApi.on("select", onSelect);

		// Auto-scroll functionality
		const autoScroll = setInterval(() => {
			scrollNext();
		}, 4000); // Change slide every 4 seconds

		return () => {
			clearInterval(autoScroll);
			emblaApi.off("select", onSelect);
		};
	}, [emblaApi, onSelect, scrollNext]);

	const containerVariants = {
		hidden: { opacity: 0, y: 50 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.1,
			},
		},
	};

	const cardVariants = {
		hidden: { opacity: 0, scale: 0.9 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.5,
			},
		},
	};

	return (
		<section className="py-10 bg-gray-50">
			<div className="px-10">
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={containerVariants}
				>
					<motion.div variants={cardVariants} className="text-center">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Featured Seller Carousel
						</h2>
						<p className="text-xl text-gray-600">Live feed with</p>
					</motion.div>

					<motion.div variants={cardVariants} className="relative">
						<div className="overflow-hidden" ref={emblaRef}>
							<div className="flex">
								{sellers.map((seller) => (
									<div key={seller.id} className="flex-[0_0_100%] min-w-0 px-4">
										<motion.div
											whileHover={{ y: -10 }}
											className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto my-4"
										>
											<div className="flex flex-col md:flex-row">
												{/* Left Side - Seller Profile Picture */}
												<div className="md:w-1/2 p-8 flex flex-col justify-center">
													<div className="flex flex-col items-center text-center">
														<Image
															src={seller.avatar || "/placeholder.svg"}
															alt={seller.name}
															width={200}
															height={200}
															className="w-full h-full rounded-2xl object-cover"
														/>
													</div>
												</div>

												{/* Right Side - Seller Info and Product */}
												<div className="md:w-1/2 p-8 bg-white">
													{/* Seller Info */}
													<div className="mb-3">
														<h3 className="text-lg font-semibold text-gray-900 mb-2">
															Seller Name: {seller.name}
														</h3>
														<div className="flex items-center gap-2 mb-4">
															<span className="text-lg font-semibold text-gray-900">
																Logo:
															</span>
															<span className="text-2xl">{seller.logo}</span>
														</div>
														<div className="mb-6">
															<h4 className="font-semibold text-gray-900 mb-2">
																Location
															</h4>
															<p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg">
																{seller.location}
															</p>
														</div>
													</div>

													{/* Product Preview Section */}
													<div className="border-t pt-3">
														<div className="flex items-center justify-between mb-1">
															<h4 className="font-semibold text-gray-900">
																Preview
															</h4>
															<MoreHorizontal className="w-5 h-5 text-gray-400" />
														</div>

														<div className="flex items-center gap-2 mb-2">
															<div className="flex">
																{[...Array(5)].map((_, i) => (
																	<Star
																		key={i}
																		className={`w-4 h-4 ${
																			i < Math.floor(seller.rating)
																				? "text-yellow-400 fill-current"
																				: i < seller.rating
																				? "text-yellow-400 fill-current"
																				: "text-gray-300"
																		}`}
																	/>
																))}
															</div>
															<span className="text-sm text-gray-600">
																{seller.reviews}
															</span>
															<span className="text-sm text-gray-500">
																({seller.featuredProduct.views})
															</span>
														</div>

														{/* Product Card */}
														<div className="bg-gray-50 rounded-xl p-4">
															<div className="flex flex-col items-center gap-4">
																<div className="relative">
																	<Image
																		src={
																			seller.featuredProduct.image ||
																			"/placeholder.svg"
																		}
																		alt={seller.featuredProduct.name}
																		width={100}
																		height={100}
																		className="rounded-lg object-cover"
																	/>
																	<div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
																		<Shield className="w-3 h-3 text-white" />
																	</div>
																</div>
																<div className="w-full flex-1">
																	<div className="w-full flex justify-between">
																		<h5 className="font-semibold text-gray-900 mb-2">
																			{seller.featuredProduct.name}
																		</h5>
																		<div className="flex items-center justify-between">
																			<span className="text-lg font-bold text-green-600">
																				{seller.featuredProduct.price}
																			</span>
																		</div>
																	</div>
																	<div className="flex items-center gap-2">
																		<img
																			src={seller.avatar.src}
																			className="w-8 h-8 rounded-full"
																		/>
																		<span className="text-sm text-gray-600">
																			by {seller.featuredProduct.seller}
																		</span>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</motion.div>
									</div>
								))}
							</div>
						</div>
					</motion.div>

					{/* View Store Button */}
					<div className="p-6 flex justify-center">
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							className="bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold hover:bg-yellow-600 transition-colors duration-300"
						>
							View Store
						</motion.button>
					</div>
				</motion.div>
			</div>
		</section>
	);
}
