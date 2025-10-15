"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
import { Switch } from "@/components/ui/switch";
import { toast } from "react-hot-toast";
import {
	MapPin,
	CreditCard,
	ArrowLeft,
	ArrowRight,
	Loader2,
	Tag,
	X,
	Plus,
	Home,
	Building,
	MapPinIcon,
	AlertTriangle,
	CheckCircle2,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLoggedInUser } from "@/store/authStore";
import { useProductStore } from "@/store/productStore.js";
import { useCheckoutStore } from "@/store/checkoutStore.js";
import Image from "next/image";
import { buildGstLineItems } from "@/lib/utils/gst.js";

export default function CheckoutPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
	const [couponCode, setCouponCode] = useState("");
        const [gstVerificationStatus, setGstVerificationStatus] = useState("idle");
        const [gstVerificationMessage, setGstVerificationMessage] = useState("");
        const [isVerifyingGst, setIsVerifyingGst] = useState(false);

        const WEIGHT_LIMIT_KG = 100;
        const weightLimitMessage =
                "Weight more than 100kg is not deliverable. Contact help@safetyonline.in";

	// Auth store
	const user = useLoggedInUser();

	// Store selectors
	const cartItems = useCartStore((state) => state.items);
	const cartAppliedPromo = useCartStore((state) => state.appliedPromo);
	const clearCart = useCartStore((state) => state.clearCart);
	const recommendedCoupons = useCartStore((state) => state.recommendedCoupons);
	const recommendedLoading = useCartStore((state) => state.recommendedLoading);
	const fetchRecommendedCoupons = useCartStore(
		(state) => state.fetchRecommendedCoupons
	);
	const getProductById = useProductStore((state) => state.getProductById);

	// console.log("Checkout page cartItems:", cartItems);

	// Checkout store
	const {
		checkoutType,
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
		gstInvoice,
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
	const toggleGstInvoice = useCheckoutStore((state) => state.toggleGstInvoice);
	const setGstInvoiceField = useCheckoutStore(
		(state) => state.setGstInvoiceField
	);
	const setGstInvoiceData = useCheckoutStore(
		(state) => state.setGstInvoiceData
	);
	const clearGstInvoiceDetails = useCheckoutStore(
		(state) => state.clearGstInvoiceDetails
	);
	const applyCoupon = useCheckoutStore((state) => state.applyCoupon);
	const removeCoupon = useCheckoutStore((state) => state.removeCoupon);
	const processPayment = useCheckoutStore((state) => state.processPayment);
	const getSelectedAddress = useCheckoutStore(
		(state) => state.getSelectedAddress
	);
        const fetchShippingEstimate = useCheckoutStore(
                (state) => state.fetchShippingEstimate
        );

        const totalOrderWeightKg = useMemo(() => {
                if (!orderSummary?.items?.length) {
                        return 0;
                }

                return orderSummary.items.reduce((sum, item) => {
                        const weightValue = Number(item?.weight);
                        const safeWeight = Number.isFinite(weightValue) ? weightValue : 0;
                        const quantityValue = Number(item?.quantity);
                        const safeQuantity = Number.isFinite(quantityValue) ? quantityValue : 0;
                        return sum + safeWeight * safeQuantity;
                }, 0);
        }, [orderSummary.items]);

        const formattedTotalOrderWeight = useMemo(
                () =>
                        totalOrderWeightKg.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 0,
                        }),
                [totalOrderWeightKg]
        );

        const exceedsWeightLimit = totalOrderWeightKg > WEIGHT_LIMIT_KG;

        const lastFetchedEstimateRef = useRef({
                addressId: null,
                itemsKey: "",
                status: "idle",
        });

	const itemsKey = useMemo(() => {
		if (!orderSummary.items || orderSummary.items.length === 0) {
			return "";
		}

		return orderSummary.items
			.map(
				(item) => `${item.productId || item._id || item.id}:${item.quantity}`
			)
			.join("|");
	}, [orderSummary.items]);

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

	// Fetch recommended coupons
	useEffect(() => {
		if (!recommendedLoading) {
			//&& recommendedCoupons.length === 0
			fetchRecommendedCoupons();
		}
	}, [fetchRecommendedCoupons, recommendedLoading]);

	// Initialize checkout based on URL params
	useEffect(() => {
		const initializeBuyNow = async () => {
			const buyNow = searchParams.get("buyNow");
			const productId = searchParams.get("id");
			const quantity = Number.parseInt(searchParams.get("qty") || "1");

			if (buyNow === "true" && productId) {
				// Buy Now flow
				try {
					const product = await getProductById(productId);
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

	const handleRazorpayError = useCallback(() => {
		toast.error(
			"We couldn't load Razorpay right now. Please refresh the page or choose Cash on Delivery."
		);
	}, []);

	// Check if Razorpay is already loaded
	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		if (window.Razorpay) {
			setIsRazorpayLoaded(true);
			return;
		}

		let intervalId = null;
		let timeoutId = null;

		intervalId = setInterval(() => {
			if (window.Razorpay) {
				setIsRazorpayLoaded(true);
				if (intervalId) {
					clearInterval(intervalId);
				}
				if (timeoutId) {
					clearTimeout(timeoutId);
				}
			}
		}, 300);

		timeoutId = setTimeout(() => {
			if (!window.Razorpay) {
				toast.error(
					"Razorpay is taking longer than expected to load. Please refresh or select Cash on Delivery."
				);
			}
			if (intervalId) {
				clearInterval(intervalId);
			}
		}, 10000);

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
		};
	}, []);

	// Handle address selection with automatic shipping estimate
	const handleAddressSelect = useCallback(
		(addressId) => {
			lastFetchedEstimateRef.current = {
				addressId: null,
				itemsKey: "",
				status: "idle",
			};
			selectAddress(addressId);
		},
		[selectAddress]
	);

	useEffect(() => {
		if (!selectedAddressId || !itemsKey) {
			return;
		}

		const lastFetch = lastFetchedEstimateRef.current;
		const isSameContext =
			lastFetch.addressId === selectedAddressId &&
			lastFetch.itemsKey === itemsKey;

		const hasValidEstimate =
			orderSummary.shippingEstimate &&
			orderSummary.shippingEstimate.estimatedCost !== null &&
			orderSummary.shippingEstimate.minDays !== null;

		if (isSameContext) {
			if (lastFetch.status === "pending") {
				return;
			}

			if (lastFetch.status === "failed" && !hasValidEstimate) {
				return;
			}

			if (hasValidEstimate) {
				return;
			}
		}

		const fetchEstimate = async () => {
			lastFetchedEstimateRef.current = {
				addressId: selectedAddressId,
				itemsKey,
				status: "pending",
			};

			const response = await fetchShippingEstimate();

			if (response) {
				lastFetchedEstimateRef.current = {
					addressId: selectedAddressId,
					itemsKey,
					status: "completed",
				};
			} else {
				lastFetchedEstimateRef.current = {
					addressId: selectedAddressId,
					itemsKey,
					status: "failed",
				};
			}
		};

		fetchEstimate();
	}, [
		selectedAddressId,
		itemsKey,
		orderSummary.shippingEstimate,
		fetchShippingEstimate,
	]);

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

	const handleGstToggle = useCallback(
		(checked) => {
			toggleGstInvoice(Boolean(checked));
			if (!checked) {
				setGstInvoiceField("gstin", "");
				clearGstInvoiceDetails();
				setGstVerificationStatus("idle");
				setGstVerificationMessage("");
			}
		},
		[toggleGstInvoice, setGstInvoiceField, clearGstInvoiceDetails]
	);

	const handleGstInputChange = useCallback(
		(value) => {
			const sanitized = value
				.replace(/[^0-9a-z]/gi, "")
				.toUpperCase()
				.slice(0, 15);

			setGstInvoiceField("gstin", sanitized);
			clearGstInvoiceDetails();
			setGstVerificationStatus("idle");
			setGstVerificationMessage("");
		},
		[setGstInvoiceField, clearGstInvoiceDetails]
	);

	const handleVerifyGst = useCallback(async () => {
		const gstin = (gstInvoice?.gstin || "").trim().toUpperCase();

		if (!gstInvoice?.enabled) {
			toast.error("Enable GST invoice to verify your GSTIN");
			return;
		}

		if (!/^[0-9A-Z]{15}$/.test(gstin)) {
			toast.error("Please enter a valid 15-character GSTIN");
			setGstVerificationStatus("error");
			setGstVerificationMessage(
				"GSTIN must be 15 characters (numbers and uppercase letters)."
			);
			return;
		}

		setIsVerifyingGst(true);
		setGstVerificationStatus("verifying");
		setGstVerificationMessage("");

		try {
			const response = await fetch("/api/gst/lookup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ gstin }),
			});

			const data = await response.json();

			if (!response.ok || !data?.success) {
				throw new Error(data?.error || "Failed to verify GSTIN");
			}

			const payload = data?.data || {};

			setGstInvoiceData({
				gstin,
				legalName: payload.legalName || "",
				tradeName: payload.tradeName || "",
				state: payload.state || payload?.address?.state || "",
				address: payload?.address?.fullAddress || "",
				lastVerifiedAt: new Date().toISOString(),
			});

			setGstVerificationStatus("success");
			setGstVerificationMessage(
				payload.status ? `GST Registration Status: ${payload.status}` : ""
			);
			toast.success("GSTIN verified successfully");
		} catch (error) {
			console.error("GST verification failed:", error);
			clearGstInvoiceDetails();
			setGstVerificationStatus("error");
			setGstVerificationMessage(
				error?.message || "Failed to verify GSTIN. Please try again."
			);
			toast.error(error?.message || "Failed to verify GSTIN");
		} finally {
			setIsVerifyingGst(false);
		}
	}, [
		gstInvoice?.gstin,
		gstInvoice?.enabled,
		setGstInvoiceData,
		clearGstInvoiceDetails,
	]);

	// Handle coupon application (only for buyNow flow)
	const handleApplyCoupon = useCallback(
		async (codeOverride) => {
			if (checkoutType === "cart") {
				toast.error("Coupon is already applied from cart");
				return;
			}

			const codeToApply = (codeOverride || couponCode).trim();

			if (!codeToApply) {
				toast.error("Please enter a coupon code");
				return;
			}

			const success = await applyCoupon(codeToApply);
			if (success) {
				setCouponCode("");
			}
		},
		[couponCode, applyCoupon, checkoutType]
	);

	// Handle payment
	const handlePayment = useCallback(async () => {
		if (!isRazorpayLoaded && paymentMethod === "razorpay") {
			toast.error("Payment system is loading. Please wait.");
			return;
		}

		if (orderSummary.total > 49999) {
			toast.error("Payments greater than Rs.49999 is not allowed as COD.");
			return;
		}

                if (!getSelectedAddress()) {
                        toast.error("Please select a delivery address");
                        return;
                }

                if (exceedsWeightLimit) {
                        toast.error(weightLimitMessage);
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
                paymentMethod,
                processPayment,
                user,
                checkoutType,
                clearCart,
                getSelectedAddress,
                exceedsWeightLimit,
                weightLimitMessage,
        ]);

	// Address Step Component
	const AddressStep = useMemo(
		() => (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<MapPin className="h-5 w-5" />
						Shipping Address
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						<div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
							<div>
								<p className="font-medium text-gray-900">GST Invoice</p>
								<p className="text-sm text-gray-600">
									Need a business invoice? Add your GSTIN to get a GST-compliant
									bill.
								</p>
							</div>
							<div className="flex items-center gap-2">
								<Switch
									id="gst-invoice-toggle"
									checked={Boolean(gstInvoice?.enabled)}
									onCheckedChange={handleGstToggle}
									aria-label="Toggle GST invoice"
								/>
							</div>
						</div>

						{gstInvoice?.enabled && (
							<div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/60 p-4">
								<div>
									<Label htmlFor="gstinNumber">GSTIN</Label>
									<Input
										id="gstinNumber"
										value={gstInvoice?.gstin || ""}
										onChange={(event) =>
											handleGstInputChange(event.target.value)
										}
										placeholder="15-character GSTIN"
										maxLength={15}
										autoCapitalize="characters"
										autoComplete="off"
										spellCheck={false}
									/>
									<p className="mt-1 text-xs text-gray-600">
										We validate your GSTIN via the RPACPC GST registry to ensure
										invoices are compliant.
									</p>
								</div>

								<div className="flex flex-wrap items-center gap-3">
									<Button
										type="button"
										onClick={handleVerifyGst}
										disabled={
											isVerifyingGst ||
											!gstInvoice?.gstin ||
											gstInvoice.gstin.length !== 15
										}
									>
										{isVerifyingGst ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Verifying
											</>
										) : (
											"Verify GSTIN"
										)}
									</Button>
									{gstInvoice?.lastVerifiedAt &&
										gstVerificationStatus === "success" && (
											<span className="text-xs text-gray-500">
												Last verified{" "}
												{new Date(gstInvoice.lastVerifiedAt).toLocaleString(
													"en-IN"
												)}
											</span>
										)}
								</div>

								{gstVerificationStatus === "success" && (
									<div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3">
										<CheckCircle2 className="h-5 w-5 text-green-600" />
										<div className="text-sm text-green-800">
											<p className="font-medium">GSTIN verified</p>
											{gstInvoice?.legalName && (
												<p className="mt-1 text-sm">
													Registered Name: {gstInvoice.legalName}
												</p>
											)}
											{gstInvoice?.tradeName && (
												<p className="text-sm">
													Trade Name: {gstInvoice.tradeName}
												</p>
											)}
											{gstInvoice?.address && (
												<p className="mt-1 text-xs text-green-700">
													{gstInvoice.address}
												</p>
											)}
											{gstVerificationMessage && (
												<p className="mt-1 text-xs text-green-700">
													{gstVerificationMessage}
												</p>
											)}
										</div>
									</div>
								)}

								{gstVerificationStatus === "success" && (
									<p className="text-xs text-gray-600">
										Future invoices for this order will include the verified
										GSTIN details.
									</p>
								)}

								{gstVerificationStatus === "error" && (
									<div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
										<AlertTriangle className="h-5 w-5 text-red-600" />
										<div className="text-sm text-red-700">
											<p className="font-medium">GST verification failed</p>
											<p className="mt-1 text-xs sm:text-sm">
												{gstVerificationMessage}
											</p>
										</div>
									</div>
								)}

								{gstVerificationStatus === "verifying" && (
									<p className="text-xs text-blue-700">
										Verifying your GSTIN with the RPACPC registry...
									</p>
								)}

								{gstVerificationStatus === "idle" && (
									<p className="text-xs text-gray-500">
										Invoice copies will include this GSTIN once verified.
									</p>
								)}
							</div>
						)}
					</div>

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

							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="addressTag">Address Tag</Label>
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
			gstInvoice,
			handleGstToggle,
			handleGstInputChange,
			handleVerifyGst,
			isVerifyingGst,
			gstVerificationStatus,
			gstVerificationMessage,
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
                                                <>
                                                        <div className="p-4 bg-blue-50 rounded-lg">
                                                                <p className="text-sm text-blue-800">
                                                                        You will be redirected to Razorpay for secure payment
                                                                        processing.
                                                                </p>
                                                        </div>
                                                        {!isRazorpayLoaded && (
                                                                <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                                                        Initializing Razorpay checkout... Please wait a moment.
                                                                </p>
                                                        )}
                                                </>
                                        )}

                                        {exceedsWeightLimit && (
                                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                        {weightLimitMessage}
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
                                                                        exceedsWeightLimit ||
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
                                                                disabled={paymentLoading || exceedsWeightLimit}
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
                        exceedsWeightLimit,
                        weightLimitMessage,
                ]
        );

	// Order Summary Component
	const OrderSummary = useMemo(() => {
		const currentCoupon =
			checkoutType === "cart" ? cartAppliedCoupon : appliedCoupon;

		const couponDiscountAmount = currentCoupon
			? currentCoupon.discountAmount ||
			  Math.round(
					(orderSummary.subtotal * (currentCoupon.discount || 0)) / 100
			  )
			: 0;

		const couponDiscountPercent =
			currentCoupon?.discount ??
			(orderSummary.subtotal > 0
				? Math.round((couponDiscountAmount / orderSummary.subtotal) * 100)
				: 0);

		const gstLines = buildGstLineItems(orderSummary.gst);

		// console.log("orderSummary", orderSummary);

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
					<div className="flex justify-between text-sm">
						<span className="font-medium text-sm">Estimated Delivery</span>
						<span>{orderSummary.edd || "Please again address"}</span>
					</div>
					<Separator />

					{/* Coupon Section - Only for Buy Now */}
					{checkoutType === "buyNow" && (
						<>
							<div className="space-y-3">
								{appliedCoupon ? (
									<div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
										<div>
											<div className="flex items-center gap-2">
												<Tag className="h-4 w-4 text-green-600" />
												<span className="text-sm font-medium text-green-800">
													{appliedCoupon.code}
												</span>
												{couponDiscountPercent > 0 && (
													<Badge className="bg-green-100 text-green-700">
														{couponDiscountPercent}% OFF
													</Badge>
												)}
											</div>
											{couponDiscountAmount > 0 && (
												<p className="text-xs text-green-700 mt-1">
													You saved ₹{couponDiscountAmount.toLocaleString()}
												</p>
											)}
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={removeCoupon}
											className="text-red-600 hover:text-red-700"
											disabled={isLoading}
										>
											<X className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<>
										<div className="flex gap-2">
											<Input
												name="couponCode"
												placeholder="Enter coupon code"
												value={couponCode}
												onChange={(e) => setCouponCode(e.target.value)}
												className="flex-1"
												disabled={isLoading}
											/>
											<Button
												variant="outline"
												onClick={() => handleApplyCoupon()}
												disabled={isLoading || !couponCode.trim()}
											>
												{isLoading ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													"Apply"
												)}
											</Button>
										</div>
										<p className="text-xs text-gray-500">
											Have a coupon? Enter it above or choose one from the list
											below.
										</p>
									</>
								)}

								{/* Recommended Coupons */}
								<div className="space-y-2">
									<div className="flex items-center justify-between">
										<p className="text-sm font-medium text-gray-700">
											Recommended Coupons
										</p>
										{recommendedLoading && (
											<span className="text-xs text-gray-500">Loading...</span>
										)}
									</div>
									{!recommendedLoading && recommendedCoupons.length === 0 && (
										<p className="text-xs text-gray-500">
											No active coupons are available at the moment.
										</p>
									)}
									<div className="space-y-2">
										{recommendedCoupons.map((coupon) => {
											const isApplied = appliedCoupon?.code === coupon.code;
											const expiryLabel = coupon.endDate
												? new Date(coupon.endDate).toLocaleDateString("en-IN", {
														month: "short",
														day: "numeric",
														year: "numeric",
												  })
												: null;

											return (
												<div
													key={coupon._id}
													className="flex items-center justify-between rounded-lg border border-dashed border-gray-200 p-3"
												>
													<div>
														<div className="flex items-center gap-2">
															<span className="font-semibold tracking-wide text-sm">
																{coupon.code}
															</span>
															<Badge variant="secondary" className="text-xs">
																{coupon.discount}% OFF
															</Badge>
														</div>
														{coupon.name && (
															<p className="text-xs text-gray-600 mt-1">
																{coupon.name}
															</p>
														)}
														{expiryLabel && (
															<p className="text-xs text-gray-400">
																Valid till {expiryLabel}
															</p>
														)}
													</div>
													<Button
														variant={isApplied ? "secondary" : "outline"}
														size="sm"
														disabled={isLoading || isApplied}
														onClick={() => handleApplyCoupon(coupon.code)}
													>
														{isApplied ? "Applied" : "Apply"}
													</Button>
												</div>
											);
										})}
									</div>
								</div>
							</div>
							<Separator />
						</>
					)}

					{/* Show applied cart coupon for cart flow */}
					{checkoutType === "cart" && cartAppliedCoupon && (
						<>
							<div className="p-3 bg-green-50 rounded-lg space-y-1">
								<div className="flex items-center gap-2">
									<Tag className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium text-green-800">
										{cartAppliedCoupon.code}
									</span>
									{couponDiscountPercent > 0 && (
										<Badge className="bg-green-100 text-green-700">
											{couponDiscountPercent}% OFF
										</Badge>
									)}
								</div>
								{couponDiscountAmount > 0 && (
									<p className="text-xs text-green-700">
										You saved ₹{couponDiscountAmount.toLocaleString()}
									</p>
								)}
								<p className="text-xs text-gray-600">Applied from cart</p>
							</div>
							<Separator />
						</>
					)}

                                        {/* Price Breakdown */}
                                        <div className="space-y-2">
                                                {totalOrderWeightKg > 0 && (
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                                <span>Total Weight</span>
                                                                <span>{formattedTotalOrderWeight} kg</span>
                                                        </div>
                                                )}
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
								<span className="flex items-center gap-2">
									Discount
									{currentCoupon?.code && (
										<Badge className="bg-green-100 text-green-700">
											{currentCoupon.code}
										</Badge>
									)}
								</span>
								<span>-₹{orderSummary.discount.toLocaleString()}</span>
							</div>
						)}
						{gstLines.map((line) => (
							<div className="flex justify-between" key={line.key}>
								<span>{line.label}</span>
								<span>₹{line.amount.toLocaleString()}</span>
							</div>
						))}
						<Separator />
						<div className="flex justify-between font-bold text-lg">
							<span>Total</span>
							<span>₹{orderSummary.total.toLocaleString()}</span>
						</div>
                                                {gstLines.length > 0 && (
                                                        <p className="text-xs text-gray-500">
                                                                {orderSummary.gst?.mode === "cgst_sgst"
                                                                        ? "CGST & SGST applied for Bengaluru deliveries"
                                                                        : "IGST applied for this delivery"}
                                                        </p>
                                                )}
                                        </div>

                                        {exceedsWeightLimit && (
                                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                                        {weightLimitMessage}
                                                </div>
                                        )}

                                        {/* Free shipping message */}
                                        {/* {orderSummary.subtotal < 500 && (
                                                <div className="p-3 bg-yellow-50 rounded-lg">
                                                        <p className="text-sm text-yellow-800">
								Add ₹{(500 - orderSummary.subtotal).toLocaleString()} more for
								free shipping!
							</p>
						</div>
					)} */}
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
                recommendedCoupons,
                recommendedLoading,
                totalOrderWeightKg,
                exceedsWeightLimit,
                weightLimitMessage,
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
				strategy="afterInteractive"
				onLoad={handleRazorpayLoad}
				onReady={handleRazorpayLoad}
				onError={handleRazorpayError}
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
