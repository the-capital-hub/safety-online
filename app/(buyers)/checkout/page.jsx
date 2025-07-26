"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Script from "next/script";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
	ShoppingBag,
	MapPin,
	CreditCard,
	ArrowLeft,
	ArrowRight,
	Loader2,
	Tag,
	X,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore.js";
import { useProductStore } from "@/store/productStore.js";
import { useCheckoutStore } from "@/store/checkoutStore.js";
import Image from "next/image";

export default function CheckoutPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
	const [couponCode, setCouponCode] = useState("");

	const [localCustomerInfo, setLocalCustomerInfo] = useState({
		name: "",
		email: "",
		mobile: "",
	});

	const [localDeliveryAddress, setLocalDeliveryAddress] = useState({
		street: "",
		city: "",
		state: "",
		zipCode: "",
		country: "India",
	});

	// Optimized store selectors - only subscribe to what we need
	const cartItems = useCartStore((state) => state.items);
	const getProductById = useProductStore((state) => state.getProductById);

	// Use shallow comparison for checkout store to prevent unnecessary re-renders
	const {
		checkoutType,
		buyNowProduct,
		buyNowQuantity,
		customerInfo,
		deliveryAddress,
		orderSummary,
		appliedCoupon,
		currentStep,
		isLoading,
	} = useCheckoutStore();

	// Separate selectors for actions to prevent re-renders when calling them
	const setCheckoutType = useCheckoutStore((state) => state.setCheckoutType);
	const setCustomerInfo = useCheckoutStore((state) => state.setCustomerInfo);
	const setDeliveryAddress = useCheckoutStore(
		(state) => state.setDeliveryAddress
	);
	const setCurrentStep = useCheckoutStore((state) => state.setCurrentStep);
	const initializeCheckout = useCheckoutStore(
		(state) => state.initializeCheckout
	);
	const applyCoupon = useCheckoutStore((state) => state.applyCoupon);
	const removeCoupon = useCheckoutStore((state) => state.removeCoupon);
	const processPayment = useCheckoutStore((state) => state.processPayment);
	const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

	// Initialize local state from store when component mounts or store updates
	useEffect(() => {
		setLocalCustomerInfo(customerInfo);
	}, [customerInfo]);

	useEffect(() => {
		setLocalDeliveryAddress(deliveryAddress);
	}, [deliveryAddress]);

	// Initialize checkout based on URL params
	useEffect(() => {
		const buyNow = searchParams.get("buyNow");
		const productId = searchParams.get("id");
		const quantity = Number.parseInt(searchParams.get("qty") || "1");

		if (buyNow === "true" && productId) {
			// Buy Now flow
			const product = getProductById(productId);
			if (product) {
				setCheckoutType("buyNow", product, quantity);
				initializeCheckout([], product, quantity);
			} else {
				toast.error("Product not found");
				router.push("/products");
			}
		} else {
			// Cart checkout flow
			if (cartItems.length === 0) {
				toast.error("Your cart is empty");
				router.push("/cart");
				return;
			}
			setCheckoutType("cart");
			initializeCheckout(cartItems);
		}
	}, [
		searchParams,
		cartItems,
		getProductById,
		setCheckoutType,
		initializeCheckout,
		router,
	]);

	// Handle Razorpay script load
	const handleRazorpayLoad = useCallback(() => {
		setIsRazorpayLoaded(true);
	}, []);

	// Optimized input handlers using useCallback to prevent re-creation
	const handleCustomerInfoChange = useCallback((field, value) => {
		setLocalCustomerInfo((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	const handleAddressChange = useCallback((field, value) => {
		setLocalDeliveryAddress((prev) => ({
			...prev,
			[field]: value,
		}));
	}, []);

	// Handle customer info form
	const handleCustomerInfoSubmit = useCallback(
		(e) => {
			e.preventDefault();
			if (
				!localCustomerInfo.name ||
				!localCustomerInfo.email ||
				!localCustomerInfo.mobile
			) {
				toast.error("Please fill all customer information");
				return;
			}
			// Update store only when form is submitted
			setCustomerInfo(localCustomerInfo);
			setCurrentStep(2);
		},
		[localCustomerInfo, setCustomerInfo, setCurrentStep]
	);

	// Handle address form
	const handleAddressSubmit = useCallback(
		(e) => {
			e.preventDefault();
			if (
				!localDeliveryAddress.street ||
				!localDeliveryAddress.city ||
				!localDeliveryAddress.state ||
				!localDeliveryAddress.zipCode
			) {
				toast.error("Please fill all address fields");
				return;
			}
			// Update store only when form is submitted
			setDeliveryAddress(localDeliveryAddress);
			setCurrentStep(3);
		},
		[localDeliveryAddress, setDeliveryAddress, setCurrentStep]
	);

	// Handle coupon application
	const handleApplyCoupon = useCallback(async () => {
		if (!couponCode.trim()) {
			toast.error("Please enter a coupon code");
			return;
		}

		const success = await applyCoupon(couponCode.trim());
		if (success) {
			setCouponCode("");
		}
	}, [couponCode, applyCoupon]);

	// Handle payment
	const handlePayment = useCallback(async () => {
		if (!isRazorpayLoaded) {
			toast.error("Payment system is loading. Please wait.");
			return;
		}

		try {
			const result = await processPayment("user123"); // Replace with actual user ID

			if (result.success) {
				toast.success("Payment successful!");
				router.push(
					`/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`
				);
				resetCheckout();
			}
		} catch (error) {
			console.error("Payment error:", error);
			toast.error(error.message || "Payment failed. Please try again.");
		}
	}, [isRazorpayLoaded, processPayment, router, resetCheckout]);

	// Memoized step components to prevent unnecessary re-renders
	const CustomerInfoStep = useMemo(
		() => (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShoppingBag className="h-5 w-5" />
						Customer Information
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleCustomerInfoSubmit} className="space-y-4">
						<div>
							<Label htmlFor="name">Full Name *</Label>
							<Input
								id="name"
								value={localCustomerInfo.name}
								onChange={(e) =>
									handleCustomerInfoChange("name", e.target.value)
								}
								placeholder="Enter your full name"
								required
							/>
						</div>
						<div>
							<Label htmlFor="email">Email Address *</Label>
							<Input
								id="email"
								type="email"
								value={localCustomerInfo.email}
								onChange={(e) =>
									handleCustomerInfoChange("email", e.target.value)
								}
								placeholder="Enter your email"
								required
							/>
						</div>
						<div>
							<Label htmlFor="mobile">Mobile Number *</Label>
							<Input
								id="mobile"
								type="tel"
								value={localCustomerInfo.mobile}
								onChange={(e) =>
									handleCustomerInfoChange("mobile", e.target.value)
								}
								placeholder="Enter your mobile number"
								required
							/>
						</div>
						<Button type="submit" className="w-full">
							Continue to Address
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</form>
				</CardContent>
			</Card>
		),
		[localCustomerInfo, handleCustomerInfoChange, handleCustomerInfoSubmit]
	);

	const AddressStep = useMemo(
		() => (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Delivery Address
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleAddressSubmit} className="space-y-4">
						<div>
							<Label htmlFor="street">Street Address *</Label>
							<Input
								id="street"
								value={localDeliveryAddress.street}
								onChange={(e) => handleAddressChange("street", e.target.value)}
								placeholder="Enter street address"
								required
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="city">City *</Label>
								<Input
									id="city"
									value={localDeliveryAddress.city}
									onChange={(e) => handleAddressChange("city", e.target.value)}
									placeholder="Enter city"
									required
								/>
							</div>
							<div>
								<Label htmlFor="state">State *</Label>
								<Input
									id="state"
									value={localDeliveryAddress.state}
									onChange={(e) => handleAddressChange("state", e.target.value)}
									placeholder="Enter state"
									required
								/>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="zipCode">ZIP Code *</Label>
								<Input
									id="zipCode"
									value={localDeliveryAddress.zipCode}
									onChange={(e) =>
										handleAddressChange("zipCode", e.target.value)
									}
									placeholder="Enter ZIP code"
									required
								/>
							</div>
							<div>
								<Label htmlFor="country">Country</Label>
								<Input
									id="country"
									value={localDeliveryAddress.country}
									onChange={(e) =>
										handleAddressChange("country", e.target.value)
									}
									placeholder="Country"
									disabled
								/>
							</div>
						</div>
						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => setCurrentStep(1)}
								className="flex-1"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button type="submit" className="flex-1">
								Continue to Payment
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		),
		[
			localDeliveryAddress,
			handleAddressChange,
			handleAddressSubmit,
			setCurrentStep,
		]
	);

	const PaymentStep = useMemo(
		() => (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Payment
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="p-4 bg-blue-50 rounded-lg">
						<p className="text-sm text-blue-800">
							You will be redirected to Razorpay for secure payment processing.
						</p>
					</div>

					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => setCurrentStep(2)}
							className="flex-1"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						<Button
							onClick={handlePayment}
							disabled={isLoading || !isRazorpayLoaded}
							className="flex-1 bg-green-600 hover:bg-green-700"
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								<>
									Pay ₹{orderSummary.total.toLocaleString()}
									<ArrowRight className="ml-2 h-4 w-4" />
								</>
							)}
						</Button>
					</div>
				</CardContent>
			</Card>
		),
		[
			handlePayment,
			isLoading,
			isRazorpayLoaded,
			orderSummary.total,
			setCurrentStep,
		]
	);

	// Memoized order summary to prevent unnecessary re-renders
	const OrderSummary = useMemo(
		() => (
			<Card className="sticky top-4">
				<CardHeader>
					<CardTitle>Order Summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Items */}
					<div className="space-y-3">
						{orderSummary.items.map((item, index) => (
							<div key={index} className="flex items-center gap-3">
								<div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
									<Image
										src={
											item.productImage ||
											"/placeholder.svg?height=48&width=48&text=Product"
										}
										alt={item.productName}
										fill
										className="object-cover"
									/>
								</div>
								<div className="flex-1">
									<p className="font-medium text-sm line-clamp-1">
										{item.productName}
									</p>
									<p className="text-xs text-gray-500">Qty: {item.quantity}</p>
								</div>
								<p className="font-medium">
									₹{item.totalPrice.toLocaleString()}
								</p>
							</div>
						))}
					</div>

					<Separator />

					{/* Coupon Section */}
					<div className="space-y-3">
						{appliedCoupon ? (
							<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
								<div className="flex items-center gap-2">
									<Tag className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium text-green-800">
										{appliedCoupon.code}
									</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									onClick={removeCoupon}
									className="text-red-600 hover:text-red-700"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						) : (
							<div className="flex gap-2">
								<Input
									placeholder="Enter coupon code"
									value={couponCode}
									onChange={(e) => setCouponCode(e.target.value)}
									className="flex-1"
								/>
								<Button
									variant="outline"
									onClick={handleApplyCoupon}
									disabled={isLoading}
								>
									Apply
								</Button>
							</div>
						)}
					</div>

					<Separator />

					{/* Price Breakdown */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span>₹{orderSummary.subtotal.toLocaleString()}</span>
						</div>
						<div className="flex justify-between">
							<span>Tax (GST)</span>
							<span>₹{orderSummary.tax.toLocaleString()}</span>
						</div>
						<div className="flex justify-between">
							<span>Shipping</span>
							<span>
								{orderSummary.shippingCost === 0 ? (
									<Badge variant="secondary">FREE</Badge>
								) : (
									`₹${orderSummary.shippingCost}`
								)}
							</span>
						</div>
						{orderSummary.discount > 0 && (
							<div className="flex justify-between text-green-600">
								<span>Discount</span>
								<span>-₹{orderSummary.discount.toLocaleString()}</span>
							</div>
						)}
						<Separator />
						<div className="flex justify-between font-bold text-lg">
							<span>Total</span>
							<span>₹{orderSummary.total.toLocaleString()}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		),
		[
			orderSummary,
			appliedCoupon,
			couponCode,
			handleApplyCoupon,
			removeCoupon,
			isLoading,
		]
	);

	// Memoized progress steps to prevent re-renders
	const progressSteps = useMemo(
		() =>
			[
				{ step: 1, title: "Information", icon: ShoppingBag },
				{ step: 2, title: "Address", icon: MapPin },
				{ step: 3, title: "Payment", icon: CreditCard },
			].map(({ step, title, icon: Icon }) => (
				<div key={step} className="flex items-center">
					<div
						className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
							currentStep >= step
								? "bg-blue-600 border-blue-600 text-white"
								: "border-gray-300 text-gray-400"
						}`}
					>
						<Icon className="h-5 w-5" />
					</div>
					<span
						className={`ml-2 text-sm font-medium ${
							currentStep >= step ? "text-blue-600" : "text-gray-400"
						}`}
					>
						{title}
					</span>
				</div>
			)),
		[currentStep]
	);

	return (
		<>
			<Script
				src="https://checkout.razorpay.com/v1/checkout.js"
				onLoad={handleRazorpayLoad}
			/>

			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
						<p className="text-gray-600 mt-2">
							{checkoutType === "buyNow"
								? "Complete your purchase"
								: "Review your cart and complete your order"}
						</p>
					</div>

					{/* Progress Steps */}
					<div className="mb-8">
						<div className="flex items-center justify-center space-x-8">
							{progressSteps}
						</div>
					</div>

					{/* Main Content */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Left Column - Forms */}
						<div className="lg:col-span-2">
							<motion.div
								key={currentStep}
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3 }}
							>
								{currentStep === 1 && CustomerInfoStep}
								{currentStep === 2 && AddressStep}
								{currentStep === 3 && PaymentStep}
							</motion.div>
						</div>

						{/* Right Column - Order Summary */}
						<div className="lg:col-span-1">{OrderSummary}</div>
					</div>
				</div>
			</div>
		</>
	);
}
