"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	ShoppingCart,
	DollarSign,
	Package,
	MoreHorizontal,
	TrendingUp,
	TrendingDown,
	ChevronRight,
} from "lucide-react";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore";

const statsData = [
	{
		title: "Total Orders",
		value: "400",
		change: "+10%",
		trend: "up",
		period: "vs last month",
		icon: ShoppingCart,
		color: "text-purple-600",
		bgColor: "bg-purple-50",
	},
	{
		title: "Total Sell",
		value: "$42.5L",
		change: "+5%",
		trend: "down",
		period: "vs last month",
		icon: DollarSign,
		color: "text-green-600",
		bgColor: "bg-green-50",
	},
	{
		title: "Total Products",
		value: "452",
		change: "+23",
		trend: "up",
		period: "vs last month",
		icon: Package,
		color: "text-blue-600",
		bgColor: "bg-blue-50",
	},
];

const customersData = [
	{
		name: "Courtney Henry",
		avatar: "/placeholder.svg?height=40&width=40",
		status: "online",
	},
	{
		name: "Jenny Wilson",
		avatar: "/placeholder.svg?height=40&width=40",
		status: "online",
	},
	{
		name: "Cameron Williamson",
		avatar: "/placeholder.svg?height=40&width=40",
		status: "offline",
	},
];

const productActivity = [
	{
		name: "Helmets",
		views: "6,241",
		growth: "37.8%",
		products: 12,
		comments: 436,
	},
	{
		name: "D-Phones",
		views: "1,368",
		growth: "68,192",
		products: 849,
		comments: 0,
	},
];

