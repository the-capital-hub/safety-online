import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useSellerOrderStore = create(
	devtools(
		persist((set, get) => ({
			// State
			orders: [],
			currentOrder: null,
                        loading: false,
                        error: null,
                        returnsError: null,
                        returnOrders: [],
                        returnsLoading: false,
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
				acceptedOrders: 0,
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

			// Fetch orders for seller
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

					const response = await fetch(`/api/seller/orders?${queryParams}`, {
						method: "GET",
						credentials: "include",
					});
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

			// Fetch return orders
			fetchReturnOrders: async () => {
				set({ returnsLoading: true, returnsError: null });
				try {
					const response = await fetch("/api/seller/orders/returns", {
						method: "GET",
						credentials: "include",
					});
					const data = await response.json();

					if (!response.ok || !data.success) {
						throw new Error(data.message || "Failed to fetch return orders");
					}

					set({ returnOrders: data.orders, returnsLoading: false });
				} catch (error) {
					console.error("Fetch return orders error:", error);
					set({
						returnOrders: [],
						returnsLoading: false,
						returnsError: error.message || "Failed to fetch return orders",
					});
				}
			},

                        // Accept order
                        acceptOrder: async (orderId) => {
                                set({ loading: true, error: null });

                                try {
					const response = await fetch(`/api/seller/orders/${orderId}/accept`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					});

					const data = await response.json();

					if (data.success) {
						set((state) => ({
							orders: state.orders.map((order) =>
								order._id === orderId
									? { ...order, status: "processing" }
									: order
							),
							loading: false,
						}));
						return { success: true, message: data.message };
					} else {
						set({ error: data.message, loading: false });
						return { success: false, message: data.message };
					}
				} catch (error) {
					set({ error: "Failed to accept order", loading: false });
					return { success: false, message: "Failed to accept order" };
                                }
                        },

                        // Mark order as delivered
                        markAsDelivered: async (orderId, deliveryDate) => {
                                set({ loading: true, error: null });

                                try {
                                        const response = await fetch(`/api/seller/orders/${orderId}/deliver`, {
                                                method: "PUT",
                                                headers: {
                                                        "Content-Type": "application/json",
                                                },
                                                credentials: "include",
                                                body: JSON.stringify({ deliveryDate }),
                                        });

                                        const data = await response.json();

                                        if (!response.ok || !data.success) {
                                                throw new Error(data.message || "Failed to update delivery status");
                                        }

                                        set((state) => ({
                                                orders: state.orders.map((order) =>
                                                        order._id === orderId
                                                                ? {
                                                                          ...order,
                                                                          status: "delivered",
                                                                          actualDelivery:
                                                                                  data.order?.actualDelivery || deliveryDate,
                                                                  }
                                                                : order
                                                ),
                                                loading: false,
                                        }));

                                        return {
                                                success: true,
                                                message: data.message,
                                                payment: data.payment,
                                                releaseError: data.releaseError,
                                        };
                                } catch (error) {
                                        set({
                                                loading: false,
                                                error: error.message || "Failed to update delivery status",
                                        });

                                        return {
                                                success: false,
                                                message: error.message || "Failed to update delivery status",
                                        };
                                }
                        },

                        // Reject order
                        rejectOrder: async (orderId) => {
                                set({ loading: true, error: null });

				try {
					const response = await fetch(`/api/seller/orders/${orderId}/reject`, {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					});

					const data = await response.json();

					if (data.success) {
						set((state) => ({
							orders: state.orders.map((order) =>
								order._id === orderId
									? { ...order, status: "cancelled" }
									: order
							),
							loading: false,
						}));
						return { success: true, message: data.message };
					} else {
						set({ error: data.message, loading: false });
						return { success: false, message: data.message };
					}
				} catch (error) {
					set({ error: "Failed to reject order", loading: false });
					return { success: false, message: "Failed to reject order" };
				}
			},

			// Download shipment receipt
			downloadShipmentReceipt: async (orderId, orderNumber) => {
				try {
					const response = await fetch(
						`/api/seller/orders/${orderId}/shipment-receipt`,
						{
							method: "GET",
							credentials: "include",
						}
					);

					if (response.ok) {
						const blob = await response.blob();
						const url = window.URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = `shipment-receipt-${orderNumber}.pdf`;
						document.body.appendChild(a);
						a.click();
						window.URL.revokeObjectURL(url);
						document.body.removeChild(a);
						return { success: true };
					} else {
						return { success: false, message: "Failed to download receipt" };
					}
				} catch (error) {
					return { success: false, message: "Failed to download receipt" };
				}
			},
		}))
	)
);

// Selectors
export const useSellerOrders = () =>
	useSellerOrderStore((state) => state.orders);
export const useSellerOrderLoading = () =>
	useSellerOrderStore((state) => state.loading);
export const useSellerOrderStats = () =>
	useSellerOrderStore((state) => state.stats);
