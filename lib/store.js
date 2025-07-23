"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
// Product data
import productsData from "@/constants/products.js";

// Product Store
export const useProductStore = create((set, get) => ({
	// State
	products: productsData,
	filteredProducts: productsData,
	currentCategory: "all",
	currentPage: 1,
	searchQuery: "",
	filters: {
		categories: [],
		priceRange: [0, Math.max(...productsData.map((p) => p.price)) + 1000],
		inStock: false,
	},

	// Actions
	setCurrentCategory: (category) => {
		set({ currentCategory: category, currentPage: 1 });
		get().applyFilters();
	},

	setCurrentPage: (page) => set({ currentPage: page }),

	setSearchQuery: (query) => {
		set({ searchQuery: query, currentPage: 1 });
		get().applyFilters();
	},

	setFilters: (newFilters) => {
		set((state) => ({
			filters: { ...state.filters, ...newFilters },
			currentPage: 1,
		}));
		get().applyFilters();
	},

	applyFilters: () => {
		const { products, currentCategory, searchQuery, filters } = get();

		let filtered = products;

		// Filter by category - Use currentCategory OR filters.categories, not both
		if (currentCategory !== "all") {
			// If currentCategory is set, use it (this takes priority)
			filtered = filtered.filter(
				(product) => product.category === currentCategory
			);
		} else if (filters.categories.length > 0) {
			// Only use filters.categories if currentCategory is "all"
			filtered = filtered.filter((product) =>
				filters.categories.includes(product.category)
			);
		}

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(product) =>
					product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					product.description.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		// Filter by price range
		filtered = filtered.filter(
			(product) =>
				product.price >= filters.priceRange[0] &&
				product.price <= filters.priceRange[1]
		);

		// Filter by stock - Only apply if inStock filter is explicitly enabled
		if (filters.inStock) {
			filtered = filtered.filter((product) => product.inStock === true);
		}

		set({ filteredProducts: filtered });
	},

	getProductById: (id) => {
		const { products } = get();
		return products.find((product) => product.id === id);
	},

	// Get featured product based on current category
	getFeaturedProduct: () => {
		const { products, currentCategory } = get();

		// If a specific category is selected, get featured product from that category
		if (currentCategory !== "all") {
			const featuredProduct = products.find(
				(product) =>
					product.featured === true && product.category === currentCategory
			);

			return featuredProduct;
		}

		// If "all" category, return any featured product
		const anyFeaturedProduct = products.find(
			(product) => product.featured === true
		);

		// Log the details of the found product if it exists

		return anyFeaturedProduct;
	},
}));

// Cart Store
export const useCartStore = create(
	persist(
		(set, get) => ({
			// State
			items: [],
			isOpen: false,

			// Actions
			addItem: (product) => {
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
			},

			removeItem: (productId) => {
				set({ items: get().items.filter((item) => item.id !== productId) });
			},

			updateQuantity: (productId, quantity) => {
				if (quantity <= 0) {
					get().removeItem(productId);
					return;
				}

				set({
					items: get().items.map((item) =>
						item.id === productId ? { ...item, quantity } : item
					),
				});
			},

			clearCart: () => set({ items: [] }),

			toggleCart: () => set({ isOpen: !get().isOpen }),

			openCart: () => set({ isOpen: true }),

			closeCart: () => set({ isOpen: false }),

			// Getters
			getTotalItems: () => {
				return get().items.reduce((total, item) => total + item.quantity, 0);
			},

			getTotalPrice: () => {
				return get().items.reduce(
					(total, item) => total + item.price * item.quantity,
					0
				);
			},
		}),
		{
			name: "cart-storage",
		}
	)
);
