// "use client";

// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// // Product data
// import productsData from "@/constants/products.js";

// // Product Store
// const useProductStore = create((set, get) => ({
// 	// State
// 	products: productsData,
// 	filteredProducts: productsData,
// 	currentCategory: "all",
// 	currentPage: 1,
// 	searchQuery: "",
// 	filters: {
// 		categories: [],
// 		priceRange: [0, Math.max(...productsData.map((p) => p.price)) + 1000],
// 		inStock: false,
// 	},

// 	// Actions
// 	setCurrentCategory: (category) => {
// 		set({ currentCategory: category, currentPage: 1 });
// 		get().applyFilters();
// 	},

// 	setCurrentPage: (page) => set({ currentPage: page }),

// 	setSearchQuery: (query) => {
// 		set({ searchQuery: query, currentPage: 1 });
// 		get().applyFilters();
// 	},

// 	setFilters: (newFilters) => {
// 		set((state) => ({
// 			filters: { ...state.filters, ...newFilters },
// 			currentPage: 1,
// 		}));
// 		get().applyFilters();
// 	},

// 	applyFilters: () => {
// 		const { products, currentCategory, searchQuery, filters } = get();

// 		let filtered = products;

// 		// Filter by category - Use currentCategory OR filters.categories, not both
// 		if (currentCategory !== "all") {
// 			// If currentCategory is set, use it (this takes priority)
// 			filtered = filtered.filter(
// 				(product) => product.category === currentCategory
// 			);
// 		} else if (filters.categories.length > 0) {
// 			// Only use filters.categories if currentCategory is "all"
// 			filtered = filtered.filter((product) =>
// 				filters.categories.includes(product.category)
// 			);
// 		}

// 		// Filter by search query
// 		if (searchQuery) {
// 			filtered = filtered.filter(
// 				(product) =>
// 					product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// 					product.description.toLowerCase().includes(searchQuery.toLowerCase())
// 			);
// 		}

// 		// Filter by price range
// 		filtered = filtered.filter(
// 			(product) =>
// 				product.price >= filters.priceRange[0] &&
// 				product.price <= filters.priceRange[1]
// 		);

// 		// Filter by stock - Only apply if inStock filter is explicitly enabled
// 		if (filters.inStock) {
// 			filtered = filtered.filter((product) => product.inStock === true);
// 		}

// 		set({ filteredProducts: filtered });
// 	},

// 	getProductById: (id) => {
// 		const { products } = get();
// 		return products.find((product) => product.id === id);
// 	},

// 	// Get featured product based on current category
// 	getFeaturedProduct: () => {
// 		const { products, currentCategory } = get();

// 		// If a specific category is selected, get featured product from that category
// 		if (currentCategory !== "all") {
// 			const featuredProduct = products.find(
// 				(product) =>
// 					product.featured === true && product.category === currentCategory
// 			);

// 			return featuredProduct;
// 		}

// 		// If "all" category, return any featured product
// 		const anyFeaturedProduct = products.find(
// 			(product) => product.featured === true
// 		);

// 		// Log the details of the found product if it exists

// 		return anyFeaturedProduct;
// 	},
// }));

// export default useProductStore;

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
