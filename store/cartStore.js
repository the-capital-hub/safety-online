"use client";

import { create } from "zustand";
import { persist, subscribeWithSelector, devtools } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore.js";

// Cart API functions
const cartAPI = {
	async fetchCart() {
		const response = await fetch("/api/cart");
		if (!response.ok) {
			if (response.status === 401) {
				throw new Error("UNAUTHORIZED");
			}
			throw new Error("Failed to fetch cart");
		}
		return response.json();
	},

	async addToCart(productId, quantity = 1) {
		const response = await fetch("/api/cart", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ productId, quantity }),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to add to cart");
		}
		return response.json();
	},

	async updateQuantity(productId, quantity) {
		const response = await fetch(`/api/cart/${productId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ quantity }),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to update cart");
		}
		return response.json();
	},

	async removeItem(productId) {
		const response = await fetch(`/api/cart/${productId}`, {
			method: "DELETE",
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to remove item");
		}
		return response.json();
	},

	async applyPromo(promoCode) {
		const response = await fetch("/api/cart/apply-promo", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ promoCode }),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to apply promo code");
		}
		return response.json();
	},

	async removePromo() {
		const response = await fetch("/api/cart/remove-promo", {
			method: "DELETE",
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to remove promo code");
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

	async clearCart() {
		const response = await fetch("/api/cart/clear", {
			method: "DELETE",
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || "Failed to clear cart");
		}
		return response.json();
	},
};

export const useCartStore = create(
	devtools(
		subscribeWithSelector(
			persist(
				(set, get) => ({
					// State
					items: [],
					serverCart: null,
					isLoading: false,
					isOpen: false,
					appliedPromo: null,
					totals: {
						subtotal: 0,
						discount: 0,
						total: 0,
					},
					lastSyncTime: null,
					syncError: null,

					// Helper function to check if user is authenticated
					isAuthenticated: () => {
						return useAuthStore.getState().user !== null;
					},

					// Unified add item function - handles both authenticated and non-authenticated users
					addItem: async (product) => {
						const isAuth = get().isAuthenticated();

						if (isAuth) {
							// For authenticated users: Update database directly
							set({ isLoading: true });
							try {
								const data = await cartAPI.addToCart(product.id, 1);

								// Update local state with server response
								const serverItems = data.cart.products.map((item) => ({
									id: item.product._id,
									name: item.product.title,
									description: item.product.description,
									price: item.product.salePrice || item.product.price,
									originalPrice: item.product.price,
									image:
										item.product.images?.[0] ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
									quantity: item.quantity,
									inStock: item.product.inStock,
								}));

								set({
									items: serverItems,
									serverCart: data.cart,
									lastSyncTime: Date.now(),
								});

								get().calculateTotals();
								toast.success("Added to cart!");
							} catch (error) {
								console.error("Failed to add to cart:", error);
								toast.error(error.message || "Failed to add to cart");
								if (error.message === "UNAUTHORIZED") {
									// Clear auth state if unauthorized
									useAuthStore.getState().clearUser();
								}
							} finally {
								set({ isLoading: false });
							}
						} else {
							// For non-authenticated users: Update locally
							const { items } = get();
							const existingItem = items.find((item) => item.id === product.id);

							if (existingItem) {
								set({
									items: items.map((item) =>
										item.id === product.id
											? { ...item, quantity: item.quantity + 1 }
											: item
									),
								});
							} else {
								set({ items: [...items, { ...product, quantity: 1 }] });
							}

							get().calculateTotals();
							toast.success("Added to cart!");
						}
					},

					// Unified update quantity function
					updateQuantity: async (productId, quantity) => {
						if (quantity <= 0) {
							get().removeItem(productId);
							return;
						}

						const isAuth = get().isAuthenticated();

						if (isAuth) {
							// For authenticated users: Update database directly
							set({ isLoading: true });
							try {
								const data = await cartAPI.updateQuantity(productId, quantity);

								// Update local state with server response
								const serverItems = data.cart.products.map((item) => ({
									id: item.product._id,
									name: item.product.title,
									description: item.product.description,
									price: item.product.salePrice || item.product.price,
									originalPrice: item.product.price,
									image:
										item.product.images?.[0] ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
									quantity: item.quantity,
									inStock: item.product.inStock,
								}));

								set({
									items: serverItems,
									serverCart: data.cart,
									lastSyncTime: Date.now(),
								});

								get().calculateTotals();
							} catch (error) {
								console.error("Failed to update quantity:", error);
								toast.error(error.message || "Failed to update quantity");
								if (error.message === "UNAUTHORIZED") {
									useAuthStore.getState().clearUser();
								}
							} finally {
								set({ isLoading: false });
							}
						} else {
							// For non-authenticated users: Update locally
							set({
								items: get().items.map((item) =>
									item.id === productId ? { ...item, quantity } : item
								),
							});
							get().calculateTotals();
						}
					},

					// Unified remove item function
					removeItem: async (productId) => {
						const isAuth = get().isAuthenticated();

						if (isAuth) {
							// For authenticated users: Update database directly
							set({ isLoading: true });
							try {
								const data = await cartAPI.removeItem(productId);

								// Update local state with server response
								const serverItems = data.cart.products.map((item) => ({
									id: item.product._id,
									name: item.product.title,
									description: item.product.description,
									price: item.product.salePrice || item.product.price,
									originalPrice: item.product.price,
									image:
										item.product.images?.[0] ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
									quantity: item.quantity,
									inStock: item.product.inStock,
								}));

								set({
									items: serverItems,
									serverCart: data.cart,
									lastSyncTime: Date.now(),
								});

								get().calculateTotals();
								toast.success("Item removed from cart");
							} catch (error) {
								console.error("Failed to remove item:", error);
								toast.error(error.message || "Failed to remove item");
								if (error.message === "UNAUTHORIZED") {
									useAuthStore.getState().clearUser();
								}
							} finally {
								set({ isLoading: false });
							}
						} else {
							// For non-authenticated users: Update locally
							set({
								items: get().items.filter((item) => item.id !== productId),
							});
							get().calculateTotals();
							toast.success("Item removed from cart");
						}
					},

					// Unified clear cart function
					clearCart: async () => {
						const isAuth = get().isAuthenticated();

						if (isAuth) {
							// For authenticated users: Update database directly
							set({ isLoading: true });
							try {
								await cartAPI.clearCart();

								set({
									items: [],
									serverCart: null,
									appliedPromo: null,
									totals: {
										subtotal: 0,
										discount: 0,
										total: 0,
									},
									lastSyncTime: Date.now(),
								});
							} catch (error) {
								console.error("Failed to clear cart:", error);
								toast.error(error.message || "Failed to clear cart");
								if (error.message === "UNAUTHORIZED") {
									useAuthStore.getState().clearUser();
								}
							} finally {
								set({ isLoading: false });
							}
						} else {
							// For non-authenticated users: Update locally
							set({
								items: [],
								appliedPromo: null,
								totals: { subtotal: 0, discount: 0, total: 0 },
							});
						}
					},

					// Fetch cart from server (for authenticated users)
					fetchCart: async () => {
						const isAuth = get().isAuthenticated();
						if (!isAuth) return;

						set({ isLoading: true, syncError: null });

						try {
							const data = await cartAPI.fetchCart();
							const serverItems = data.cart.products.map((item) => ({
								id: item.product._id,
								name: item.product.title,
								description: item.product.description,
								price: item.product.salePrice || item.product.price,
								originalPrice: item.product.price,
								image:
									item.product.images?.[0] ||
									"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
								quantity: item.quantity,
								inStock: item.product.inStock,
							}));

							set({
								items: serverItems,
								serverCart: data.cart,
								appliedPromo: data.cart.appliedPromo
									? {
											code: data.cart.appliedPromo,
											discount: 20,
									  }
									: null,
								lastSyncTime: Date.now(),
							});

							get().calculateTotals();
						} catch (error) {
							if (error.message === "UNAUTHORIZED") {
								useAuthStore.getState().clearUser();
							} else {
								set({ syncError: error.message });
								console.error("Cart fetch error:", error);
							}
						} finally {
							set({ isLoading: false });
						}
					},

					// Handle authentication state changes
					handleAuthChange: (isAuth) => {
						if (isAuth) {
							// User just logged in - fetch their server cart
							get().fetchCart();
						} else {
							// User logged out - clear server data but keep local cart
							set({
								serverCart: null,
								appliedPromo: null,
								lastSyncTime: null,
								syncError: null,
							});
							// Recalculate totals for local cart
							get().calculateTotals();
						}
					},

					// Promo code operations
					applyPromoCode: async (promoCode) => {
						const isAuth = get().isAuthenticated();

						if (isAuth) {
							// For authenticated users: Apply promo on server
							set({ isLoading: true });
							try {
								const data = await cartAPI.applyPromo(promoCode);
								set({
									appliedPromo: { code: promoCode, discount: data.discount },
									serverCart: data.cart,
								});
								get().calculateTotals();
								toast.success("Promo code applied successfully!");
								return true;
							} catch (error) {
								toast.error(error.message);
								if (error.message === "UNAUTHORIZED") {
									useAuthStore.getState().clearUser();
								}
								return false;
							} finally {
								set({ isLoading: false });
							}
						} else {
							// For non-authenticated users: Validate coupon locally
							set({ isLoading: true });
							try {
								const data = await cartAPI.validateCoupon(
									promoCode,
									get().totals.subtotal
								);

								if (data.success) {
									set({
										appliedPromo: {
											code: data.coupon.code,
											discount: data.coupon.discount,
											discountAmount: data.coupon.discountAmount,
										},
									});
									get().calculateTotals();
									toast.success("Promo code applied!");
									return true;
								} else {
									toast.error(data.message || "Invalid promo code");
									return false;
								}
							} catch (error) {
								toast.error(error.message || "Failed to apply coupon");
								return false;
							} finally {
								set({ isLoading: false });
							}
						}
					},

					removePromoCode: () => {
						// For authenticated users: Remove promo on server
						const isAuth = get().isAuthenticated();
						if (isAuth) {
							cartAPI.removePromo();
						}
						set({ appliedPromo: null });
						get().calculateTotals();
						toast.success("Promo code removed");
					},

					// Calculate totals - removed delivery fee calculation
					calculateTotals: () => {
						const { items, appliedPromo } = get();
						const subtotal = items.reduce(
							(sum, item) => sum + item.price * item.quantity,
							0
						);

						// Use discountAmount if available, otherwise calculate percentage
						const discount = appliedPromo
							? appliedPromo.discountAmount ||
							  (subtotal * appliedPromo.discount) / 100
							: 0;

						// Total is now just subtotal minus discount (no delivery fee)
						const total = subtotal - discount;

						set({
							totals: {
								subtotal,
								discount,
								total,
							},
						});
					},

					// UI state management
					toggleCart: () => set({ isOpen: !get().isOpen }),
					openCart: () => set({ isOpen: true }),
					closeCart: () => set({ isOpen: false }),

					// Getters
					getTotalItems: () => {
						return get().items.reduce(
							(total, item) => total + item.quantity,
							0
						);
					},

					getItemById: (productId) => {
						return get().items.find((item) => item.id === productId);
					},

					isItemInCart: (productId) => {
						return get().items.some((item) => item.id === productId);
					},

					getCartSummary: () => {
						const { items, totals, appliedPromo } = get();
						return {
							itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
							uniqueItems: items.length,
							...totals,
							hasPromo: !!appliedPromo,
							promoCode: appliedPromo?.code,
						};
					},

					// Checkout integration
					proceedToCheckout: (
						checkoutType = "cart",
						product = null,
						quantity = 1
					) => {
						const { items } = get();

						if (checkoutType === "cart" && items.length === 0) {
							toast.error("Cart is empty");
							return false;
						}

						// Navigate to checkout page with appropriate parameters
						const params = new URLSearchParams();
						params.set("type", checkoutType);

						if (checkoutType === "buyNow" && product) {
							params.set("productId", product.id);
							params.set("quantity", quantity.toString());
						}

						window.location.href = `/checkout?${params.toString()}`;
						return true;
					},
				}),
				{
					name: "cart-storage",
					partialize: (state) => ({
						// Only persist local cart data for non-authenticated users
						items: state.items,
						appliedPromo: state.appliedPromo,
						totals: state.totals,
					}),
					onRehydrateStorage: () => (state) => {
						// Recalculate totals after rehydration
						if (state) {
							state.calculateTotals();
						}
					},
				}
			)
		)
	)
);

// Subscribe to auth state changes
if (typeof window !== "undefined") {
	// Listen for authentication state changes
	useAuthStore.subscribe(
		(state) => !!state.user, // Convert user to boolean
		(isAuthenticated) => {
			useCartStore.getState().handleAuthChange(isAuthenticated);
		}
	);

	// Auto-fetch cart when user becomes authenticated
	useAuthStore.subscribe(
		(state) => state.user,
		(user) => {
			if (user) {
				// User just logged in, fetch their cart
				setTimeout(() => {
					useCartStore.getState().fetchCart();
				}, 100); // Small delay to ensure auth state is fully set
			}
		}
	);
}
