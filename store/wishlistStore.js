"use client";

import { create } from "zustand";
import { persist, subscribeWithSelector, devtools } from "zustand/middleware";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/authStore.js";

const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

const handleUnauthorized = () => {
        toast.error(SESSION_EXPIRED_MESSAGE);
        void useAuthStore.getState().logout();
};

// Wishlist API functions
const wishlistAPI = {
        async fetchWishlist() {
                const response = await fetch("/api/wishlist", {
			method: "GET",
			credentials: "include",
		});
		if (!response.ok) {
			if (response.status === 401) {
				throw new Error("UNAUTHORIZED");
			}
			throw new Error("Failed to fetch wishlist");
		}
		return response.json();
	},

        async addToWishlist(productId) {
                const response = await fetch("/api/wishlist", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId }),
                        credentials: "include",
                });
                if (!response.ok) {
                        if (response.status === 401) {
                                throw new Error("UNAUTHORIZED");
                        }
                        const error = await response.json();
                        throw new Error(error.message || "Failed to add to wishlist");
                }
                return response.json();
        },

        async removeFromWishlist(productId) {
                const response = await fetch(`/api/wishlist/${productId}`, {
                        method: "DELETE",
                        credentials: "include",
                });
                if (!response.ok) {
                        if (response.status === 401) {
                                throw new Error("UNAUTHORIZED");
                        }
                        const error = await response.json();
                        throw new Error(error.message || "Failed to remove from wishlist");
                }
                return response.json();
        },

        async clearWishlist() {
                const response = await fetch("/api/wishlist/clear", {
                        method: "DELETE",
                        credentials: "include",
                });
                if (!response.ok) {
                        if (response.status === 401) {
                                throw new Error("UNAUTHORIZED");
                        }
                        const error = await response.json();
                        throw new Error(error.message || "Failed to clear wishlist");
                }
                return response.json();
        },
};

