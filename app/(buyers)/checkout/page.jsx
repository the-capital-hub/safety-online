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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";
import {
	MapPin,
	CreditCard,
	ArrowLeft,
	ArrowRight,
	Loader2,
	Tag,
	X,
	User,
	Plus,
	Home,
	Building,
	MapPinIcon,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore, useLoggedInUser, useUserEmail } from "@/store/authStore";
import { useProductStore } from "@/store/productStore.js";
import { useCheckoutStore } from "@/store/checkoutStore.js";
import Image from "next/image";

export default function CheckoutPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
	const [couponCode, setCouponCode] = useState("");

	// Auth store
	const user = useLoggedInUser();
	const userEmail = useUserEmail();

	// Store selectors
	const cartItems = useCartStore((state) => state.items);
	const cartAppliedPromo = useCartStore((state) => state.appliedPromo);
	const clearCart = useCartStore((state) => state.clearCart);
	const getProductById = useProductStore((state) => state.getProductById);

	// Checkout store
	const {
		checkoutType,
		buyNowProduct,
		buyNowQuantity,
		customerInfo,
		savedAddresses,
		selectedAddressId,
		newAddress,
		isAddingNewAddress,
		orderSummary,
		appliedCoupon,
		cartAppliedCoupon,
		currentStep,
		isLoading,
		paymentLoading,
		paymentMethod,
	} = useCheckoutStore();

	// Checkout store actions
	const setCheckoutType = useCheckoutStore((state) => state.setCheckoutType);
	const setCustomerInfo = useCheckoutStore((state) => state.setCustomerInfo);
	const setCurrentStep = useCheckoutStore((state) => state.setCurrentStep);
	const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod);
	const initializeCheckout = useCheckoutStore(
		(state) => state.initializeCheckout
	);
	const loadUserAddresses = useCheckoutStore(
		(state) => state.loadUserAddresses
	);
	const addNewAddress = useCheckoutStore((state) => state.addNewAddress);
	const updateNewAddress = useCheckoutStore((state) => state.updateNewAddress);
	const selectAddress = useCheckoutStore((state) => state.selectAddress);
	const toggleAddNewAddress = useCheckoutStore(
		(state) => state.toggleAddNewAddress
	);
	const applyCoupon = useCheckoutStore((state) => state.applyCoupon);
	const removeCoupon = useCheckoutStore((state) => state.removeCoupon);
	const processPayment = useCheckoutStore((state) => state.processPayment);
	const resetCheckout = useCheckoutStore((state) => state.resetCheckout);
	const getSelectedAddress = useCheckoutStore(
		(state) => state.getSelectedAddress
	);

	// Check authentication - redirect if not logged in
	useEffect(() => {
		if (!user) {
			toast.error("Please login to continue with checkout");
			router.push("/login");
			return;
		}
	}, [user, router]);

	// Initialize customer info from user data
	useEffect(() => {
		if (user) {
			const fullName =
				`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
				user.name ||
				"";
			setCustomerInfo({
				name: fullName,
				email: user.email || "",
				mobile: user.mobile || user.phone || "",
			});
		}
	}, [user, setCustomerInfo]);

	// Load user addresses on mount
	useEffect(() => {
		if (user) {
			loadUserAddresses();
		}
	}, [user, loadUserAddresses]);

	// Initialize checkout based on URL params
	// Replace this useEffect in your checkout page:
	useEffect(() => {
		const initializeBuyNow = async () => {
			const buyNow = searchParams.get("buyNow");
			const productId = searchParams.get("id");
			const quantity = Number.parseInt(searchParams.get("qty") || "1");

			if (buyNow === "true" && productId) {
				// Buy Now flow
				try {
					const product = await getProductById(productId);
					// console.log("Product in checkout:", product);
					if (product) {
						setCheckoutType("buyNow", product, quantity);
						initializeCheckout([], product, quantity);
					} else {
						toast.error("Product not found");
						router.push("/products");
					}
				} catch (error) {
					console.error("Failed to fetch product:", error);
					toast.error("Failed to load product");
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
				initializeCheckout(cartItems, null, 1, cartAppliedPromo);
			}
		};

		initializeBuyNow();
	}, [
		searchParams,
		cartItems,
		cartAppliedPromo,
		getProductById,
		setCheckoutType,
		initializeCheckout,
		router,
	]);

	// Handle Razorpay script load
	const handleRazorpayLoad = useCallback(() => {
		setIsRazorpayLoaded(true);
	}, []);

	// Handle address selection
	const handleAddressSelect = useCallback(
		(addressId) => {
			selectAddress(addressId);
		},
		[selectAddress]
	);

	// Handle new address form
	const handleNewAddressChange = useCallback(
		(field, value) => {
			updateNewAddress(field, value);
		},
		[updateNewAddress]
	);

	// Handle add new address
	const handleAddNewAddress = useCallback(async () => {
		const success = await addNewAddress();
		if (success) {
			// Address added successfully, form is already reset
		}
	}, [addNewAddress]);

	// Handle coupon application (only for buyNow flow)
	const handleApplyCoupon = useCallback(async () => {
		if (checkoutType === "cart") {
			toast.error("Coupon is already applied from cart");
			return;
		}

		if (!couponCode.trim()) {
			toast.error("Please enter a coupon code");
			return;
		}

		const success = await applyCoupon(couponCode.trim());
		if (success) {
			setCouponCode("");
		}
	}, [couponCode, applyCoupon, checkoutType]);

	// Handle payment
	const handlePayment = useCallback(async () => {
		if (!isRazorpayLoaded) {
			toast.error("Payment system is loading. Please wait.");
			return;
		}

		if (!getSelectedAddress()) {
			toast.error("Please select a delivery address");
			return;
		}

		try {
			const userId = user?._id || user?.id;
			const clearCartCallback = checkoutType === "cart" ? clearCart : null;

			const result = await processPayment(userId, clearCartCallback);

			if (result.success) {
				toast.success("Payment initiated successfully!");
			}
		} catch (error) {
			console.error("Payment error:", error);
			toast.error(error.message || "Payment failed. Please try again.");
		}
	}, [
		isRazorpayLoaded,
		processPayment,
		user,
		checkoutType,
		clearCart,
		getSelectedAddress,
	]);

	// Address Step Component
	const AddressStep = useMemo(
		() => (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Delivery Address
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Saved Addresses */}
					{savedAddresses.length > 0 && (
						<div className="space-y-3">
							<h4 className="font-medium">Saved Addresses</h4>
							{savedAddresses.map((address) => (
								<div
									key={address._id}
									className={`p-4 border rounded-lg cursor-pointer transition-colors ${
										selectedAddressId === address._id
											? "border-blue-500 bg-blue-50"
											: "border-gray-200 hover:border-gray-300"
									}`}
									onClick={() => handleAddressSelect(address._id)}
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												{address.tag === "home" && <Home className="h-4 w-4" />}
												{address.tag === "office" && (
													<Building className="h-4 w-4" />
												)}
												{address.tag === "other" && (
													<MapPinIcon className="h-4 w-4" />
												)}
												<Badge variant="secondary" className="capitalize">
													{address.tag}
												</Badge>
												{address.isDefault && (
													<Badge variant="default">Default</Badge>
												)}
											</div>
											<p className="font-medium">{address.name}</p>
											<p className="text-sm text-gray-600">
												{address.street}, {address.city}, {address.state} -{" "}
												{address.zipCode}
											</p>
										</div>
										<div className="ml-4">
											<div
												className={`w-4 h-4 rounded-full border-2 ${
													selectedAddressId === address._id
														? "border-blue-500 bg-blue-500"
														: "border-gray-300"
												}`}
											>
												{selectedAddressId === address._id && (
													<div className="w-2 h-2 bg-white rounded-full m-0.5" />
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}

					{/* Add New Address Button */}
					{!isAddingNewAddress && (
						<Button
							variant="outline"
							onClick={toggleAddNewAddress}
							className="w-full"
						>
							<Plus className="h-4 w-4 mr-2" />
							Add New Address
						</Button>
					)}

					{/* New Address Form */}
					{isAddingNewAddress && (
						<div className="space-y-4 p-4 border rounded-lg bg-gray-50">
							<div className="flex items-center justify-between">
								<h4 className="font-medium">Add New Address</h4>
								<Button variant="ghost" size="sm" onClick={toggleAddNewAddress}>
									<X className="h-4 w-4" />
								</Button>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="addressTag">Address Type</Label>
									<Select
										value={newAddress.tag}
										onValueChange={(value) =>
											handleNewAddressChange("tag", value)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="home">Home</SelectItem>
											<SelectItem value="office">Office</SelectItem>
											<SelectItem value="other">Other</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label htmlFor="addressName">Contact Name</Label>
									<Input
										id="addressName"
										value={newAddress.name}
										onChange={(e) =>
											handleNewAddressChange("name", e.target.value)
										}
										placeholder="Full name"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="street">Street Address</Label>
								<Textarea
									id="street"
									value={newAddress.street}
									onChange={(e) =>
										handleNewAddressChange("street", e.target.value)
									}
									placeholder="House/Flat no, Building name, Street"
									rows={2}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="city">City</Label>
									<Input
										id="city"
										value={newAddress.city}
										onChange={(e) =>
											handleNewAddressChange("city", e.target.value)
										}
										placeholder="City"
									/>
								</div>
								<div>
									<Label htmlFor="state">State</Label>
									<Input
										id="state"
										value={newAddress.state}
										onChange={(e) =>
											handleNewAddressChange("state", e.target.value)
										}
										placeholder="State"
									/>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="zipCode">PIN Code</Label>
									<Input
										id="zipCode"
										value={newAddress.zipCode}
										onChange={(e) =>
											handleNewAddressChange("zipCode", e.target.value)
										}
										placeholder="PIN Code"
									/>
								</div>
								<div>
									<Label htmlFor="country">Country</Label>
									<Input
										id="country"
										value={newAddress.country}
										disabled
										placeholder="India"
									/>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="isDefault"
									checked={newAddress.isDefault}
									onCheckedChange={(checked) =>
										handleNewAddressChange("isDefault", checked)
									}
								/>
								<Label htmlFor="isDefault" className="text-sm">
									Set as default address
								</Label>
							</div>

							<div className="flex gap-3">
								<Button
									variant="outline"
									onClick={toggleAddNewAddress}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									onClick={handleAddNewAddress}
									disabled={isLoading}
									className="flex-1"
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Adding...
										</>
									) : (
										"Add Address"
									)}
								</Button>
							</div>
						</div>
					)}

					{/* Continue Button */}
					<Button
						onClick={() => setCurrentStep(2)}
						disabled={!selectedAddressId}
						className="w-full"
					>
						Continue to Payment
						<ArrowRight className="ml-2 h-4 w-4" />
					</Button>
				</CardContent>
			</Card>
		),
		[
			savedAddresses,
			selectedAddressId,
			isAddingNewAddress,
			newAddress,
			isLoading,
			handleAddressSelect,
			handleNewAddressChange,
			handleAddNewAddress,
			toggleAddNewAddress,
			setCurrentStep,
		]
	);

	// Payment Step Component
	const PaymentStep = useMemo(
		() => (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CreditCard className="h-5 w-5" />
						Payment Method
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{/* Payment Method Selection */}
					<div className="space-y-3">
						<div
							className={`p-4 border rounded-lg cursor-pointer transition-colors ${
								paymentMethod === "razorpay"
									? "border-blue-500 bg-blue-50"
									: "border-gray-200 hover:border-gray-300"
							}`}
							onClick={() => setPaymentMethod("razorpay")}
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Online Payment</p>
									<p className="text-sm text-gray-600">
										Pay securely with Razorpay
									</p>
								</div>
								<div
									className={`w-4 h-4 rounded-full border-2 ${
										paymentMethod === "razorpay"
											? "border-blue-500 bg-blue-500"
											: "border-gray-300"
									}`}
								>
									{paymentMethod === "razorpay" && (
										<div className="w-2 h-2 bg-white rounded-full m-0.5" />
									)}
								</div>
							</div>
						</div>

						<div
							className={`p-4 border rounded-lg cursor-pointer transition-colors ${
								paymentMethod === "cod"
									? "border-blue-500 bg-blue-50"
									: "border-gray-200 hover:border-gray-300"
							}`}
							onClick={() => setPaymentMethod("cod")}
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Cash on Delivery</p>
									<p className="text-sm text-gray-600">
										Pay when you receive your order
									</p>
								</div>
								<div
									className={`w-4 h-4 rounded-full border-2 ${
										paymentMethod === "cod"
											? "border-blue-500 bg-blue-500"
											: "border-gray-300"
									}`}
								>
									{paymentMethod === "cod" && (
										<div className="w-2 h-2 bg-white rounded-full m-0.5" />
									)}
								</div>
							</div>
						</div>
					</div>

					{paymentMethod === "razorpay" && (
						<div className="p-4 bg-blue-50 rounded-lg">
							<p className="text-sm text-blue-800">
								You will be redirected to Razorpay for secure payment
								processing.
							</p>
						</div>
					)}

					<div className="flex gap-3">
						<Button
							variant="outline"
							onClick={() => setCurrentStep(1)}
							className="flex-1"
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back
						</Button>
						{paymentMethod === "razorpay" && (
							<Button
								onClick={handlePayment}
								disabled={
									paymentLoading ||
									(paymentMethod === "razorpay" && !isRazorpayLoaded)
								}
								className="flex-1 bg-green-600 hover:bg-green-700"
							>
								{paymentLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									<>
										{`Pay ₹${orderSummary.total.toLocaleString()}`}
										<ArrowRight className="ml-2 h-4 w-4" />
									</>
								)}
							</Button>
						)}

						{paymentMethod === "cod" && (
							<Button
								onClick={handlePayment}
								disabled={paymentLoading}
								className="flex-1 bg-green-600 hover:bg-green-700"
							>
								{paymentLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Processing...
									</>
								) : (
									<>
										Place Order
										<ArrowRight className="ml-2 h-4 w-4" />
									</>
								)}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		),
		[
			paymentMethod,
			paymentLoading,
			isRazorpayLoaded,
			orderSummary.total,
			setPaymentMethod,
			setCurrentStep,
			handlePayment,
		]
	);

	// Order Summary Component
	const OrderSummary = useMemo(() => {
		const currentCoupon =
			checkoutType === "cart" ? cartAppliedCoupon : appliedCoupon;

		return (
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
											"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
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

					{/* Coupon Section - Only show for buyNow flow */}
					{/* {checkoutType === "buyNow" && (
						<>
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
						</>
					)} */}

					{/* Show applied cart coupon for cart flow */}
					{checkoutType === "cart" && cartAppliedCoupon && (
						<>
							<div className="p-3 bg-green-50 rounded-lg">
								<div className="flex items-center gap-2">
									<Tag className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium text-green-800">
										Coupon Applied: {cartAppliedCoupon.code}
									</span>
								</div>
								<p className="text-xs text-gray-600 mt-1">Applied from cart</p>
							</div>
							<Separator />
						</>
					)}

					{/* Price Breakdown */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span>₹{orderSummary.subtotal.toLocaleString()}</span>
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

					{/* Free shipping message */}
					{orderSummary.subtotal < 500 && (
						<div className="p-3 bg-yellow-50 rounded-lg">
							<p className="text-sm text-yellow-800">
								Add ₹{(500 - orderSummary.subtotal).toLocaleString()} more for
								free shipping!
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		);
	}, [
		orderSummary,
		appliedCoupon,
		cartAppliedCoupon,
		checkoutType,
		couponCode,
		handleApplyCoupon,
		removeCoupon,
		isLoading,
	]);

	// Don't render anything if user is not authenticated
	if (!user) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
					<p>Redirecting to login...</p>
				</div>
			</div>
		);
	}

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
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
								<p className="text-gray-600 mt-2">
									{checkoutType === "buyNow"
										? "Complete your purchase"
										: "Review your cart and complete your order"}
								</p>
							</div>
							<div className="text-right">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4" />
									<div>
										<p className="text-sm text-gray-600">Welcome back,</p>
										<p className="font-medium">{user.firstName || user.name}</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Progress Steps */}
					<div className="mb-8">
						<div className="flex items-center justify-center space-x-8">
							{[
								{ step: 1, title: "Address", icon: MapPin },
								{ step: 2, title: "Payment", icon: CreditCard },
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
							))}
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
								{currentStep === 1 && AddressStep}
								{currentStep === 2 && PaymentStep}
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
