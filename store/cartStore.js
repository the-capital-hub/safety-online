"use client";

import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { toast } from "sonner";

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
					deliveryFee: 15,
					total: 0,
				},
				lastSyncTime: null,
				isAuthenticated: false,
				syncError: null,

				// Actions
				setAuthenticated: (isAuth) => {
					set({ isAuthenticated: isAuth });
					if (isAuth) {
						get().syncWithServer();
					} else {
						// Clear server data when logged out
						set({
							serverCart: null,
							appliedPromo: null,
							lastSyncTime: null,
							syncError: null,
						});
					}
				},

				// Local cart operations (work offline)
				addItemLocal: (product) => {
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

					// Sync with server if authenticated
					if (get().isAuthenticated) {
						get().syncAddToServer(product.id, 1);
					}
				},

				updateQuantityLocal: (productId, quantity) => {
					if (quantity <= 0) {
						get().removeItemLocal(productId);
						return;
					}

					set({
						items: get().items.map((item) =>
							item.id === productId ? { ...item, quantity } : item
						),
					});

					get().calculateTotals();

					// Sync with server if authenticated
					if (get().isAuthenticated) {
						get().syncUpdateQuantity(productId, quantity);
					}
				},

				removeItemLocal: (productId) => {
					set({ items: get().items.filter((item) => item.id !== productId) });
					get().calculateTotals();
					toast.success("Item removed from cart");

					// Sync with server if authenticated
					if (get().isAuthenticated) {
						get().syncRemoveFromServer(productId);
					}
				},

				clearCartLocal: () => {
					set({
						items: [],
						appliedPromo: null,
						totals: { subtotal: 0, discount: 0, deliveryFee: 15, total: 15 },
					});

					// Sync with server if authenticated
					if (get().isAuthenticated) {
						get().syncClearServer();
					}
				},

				// Server sync operations
				syncWithServer: async () => {
					if (!get().isAuthenticated) return;

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
								"/placeholder.svg?height=300&width=300&text=Product",
							quantity: item.quantity,
							inStock: item.product.inStock,
						}));

						// Merge local and server carts
						const mergedItems = get().mergeCartItems(get().items, serverItems);

						set({
							items: mergedItems,
							serverCart: data.cart,
							appliedPromo: data.cart.appliedPromo
								? {
										code: data.cart.appliedPromo,
										discount: 20, // You might want to fetch this from a promo API
								  }
								: null,
							lastSyncTime: Date.now(),
						});

						get().calculateTotals();
					} catch (error) {
						if (error.message === "UNAUTHORIZED") {
							set({ isAuthenticated: false });
						} else {
							set({ syncError: error.message });
							console.error("Cart sync error:", error);
						}
					} finally {
						set({ isLoading: false });
					}
				},

				syncAddToServer: async (productId, quantity) => {
					try {
						await cartAPI.addToCart(productId, quantity);
						get().updateLastSyncTime();
					} catch (error) {
						console.error("Failed to sync add to server:", error);
						toast.error("Failed to sync with server");
					}
				},

				syncUpdateQuantity: async (productId, quantity) => {
					try {
						await cartAPI.updateQuantity(productId, quantity);
						get().updateLastSyncTime();
					} catch (error) {
						console.error("Failed to sync quantity update:", error);
						toast.error("Failed to sync with server");
					}
				},

				syncRemoveFromServer: async (productId) => {
					try {
						await cartAPI.removeItem(productId);
						get().updateLastSyncTime();
					} catch (error) {
						console.error("Failed to sync remove from server:", error);
						toast.error("Failed to sync with server");
					}
				},

				syncClearServer: async () => {
					try {
						await cartAPI.clearCart();
						get().updateLastSyncTime();
					} catch (error) {
						console.error("Failed to sync clear cart:", error);
						toast.error("Failed to sync with server");
					}
				},

				// Promo code operations
				applyPromoCode: async (promoCode) => {
					if (!get().isAuthenticated) {
						// Local promo application for non-authenticated users
						if (promoCode.toLowerCase() === "save20") {
							set({
								appliedPromo: { code: promoCode, discount: 20 },
							});
							get().calculateTotals();
							toast.success("Promo code applied!");
							return true;
						} else {
							toast.error("Invalid promo code");
							return false;
						}
					}

					// Server promo application for authenticated users
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
						return false;
					} finally {
						set({ isLoading: false });
					}
				},

				removePromoCode: () => {
					set({ appliedPromo: null });
					get().calculateTotals();
					toast.success("Promo code removed");
				},

				// Utility functions
				mergeCartItems: (localItems, serverItems) => {
					const merged = [...serverItems];

					localItems.forEach((localItem) => {
						const existingIndex = merged.findIndex(
							(item) => item.id === localItem.id
						);
						if (existingIndex >= 0) {
							// Use the higher quantity
							merged[existingIndex].quantity = Math.max(
								merged[existingIndex].quantity,
								localItem.quantity
							);
						} else {
							merged.push(localItem);
						}
					});

					return merged;
				},

				calculateTotals: () => {
					const { items, appliedPromo } = get();
					const subtotal = items.reduce(
						(sum, item) => sum + item.price * item.quantity,
						0
					);
					const discount = appliedPromo
						? (subtotal * appliedPromo.discount) / 100
						: 0;
					const deliveryFee = subtotal > 0 ? 15 : 0;
					const total = subtotal - discount + deliveryFee;

					set({
						totals: {
							subtotal,
							discount,
							deliveryFee,
							total,
						},
					});
				},

				updateLastSyncTime: () => {
					set({ lastSyncTime: Date.now() });
				},

				// UI state management
				toggleCart: () => set({ isOpen: !get().isOpen }),
				openCart: () => set({ isOpen: true }),
				closeCart: () => set({ isOpen: false }),

				// Getters
				getTotalItems: () => {
					return get().items.reduce((total, item) => total + item.quantity, 0);
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

				// Force refresh from server
				forceSync: async () => {
					await get().syncWithServer();
				},

				// Check if cart needs sync (for periodic sync)
				needsSync: () => {
					const { lastSyncTime, isAuthenticated } = get();
					if (!isAuthenticated) return false;
					if (!lastSyncTime) return true;

					// Sync if last sync was more than 5 minutes ago
					return Date.now() - lastSyncTime > 5 * 60 * 1000;
				},
			}),
			{
				name: "cart-storage",
				partialize: (state) => ({
					// Only persist local cart data, not server state
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
);

// Subscribe to auth changes and sync accordingly
if (typeof window !== "undefined") {
	// Auto-sync when cart changes and user is authenticated
	useCartStore.subscribe(
		(state) => state.items,
		() => {
			const state = useCartStore.getState();
			if (state.isAuthenticated && state.needsSync()) {
				// Debounce sync calls
				clearTimeout(window.cartSyncTimeout);
				window.cartSyncTimeout = setTimeout(() => {
					state.forceSync();
				}, 1000);
			}
		}
	);

	// Periodic sync every 5 minutes
	setInterval(() => {
		const state = useCartStore.getState();
		if (state.needsSync()) {
			state.forceSync();
		}
	}, 5 * 60 * 1000);
}
