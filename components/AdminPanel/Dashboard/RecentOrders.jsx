"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Clock } from "lucide-react";
import Link from "next/link";

const statusColors = {
	pending: "bg-yellow-100 text-yellow-800",
	confirmed: "bg-blue-100 text-blue-800",
	processing: "bg-purple-100 text-purple-800",
	shipped: "bg-indigo-100 text-indigo-800",
	delivered: "bg-green-100 text-green-800",
	cancelled: "bg-red-100 text-red-800",
	returned: "bg-gray-100 text-gray-800",
};

export function RecentOrders({ orders = [] }) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 1.1 }}
		>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<Clock className="w-5 h-5 text-blue-600" />
						Recent Orders
					</CardTitle>
					<Link href="/admin/orders">
						<Button variant="outline" size="sm">
							View All
						</Button>
					</Link>
				</CardHeader>
				<CardContent>
					{orders.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-gray-500">No recent orders found</p>
						</div>
					) : (
						<div className="space-y-4">
							{orders.map((order, index) => (
								<motion.div
									key={order._id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
									className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<p className="font-semibold text-gray-900">
												#{order.orderNumber}
											</p>
											<Badge
												className={
													statusColors[order.status] || statusColors.pending
												}
											>
												{order.status}
											</Badge>
										</div>
										<p className="text-sm text-gray-600">
											{order.customerName}
										</p>
										<p className="text-xs text-gray-500">
											{new Date(order.orderDate).toLocaleDateString()}
										</p>
									</div>
									<div className="text-right">
										<p className="font-bold text-gray-900">
											₹{order.totalAmount.toLocaleString()}
										</p>
										<Link href={`/admin/orders`}>
											<Button variant="ghost" size="sm" className="mt-1">
												<Eye className="w-4 h-4" />
											</Button>
										</Link>
									</div>
								</motion.div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
