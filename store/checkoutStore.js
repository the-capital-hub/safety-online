"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";

export const useCheckoutStore = create(
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
			currentStep: 1, // 1: Info, 2: Address, 3: Payment

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

				const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
				const tax = Math.round(subtotal * 0.18); // 18% GST
				const shippingCost = subtotal > 500 ? 0 : 0; // Free shipping above Rs. 500, but for testing purposes, set to Rs. 0 for simplicity will update this later to Rs. 50
				const discount = get().appliedCoupon?.discountAmount || 0;
				const total = subtotal + tax + shippingCost - discount;

				set({
					orderSummary: {
						items,
						subtotal,
						tax,
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
					const response = await fetch("/api/coupons/validate", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							code: couponCode,
							orderAmount: get().orderSummary.subtotal,
						}),
					});

					const data = await response.json();

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

			// Create Razorpay order
			createRazorpayOrder: async () => {
				const { orderSummary } = get();

				try {
					const response = await fetch("/api/razorpay", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							amount: orderSummary.total,
							currency: "INR",
							receipt: `order_${Date.now()}`,
						}),
					});

					const data = await response.json();

					if (data.success) {
						return data.order;
					} else {
						throw new Error(data.error);
					}
				} catch (error) {
					console.error("Failed to create Razorpay order:", error);
					throw error;
				}
			},

			// Process payment
			processPayment: async (userId) => {
				const {
					customerInfo,
					deliveryAddress,
					orderSummary,
					appliedCoupon,
					checkoutType,
				} = get();

				try {
					set({ isLoading: true });

					// Create Razorpay order
					const razorpayOrder = await get().createRazorpayOrder();

					return new Promise((resolve, reject) => {
						const options = {
							key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
							amount: razorpayOrder.amount,
							currency: "INR",
							name: "Your Store",
							description: "Order Payment",
							order_id: razorpayOrder.id,
							handler: async (response) => {
								try {
									// Prepare order data
									const orderData = {
										userId,
										customerName: customerInfo.name,
										customerEmail: customerInfo.email,
										customerMobile: customerInfo.mobile,
										products: orderSummary.items,
										subtotal: orderSummary.subtotal,
										tax: orderSummary.tax,
										shippingCost: orderSummary.shippingCost,
										discount: orderSummary.discount,
										totalAmount: orderSummary.total,
										paymentMethod: "razorpay",
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

									// Verify payment
									// const verifyResponse = await fetch("/api/paymentverify", {
									// 	method: "POST",
									// 	headers: { "Content-Type": "application/json" },
									// 	body: JSON.stringify({
									// 		...response,
									// 		orderData,
									// 		userId,
									// 		clearCart: checkoutType === "cart",
									// 	}),
									// });

									// const verifyData = await verifyResponse.json();

									// if (verifyData.success) {
									// 	resolve({
									// 		success: true,
									// 		orderId: verifyData.orderId,
									// 		orderNumber: verifyData.orderNumber,
									// 	});
									// } else {
									// 	reject(new Error(verifyData.error));
									// }

									resolve({
										success: true,
										orderId: razorpayOrder.id,
										orderNumber: razorpayOrder.receipt,
									});
								} catch (error) {
									reject(error);
								}
							},
							prefill: {
								name: customerInfo.name,
								email: customerInfo.email,
								contact: customerInfo.mobile,
							},
							theme: {
								color: "#3399cc",
							},
							modal: {
								ondismiss: () => {
									reject(new Error("Payment cancelled by user"));
								},
							},
						};

						const rzp = new window.Razorpay(options);
						rzp.open();
					});
				} catch (error) {
					console.error("Payment processing error:", error);
					throw error;
				} finally {
					set({ isLoading: false });
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
						shippingCost: 50,
						discount: 0,
						total: 0,
					},
					appliedCoupon: null,
					currentStep: 1,
				});
			},
		}),
		{
			name: "checkout-storage",
			partialize: (state) => ({
				customerInfo: state.customerInfo,
				deliveryAddress: state.deliveryAddress,
			}),
		}
	)
);
