"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { toast } from "react-hot-toast";

// Payment API functions
const paymentAPI = {
	async createRazorpayOrder(orderData) {
		const response = await fetch("/api/razorpay", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(orderData),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to create payment order");
		}
		return response.json();
	},

	async verifyPayment(paymentData) {
		const response = await fetch("/api/paymentverify", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(paymentData),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Payment verification failed");
		}
		return response.json();
	},

	async createOrder(orderData) {
		const response = await fetch("/api/orders", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(orderData),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to create order");
		}
		return response.json();
	},

	async validateCoupon(couponCode, orderAmount) {
		const response = await fetch("/api/coupons/validate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code: couponCode, orderAmount }),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to validate coupon");
		}
		return response.json();
	},
};

export const useCheckoutStore = create(
	devtools(
		persist(
			(set, get) => ({
				// State
				checkoutType: "cart", // 'cart' or 'buyNow'
				buyNowProduct: null,
				buyNowQuantity: 1,

				// Customer Information
				customerInfo: {
					name: "",
					email: "",
					mobile: "",
				},

				// Delivery Address
				deliveryAddress: {
					street: "",
					city: "",
					state: "",
					zipCode: "",
					country: "India",
					fullAddress: "",
				},

				// Order Summary
				orderSummary: {
					items: [],
					subtotal: 0,
					tax: 0,
					shippingCost: 50,
					discount: 0,
					total: 0,
				},

				// Applied Coupon
				appliedCoupon: null,

				// UI State
				isLoading: false,
				paymentLoading: false,
				currentStep: 1, // 1: Info, 2: Address, 3: Payment
				paymentMethod: "razorpay", // 'razorpay' or 'cod'

				// Actions
				setCheckoutType: (type, product = null, quantity = 1) => {
					set({
						checkoutType: type,
						buyNowProduct: product,
						buyNowQuantity: quantity,
					});
				},

				setCustomerInfo: (info) => {
					set((state) => ({
						customerInfo: { ...state.customerInfo, ...info },
					}));
				},

				setDeliveryAddress: (address) => {
					set((state) => ({
						deliveryAddress: { ...state.deliveryAddress, ...address },
					}));
				},

				setCurrentStep: (step) => {
					set({ currentStep: step });
				},

				setPaymentMethod: (method) => {
					set({ paymentMethod: method });
				},

				// Initialize checkout data
				initializeCheckout: (cartItems = [], product = null, quantity = 1) => {
					const { checkoutType } = get();

					let items = [];

					if (checkoutType === "buyNow" && product) {
						items = [
							{
								productId: product.id,
								productName: product.name,
								productImage: product.image,
								quantity: quantity,
								price: product.price,
								totalPrice: product.price * quantity,
							},
						];
					} else {
						items = cartItems.map((item) => ({
							productId: item.id,
							productName: item.name,
							productImage: item.image,
							quantity: item.quantity,
							price: item.price,
							totalPrice: item.price * item.quantity,
						}));
					}

					const subtotal = items.reduce(
						(sum, item) => sum + item.totalPrice,
						0
					);
					// const tax = Math.round(subtotal * 0.18); // 18% GST
					const shippingCost = subtotal > 500 ? 0 : 0; // Free shipping above Rs. 500, but for testing purposes, set to Rs. 0 for simplicity will update this later to Rs. 50
					const discount = get().appliedCoupon?.discountAmount || 0;
					const total = subtotal + shippingCost - discount; // total = subtotal + tax + shippingCost - discount

					set({
						orderSummary: {
							items,
							subtotal,
							// tax,
							shippingCost,
							discount,
							total,
						},
					});
				},

				// Apply coupon
				applyCoupon: async (couponCode) => {
					set({ isLoading: true });

					try {
						const data = await paymentAPI.validateCoupon(
							couponCode,
							get().orderSummary.subtotal
						);

						if (data.success) {
							set({ appliedCoupon: data.coupon });
							get().recalculateTotal();
							toast.success("Coupon applied successfully!");
							return true;
						} else {
							toast.error(data.message || "Invalid coupon code");
							return false;
						}
					} catch (error) {
						toast.error("Failed to apply coupon");
						return false;
					} finally {
						set({ isLoading: false });
					}
				},

				// Remove coupon
				removeCoupon: () => {
					set({ appliedCoupon: null });
					get().recalculateTotal();
					toast.success("Coupon removed");
				},

				// Recalculate total
				recalculateTotal: () => {
					const { orderSummary, appliedCoupon } = get();
					const discount = appliedCoupon?.discountAmount || 0;
					const total =
						orderSummary.subtotal +
						orderSummary.tax +
						orderSummary.shippingCost -
						discount;

					set({
						orderSummary: {
							...orderSummary,
							discount,
							total,
						},
					});
				},

				// Process payment
				processPayment: async (userId, clearCartCallback = null) => {
					const {
						customerInfo,
						deliveryAddress,
						orderSummary,
						appliedCoupon,
						checkoutType,
						paymentMethod,
					} = get();

					if (orderSummary.items.length === 0) {
						toast.error("No items to checkout");
						return { success: false, error: "No items to checkout" };
					}

					set({ paymentLoading: true });

					try {
						// Prepare order data
						const orderData = {
							userId: userId,
							customerName: customerInfo.name,
							customerEmail: customerInfo.email,
							customerMobile: customerInfo.mobile,
							products: orderSummary.items,
							subtotal: orderSummary.subtotal,
							tax: orderSummary.tax,
							shippingCost: orderSummary.shippingCost,
							discount: orderSummary.discount,
							totalAmount: orderSummary.total,
							paymentMethod: paymentMethod,
							deliveryAddress: {
								...deliveryAddress,
								fullAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state} - ${deliveryAddress.zipCode}`,
							},
							couponApplied: appliedCoupon
								? {
										couponCode: appliedCoupon.code,
										discountAmount: appliedCoupon.discountAmount,
										discountType: appliedCoupon.discountType,
								  }
								: null,
						};

						if (paymentMethod === "razorpay") {
							// Create Razorpay order
							const razorpayOrder = await paymentAPI.createRazorpayOrder({
								amount: orderSummary.total,
								currency: "INR",
								receipt: `order_${Date.now()}`,
							});

							// Initialize Razorpay payment
							const options = {
								key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
								amount: razorpayOrder.amount,
								currency: razorpayOrder.currency,
								name: "Safety Online",
								description: "Order Payment",
								order_id: razorpayOrder.id,
								handler: async function (response) {
									try {
										// Verify payment
										const verificationData = {
											razorpay_order_id: response.razorpay_order_id,
											razorpay_payment_id: response.razorpay_payment_id,
											razorpay_signature: response.razorpay_signature,
											orderData,
											userId: userId,
											clearCart: checkoutType === "cart",
										};

										const verificationResult = await paymentAPI.verifyPayment(
											verificationData
										);

										if (verificationResult.success) {
											// Clear cart if it was a cart checkout
											if (checkoutType === "cart" && clearCartCallback) {
												clearCartCallback();
											}

											// Reset checkout
											get().resetCheckout();

											toast.success("Payment successful! Order placed.");

											// Redirect to success page
											window.location.href = `/order-success?orderId=${verificationResult.orderId}&orderNumber=${verificationResult.orderNumber}`;
										} else {
											toast.error("Payment verification failed");
										}
									} catch (error) {
										console.error("Payment verification error:", error);
										toast.error("Payment verification failed");
									} finally {
										set({ paymentLoading: false });
									}
								},
								prefill: {
									name: customerInfo.name,
									email: customerInfo.email,
									contact: customerInfo.mobile,
								},
								theme: {
									color: "#000000",
								},
								modal: {
									ondismiss: function () {
										set({ paymentLoading: false });
										toast.error("Payment cancelled");
									},
								},
							};

							const razorpay = new window.Razorpay(options);
							razorpay.open();

							return { success: true, paymentMethod: "razorpay" };
						} else if (paymentMethod === "cod") {
							// Handle Cash on Delivery
							const codOrderData = {
								orderData: {
									...orderData,
									paymentStatus: "pending",
									status: "confirmed",
								},
								userId: userId,
								clearCart: checkoutType === "cart",
							};

							const result = await paymentAPI.createOrder(codOrderData);

							if (result.success) {
								// Clear cart if it was a cart checkout
								if (checkoutType === "cart" && clearCartCallback) {
									clearCartCallback();
								}

								// Reset checkout
								get().resetCheckout();

								toast.success("Order placed successfully!");

								// Redirect to success page
								window.location.href = `/order-success?orderId=${result.orderId}&orderNumber=${result.orderNumber}`;

								return { success: true, paymentMethod: "cod" };
							} else {
								toast.error("Failed to place order");
								return { success: false, error: result.error };
							}
						}
					} catch (error) {
						console.error("Payment processing error:", error);
						toast.error("Payment processing failed");
						return { success: false, error: error.message };
					} finally {
						set({ paymentLoading: false });
					}
				},

				// Reset checkout
				resetCheckout: () => {
					set({
						checkoutType: "cart",
						buyNowProduct: null,
						buyNowQuantity: 1,
						customerInfo: { name: "", email: "", mobile: "" },
						deliveryAddress: {
							street: "",
							city: "",
							state: "",
							zipCode: "",
							country: "India",
							fullAddress: "",
						},
						orderSummary: {
							items: [],
							subtotal: 0,
							tax: 0,
							shippingCost: 50, // Default shipping cost/ delivery fee in INR - need to check
							discount: 0,
							total: 0,
						},
						appliedCoupon: null,
						currentStep: 1,
						paymentMethod: "razorpay",
						paymentLoading: false,
					});
				},

				// Validate checkout data
				validateCheckoutData: () => {
					const { customerInfo, deliveryAddress, orderSummary } = get();
					const errors = [];

					// Validate customer info
					if (!customerInfo.name.trim())
						errors.push("Customer name is required");
					if (!customerInfo.email.trim()) errors.push("Email is required");
					if (!customerInfo.mobile.trim())
						errors.push("Mobile number is required");

					// Validate delivery address
					if (!deliveryAddress.street.trim())
						errors.push("Street address is required");
					if (!deliveryAddress.city.trim()) errors.push("City is required");
					if (!deliveryAddress.state.trim()) errors.push("State is required");
					if (!deliveryAddress.zipCode.trim())
						errors.push("ZIP code is required");

					// Validate order items
					if (orderSummary.items.length === 0) errors.push("No items in order");

					return {
						isValid: errors.length === 0,
						errors,
					};
				},

				// Get checkout summary
				getCheckoutSummary: () => {
					const { orderSummary, appliedCoupon, paymentMethod } = get();
					return {
						itemCount: orderSummary.items.reduce(
							(sum, item) => sum + item.quantity,
							0
						),
						uniqueItems: orderSummary.items.length,
						...orderSummary,
						hasPromo: !!appliedCoupon,
						promoCode: appliedCoupon?.code,
						paymentMethod,
					};
				},
			}),
			{
				name: "checkout-storage",
				partialize: (state) => ({
					customerInfo: state.customerInfo,
					deliveryAddress: state.deliveryAddress,
					paymentMethod: state.paymentMethod,
				}),
			}
		)
	)
);
