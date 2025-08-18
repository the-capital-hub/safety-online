import { create } from "zustand";
import { toast } from "sonner";

export const useAdminDashboardStore = create((set, get) => ({
	// State
	loading: false,
	error: null,
	data: {
		overview: {
			totalOrders: 0,
			monthlyOrders: 0,
			ordersGrowth: 0,
			totalRevenue: 0,
			monthlyRevenue: 0,
			revenueGrowth: 0,
			totalProducts: 0,
			publishedProducts: 0,
			totalCustomers: 0,
			activeCustomers: 0,
		},
		orders: {
			total: 0,
			pending: 0,
			completed: 0,
			cancelled: 0,
			byStatus: [],
			recent: [],
		},
		products: {
			total: 0,
			published: 0,
			outOfStock: 0,
			lowStock: 0,
			top: [],
		},
		users: {
			customers: {
				total: 0,
				active: 0,
				newThisMonth: 0,
			},
			sellers: {
				total: 0,
				active: 0,
				newThisMonth: 0,
			},
		},
		charts: {
			monthlyOrders: [],
			dailyOrders: [],
			ordersByStatus: [],
		},
	},

	// Actions
	setLoading: (loading) => set({ loading }),
	setError: (error) => set({ error }),

	// Fetch dashboard data
	fetchDashboardData: async () => {
		set({ loading: true, error: null });

		try {
			const response = await fetch("/api/admin/dashboard");
			const result = await response.json();

			if (result.success) {
				set({
					data: result.data,
					loading: false,
				});
			} else {
				set({
					error: result.message,
					loading: false,
				});
				toast.error("Failed to fetch dashboard data");
			}
		} catch (error) {
			set({
				error: "Failed to fetch dashboard data",
				loading: false,
			});
			toast.error("Failed to fetch dashboard data");
		}
	},

	// Refresh dashboard data
	refreshData: async () => {
		await get().fetchDashboardData();
	},

	// Get formatted chart data
	getMonthlyOrdersChartData: () => {
		const { charts } = get().data;
		return charts.monthlyOrders.map((item) => ({
			month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
			orders: item.orders,
			revenue: item.revenue,
		}));
	},

	getDailyOrdersChartData: () => {
		const { charts } = get().data;
		return charts.dailyOrders.map((item) => ({
			date: `${item._id.year}-${String(item._id.month).padStart(
				2,
				"0"
			)}-${String(item._id.day).padStart(2, "0")}`,
			orders: item.orders,
			revenue: item.revenue,
		}));
	},

	getOrdersByStatusChartData: () => {
		const { charts } = get().data;
		return charts.ordersByStatus.map((item) => ({
			status: item._id,
			count: item.count,
			revenue: item.revenue,
		}));
	},
}));
