"use client";

import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, Printer } from "lucide-react";
import { useAdminOrderStore } from "@/store/adminOrderStore.js";
import { toast } from "react-hot-toast";
import { buildGstLineItems } from "@/lib/utils/gst.js";
import { getOrderDisplayStatus, getOrderStatusBadgeColor } from "@/constants/orderStatus.js";

export function InvoicePopup({ open, onOpenChange, order }) {
	const { downloadInvoice } = useAdminOrderStore();

        if (!order) return null;

        const gstLines = buildGstLineItems(order.gst);
        const gstMode = order?.gst?.mode || "igst";

        const handleDownload = async () => {
		const result = await downloadInvoice(order._id, order.orderNumber);
		if (result.success) {
			toast.success("Invoice downloaded successfully");
		} else {
			toast.error("Failed to download invoice. Please try again.");
		}
	};

	const handlePrint = () => {
		window.print();
	};

        const getStatusColor = (status) => getOrderStatusBadgeColor(status);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto hide-scrollbar">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
					className="space-y-6"
				>
					{/* Header */}
					<div className="flex justify-between items-start">
						<div>
							<h2 className="text-3xl font-bold text-orange-500">SAFETY</h2>
							<p className="text-sm text-gray-600">www.website.com</p>
							<p className="text-sm text-gray-600">hello@gmail.com</p>
							<p className="text-sm text-gray-600">+00 00000 00000</p>
						</div>
						<div className="text-right">
							<h3 className="text-2xl font-bold mb-2">INVOICE</h3>
							<p className="text-sm text-gray-600">Business address</p>
							<p className="text-sm text-gray-600">
								City, State, Pin - 000 000
							</p>
							<p className="text-sm text-gray-600">TAX ID 000000000000000</p>
						</div>
					</div>

					<Separator />

					{/* Invoice Details */}
					<div className="grid grid-cols-2 gap-8">
						<div>
							<h3 className="font-semibold mb-3">Bill To</h3>
							<div className="space-y-1">
								<p className="font-medium">{order.customerName}</p>
								<p className="text-sm text-gray-600">{order.customerEmail}</p>
								<p className="text-sm text-gray-600">{order.customerMobile}</p>
								{order.deliveryAddress && (
									<div className="text-sm text-gray-600">
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
								)}
							</div>
						</div>
						<div className="text-right space-y-4">
							<div>
								<p className="text-sm text-gray-600">Invoice Number</p>
								<p className="font-semibold">{order.orderNumber}</p>
							</div>
							<div>
								<p className="text-sm text-gray-600">Order Date</p>
								<p className="font-semibold">
									{new Date(order.orderDate).toLocaleDateString()}
								</p>
							</div>
                                                        <div>
                                                                <p className="text-sm text-gray-600">Status</p>
                                                                <Badge className={getStatusColor(order.status)}>
                                                                        {getOrderDisplayStatus(order)}
                                                                </Badge>
                                                        </div>
							<div className="text-right">
								<p className="text-3xl font-bold text-orange-500">
									${order.totalAmount.toFixed(2)}
								</p>
							</div>
						</div>
					</div>

					{/* Payment Information */}
					<div className="grid grid-cols-2 gap-8">
						<div>
							<p className="text-sm text-gray-600">Payment Method</p>
							<p className="font-semibold capitalize">
								{order.paymentMethod.replace("_", " ")}
							</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-gray-600">Payment Status</p>
							<p className="font-semibold capitalize">{order.paymentStatus}</p>
						</div>
					</div>

					<Separator />

					{/* Items Table */}
					<div>
						<div className="grid grid-cols-12 gap-4 py-3 border-b font-semibold text-sm bg-gray-50">
							<div className="col-span-6">PRODUCT</div>
							<div className="col-span-2 text-center">QTY</div>
							<div className="col-span-2 text-center">PRICE</div>
							<div className="col-span-2 text-right">TOTAL</div>
						</div>

						{order.products.map((product, index) => (
							<div
								key={index}
								className="grid grid-cols-12 gap-4 py-4 border-b"
							>
								<div className="col-span-6">
									<div className="flex items-center gap-3">
										{product.productImage && (
											<img
												src={product.productImage || "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png"}
												alt={product.productName}
												className="w-12 h-12 object-cover rounded"
											/>
										)}
										<div>
											<p className="font-medium">{product.productName}</p>
											<p className="text-sm text-gray-600">
												Product ID: {product.productId}
											</p>
										</div>
									</div>
								</div>
								<div className="col-span-2 text-center flex items-center justify-center">
									{product.quantity}
								</div>
								<div className="col-span-2 text-center flex items-center justify-center">
									${product.price.toFixed(2)}
								</div>
								<div className="col-span-2 text-right flex items-center justify-end">
									${product.totalPrice.toFixed(2)}
								</div>
							</div>
						))}
					</div>

					{/* Totals */}
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
								<span>-${order.couponApplied.discountAmount.toFixed(2)}</span>
							</div>
						)}
                                                <Separator />
                                                <div className="flex justify-between font-bold text-lg">
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

					<Separator />

					{/* Footer */}
					<div className="space-y-4">
						<p className="font-semibold">Thank you for your business!</p>
						<div>
							<p className="font-semibold">Terms & Conditions</p>
							<p className="text-sm text-gray-600">
								Please contact us for any queries regarding this order. For
								returns and refunds, please refer to our return policy.
							</p>
						</div>
						{order.orderNotes && (
							<div>
								<p className="font-semibold">Order Notes</p>
								<p className="text-sm text-gray-600">{order.orderNotes}</p>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button
							className="flex-1 bg-orange-500 hover:bg-orange-600"
							onClick={handleDownload}
						>
							<Download className="w-4 h-4 mr-2" />
							Download PDF
						</Button>
						<Button
							variant="outline"
							className="flex-1 bg-transparent"
							onClick={handlePrint}
						>
							<Printer className="w-4 h-4 mr-2" />
							Print Invoice
						</Button>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