export default function SellerAnalyticsPage() {
	const router = useRouter();
	const isAuthenticated = useIsSellerAuthenticated();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/seller/login");
			return;
		}
	}, [isAuthenticated, router]);

	return (
		<div className="p-6 space-y-6">
			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{statsData.map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
					>
						<Card className="p-6 bg-white border-0 shadow-sm">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className={`p-2 rounded-lg ${stat.bgColor}`}>
										<stat.icon className={`w-5 h-5 ${stat.color}`} />
									</div>
									<div>
										<p className="text-sm text-gray-600">{stat.title}</p>
										<p className="text-2xl font-bold text-gray-900">
											{stat.value}
										</p>
									</div>
								</div>
								<Button variant="ghost" size="sm">
									<MoreHorizontal className="w-4 h-4" />
								</Button>
							</div>
							<div className="mt-4 flex items-center space-x-2">
								{stat.trend === "up" ? (
									<TrendingUp className="w-4 h-4 text-green-500" />
								) : (
									<TrendingDown className="w-4 h-4 text-red-500" />
								)}
								<span
									className={`text-sm font-medium ${
										stat.trend === "up" ? "text-green-600" : "text-red-600"
									}`}
								>
									{stat.change}
								</span>
								<span className="text-sm text-gray-500">{stat.period}</span>
							</div>
							{/* Mini Chart Placeholder */}
							<div className="mt-4 h-12 bg-gray-50 rounded flex items-end justify-center space-x-1">
								{[...Array(8)].map((_, i) => (
									<div
										key={i}
										className={`w-2 rounded-t ${
											stat.trend === "up" ? "bg-green-200" : "bg-red-200"
										}`}
										style={{ height: `${Math.random() * 100 + 20}%` }}
									/>
								))}
							</div>
						</Card>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Total Customers */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<Card className="p-6 bg-white border-0 shadow-sm">
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-lg font-semibold text-gray-900">
								Total customers
							</h3>
							<Button variant="outline" size="sm">
								All time
							</Button>
						</div>

						<div className="mb-6">
							<h2 className="text-3xl font-bold text-gray-900">
								68,192 customers
							</h2>
							<p className="text-sm text-gray-500">↗ 3.68% vs Sep 8, 2023</p>
						</div>

						{/* Chart Placeholder */}
						<div className="h-32 bg-gray-50 rounded-lg mb-6 flex items-center justify-center">
							<div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-end justify-center space-x-2 p-4">
								{[...Array(12)].map((_, i) => (
									<div
										key={i}
										className="bg-blue-400 rounded-t"
										style={{
											width: "8px",
											height: `${Math.random() * 80 + 20}%`,
										}}
									/>
								))}
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<p className="text-sm text-gray-600">
									Welcome 291 customers with a personal message 😊
								</p>
								<Button size="sm" variant="outline">
									Send message
								</Button>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									{customersData.map((customer, index) => (
										<div key={index} className="relative">
											<img
												src={customer.avatar || "/placeholder.svg"}
												alt={customer.name}
												className="w-10 h-10 rounded-full"
											/>
											{customer.status === "online" && (
												<div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
											)}
										</div>
									))}
								</div>
								<div className="flex items-center space-x-2">
									<span className="text-sm text-gray-600">View all</span>
									<ChevronRight className="w-4 h-4 text-gray-400" />
								</div>
							</div>
						</div>
					</Card>
				</motion.div>

				{/* Product Views */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<Card className="p-6 bg-white border-0 shadow-sm">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							Product views
						</h3>

						{/* Chart Placeholder */}
						<div className="h-40 bg-gray-50 rounded-lg mb-6 flex items-end justify-center space-x-2 p-4">
							<div
								className="bg-blue-300 rounded-t"
								style={{ width: "20px", height: "60%" }}
							></div>
							<div
								className="bg-blue-400 rounded-t"
								style={{ width: "20px", height: "80%" }}
							></div>
							<div
								className="bg-orange-400 rounded-t"
								style={{ width: "20px", height: "100%" }}
							></div>
							<div
								className="bg-blue-200 rounded-t"
								style={{ width: "20px", height: "40%" }}
							></div>
							<div
								className="bg-purple-300 rounded-t"
								style={{ width: "20px", height: "70%" }}
							></div>
							<div
								className="bg-blue-300 rounded-t"
								style={{ width: "20px", height: "50%" }}
							></div>
							<div
								className="bg-blue-400 rounded-t"
								style={{ width: "20px", height: "90%" }}
							></div>
						</div>

						<div className="text-center">
							<p className="text-sm text-gray-600">25 September</p>
							<p className="text-xs text-gray-500">20k</p>
						</div>
					</Card>
				</motion.div>
			</div>

			{/* Product Activity */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5 }}
			>
				<Card className="p-6 bg-white border-0 shadow-sm">
					<div className="flex items-center justify-between mb-6">
						<h3 className="text-lg font-semibold text-gray-900">
							Product activity
						</h3>
						<Button variant="outline" size="sm">
							All time
						</Button>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b">
									<th className="text-left py-3 text-sm font-medium text-gray-500">
										Week
									</th>
									<th className="text-left py-3 text-sm font-medium text-gray-500">
										Products
									</th>
									<th className="text-left py-3 text-sm font-medium text-gray-500">
										Views
									</th>
									<th className="text-left py-3 text-sm font-medium text-gray-500">
										Comments
									</th>
								</tr>
							</thead>
							<tbody>
								{productActivity.map((item, index) => (
									<tr key={index} className="border-b">
										<td className="py-4 text-sm text-gray-900">{item.name}</td>
										<td className="py-4">
											<div className="flex items-center space-x-2">
												<span className="text-sm font-medium text-blue-600">
													{item.views}
												</span>
												<span className="text-xs text-green-600">
													↗ {item.growth}
												</span>
											</div>
										</td>
										<td className="py-4 text-sm text-gray-900">
											{item.products}
										</td>
										<td className="py-4">
											<div className="flex items-center space-x-2">
												<span className="text-sm text-gray-900">
													{item.comments}
												</span>
												<span className="text-xs text-red-600">↗ 26.4%</span>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="mt-6 text-center">
						<Button variant="outline" size="sm">
							Load more
						</Button>
					</div>
				</Card>
			</motion.div>
		</div>
	);
}
