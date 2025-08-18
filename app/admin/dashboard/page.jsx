"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	ShoppingCart,
	Package,
	TrendingUp,
	TrendingDown,
	Eye,
	MoreHorizontal,
	Clock,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

const stats = [
	{
		title: "Total Orders",
		value: "$89,000",
		change: "4.3% Down from yesterday",
		trend: "down",
		icon: ShoppingCart,
		color: "text-blue-600",
		bgColor: "bg-blue-50",
	},
	{
		title: "Yesterday Orders",
		value: "$99,000",
		change: "8.5% Up from yesterday",
		trend: "up",
		icon: TrendingUp,
		color: "text-green-600",
		bgColor: "bg-green-50",
	},
	{
		title: "This Month",
		value: "10293",
		change: "1.3% Up from past week",
		trend: "up",
		icon: Package,
		color: "text-yellow-600",
		bgColor: "bg-yellow-50",
	},
	{
		title: "Last Month",
		value: "2040",
		change: "1.8% Up from yesterday",
		trend: "up",
		icon: Clock,
		color: "text-purple-600",
		bgColor: "bg-purple-50",
	},
	{
		title: "All Time",
		value: "22",
		change: "8.5% Up from yesterday",
		trend: "up",
		icon: TrendingUp,
		color: "text-orange-600",
		bgColor: "bg-orange-50",
	},
];

const orderStats = [
	{
		title: "Total Order",
		value: "10293",
		icon: Package,
		color: "text-yellow-600",
		bgColor: "bg-yellow-100",
	},
	{
		title: "Order Pending",
		value: "302",
		icon: Clock,
		color: "text-orange-600",
		bgColor: "bg-orange-100",
	},
	{
		title: "Order Processing",
		value: "140",
		icon: AlertCircle,
		color: "text-blue-600",
		bgColor: "bg-blue-100",
	},
	{
		title: "Order Delivered",
		value: "140",
		icon: CheckCircle,
		color: "text-green-600",
		bgColor: "bg-green-100",
	},
];

const topSellers = [
	{
		name: "Annette Black",
		bio: "Bio",
		totalSales: "999",
		location: "NYC",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		name: "Annette Black",
		bio: "Bio",
		totalSales: "999",
		location: "NYC",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		name: "Annette Black",
		bio: "Bio",
		totalSales: "999",
		location: "NYC",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		name: "Annette Black",
		bio: "Bio",
		totalSales: "999",
		location: "NYC",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		name: "Annette Black",
		bio: "Bio",
		totalSales: "999",
		location: "NYC",
		avatar: "/placeholder.svg?height=40&width=40",
	},
];

const recentOrders = [
	{
		invoiceNo: "SB001",
		orderTime: "23/05/2025 11:33 am",
		customerName: "Rakesh Kumar",
		method: "Cash",
		price: "$8,000",
		status: "Processing",
	},
	{
		invoiceNo: "SB002",
		orderTime: "24/05/2025 12:00 pm",
		customerName: "Anita Singh",
		method: "Credit Card",
		price: "$9,100",
		status: "Completed",
	},
	{
		invoiceNo: "SB003",
		orderTime: "25/05/2025 2:15 pm",
		customerName: "Vikram Sharma",
		method: "Debit Card",
		price: "$3,600",
		status: "Failed",
	},
	{
		invoiceNo: "SB004",
		orderTime: "26/05/2025 9:45 am",
		customerName: "Nisha Patel",
		method: "Net Banking",
		price: "$12,200",
		status: "Processing",
	},
	{
		invoiceNo: "SB005",
		orderTime: "27/05/2025 1:30 pm",
		customerName: "Ravi Gupta",
		method: "Cash",
		price: "$1,500",
		status: "Completed",
	},
];

