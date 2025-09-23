"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useAdminCategoryStore = create((set, get) => ({
	// State
	categories: [],
	isLoading: false,
	error: null,
	filters: {
		search: "",
		published: null,
	},
	pagination: {
		currentPage: 1,
		totalPages: 1,
		totalCategories: 0,
		limit: 10,
	},
	selectedCategories: [],
	sortBy: "createdAt",
	sortOrder: "desc",

	// Actions
	fetchCategories: async () => {
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
				if (value !== null && value !== undefined && value !== "") {
					params.append(key, value.toString());
				}
			});

			const response = await fetch(`/api/admin/categories?${params}`);
			const data = await response.json();

			if (data.success) {
				set({
					categories: data.categories,
					pagination: data.pagination,
					isLoading: false,
				});
			} else {
				set({ error: data.message, isLoading: false });
			}
		} catch (error) {
			set({
				error: "Failed to fetch categories",
				isLoading: false,
			});
		}
	},

	addCategory: async (categoryData) => {
		try {
			const response = await fetch("/api/admin/categories", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(categoryData),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Category added successfully");
				get().fetchCategories();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to add category");
			return false;
		}
	},

	updateCategory: async (categoryId, updateData) => {
		try {
			const response = await fetch("/api/admin/categories", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ categoryId, ...updateData }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Category updated successfully");
				get().fetchCategories();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to update category");
			return false;
		}
	},

	deleteCategory: async (categoryId) => {
		try {
			const response = await fetch("/api/admin/categories", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ categoryId }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Category deleted successfully");
				get().fetchCategories();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete category");
			return false;
		}
	},

	deleteMultipleCategories: async (categoryIds) => {
		try {
			const response = await fetch("/api/admin/categories", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ categoryIds }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				set({ selectedCategories: [] });
				get().fetchCategories();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete categories");
			return false;
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
				published: null,
			},
			pagination: { ...get().pagination, currentPage: 1 },
		});
		get().fetchCategories();
	},

	setPage: (page) => {
		set((state) => ({
			pagination: { ...state.pagination, currentPage: page },
		}));
		get().fetchCategories();
	},

	setSorting: (sortBy, order) => {
		set({ sortBy, sortOrder: order });
		get().fetchCategories();
	},

	// Selection actions
	selectCategory: (categoryId) => {
		set((state) => ({
			selectedCategories: [...state.selectedCategories, categoryId],
		}));
	},

	deselectCategory: (categoryId) => {
		set((state) => ({
			selectedCategories: state.selectedCategories.filter(
				(id) => id !== categoryId
			),
		}));
	},

	selectAllCategories: () => {
		set((state) => ({
			selectedCategories: state.categories.map((category) => category._id),
		}));
	},

	clearSelection: () => {
		set({ selectedCategories: [] });
	},

	toggleCategorySelection: (categoryId) => {
		const { selectedCategories } = get();
		if (selectedCategories.includes(categoryId)) {
			get().deselectCategory(categoryId);
		} else {
			get().selectCategory(categoryId);
		}
	},

	// Export functionality
	exportToCSV: () => {
		const { categories } = get();
		const csvContent = [
			[
				"ID",
				"Name",
				"Subcategories",
				"Published",
				"Product Count",
				"Created At",
			].join(","),
			...categories.map((category) =>
				[
					category._id,
					`"${category.name}"`,
					category.subCategories ? category.subCategories.length : 0,
					category.published ? "Yes" : "No",
					category.productCount || 0,
					category.createdAt
						? new Date(category.createdAt).toLocaleDateString()
						: "",
				].join(",")
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "categories.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	},

	exportToJSON: () => {
		const { categories } = get();
		const jsonContent = JSON.stringify(categories, null, 2);
		const blob = new Blob([jsonContent], { type: "application/json" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "categories.json";
		a.click();
		window.URL.revokeObjectURL(url);
	},
}));
