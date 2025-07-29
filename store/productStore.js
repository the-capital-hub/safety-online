"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useProductStore = create(
	persist(
		(set, get) => ({
			// Initial State
			products: [],
			filteredProducts: [],
			filters: {
				categories: [],
				priceRange: [0, 10000],
				inStock: false,
				discount: 0,
				type: "",
			},
			availableFilters: null,
			currentCategory: "all",
			currentPage: 1,
			totalPages: 1,
			searchQuery: "",
			isLoading: false,
			error: null,
			sortBy: "createdAt",
			sortOrder: "desc",

			// Actions
			fetchProducts: async () => {
				set({ isLoading: true, error: null });

				try {
					const {
						currentCategory,
						searchQuery,
						filters,
						currentPage,
						sortBy,
						sortOrder,
					} = get();

					const params = new URLSearchParams({
						page: currentPage.toString(),
						limit: "12",
						sort: sortBy,
						order: sortOrder,
					});

					if (currentCategory !== "all") {
						params.append("category", currentCategory);
					}

					if (searchQuery) {
						params.append("search", searchQuery);
					}

					if (filters.priceRange[0] > 0) {
						params.append("minPrice", filters.priceRange[0].toString());
					}

					if (filters.priceRange[1] < 10000) {
						params.append("maxPrice", filters.priceRange[1].toString());
					}

					if (filters.inStock) {
						params.append("inStock", "true");
					}

					if (filters.discount > 0) {
						params.append("discount", filters.discount.toString());
					}

					if (filters.type) {
						params.append("type", filters.type);
					}

					const response = await fetch(`/api/products?${params}`);
					const data = await response.json();

					if (data.success) {
						set({
							products: data.products,
							filteredProducts: data.products,
							totalPages: data.pagination.totalPages,
							isLoading: false,
						});
					} else {
						set({ error: data.message, isLoading: false });
					}
				} catch (error) {
					set({
						error: "Failed to fetch products",
						isLoading: false,
					});
				}
			},

			fetchFilters: async () => {
				try {
					const response = await fetch("/api/products/filters");
					const data = await response.json();

					if (data.success) {
						set({
							availableFilters: data.filters,
							filters: {
								...get().filters,
								priceRange: [
									data.filters.priceRange.min,
									data.filters.priceRange.max,
								],
							},
						});
					}
				} catch (error) {
					console.error("Failed to fetch filters:", error);
				}
			},

			setCurrentCategory: (category) => {
				set({
					currentCategory: category,
					currentPage: 1,
				});
				get().fetchProducts();
			},

			setCurrentPage: (page) => {
				set({ currentPage: page });
				get().fetchProducts();
			},

			setSearchQuery: (query) => {
				set({
					searchQuery: query,
					currentPage: 1,
				});
				get().fetchProducts();
			},

			setFilters: (newFilters) => {
				set((state) => ({
					filters: { ...state.filters, ...newFilters },
					currentPage: 1,
				}));
			},

			setSorting: (sortBy, order) => {
				set({ sortBy, sortOrder: order, currentPage: 1 });
				get().fetchProducts();
			},

			applyFilters: async () => {
				set({ currentPage: 1 });
				await get().fetchProducts();
			},

			getProductById: (id) => {
				return get().products.find((product) => product.id === id);
			},

			addToCart: async (productId, quantity = 1) => {
				try {
					const response = await fetch(
						`/api/products/add-to-cart/${productId}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({ quantity }),
						}
					);

					const data = await response.json();
					return data.success;
				} catch (error) {
					console.error("Failed to add to cart:", error);
					return false;
				}
			},

			buyNow: async (productId, quantity = 1) => {
				try {
					const response = await fetch(`/api/products/buy-now/${productId}`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ quantity }),
					});

					const data = await response.json();

					if (data.success) {
						return data.redirectUrl;
					}

					return null;
				} catch (error) {
					console.error("Failed to process buy now:", error);
					return null;
				}
			},
		}),
		{
			name: "product-store",
			partialize: (state) => ({
				currentCategory: state.currentCategory,
				filters: state.filters,
				sortBy: state.sortBy,
				sortOrder: state.sortOrder,
			}),
		}
	)
);