export default function AdminDashboard() {
	const [salesPeriod, setSalesPeriod] = useState("weekly");
	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();
	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/admin/login");
			}, 3);
			
			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	// Show redirecting message if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	const getStatusColor = (status) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "processing":
				return "bg-yellow-100 text-yellow-800";
			case "failed":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<div className="space-y-6">
			{/* Top Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
				{stats.map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: index * 0.1 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600 mb-1">
											{stat.title}
										</p>
										<p className="text-2xl font-bold">{stat.value}</p>
										<div className="flex items-center mt-2">
											{stat.trend === "up" ? (
												<TrendingUp className="h-4 w-4 text-green-500 mr-1" />
											) : (
												<TrendingDown className="h-4 w-4 text-red-500 mr-1" />
											)}
											<span
												className={`text-sm ${
													stat.trend === "up"
														? "text-green-600"
														: "text-red-600"
												}`}
											>
												{stat.change}
											</span>
										</div>
									</div>
									<div className={`p-3 rounded-lg ${stat.bgColor}`}>
										<stat.icon className={`h-6 w-6 ${stat.color}`} />
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			{/* Order Status Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{orderStats.map((stat, index) => (
					<motion.div
						key={stat.title}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
					>
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-gray-600 mb-1">
											{stat.title}
										</p>
										<p className="text-3xl font-bold">{stat.value}</p>
									</div>
									<div className={`p-3 rounded-lg ${stat.bgColor}`}>
										<stat.icon className={`h-8 w-8 ${stat.color}`} />
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Weekly Sales Chart */}
				<motion.div
					className="lg:col-span-2"
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3, delay: 0.8 }}
				>
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Weekly Sales</CardTitle>
								<Select value={salesPeriod} onValueChange={setSalesPeriod}>
									<SelectTrigger className="w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="weekly">Weekly</SelectItem>
										<SelectItem value="monthly">Monthly</SelectItem>
										<SelectItem value="yearly">Yearly</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent>
							<div className="h-80 flex items-end justify-between space-x-2">
								{/* Simulated chart bars */}
								{[30, 45, 35, 80, 55, 60, 40, 50, 70, 45, 65, 55].map(
									(height, index) => (
										<div
											key={index}
											className="bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t-sm flex-1 relative"
											style={{ height: `${height}%` }}
										>
											{height === 80 && (
												<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
													$8,364.37
												</div>
											)}
										</div>
									)
								)}
							</div>
							<div className="flex justify-between mt-4 text-xs text-gray-500">
								<span>5k</span>
								<span>10k</span>
								<span>15k</span>
								<span>20k</span>
								<span>25k</span>
								<span>30k</span>
								<span>35k</span>
								<span>40k</span>
								<span>45k</span>
								<span>50k</span>
								<span>55k</span>
								<span>60k</span>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				{/* Top Sellers */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3, delay: 0.9 }}
				>
					<Card>
						<CardHeader>
							<div className="flex items-center justify-between">
								<CardTitle>Top Sellers</CardTitle>
								<Button variant="ghost" size="icon">
									<MoreHorizontal className="h-4 w-4" />
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{topSellers.map((seller, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex items-center space-x-3">
											<Avatar className="h-10 w-10">
												<AvatarImage
													src={seller.avatar || "/placeholder.svg"}
												/>
												<AvatarFallback>
													{seller.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium text-sm">{seller.name}</p>
												<p className="text-xs text-gray-500">{seller.bio}</p>
											</div>
										</div>
										<div className="text-right">
											<p className="text-sm font-medium">Total Sales</p>
											<p className="text-xs text-gray-500">
												{seller.totalSales}
											</p>
											<p className="text-xs text-gray-500">Location</p>
											<p className="text-xs text-gray-500">{seller.location}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			</div>

			{/* Recent Orders */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 1.0 }}
			>
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Recent Orders</CardTitle>
							<Button variant="ghost" className="text-blue-600">
								View All
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="border-b">
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Invoice NO
										</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Order time
										</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Customer Name
										</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Method
										</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Price
										</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Status
										</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Action
										</th>
										<th className="text-left py-3 px-4 font-medium text-gray-600">
											Invoice
										</th>
									</tr>
								</thead>
								<tbody>
									{recentOrders.map((order, index) => (
										<tr
											key={order.invoiceNo}
											className="border-b hover:bg-gray-50"
										>
											<td className="py-3 px-4 font-medium">
												{order.invoiceNo}
											</td>
											<td className="py-3 px-4 text-sm text-gray-600">
												{order.orderTime}
											</td>
											<td className="py-3 px-4">{order.customerName}</td>
											<td className="py-3 px-4">{order.method}</td>
											<td className="py-3 px-4 font-medium text-blue-600">
												{order.price}
											</td>
											<td className="py-3 px-4">
												<Badge className={getStatusColor(order.status)}>
													{order.status}
												</Badge>
											</td>
											<td className="py-3 px-4">
												<Select defaultValue={order.status.toLowerCase()}>
													<SelectTrigger className="w-32">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="processing">
															Processing
														</SelectItem>
														<SelectItem value="completed">Completed</SelectItem>
														<SelectItem value="failed">Failed</SelectItem>
													</SelectContent>
												</Select>
											</td>
											<td className="py-3 px-4">
												<div className="flex gap-2">
													<Button size="icon" variant="outline">
														<Eye className="w-4 h-4" />
													</Button>
													<Button size="icon" variant="outline">
														<Eye className="w-4 h-4" />
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
