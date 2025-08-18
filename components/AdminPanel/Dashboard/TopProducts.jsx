"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Package } from "lucide-react";
import Link from "next/link";

export function TopProducts({ products = [] }) {
	const maxSold = Math.max(...products.map((p) => p.totalSold), 1);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: 1.2 }}
		>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle className="flex items-center gap-2">
						<TrendingUp className="w-5 h-5 text-green-600" />
						Top Selling Products
					</CardTitle>
					<Link href="/admin/catalog/products">
						<Button variant="outline" size="sm">
							View All
						</Button>
					</Link>
				</CardHeader>
				<CardContent>
					{products.length === 0 ? (
						<div className="text-center py-8">
							<Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
							<p className="text-gray-500">No product data available</p>
						</div>
					) : (
						<div className="space-y-6">
							{products.map((product, index) => (
								<motion.div
									key={product._id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
									className="space-y-2"
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<p className="font-medium text-gray-900 truncate">
												{product.productName || `Product ${index + 1}`}
											</p>
											<p className="text-sm text-gray-600">
												{product.totalSold} sold • ₹
												{product.revenue.toLocaleString()} revenue
											</p>
										</div>
										<div className="text-right">
											<span className="text-sm font-medium text-gray-900">
												#{index + 1}
											</span>
										</div>
									</div>
									<Progress
										value={(product.totalSold / maxSold) * 100}
										className="h-2"
									/>
								</motion.div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</motion.div>
	);
}
