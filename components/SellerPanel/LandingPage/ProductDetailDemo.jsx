"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/SellerPanel/LandingPage/ProductCard.jsx";
import {
	ShoppingCart,
	Heart,
	Share2,
	Minus,
	Plus,
	MapPin,
	Truck,
	CreditCard,
	Star,
	User,
} from "lucide-react";
import Image from "next/image";

import {
	ISP1, // green helmet
	ISP2, // Industrial safety kit combo - Orange helmet + Safety glasses + Gloves + Headset / HeadPhone
	ISP3, // yellow helmet
	ISP4, // reflective jacket
	ISP5, // Fire Extinguisher
	PSP1, // mask
	PSP3, // Orange helmet and Reflective jacket
	PSP5, // Quick Heal - First Aid Kit
} from "@/public/images/products";

// Dummy data
const dummyProduct = {
	id: "ISP2",
	name: "Industrial Safety Kit Combo",
	description:
		"Complete safety kit with orange helmet, safety glasses, gloves, and headset.",
	longDescription:
		"This comprehensive industrial safety kit provides complete protection for workers in hazardous environments. The combo includes an orange safety helmet, protective safety glasses, industrial gloves, and noise-cancelling headset. Each component is carefully selected to work together, providing head, eye, hand, and hearing protection. Perfect for construction sites, factories, and industrial facilities where multiple safety hazards exist.",
	price: 4500,
	originalPrice: 5000,
	image: ISP2.src,
	category: "industrial-safety",
	inStock: true,
	featured: true,
	rating: 4.5,
	stocks: 50,
	status: "In Stock",
	discountPercentage: 10,
	features: [
		{
			title: "Complete Protection",
			description:
				"All-in-one safety solution covering head, eyes, hands, and hearing protection.",
		},
		{
			title: "High-Quality Components",
			description:
				"Each item meets individual safety standards while working together as a complete system.",
		},
		{
			title: "Comfortable Design",
			description:
				"Ergonomically designed components ensure comfort during extended use.",
		},
		{
			title: "Cost-Effective",
			description:
				"Bundled pricing offers significant savings compared to purchasing items separately.",
		},
	],
	images: [ISP2.src, ISP3.src, PSP3.src, PSP1.src],
};

const dummyReviews = [
	{
		id: 1,
		name: "KL RAHUL KUMAR KARTHIK",
		rating: 5,
		comment:
			"The Industrial Safety Kit Combo offers superior protection and quality. Each item is carefully crafted to meet ISI standards, ensuring high-quality safety for demanding work conditions.",
	},
	{
		id: 2,
		name: "VAIBHAV SHARMA",
		rating: 5,
		comment:
			"Excellent quality Industrial Safety Kit Combo. The build quality is outstanding and it provides great value for money. Highly recommended for professional use.",
	},
	{
		id: 3,
		name: "ANITA GUPTA",
		rating: 4,
		comment:
			"Good product overall. The Industrial Safety Kit Combo meets expectations and the delivery was prompt. Would purchase again.",
	},
];

const products = [
	{
		id: 1,
		title: "Retro reflective Sign",
		price: "₹2,000",
		originalPrice: "₹3,500",
		discount: "33% OFF",
		image: ISP1.src,
		rating: 4.5,
		inStock: true,
	},
	{
		id: 2,
		title: "Quick Heal - First Aid Kit",
		price: "₹5,000",
		originalPrice: "₹7,500",
		discount: "33% OFF",
		image: PSP5.src,
		rating: 4.8,
		inStock: true,
	},
	{
		id: 3,
		title: "Fire Extinguisher",
		price: "₹3,500",
		originalPrice: "₹7,000",
		discount: "50% OFF",
		image: ISP5.src,
		rating: 4.6,
		inStock: true,
	},
	{
		id: 4,
		title: "Reflective jacket",
		price: "₹5,000",
		originalPrice: "₹7,500",
		discount: "33% OFF",
		image: ISP4.src,
		rating: 4.7,
		inStock: false,
	},
];