export const useWishlistStore = create(
	devtools(
		subscribeWithSelector(
			persist(
				(set, get) => ({
					// State
					items: [],
					serverWishlist: null,
					isLoading: false,
					isOpen: false,
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
								const data = await wishlistAPI.addToWishlist(product.id);

								// Update local state with server response
								const serverItems = data.wishlist.products.map((item) => ({
									id: item.product._id,
									name: item.product.title,
									description: item.product.description,
									price: item.product.salePrice || item.product.price,
									originalPrice: item.product.price,
									image:
										item.product.images?.[0] ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
									inStock: item.product.inStock,
									category: item.product.category,
									addedAt: item.addedAt,
								}));

								set({
									items: serverItems,
									serverWishlist: data.wishlist,
									lastSyncTime: Date.now(),
								});

								toast.success("Added to wishlist!");
                                                        } catch (error) {
                                                                console.error("Failed to add to wishlist:", error);
                                                                if (error.message === "UNAUTHORIZED") {
                                                                        handleUnauthorized();
                                                                } else {
                                                                        toast.error(error.message || "Failed to add to wishlist");
                                                                }
                                                        } finally {
                                                                set({ isLoading: false });
                                                        }
						} else {
							// For non-authenticated users: Update locally
							const { items } = get();
							const existingItem = items.find((item) => item.id === product.id);

							if (existingItem) {
								toast.error("Product already in wishlist");
								return;
							}

							set({
								items: [
									...items,
									{ ...product, addedAt: new Date().toISOString() },
								],
							});

							toast.success("Added to wishlist!");
						}
					},

					// Unified remove item function
					removeItem: async (productId) => {
						const isAuth = get().isAuthenticated();

						if (isAuth) {
							// For authenticated users: Update database directly
							set({ isLoading: true });
							try {
								const data = await wishlistAPI.removeFromWishlist(productId);

								// Update local state with server response
								const serverItems = data.wishlist.products.map((item) => ({
									id: item.product._id,
									name: item.product.title,
									description: item.product.description,
									price: item.product.salePrice || item.product.price,
									originalPrice: item.product.price,
									image:
										item.product.images?.[0] ||
										"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
									inStock: item.product.inStock,
									category: item.product.category,
									addedAt: item.addedAt,
								}));

								set({
									items: serverItems,
									serverWishlist: data.wishlist,
									lastSyncTime: Date.now(),
								});

								toast.success("Removed from wishlist");
                                                        } catch (error) {
                                                                console.error("Failed to remove from wishlist:", error);
                                                                if (error.message === "UNAUTHORIZED") {
                                                                        handleUnauthorized();
                                                                } else {
                                                                        toast.error(error.message || "Failed to remove from wishlist");
                                                                }
                                                        } finally {
                                                                set({ isLoading: false });
                                                        }
						} else {
							// For non-authenticated users: Update locally
							set({
								items: get().items.filter((item) => item.id !== productId),
							});
							toast.success("Removed from wishlist");
						}
					},

					// Toggle item in wishlist (add if not present, remove if present)
					toggleItem: async (product) => {
						const isInWishlist = get().isItemInWishlist(product.id);

						if (isInWishlist) {
							await get().removeItem(product.id);
						} else {
							await get().addItem(product);
						}
					},

					// Unified clear wishlist function
					clearWishlist: async () => {
						const isAuth = get().isAuthenticated();

						if (isAuth) {
							// For authenticated users: Update database directly
							set({ isLoading: true });
							try {
								await wishlistAPI.clearWishlist();

								set({
									items: [],
									serverWishlist: null,
									lastSyncTime: Date.now(),
								});

								toast.success("Wishlist cleared");
                                                        } catch (error) {
                                                                console.error("Failed to clear wishlist:", error);
                                                                if (error.message === "UNAUTHORIZED") {
                                                                        handleUnauthorized();
                                                                } else {
                                                                        toast.error(error.message || "Failed to clear wishlist");
                                                                }
                                                        } finally {
                                                                set({ isLoading: false });
                                                        }
						} else {
							// For non-authenticated users: Update locally
							set({ items: [] });
							toast.success("Wishlist cleared");
						}
					},

					// Fetch wishlist from server (for authenticated users)
					fetchWishlist: async () => {
						const isAuth = get().isAuthenticated();
						if (!isAuth) return;

						set({ isLoading: true, syncError: null });

						try {
							const data = await wishlistAPI.fetchWishlist();
							const serverItems = data.wishlist.products.map((item) => ({
								id: item.product._id,
								name: item.product.title,
								description: item.product.description,
								price: item.product.salePrice || item.product.price,
								originalPrice: item.product.price,
								image:
									item.product.images?.[0] ||
									"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png",
								inStock: item.product.inStock,
								category: item.product.category,
								addedAt: item.addedAt,
							}));

							set({
								items: serverItems,
								serverWishlist: data.wishlist,
								lastSyncTime: Date.now(),
							});
                                                } catch (error) {
                                                        if (error.message === "UNAUTHORIZED") {
                                                                handleUnauthorized();
                                                        } else {
                                                                set({ syncError: error.message });
                                                                console.error("Wishlist fetch error:", error);
                                                        }
                                                } finally {
                                                        set({ isLoading: false });
                                                }
					},

					// Handle authentication state changes
					handleAuthChange: (isAuth) => {
						if (isAuth) {
							// User just logged in - fetch their server wishlist
							get().fetchWishlist();
						} else {
							// User logged out - clear server data but keep local wishlist
							set({
								serverWishlist: null,
								lastSyncTime: null,
								syncError: null,
							});
						}
					},

					// UI state management
					toggleWishlist: () => set({ isOpen: !get().isOpen }),
					openWishlist: () => set({ isOpen: true }),
					closeWishlist: () => set({ isOpen: false }),

					// Getters
					getTotalItems: () => {
						return get().items.length;
					},

					getItemById: (productId) => {
						return get().items.find((item) => item.id === productId);
					},

					isItemInWishlist: (productId) => {
						return get().items.some((item) => item.id === productId);
					},

					getWishlistSummary: () => {
						const { items } = get();
						return {
							itemCount: items.length,
							items,
						};
					},

					// Move to cart functionality
					moveToCart: async (productId, addToCartFn) => {
						const item = get().getItemById(productId);
						if (!item) return;

						try {
							// Add to cart
							await addToCartFn(item, 1);
							// Remove from wishlist
							await get().removeItem(productId);
							toast.success("Moved to cart!");
						} catch (error) {
							toast.error("Failed to move to cart");
						}
					},

					// Move all to cart functionality
					moveAllToCart: async (addToCartFn) => {
						const { items } = get();

						if (items.length === 0) {
							toast.error("Wishlist is empty");
							return;
						}

						set({ isLoading: true });

						try {
							for (const item of items) {
								await addToCartFn(item, 1);
							}
							await get().clearWishlist();
							toast.success("All items moved to cart!");
						} catch (error) {
							toast.error("Failed to move some items to cart");
						} finally {
							set({ isLoading: false });
						}
					},
				}),
				{
					name: "wishlist-storage",
					partialize: (state) => ({
						// Only persist local wishlist data for non-authenticated users
						items: state.items,
					}),
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
			useWishlistStore.getState().handleAuthChange(isAuthenticated);
		}
	);

	// Auto-fetch wishlist when user becomes authenticated
	useAuthStore.subscribe(
		(state) => state.user,
		(user) => {
			if (user) {
				// User just logged in, fetch their wishlist
				setTimeout(() => {
					useWishlistStore.getState().fetchWishlist();
				}, 100); // Small delay to ensure auth state is fully set
			}
		}
	);
}
