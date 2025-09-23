"use client";

import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useAdminCouponStore = create((set, get) => ({
	// State
	coupons: [],
	isLoading: false,
	error: null,
	filters: {
		search: "",
		published: null,
		status: "all",
	},
	pagination: {
		currentPage: 1,
		totalPages: 1,
		totalCoupons: 0,
		limit: 10,
	},
	selectedCoupons: [],
	sortBy: "createdAt",
	sortOrder: "desc",

	// Actions
        fetchCoupons: async () => {
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

                        const response = await fetch(`/api/admin/coupons?${params}`, {
                                cache: "no-store",
                        });
                        const data = await response.json();

                        if (data.success) {
                                set({
                                        coupons: data.coupons,
                                        pagination: data.pagination,
                                        isLoading: false,
                                });
                        } else {
                                set({ error: data.message, isLoading: false });
                        }
                } catch (error) {
                        set({
                                error: "Failed to fetch coupons",
                                isLoading: false,
                        });
                }
        },

	addCoupon: async (couponData) => {
		try {
			const response = await fetch("/api/admin/coupons", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(couponData),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Coupon added successfully");
				get().fetchCoupons();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to add coupon");
			return false;
		}
	},

        updateCoupon: async (couponId, updateData) => {
                try {
                        const response = await fetch("/api/admin/coupons", {
                                method: "PUT",
                                headers: {
                                        "Content-Type": "application/json",
				},
				body: JSON.stringify({ couponId, ...updateData }),
			});

			const data = await response.json();

                        if (data.success) {
                                if (data.coupon) {
                                        set((state) => ({
                                                coupons: state.coupons.map((coupon) =>
                                                        coupon._id === couponId
                                                                ? { ...coupon, ...data.coupon }
                                                                : coupon
                                                ),
                                        }));
                                }
                                toast.success("Coupon updated successfully");
                                get().fetchCoupons();
                                return true;
                        } else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to update coupon");
			return false;
		}
	},

	deleteCoupon: async (couponId) => {
		try {
			const response = await fetch("/api/admin/coupons", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ couponId }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success("Coupon deleted successfully");
				get().fetchCoupons();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete coupon");
			return false;
		}
	},

	deleteMultipleCoupons: async (couponIds) => {
		try {
			const response = await fetch("/api/admin/coupons", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ couponIds }),
			});

			const data = await response.json();

			if (data.success) {
				toast.success(data.message);
				set({ selectedCoupons: [] });
				get().fetchCoupons();
				return true;
			} else {
				toast.error(data.message);
				return false;
			}
		} catch (error) {
			toast.error("Failed to delete coupons");
			return false;
		}
	},

	// Utility functions
	generateCouponCode: () => {
		const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		let result = "";
		for (let i = 0; i < 8; i++) {
			result += chars.charAt(Math.floor(Math.random() * chars.length));
		}
		return result;
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
				status: "all",
			},
			pagination: { ...get().pagination, currentPage: 1 },
		});
		get().fetchCoupons();
	},

	setPage: (page) => {
		set((state) => ({
			pagination: { ...state.pagination, currentPage: page },
		}));
		get().fetchCoupons();
	},

	setSorting: (sortBy, order) => {
		set({ sortBy, sortOrder: order });
		get().fetchCoupons();
	},

	// Selection actions
	selectCoupon: (couponId) => {
		set((state) => ({
			selectedCoupons: [...state.selectedCoupons, couponId],
		}));
	},

	deselectCoupon: (couponId) => {
		set((state) => ({
			selectedCoupons: state.selectedCoupons.filter((id) => id !== couponId),
		}));
	},

	selectAllCoupons: () => {
		set((state) => ({
			selectedCoupons: state.coupons.map((coupon) => coupon._id),
		}));
	},

	clearSelection: () => {
		set({ selectedCoupons: [] });
	},

	toggleCouponSelection: (couponId) => {
		const { selectedCoupons } = get();
		if (selectedCoupons.includes(couponId)) {
			get().deselectCoupon(couponId);
		} else {
			get().selectCoupon(couponId);
		}
	},

	// Export functionality
	exportToCSV: () => {
		const { coupons } = get();
		const csvContent = [
			[
				"ID",
				"Name",
				"Code",
				"Discount",
				"Start Date",
				"End Date",
				"Status",
				"Published",
			].join(","),
			...coupons.map((coupon) =>
				[
					coupon._id,
					`"${coupon.name}"`,
					coupon.code,
					`${coupon.discount}%`,
					new Date(coupon.startDate).toLocaleDateString(),
					new Date(coupon.endDate).toLocaleDateString(),
					coupon.status,
					coupon.published ? "Yes" : "No",
				].join(",")
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "coupons.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	},

	exportToJSON: () => {
		const { coupons } = get();
		const jsonContent = JSON.stringify(coupons, null, 2);
		const blob = new Blob([jsonContent], { type: "application/json" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "coupons.json";
		a.click();
		window.URL.revokeObjectURL(url);
	},
}));
