"use client";

import { create } from "zustand";
import { toast } from "sonner";

export const useAdminProductStore = create((set, get) => ({
	// State
	products: [],
	isLoading: false,
	error: null,
	filters: {
		search: "",
		category: "all",
		minPrice: "",
		maxPrice: "",
		discount: "",
		published: null,
		inStock: null,
	},
	pagination: {
		currentPage: 1,
		totalPages: 1,
		totalProducts: 0,
		limit: 10,
	},
	selectedProducts: [],
	sortBy: "createdAt",
	sortOrder: "desc",

	// Actions
	fetchProducts: async () => {
		set({ isLoading: true, error: null });

		try {
			const { filters, pagination, sortBy, sortOrder } = get();

			const params = new URLSearchParams({
				page: pagination.currentPage.toString(),
				limit: pagination.limit.toString(),
				sort: sortBy,
				order: sortOrder,
			});

			// Add filters to params
			Object.entries(filters).forEach(([key, value]) => {
				if (
					value !== null &&
					value !== undefined &&
					value !== "" &&
					value !== "all"
				) {
					params.append(key, value.toString());
				}
			});

			const response = await fetch(`/api/admin/product/getAllProducts?${params}`);
			const data = await response.json();

			if (data.success) {
				set({
					products: data.products,
					pagination: data.pagination,
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

	addProduct: async (productData) => {
		try {
			const response = await fetch("/api/admin/product/addProduct", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(productData),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Product added successfully");
				get().fetchProducts(); // Refresh the list
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to add product");
			return false;
		}
	},

	updateProduct: async (productId, updateData) => {
		try {
			const response = await fetch("/api/admin/product/updateProduct", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ productId, ...updateData }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Product updated successfully");
				get().fetchProducts(); // Refresh the list
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to update product");
			return false;
		}
	},

	deleteProduct: async (productId) => {
		try {
			const response = await fetch("/api/admin/product/deleteProduct", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ productId }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Product deleted successfully");
				get().fetchProducts(); // Refresh the list
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete product");
			return false;
		}
	},

	deleteMultipleProducts: async (productIds) => {
		try {
			const response = await fetch("/api/admin/product/deleteMultipleProduct", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ productIds }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				set({ selectedProducts: [] }); // Clear selection
				get().fetchProducts(); // Refresh the list
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete products");
			return false;
		}
	},

	bulkUploadProducts: async (products) => {
		try {
			const response = await fetch("/api/admin/product/bulkUploadProduct", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ products }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				get().fetchProducts(); // Refresh the list
				return data.results;
			} else {
				toast.error(data.message);
				return null;
			}
		} catch (error) {
			toast.error("Failed to bulk upload products");
			return null;
		}
	},

	// Filter and pagination actions
	setFilters: (newFilters) => {
		set((state) => ({
			filters: { ...state.filters, ...newFilters },
			pagination: { ...state.pagination, currentPage: 1 },
		}));
	},

	resetFilters: () => {
		set({
			filters: {
				search: "",
				category: "all",
				minPrice: "",
				maxPrice: "",
				discount: "",
				published: null,
				inStock: null,
			},
			pagination: { ...get().pagination, currentPage: 1 },
		});
		get().fetchProducts();
	},

	setPage: (page) => {
		set((state) => ({
			pagination: { ...state.pagination, currentPage: page },
		}));
		get().fetchProducts();
	},

	setSorting: (sortBy, order) => {
		set({ sortBy, sortOrder: order });
		get().fetchProducts();
	},

	// Selection actions
	selectProduct: (productId) => {
		set((state) => ({
			selectedProducts: [...state.selectedProducts, productId],
		}));
	},

	deselectProduct: (productId) => {
		set((state) => ({
			selectedProducts: state.selectedProducts.filter((id) => id !== productId),
		}));
	},

	selectAllProducts: () => {
		set((state) => ({
			selectedProducts: state.products.map((product) => product._id),
		}));
	},

	clearSelection: () => {
		set({ selectedProducts: [] });
	},

	toggleProductSelection: (productId) => {
		const { selectedProducts } = get();
		if (selectedProducts.includes(productId)) {
			get().deselectProduct(productId);
		} else {
			get().selectProduct(productId);
		}
	},
}));
