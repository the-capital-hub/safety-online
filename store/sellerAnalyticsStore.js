import { create } from "zustand";
import { devtools } from "zustand/middleware";

const formatDateInput = (date) => date.toISOString().split("T")[0];

const today = new Date();
const defaultEnd = formatDateInput(today);
const start = new Date(today);
start.setDate(start.getDate() - 29);
const defaultStart = formatDateInput(start);

const buildInitialFilters = () => ({
        startDate: defaultStart,
        endDate: defaultEnd,
        interval: "day",
        statuses: [],
        paymentMethods: [],
        categories: [],
});

const initialFilters = buildInitialFilters();

const buildInitialAnalytics = () => ({
        summary: {
                totalOrders: 0,
                totalRevenue: 0,
                totalUnits: 0,
                averageOrderValue: 0,
                uniqueCustomers: 0,
        },
        ordersOverTime: [],
        statusDistribution: [],
        paymentMethods: [],
        topProducts: [],
        categoryPerformance: [],
        customerSegments: {
                totalCustomers: 0,
                repeatCustomers: 0,
                newCustomers: 0,
                returningCustomers: 0,
                avgOrderFrequency: 0,
                customerLifetimeValue: 0,
        },
        reports: {
                orders: [],
        },
        growth: {
                revenue: 0,
                orders: 0,
                units: 0,
        },
        availableFilters: {
                statuses: [],
                paymentMethods: [],
                categories: [],
        },
        meta: {
                startDate: null,
                endDate: null,
                interval: "day",
        },
});

const initialAnalytics = buildInitialAnalytics();

export const useSellerAnalyticsStore = create(
        devtools((set, get) => ({
                filters: initialFilters,
                analytics: initialAnalytics,
                loading: false,
                error: null,
                setFilter: (key, value) =>
                        set((state) => ({
                                filters: {
                                        ...state.filters,
                                        [key]: value,
                                },
                        })),
                setFilters: (filters) =>
                        set(() => ({
                                filters: {
                                        ...buildInitialFilters(),
                                        ...filters,
                                },
                        })),
                resetFilters: () =>
                        set(() => ({
                                filters: buildInitialFilters(),
                        })),
                fetchAnalytics: async () => {
                        const { filters } = get();
                        const params = new URLSearchParams();

                        if (filters.startDate) params.set("startDate", filters.startDate);
                        if (filters.endDate) params.set("endDate", filters.endDate);
                        if (filters.interval) params.set("interval", filters.interval);
                        if (filters.statuses.length) {
                                params.set("status", filters.statuses.join(","));
                        }
                        if (filters.paymentMethods.length) {
                                params.set(
                                        "paymentMethods",
                                        filters.paymentMethods.join(",")
                                );
                        }
                        if (filters.categories.length) {
                                params.set("categories", filters.categories.join(","));
                        }

                        set({ loading: true, error: null });
                        try {
                                const response = await fetch(
                                        `/api/seller/analytics?${params.toString()}`,
                                        {
                                                method: "GET",
                                                credentials: "include",
                                        }
                                );

                                const payload = await response.json();

                                if (!response.ok || !payload.success) {
                                        throw new Error(
                                                payload.message || "Failed to load analytics"
                                        );
                                }

                                set({
                                        analytics: {
                                                ...payload.data,
                                                availableFilters: payload.data.availableFilters,
                                        },
                                        loading: false,
                                });
                        } catch (error) {
                                console.error("Analytics store error:", error);
                                set({
                                        loading: false,
                                        error: error.message || "Unable to load analytics",
                                        analytics: buildInitialAnalytics(),
                                });
                        }
                },
                exportOrdersReport: () => {
                        const {
                                analytics: {
                                        reports: { orders },
                                },
                        } = get();

                        if (!orders?.length) {
                                return null;
                        }

                        const header = [
                                "Order Number",
                                "Order Date",
                                "Status",
                                "Payment Method",
                                "Units",
                                "Total Amount",
                                "Categories",
                        ];

                        const rows = orders.map((order) => [
                                order.orderNumber,
                                new Date(order.orderDate).toISOString(),
                                order.status,
                                order.paymentMethod,
                                order.units,
                                order.totalAmount,
                                order.categories?.join(" | ") || "",
                        ]);

                        const csvContent = [header, ...rows]
                                .map((row) =>
                                        row
                                                .map((value) => {
                                                        if (value === null || value === undefined) return "";
                                                        const stringValue = String(value);
                                                        if (stringValue.includes(",")) {
                                                                return `"${stringValue.replace(/"/g, '""')}"`;
                                                        }
                                                        return stringValue;
                                                })
                                                .join(",")
                                )
                                .join("\n");

                        return new Blob([csvContent], {
                                type: "text/csv;charset=utf-8;",
                        });
                },
        }))
);

export const useSellerAnalyticsFilters = () =>
        useSellerAnalyticsStore((state) => state.filters);

export const useSellerAnalyticsData = () =>
        useSellerAnalyticsStore((state) => state.analytics);

export const useSellerAnalyticsLoading = () =>
        useSellerAnalyticsStore((state) => state.loading);

export const useSellerAnalyticsError = () =>
        useSellerAnalyticsStore((state) => state.error);
