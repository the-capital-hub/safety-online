"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Truck, Home, Download } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [orderDetails, setOrderDetails] = useState(null);

	const orderId = searchParams.get("orderId");
	const orderNumber = searchParams.get("orderNumber");

	useEffect(() => {
		if (!orderId || !orderNumber) {
			router.push("/");
			return;
		}

		// You can fetch order details here if needed
		setOrderDetails({
			orderId,
			orderNumber,
			estimatedDelivery: new Date(
				Date.now() + 7 * 24 * 60 * 60 * 1000
			).toLocaleDateString(),
		});
	}, [orderId, orderNumber, router]);

	if (!orderDetails) {
		return <div>Loading...</div>;
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="text-center space-y-8"
				>
					{/* Success Icon */}
					<div className="flex justify-center">
						<div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
							<CheckCircle className="w-12 h-12 text-green-600" />
						</div>
					</div>

					{/* Success Message */}
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Order Placed Successfully!
						</h1>
						<p className="text-gray-600">
							Thank you for your purchase. Your order has been confirmed and is
							being processed.
						</p>
					</div>

					{/* Order Details Card */}
					<Card>
						<CardHeader>
							<CardTitle>Order Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Order Number:</span>
								<Badge variant="secondary" className="font-mono">
									{orderDetails.orderNumber}
								</Badge>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Order ID:</span>
								<span className="font-medium">{orderDetails.orderId}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Estimated Delivery:</span>
								<span className="font-medium">
									{orderDetails.estimatedDelivery}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Order Status Steps */}
					<Card>
						<CardHeader>
							<CardTitle>Order Status</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex items-center justify-between">
								<div className="flex flex-col items-center">
									<div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
										<CheckCircle className="w-5 h-5" />
									</div>
									<span className="text-sm mt-2 text-green-600 font-medium">
										Confirmed
									</span>
								</div>
								<div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
								<div className="flex flex-col items-center">
									<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
										<Package className="w-5 h-5 text-gray-400" />
									</div>
									<span className="text-sm mt-2 text-gray-400">Processing</span>
								</div>
								<div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
								<div className="flex flex-col items-center">
									<div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
										<Truck className="w-5 h-5 text-gray-400" />
									</div>
									<span className="text-sm mt-2 text-gray-400">Shipped</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row gap-4">
						<Button asChild className="flex-1">
							<Link href="/orders">
								<Package className="w-4 h-4 mr-2" />
								Track Order
							</Link>
						</Button>
						<Button variant="outline" className="flex-1 bg-transparent">
							<Download className="w-4 h-4 mr-2" />
							Download Invoice
						</Button>
						<Button variant="outline" asChild className="flex-1 bg-transparent">
							<Link href="/products">
								<Home className="w-4 h-4 mr-2" />
								Continue Shopping
							</Link>
						</Button>
					</div>

					{/* Additional Info */}
					<div className="text-center text-sm text-gray-500">
						<p>
							You will receive an email confirmation shortly with your order
							details.
						</p>
						<p className="mt-1">
							For any questions, please contact our support team.
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
