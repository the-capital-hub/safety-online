import { create } from "zustand";

export const useAdminOrderStore = create((set, get) => ({
	// State
	orders: [],
	currentOrder: null,
	loading: false,
	error: null,
	pagination: {
		currentPage: 1,
		totalPages: 1,
		totalOrders: 0,
		hasNext: false,
		hasPrev: false,
	},
	stats: {
		totalOrders: 0,
		totalRevenue: 0,
		pendingOrders: 0,
		completedOrders: 0,
	},
	filters: {
		search: "",
		status: "all",
		paymentMethod: "all",
		startDate: "",
		endDate: "",
		page: 1,
		limit: 10,
	},

	// Actions
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),
	setFilters: (filters) =>
		set((state) => ({
			filters: { ...state.filters, ...filters },
		})),
	resetFilters: () =>
		set({
			filters: {
				search: "",
				status: "all",
				paymentMethod: "all",
				startDate: "",
				endDate: "",
				page: 1,
				limit: 10,
			},
		}),

	// Fetch orders
	fetchOrders: async () => {
		const { filters } = get();
		set({ loading: true, error: null });

		try {
			const queryParams = new URLSearchParams();
			Object.entries(filters).forEach(([key, value]) => {
				if (value && value !== "all") {
					queryParams.append(key, value);
				}
			});

			const response = await fetch(`/api/admin/orders?${queryParams}`);
			const data = await response.json();

			if (data.success) {
				set({
					orders: data.orders,
					pagination: data.pagination,
					stats: data.stats,
					loading: false,
				});
			} else {
				set({ error: data.message, loading: false });
			}
		} catch (error) {
			set({ error: "Failed to fetch orders", loading: false });
		}
	},

	// Fetch single order
	fetchOrder: async (id) => {
		set({ loading: true, error: null });

		try {
			const response = await fetch(`/api/admin/orders/${id}`);
			const data = await response.json();

			if (data.success) {
				set({ currentOrder: data.order, loading: false });
			} else {
				set({ error: data.message, loading: false });
			}
		} catch (error) {
			set({ error: "Failed to fetch order", loading: false });
		}
	},

	// Update order
	updateOrder: async (id, updateData) => {
		set({ loading: true, error: null });

		try {
			const response = await fetch(`/api/admin/orders/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(updateData),
			});

			const data = await response.json();

			if (data.success) {
				set((state) => ({
					orders: state.orders.map((order) =>
						order._id === id ? data.order : order
					),
					currentOrder: data.order,
					loading: false,
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: "Failed to update order", loading: false });
			return { success: false, message: "Failed to update order" };
		}
	},

	// Delete order
	deleteOrder: async (id) => {
		set({ loading: true, error: null });

		try {
			const response = await fetch(`/api/admin/orders/${id}`, {
				method: "DELETE",
			});

			const data = await response.json();

			if (data.success) {
				set((state) => ({
					orders: state.orders.filter((order) => order._id !== id),
					loading: false,
				}));
				return { success: true, message: data.message };
			} else {
				set({ error: data.message, loading: false });
				return { success: false, message: data.message };
			}
		} catch (error) {
			set({ error: "Failed to delete order", loading: false });
			return { success: false, message: "Failed to delete order" };
		}
	},

	// Download invoice
	downloadInvoice: async (orderId, orderNumber) => {
		try {
			const response = await fetch(`/api/admin/orders/${orderId}/invoice`);

			if (response.ok) {
				const blob = await response.blob();
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `invoice-${orderNumber}.pdf`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
				return { success: true };
			} else {
				return { success: false, message: "Failed to download invoice" };
			}
		} catch (error) {
			return { success: false, message: "Failed to download invoice" };
		}
	},

	// Bulk operations
	bulkUpdateStatus: async (orderIds, status) => {
		set({ loading: true, error: null });

		try {
			const promises = orderIds.map((id) =>
				fetch(`/api/admin/orders/${id}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status }),
				})
			);

			await Promise.all(promises);

			// Refresh orders
			await get().fetchOrders();

			return { success: true, message: "Orders updated successfully" };
		} catch (error) {
			set({ error: "Failed to update orders", loading: false });
			return { success: false, message: "Failed to update orders" };
		}
	},
}));
