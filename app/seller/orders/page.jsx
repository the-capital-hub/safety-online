"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { toast } from "react-hot-toast";
import {
	Calendar,
	Search,
	RotateCcw,
	Package,
	Clock,
	CheckCircle,
	IndianRupee,
	Check,
	X,
	FileText,
} from "lucide-react";
import { useSellerOrderStore } from "@/store/sellerOrderStore.js";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore.js";
import { useRouter } from "next/navigation";

function SellerOrdersPage() {
	const {
		orders,
		loading,
		error,
		pagination,
		stats,
		filters,
		setFilters,
                resetFilters,
                fetchOrders,
                acceptOrder,
                rejectOrder,
                downloadShipmentReceipt,
                markAsDelivered,
        } = useSellerOrderStore();

	const isAuthenticated = useIsSellerAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	const handleFilterChange = (key, value) => {
		setFilters({ [key]: value, page: 1 });
	};

	const handleSearch = (e) => {
		if (e.key === "Enter") {
			setFilters({ search: e.target.value, page: 1 });
		}
	};

	const handlePageChange = (page) => {
		setFilters({ page });
	};

	const handleAcceptOrder = async (orderId) => {
		const result = await acceptOrder(orderId);
		if (result.success) {
			toast.success("Order accepted successfully");
		} else {
			toast.error("Failed to accept order");
		}
	};

	const handleRejectOrder = async (orderId) => {
		const result = await rejectOrder(orderId);
		if (result.success) {
			toast.success("Order rejected successfully");
		} else {
			toast.error("Failed to reject order");
		}
	};

        const handleDownloadReceipt = async (order) => {
                const orderNumber =
                        order?.orderId?.orderNumber || order?.orderNumber || order?._id || "order";

                const result = await downloadShipmentReceipt(order._id, orderNumber);
                if (result.success) {
                        toast.success("Shipment receipt downloaded successfully");
                } else {
                        toast.error("Failed to download shipment receipt");
                }
        };

        const handleMarkDelivered = async (orderId) => {
                const result = await markAsDelivered(orderId, new Date().toISOString());

                if (result.success) {
                        fetchOrders();
                        toast.success("Delivery confirmed successfully");
                        if (result.releaseError) {
                                toast.error(result.releaseError);
                        } else if (result.payment?.status === "released") {
                                toast.success("Escrow released to your account");
                        }
                } else {
                        toast.error(result.message || "Failed to update delivery status");
                }
        };

	const getStatusColor = (status) => {
		const colors = {
			pending: "bg-yellow-100 text-yellow-800",
			processing: "bg-blue-100 text-blue-800",
			shipped: "bg-indigo-100 text-indigo-800",
			delivered: "bg-green-100 text-green-800",
			cancelled: "bg-red-100 text-red-800",
		};
		return colors[status] || "bg-gray-100 text-gray-800";
	};

	const getPaymentMethodDisplay = (method) => {
		if (method === "cod") return "COD";
		return "Prepaid";
	};

	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/seller/login");
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	useEffect(() => {
		fetchOrders();
	}, [filters]);

	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<p className="text-red-600 mb-4">{error}</p>
					<Button onClick={fetchOrders}>Retry</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
				<p className="text-gray-600 mt-2">
					Manage your incoming orders and shipments
				</p>
			</motion.div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<Package className="h-8 w-8 text-blue-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									Total Orders
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.totalOrders}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<IndianRupee className="h-8 w-8 text-green-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									Total Revenue
								</p>
								<p className="text-2xl font-bold text-gray-900">
									₹{stats.totalRevenue.toFixed(2)}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<Clock className="h-8 w-8 text-yellow-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">
									Pending Orders
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.pendingOrders}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<CheckCircle className="h-8 w-8 text-green-600" />
							<div className="ml-4">
								<p className="text-sm font-medium">Processing Orders</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.processingOrders}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Main Content */}
			<Card>
				<CardHeader>
					<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
						{/* Search and Filters */}
						<div className="flex flex-wrap gap-4 items-center">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                                <Input
                                                                        name="searchQuery"
                                                                        placeholder="Search orders..."
									className="pl-10 w-64"
									onKeyPress={handleSearch}
								/>
							</div>

							<Select
								value={filters.status}
								onValueChange={(value) => handleFilterChange("status", value)}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Status</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="processing">Processing</SelectItem>
									<SelectItem value="shipped">Shipped</SelectItem>
									<SelectItem value="delivered">Delivered</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
								</SelectContent>
							</Select>

							<Select
								value={filters.paymentMethod}
								onValueChange={(value) =>
									handleFilterChange("paymentMethod", value)
								}
							>
								<SelectTrigger className="w-40">
									<SelectValue placeholder="Payment Method" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Methods</SelectItem>
									<SelectItem value="cod">COD</SelectItem>
									<SelectItem value="prepaid">Prepaid</SelectItem>
								</SelectContent>
							</Select>

							<Button variant="outline" onClick={resetFilters}>
								<RotateCcw className="w-4 h-4 mr-2" />
								Reset
							</Button>
						</div>
					</div>

					{/* Date Range Filter */}
					<div className="flex gap-4 items-center">
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4 text-gray-400" />
							<span className="text-sm font-medium">From</span>
                                                        <Input
                                                                name="startDate"
                                                                type="date"
								className="w-40"
								value={filters.startDate}
								onChange={(e) =>
									handleFilterChange("startDate", e.target.value)
								}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Calendar className="w-4 h-4 text-gray-400" />
							<span className="text-sm font-medium">To</span>
                                                        <Input
                                                                name="endDate"
                                                                type="date"
								className="w-40"
								value={filters.endDate}
								onChange={(e) => handleFilterChange("endDate", e.target.value)}
							/>
						</div>
					</div>
				</CardHeader>

				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center h-64">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
						</div>
					) : (
                                                <>
                                                        <Table>
								<TableHeader>
									<TableRow>
										<TableHead>Order #</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Product Details</TableHead>
										<TableHead>Payment</TableHead>
										<TableHead>Amount</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
                                                                        {orders.map((order) => {
                                                                                const products = Array.isArray(order.products)
                                                                                        ? order.products
                                                                                        : [];
                                                                                const rawTotalAmount = Number(
                                                                                        order.totalAmount ??
                                                                                                order.orderId?.totalAmount ??
                                                                                                0,
                                                                                );
                                                                                const totalAmount = Number.isFinite(rawTotalAmount)
                                                                                        ? rawTotalAmount
                                                                                        : 0;
                                                                                const normalizedStatus = (order.status || "")
                                                                                        .toString()
                                                                                        .toLowerCase();
                                                                                const statusLabel = normalizedStatus
                                                                                        ? normalizedStatus.toUpperCase()
                                                                                        : "N/A";

                                                                                return (
                                                                                        <motion.tr
                                                                                                key={order._id}
                                                                                                initial={{ opacity: 0, y: 10 }}
                                                                                                animate={{ opacity: 1, y: 0 }}
                                                                                                transition={{ duration: 0.2 }}
                                                                                        >
											<TableCell className="font-medium">
												{order.orderId?.orderNumber || order.orderNumber || "N/A"}
											</TableCell>
											<TableCell>
												{order.orderId?.orderDate ? new Date(order.orderId.orderDate).toLocaleDateString() : "N/A"}
												<br />
												<span className="text-xs text-gray-500">
													{order.orderId?.orderDate
															? new Date(order.orderId.orderDate).toLocaleTimeString()
															: ""}
												</span>
											</TableCell>
											<TableCell>
                                                                                                <div className="space-y-2">
                                                                                                        {products.slice(0, 2).map((product, index) => (
														<div
															key={index}
															className="flex items-center gap-3"
														>
															<img
																src={
																	product.productImage ||
																	"/placeholder.svg?height=40&width=40"
																}
																alt={product.productName}
																className="w-10 h-10 object-cover rounded"
															/>
															<div>
																<p className="font-medium text-sm">
																	{product.productName}
																</p>
																<p className="text-xs text-gray-500">
																	Qty: {product.quantity}
																</p>
															</div>
														</div>
													))}
                                                                                                        {products.length > 2 && (
                                                                                                                <p className="text-xs text-gray-500">
                                                                                                                        +{products.length - 2} more items
														</p>
													)}
												</div>
											</TableCell>
											<TableCell>
												<Badge className="bg-blue-100 text-blue-800">
													{getPaymentMethodDisplay(order.orderId?.paymentMethod || order.paymentMethod)}
												</Badge>
											</TableCell>
											<TableCell className="font-medium text-green-600">
                                                                                                ₹{totalAmount.toFixed(2)}
											</TableCell>
											<TableCell>
                                                                                                <Badge className={getStatusColor(normalizedStatus || "unknown")}>
                                                                                                        {statusLabel}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex gap-1">
                                                                                                        {normalizedStatus === "pending" && (
														<>
															<Button
																size="sm"
																className="bg-green-600 hover:bg-green-700"
																onClick={() => handleAcceptOrder(order._id)}
															>
																<Check className="w-4 h-4 mr-1" />
																Accept
															</Button>
															<Button
																size="sm"
																variant="outline"
																className="text-red-600 hover:text-red-700 bg-transparent"
																onClick={() => handleRejectOrder(order._id)}
															>
																<X className="w-4 h-4 mr-1" />
																Reject
															</Button>
														</>
													)}
                                        {normalizedStatus === "processing" && (
                                                <>
                                                        <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDownloadReceipt(order)}
                                                        >
                                                                <FileText className="w-4 h-4 mr-1" />
                                                                Receipt
                                                        </Button>
                                                        <Button
                                                                size="sm"
                                                                className="bg-emerald-600 hover:bg-emerald-700"
                                                                onClick={() => handleMarkDelivered(order._id)}
                                                        >
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                Mark Delivered
                                                        </Button>
                                                </>
                                        )}
                                        {normalizedStatus === "shipped" && (
                                                <Button
                                                        size="sm"
                                                        className="bg-emerald-600 hover:bg-emerald-700"
                                                        onClick={() => handleMarkDelivered(order._id)}
                                                >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Mark Delivered
                                                </Button>
                                        )}
												</div>
											</TableCell>
                                                                                </motion.tr>
                                                                                );
                                                                        })}
								</TableBody>
							</Table>

							{/* Pagination */}
							<div className="flex items-center justify-between mt-4">
								<p className="text-md text-gray-700">
									{pagination.totalOrders} orders
								</p>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										disabled={!pagination.hasPrev}
										onClick={() => handlePageChange(pagination.currentPage - 1)}
									>
										Previous
									</Button>
									{Array.from(
										{ length: Math.min(5, pagination.totalPages) },
										(_, i) => {
											const page = i + 1;
											return (
												<Button
													key={page}
													size="sm"
													variant={
														pagination.currentPage === page
															? "default"
															: "outline"
													}
													onClick={() => handlePageChange(page)}
												>
													{page}
												</Button>
											);
										}
									)}
									<Button
										variant="outline"
										size="sm"
										disabled={!pagination.hasNext}
										onClick={() => handlePageChange(pagination.currentPage + 1)}
									>
										Next
									</Button>
								</div>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default SellerOrdersPage;
