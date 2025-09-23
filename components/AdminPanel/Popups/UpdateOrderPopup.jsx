"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { useAdminOrderStore } from "@/store/adminOrderStore.js";
import { GST_RATE_PERCENT } from "@/lib/utils/gst.js";

export function UpdateOrderPopup({ open, onOpenChange, order, onUpdate }) {
        const { updateOrder, loading } = useAdminOrderStore();

        const [formData, setFormData] = useState({
                status: "",
                paymentStatus: "",
                trackingNumber: "",
                estimatedDelivery: "",
                adminNotes: "",
                shippingCost: "",
                tax: "",
        });

        const gstMode = order?.gst?.mode || "igst";
        const gstRate = order?.gst?.rate ?? GST_RATE_PERCENT;
        const gstLabel = gstMode === "cgst_sgst" ? "CGST + SGST (₹)" : "IGST (₹)";

	useEffect(() => {
		if (order) {
			setFormData({
				status: order.status || "",
				paymentStatus: order.paymentStatus || "",
				trackingNumber: order.trackingNumber || "",
				estimatedDelivery: order.estimatedDelivery
					? new Date(order.estimatedDelivery).toISOString().split("T")[0]
					: "",
				adminNotes: order.adminNotes || "",
                                shippingCost: order.shippingCost?.toString() || "",
                                tax:
                                        order.gst?.total !== undefined && order.gst?.total !== null
                                                ? order.gst.total.toString()
                                                : order.tax?.toString() || "",
                        });
                }
        }, [order]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!order) return;

                const roundToTwo = (value) => {
                        const numeric = Number.parseFloat(value);
                        return Number.isFinite(numeric) ? Math.round(numeric * 100) / 100 : 0;
                };

                const shippingCostValue = roundToTwo(formData.shippingCost);
                const gstTotalValue = roundToTwo(formData.tax);
                const discountValue = Number.isFinite(order?.discount)
                        ? order.discount
                        : Number.parseFloat(order?.discount) || 0;
                const taxableAmount = Math.max((order.subtotal || 0) - discountValue, 0);
                let cgst = 0;
                let sgst = 0;
                let igst = 0;

                if (gstMode === "cgst_sgst") {
                        const half = Math.round((gstTotalValue / 2) * 100) / 100;
                        cgst = half;
                        sgst = Math.round((gstTotalValue - half) * 100) / 100;
                } else {
                        igst = gstTotalValue;
                }

                const updateData = {
                        ...formData,
                        shippingCost: shippingCostValue,
                        tax: gstTotalValue,
                        totalAmount:
                                Math.round((taxableAmount + shippingCostValue + gstTotalValue) * 100) /
                                100,
                        gst: {
                                mode: gstMode,
                                rate: gstRate,
                                cgst,
                                sgst,
                                igst,
                                total: gstTotalValue,
                                taxableAmount,
                        },
                        estimatedDelivery: formData.estimatedDelivery
                                ? new Date(formData.estimatedDelivery)
                                : null,
                };

                const result = await updateOrder(order._id, updateData);

		if (result.success) {
			toast.success("Order updated successfully");
			onUpdate?.();
			onOpenChange(false);
		} else {
			toast.error("Error updating order");
		}
	};

	const handleInputChange = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	if (!order) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<DialogTitle className="text-lg font-semibold">
							Update Order - {order.orderNumber}
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Update order status, tracking, and other details
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="status">Order Status</Label>
								<Select
									value={formData.status}
									onValueChange={(value) => handleInputChange("status", value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="confirmed">Confirmed</SelectItem>
										<SelectItem value="processing">Processing</SelectItem>
										<SelectItem value="shipped">Shipped</SelectItem>
										<SelectItem value="delivered">Delivered</SelectItem>
										<SelectItem value="cancelled">Cancelled</SelectItem>
										<SelectItem value="returned">Returned</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="paymentStatus">Payment Status</Label>
								<Select
									value={formData.paymentStatus}
									onValueChange={(value) =>
										handleInputChange("paymentStatus", value)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select payment status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="paid">Paid</SelectItem>
										<SelectItem value="failed">Failed</SelectItem>
										<SelectItem value="refunded">Refunded</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						<div>
							<Label htmlFor="trackingNumber">Tracking Number</Label>
							<Input
								id="trackingNumber"
								value={formData.trackingNumber}
								onChange={(e) =>
									handleInputChange("trackingNumber", e.target.value)
								}
								placeholder="Enter tracking number"
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="estimatedDelivery">Estimated Delivery Date</Label>
							<Input
								id="estimatedDelivery"
								type="date"
								value={formData.estimatedDelivery}
								onChange={(e) =>
									handleInputChange("estimatedDelivery", e.target.value)
								}
								className="mt-1"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                                <Label htmlFor="shippingCost">Shipping Cost (₹)</Label>
								<Input
									id="shippingCost"
									type="number"
									step="0.01"
									value={formData.shippingCost}
									onChange={(e) =>
										handleInputChange("shippingCost", e.target.value)
									}
									placeholder="0.00"
									className="mt-1"
								/>
							</div>

                                                        <div>
                                                                <Label htmlFor="tax">{gstLabel}</Label>
								<Input
									id="tax"
									type="number"
									step="0.01"
									value={formData.tax}
									onChange={(e) => handleInputChange("tax", e.target.value)}
									placeholder="0.00"
									className="mt-1"
								/>
							</div>
						</div>

						<div>
							<Label htmlFor="adminNotes">Admin Notes</Label>
							<Textarea
								id="adminNotes"
								value={formData.adminNotes}
								onChange={(e) =>
									handleInputChange("adminNotes", e.target.value)
								}
								placeholder="Add internal notes about this order..."
								className="mt-1"
								rows={3}
							/>
						</div>

						<DialogFooter className="flex gap-3 mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={loading}
								className="flex-1 bg-orange-500 hover:bg-orange-600"
							>
								{loading ? "Updating..." : "Update Order"}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
