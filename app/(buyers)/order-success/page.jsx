"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, Truck, Home, Download } from "lucide-react";
import Link from "next/link";
import useOrder from "@/hooks/useOrder.js";
import Image from "next/image";
import { useOrderStore } from "@/store/orderStore";

export default function OrderSuccessPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [orderDetails, setOrderDetails] = useState(null);
	const [isDownloading, setIsDownloading] = useState(false);

	// Use the useOrder hook
	// const { downloadInvoice } = useOrder();

	const orderId = searchParams.get("orderId");
	const orderNumber = searchParams.get("orderNumber");
	const { fetchOrder, downloadInvoice } = useOrderStore();

	useEffect(() => {
		if (!orderId || !orderNumber) {
			router.push("/");
			return;
		}

		const fetchOrderDetails = async () => {
			try {
				const orderData = await fetchOrder(orderId);

				// console.log("Order data:", orderData);

				// Flatten products from subOrders
				const products =
					orderData?.subOrders?.flatMap((sub) => sub.products) || [];

				setOrderDetails({
					orderId,
					orderNumber,
					estimatedDelivery: new Date(
						Date.now() + 7 * 24 * 60 * 60 * 1000
					).toLocaleDateString("en-IN", {
						year: "numeric",
						month: "short",
						day: "numeric",
					}),
					products, // save all products
					amount: orderData?.totalAmount || 0,
					discount: orderData?.discount || 0,
					paymentMethod: orderData?.paymentMethod,
					orderDate: orderData?.orderDate,
					customer: {
						name: orderData?.customerName,
						email: orderData?.customerEmail,
						mobile: orderData?.customerMobile,
					},
					address: orderData?.deliveryAddress,
					status: orderData?.status,
					coupon: orderData?.couponApplied
						? {
								code: orderData.couponApplied.couponCode,
								amount: orderData.couponApplied.discountAmount || 0,
						  }
						: null,
				});
			} catch (err) {
				console.error("Failed to fetch order details", err);
			}
		};

		fetchOrderDetails();
	}, [orderId, orderNumber, router, fetchOrder]);

	const handleDownloadInvoice = async () => {
		if (!orderDetails?.orderId || !orderDetails?.orderNumber) {
			alert("Order details not available");
			return;
		}

		setIsDownloading(true);

		try {
			const result = await downloadInvoice(
				orderDetails.orderId,
				orderDetails.orderNumber
			);

			if (!result.success) {
				alert(result.message || "Failed to download invoice");
			}
		} catch (error) {
			alert("An error occurred while downloading the invoice");
		} finally {
			setIsDownloading(false);
		}
	};

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
						<CardContent className="space-y-4 text-left">
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Order Number:</span>
								<Badge variant="secondary" className="font-mono">
									{orderDetails.orderNumber}
								</Badge>
							</div>
							{/* <div className="flex justify-between items-center">
								<span className="text-gray-600">Order ID:</span>
								<span className="font-medium">{orderDetails.orderId}</span>
							</div> */}
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Order Date:</span>
								<span className="font-medium">
									{new Date(orderDetails.orderDate).toLocaleString("en-IN", {
										year: "numeric",
										month: "short",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-gray-600">Estimated Delivery:</span>
								<span className="font-medium">
									{orderDetails.estimatedDelivery || "TBD"}
								</span>
							</div>

							{/* Customer Info */}
							<div className="border-t pt-3">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Customer:</span>
									<span className="font-medium">
										{orderDetails.customer.name}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Email:</span>
									<span className="font-medium">
										{orderDetails.customer.email}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Mobile:</span>
									<span className="font-medium">
										{orderDetails.customer.mobile}
									</span>
								</div>
							</div>

							{/* Address */}
							<div className="border-t pt-3">
								<span className="text-gray-600">Delivery Address:</span>
								<p className="font-medium text-sm mt-1">
									{orderDetails.address.fullAddress}
								</p>
							</div>

							{/* Products */}
							<div className="border-t pt-3">
								<span className="text-gray-600">Products:</span>
								<div className="space-y-2 mt-2">
									{orderDetails.products.map((p, idx) => (
										<div
											key={idx}
											className="flex items-center justify-between gap-3"
										>
											<Image
												width={60}
												height={60}
												src={p.productImage}
												alt={p.productName}
												className="w-12 h-12 rounded object-cover"
											/>
											<span className="flex-1 text-right truncate">
												{p.productName}
											</span>
											<span className="font-medium">₹{p.price}</span>
										</div>
									))}
								</div>
							</div>

							{/* Order summary */}
							<div className="border-t pt-3 space-y-2">
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Order Amount:</span>
									<span className="font-medium">
										₹{Number(orderDetails.amount || 0).toLocaleString("en-IN")}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Shipping:</span>
									<span className="font-medium">
										₹
										{Number(orderDetails?.shippingCost || 0).toLocaleString(
											"en-IN"
										)}
									</span>
								</div>
								{orderDetails.coupon && (
									<div className="flex justify-between items-center">
										<span className="text-gray-600">Coupon:</span>
										<span className="flex items-center gap-2 font-medium text-green-700">
											<Badge
												variant="secondary"
												className="bg-green-100 text-green-700"
											>
												{orderDetails.coupon.code}
											</Badge>
											-₹
											{Number(orderDetails.coupon.amount || 0).toLocaleString(
												"en-IN"
											)}
										</span>
									</div>
								)}
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Discount:</span>
									<span className="font-medium text-green-700">
										-₹
										{Number(orderDetails.discount || 0).toLocaleString("en-IN")}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<span className="text-gray-600">Payment Method:</span>
									<Badge className="font-medium bg-blue-300 text-blue-600 rounded-xl">
										{orderDetails.paymentMethod}
									</Badge>
								</div>
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
						<Button
							variant="outline"
							className="flex-1 bg-transparent"
							onClick={handleDownloadInvoice}
							disabled={isDownloading}
						>
							<Download className="w-4 h-4 mr-2" />
							{isDownloading ? "Downloading..." : "Download Invoice"}
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
