"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { generateInvoicePDFAsBase64 } from "@/lib/invoicePDF.js";
import { calculateGstTotals, GST_RATE_PERCENT } from "@/lib/utils/gst.js";
import {
	calculateShippingParams,
	validateShippingParams,
} from "@/lib/shipping/shippingCalculator.js";

// Payment API functions
const paymentAPI = {
	async createRazorpayOrder(orderData) {
		const response = await fetch("/api/razorpay", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
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
			credentials: "include",
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
			credentials: "include",
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
			credentials: "include",
			body: JSON.stringify({ code: couponCode, orderAmount }),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to validate coupon");
		}
		return response.json();
	},

	async getUserAddresses() {
		const response = await fetch("/api/user/addresses", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to fetch addresses");
		}
		return response.json();
	},

	async addUserAddress(addressData) {
		const response = await fetch("/api/user/addresses", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(addressData),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to add address");
		}
		return response.json();
	},

	async sendOrderConfirmation(orderData, userId, pdfBase64 = null) {
		const response = await fetch("/api/orders/send-confirmation", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ orderData, userId, pdfBase64 }), // Include pdfBase64
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to send confirmation email");
		}
		return response.json();
	},

	async getShippingEstimate(params) {
		const response = await fetch("/api/hexalog/shipping-estimate", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify(params),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to get shipping estimate");
		}
		return response.json();
	},
};

// Helper function to generate PDF client-side
const generateClientSidePDF = async (orderData) => {
	try {
		return await generateInvoicePDFAsBase64(orderData);
	} catch (error) {
		console.error("Client-side PDF generation failed:", error);
		return null;
	}
};

