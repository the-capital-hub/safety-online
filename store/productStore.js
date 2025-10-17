"use client";

import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";
import { ensureSlug } from "@/lib/slugify.js";

const normalizeCategorySlug = (value) => {
        if (!value) {
                return "";
        }

        const trimmedValue = value.toString().trim();

        if (trimmedValue.toLowerCase() === "all") {
                return "all";
        }

        return ensureSlug(trimmedValue);
};

const normalizeSubCategorySlug = (value) => ensureSlug(value);

export const useProductStore = create(
	devtools(
		persist(
			(set, get) => ({
                                // Initial State
                                products: [],
                                filteredProducts: [],
                                suggestions: [],
				filters: {
					categories: [],
					priceRange: [0, 10000],
					inStock: false,
					discount: 0,
					type: "",
				},
				availableFilters: null,
				currentCategory: "all",
				currentSubCategory: "",
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
							currentSubCategory,
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

						// Handle category and subcategory logic
                                                if (currentSubCategory && currentSubCategory !== "") {
                                                        // If subcategory is selected, use it (and the backend should handle the parent category)
                                                        params.append(
                                                                "subCategory",
                                                                normalizeSubCategorySlug(currentSubCategory)
                                                        );
                                                } else if (currentCategory && currentCategory !== "all") {
                                                        // Only use main category if no subcategory is selected
                                                        params.append(
                                                                "category",
                                                                normalizeCategorySlug(currentCategory)
                                                        );
                                                }

						if (searchQuery) {
							params.append("search", searchQuery);
						}

						// Price range filters
						const { availableFilters } = get();
						const defaultMinPrice = availableFilters?.priceRange?.min || 0;
						const defaultMaxPrice = availableFilters?.priceRange?.max || 10000;

						if (filters.priceRange[0] > defaultMinPrice) {
							params.append("minPrice", filters.priceRange[0].toString());
						}

						if (filters.priceRange[1] < defaultMaxPrice) {
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

						// console.log("Fetching products with params:", params.toString());

						const response = await fetch(`/api/products?${params}`);
						const data = await response.json();

                                                if (data.success) {
                                                        set({
                                                                products: data.products,
                                                                filteredProducts: data.products,
                                                                totalPages: data.pagination.totalPages,
                                                                suggestions: data.suggestions || [],
                                                                isLoading: false,
                                                        });
                                                } else {
                                                        set({
                                                                error: data.message,
                                                                isLoading: false,
                                                                suggestions: [],
                                                        });
                                                }
                                        } catch (error) {
                                                console.error("Fetch products error:", error);
                                                set({
                                                        error: "Failed to fetch products",
                                                        isLoading: false,
                                                        suggestions: [],
                                                });
                                        }
                                },

				fetchFilters: async () => {
					try {
						const response = await fetch("/api/products/filters");
						const data = await response.json();

						if (data.success) {
							set((state) => ({
								availableFilters: data.filters,
								// Update filters with actual min/max from backend
								filters: {
									...state.filters,
									priceRange: [
										data.filters.priceRange.min,
										data.filters.priceRange.max,
									],
								},
							}));
						}
					} catch (error) {
						console.error("Failed to fetch filters:", error);
					}
				},

				setCurrentCategory: (category) => {
					console.log("Setting current category to:", category);
                                        const normalizedCategory = normalizeCategorySlug(category);

                                        set({
                                                currentCategory: normalizedCategory || "all",
                                                currentSubCategory: "", // Clear subcategory when changing main category
                                                currentPage: 1,
                                        });
                                        // Automatically fetch products when category changes
                                        setTimeout(() => get().fetchProducts(), 0);
                                },

                                setCurrentSubCategory: (subCategory) => {
                                        console.log("Setting current subcategory to:", subCategory);

                                        // If setting a subcategory, find and set the parent category
                                        if (subCategory && subCategory !== "") {
                                                const normalizedSubCategory = normalizeSubCategorySlug(
                                                        subCategory
                                                );

                                                const { availableFilters } = get();
                                                const parentCategory = availableFilters?.categories?.find((cat) =>
                                                        cat.subCategories?.some(
                                                                (subCat) => subCat.id === normalizedSubCategory
                                                        )
                                                );

                                                if (parentCategory) {
                                                        set({
                                                                currentCategory: parentCategory.id,
                                                                currentSubCategory: normalizedSubCategory,
                                                                currentPage: 1,
                                                        });
                                                } else {
                                                        set({
                                                                currentSubCategory: normalizedSubCategory,
                                                                currentPage: 1,
                                                        });
                                                }
                                        } else {
                                                // Clearing subcategory
                                                set({ currentSubCategory: "", currentPage: 1 });
                                        }

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

				// Reset filters properly
				resetFilters: () => {
					const { availableFilters } = get();
					const defaultFilters = {
						categories: [],
						priceRange: availableFilters
							? [
									availableFilters.priceRange.min,
									availableFilters.priceRange.max,
							  ]
							: [0, 10000],
						inStock: false,
						discount: 0,
						type: "",
					};

                                        set({
                                                filters: defaultFilters,
                                                currentCategory: "all",
                                                currentSubCategory: "",
                                                currentPage: 1,
                                                searchQuery: "",
                                                suggestions: [],
                                        });

					// Fetch products after reset
					setTimeout(() => get().fetchProducts(), 0);
				},

				getProductById: async (id) => {
					try {
						const response = await fetch(`/api/product/${id}`, {
							method: "GET",
						});

						const data = await response.json();

						if (data.success) {
							return data.product;
						}

						return null;
					} catch (error) {
						console.error("Failed to fetch product:", error);
						return null;
					}
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
					currentSubCategory: state.currentSubCategory,
					filters: state.filters,
					sortBy: state.sortBy,
					sortOrder: state.sortOrder,
				}),
			}
		)
	)
);