export default function ProductDetailDemo() {
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);

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

	const handleQuantityChange = (change) => {
		const newQuantity = quantity + change;
		if (newQuantity >= 1 && newQuantity <= 10) {
			setQuantity(newQuantity);
		}
	};

	const renderStars = (rating) => {
		return Array.from({ length: 5 }, (_, i) => (
			<Star
				key={i}
				className={`w-4 h-4 ${
					i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
				}`}
			/>
		));
	};

	return (
		<div className="min-h-screen bg-gray-200 rounded-xl">
			<div className="container mx-auto px-4 lg:px-10 py-8">
				{/* Product Details */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
					{/* Product Images */}
					<div className="space-y-6">
						<motion.div
							className="relative bg-white rounded-lg overflow-hidden shadow-sm"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="relative w-full h-96 lg:h-[400px]">
								<Image
									src={
										dummyProduct.images[selectedImage] ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
									}
									alt={dummyProduct.name}
									fill
									className="object-contain p-8"
									priority
								/>
							</div>
						</motion.div>

						{/* Image Gallery */}
						<div className="flex space-x-4 justify-center overflow-x-auto">
							{dummyProduct.images.map((image, index) => (
								<button
									key={index}
									onClick={() => setSelectedImage(index)}
									className={`relative w-20 h-20 border-2 rounded-lg overflow-hidden flex-shrink-0 ${
										selectedImage === index
											? "border-black"
											: "border-gray-200 hover:border-gray-400"
									}`}
								>
									<Image
										src={
											image ||
											"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
										}
										alt={`${dummyProduct.name} view ${index + 1}`}
										fill
										className="object-contain p-2"
									/>
								</button>
							))}
						</div>
					</div>

					{/* Product Info */}
					<motion.div
						className="space-y-6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<div>
							<Badge variant="secondary" className="mb-4">
								{dummyProduct.category.replace("-", " ").toUpperCase()}
							</Badge>
							<h1 className="text-3xl lg:text-4xl font-bold mb-4">
								{dummyProduct.name}
							</h1>

							{/* Product rating */}
							<div className="flex items-center mb-2">
								<span className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded-lg">
									{dummyProduct.rating}
									<Star className="w-4 h-4 fill-white text-white" />
								</span>
								<span className="ml-2 text-gray-600 font-semibold">
									({dummyReviews.length} Reviews)
								</span>
							</div>

							{/* Product price */}
							<p className="text-xl lg:text-2xl font-semibold text-black mb-2">
								₹ {dummyProduct.price.toLocaleString()}
							</p>

							{/* Discounted price and discount percentage */}
							<div className="flex items-center mb-4">
								<span className="text-gray-500 line-through mr-2">
									₹ {dummyProduct.originalPrice.toLocaleString()}
								</span>
								<span className="text-green-500">
									{dummyProduct.discountPercentage}% off
								</span>
							</div>
						</div>

						{/* Product Colors */}
						<div className="w-fit flex space-x-2 p-3 bg-gray-200 rounded-lg">
							{[
								"bg-orange-500",
								"bg-yellow-500",
								"bg-red-500",
								"bg-blue-500",
							].map((color, i) => (
								<div
									key={i}
									className={`w-6 h-6 rounded-full border border-gray-200 cursor-pointer ${color}`}
								/>
							))}
						</div>

						{/* Quantity and Add to Cart */}
						<div className="space-y-4">
							<div className="flex items-center space-x-4">
								<span className="font-medium">Quantity:</span>
								<div className="flex items-center border rounded-lg">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleQuantityChange(-1)}
										disabled={quantity <= 1}
									>
										<Minus className="h-4 w-4" />
									</Button>
									<span className="px-4 py-2 font-medium">{quantity}</span>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleQuantityChange(1)}
										disabled={quantity >= 10}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<span className="text-sm text-gray-500">
									({dummyProduct.stocks} available)
								</span>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									className="flex-1 bg-black text-white hover:bg-gray-800"
									size="lg"
								>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
								</Button>
								<Button
									className="flex-1 bg-green-600 text-white hover:bg-green-700"
									size="lg"
								>
									Buy Now
								</Button>
								<Button variant="outline" size="lg">
									<Heart className="h-5 w-5 mr-2" />
									Wishlist
								</Button>
								<Button variant="outline" size="lg">
									<Share2 className="h-5 w-5" />
								</Button>
							</div>
						</div>

						{/* Stock Status */}
						<div className="flex items-center space-x-2">
							<div className="w-3 h-3 rounded-full bg-green-500" />
							<span className="text-green-600">{dummyProduct.status}</span>
						</div>
					</motion.div>
				</div>

				{/* Delivery Details and Offers */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
					{/* Delivery Details Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						<Card className="bg-green-50 border-green-200">
							<CardContent className="p-6">
								<h2 className="text-2xl font-bold mb-6">Delivery Details</h2>

								{/* Location Check */}
								<div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<MapPin className="h-6 w-6 text-gray-600" />
										<span className="text-gray-600">Enter your pincode</span>
									</div>
									<Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6">
										CHECK
									</Button>
								</div>

								<p className="text-gray-700 mb-6">
									Check serviceability at your location
								</p>

								{/* Delivery Options */}
								<div className="space-y-4">
									<div className="flex items-center space-x-4">
										<div className="bg-green-600 p-2 rounded-lg">
											<Truck className="h-6 w-6 text-white" />
										</div>
										<div>
											<h3 className="font-semibold text-green-600 text-lg">
												Free Delivery
											</h3>
											<p className="text-gray-600">
												No shipping charge on this order
											</p>
										</div>
									</div>

									<div className="flex items-center space-x-4">
										<div className="bg-green-600 p-2 rounded-lg">
											<CreditCard className="h-6 w-6 text-white" />
										</div>
										<div>
											<h3 className="font-semibold text-green-600 text-lg">
												COD Available
											</h3>
											<p className="text-gray-600">
												You can pay at the time of delivery
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Offers and Coupons Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<Card className="bg-green-50 border-green-200">
							<CardContent className="p-6">
								<h2 className="text-2xl font-bold mb-6">Offers and Coupons</h2>

								{/* Offers List */}
								<div className="space-y-4 mb-8">
									<div className="flex items-start space-x-3">
										<div className="bg-green-600 p-1 rounded">
											<div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
												<div className="w-2 h-2 bg-green-600 rounded-sm"></div>
											</div>
										</div>
										<div>
											<h3 className="font-semibold text-green-600">
												Save instantly 5% with online payment.
											</h3>
											<p className="text-sm text-gray-600">
												via UPI, EMI, Credit/Debit Card, Net Banking, Wallets.
											</p>
										</div>
									</div>

									<div className="flex items-start space-x-3">
										<div className="bg-green-600 p-1 rounded">
											<div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
												<div className="w-2 h-2 bg-green-600 rounded-sm"></div>
											</div>
										</div>
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<div>
													<h3 className="font-semibold text-green-600">
														Get flat ₹1000 OFF on app
													</h3>
													<p className="text-sm text-gray-600">
														Min cart value ₹2,000
													</p>
												</div>
												<Badge
													variant="outline"
													className="border-green-600 text-green-600 border-dashed"
												>
													SAFETY ₹1000
												</Badge>
											</div>
										</div>
									</div>

									<div className="flex items-start space-x-3">
										<div className="bg-green-600 p-1 rounded">
											<div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
												<div className="w-2 h-2 bg-green-600 rounded-sm"></div>
											</div>
										</div>
										<div>
											<h3 className="font-semibold text-green-600">
												Get GST invoice and save up to 18% on business purchases
											</h3>
										</div>
									</div>
								</div>

								{/* Buy More & Save More */}
								<div>
									<h3 className="text-xl font-bold mb-4">
										Buy More & Save More
									</h3>
									<div className="grid grid-cols-2 gap-4">
										{[
											{ qty: 2, price: 4275, discount: 5, label: "Qty 2" },
											{ qty: 3, price: 4050, discount: 10, label: "Qty 3" },
											{ qty: 5, price: 3825, discount: 15, label: "Qty 5" },
											{ qty: 10, price: 3600, discount: 20, label: "Qty 10" },
										].map((offer, index) => (
											<div
												key={index}
												className="border-2 border-gray-200 bg-white hover:border-green-300 rounded-lg p-4 cursor-pointer transition-colors"
											>
												<div className="text-center">
													<h4 className="font-semibold text-lg">
														{offer.label}
													</h4>
													<p className="text-xl font-bold">
														₹{offer.price.toLocaleString()}{" "}
														<span className="text-sm font-normal">/ pc</span>
													</p>
													<Badge
														variant="secondary"
														className="text-green-600 bg-green-100"
													>
														{offer.discount}% OFF
													</Badge>
												</div>
											</div>
										))}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>

				{/* Product Features */}
				<motion.div
					className="mb-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					<h2 className="text-2xl font-bold mb-8">Product Features</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						{dummyProduct.features.map((feature, index) => (
							<Card key={index} className="bg-white rounded-xl p-6 shadow-sm">
								<h3 className="font-semibold text-lg mb-3">{feature.title}</h3>
								<p className="text-gray-600">{feature.description}</p>
							</Card>
						))}
					</div>
					<Card className="bg-white rounded-xl p-6 shadow-sm">
						<h2 className="text-2xl font-bold mb-4">Product Description</h2>
						<p className="text-gray-600 leading-relaxed">
							{dummyProduct.longDescription}
						</p>
					</Card>
				</motion.div>

				{/* Reviews & Ratings Section */}
				<motion.div
					className="mb-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.6 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold">Reviews & Ratings</h2>
								<Button className="bg-black text-white hover:bg-gray-800">
									WRITE A REVIEW
								</Button>
							</div>

							<p className="text-gray-600 mb-6">
								{dummyProduct.name} - Customer Reviews and Ratings
							</p>

							{/* Rating Summary */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
								<div className="text-center">
									<div className="flex items-center justify-center space-x-2 mb-2">
										<span className="text-4xl font-bold text-green-600">
											{dummyProduct.rating}
										</span>
										<Star className="w-8 h-8 fill-green-600 text-green-600" />
									</div>
									<p className="text-gray-600">
										Average Rating based on {dummyReviews.length} ratings and{" "}
										{dummyReviews.length} reviews
									</p>
								</div>

								<div className="space-y-2">
									{[5, 4, 3, 2, 1].map((stars) => (
										<div key={stars} className="flex items-center space-x-3">
											<span className="w-4 text-sm">{stars}</span>
											<div className="flex-1 bg-gray-200 rounded-full h-2">
												<div
													className="bg-green-600 h-2 rounded-full"
													style={{
														width:
															stars === 5 ? "67%" : stars === 4 ? "33%" : "0%",
													}}
												></div>
											</div>
											<span className="text-sm text-gray-600 w-12">
												{stars === 5 ? "67%" : stars === 4 ? "33%" : "0%"}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Individual Reviews */}
							<div className="space-y-6">
								{dummyReviews.map((review) => (
									<div
										key={review.id}
										className="border-b border-gray-200 pb-6 last:border-b-0"
									>
										<div className="flex items-start space-x-4">
											<div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
												<User className="w-5 h-5 text-gray-600" />
											</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													<h4 className="font-semibold">{review.name}</h4>
												</div>
												<div className="flex items-center space-x-1 mb-3">
													{renderStars(review.rating)}
												</div>
												<p className="text-gray-700 text-sm leading-relaxed">
													{review.comment}
												</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Related Products Section */}
				<motion.div variants={itemVariants}>
					<h3 className="text-2xl font-bold text-gray-900 mb-8">
						Related Products
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
			</div>
		</div>
	);
}
