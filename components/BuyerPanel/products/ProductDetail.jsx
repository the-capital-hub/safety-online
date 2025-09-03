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
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/BuyerPanel/products/ProductCard.jsx";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function ProductDetail({ product, relatedProducts = [] }) {
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const router = useRouter();
	const { addItem, isLoading } = useCartStore();

	// console.log("Product details:", product);

	const handleAddToCart = async (e) => {
		e.stopPropagation();

		// Use the unified addItem function
		await addItem({
			id: product.id || product._id,
			name: product.title,
			description: product.description,
			price: product.salePrice || product.price,
			originalPrice: product.price,
			image: product.images?.[0] || product.image,
			inStock: product.inStock,
		});
	};

	const handleBuyNow = async (e) => {
		e.stopPropagation();

		// Redirect to checkout with buy now parameters
		router.push(
			`/checkout?buyNow=true&id=${product.id || product._id}&qty=${quantity}`
		);
	};

	const handleQuantityChange = (change) => {
		const newQuantity = quantity + change;
		if (newQuantity >= 1 && newQuantity <= product.stocks) {
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

	if (!product) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-gray-900 mb-4">
						Product Not Found
					</h1>
					<p className="text-gray-600 mb-8">
						The requested product could not be found.
					</p>
					<Link href="/products">
						<Button className="bg-black text-white hover:bg-gray-800">
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back to Products
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="container mx-auto px-4 lg:px-10 py-8">
				{/* Product Details */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
					{/* Product Images */}
					<div className="space-y-6">
						<motion.div
							className="relative bg-white rounded-lg overflow-hidden shadow-sm"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="absolute top-4 left-4 z-10">
								<Link
									href="/products"
									className="inline-flex items-center bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800 transition-colors"
								>
									<ArrowLeft className="h-4 w-4 mr-2" />
									Back
								</Link>
							</div>

							<div className="relative w-full h-96 lg:h-[400px]">
								<Image
									src={
										product.images?.[selectedImage] ||
										product.image ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
									}
									alt={product.name}
									fill
									className="object-contain p-8"
									priority
								/>
							</div>
						</motion.div>

						{/* Image Gallery */}
						{product.images && product.images.length > 1 && (
							<div className="flex space-x-4 justify-center overflow-x-auto">
								{product.images.map((image, index) => (
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
											alt={`${product.name} view ${index + 1}`}
											fill
											className="object-contain p-2"
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
							<div className="flex items-center mb-2">
								<span className="flex items-center gap-2 bg-green-600 text-white px-2 py-1 rounded-lg">
									{product.rating || 4.5}
									<Star className="w-4 h-4 fill-white text-white" />
								</span>
								<span className="ml-2 text-gray-600 font-semibold">
									({product.reviews.length} Reviews)
								</span>
							</div>

							{/* Product price */}
							<p className="text-xl lg:text-2xl font-semibold text-black mb-2">
								₹ {product.price.toLocaleString()}
							</p>

							{/* Discounted price and discount percentage */}
							{product.originalPrice > product.price && (
								<div className="flex items-center mb-4">
									<span className="text-gray-500 line-through mr-2">
										₹ {product.originalPrice.toLocaleString()}
									</span>
									<span className="text-green-500">
										{product.discountPercentage}% off
									</span>
								</div>
							)}
						</div>

						{/* Product Colors */}
						{/* <div className="w-fit flex space-x-2 p-3 bg-gray-200 rounded-lg">
							{colors.map((color, i) => (
								<div
									key={i}
									className={`w-6 h-6 rounded-full border border-gray-200 cursor-pointer ${color}`}
								/>
							))}
						</div> */}

						{/* Product short description */}
						{product.description && (
							<p className="text-gray-600 line-clamp-3">
								{product.description}
							</p>
						)}

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
										disabled={quantity >= product.stocks}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>

								{/* Stock Status */}
								<div className="flex items-center space-x-2">
									<div
										className={`w-3 h-3 rounded-full ${
											product.inStock ? "bg-green-500" : "bg-red-500"
										}`}
									/>
									<span
										className={
											product.inStock ? "text-green-600" : "text-red-600"
										}
									>
										{product.status}
									</span>
								</div>

								<span className="text-sm text-gray-500">
									({product.stocks} available)
								</span>
							</div>

							<div className="flex flex-col md:flex-row gap-4">
								<Button
									onClick={handleAddToCart}
									disabled={!product.inStock || isLoading}
									className="flex-1 bg-black text-white hover:bg-gray-800"
								>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
								</Button>
								<Button
									onClick={handleBuyNow}
									disabled={!product.inStock}
									className="flex-1 bg-green-600 text-white hover:bg-green-700"
								>
									Buy Now
								</Button>
								<div className="grid grid-cols-2 gap-2">
									<Button variant="outline">
										<Heart className="h-5 w-5 mr-2" />
										Wishlist
									</Button>
									{/* <Button variant="outline">
										<Share2 className="h-5 w-5" />
									</Button> */}
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Product Description */}
				{product.longDescription && (
					<motion.div
						className="mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						<Card className="bg-white rounded-xl p-6 shadow-sm">
							<h2 className="text-2xl font-bold mb-4">Product Description</h2>
							<p className="text-gray-600 leading-relaxed">
								{product.longDescription}
							</p>
						</Card>
					</motion.div>
				)}

				{/* Product Features */}
				{product.features && product.features.length > 0 && (
					<motion.div
						className="mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
					>
						<Card className="bg-white rounded-xl p-6 shadow-sm">
							<h2 className="text-2xl font-bold mb-4">Product Features</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
								{product.features.map((feature, index) => (
									<Card
										key={index}
										className="bg-gray-50 rounded-xl p-6 shadow-sm"
									>
										<h3 className="font-semibold text-lg mb-3">
											{feature.title}
										</h3>
										<p className="text-gray-600">{feature.description}</p>
									</Card>
								))}
							</div>
						</Card>
					</motion.div>
				)}

				{/* Delivery Details and Offers */}
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

								{/* Location Check
								<div className="bg-white rounded-lg p-4 mb-6 flex items-center justify-between">
									<div className="flex items-center space-x-3">
										<MapPin className="h-6 w-6 text-gray-600" />
										<span className="text-gray-600">Enter your pincode</span>
									</div>
									<Button className="bg-black text-white hover:bg-gray-800 rounded-full px-6">
										CHECK
									</Button>
								</div> */}
								{/* 
								<p className="text-gray-700 mb-6">
									Check serviceability at your location
								</p> */}

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
												No shipping charges on orders above Rs. 500.
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
					{/* Offers List */}
					{/* Buy More & Save More */}
					{/* <motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="flex-1"
					>
						<Card className="bg-green-50 border-green-200">
							<CardContent className="p-6">
								<h2 className="text-2xl font-bold mb-6">Offers and Coupons</h2>

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
					</motion.div> */}
				</div>

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
							</div>

							<p className="text-gray-600 mb-6">
								{product.name} - Customer Reviews and Ratings
							</p>

							{/* Rating Summary */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
								<div className="text-center">
									<div className="flex items-center justify-center space-x-2 mb-2">
										<span className="text-4xl font-bold text-green-600">
											{product.rating || 4.5}
										</span>
										<Star className="w-8 h-8 fill-green-600 text-green-600" />
									</div>
									<p className="text-gray-600">
										Average Rating based on {product?.reviews.length} ratings
										and {product?.reviews.length} reviews
									</p>
								</div>

								<div className="space-y-2">
									{/* <h3 className="text-lg font-semibold mb-2">Rating Breakdown - Need to be fixed</h3> */}
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
								{product?.reviews.length > 0 ? (
									product?.reviews.map((review) => (
										<div
											key={review.id}
											className="border-b border-gray-200 pb-6 last:border-b-0"
										>
											<div className="flex items-start space-x-4">
												<Image
													src={review.user.profilePic}
													width={32}
													height={32}
													className="w-10 h-10 text-gray-600 rounded-full object-cover"
												/>
												<div className="flex-1 space-y-1">
													{/* User details */}
													<div className="">
														<div className="flex items-center space-x-2">
															<h4 className="font-semibold">
																{review.user.firstName +
																	" " +
																	review.user.lastName}
															</h4>
														</div>
													</div>
													<div className="flex items-center space-x-2 ">
														<h4 className="font-semibold">{review.name}</h4>
													</div>
													<div className="flex items-center space-x-1">
														{renderStars(review.rating)}
													</div>
													<p className="text-gray-700 text-sm leading-relaxed">
														{review.comment}
													</p>
												</div>
											</div>
										</div>
									))
								) : (
									<p className="text-gray-600">No reviews yet</p>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.7 }}
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

				{/* Benefits and Warranty Section */}
				<motion.div
					className="mb-10"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.8 }}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Store Benefits */}
						<Card>
							<CardContent className="p-6">
								<h2 className="text-xl font-bold mb-6">Store Benefits</h2>
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
