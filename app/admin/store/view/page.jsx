"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	ExternalLink,
	Settings,
	Palette,
	Eye,
	ShoppingBag,
	Users,
	Package,
	TrendingUp,
	Activity,
} from "lucide-react";
import Link from "next/link";

export default function ViewStorePage() {
	const [storeStats] = useState({
		status: "Live",
		products: 156,
		categories: 12,
		orders: 89,
		visitors: 1247,
		revenue: "$12,450",
		conversionRate: "3.2%",
	});

	const [recentActivity] = useState([
		{
			action: "Product added",
			item: "Wireless Headphones",
			time: "2 hours ago",
		},
		{ action: "Order received", item: "Order #1234", time: "4 hours ago" },
		{ action: "Category updated", item: "Electronics", time: "6 hours ago" },
		{
			action: "Customer registered",
			item: "john@example.com",
			time: "8 hours ago",
		},
	]);

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="flex items-center justify-between">
					<h1 className="text-3xl font-bold text-gray-900">View Store</h1>
					<div className="flex items-center gap-2">
						<Badge
							variant={storeStats.status === "Live" ? "default" : "secondary"}
							className="bg-green-100 text-green-800"
						>
							<Activity className="w-3 h-3 mr-1" />
							{storeStats.status}
						</Badge>
					</div>
				</div>
			</motion.div>

			{/* Store Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Products</p>
								<p className="text-2xl font-bold text-gray-900">
									{storeStats.products}
								</p>
							</div>
							<Package className="w-8 h-8 text-blue-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Categories</p>
								<p className="text-2xl font-bold text-gray-900">
									{storeStats.categories}
								</p>
							</div>
							<ShoppingBag className="w-8 h-8 text-green-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Orders</p>
								<p className="text-2xl font-bold text-gray-900">
									{storeStats.orders}
								</p>
							</div>
							<TrendingUp className="w-8 h-8 text-purple-600" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Visitors</p>
								<p className="text-2xl font-bold text-gray-900">
									{storeStats.visitors}
								</p>
							</div>
							<Users className="w-8 h-8 text-orange-600" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<Link href="/admin/store/settings">
							<Button
								variant="outline"
								className="w-full justify-start bg-transparent"
							>
								<Settings className="w-4 h-4 mr-2" />
								Store Settings
							</Button>
						</Link>

						<Link href="/admin/store/customizations">
							<Button
								variant="outline"
								className="w-full justify-start bg-transparent"
							>
								<Palette className="w-4 h-4 mr-2" />
								Customize Store
							</Button>
						</Link>

						<Button
							variant="outline"
							className="w-full justify-start bg-transparent"
						>
							<Eye className="w-4 h-4 mr-2" />
							Preview Changes
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Store Preview */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader>
						<CardTitle>Store Preview</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
							<div className="text-center">
								<Eye className="w-12 h-12 text-gray-400 mx-auto mb-2" />
								<p className="text-gray-600">Store Preview</p>
								<p className="text-sm text-gray-500">
									Visual representation of your live store
								</p>
							</div>
						</div>
						<div className="flex gap-2">
							<Button size="sm" className="flex-1">
								<ExternalLink className="w-4 h-4 mr-2" />
								Visit Live Store
							</Button>
							<Button
								size="sm"
								variant="outline"
								className="flex-1 bg-transparent"
							>
								<Eye className="w-4 h-4 mr-2" />
								Preview Mode
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Recent Activity</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{recentActivity.map((activity, index) => (
								<div
									key={index}
									className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
								>
									<div>
										<p className="text-sm font-medium text-gray-900">
											{activity.action}
										</p>
										<p className="text-sm text-gray-600">{activity.item}</p>
									</div>
									<p className="text-xs text-gray-500">{activity.time}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Performance Metrics */}
			<Card>
				<CardHeader>
					<CardTitle>Performance Metrics</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="text-center">
							<p className="text-2xl font-bold text-green-600">
								{storeStats.revenue}
							</p>
							<p className="text-sm text-gray-600">Total Revenue</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-blue-600">
								{storeStats.conversionRate}
							</p>
							<p className="text-sm text-gray-600">Conversion Rate</p>
						</div>
						<div className="text-center">
							<p className="text-2xl font-bold text-purple-600">
								{storeStats.visitors}
							</p>
							<p className="text-sm text-gray-600">Monthly Visitors</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
