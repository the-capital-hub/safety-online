"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import {
        Package,
        User,
        MapPin,
        CreditCard,
        Calendar,
        Phone,
        Mail,
        Truck,
        Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminOrderStore } from "@/store/adminOrderStore.js";
import { buildGstLineItems } from "@/lib/utils/gst.js";

export function OrderDetailsPopup({ open, onOpenChange, order, onOrderUpdated }) {
        const updateOrder = useAdminOrderStore((state) => state.updateOrder);
        const [statusForm, setStatusForm] = useState({
                status: order?.status || "",
                paymentStatus: order?.paymentStatus || "",
        });
        const [saving, setSaving] = useState(false);

        useEffect(() => {
                if (order) {
                        setStatusForm({
                                status: order.status || "",
                                paymentStatus: order.paymentStatus || "",
                        });
                }
        }, [order]);

        if (!order) return null;

        const normalizedProducts = (() => {
                if (Array.isArray(order?.products)) {
                        return order.products;
                }

                if (Array.isArray(order?.subOrders)) {
                        return order.subOrders.flatMap((subOrder) => {
                                if (!subOrder || !Array.isArray(subOrder.products)) {
                                        return [];
                                }

                                return subOrder.products.map((product) => ({
                                        ...product,
                                        productName:
                                                product.productName ||
                                                product?.productId?.name ||
                                                product?.productId?.title ||
                                                "",
                                        productImage:
                                                product.productImage ||
                                                product?.productId?.images?.[0] ||
                                                "",
                                }));
                        });
                }

                return [];
        })();

        const getSafeAmount = (value) => {
                const numericValue = Number.parseFloat(value);
                return Number.isFinite(numericValue) ? numericValue : 0;
        };

        const gstLines = buildGstLineItems(order.gst);
        const gstMode = order?.gst?.mode || "igst";

        const statusOptions = [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
                "returned",
        ];

        const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

        const formatStatusLabel = (value) =>
                value
                        .replace(/_/g, " ")
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");

        const hasStatusChanges =
                order.status !== statusForm.status || order.paymentStatus !== statusForm.paymentStatus;

        const handleStatusChange = (field, value) => {
                setStatusForm((prev) => ({
                        ...prev,
                        [field]: value,
                }));
        };

        const handleSaveStatuses = async () => {
                if (!order || !hasStatusChanges || saving) return;

                setSaving(true);
                const result = await updateOrder(order._id, {
                        status: statusForm.status,
                        paymentStatus: statusForm.paymentStatus,
                });
                setSaving(false);

                if (result.success) {
                        const updatedOrder = result.order || {
                                ...order,
                                status: statusForm.status,
                                paymentStatus: statusForm.paymentStatus,
                        };

                        toast.success(result.message || "Order status updated successfully");
                        setStatusForm({
                                status: updatedOrder.status || "",
                                paymentStatus: updatedOrder.paymentStatus || "",
                        });
                        onOrderUpdated?.(updatedOrder);
                } else {
                        toast.error(result.message || "Failed to update order status");
                }
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
                                        <DialogHeader>
                                                <DialogTitle className="text-xl font-bold">
                                                        Order Details - {order.orderNumber}
                                                </DialogTitle>
                                        </DialogHeader>

                                        <div className="space-y-6 mt-6">
                                                <Card>
                                                        <CardHeader className="pb-2">
                                                                <CardTitle className="text-base">
                                                                        Manage Order & Payment Status
                                                                </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                        <div className="space-y-2">
                                                                                <p className="text-sm font-medium text-gray-600">
                                                                                        Order Status
                                                                                </p>
                                                                                <Select
                                                                                        value={statusForm.status}
                                                                                        onValueChange={(value) =>
                                                                                                handleStatusChange("status", value)
                                                                                        }
                                                                                >
                                                                                        <SelectTrigger>
                                                                                                <SelectValue placeholder="Select order status">
                                                                                                        {statusForm.status && (
                                                                                                                <Badge
                                                                                                                        className={getStatusColor(
                                                                                                                                statusForm.status
                                                                                                                        )}
                                                                                                                >
                                                                                                                        {formatStatusLabel(statusForm.status)}
                                                                                                                </Badge>
                                                                                                        )}
                                                                                                </SelectValue>
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                                {statusOptions.map((statusOption) => (
                                                                                                        <SelectItem
                                                                                                                key={statusOption}
                                                                                                                value={statusOption}
                                                                                                        >
                                                                                                                {formatStatusLabel(statusOption)}
                                                                                                        </SelectItem>
                                                                                                ))}
                                                                                        </SelectContent>
                                                                                </Select>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                                <p className="text-sm font-medium text-gray-600">
                                                                                        Payment Status
                                                                                </p>
                                                                                <Select
                                                                                        value={statusForm.paymentStatus}
                                                                                        onValueChange={(value) =>
                                                                                                handleStatusChange("paymentStatus", value)
                                                                                        }
                                                                                >
                                                                                        <SelectTrigger>
                                                                                                <SelectValue placeholder="Select payment status">
                                                                                                        {statusForm.paymentStatus && (
                                                                                                                <Badge
                                                                                                                        className={getPaymentStatusColor(
                                                                                                                                statusForm.paymentStatus
                                                                                                                        )}
                                                                                                                >
                                                                                                                        {formatStatusLabel(statusForm.paymentStatus)}
                                                                                                                </Badge>
                                                                                                        )}
                                                                                                </SelectValue>
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                                {paymentStatusOptions.map((statusOption) => (
                                                                                                        <SelectItem
                                                                                                                key={statusOption}
                                                                                                                value={statusOption}
                                                                                                        >
                                                                                                                {formatStatusLabel(statusOption)}
                                                                                                        </SelectItem>
                                                                                                ))}
                                                                                        </SelectContent>
                                                                                </Select>
                                                                        </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                                        <p className="text-sm text-gray-500">
                                                                                {hasStatusChanges
                                                                                        ? "Save the changes to update this order's timeline."
                                                                                        : "No status changes yet."}
                                                                        </p>
                                                                        <Button
                                                                                onClick={handleSaveStatuses}
                                                                                disabled={!hasStatusChanges || saving}
                                                                        >
                                                                                {saving && (
                                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                )}
                                                                                {saving ? "Saving..." : "Update Status"}
                                                                        </Button>
                                                                </div>
                                                        </CardContent>
                                                </Card>

                                                {/* Order Status and Basic Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<Package className="w-8 h-8 text-blue-600" />
										<div>
											<p className="text-sm text-gray-600">Order Status</p>
											<Badge className={getStatusColor(order.status)}>
												{order.status.toUpperCase()}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<CreditCard className="w-8 h-8 text-green-600" />
										<div>
											<p className="text-sm text-gray-600">Payment Status</p>
											<Badge
												className={getPaymentStatusColor(order.paymentStatus)}
											>
												{order.paymentStatus.toUpperCase()}
											</Badge>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<Calendar className="w-8 h-8 text-purple-600" />
										<div>
											<p className="text-sm text-gray-600">Order Date</p>
											<p className="font-medium">
												{new Date(order.orderDate).toLocaleDateString()}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Customer Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<User className="w-5 h-5" />
									Customer Information
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600">Name</p>
										<p className="font-medium">{order.customerName}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Email</p>
										<div className="flex items-center gap-2">
											<Mail className="w-4 h-4 text-gray-400" />
											<p className="font-medium">{order.customerEmail}</p>
										</div>
									</div>
									<div>
										<p className="text-sm text-gray-600">Phone</p>
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4 text-gray-400" />
											<p className="font-medium">{order.customerMobile}</p>
										</div>
									</div>
									<div>
										<p className="text-sm text-gray-600">Customer ID</p>
										<p className="font-medium text-blue-600">{order.userId}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Delivery Address */}
						{order.deliveryAddress && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="w-5 h-5" />
										Delivery Address
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p>{order.deliveryAddress.street}</p>
										<p>
											{order.deliveryAddress.city},{" "}
											{order.deliveryAddress.state}
										</p>
										<p>
											{order.deliveryAddress.zipCode},{" "}
											{order.deliveryAddress.country}
										</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Products */}
						<Card>
                                                        <CardHeader>
                                                                <CardTitle className="flex items-center gap-2">
                                                                        <Package className="w-5 h-5" />
                                                                        Products ({normalizedProducts.length} items)
                                                                </CardTitle>
                                                        </CardHeader>
							<CardContent>
								<div className="space-y-4">
                                                                        {normalizedProducts.map((product, index) => (
										<div
											key={index}
											className="flex items-center gap-4 p-4 border rounded-lg"
										>
											{product.productImage && (
												<img
													src={product.productImage || "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"}
													alt={product.productName}
													className="w-16 h-16 object-cover rounded"
												/>
											)}
											<div className="flex-1">
												<h4 className="font-medium">{product.productName}</h4>
                                                                                                <p className="text-sm text-gray-600">
                                                                                                        Quantity: {product.quantity} × $
                                                                                                        {getSafeAmount(product.price).toFixed(2)}
                                                                                                </p>
											</div>
											<div className="text-right">
                                                                                                <p className="font-medium">
                                                                                                        ${getSafeAmount(product.totalPrice).toFixed(2)}
                                                                                                </p>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* Payment Information */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<CreditCard className="w-5 h-5" />
									Payment Information
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-gray-600">Payment Method</p>
										<p className="font-medium capitalize">
											{order.paymentMethod.replace("_", " ")}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Transaction ID</p>
										<p className="font-medium">
											{order.transactionId || "N/A"}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Order Summary */}
						<Card>
							<CardHeader>
								<CardTitle>Order Summary</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span>Subtotal</span>
										<span>${order.subtotal.toFixed(2)}</span>
									</div>
                                                                        {gstLines.map((line) => (
                                                                                <div className="flex justify-between" key={line.key}>
                                                                                        <span>{line.label}</span>
                                                                                        <span>${line.amount.toFixed(2)}</span>
                                                                                </div>
                                                                        ))}
                                                                        {order.shippingCost > 0 && (
                                                                                <div className="flex justify-between">
                                                                                        <span>Shipping</span>
                                                                                        <span>${order.shippingCost.toFixed(2)}</span>
                                                                                </div>
									)}
									{order.discount > 0 && (
										<div className="flex justify-between text-green-600">
											<span>Discount</span>
											<span>-${order.discount.toFixed(2)}</span>
										</div>
									)}
									{order.couponApplied && (
										<div className="flex justify-between text-blue-600">
											<span>Coupon ({order.couponApplied.couponCode})</span>
											<span>
												-${order.couponApplied.discountAmount.toFixed(2)}
											</span>
										</div>
									)}
                                                                        <Separator />
                                                                        <div className="flex justify-between text-lg font-bold">
                                                                                <span>Total Amount</span>
                                                                                <span>${order.totalAmount.toFixed(2)}</span>
                                                                        </div>
                                                                        {gstLines.length > 0 && (
                                                                                <p className="text-xs text-gray-500">
                                                                                        {gstMode === "cgst_sgst"
                                                                                                ? "CGST & SGST applied for Bengaluru deliveries"
                                                                                                : "IGST applied for this delivery"}
                                                                                </p>
                                                                        )}
                                                                </div>
                                                        </CardContent>
                                                </Card>

						{/* Tracking Information */}
						{order.trackingNumber && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Truck className="w-5 h-5" />
										Tracking Information
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-gray-600">Tracking Number</p>
											<p className="font-medium">{order.trackingNumber}</p>
										</div>
										{order.estimatedDelivery && (
											<div>
												<p className="text-sm text-gray-600">
													Estimated Delivery
												</p>
												<p className="font-medium">
													{new Date(
														order.estimatedDelivery
													).toLocaleDateString()}
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Notes */}
						{(order.orderNotes || order.adminNotes) && (
							<Card>
								<CardHeader>
									<CardTitle>Notes</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{order.orderNotes && (
											<div>
												<p className="text-sm text-gray-600 font-medium">
													Customer Notes
												</p>
												<p className="text-sm bg-gray-50 p-3 rounded">
													{order.orderNotes}
												</p>
											</div>
										)}
										{order.adminNotes && (
											<div>
												<p className="text-sm text-gray-600 font-medium">
													Admin Notes
												</p>
												<p className="text-sm bg-blue-50 p-3 rounded">
													{order.adminNotes}
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>
						)}
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
