import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useSellerPaymentStore = create(
        devtools(
                persist(
                        (set, get) => ({
                                payments: [],
                                loading: false,
                                error: null,
                                stats: {
                                        totalOrders: 0,
                                        escrowAmount: 0,
                                        releasedAmount: 0,
                                        commissionPaid: 0,
                                },
                                pagination: {
                                        currentPage: 1,
                                        totalPages: 1,
                                        totalRecords: 0,
                                        hasNext: false,
                                        hasPrev: false,
                                },
                                filters: {
                                        status: "all",
                                        search: "",
                                        startDate: "",
                                        endDate: "",
                                        page: 1,
                                        limit: 10,
                                },
                                setFilters: (filters) =>
                                        set((state) => ({
                                                filters: { ...state.filters, ...filters },
                                        })),
                                resetFilters: () =>
                                        set({
                                                filters: {
                                                        status: "all",
                                                        search: "",
                                                        startDate: "",
                                                        endDate: "",
                                                        page: 1,
                                                        limit: 10,
                                                },
                                        }),
                                fetchPayments: async () => {
                                        const { filters } = get();
                                        set({ loading: true, error: null });

                                        try {
                                                const params = new URLSearchParams();
                                                Object.entries(filters).forEach(([key, value]) => {
                                                        if (value && value !== "all") {
                                                                params.append(key, value);
                                                        }
                                                });

                                                const response = await fetch(`/api/seller/payments?${params.toString()}`, {
                                                        method: "GET",
                                                        credentials: "include",
                                                });

                                                const data = await response.json();

                                                if (!response.ok || !data.success) {
                                                        throw new Error(data.message || "Failed to fetch payments");
                                                }

                                                set({
                                                        payments: data.payments,
                                                        stats: data.stats,
                                                        pagination: data.pagination,
                                                        loading: false,
                                                });
                                        } catch (error) {
                                                set({
                                                        loading: false,
                                                        error: error.message || "Failed to fetch payments",
                                                });
                                        }
                                },
                        }),
                        {
                                name: "seller-payments-store",
                                partialize: (state) => ({
                                        filters: state.filters,
                                }),
                        }
                )
        )
);

export const useSellerPayments = () =>
        useSellerPaymentStore((state) => state.payments);
export const useSellerPaymentStats = () =>
        useSellerPaymentStore((state) => state.stats);
export const useSellerPaymentLoading = () =>
        useSellerPaymentStore((state) => state.loading);
