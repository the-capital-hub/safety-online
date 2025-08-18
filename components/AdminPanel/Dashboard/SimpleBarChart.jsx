"use client";

import { motion } from "framer-motion";

export function SimpleBarChart({ data = [], title, height = 300 }) {
	if (!data.length) return null;

	const maxValue = Math.max(
		...data.map((item) => item.orders || item.count || 0)
	);

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
			<div
				className="flex items-end justify-between space-x-2"
				style={{ height }}
			>
				{data.map((item, index) => {
					const value = item.orders || item.count || 0;
					const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

					return (
						<motion.div
							key={index}
							initial={{ height: 0 }}
							animate={{ height: `${percentage}%` }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							className="flex-1 bg-blue-500 rounded-t-md min-h-[4px] relative group"
							style={{ maxWidth: "60px" }}
						>
							<div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
								{value}
							</div>
							<div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
								{item.month || item.status || item.date || `Item ${index + 1}`}
							</div>
						</motion.div>
					);
				})}
			</div>
		</div>
	);
}
