"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	ShoppingCart,
	DollarSign,
	Package,
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	TrendingUp,
	TrendingDown,
} from "lucide-react";

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

const ordersData = [
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		timeline: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 2,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		timeline: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 2,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		timeline: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		timeline: "7 Days",
		status: "pending",
	},
	{
		id: "SB002",
		product: "Gloves Black",
		quantity: 2,
		price: "$15",
		location: "Chennai, Tamil Nadu, 6000",
		timeline: "5 Days",
		status: "pending",
	},
	{
		id: "SB003",
		product: "Jacket Blue",
		quantity: 1,
		price: "$42",
		location: "Mumbai, Maharashtra, 4000",
		timeline: "10 Days",
		status: "pending",
	},
	{
		id: "SB004",
		product: "Boots Black",
		quantity: 3,
		price: "$96",
		location: "Pune, Maharashtra, 4111",
		timeline: "8 Days",
		status: "pending",
	},
	{
		id: "SB005",
		product: "Knee Pads Red",
		quantity: 4,
		price: "$29",
		location: "Hyderabad, Telangana, 5001",
		timeline: "6 Days",
		status: "pending",
	},
	{
		id: "SB006",
		product: "Elbow Guards Green",
		quantity: 2,
		price: "$22",
		location: "Ahmedabad, Gujarat, 3800",
		timeline: "4 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		timeline: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		timeline: "7 Days",
		status: "pending",
	},
];

export default function SellerOrdersPage() {
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

			{/* Safety Buy Requests */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
			>
				<Card className="bg-white border-0 shadow-sm">
					<div className="p-6 border-b">
						<div className="flex items-center space-x-2">
							<div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
								<ShoppingCart className="w-3 h-3 text-purple-600" />
							</div>
							<h2 className="text-lg font-semibold text-gray-900">
								Safety Buy Requests
							</h2>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Request ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Quantity
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Price
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Delivery Location
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Delivery Timeline
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Action
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{ordersData.map((order, index) => (
									<motion.tr
										key={`${order.id}-${index}`}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.05 }}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{order.id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{order.product}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{order.quantity}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
											{order.price}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{order.location}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{order.timeline}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
											<Button
												size="sm"
												variant="outline"
												className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
											>
												Decline
											</Button>
											<Button
												size="sm"
												className="bg-green-600 hover:bg-green-700 text-white"
											>
												Accept
											</Button>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<div className="px-6 py-4 border-t flex items-center justify-center space-x-2">
						<Button variant="ghost" size="sm">
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="sm">
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</Card>
			</motion.div>
		</div>
	);
}