export const useCheckoutStore = create(
	devtools(
		persist(
			(set, get) => ({
				// State
				checkoutType: "cart", // 'cart' or 'buyNow'
				buyNowProduct: null,
				buyNowQuantity: 1,

				// Customer Information (auto-filled from user)
                                customerInfo: {
                                        name: "",
                                        email: "",
                                        mobile: "",
                                },

                                // Optional GST invoice details for buyers
                                gstInvoice: {
                                        enabled: false,
                                        gstin: "",
                                        legalName: "",
                                        tradeName: "",
                                        state: "",
                                        address: "",
                                        lastVerifiedAt: null,
                                },

				// Delivery Address Management
				savedAddresses: [],
				selectedAddressId: null,
				newAddress: {
					tag: "home",
					name: "",
					street: "",
					city: "",
					state: "",
					zipCode: "",
					country: "India",
					isDefault: false,
				},
				isAddingNewAddress: false,

				// Order Summary
				orderSummary: {
					items: [],
					subtotal: 0,
					shippingCost: 0,
					discount: 0,
					total: 0,
					taxableAmount: 0,
					gst: {
						mode: "igst",
						rate: GST_RATE_PERCENT,
						cgst: 0,
						sgst: 0,
						igst: 0,
						total: 0,
						taxableAmount: 0,
					},
					shippingEstimate: {
						minDays: null,
						maxDays: null,
						estimatedCost: null,
						estimatedTax: null,
						estimatedTotal: null,
					},
					edd: "N/A", // Estimated Delivery Date
				},

				// Applied Coupon (only for buyNow flow)
				appliedCoupon: null,
				cartAppliedCoupon: null, // For cart flow

				// UI State
				isLoading: false,
				paymentLoading: false,
				currentStep: 1, // 1: Address, 2: Payment
				paymentMethod: "razorpay", // "razorpay", "cod", "credit_card","debit_card", "net_banking", "upi", "wallet"

				// Actions
				setCheckoutType: (type, product = null, quantity = 1) => {
					set({
						checkoutType: type,
						buyNowProduct: product,
						buyNowQuantity: quantity,
						currentStep: 1,
					});
				},

                                setCustomerInfo: (info) => {
                                        set((state) => ({
                                                customerInfo: { ...state.customerInfo, ...info },
                                        }));
                                },

                                toggleGstInvoice: (enabled) => {
                                        set((state) => ({
                                                gstInvoice: enabled
                                                        ? { ...state.gstInvoice, enabled }
                                                        : {
                                                                  enabled: false,
                                                                  gstin: "",
                                                                  legalName: "",
                                                                  tradeName: "",
                                                                  state: "",
                                                                  address: "",
                                                                  lastVerifiedAt: null,
                                                          },
                                        }));
                                },

                                setGstInvoiceField: (field, value) => {
                                        set((state) => ({
                                                gstInvoice: {
                                                        ...state.gstInvoice,
                                                        [field]: value,
                                                },
                                        }));
                                },

                                setGstInvoiceData: (data) => {
                                        set((state) => ({
                                                gstInvoice: {
                                                        ...state.gstInvoice,
                                                        ...data,
                                                },
                                        }));
                                },

                                clearGstInvoiceDetails: () => {
                                        set((state) => ({
                                                gstInvoice: {
                                                        ...state.gstInvoice,
                                                        legalName: "",
                                                        tradeName: "",
                                                        state: "",
                                                        address: "",
                                                        lastVerifiedAt: null,
                                                },
                                        }));
                                },

				setCurrentStep: (step) => {
					set({ currentStep: step });
				},

				setPaymentMethod: (method) => {
					set({ paymentMethod: method });
				},

				// Initialize checkout data
				initializeCheckout: (
					cartItems = [],
					product = null,
					quantity = 1,
					cartCoupon = null
				) => {
					const { checkoutType } = get();

					let items = [];

					if (checkoutType === "buyNow" && product) {
						items = [
							{
								productId: product.id,
								productName: product.name || product.title,
								productImage: product.image,
								quantity: quantity,
								price: product.price,
								totalPrice: product.price * quantity,
								length: product.length || null,
								width: product.width || null,
								height: product.height || null,
								weight: product.weight || null,
								size: product.size || null,
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
							length: product.length || null,
							width: product.width || null,
							height: product.height || null,
							weight: product.weight || null,
							size: product.size || null,
						}));
					}

					const subtotal = items.reduce(
						(sum, item) => sum + item.totalPrice,
						0
					);

					const shippingCost = 0; // Default, will be updated by estimate

					// Set coupon based on checkout type
					let discount = 0;
					if (checkoutType === "cart" && cartCoupon) {
						set({ cartAppliedCoupon: cartCoupon });
						discount =
							cartCoupon.discountAmount ||
							(subtotal * cartCoupon.discount) / 100;
					} else if (checkoutType === "buyNow") {
						const appliedCoupon = get().appliedCoupon;
						discount = appliedCoupon?.discountAmount || 0;
					}

					const { savedAddresses, selectedAddressId } = get();
					const selectedAddress = savedAddresses.find(
						(addr) => addr._id === selectedAddressId
					);

					const totals = calculateGstTotals({
						subtotal,
						discount,
						shippingCost,
						address: selectedAddress,
					});

					set({
						orderSummary: {
							items,
							subtotal: totals.subtotal,
							shippingCost: totals.shippingCost,
							discount: totals.discount,
							total: totals.total,
							taxableAmount: totals.taxableAmount,
							gst: totals.gst,
						},
					});
				},

				// Load user addresses
				loadUserAddresses: async () => {
					set({ isLoading: true });
					try {
						const data = await paymentAPI.getUserAddresses();
						if (data.success) {
							set({ savedAddresses: data.addresses });

							// Auto-select default address if available
							const defaultAddress = data.addresses.find(
								(addr) => addr.isDefault
							);
							if (defaultAddress) {
								set({ selectedAddressId: defaultAddress._id });
							}
						}
					} catch (error) {
						console.error("Failed to load addresses:", error);
						toast.error("Failed to load saved addresses");
					} finally {
						set({ isLoading: false });
					}
				},

				// Add new address
				addNewAddress: async () => {
					const { newAddress } = get();

					if (
						!newAddress.name ||
						!newAddress.street ||
						!newAddress.city ||
						!newAddress.state ||
						!newAddress.zipCode
					) {
						toast.error("Please fill all address fields");
						return false;
					}

					set({ isLoading: true });
					try {
						const data = await paymentAPI.addUserAddress(newAddress);
						if (data.success) {
							// Reload addresses
							await get().loadUserAddresses();

							// Reset new address form
							set({
								newAddress: {
									tag: "home",
									name: "",
									street: "",
									city: "",
									state: "",
									zipCode: "",
									country: "India",
									isDefault: false,
								},
								isAddingNewAddress: false,
							});

							toast.success("Address added successfully");
							return true;
						}
					} catch (error) {
						console.error("Failed to add address:", error);
						toast.error(error.message || "Failed to add address");
					} finally {
						set({ isLoading: false });
					}
					return false;
				},

				// Update new address form
				updateNewAddress: (field, value) => {
					set((state) => ({
						newAddress: { ...state.newAddress, [field]: value },
					}));
				},

				// Select address
				selectAddress: (addressId) => {
					set((state) => ({
						selectedAddressId: addressId,
						orderSummary: {
							...state.orderSummary,
							shippingCost: 0,
							shippingEstimate: {
								minDays: null,
								maxDays: null,
								estimatedCost: null,
								estimatedTax: null,
								estimatedTotal: null,
							},
							edd: "N/A",
						},
					}));
					get().recalculateTotal();
				},

				// Fetch shipping estimate
				fetchShippingEstimate: async () => {
					const {
						savedAddresses,
						selectedAddressId,
						orderSummary,
						paymentMethod,
					} = get();

					const selectedAddress = savedAddresses.find(
						(addr) => addr._id === selectedAddressId
					);

					if (!selectedAddress) {
						toast.error("Please select a shipping address first");
						return null;
					}

					// Validate address has zipCode/pincode
					if (!selectedAddress.zipCode && !selectedAddress.pincode) {
						toast.error("Selected address is missing pincode");
						return null;
					}

					try {
						set({ isLoading: true });

						// console.log("Order items for shipping:", orderSummary.items);

						// Calculate shipping parameters dynamically from order items
						const shippingParams = calculateShippingParams(orderSummary.items, {
							pickupPincode: "560068", // Seller pincode - should come from seller's company details
							dropPincode: selectedAddress.zipCode || selectedAddress.pincode,
							paymentType: paymentMethod === "cod" ? "COD" : "Prepaid",
						});

						// Validate parameters before API call
						const validation = validateShippingParams(shippingParams);
						if (!validation.isValid) {
							console.error("Shipping validation errors:", validation.errors);
							toast.error(
								"Unable to calculate shipping: " + validation.errors[0]
							);
							return null;
						}

						// console.log("Shipping estimate params:", shippingParams);

						// Call the API with calculated parameters
						const response = await paymentAPI.getShippingEstimate(
							shippingParams
						);

						// Update shipping estimate in state with full recalculation
						const { savedAddresses: addresses, selectedAddressId: addrId } =
							get();
						const addr = addresses.find((a) => a._id === addrId);

						// Recalculate totals with new shipping cost
						const totals = calculateGstTotals({
							subtotal: orderSummary.subtotal,
							discount: orderSummary.discount,
							shippingCost: response.preTax || 0,
							address: addr,
							gstMode: orderSummary.gst?.mode,
						});

						set((state) => ({
							orderSummary: {
								...state.orderSummary,
								shippingCost: response.preTax || 0,
								edd: response.tat
									? `${response.tat.min}-${response.tat.max} days`
									: "N/A",
								shippingEstimate: {
									minDays: response.tat?.min || null,
									maxDays: response.tat?.max || null,
									estimatedCost: response.preTax || 0,
									estimatedTax: response.tax || 0,
									estimatedTotal: response.total || 0,
								},
								// Update all totals with new shipping cost
								taxableAmount: totals.taxableAmount,
								total: totals.total,
								gst: totals.gst,
							},
						}));

						toast.success(
							`Shipping estimate: ₹${response.preTax} (${response.tat.min}-${response.tat.max} days)`
						);

						return response;
					} catch (error) {
						console.error("Failed to fetch shipping estimate:", error);
						toast.error(error.message || "Failed to get shipping estimate");
						return null;
					} finally {
						set({ isLoading: false });
					}
				},

				// Toggle add new address form
				toggleAddNewAddress: () => {
					set((state) => ({ isAddingNewAddress: !state.isAddingNewAddress }));
				},

				// Apply coupon (only for buyNow flow)
				applyCoupon: async (couponCode) => {
					const { checkoutType } = get();

					if (checkoutType === "cart") {
						toast.error("Coupon is already applied from cart");
						return false;
					}

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
						toast.error(error.message || "Failed to apply coupon");
						return false;
					} finally {
						set({ isLoading: false });
					}
				},

				// Remove coupon (only for buyNow flow)
				removeCoupon: () => {
					const { checkoutType } = get();

					if (checkoutType === "cart") {
						toast.error("Cannot remove coupon applied from cart");
						return;
					}

					set({ appliedCoupon: null });
					get().recalculateTotal();
					toast.success("Coupon removed");
				},

				// Recalculate total
				recalculateTotal: () => {
					const {
						orderSummary,
						appliedCoupon,
						cartAppliedCoupon,
						checkoutType,
						savedAddresses,
						selectedAddressId,
					} = get();

					// Get current shipping cost (will be overridden by estimate if present)
					const shippingCost = orderSummary.shippingCost || 0;

					// Calculate discount based on checkout type
					let discount = 0;
					if (checkoutType === "cart" && cartAppliedCoupon) {
						discount =
							cartAppliedCoupon.discountAmount ||
							(orderSummary.subtotal * cartAppliedCoupon.discount) / 100;
					} else if (checkoutType === "buyNow" && appliedCoupon) {
						discount =
							appliedCoupon.discountAmount ||
							(orderSummary.subtotal * appliedCoupon.discount) / 100;
					}

					const selectedAddress = savedAddresses.find(
						(addr) => addr._id === selectedAddressId
					);

					// Use calculateGstTotals for all calculations
					const totals = calculateGstTotals({
						subtotal: orderSummary.subtotal,
						discount,
						shippingCost,
						address: selectedAddress,
						gstMode: orderSummary.gst?.mode,
					});

					set({
						orderSummary: {
							...orderSummary,
							shippingCost: totals.shippingCost,
							discount: totals.discount,
							taxableAmount: totals.taxableAmount,
							total: totals.total,
							gst: totals.gst,
						},
					});
				},

				// Get selected address
				getSelectedAddress: () => {
					const { savedAddresses, selectedAddressId } = get();
					return savedAddresses.find((addr) => addr._id === selectedAddressId);
				},

				// Process payment
                                processPayment: async (userId, clearCartCallback = null) => {
                                        const {
                                                customerInfo,
                                                orderSummary,
                                                appliedCoupon,
                                                cartAppliedCoupon,
                                                checkoutType,
                                                paymentMethod,
                                                gstInvoice,
                                        } = get();

                                        const selectedAddress = get().getSelectedAddress();

                                        if (!selectedAddress) {
						toast.error("Please select a delivery address");
						return { success: false, error: "No delivery address selected" };
					}

                                        if (orderSummary.items.length === 0) {
                                                toast.error("No items to checkout");
                                                return { success: false, error: "No items to checkout" };
                                        }

                                        if (gstInvoice?.enabled) {
                                                const gstin = (gstInvoice.gstin || "").trim();
                                                if (!gstin || gstin.length !== 15) {
                                                        toast.error("Please enter a valid 15-character GSTIN");
                                                        return { success: false, error: "Invalid GSTIN" };
                                                }

                                                if (!gstInvoice.legalName) {
                                                        toast.error("Please verify your GSTIN before placing the order");
                                                        return { success: false, error: "GSTIN not verified" };
                                                }
                                        }

					set({ paymentLoading: true });

					try {
						// Determine which coupon to use
						const couponToUse =
							checkoutType === "cart" ? cartAppliedCoupon : appliedCoupon;

						// Prepare order data
						const totals = calculateGstTotals({
							subtotal: orderSummary.subtotal,
							discount: orderSummary.discount,
							shippingCost: orderSummary.shippingCost,
							address: selectedAddress,
							gstMode: orderSummary.gst?.mode,
						});

						set({
							orderSummary: {
								...orderSummary,
								shippingCost: totals.shippingCost,
								discount: totals.discount,
								total: totals.total,
								taxableAmount: totals.taxableAmount,
								gst: totals.gst,
							},
						});

                                                const orderData = {
                                                        userId: userId,
                                                        customerName: customerInfo.name,
                                                        customerEmail: customerInfo.email,
                                                        customerMobile: customerInfo.mobile,
                                                        products: orderSummary.items,
							subtotal: totals.subtotal,
							shippingCost: totals.shippingCost,
							discount: totals.discount,
							totalAmount: totals.total,
							paymentMethod: paymentMethod,
							deliveryAddress: {
								tag: selectedAddress.tag,
								name: selectedAddress.name,
								street: selectedAddress.street,
								city: selectedAddress.city,
								state: selectedAddress.state,
								zipCode: selectedAddress.zipCode,
								country: selectedAddress.country,
								fullAddress: `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.zipCode}`,
							},
                                                        couponApplied: couponToUse
                                                                ? {
                                                                                couponCode: couponToUse.code,
                                                                                discountAmount:
                                                                                        couponToUse.discountAmount || orderSummary.discount,
                                                                                discountType: "percentage",
                                                                  }
                                                                : null,
                                                        tax: totals.gst.total,
                                                        gst: totals.gst,
                                                        taxableAmount: totals.taxableAmount,
                                                        billingInfo:
                                                                gstInvoice?.enabled && gstInvoice?.gstin
                                                                        ? {
                                                                                  gstInvoiceRequested: true,
                                                                                  gstNumber: gstInvoice.gstin,
                                                                                  gstLegalName: gstInvoice.legalName || null,
                                                                                  gstTradeName: gstInvoice.tradeName || null,
                                                                                  gstState: gstInvoice.state || null,
                                                                                  gstAddress: gstInvoice.address || null,
                                                                                  gstVerifiedAt:
                                                                                          gstInvoice.lastVerifiedAt || null,
                                                                          }
                                                                        : {
                                                                                  gstInvoiceRequested: false,
                                                                                  gstNumber: null,
                                                                                  gstLegalName: null,
                                                                                  gstTradeName: null,
                                                                                  gstState: null,
                                                                                  gstAddress: null,
                                                                                  gstVerifiedAt: null,
                                                                          },
                                                };

						if (paymentMethod === "razorpay") {
							// Create Razorpay order
							const { order: razorpayOrder } =
								await paymentAPI.createRazorpayOrder({
									amount: orderSummary.total,
									currency: "INR",
									receipt: `order_${Date.now()}`,
								});

							// Initialize Razorpay payment
							const options = {
								key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
								amount: razorpayOrder.amount,
								currency: razorpayOrder.currency,
								name: "Your Store Name",
								description: "Purchase from Your Store",
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
											status: "success",
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
							razorpay.on("payment.failed", async function (response) {
								const failureData = {
									status: "failed",
									orderData,
									userId: userId,
									clearCart: false,
									razorpay_order_id:
										response?.error?.metadata?.order_id || razorpayOrder.id,
									razorpay_payment_id:
										response?.error?.metadata?.payment_id || null,
									failureReason:
										response?.error?.description ||
										response?.error?.reason ||
										response?.error?.code ||
										"Payment failed",
								};

								try {
									await paymentAPI.verifyPayment(failureData);
								} catch (recordError) {
									console.error(
										"Payment failure recording error:",
										recordError
									);
								} finally {
									set({ paymentLoading: false });
									toast.error("Payment failed. Please try again.");
								}
							});
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

								// Send confirmation email (don't block on this)
								try {
									const order = result.order;
									// Extract all products from subOrders if they exist
									const allProducts = Array.isArray(order.subOrders)
										? order.subOrders.flatMap((sub) =>
												Array.isArray(sub.products)
													? sub.products.map((p) => ({
															productName:
																p.productId?.productName ||
																p.productId?.name ||
																p.productId?.title ||
																"Unknown",
															quantity: p.quantity || 0,
															price: p.price || p.productId?.price || 0,
															totalPrice:
																(p.price || p.productId?.price || 0) *
																(p.quantity || 0),
													  }))
													: []
										  )
										: order.products || [];

									const orderForPDF = {
										...order,
										customerName: order.customerName,
										customerEmail: order.customerEmail,
										customerMobile: order.customerMobile,
										products: allProducts,
									};

									const pdfBase64 = await generateClientSidePDF(orderForPDF);

									console.log("pdfBase64", !!pdfBase64 ? "generated" : "null");
									if (!pdfBase64) {
										throw new Error("PDF generation failed");
									}

									const emailResult = await paymentAPI.sendOrderConfirmation(
										orderForPDF,
										userId,
										pdfBase64
									);
									// console.log("emailResult", emailResult);
								} catch (emailError) {
									console.error("Email sending failed:", emailError);
									// Don't stop the flow if email fails
									// return { success: false, paymentMethod: "cod" };
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
						savedAddresses: [],
						selectedAddressId: null,
                                                newAddress: {
                                                        tag: "home",
                                                        name: "",
                                                        street: "",
                                                        city: "",
                                                        state: "",
                                                        zipCode: "",
                                                        country: "India",
                                                        isDefault: false,
                                                },
                                                gstInvoice: {
                                                        enabled: false,
                                                        gstin: "",
                                                        legalName: "",
                                                        tradeName: "",
                                                        state: "",
                                                        address: "",
                                                        lastVerifiedAt: null,
                                                },
                                                isAddingNewAddress: false,
                                                orderSummary: {
                                                        items: [],
                                                        subtotal: 0,
							shippingCost: 0,
							discount: 0,
							total: 0,
							taxableAmount: 0,
							gst: {
								mode: "igst",
								rate: GST_RATE_PERCENT,
								cgst: 0,
								sgst: 0,
								igst: 0,
								total: 0,
								taxableAmount: 0,
							},
						},
						appliedCoupon: null,
						cartAppliedCoupon: null,
						currentStep: 1,
						paymentMethod: "razorpay",
						paymentLoading: false,
					});
				},

				// Validate checkout data
				validateCheckoutData: () => {
					const { customerInfo, selectedAddressId, orderSummary } = get();
					const errors = [];

					// Validate customer info
					if (!customerInfo.name.trim())
						errors.push("Customer name is required");
					if (!customerInfo.email.trim()) errors.push("Email is required");
					if (!customerInfo.mobile.trim())
						errors.push("Mobile number is required");

					// Validate delivery address
					if (!selectedAddressId)
						errors.push("Please select a delivery address");

					// Validate order items
					if (orderSummary.items.length === 0) errors.push("No items in order");

					return {
						isValid: errors.length === 0,
						errors,
					};
				},

				// Get checkout summary
				getCheckoutSummary: () => {
					const {
						orderSummary,
						appliedCoupon,
						cartAppliedCoupon,
						paymentMethod,
						checkoutType,
					} = get();
					const couponToUse =
						checkoutType === "cart" ? cartAppliedCoupon : appliedCoupon;

					return {
						itemCount: orderSummary.items.reduce(
							(sum, item) => sum + item.quantity,
							0
						),
						uniqueItems: orderSummary.items.length,
						...orderSummary,
						hasPromo: !!couponToUse,
						promoCode: couponToUse?.code,
						paymentMethod,
						checkoutType,
					};
				},
			}),
			{
				name: "checkout-storage",
				partialize: (state) => ({
					paymentMethod: state.paymentMethod,
				}),
			}
		)
	)
);
