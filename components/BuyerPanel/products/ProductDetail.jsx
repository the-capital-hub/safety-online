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
	const [selectedQuantityOffer, setSelectedQuantityOffer] = useState(null);
	const router = useRouter();
	const { addItem, isLoading } = useCartStore();

	// Mock reviews data - you can replace this with real reviews from the API
	const reviews = [
		{
			id: 1,
			name: "KL RAHUL KUMAR KARTHIK",
			rating: 5,
			comment: `The ${product.name} offers superior protection and quality. Each item is carefully crafted to meet ISI standards, ensuring high-quality safety for demanding work conditions. Whether you're working in construction or industrial environments, this product delivers excellent value.`,
		},
		{
			id: 2,
			name: "VAIBHAV SHARMA",
			rating: 5,
			comment: `Excellent quality ${product.name}. The build quality is outstanding and it provides great value for money. Highly recommended for professional use.`,
		},
		{
			id: 3,
			name: "ANITA GUPTA",
			rating: 4,
			comment: `Good product overall. The ${product.name} meets expectations and the delivery was prompt. Would purchase again.`,
		},
		{
			id: 4,
			name: "RAJESH MEHTA",
			rating: 4,
			comment: `Quality product with good durability. The ${product.name} is well-designed and serves its purpose effectively.`,
		},
	];

	const quantityOffers = [
		{
			qty: 2,
			price: Math.round(product.price * 0.95),
			discount: 5,
			label: "Qty 2",
		},
		{
			qty: 3,
			price: Math.round(product.price * 0.9),
			discount: 10,
			label: "Qty 3",
		},
		{
			qty: 5,
			price: Math.round(product.price * 0.85),
			discount: 15,
			label: "Qty 5",
		},
		{
			qty: 10,
			price: Math.round(product.price * 0.8),
			discount: 20,
			label: "Qty 10",
		},
	];

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
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
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
										"/placeholder.svg?height=400&width=400&text=Product"
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
												"/placeholder.svg?height=80&width=80&text=Image"
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
									({reviews.length} Reviews)
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
						<div className="w-fit flex space-x-2 p-3 bg-gray-200 rounded-lg">
							{colors.map((color, i) => (
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
										disabled={quantity >= product.stocks}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<span className="text-sm text-gray-500">
									({product.stocks} available)
								</span>
							</div>

							<div className="flex flex-col sm:flex-row gap-4">
								<Button
									onClick={handleAddToCart}
									disabled={!product.inStock || isLoading}
									className="flex-1 bg-black text-white hover:bg-gray-800"
									size="lg"
								>
									<ShoppingCart className="h-5 w-5 mr-2" />
									Add to Cart
								</Button>
								<Button
									onClick={handleBuyNow}
									disabled={!product.inStock}
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
							<div
								className={`w-3 h-3 rounded-full ${
									product.inStock ? "bg-green-500" : "bg-red-500"
								}`}
							/>
							<span
								className={product.inStock ? "text-green-600" : "text-red-600"}
							>
								{product.status}
							</span>
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
				{product.features && product.features.length > 0 && (
					<motion.div
						className="mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.5 }}
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
						{product.longDescription && (
							<Card className="bg-white rounded-xl p-6 shadow-sm">
								<h2 className="text-2xl font-bold mb-4">Product Description</h2>
								<p className="text-gray-600 leading-relaxed">
									{product.longDescription}
								</p>
							</Card>
						)}
					</motion.div>
				)}

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
										Average Rating based on {reviews.length} ratings and{" "}
										{reviews.length} reviews
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
