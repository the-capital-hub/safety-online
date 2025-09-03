import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useOrderStore = create(
	devtools(
		persist(
			(set, get) => ({
				// State
				orders: [],
				currentOrder: null,
				loading: false,
				error: null,
				filters: {
					status: "all",
					dateRange: "all",
					page: 1,
					limit: 10,
				},
				pagination: {
					currentPage: 1,
					totalPages: 1,
					totalOrders: 0,
					hasNext: false,
					hasPrev: false,
				},
				stats: null,

				// Actions
				setLoading: (loading) => set({ loading }),
				setError: (error) => set({ error }),
				setFilters: (newFilters) =>
					set((state) => ({
						filters: { ...state.filters, ...newFilters },
					})),

				// Clear error
				clearError: () => set({ error: null }),

				// Fetch orders with optional filters
				fetchOrders: async (customFilters = null) => {
					const { filters } = get();
					const activeFilters = customFilters || filters;

					set({ loading: true, error: null });

					try {
						const queryParams = new URLSearchParams();

						// Add pagination
						queryParams.append("page", activeFilters.page?.toString() || "1");
						queryParams.append(
							"limit",
							activeFilters.limit?.toString() || "10"
						);

						// Add other filters
						Object.entries(activeFilters).forEach(([key, value]) => {
							if (
								value &&
								value !== "all" &&
								key !== "page" &&
								key !== "limit"
							) {
								queryParams.append(key, value);
							}
						});

						const response = await fetch(`/api/orders?${queryParams}`);

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

						const data = await response.json();

						if (data.success) {
							set({
								orders: data.orders,
								pagination: {
									currentPage: data.pagination.currentPage,
									totalPages: data.pagination.totalPages,
									totalOrders: data.pagination.totalOrders,
									hasNext: data.pagination.hasNextPage,
									hasPrev: data.pagination.hasPrevPage,
								},
								stats: data.stats,
								loading: false,
								error: null,
							});
						} else {
							set({
								error: data.message || "Failed to fetch orders",
								loading: false,
							});
						}
					} catch (error) {
						console.error("Fetch orders error:", error);
						set({
							error: error.message || "Failed to fetch orders",
							loading: false,
						});
					}
				},

				// Fetch single order
				fetchOrder: async (id) => {
					set({ loading: true, error: null });

					try {
						const response = await fetch(`/api/orders/${id}`);

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

						const data = await response.json();

						if (data.success) {
							set({
								currentOrder: data.order,
								loading: false,
								error: null,
							});
							return data.order;
						} else {
							set({
								error: data.message || "Failed to fetch order",
								loading: false,
							});
							throw new Error(data.message || "Failed to fetch order");
						}
					} catch (error) {
						console.error("Fetch order error:", error);
						set({
							error: error.message || "Failed to fetch order",
							loading: false,
						});
						throw error;
					}
				},

				// Download invoice
				downloadInvoice: async (orderId, orderNumber) => {
					try {
						const response = await fetch(`/api/orders/${orderId}/invoice`);

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

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
							const errorData = await response.json();
							return {
								success: false,
								message: errorData.message || "Failed to download invoice",
							};
						}
					} catch (error) {
						console.error("Download invoice error:", error);
						return {
							success: false,
							message: error.message || "Failed to download invoice",
						};
					}
				},

				// Pagination helpers
				goToPage: async (page) => {
					const { filters, fetchOrders } = get();
					const newFilters = { ...filters, page };
					set({ filters: newFilters });
					await fetchOrders(newFilters);
				},

				nextPage: async () => {
					const { pagination, goToPage } = get();
					if (pagination.hasNext) {
						await goToPage(pagination.currentPage + 1);
					}
				},

				prevPage: async () => {
					const { pagination, goToPage } = get();
					if (pagination.hasPrev) {
						await goToPage(pagination.currentPage - 1);
					}
				},

				// Reset store
				reset: () =>
					set({
						orders: [],
						currentOrder: null,
						loading: false,
						error: null,
						filters: {
							status: "all",
							dateRange: "all",
							page: 1,
							limit: 10,
						},
						pagination: {
							currentPage: 1,
							totalPages: 1,
							totalOrders: 0,
							hasNext: false,
							hasPrev: false,
						},
						stats: null,
					}),
			}),
			{
				name: "order-store",
				partialize: (state) => ({
					filters: state.filters,
				}), // Only persist filters
			}
		)
	)
);
