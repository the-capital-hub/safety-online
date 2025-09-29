import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialState = {
	stats: {
		totalOrders: 0,
		totalSales: 0,
		totalProducts: 0,
		totalCustomers: 0,
	},
	paymentSummary: [],
	orderSummary: {
		pendingPercent: 0,
		processingPercent: 0,
		shippedPercent: 0,
		deliveredPercent: 0,
		cancelledPercent: 0,
	},
	recentOrders: [],
	returnsSummary: {
		total: 0,
		status: {},
	},
	loading: false,
	error: null,
};

export const useSellerDashboardStore = create(
	devtools((set, get) => ({
		...initialState,
		fetchDashboardData: async () => {
			set({ loading: true, error: null });
			try {
				const response = await fetch("/api/seller/dashboard", {
					method: "GET",
					credentials: "include",
				});

				const data = await response.json();

				if (!response.ok || !data.success) {
					throw new Error(data.message || "Failed to load dashboard");
				}

				set({
					stats: data.stats,
					paymentSummary: data.paymentSummary,
					orderSummary: data.orderSummary,
					recentOrders: data.recentOrders,
					returnsSummary: data.returnsSummary,
					loading: false,
				});
			} catch (error) {
				console.error("Dashboard store error:", error);
				set({
					...initialState,
					loading: false,
					error: error.message || "Unable to load dashboard",
				});
			}
		},
	}))
);
