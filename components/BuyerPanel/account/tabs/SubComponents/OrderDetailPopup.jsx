"use client";

import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
        Package,
        User,
        MapPin,
        CreditCard,
        Calendar,
        Phone,
        Mail,
        Truck,
        BadgeCheck,
} from "lucide-react";
import Image from "next/image";
import { buildGstLineItems } from "@/lib/utils/gst.js";

export function OrderDetailPopup({ open, onOpenChange, order }) {
	if (!order) return null;
	// console.log("Order details:", order);

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
		return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
	};

	const getPaymentStatusColor = (status) => {
		const colors = {
			paid: "bg-green-100 text-green-800",
			pending: "bg-yellow-100 text-yellow-800",
			failed: "bg-red-100 text-red-800",
			refunded: "bg-gray-100 text-gray-800",
		};
		return colors[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
	};

	// Safe property access with fallbacks
	const orderNumber = order.orderNumber || order._id || "N/A";
	const status = order.status || "pending";
	const paymentStatus = order.paymentStatus || "pending";
	const orderDate = order?.orderDate ? order.orderDate : "N/A";
	const customerName = order.customerName || order.customer?.name || "N/A";
	const customerEmail = order.customerEmail || order.customer?.email || "N/A";
	const customerMobile =
		order.customerMobile ||
		order.customer?.mobile ||
		order.customer?.phone ||
		"N/A";
	// const userId = order.userId || order.customer?._id || 'N/A';
	const products = order?.subOrders?.flatMap((sub) => sub.products) || [];
	const paymentMethod = order.paymentMethod || "N/A";
	const transactionId = order.transactionId || null;
	const subtotal = order.subtotal || 0;
	const gstLines = buildGstLineItems(order.gst);
	const gstMode = order?.gst?.mode || "igst";
	const shippingCost = order.shippingCost || order.shipping || 0;
	const discount = order.discount || 0;
        const totalAmount = order.totalAmount || order.total || 0;

        const businessInvoiceInfo = (() => {
                if (!order?.billingInfo) {
                        return null;
                }

                const {
                        gstInvoiceRequested,
                        gstNumber,
                        gstVerifiedAt,
                        gstLegalName,
                        gstTradeName,
                        gstState,
                        gstAddress,
                } = order.billingInfo;

                if (!gstInvoiceRequested || !gstNumber || !gstVerifiedAt) {
                        return null;
                }

                const verifiedDate = new Date(gstVerifiedAt);

                if (Number.isNaN(verifiedDate.getTime())) {
                        return null;
                }

                return {
                        gstNumber,
                        gstLegalName,
                        gstTradeName,
                        gstState,
                        gstAddress,
                        gstVerifiedAt: verifiedDate,
                };
        })();

	function formatDate(date) {
		const d = new Date(date);
		return d
			.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
			.replace(/ /g, "-"); // converts "10 Sep 2025" → "10-Sep-2025"
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
                                        <DialogHeader>
                                                <div className="flex flex-wrap items-center gap-2">
                                                        <DialogTitle className="text-xl font-bold">
                                                                Order Details - {orderNumber}
                                                        </DialogTitle>
                                                        {businessInvoiceInfo && (
                                                                <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                                                                        Business Invoice
                                                                </Badge>
                                                        )}
                                                </div>
                                        </DialogHeader>

					<div className="space-y-6 mt-6">
						{/* Order Status and Basic Info */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center gap-3">
										<Package className="w-8 h-8 text-blue-600" />
										<div>
											<p className="text-sm text-gray-600">Order Status</p>
											<Badge className={getStatusColor(status)}>
												{status.toUpperCase()}
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
											<Badge className={getPaymentStatusColor(paymentStatus)}>
												{paymentStatus.toUpperCase()}
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
											<p className="font-medium">{formatDate(orderDate)}</p>
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
										<p className="font-medium">{customerName}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Email</p>
										<div className="flex items-center gap-2">
											<Mail className="w-4 h-4 text-gray-400" />
											<p className="font-medium">{customerEmail}</p>
										</div>
									</div>
									<div>
										<p className="text-sm text-gray-600">Phone</p>
										<div className="flex items-center gap-2">
											<Phone className="w-4 h-4 text-gray-400" />
											<p className="font-medium">{customerMobile}</p>
										</div>
									</div>
									{/* <div>
                                        <p className="text-sm text-gray-600">Customer ID</p>
                                        <p className="font-medium text-blue-600">{userId}</p>
                                    </div> */}
                                                                </div>
                                                        </CardContent>
                                                </Card>

                                                {businessInvoiceInfo && (
                                                        <Card>
                                                                <CardHeader>
                                                                        <CardTitle className="flex items-center gap-2">
                                                                                <BadgeCheck className="w-5 h-5 text-amber-500" />
                                                                                GST Invoice Details
                                                                        </CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                <div>
                                                                                        <p className="text-sm text-gray-600">GSTIN</p>
                                                                                        <p className="font-semibold text-gray-900">
                                                                                                {businessInvoiceInfo.gstNumber}
                                                                                        </p>
                                                                                </div>
                                                                                {businessInvoiceInfo.gstLegalName && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600">Registered Name</p>
                                                                                                <p className="font-medium text-gray-900">
                                                                                                        {businessInvoiceInfo.gstLegalName}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                {businessInvoiceInfo.gstTradeName && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600">Trade Name</p>
                                                                                                <p className="font-medium text-gray-900">
                                                                                                        {businessInvoiceInfo.gstTradeName}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                {businessInvoiceInfo.gstState && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600">State</p>
                                                                                                <p className="font-medium text-gray-900">
                                                                                                        {businessInvoiceInfo.gstState}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                <div>
                                                                                        <p className="text-sm text-gray-600">Verification</p>
                                                                                        <p className="text-sm text-gray-900">
                                                                                                Verified on {businessInvoiceInfo.gstVerifiedAt.toLocaleString()}
                                                                                        </p>
                                                                                </div>
                                                                        </div>
                                                                        {businessInvoiceInfo.gstAddress && (
                                                                                <div className="mt-4">
                                                                                        <p className="text-sm text-gray-600">GST Registered Address</p>
                                                                                        <p className="text-sm text-gray-900 whitespace-pre-line">
                                                                                                {businessInvoiceInfo.gstAddress}
                                                                                        </p>
                                                                                </div>
                                                                        )}
                                                                </CardContent>
                                                        </Card>
                                                )}

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
										<p>{order.deliveryAddress.street || "N/A"}</p>
										<p>
											{order.deliveryAddress.city || "N/A"},{" "}
											{order.deliveryAddress.state || "N/A"}
										</p>
										<p>
											{order.deliveryAddress.zipCode || "N/A"},{" "}
											{order.deliveryAddress.country || "N/A"}
										</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Shipping Address fallback */}
						{!order.deliveryAddress && order.shippingAddress && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="w-5 h-5" />
										Shipping Address
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p>
											{order.shippingAddress.street ||
												order.shippingAddress.address ||
												"N/A"}
										</p>
										<p>
											{order.shippingAddress.city || "N/A"},{" "}
											{order.shippingAddress.state || "N/A"}
										</p>
										<p>
											{order.shippingAddress.zipCode ||
												order.shippingAddress.postalCode ||
												"N/A"}
											, {order.shippingAddress.country || "N/A"}
										</p>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Products */}
						{products.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Package className="w-5 h-5" />
										Products ({products.length} items)
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{products.map((product, index) => (
											<div
												key={index}
												className="flex items-center gap-4 p-4 border rounded-lg"
											>
												<Image
													src={
														product?.productImage ||
														product?.image ||
														"https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"
													}
													alt={product.productName || product.name || "Product"}
													width={150}
													height={250}
													className="w-16 h-16 object-cover rounded"
												/>
												<div className="flex-1">
													<h4 className="font-medium">
														{product.productName || product.name || "N/A"}
													</h4>
													<p className="text-sm text-gray-600">
														Quantity: {product.quantity || 1} × ₹
														{(product.price || 0).toFixed(2)}
													</p>
												</div>
												<div className="text-right">
													<p className="font-medium">
														₹
														{(
															product.totalPrice ||
															product.price * product.quantity ||
															0
														).toFixed(2)}
													</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						)}

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
											{paymentMethod.replace("_", " ")}
										</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Transaction ID</p>
										<p className="font-medium">{transactionId || "N/A"}</p>
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
										<span>₹{subtotal.toFixed(2)}</span>
									</div>
                                                                        {shippingCost > 0 && (
                                                                                <div className="flex justify-between">
                                                                                        <span>Shipping</span>
                                                                                        <span>₹{shippingCost.toFixed(2)}</span>
                                                                                </div>
                                                                        )}
                                                                        {gstLines.map((line) => (
                                                                                <div className="flex justify-between" key={line.key}>
                                                                                        <span>{line.label}</span>
                                                                                        <span>₹{line.amount.toFixed(2)}</span>
                                                                                </div>
                                                                        ))}
									{discount > 0 && (
										<div className="flex justify-between text-green-600">
											<span>Discount</span>
											<span>-₹{discount.toFixed(2)}</span>
										</div>
									)}
									{order.couponApplied && (
										<div className="flex justify-between text-blue-600">
											<span>Coupon ({order.couponApplied.couponCode})</span>
											<span>
												-₹{order.couponApplied.discountAmount.toFixed(2)}
											</span>
										</div>
									)}
									<Separator />
									<div className="flex justify-between text-lg font-bold">
										<span>Total Amount</span>
										<span>₹{totalAmount.toFixed(2)}</span>
									</div>
                                                                        {gstLines.length > 0 && (
                                                                                <p className="text-xs text-gray-500">
                                                                                        {gstMode === "cgst_sgst"
                                                                                                ? "CGST & SGST applied for Karnataka deliveries"
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
