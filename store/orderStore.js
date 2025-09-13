import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useAuthStore } from "@/store/authStore.js";
import { generateInvoicePDF } from "@/lib/invoicePDF.js";

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

				userId: () => {
					const user = useAuthStore.getState().user;
					return user ? user._id : null;
				},

				// Fetch orders with optional filters
				fetchOrders: async (customFilters = null) => {
					const { filters } = get();
					const activeFilters = customFilters || filters;

					set({ loading: true, error: null });

					try {
						const queryParams = new URLSearchParams();

						// add userId
						queryParams.append("userId", useOrderStore.getState().userId());

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

				// Fetch single order with populated products for invoice generation
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

				// Fetch order with full product details for invoice generation
				fetchOrderForInvoice: async (orderId) => {
					try {
						const response = await fetch(
							`/api/orders/${orderId}?populate=products`
						);

						if (!response.ok) {
							throw new Error(`HTTP error! status: ${response.status}`);
						}

						const data = await response.json();

						if (data.success) {
							const order = data.order;
							// Extract all products from subOrders if they exist
							const allProducts = Array.isArray(order.subOrders)
								? order.subOrders.flatMap((sub) =>
										Array.isArray(sub.products)
											? sub.products.map((p) => ({
													productName:
														p.productId?.productName ||
														p.productId?.name ||
														p.productId?.title ||
														"Unknown",
													quantity: p.quantity || 0,
													price: p.price || p.productId?.price || 0,
													totalPrice:
														(p.price || p.productId?.price || 0) *
														(p.quantity || 0),
											  }))
											: []
								  )
								: order.products || [];

							const orderForPDF = {
								...order,
								customerName: order.customerName,
								customerEmail: order.customerEmail,
								customerMobile: order.customerMobile,
								products: allProducts,
							};

							return orderForPDF;
						} else {
							throw new Error(
								data.message || "Failed to fetch order for invoice"
							);
						}
					} catch (error) {
						console.error("Fetch order for invoice error:", error);
						throw error;
					}
				},

				// Download invoice - now generates client-side
				downloadInvoice: async (orderId, orderNumber) => {
					try {
						// Set loading state for download
						set({ loading: true, error: null });

						// Fetch order data with populated products
						const orderData = await get().fetchOrderForInvoice(orderId);

						// Generate PDF on client side
						const pdfBlob = await generateInvoicePDF(orderData);

						// Create download link and trigger download
						const url = window.URL.createObjectURL(pdfBlob);
						const a = document.createElement("a");
						a.href = url;
						a.download = `invoice-${orderNumber}.pdf`;
						document.body.appendChild(a);
						a.click();

						// Cleanup
						window.URL.revokeObjectURL(url);
						document.body.removeChild(a);

						set({ loading: false });
						return { success: true };
					} catch (error) {
						console.error("Download invoice error:", error);
						set({
							loading: false,
							error: error.message || "Failed to download invoice",
						});
						return {
							success: false,
							message: error.message || "Failed to download invoice",
						};
					}
				},

				// Alternative method to preview invoice without downloading
				previewInvoice: async (orderId) => {
					try {
						set({ loading: true, error: null });

						// Fetch order data with populated products
						const orderData = await get().fetchOrderForInvoice(orderId);

						// Generate PDF on client side
						const pdfBlob = await generateInvoicePDF(orderData);

						// Create blob URL for preview
						const url = window.URL.createObjectURL(pdfBlob);

						set({ loading: false });
						return { success: true, url };
					} catch (error) {
						console.error("Preview invoice error:", error);
						set({
							loading: false,
							error: error.message || "Failed to preview invoice",
						});
						return {
							success: false,
							message: error.message || "Failed to preview invoice",
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
