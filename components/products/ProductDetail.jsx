"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	ArrowLeft,
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
	RotateCcw,
	Home,
	AlertCircle,
	Receipt,
	Lock,
	HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useProductStore } from "@/lib/store";
import ProductCard from "@/components/products/ProductCard.jsx";

export default function ProductDetail({ product }) {
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [selectedQuantityOffer, setSelectedQuantityOffer] = useState(null);
	const router = useRouter();
	const { addItem } = useCartStore();
	const { products } = useProductStore();

	// Get related products
	const relatedProducts =
		product.relatedProducts
			?.map((id) => products.find((p) => p.id === id))
			.filter(Boolean) || [];

	// Mock similar products for comparison
	const similarProducts = [
		{
			id: "similar-1",
			name: "Yellow Heavy Duty",
			price: 5000,
			originalPrice: 7000,
			discount: 25,
			rating: 4.5,
			reviews: 420,
			brand: "LADWA",
			material: "PLASTIC",
			colors: ["blue", "black", "red", "orange"],
			image: "/placeholder.svg",
		},
		{
			id: "similar-2",
			name: "Reflective Jacket",
			price: 5000,
			originalPrice: 7000,
			discount: 25,
			rating: 4.7,
			reviews: 250,
			brand: "LADWA",
			material: "PLASTIC",
			colors: ["blue", "red", "black", "orange"],
			image: "/placeholder.svg",
		},
		{
			id: "similar-3",
			name: "Barrier Ahead Cautionary",
			price: 5000,
			originalPrice: 7000,
			discount: 25,
			rating: 4.2,
			reviews: 300,
			brand: "LADWA",
			material: "PLASTIC",
			colors: ["blue", "red", "black", "orange"],
			image: "/placeholder.svg",
		},
		{
			id: "similar-4",
			name: "Green Heavy Duty",
			price: 5000,
			originalPrice: 7000,
			discount: 25,
			rating: 4.8,
			reviews: 150,
			brand: "LADWA",
			material: "PLASTIC",
			colors: ["blue", "black", "red", "orange"],
			image: "/placeholder.svg",
		},
	];

	// Mock reviews data
	const reviews = [
		{
			id: 1,
			name: "KL RAHUL KUMAR KARTHIK",
			rating: 5,
			comment:
				"The LADWA 10 Pcs Yellow Heavy Duty Safety Helmets are designed to offer superior head protection for workers in outdoor and industrial environments. Each helmet is carefully crafted to meet ISI standards, ensuring high-quality safety for demanding work conditions. Whether you're working in construction.",
		},
		{
			id: 2,
			name: "VAIBHAV SHARMA",
			rating: 5,
			comment:
				"The EcoShield 20 Pcs Biodegradable Trash Bags provide an environmentally friendly solution for waste disposal. Made from plant-based materials, these bags decompose quickly, reducing landfill impact. Ideal for home, office, and outdoor use, they ensure you can manage waste responsibly.",
		},
		{
			id: 3,
			name: "ANITA GUPTA",
			rating: 4,
			comment:
				"The Titan 5-in-1 Multi-Tool offers a versatile solution for various tasks, including cutting, screwing, and opening bottles. Compact and lightweight, this tool is perfect for adventurers and DIY enthusiasts. Its durable design ensures it withstands rigorous use in any situation.",
		},
		{
			id: 4,
			name: "RAJESH MEHTA",
			rating: 4,
			comment:
				"The ComfortWave Ergonomic Office Chair is designed to promote good posture and reduce strain during long hours of sitting. Featuring adjustable height, lumbar support, and breathable fabric, this chair is suitable for home offices and corporate environments, ensuring maximum productivity and comfort.",
		},
	];

	const quantityOffers = [
		{ qty: 2, price: 6000, discount: 25, label: "Qty 2" },
		{ qty: 3, price: 4500, discount: 10, label: "Qty 3" },
		{ qty: 1, price: 8000, discount: 15, label: "Qty 1" },
		{ qty: 5, price: 3500, discount: 20, label: "Qty 5" },
	];

	const handleAddToCart = () => {
		for (let i = 0; i < quantity; i++) {
			addItem(product);
		}
	};

	const handleQuantityChange = (change) => {
		const newQuantity = quantity + change;
		if (newQuantity >= 1) {
			setQuantity(newQuantity);
		}
	};

	const colors = [
		"bg-blue-500",
		"bg-black",
		"bg-red-500",
		"bg-orange-500",
		"bg-gray-500",
	];

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

	const getColorClass = (color) => {
		const colorMap = {
			blue: "bg-blue-500",
			black: "bg-black",
			red: "bg-red-500",
			orange: "bg-orange-500",
		};
		return colorMap[color] || "bg-gray-500";
	};

	return (
		<div className="min-h-screen bg-gray-50">
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
							<div className="absolute top-4 left-4">
								<Link
									href="/products"
									className="inline-flex items-center bg-black text-white py-2 px-4 rounded-full"
								>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back
								</Link>
							</div>

							<div className="relative w-[400px] mx-auto h-96 lg:h-[400px] ">
								<img
									src={
										product.gallery?.[selectedImage] ||
										product.image ||
										"/placeholder.svg" ||
										"/placeholder.svg"
									}
									alt={product.name}
									className="w-full h-full object-contain p-8"
								/>
							</div>
						</motion.div>

						{/* Image Gallery */}
						{product.gallery && product.gallery.length > 1 && (
							<div className="flex space-x-4 justify-center">
								{product.gallery.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`relative w-20 h-20 border-2 rounded-lg overflow-hidden ${
											selectedImage === index
												? "border-black"
												: "border-gray-200"
										}`}
									>
										<img
											src={image || "/placeholder.svg"}
											alt={`${product.name} view ${index + 1}`}
											className="w-full h-full object-contain p-2"
										/>
									</button>
								))}
							</div>
						)}
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
								{product.category?.replace("-", " ").toUpperCase()}
							</Badge>
							<h1 className="text-3xl lg:text-4xl font-bold mb-4">
								{product.name}
							</h1>

							{/* Product rating */}
							{/* <div className="flex items-center mb-2">
								{renderStars(product.rating || 4)}
								<span className="ml-2 text-gray-600">
									({product.rating || 4} out of 5)
								</span>
							</div> */}
							<div className="flex items-center mb-2">
								<span className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded-lg">
									{product.rating || 4.5}
									<Star className="w-4 h-4 fill-white text-white" />
								</span>
								<span className="ml-2 text-gray-600 font-semibold">
									(400 Reviews)
								</span>
							</div>

							{/* Product price */}
							<p className="text-xl lg:text-2xl font-semibold text-black mb-2">
								₹ {product.price.toLocaleString()}
							</p>

							{/* discounted price and discount percentage */}
							<div className="flex items-center mb-4">
								<span className="text-gray-500 line-through mr-2">₹ 5000</span>
								<span className="text-green-500">
									{product.discountPercentage || 25}% off
								</span>
							</div>
						</div>

						{/* Product Colors */}
						<div className="w-fit flex space-x-2 p-3 bg-gray-200 rounded-lg">
							{Array.from({ length: 5 }).map((_, i) => (
								<div
									key={i}
									className={`w-6 h-6 rounded-full border border-gray-200 cursor-pointer ${
										colors[i] || "bg-gray-500"
									}`}
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
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									onClick={handleAddToCart}
									className="flex-1 bg-black text-white hover:bg-gray-800"
									size="lg"
								>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
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
							<div
								className={`w-3 h-3 rounded-full ${
									product.inStock ? "bg-green-500" : "bg-red-500"
								}`}
							/>
							<span
								className={product.inStock ? "text-green-600" : "text-red-600"}
							>
								{product.inStock ? "In Stock" : "Out of Stock"}
							</span>
						</div>
					</motion.div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
					{/* Delivery Details Section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex-1"
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
						className="flex-1"
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
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{quantityOffers.map((offer, index) => (
											<div
												key={index}
												className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
													selectedQuantityOffer === index
														? "border-green-600 bg-green-50"
														: "border-gray-200 bg-white hover:border-green-300"
												}`}
												onClick={() => setSelectedQuantityOffer(index)}
											>
												<div className="text-center">
													<h4 className="font-semibold text-lg">
														{offer.label}
													</h4>
													<p className="text-xl font-bold">
														₹{offer.price}{" "}
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
				{product.features && (
					<motion.div
						className="mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.8 }}
					>
						<h2 className="text-2xl font-bold mb-8">Product Features</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
							{product.features.map((feature, index) => (
								<Card key={index} className="bg-white rounded-xl p-6 shadow-sm">
									<h3 className="font-semibold text-lg mb-3">
										{feature.title}
									</h3>
									<p className="text-gray-600">{feature.description}</p>
								</Card>
							))}
						</div>
						<Card className="bg-white rounded-xl p-6 shadow-sm">
							<h2 className="text-2xl font-bold mb-4">Product Description</h2>
							<p className="text-gray-600">{product.longDescription}</p>
						</Card>
					</motion.div>
				)}

				{/* Reviews & Ratings Section */}
				<motion.div
					className="mb-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
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
								Ladwa Helmet Waterproof Outdoor Light for Garage, Parking,
								Garden & Playground
							</p>

							{/* Rating Summary */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
								<div className="text-center">
									<div className="flex items-center justify-center space-x-2 mb-2">
										<span className="text-4xl font-bold text-green-600">
											4.6
										</span>
										<Star className="w-8 h-8 fill-green-600 text-green-600" />
									</div>
									<p className="text-gray-600">
										Average Rating based on 29 ratings and 29 reviews
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
															stars === 5 ? "58%" : stars === 4 ? "41%" : "0%",
													}}
												></div>
											</div>
											<span className="text-sm text-gray-600 w-12">
												{stars === 5 ? "58%" : stars === 4 ? "41%" : "0%"}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Individual Reviews */}
							<div className="space-y-6">
								{reviews.map((review) => (
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

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.9 }}
						className="mb-10"
					>
						<h2 className="text-2xl font-bold mb-8">Related Products</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{relatedProducts.map((relatedProduct) => (
								<ProductCard key={relatedProduct.id} product={relatedProduct} />
							))}
						</div>
					</motion.div>
				)}

				{/* Similar Products To Compare */}
				<motion.div
					className="mb-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.6 }}
				>
					<Card>
						<CardContent className="p-6">
							<h2 className="text-2xl font-bold mb-6">
								Similar Products To Compare
							</h2>

							{/* Products Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
								{similarProducts.map((product) => (
									<div key={product.id} className="text-center">
										<div className="bg-gray-100 rounded-lg p-4 mb-4 h-40 flex items-center justify-center">
											<img
												src={product.image || "/placeholder.svg"}
												alt={product.name}
												className="w-full h-full object-contain"
											/>
										</div>
										<h3 className="font-semibold mb-2">{product.name}</h3>
										<p className="text-sm text-gray-600 mb-3">
											Road safety refers to the measures and practices used to
											prevent road accidents and protect the lives of all road
											users.
										</p>
										<div className="space-y-2">
											<div className="flex items-center justify-center space-x-2">
												<span className="text-xl font-bold">
													₹ {product.price.toLocaleString()}
												</span>
											</div>
											<div className="flex items-center justify-center space-x-2 text-sm">
												<span className="text-gray-500 line-through">
													₹ {product.originalPrice.toLocaleString()}
												</span>
												<span className="text-green-600">
													{product.discount}% OFF
												</span>
											</div>
											<div className="flex items-center justify-center space-x-2">
												<Button variant="outline" size="icon">
													<Heart className="h-4 w-4" />
												</Button>
												<Button variant="outline" size="icon">
													<ShoppingCart className="h-4 w-4" />
												</Button>
											</div>
											<Button className="w-full bg-black text-white hover:bg-gray-800 text-sm">
												BUY NOW →
											</Button>
										</div>
									</div>
								))}
							</div>

							{/* Comparison Table */}
							<div className="overflow-x-auto">
								<table className="w-full border-collapse">
									<tbody>
										<tr className="border-b">
											<td className="py-3 px-4 font-semibold">Rating</td>
											{similarProducts.map((product) => (
												<td key={product.id} className="py-3 px-4 text-center">
													<div className="flex items-center justify-center space-x-1">
														<span className="bg-green-600 text-white px-2 py-1 rounded text-sm font-semibold">
															{product.rating}
														</span>
														<Star className="w-4 h-4 fill-green-600 text-green-600" />
														<span className="text-sm text-gray-600">
															({product.reviews} REVIEWS)
														</span>
													</div>
												</td>
											))}
										</tr>
										<tr className="border-b">
											<td className="py-3 px-4 font-semibold">Brand</td>
											{similarProducts.map((product) => (
												<td key={product.id} className="py-3 px-4 text-center">
													{product.brand}
												</td>
											))}
										</tr>
										<tr className="border-b">
											<td className="py-3 px-4 font-semibold">Body material</td>
											{similarProducts.map((product) => (
												<td key={product.id} className="py-3 px-4 text-center">
													{product.material}
												</td>
											))}
										</tr>
										<tr>
											<td className="py-3 px-4 font-semibold">Color</td>
											{similarProducts.map((product) => (
												<td key={product.id} className="py-3 px-4">
													<div className="flex justify-center space-x-1">
														{product.colors.map((color, index) => (
															<div
																key={index}
																className={`w-4 h-4 rounded-full border border-gray-300 ${getColorClass(
																	color
																)}`}
															></div>
														))}
													</div>
												</td>
											))}
										</tr>
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Benefits and Warranty Section */}
				<motion.div
					className="mb-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.7 }}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Ladwa Benefits */}
						<Card>
							<CardContent className="p-6">
								<h2 className="text-xl font-bold mb-6">Ladwa Benefits</h2>
								<div className="space-y-4">
									<div className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg">
										<Receipt className="h-5 w-5 text-green-600" />
										<span className="font-medium">GST Invoice Available</span>
									</div>
									<div className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg">
										<Lock className="h-5 w-5 text-green-600" />
										<span className="font-medium">Secure Payments</span>
									</div>
									<div className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg">
										<HelpCircle className="h-5 w-5 text-green-600" />
										<span className="font-medium">365 Days Help Desk</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Return & Warranty Policy */}
						<Card>
							<CardContent className="p-6">
								<h2 className="text-xl font-bold mb-6">
									Return & Warranty Policy
								</h2>
								<div className="space-y-4">
									<div className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg">
										<RotateCcw className="h-5 w-5 text-green-600" />
										<span className="font-medium">
											Upto 7 Days Return Policy
										</span>
									</div>
									<div className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg">
										<Home className="h-5 w-5 text-green-600" />
										<span className="font-medium">Damage Products</span>
									</div>
									<div className="flex items-center space-x-3 p-3 border border-green-200 rounded-lg">
										<AlertCircle className="h-5 w-5 text-green-600" />
										<span className="font-medium">Wrong Product</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
