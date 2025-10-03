"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Eye,
	Download,
	Loader2,
	AlertCircle,
	RotateCcw,
	Truck,
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore.js";
import { toast } from "react-hot-toast";
import { OrderDetailPopup } from "./SubComponents/OrderDetailPopup";
import { ReturnRequestDialog } from "./SubComponents/ReturnRequestDialog";
import { TrackingModal } from "./SubComponents/TrackingModal";

const getStatusColor = (status) => {
	const colors = {
		delivered: "bg-green-100 text-green-800",
		shipped: "bg-blue-100 text-blue-800",
		processing: "bg-yellow-100 text-yellow-800",
		pending: "bg-orange-100 text-orange-800",
		confirmed: "bg-blue-100 text-blue-800",
		cancelled: "bg-red-100 text-red-800",
		returned: "bg-gray-100 text-gray-800",
	};
	return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString) => {
	return new Date(dateString).toLocaleDateString("en-IN", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
};

const formatPrice = (price) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(price);
};

const tableVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const rowVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

// ✅ helper: flatten all products from nested subOrders
const getAllProducts = (order) => {
	if (!Array.isArray(order.subOrders)) return [];
	return order.subOrders.flatMap((sub) => sub.products || []);
};

export function OrderHistory({ userId }) {
	const {
		orders,
		loading,
		error,
		pagination,
		fetchOrders,
		fetchOrder,
		downloadInvoice,
		returnSettings,
		fetchReturnSettings,
		requestReturn,
		returnActionLoading,
	} = useOrderStore();

	const [downloadingInvoices, setDownloadingInvoices] = useState(new Set());
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
	const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
	const [returnOrder, setReturnOrder] = useState(null);
	const [returnDialogLoading, setReturnDialogLoading] = useState(false);
	const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
	const [trackingSubOrder, setTrackingSubOrder] = useState(null);

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	useEffect(() => {
		fetchReturnSettings();
	}, [fetchReturnSettings]);

	const handleViewOrder = async (orderId) => {
		try {
			setLoadingOrderDetails(true);
			const result = await fetchOrder(orderId);

			if (result && result.success !== false) {
				const orderData =
					result.data?.order || result.order || result.data || result;

				if (orderData) {
					setSelectedOrder(orderData);
					setIsPopupOpen(true);
				} else {
					toast.error("Order details not found");
				}
			} else {
				toast.error(result?.message || "Failed to fetch order details");
			}
		} catch (error) {
			console.error("Error fetching order details:", error);
			toast.error("Failed to fetch order details");
		} finally {
			setLoadingOrderDetails(false);
		}
	};

	const handleClosePopup = () => {
		setIsPopupOpen(false);
		setSelectedOrder(null);
	};

	const handleDownloadInvoice = async (orderId, orderNumber) => {
		setDownloadingInvoices((prev) => new Set(prev).add(orderId));

		try {
			const result = await downloadInvoice(orderId, orderNumber);
			if (result.success) {
				toast.success("Invoice downloaded successfully");
			} else {
				toast.error(result.message || "Failed to download invoice");
			}
		} catch (error) {
			toast.error("Failed to download invoice");
		} finally {
			setDownloadingInvoices((prev) => {
				const newSet = new Set(prev);
				newSet.delete(orderId);
				return newSet;
			});
		}
	};

	const handleExportAll = () => {
		console.log("Export all orders");
		toast.success("Export functionality coming soon");
	};

	const hasActiveReturnRequest = (order) => {
		if (!Array.isArray(order?.returnRequests)) {
			return false;
		}

		return order.returnRequests.some((request) =>
			["pending", "approved", "processing"].includes(request.status)
		);
	};

	const isReturnEligible = (order) => {
		if (!returnSettings?.enabled) {
			return false;
		}

		if (!order) {
			return false;
		}

		if (hasActiveReturnRequest(order)) {
			return false;
		}

		const orderStatus = order.status?.toLowerCase();
		if (orderStatus === "delivered") {
			return true;
		}

		if (Array.isArray(order.subOrders)) {
			return order.subOrders.some(
				(subOrder) => subOrder.status === "delivered"
			);
		}

		return false;
	};

	const handleOpenReturnDialog = async (order) => {
		try {
			setReturnDialogLoading(true);
			const details = await fetchOrder(order._id);
			const resolvedOrder = details?.order || details;

			if (!resolvedOrder) {
				toast.error("Unable to load order details for return");
				return;
			}

			setReturnOrder(resolvedOrder);
			setIsReturnDialogOpen(true);
		} catch (error) {
			console.error("Open return dialog error:", error);
			toast.error("Failed to open return request form");
		} finally {
			setReturnDialogLoading(false);
		}
	};

	const handleReturnDialogChange = (open) => {
		if (!open) {
			setIsReturnDialogOpen(false);
			setReturnOrder(null);
		} else {
			setIsReturnDialogOpen(true);
		}
	};

	const handleSubmitReturn = async ({ subOrderId, reason, description }) => {
		if (!returnOrder) {
			toast.error("No order selected for return");
			return;
		}

		const result = await requestReturn(returnOrder._id, {
			subOrderId,
			reason,
			description,
		});

		if (result.success) {
			toast.success("Return request submitted successfully");
			setIsReturnDialogOpen(false);
			setReturnOrder(null);
			fetchOrders();
		} else {
			toast.error(result.message || "Failed to submit return request");
		}
	};

	const handleTrackShipment = (subOrder) => {
		if (!subOrder?.shipmentPackage) {
			toast.error("No shipment package available for this order");
			return;
		}

		setTrackingSubOrder(subOrder);
		setIsTrackingModalOpen(true);
	};

	const handleCloseTrackingModal = () => {
		setIsTrackingModalOpen(false);
		setTrackingSubOrder(null);
	};

	if (loading && orders.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Orders History</CardTitle>
					<CardDescription>Loading your order history...</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<Loader2 className="h-8 w-8 animate-spin" />
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Orders History</CardTitle>
					<CardDescription>Error loading order history</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center py-8">
					<div className="text-center">
						<AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
						<p className="text-red-600">{error}</p>
						<Button
							variant="outline"
							className="mt-4"
							onClick={() => fetchOrders()}
						>
							Try Again
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Orders History</CardTitle>
						<CardDescription>
							{pagination.totalOrders > 0
								? `Showing ${orders.length} of ${pagination.totalOrders} orders`
								: "No orders found"}
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent>
					{orders.length === 0 ? (
						<div className="text-center py-8">
							<p className="text-muted-foreground">No orders found</p>
						</div>
					) : (
						<motion.div
							variants={tableVariants}
							initial="hidden"
							animate="visible"
						>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Order Number</TableHead>
										<TableHead>Products</TableHead>
										<TableHead>Total Items</TableHead>
										<TableHead>Order Date</TableHead>
										<TableHead>Total Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{orders.map((order) => {
										const products = getAllProducts(order);

										return (
											<motion.tr
												key={order._id}
												variants={rowVariants}
												className="hover:bg-muted/50 transition-colors"
											>
												<TableCell className="font-medium">
													{order.orderNumber}
												</TableCell>

												{/* Products Preview */}
												<TableCell>
													<div>
														{products.length === 0 ? (
															<span className="text-sm text-muted-foreground">
																No products
															</span>
														) : products.length === 1 ? (
															<>
																<div className="font-medium">
																	{products[0].productName}
																</div>
																<div className="text-sm text-muted-foreground">
																	Qty: {products[0].quantity}
																</div>
															</>
														) : (
															<>
																<div className="font-medium">
																	{products[0].productName}
																</div>
																<div className="text-sm text-muted-foreground">
																	+{products.length - 1} more items
																</div>
															</>
														)}
													</div>
												</TableCell>

												{/* Total Items */}
												<TableCell>
													{products.reduce(
														(total, product) => total + (product.quantity || 0),
														0
													)}
												</TableCell>

												<TableCell>
													{formatDate(order.orderDate || order.createdAt)}
												</TableCell>
												<TableCell className="font-medium">
													{formatPrice(order.totalAmount)}
												</TableCell>
												<TableCell>
													<Badge className={getStatusColor(order.status)}>
														{order.status.charAt(0).toUpperCase() +
															order.status.slice(1)}
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-2">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleViewOrder(order._id)}
															disabled={loadingOrderDetails}
														>
															<Eye className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="sm"
															onClick={() =>
																handleDownloadInvoice(
																	order._id,
																	order.orderNumber
																)
															}
															disabled={downloadingInvoices.has(order._id)}
														>
															{downloadingInvoices.has(order._id) ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<Download className="h-4 w-4" />
															)}
														</Button>
														<Button
															variant="outline"
															size="sm"
															className="flex items-center gap-1"
															onClick={() => handleOpenReturnDialog(order)}
															disabled={
																returnDialogLoading ||
																returnActionLoading ||
																!isReturnEligible(order)
															}
														>
															<RotateCcw className="h-3.5 w-3.5" />
															Return
														</Button>
														{/* Tracking button for orders with shipment packages */}
														{order.subOrders?.some(
															(sub) => sub.shipmentPackage
														) && (
															<Button
																variant="outline"
																size="sm"
																className="flex items-center gap-1"
																onClick={() => {
																	const shippedSubOrder = order.subOrders.find(
																		(sub) => sub.shipmentPackage
																	);
																	if (shippedSubOrder) {
																		handleTrackShipment(shippedSubOrder);
																	}
																}}
															>
																<Truck className="h-3.5 w-3.5" />
																Track
															</Button>
														)}
														<Link
															href={`/reviews/${order._id}`}
															className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
														>
															Rate & Review
														</Link>
													</div>
												</TableCell>
											</motion.tr>
										);
									})}
								</TableBody>
							</Table>

							{/* Pagination */}
							{pagination.totalPages > 1 && (
								<div className="flex items-center justify-between mt-4">
									<div className="text-sm text-muted-foreground">
										Page {pagination.currentPage} of {pagination.totalPages}
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={!pagination.hasPrev || loading}
											onClick={() => {
												console.log("Previous page");
											}}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											disabled={!pagination.hasNext || loading}
											onClick={() => {
												console.log("Next page");
											}}
										>
											Next
										</Button>
									</div>
								</div>
							)}
						</motion.div>
					)}
				</CardContent>
			</Card>

			{/* Order Detail Popup */}
			<OrderDetailPopup
				open={isPopupOpen}
				onOpenChange={handleClosePopup}
				order={selectedOrder}
			/>
			<ReturnRequestDialog
				open={isReturnDialogOpen}
				onOpenChange={handleReturnDialogChange}
				order={returnOrder}
				settings={returnSettings}
				loading={returnActionLoading}
				onSubmit={handleSubmitReturn}
			/>
			<TrackingModal
				open={isTrackingModalOpen}
				onOpenChange={handleCloseTrackingModal}
				subOrder={trackingSubOrder}
			/>
		</>
	);
}
