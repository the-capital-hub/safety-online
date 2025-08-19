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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
	Calendar,
	Search,
	Download,
	Filter,
	RotateCcw,
	Eye,
	Printer,
	Edit,
	Trash2,
	Package,
	DollarSign,
	Clock,
	CheckCircle,
} from "lucide-react";
import { useAdminOrderStore } from "@/store/adminOrderStore.js";
import { OrderDetailsPopup } from "@/components/AdminPanel/Popups/OrderDetailsPopup.jsx";
import { UpdateOrderPopup } from "@/components/AdminPanel/Popups/UpdateOrderPopup.jsx";
import { DeleteOrderPopup } from "@/components/AdminPanel/Popups/DeleteOrderPopup.jsx";
import { InvoicePopup } from "@/components/AdminPanel/Popups/InvoicePopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

function OrderPage() {
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
		updateOrder,
		deleteOrder,
		downloadInvoice,
		bulkUpdateStatus,
	} = useAdminOrderStore();

	const [selectedOrders, setSelectedOrders] = useState([]);
	const [popups, setPopups] = useState({
		details: { open: false, order: null },
		update: { open: false, order: null },
		delete: { open: false, order: null },
		invoice: { open: false, order: null },
	});

	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/admin/login");
			}, 3);
			
			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	// Show redirecting message if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	useEffect(() => {
		fetchOrders();
	}, [filters]);

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

	const handleStatusUpdate = async (orderId, newStatus) => {
		const result = await updateOrder(orderId, { status: newStatus });
		if (result.success) {
			toast.success("Order status updated successfully");
		} else {
			toast.error("Failed to update order status");
		}
	};

	const handleBulkStatusUpdate = async (status) => {
		if (selectedOrders.length === 0) {
			toast.error("Please select orders to update");
			return;
		}

		const result = await bulkUpdateStatus(selectedOrders, status);
		if (result.success) {
			toast.success(`${selectedOrders.length} orders updated successfully`);
			setSelectedOrders([]);
		} else {
			toast.error("Failed to update orders");
		}
	};

	const handleDownloadInvoice = async (order) => {
		const result = await downloadInvoice(order._id, order.orderNumber);
		if (result.success) {
			toast.success("Invoice downloaded successfully");
		} else {
			toast.error("Failed to download invoice");
		}
	};

	const openPopup = (type, order = null) => {
		setPopups((prev) => ({
			...prev,
			[type]: { open: true, order },
		}));
	};

	const closePopup = (type) => {
		setPopups((prev) => ({
			...prev,
			[type]: { open: false, order: null },
		}));
	};

	const getStatusColor = (status) => {
		const colors = {
			pending: "bg-yellow-100 text-yellow-800",
			confirmed: "bg-blue-100 text-blue-800",
			processing: "bg-purple-100 text-purple-800",
			shipped: "bg-indigo-100 text-indigo-800",
			delivered: "bg-green-100 text-green-800",
			cancelled: "bg-red-100 text-red-800",
			returned: "bg-gray-100 text-gray-800",
		};
		return colors[status] || "bg-gray-100 text-gray-800";
	};

	const getPaymentStatusColor = (status) => {
		const colors = {
			paid: "bg-green-100 text-green-800",
			pending: "bg-yellow-100 text-yellow-800",
			failed: "bg-red-100 text-red-800",
			refunded: "bg-gray-100 text-gray-800",
		};
		return colors[status] || "bg-gray-100 text-gray-800";
	};

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
		<>
			<div className="space-y-6">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">
						Orders Management
					</h1>
					<p className="text-gray-600 mt-2">
						Manage and track all customer orders
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
								<DollarSign className="h-8 w-8 text-green-600" />
								<div className="ml-4">
									<p className="text-sm font-medium text-gray-600">
										Total Revenue
									</p>
									<p className="text-2xl font-bold text-gray-900">
										${stats.totalRevenue.toFixed(2)}
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
									<p className="text-sm font-medium text-gray-600">Completed</p>
									<p className="text-2xl font-bold text-gray-900">
										{stats.completedOrders}
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
										<SelectItem value="confirmed">Confirmed</SelectItem>
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
										<SelectItem value="cash">Cash</SelectItem>
										<SelectItem value="credit_card">Credit Card</SelectItem>
										<SelectItem value="debit_card">Debit Card</SelectItem>
										<SelectItem value="net_banking">Net Banking</SelectItem>
										<SelectItem value="upi">UPI</SelectItem>
									</SelectContent>
								</Select>

								<Button variant="outline" onClick={resetFilters}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-2">
								{selectedOrders.length > 0 && (
									<div className="flex gap-2">
										<Select onValueChange={handleBulkStatusUpdate}>
											<SelectTrigger className="w-40">
												<SelectValue placeholder="Bulk Update" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="confirmed">
													Mark Confirmed
												</SelectItem>
												<SelectItem value="processing">
													Mark Processing
												</SelectItem>
												<SelectItem value="shipped">Mark Shipped</SelectItem>
												<SelectItem value="delivered">
													Mark Delivered
												</SelectItem>
											</SelectContent>
										</Select>
									</div>
								)}

								<Button className="bg-green-600 hover:bg-green-700">
									<Download className="w-4 h-4 mr-2" />
									Export Orders
								</Button>
							</div>
						</div>

						{/* Date Range Filter */}
						<div className="flex gap-4 items-center">
							<div className="flex items-center gap-2">
								<Calendar className="w-4 h-4 text-gray-400" />
								<Input
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
								<Input
									type="date"
									className="w-40"
									value={filters.endDate}
									onChange={(e) =>
										handleFilterChange("endDate", e.target.value)
									}
								/>
							</div>
							<Button className="bg-green-600 hover:bg-green-700">
								<Filter className="w-4 h-4 mr-2" />
								Apply Date Filter
							</Button>
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
											<TableHead className="w-12">
												<Checkbox
													checked={
														selectedOrders.length === orders.length &&
														orders.length > 0
													}
													onCheckedChange={(checked) => {
														if (checked) {
															setSelectedOrders(
																orders.map((order) => order._id)
															);
														} else {
															setSelectedOrders([]);
														}
													}}
												/>
											</TableHead>
											<TableHead>Order #</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Customer</TableHead>
											<TableHead>Products</TableHead>
											<TableHead>Payment</TableHead>
											<TableHead>Amount</TableHead>
											<TableHead>Status</TableHead>
											<TableHead>Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{orders.map((order) => (
											<motion.tr
												key={order._id}
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.2 }}
											>
												<TableCell>
													<Checkbox
														checked={selectedOrders.includes(order._id)}
														onCheckedChange={(checked) => {
															if (checked) {
																setSelectedOrders([
																	...selectedOrders,
																	order._id,
																]);
															} else {
																setSelectedOrders(
																	selectedOrders.filter(
																		(id) => id !== order._id
																	)
																);
															}
														}}
													/>
												</TableCell>
												<TableCell className="font-medium">
													{order.orderNumber}
												</TableCell>
												<TableCell>
													{new Date(order.orderDate).toLocaleDateString()}
													<br />
													<span className="text-xs text-gray-500">
														{new Date(order.orderDate).toLocaleTimeString()}
													</span>
												</TableCell>
												<TableCell>
													<div>
														<p className="font-medium">{order.customerName}</p>
														<p className="text-xs text-gray-500">
															{order.customerEmail}
														</p>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<Package className="w-4 h-4" />
														<span>{order.products.length} items</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="space-y-1">
														<Badge
															className={getPaymentStatusColor(
																order.paymentStatus
															)}
														>
															{order.paymentStatus}
														</Badge>
														<p className="text-xs text-gray-500">
															{order.paymentMethod.replace("_", " ")}
														</p>
													</div>
												</TableCell>
												<TableCell className="font-medium text-green-600">
													${order.totalAmount.toFixed(2)}
												</TableCell>
												<TableCell>
													<Select
														value={order.status}
														onValueChange={(value) =>
															handleStatusUpdate(order._id, value)
														}
													>
														<SelectTrigger className="w-32">
															<SelectValue>
																<Badge className={getStatusColor(order.status)}>
																	{order.status}
																</Badge>
															</SelectValue>
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="pending">Pending</SelectItem>
															<SelectItem value="confirmed">
																Confirmed
															</SelectItem>
															<SelectItem value="processing">
																Processing
															</SelectItem>
															<SelectItem value="shipped">Shipped</SelectItem>
															<SelectItem value="delivered">
																Delivered
															</SelectItem>
															<SelectItem value="cancelled">
																Cancelled
															</SelectItem>
														</SelectContent>
													</Select>
												</TableCell>
												<TableCell>
													<div className="flex gap-1">
														<Button
															size="icon"
															variant="outline"
															onClick={() => openPopup("details", order)}
														>
															<Eye className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															onClick={() => openPopup("update", order)}
														>
															<Edit className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															onClick={() => handleDownloadInvoice(order)}
														>
															<Printer className="w-4 h-4" />
														</Button>
														<Button
															size="icon"
															variant="outline"
															className="text-red-600 hover:text-red-700 bg-transparent"
															onClick={() => openPopup("delete", order)}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													</div>
												</TableCell>
											</motion.tr>
										))}
									</TableBody>
								</Table>

								{/* Pagination */}
								<div className="flex items-center justify-between mt-4">
									<p className="text-sm text-gray-600">
										Showing {(pagination.currentPage - 1) * filters.limit + 1}{" "}
										to{" "}
										{Math.min(
											pagination.currentPage * filters.limit,
											pagination.totalOrders
										)}{" "}
										of {pagination.totalOrders} orders
									</p>
									<div className="flex gap-2">
										<Button
											variant="outline"
											size="sm"
											disabled={!pagination.hasPrev}
											onClick={() =>
												handlePageChange(pagination.currentPage - 1)
											}
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
											onClick={() =>
												handlePageChange(pagination.currentPage + 1)
											}
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

			{/* Popups */}
			<OrderDetailsPopup
				open={popups.details.open}
				onOpenChange={() => closePopup("details")}
				order={popups.details.order}
			/>

			<UpdateOrderPopup
				open={popups.update.open}
				onOpenChange={() => closePopup("update")}
				order={popups.update.order}
				onUpdate={fetchOrders}
			/>

			<DeleteOrderPopup
				open={popups.delete.open}
				onOpenChange={() => closePopup("delete")}
				itemName={popups.delete.order?.orderNumber}
				onConfirm={async () => {
					const result = await deleteOrder(popups.delete.order._id);
					if (result.success) {
						toast({
							title: "Success",
							description: "Order deleted successfully",
						});
					} else {
						toast({
							title: "Error",
							description: result.message,
							variant: "destructive",
						});
					}
					closePopup("delete");
				}}
			/>

			<InvoicePopup
				open={popups.invoice.open}
				onOpenChange={() => closePopup("invoice")}
				order={popups.invoice.order}
			/>
		</>
	);
}

export default OrderPage;
