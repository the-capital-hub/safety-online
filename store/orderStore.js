import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useAuthStore } from "@/store/authStore.js";
import { generateInvoicePDF } from "@/lib/invoicePDF.js";
import { useNotificationStore } from "@/store/notificationStore.js";

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
				returnSettings: {
					enabled: true,
					windowDays: 7,
				},
				returnActionLoading: false,

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

                                                const mapOrderProduct = (product) => {
                                                        const productDoc = product?.productId || {};
                                                        const priceValue = product?.price ?? productDoc?.price ?? 0;
                                                        const quantityValue = product?.quantity || 0;
                                                        const resolvedIds = Array.isArray(product?.productIds)
                                                                ? product.productIds
                                                                : Array.isArray(productDoc?.productIds)
                                                                ? productDoc.productIds
                                                                : [];
                                                        const uniqueProductIds = resolvedIds
                                                                .map((id) =>
                                                                        typeof id === "string" ? id.trim() : String(id || "")
                                                                )
                                                                .filter((id, index, arr) => id.length > 0 && arr.indexOf(id) === index);

                                                        return {
                                                                productName:
                                                                        product?.productName ||
                                                                        productDoc?.productName ||
                                                                        productDoc?.name ||
                                                                        productDoc?.title ||
                                                                        "Unknown",
                                                                quantity: quantityValue,
                                                                price: priceValue,
                                                                totalPrice: product?.totalPrice ?? priceValue * quantityValue,
                                                                productIds: uniqueProductIds,
                                                                hsnCode: product?.hsnCode || productDoc?.hsnCode || "",
                                                        };
                                                };

                                                const allProducts = Array.isArray(order.subOrders)
                                                        ? order.subOrders.flatMap((sub) =>
                                                                Array.isArray(sub.products)
                                                                        ? sub.products.map(mapOrderProduct)
                                                                        : []
                                                          )
                                                        : Array.isArray(order.products)
                                                        ? order.products.map(mapOrderProduct)
                                                        : [];

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

				fetchReturnSettings: async () => {
					try {
						const response = await fetch("/api/returns/settings");
						if (!response.ok) {
							throw new Error("Failed to load return settings");
						}

						const data = await response.json();

						if (data.success && data.settings) {
							set({ returnSettings: data.settings });
						}
					} catch (error) {
						console.error("Fetch return settings error:", error);
					}
				},

				requestReturn: async (orderId, payload) => {
					set({ returnActionLoading: true });

					try {
						const authState = useAuthStore.getState();
						const response = await fetch(`/api/orders/${orderId}/return`, {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify(payload),
						});

						const data = await response.json();

						if (!response.ok || !data.success) {
							throw new Error(
								data.message || "Failed to submit return request"
							);
						}

						set((state) => ({
							returnActionLoading: false,
							orders: state.orders.map((order) => {
								if (order._id?.toString() === orderId.toString()) {
									const existingRequests = Array.isArray(order.returnRequests)
										? order.returnRequests
										: [];
									return {
										...order,
										status: "returned",
										returnRequests: [data.request, ...existingRequests],
									};
								}
								return order;
							}),
						}));

						const buyerName = authState?.user
							? `${authState.user.firstName || ""} ${
									authState.user.lastName || ""
							  }`.trim() ||
							  authState.user.email ||
							  "Buyer"
							: "Buyer";
						const { logEvent } = useNotificationStore.getState();
						logEvent({
							panel: "buyer",
							severity: "warning",
							category: "returns",
							title: `${buyerName} requested a return`,
							message: `Return request submitted for order ${
								data.request?.orderNumber || orderId
							}`,
							metadata: [
								{
									label: "Order",
									value: data.request?.orderNumber || orderId,
								},
								(payload?.reason ||
									payload?.returnReason ||
									data.request?.reason) && {
									label: "Reason",
									value:
										payload?.reason ||
										payload?.returnReason ||
										data.request?.reason,
								},
								data.request?.items?.length
									? {
											label: "Items",
											value: `${data.request.items.length}`,
									  }
									: null,
							].filter(Boolean),
							actor: { name: buyerName, role: "Buyer" },
							link: { href: "/admin/returns", label: "Review request" },
						});

						return { success: true, request: data.request };
					} catch (error) {
						console.error("Submit return request error:", error);
						set({
							returnActionLoading: false,
						});
						return {
							success: false,
							message: error.message || "Failed to submit return request",
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
						returnSettings: {
							enabled: true,
							windowDays: 7,
						},
						returnActionLoading: false,
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
