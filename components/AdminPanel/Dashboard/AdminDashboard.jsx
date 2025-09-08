"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Package,
	ShoppingCart,
	Users,
	DollarSign,
	AlertTriangle,
	CheckCircle,
	Clock,
	Store,
	RefreshCw,
	BarChart3,
	PieChart,
} from "lucide-react";
import { useAdminDashboardStore } from "@/store/adminDashboardStore.js";
import { StatsCard } from "@/components/AdminPanel/Dashboard/StatsCard.jsx";
import { RecentOrders } from "@/components/AdminPanel/Dashboard/RecentOrders.jsx";
import { TopProducts } from "@/components/AdminPanel/Dashboard/TopProducts.jsx";
import { SimpleBarChart } from "@/components/AdminPanel/Dashboard/SimpleBarChart.jsx";

export default function AdminDashboard() {
	const {
		loading,
		error,
		data,
		fetchDashboardData,
		refreshData,
		getMonthlyOrdersChartData,
		getOrdersByStatusChartData,
	} = useAdminDashboardStore();

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	const handleRefresh = async () => {
		await refreshData();
	};

	if (loading && !data.overview.totalOrders) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={fetchDashboardData}>Try Again</Button>
				</div>
			</div>
		);
	}

	const monthlyOrdersData = getMonthlyOrdersChartData();
	const ordersByStatusData = getOrdersByStatusChartData();

	return (
		<div className="space-y-6">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="flex items-center justify-between"
			>
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
					<p className="text-gray-600 mt-1">
						Welcome back! Here's what's happening with your store.
					</p>
				</div>
				<Button
					onClick={handleRefresh}
					disabled={loading}
					className="bg-orange-600 hover:bg-orange-700"
				>
					<RefreshCw
						className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
					/>
					Refresh
				</Button>
			</motion.div>

			{/* Overview Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatsCard
					title="Total Orders"
					value={data.overview.totalOrders}
					change={data.overview.ordersGrowth}
					icon={ShoppingCart}
					color="blue"
					delay={0.1}
				/>
				<StatsCard
					title="Total Revenue"
					value={`₹${data.overview.totalRevenue.toLocaleString()}`}
					change={data.overview.revenueGrowth}
					icon={DollarSign}
					color="green"
					delay={0.2}
				/>
				<StatsCard
					title="Total Products"
					value={data.overview.totalProducts}
					subtitle={`${data.products.published} published`}
					icon={Package}
					color="purple"
					delay={0.3}
				/>
				<StatsCard
					title="Active Customers"
					value={data.overview.activeCustomers}
					subtitle={`${data.overview.totalCustomers} total`}
					icon={Users}
					color="orange"
					delay={0.4}
				/>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Monthly Orders Chart */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.5 }}
				>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BarChart3 className="w-5 h-5 text-blue-600" />
								Monthly Orders
							</CardTitle>
						</CardHeader>
						<CardContent>
							<SimpleBarChart data={monthlyOrdersData} title="" height={250} />
						</CardContent>
					</Card>
				</motion.div>

				{/* Orders by Status */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.6 }}
				>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<PieChart className="w-5 h-5 text-green-600" />
								Orders by Status
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{ordersByStatusData.map((item, index) => {
									const colors = [
										"bg-blue-500",
										"bg-green-500",
										"bg-yellow-500",
										"bg-red-500",
										"bg-purple-500",
									];
									const color = colors[index % colors.length];

									return (
										<motion.div
											key={item.status}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
										>
											<div className="flex items-center gap-3">
												<div className={`w-4 h-4 rounded-full ${color}`}></div>
												<span className="font-medium capitalize">
													{item.status}
												</span>
											</div>
											<div className="text-right">
												<p className="font-bold">{item.count}</p>
												<p className="text-sm text-gray-600">
													₹{item.revenue.toLocaleString()}
												</p>
											</div>
										</motion.div>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Quick Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.7 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Pending Orders
									</p>
									<p className="text-2xl font-bold text-yellow-600">
										{data.orders.pending}
									</p>
								</div>
								<Clock className="h-8 w-8 text-yellow-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.8 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Completed Orders
									</p>
									<p className="text-2xl font-bold text-green-600">
										{data.orders.completed}
									</p>
								</div>
								<CheckCircle className="h-8 w-8 text-green-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.9 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Low Stock Products
									</p>
									<p className="text-2xl font-bold text-red-600">
										{data.products.lowStock}
									</p>
								</div>
								<AlertTriangle className="h-8 w-8 text-red-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 1.0 }}
				>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Active Sellers
									</p>
									<p className="text-2xl font-bold text-purple-600">
										{data.users.sellers.active}
									</p>
								</div>
								<Store className="h-8 w-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Recent Orders and Top Products */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<RecentOrders orders={data.orders.recent} />
				<TopProducts products={data.products.top} />
			</div>
		</div>
	);
}
