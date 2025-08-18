"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatsCard({
	title,
	value,
	change,
	subtitle,
	icon: Icon,
	color = "blue",
	delay = 0,
}) {
	const colorClasses = {
		blue: "text-blue-600 bg-blue-50",
		green: "text-green-600 bg-green-50",
		purple: "text-purple-600 bg-purple-50",
		orange: "text-orange-600 bg-orange-50",
		red: "text-red-600 bg-red-50",
		yellow: "text-yellow-600 bg-yellow-50",
	};

	const isPositiveChange = change >= 0;
	const hasChange = typeof change === "number";

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay }}
			whileHover={{ y: -2 }}
		>
			<Card className="hover:shadow-lg transition-shadow duration-200">
				<CardContent className="p-6">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
							<p className="text-2xl font-bold text-gray-900">{value}</p>

							{hasChange && (
								<div className="flex items-center mt-2">
									{isPositiveChange ? (
										<TrendingUp className="w-4 h-4 text-green-600 mr-1" />
									) : (
										<TrendingDown className="w-4 h-4 text-red-600 mr-1" />
									)}
									<span
										className={`text-sm font-medium ${
											isPositiveChange ? "text-green-600" : "text-red-600"
										}`}
									>
										{Math.abs(change)}%
									</span>
									<span className="text-sm text-gray-500 ml-1">
										vs last month
									</span>
								</div>
							)}

							{subtitle && !hasChange && (
								<p className="text-sm text-gray-500 mt-1">{subtitle}</p>
							)}
						</div>

						<div className={`p-3 rounded-full ${colorClasses[color]}`}>
							<Icon className="w-6 h-6" />
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	);
}
