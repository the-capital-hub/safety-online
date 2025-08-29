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

export default function SellerProductsPage() {
	const router = useRouter();
	const isAuthenticated = useIsSellerAuthenticated();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/seller/login");
			return;
		}
	}, [isAuthenticated, router]);

	return (
		<>
			{/* Stats */}
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
		</>
	);
}
