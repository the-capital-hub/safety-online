"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
        ArrowLeft,
        Minus,
        Plus,
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
        Heart,
        Share,
        ChevronLeft,
        ChevronRight,
        Store,
        ShieldCheck,
        Mail,
        Phone,
        MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/BuyerPanel/products/ProductCard.jsx";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { useWishlistStore } from "@/store/wishlistStore";
import useRequireAuth from "@/hooks/useRequireAuth.js";

export default function ProductDetail({
	product,
	relatedProducts = [],
	seller,
}) {
	const [selectedImage, setSelectedImage] = useState(0);
	const [quantity, setQuantity] = useState(1);
	const [isSticky, setIsSticky] = useState(true);
	const [pincodeInput, setPincodeInput] = useState("");
	const [isChecking, setIsChecking] = useState(false);
	const [serviceability, setServiceability] = useState(null);
	const [serviceabilityError, setServiceabilityError] = useState("");
	const router = useRouter();
	const { addItem, updateQuantity, isLoading } = useCartStore();
	const {
		isItemInWishlist,
		toggleItem,
		isLoading: wishlistLoading,
	} = useWishlistStore();
	const requireAuth = useRequireAuth();

	const isInWishlist = isItemInWishlist(product.id || product._id);

	const relatedProductsRef = useRef(null);

	useEffect(() => {
		const handleScroll = () => {
			if (relatedProductsRef.current) {
				const relatedProductsTop = relatedProductsRef.current.offsetTop;
				const scrollPosition = window.scrollY + window.innerHeight;

				setIsSticky(scrollPosition < relatedProductsTop);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleAddToCart = async (e) => {
		e.stopPropagation();

		if (!requireAuth({ message: "Please login to add items to your cart" })) {
			return;
		}

		await addItem(
			{
				id: product.id || product._id,
				name: product.title,
				description: product.description,
				price: product.salePrice || product.price,
				originalPrice: product.price,
				image: product.images?.[0] || product.image,
				inStock: product.inStock,
			},
			quantity
		);
	};

	const handleBuyNow = async (e) => {
		e.stopPropagation();

		if (!requireAuth({ message: "Please login to continue" })) {
			return;
		}
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

        const getSellerInitials = (name) => {
                if (!name) return "";
                const parts = name.trim().split(/\s+/);
                const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() || "");
                return initials.join("");
        };

        const toSentenceCase = (str) => {
                if (!str) return "";

                return str
                        .toLowerCase()
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
        };

        const getHeadOfficeAddress = () => {
                if (!seller?.companyAddress?.length) {
                        return null;
                }

                const normalizedAddresses = seller.companyAddress.map((addr) => ({
                        ...addr,
                        tagName: addr.tagName?.toLowerCase() || "",
                }));

                const headOffice =
                        normalizedAddresses.find((addr) => addr.tagName === "head office") ||
                        normalizedAddresses[0];

                if (!headOffice) {
                        return null;
                }

                const {
                        building,
                        street,
                        city,
                        state,
                        pincode,
                        country,
                        tagName,
                } = headOffice;

                return {
                        label: tagName ? toSentenceCase(tagName) : "Registered Address",
                        fullAddress: [building, street, city, state, pincode, country]
                                .filter(Boolean)
                                .join(", "),
                };
        };

	const calculateRatingPercentages = () => {
		if (!product?.reviews || product.reviews.length === 0) {
			return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		}

		const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
		product.reviews.forEach((review) => {
			const rating = Math.round(review.rating);
			if (rating >= 1 && rating <= 5) {
				ratingCounts[rating]++;
			}
		});

		const total = product.reviews.length;
		const percentages = {};
		for (let i = 1; i <= 5; i++) {
			percentages[i] = Math.round((ratingCounts[i] / total) * 100);
		}

		return percentages;
	};

        const ratingPercentages = calculateRatingPercentages();
        const headOfficeAddress = getHeadOfficeAddress();

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

        const handlePrevImage = () => {
                setSelectedImage(
                        (selectedImage + product.images.length - 1) % product.images.length
		);
	};

	const handleNextImage = () => {
		setSelectedImage((selectedImage + 1) % product.images.length);
	};

	const handleCheckServiceability = async () => {
		setServiceabilityError("");
		setServiceability(null);
		const pin = String(pincodeInput || "").trim();
		if (!/^\d{6}$/.test(pin)) {
			setServiceabilityError("Enter a valid 6-digit pincode");
			return;
		}
		try {
			setIsChecking(true);
			const res = await fetch(`/api/hexalog/serviceability/${pin}`);
			const json = await res.json();
			if (!res.ok || !json?.success) {
				throw new Error(json?.message || "Failed to check serviceability");
			}
			setServiceability(json.data);
		} catch (err) {
			setServiceabilityError(err.message || "Failed to check serviceability");
		} finally {
			setIsChecking(false);
		}
	};

	const handleShare = async () => {
		const url = window?.location?.href || "";

		try {
			if (navigator.share) {
				await navigator.share({ title: product.name, url });
			} else {
				await navigator.clipboard?.writeText(url);
				toast.success("Link copied to clipboard");
			}
		} catch {
			toast.error("Failed to share");
		}
	};

	const handleWishlist = async (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (!requireAuth({ message: "Please login to manage your wishlist" })) {
			return;
		}
		await toggleItem(product);
	};

	const salePrice = product.salePrice ?? product.price;
	const originalPrice = product.originalPrice ?? product.price;
	const formattedSalePrice =
		typeof salePrice === "number" ? salePrice.toLocaleString() : "0";
	const formattedOriginalPrice =
		typeof originalPrice === "number" ? originalPrice.toLocaleString() : null;
	const discountPercentage =
		product.discountPercentage ??
		(typeof originalPrice === "number" &&
		typeof salePrice === "number" &&
		originalPrice > 0
			? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
			: null);
	const showOriginalPrice =
		typeof formattedOriginalPrice === "string" && originalPrice !== salePrice;
	const displayDiscount =
		typeof discountPercentage === "number" && discountPercentage > 0;
	const ratingCount = product?.reviews?.length || 0;
	const averageRating =
		typeof product?.rating === "number"
			? product.rating
			: Number(product?.rating) || 0;
	const specificationRows = product?.specifications
		? [
				{ label: "Brand", value: product.specifications.brand },
				{ label: "Length (cm)", value: product.specifications.length },
				{ label: "Height (cm)", value: product.specifications.height },
				{ label: "Width (cm)", value: product.specifications.width },
				{ label: "Weight (kg)", value: product.specifications.weight },
				{ label: "Colour", value: product.specifications.color },
				{ label: "Material", value: product.specifications.material },
				{ label: "Size", value: product.specifications.size },
		  ]
		: [];

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="px-10 py-4">
				<div className="flex items-center space-x-2 text-sm text-gray-600">
					<Link href="/" className="hover:text-gray-900">
						Home
					</Link>
					<span>›</span>
					<Link href="/products" className="hover:text-gray-900">
						All
					</Link>
					<span>›</span>
					<span className="text-gray-900">{product.category}</span>
				</div>
			</div>

			<div className="px-10 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-10 gap-8 mb-10">
					{/* Left Column - Product Images */}
					<div className="lg:col-span-3 space-y-6">
						<motion.div
							className="relative bg-white rounded-lg overflow-hidden shadow-md"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5 }}
						>
							<div className="relative w-full h-96 lg:h-[500px]">
								<Image
									src={
										product.images?.[selectedImage] ||
										product.image ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png" ||
										"/placeholder.svg"
									}
									alt={product.name}
									fill
									className="object-contain p-8"
									priority
								/>

								{/* Need to add Share, Wishlist and Image toggle(next, prev) buttons on the right side of the image */}
								<div className="absolute top-4 right-4 flex flex-col space-y-4">
									<button
										className="bg-gray-200 p-2 rounded-lg"
										onClick={handleShare}
									>
										<Share className="h-6 w-6" />
									</button>
									<button
										className={
											isInWishlist
												? "text-red-500 border-red-500 hover:text-red-600 hover:border-red-600 bg-gray-200 p-2 rounded-lg"
												: "bg-gray-200 p-2 rounded-lg"
										}
										onClick={handleWishlist}
										disabled={wishlistLoading}
									>
										<Heart
											className={`h-6 w-6 ${
												isInWishlist
													? "text-red-500 fill-current hover:text-red-600"
													: ""
											}`}
										/>
									</button>
								</div>

								<div className="absolute bottom-4 right-4 flex flex-col space-y-4">
									<button
										onClick={handlePrevImage}
										className="bg-gray-200 p-2 rounded-lg"
									>
										<ChevronLeft className="h-6 w-6" />
									</button>
									<button
										onClick={handleNextImage}
										className="bg-gray-200 p-2 rounded-lg"
									>
										<ChevronRight className="h-6 w-6" />
									</button>
								</div>
							</div>
						</motion.div>

						{/* Image Gallery */}
						{product.images && product.images.length > 1 && (
							<div className="flex space-x-4 justify-start overflow-x-auto scrollbar-thin scrollbar-thumb-orange-500 hover:scrollbar-thumb-orange-600 scrollbar-track-gray-200">
								{product.images.map((image, index) => (
									<button
										key={index}
										onClick={() => setSelectedImage(index)}
										className={`relative w-20 h-20 border-2 bg-white rounded-lg overflow-hidden flex-shrink-0 ${
											selectedImage === index
												? "border-orange-500"
												: "border-gray-200 hover:border-orange-300"
										}`}
									>
										<Image
											src={
												image ||
												"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png" ||
												"/placeholder.svg"
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

					{/* Middle Column - Scrollable Content */}
					<div className="lg:col-span-5 space-y-4 lg:space-y-5 lg:max-h-screen lg:overflow-y-auto hide-scrollbar">
						{/* Brand, Title & Pricing */}
						<div className="space-y-3">
							<p className="text-sm uppercase tracking-wide text-gray-500">
								{product.specifications?.brand || product.brand || "Brand"}
							</p>
							<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
								{product.name}
							</h1>
							<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
								<div className="flex items-baseline gap-2">
									<span className="uppercase text-xs font-semibold tracking-wide text-gray-500">
										Sale
									</span>
									<span className="text-3xl font-semibold text-gray-900">
										₹ {formattedSalePrice}
									</span>
								</div>
								{showOriginalPrice && (
									<div className="flex items-baseline gap-2 text-gray-500">
										<span className="uppercase text-xs font-semibold tracking-wide">
											MRP
										</span>
										<span className="line-through text-gray-400">
											₹ {formattedOriginalPrice}
										</span>
									</div>
								)}
								{displayDiscount && (
									<Badge className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 font-semibold">
										{discountPercentage}% OFF
									</Badge>
								)}
								<div className="flex items-center gap-1 text-gray-600">
									<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
									<span className="font-semibold text-gray-900">
										{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
									</span>
									<span className="text-xs uppercase tracking-wide text-gray-500">
										({ratingCount} ratings)
									</span>
								</div>
							</div>
						</div>

						{/* Key Features */}
						{product.features && product.features.length > 0 && (
							<div>
								<h3 className="font-semibold text-lg mb-2">Key Features</h3>
								<ul className="space-y-2">
									{product.features.map((feature, index) => (
										<li key={index} className="flex items-start space-x-2">
											<span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
											<span className="text-sm text-gray-600">
												{feature.description}
											</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{/* Product Specifications */}
						{specificationRows.length > 0 && (
							<div>
								<h3 className="font-semibold text-lg mb-2">
									Product Specifications
								</h3>
								<div className="overflow-hidden rounded-lg border border-gray-200">
									<table className="w-full text-center text-sm">
										<tbody>
											{specificationRows.map((spec) => (
												<tr key={spec.label} className="odd:bg-gray-50">
													<th className="border border-gray-200 px-4 py-2 font-semibold text-gray-600">
														{spec.label}
													</th>
													<td className="border border-gray-200 px-4 py-2 text-gray-700">
														{spec.value ?? "--"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Product Details */}
						{product.longDescription && (
							<div>
								<h3 className="font-semibold text-lg mb-2">Product Details</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									{product.longDescription}
								</p>
							</div>
						)}

						{product.keywords && product.keywords.length > 0 && (
							<div>
								<h3 className="font-semibold text-lg mb-2">Keywords</h3>
								<div className="flex flex-wrap gap-2">
									{product.keywords.map((keyword, index) => (
										<div
											key={index}
											className="text-sm bg-white border border-orange-500 rounded-lg px-3 py-2"
										>
											{toSentenceCase(keyword)}
										</div>
									))}
								</div>
							</div>
						)}

						{/* Safety Online Benefits */}
						<div>
							<h3 className="font-semibold text-lg mb-2">
								Safety Online Benefits
							</h3>
							<div className="flex flex-wrap gap-2">
								<div className="flex items-center space-x-2 bg-white border border-orange-500 rounded-lg px-3 py-2">
									<Receipt className="h-4 w-4" />
									<span className="text-sm">GST Invoice Available</span>
								</div>
								<div className="flex items-center space-x-2 border border-orange-500 rounded-lg px-3 py-2">
									<Lock className="h-4 w-4" />
									<span className="text-sm">Secure Payments</span>
								</div>
								<div className="flex items-center space-x-2 border border-orange-500 rounded-lg px-3 py-2">
									<HelpCircle className="h-4 w-4" />
									<span className="text-sm">365 Days Help Desk</span>
								</div>
							</div>
						</div>

						{/* Return & Warranty Policy */}
						<div>
							<h3 className="font-semibold text-lg mb-2">
								Return & Warranty Policy
							</h3>
							<div className="flex flex-wrap gap-2">
								<div className="flex items-center space-x-2 bg-white border border-orange-500 rounded-lg px-3 py-2">
									<RotateCcw className="h-4 w-4" />
									<span className="text-sm">Upto 7 Days Return Policy</span>
								</div>
								<div className="flex items-center space-x-2 bg-white border border-orange-500 rounded-lg px-3 py-2">
									<Home className="h-4 w-4" />
									<span className="text-sm">Damage Products</span>
								</div>
								<div className="flex items-center space-x-2 bg-white border border-orange-500 rounded-lg px-3 py-2">
									<AlertCircle className="h-4 w-4" />
									<span className="text-sm">Wrong Product</span>
								</div>
							</div>
						</div>
					</div>

					{/* Right Column - Sticky Purchase Card */}
					<div className="lg:col-span-2">
						<div
							className={`h-fit ${
								isSticky ? "sticky top-4" : ""
							} transition-all duration-300`}
						>
							<Card className="bg-white shadow-md mb-10">
								<CardContent className="p-6">
									{/* Price */}
									<div className="mb-4 space-y-2">
										<div className="flex flex-wrap items-center gap-3 text-sm">
											<span className="text-2xl font-bold text-gray-900">
												₹ {formattedSalePrice}
											</span>
											{showOriginalPrice && (
												<span className="text-base text-gray-400 line-through">
													₹ {formattedOriginalPrice}
												</span>
											)}
											{displayDiscount && (
												<Badge className="bg-green-50 text-green-600 border border-green-200 px-3 py-1 font-semibold">
													{discountPercentage}% OFF
												</Badge>
											)}
										</div>
										<div className="flex items-center gap-1 text-sm text-gray-600">
											<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
											<span className="font-semibold text-gray-900">
												{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
											</span>
											<span className="text-xs uppercase tracking-wide text-gray-500">
												({ratingCount} ratings)
											</span>
										</div>
									</div>

									{/* Quantity Selector */}
									<div className="mb-4">
										<div className="flex items-center justify-between mb-2">
											<span className="text-sm font-medium">Update Qty</span>
											<div className="flex items-center border rounded">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleQuantityChange(-1)}
													disabled={quantity <= 1}
												>
													<Minus className="h-3 w-3" />
												</Button>
												<span className="px-3 py-1 text-sm font-medium">
													{quantity}
												</span>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleQuantityChange(1)}
													disabled={quantity >= product.stocks}
												>
													<Plus className="h-3 w-3" />
												</Button>
											</div>
										</div>
									</div>

									{/* Action Buttons */}
									<div className="space-y-3 mb-6">
										<Button
											onClick={handleAddToCart}
											disabled={!product.inStock || isLoading}
											variant="outline"
											className="w-full bg-transparent"
										>
											ADD TO CART
										</Button>
										<Button
											onClick={handleBuyNow}
											disabled={!product.inStock}
											className="w-full bg-orange-500 hover:bg-orange-600 text-white"
										>
											BUY NOW
										</Button>
									</div>

									{/* Delivery Info */}
									<div className="space-y-3 text-sm">
										<div className="flex items-center space-x-2">
											<Truck className="h-4 w-4 text-orange-500" />
											<div>
												<div className="font-medium">Free Delivery</div>
												<div className="text-gray-600">
													No shipping charges on this order
												</div>
											</div>
										</div>
										<div className="flex items-center space-x-2">
											<CreditCard className="h-4 w-4 text-orange-500" />
											<div>
												<div className="font-medium">COD Available</div>
												<div className="text-gray-600">
													You can pay at the time of delivery
												</div>
											</div>
										</div>
										{/* Pincode Serviceability */}
										<div className="pt-2">
											<div className="text-sm font-medium mb-2">
												Check delivery at your pincode
											</div>
                                                                                        <div className="flex flex-col sm:flex-row items-stretch gap-2">
												<input
													type="text"
													inputMode="numeric"
													pattern="[0-9]{6}"
													maxLength={6}
													value={pincodeInput}
													onChange={(e) =>
														setPincodeInput(e.target.value.replace(/\D/g, ""))
													}
													placeholder="Enter 6-digit pincode"
													className="flex-1 border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
												/>
                                                                                                <Button
                                                                                                        onClick={handleCheckServiceability}
                                                                                                        disabled={isChecking}
                                                                                                        className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
												>
													{isChecking ? "Checking..." : "Check"}
												</Button>
											</div>
											{serviceabilityError && (
												<div className="text-xs text-red-600 mt-2">
													{serviceabilityError}
												</div>
											)}
											{serviceability && (
												<div className="mt-3 border rounded p-3 space-y-2 bg-gray-50">
													<div className="flex items-center justify-between">
														<span className="text-sm font-medium">
															Serviceability
														</span>
														<Badge
															className={
																serviceability.status
																	? "bg-green-50 text-green-700 border border-green-200"
																	: "bg-red-50 text-red-600 border border-red-200"
															}
														>
															{serviceability.status
																? "Serviceable"
																: "Not Serviceable"}
														</Badge>
													</div>
													{serviceability.status && (
														<div className="text-xs text-gray-600">
															{serviceability.status
																? "Congratulation, Product is deliverable at your location."
																: "Product is not deliverable at your location. Please try another pincode."}
														</div>
													)}
												</div>
											)}
										</div>
									</div>
								</CardContent>
							</Card>

                                                        {seller && (
                                                                <motion.div
                                                                        initial={{ opacity: 0, y: 20 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ duration: 0.5, delay: 0.4 }}
                                                                >
                                                                        <Card className="bg-white shadow-sm border border-orange-100">
                                        <CardContent className="p-6 space-y-6">
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                        <div className="flex items-start gap-4">
                                                                {seller?.companyLogo ? (
                                                                        <div className="relative h-16 w-16 shrink-0 rounded-full border border-orange-200 bg-orange-50 flex items-center justify-center overflow-hidden">
                                                                                <Image
                                                                                        src={seller.companyLogo}
                                                                                        alt={`${seller?.companyName || "Seller"} logo`}
                                                                                        width={64}
                                                                                        height={64}
                                                                                        className="object-contain p-2"
                                                                                />
                                                                        </div>
                                                                ) : (
                                                                        <div className="h-16 w-16 shrink-0 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-xl font-semibold text-orange-700">
                                                                                {getSellerInitials(seller?.companyName || seller?.brandName)}
                                                                        </div>
                                                                )}
                                                                <div className="space-y-1">
                                                                        <p className="text-xs font-semibold tracking-wide text-orange-500 uppercase">Sold by</p>
                                                                        <h3 className="text-xl font-semibold text-gray-900 break-words">
                                                                                {seller?.brandName || seller?.companyName || "Trusted Seller"}
                                                                        </h3>
                                                                        <p className="text-sm text-gray-500 leading-relaxed break-words">
                                                                                {seller?.tagline ||
                                                                                        "Authorised safety equipment partner offering reliable quality and dedicated service."}
                                                                        </p>
                                                                </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                                <Badge className="bg-green-50 text-green-700 border border-green-200 font-medium whitespace-nowrap">
                                                                        Verified Seller
                                                                </Badge>
                                                                <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
                                                                        <ShieldCheck className="h-4 w-4 text-green-500" />
                                                                        Amazon-style assurance
                                                                </div>
                                                        </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 flex flex-col gap-2">
                                                                <div className="flex items-center gap-2 text-gray-800">
                                                                        <Store className="h-5 w-5 text-orange-500" />
                                                                        <span className="text-sm font-semibold">Business Details</span>
                                                                </div>
                                                                <div className="text-sm text-gray-600 space-y-1">
                                                                        <p className="font-medium text-gray-700 leading-relaxed break-words">
                                                                                {seller?.companyName || "Company Name"}
                                                                        </p>
                                                                        {seller?.brandName && (
                                                                                <p className="text-gray-500 leading-relaxed break-words">Brand: {seller.brandName}</p>
                                                                        )}
                                                                </div>
                                                        </div>

                                                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 flex flex-col gap-3">
                                                                <div className="flex items-center gap-2 text-gray-800">
                                                                        <HelpCircle className="h-5 w-5 text-orange-500" />
                                                                        <span className="text-sm font-semibold">Customer Assistance</span>
                                                                </div>
                                                                <div className="flex flex-col gap-2 text-sm text-gray-600">
                                                                        {seller?.companyEmail && (
                                                                                <div className="flex items-center gap-2 break-words">
                                                                                        <Mail className="h-4 w-4 text-gray-500" />
                                                                                        <span className="leading-relaxed">{seller.companyEmail}</span>
                                                                                </div>
                                                                        )}
                                                                        {seller?.phone && (
                                                                                <div className="flex items-center gap-2 break-words">
                                                                                        <Phone className="h-4 w-4 text-gray-500" />
                                                                                        <span className="leading-relaxed">{seller.phone}</span>
                                                                                </div>
                                                                        )}
                                                                        <div className="flex items-start gap-2 text-gray-500">
                                                                                <AlertCircle className="h-4 w-4 mt-0.5" />
                                                                                <span className="leading-relaxed">
                                                                                        Need help? Reach out for installation & after-sales support.
                                                                                </span>
                                                                        </div>
                                                                </div>
                                                        </div>

                                                        <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 flex flex-col gap-3 sm:col-span-2 xl:col-span-1">
                                                                <div className="flex items-start gap-2 text-gray-800">
                                                                        <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
                                                                        <div className="space-y-1">
                                                                                <p className="text-sm font-semibold text-gray-800">
                                                                                        {(headOfficeAddress && headOfficeAddress.label) || "Business Address"}
                                                                                </p>
                                                                                <p className="text-sm text-gray-600 leading-relaxed break-words">
                                                                                        {(headOfficeAddress && headOfficeAddress.fullAddress) ||
                                                                                                "Address information will be available soon."}
                                                                                </p>
                                                                        </div>
                                                                </div>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                                                                </motion.div>
                                                        )}
						</div>
					</div>
				</div>

				{/* Related Products */}
				{relatedProducts.length > 0 && (
					<motion.div
						ref={relatedProductsRef}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.7 }}
						className="mb-10"
					>
						<div className="flex items-center justify-between mb-8">
							<h2 className="text-2xl font-bold">Related Products</h2>
							<Link
								href="/products"
								className="text-orange-500 hover:text-orange-600"
							>
								View all
							</Link>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{relatedProducts.slice(0, 4).map((relatedProduct) => (
								<ProductCard key={relatedProduct.id} product={relatedProduct} />
							))}
						</div>
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
							<div className="mb-6">
								<h2 className="text-2xl font-bold">Reviews & Ratings</h2>
							</div>

							<p className="text-gray-600 mb-6">{product.name}</p>

							{/* Rating Summary */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
								<div className="text-center">
									<div className="flex items-center justify-center space-x-2 mb-2">
										<span className="text-4xl font-bold text-green-600">
											{product.rating}
										</span>
										<Star className="w-8 h-8 fill-green-600 text-green-600" />
									</div>
									<p className="text-gray-600">
										Average Rating based on {product?.reviews?.length} ratings
										and reviews
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
														width: `${ratingPercentages[stars] || 0}%`,
													}}
												></div>
											</div>
											<span className="text-sm text-gray-600 w-12">
												{ratingPercentages[stars] || 0}%
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Individual Reviews */}
							<div className="space-y-6">
								{product?.reviews?.length > 0 ? (
									product?.reviews.map((review) => (
										<div
											key={review.id}
											className="border-b border-gray-200 pb-6 last:border-b-0"
										>
											<div className="flex items-start space-x-4">
												<Image
													src={
														review.user?.profilePic ||
														"/placeholder.svg?height=40&width=40"
													}
													width={40}
													height={40}
													className="w-10 h-10 text-gray-600 rounded-full object-cover"
													alt="User avatar"
												/>
												<div className="flex-1 space-y-1">
													<div className="flex items-center space-x-2">
														<h4 className="font-semibold">
															{review.user?.firstName +
																" " +
																review.user?.lastName || review.name}
														</h4>
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
									<div className="text-gray-600">No reviews yet</div>
								)}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
