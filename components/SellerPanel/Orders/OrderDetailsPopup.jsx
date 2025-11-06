"use client";

import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
        Activity,
        MapPin,
        Mail,
        Phone,
        Package,
        Truck,
        User,
} from "lucide-react";
import {
        getOrderStatusBadgeColor,
        getOrderStatusLabel,
} from "@/constants/orderStatus.js";

const getSafeNumber = (value) => {
        const numericValue = Number.parseFloat(value);
        return Number.isFinite(numericValue) ? numericValue : 0;
};

const formatCurrencyValue = (value) =>
        new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                minimumFractionDigits: 2,
        }).format(getSafeNumber(value));

const formatDate = (value) => {
        if (!value) {
                return null;
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
};

const formatDateTime = (value) => {
        if (!value) {
                return null;
        }

        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
};

const formatHexalogStatus = (status) => {
        if (typeof status !== "string" || status.length === 0) {
                return "N/A";
        }

        const normalized = status.trim().toLowerCase().replace(/\s+/g, "_");
        const label = getOrderStatusLabel(normalized);

        if (label && typeof label === "string" && label.length > 0) {
                return label;
        }

        return status
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatPaymentMethod = (method) => {
        if (!method) {
                return "N/A";
        }

        const normalized = String(method).toLowerCase();
        if (normalized === "cod") {
                return "Cash on Delivery";
        }

        return normalized
                .replace(/_/g, " ")
                .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function SellerOrderDetailsPopup({ open, onOpenChange, order }) {
        const resolvedOrder = order || null;
        const orderInfo =
                resolvedOrder && typeof resolvedOrder.orderId === "object"
                        ? resolvedOrder.orderId
                        : {};

        const shipmentPackage =
                resolvedOrder && resolvedOrder.shipmentPackage && typeof resolvedOrder.shipmentPackage === "object"
                        ? resolvedOrder.shipmentPackage
                        : null;

        const products = Array.isArray(resolvedOrder?.products) ? resolvedOrder.products : [];

        const customerName =
                orderInfo.customerName ||
                [orderInfo.customerFirstName, orderInfo.customerLastName].filter(Boolean).join(" ");
        const customerEmail = orderInfo.customerEmail || "";
        const customerPhone = orderInfo.customerMobile || "";

        const deliveryAddress = orderInfo.deliveryAddress || null;
        const orderNumber = orderInfo.orderNumber || resolvedOrder?._id || "";
        const orderDate = formatDate(orderInfo.orderDate);
        const paymentMethod = formatPaymentMethod(orderInfo.paymentMethod || resolvedOrder?.paymentMethod);

        const statusBadgeColor = getOrderStatusBadgeColor(resolvedOrder?.status);
        const statusLabel = getOrderStatusLabel(resolvedOrder?.status) || "Unknown";

        const latestHexalogStatus =
                resolvedOrder?.hexalogStatus ??
                orderInfo?.hexalogStatus ??
                shipmentPackage?.status ??
                null;
        const latestHexalogUpdate =
                resolvedOrder?.hexalogStatusUpdatedAt ??
                orderInfo?.hexalogStatusUpdatedAt ??
                null;
        const latestNdrStatus =
                resolvedOrder?.hexalogNdrStatus ??
                orderInfo?.hexalogNdrStatus ??
                null;

        const hasHexalogUpdate = Boolean(latestHexalogStatus || latestHexalogUpdate || latestNdrStatus);

        return (
                <Dialog open={open} onOpenChange={onOpenChange}>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                        <DialogTitle className="flex items-center justify-between gap-4 text-lg font-semibold">
                                                <span>Order Details - {orderNumber}</span>
                                                {resolvedOrder?.status && (
                                                        <Badge className={statusBadgeColor}>{statusLabel}</Badge>
                                                )}
                                        </DialogTitle>
                                </DialogHeader>

                                {resolvedOrder ? (
                                        <div className="space-y-6">
                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle className="flex items-center gap-2 text-base">
                                                                        <User className="h-5 w-5" />
                                                                        Buyer &amp; payment summary
                                                                </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4 text-sm">
                                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                        <div className="space-y-1">
                                                                                <p className="text-xs uppercase text-gray-500">Buyer</p>
                                                                                <p className="font-medium text-gray-900">{customerName || "Unknown"}</p>
                                                                                <div className="flex items-center gap-2 text-gray-700">
                                                                                        <Mail className="h-4 w-4 text-gray-400" />
                                                                                        <span>{customerEmail || "N/A"}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-2 text-gray-700">
                                                                                        <Phone className="h-4 w-4 text-gray-400" />
                                                                                        <span>{customerPhone || "N/A"}</span>
                                                                                </div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                                <p className="text-xs uppercase text-gray-500">Order information</p>
                                                                                <p className="text-gray-700">Date: {orderDate || "N/A"}</p>
                                                                                <p className="text-gray-700">Payment: {paymentMethod}</p>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>

                                                {deliveryAddress && (
                                                        <Card>
                                                                <CardHeader>
                                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                                                <MapPin className="h-5 w-5" />
                                                                                Delivery address
                                                                        </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="space-y-1 text-sm text-gray-700">
                                                                        <p>{deliveryAddress.street}</p>
                                                                        <p>
                                                                                {deliveryAddress.city}, {deliveryAddress.state}
                                                                        </p>
                                                                        <p>
                                                                                {deliveryAddress.zipCode}, {deliveryAddress.country}
                                                                        </p>
                                                                </CardContent>
                                                        </Card>
                                                )}

                                                {hasHexalogUpdate && (
                                                        <Card>
                                                                <CardHeader>
                                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                                                <Activity className="h-5 w-5" />
                                                                                Latest Hexalog update
                                                                        </CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                                                                {latestHexalogStatus && (
                                                                                        <div>
                                                                                                <p className="text-xs uppercase text-gray-500">Status</p>
                                                                                                <p className="font-medium text-gray-900">
                                                                                                        {formatHexalogStatus(latestHexalogStatus)}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                {latestHexalogUpdate && (
                                                                                        <div>
                                                                                                <p className="text-xs uppercase text-gray-500">Updated at</p>
                                                                                                <p className="font-medium text-gray-900">{formatDateTime(latestHexalogUpdate)}</p>
                                                                                        </div>
                                                                                )}
                                                                                {latestNdrStatus && (
                                                                                        <div className="md:col-span-2">
                                                                                                <p className="text-xs uppercase text-gray-500">NDR status</p>
                                                                                                <p className="font-medium text-gray-900">{latestNdrStatus}</p>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                </CardContent>
                                                        </Card>
                                                )}

                                                {shipmentPackage && (
                                                        <Card>
                                                                <CardHeader>
                                                                        <CardTitle className="flex items-center gap-2 text-base">
                                                                                <Truck className="h-5 w-5" />
                                                                                Shipment package
                                                                        </CardTitle>
                                                                </CardHeader>
                                                                <CardContent className="space-y-4 text-sm">
                                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                <div className="space-y-1">
                                                                                        <p className="text-xs uppercase text-gray-500">Tracking ID</p>
                                                                                        <p className="font-medium text-gray-900">
                                                                                                {shipmentPackage.trackingId || "Not assigned"}
                                                                                        </p>
                                                                                </div>
                                                                                {shipmentPackage.status && (
                                                                                        <Badge className={getOrderStatusBadgeColor(shipmentPackage.status)}>
                                                                                                {formatHexalogStatus(shipmentPackage.status)}
                                                                                        </Badge>
                                                                                )}
                                                                        </div>
                                                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                                                                {shipmentPackage.courierPartner && (
                                                                                        <div>
                                                                                                <p className="text-xs uppercase text-gray-500">Courier partner</p>
                                                                                                <p className="font-medium text-gray-900">
                                                                                                        {shipmentPackage.courierPartner}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                {shipmentPackage.currentLocation && (
                                                                                        <div>
                                                                                                <p className="text-xs uppercase text-gray-500">Current location</p>
                                                                                                <p className="text-gray-700">{shipmentPackage.currentLocation}</p>
                                                                                        </div>
                                                                                )}
                                                                                {Number.isFinite(shipmentPackage.deliveryAttempts) && shipmentPackage.deliveryAttempts > 0 && (
                                                                                        <div>
                                                                                                <p className="text-xs uppercase text-gray-500">Delivery attempts</p>
                                                                                                <p className="text-gray-700">{shipmentPackage.deliveryAttempts}</p>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                        {shipmentPackage.deliveryNotes && (
                                                                                <div>
                                                                                        <p className="text-xs uppercase text-gray-500">Latest update</p>
                                                                                        <p className="text-gray-700">{shipmentPackage.deliveryNotes}</p>
                                                                                </div>
                                                                        )}
                                                                </CardContent>
                                                        </Card>
                                                )}

                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle className="flex items-center gap-2 text-base">
                                                                        <Package className="h-5 w-5" />
                                                                        Items ({products.length})
                                                                </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4 text-sm">
                                                                {products.length === 0 && (
                                                                        <p className="text-gray-500">No items found for this order.</p>
                                                                )}
                                                                {products.map((product, index) => {
                                                                        const productName =
                                                                                product?.productName ||
                                                                                product?.productId?.name ||
                                                                                product?.productId?.title ||
                                                                                "Unknown product";
                                                                        const quantity = getSafeNumber(product?.quantity || 0);
                                                                        const totalPrice =
                                                                                product?.totalPrice ?? getSafeNumber(product?.price) * quantity;

                                                                        return (
                                                                                <div
                                                                                        key={product?.productId?._id || index}
                                                                                        className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 md:flex-row md:items-center md:justify-between"
                                                                                >
                                                                                        <div>
                                                                                                <p className="font-medium text-gray-900">{productName}</p>
                                                                                                <p className="text-xs text-gray-500">Qty: {quantity}</p>
                                                                                        </div>
                                                                                        <p className="font-medium text-gray-900">{formatCurrencyValue(totalPrice)}</p>
                                                                                </div>
                                                                        );
                                                                })}
                                                        </CardContent>
                                                </Card>

                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle className="text-base">Payout summary</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-3 text-sm">
                                                                <div className="flex items-center justify-between">
                                                                        <span>Subtotal</span>
                                                                        <span>{formatCurrencyValue(resolvedOrder?.subtotal)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                        <span>Shipping</span>
                                                                        <span>{formatCurrencyValue(resolvedOrder?.shippingCost)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                        <span>Tax</span>
                                                                        <span>{formatCurrencyValue(resolvedOrder?.tax)}</span>
                                                                </div>
                                                                {getSafeNumber(resolvedOrder?.discount) > 0 && (
                                                                        <div className="flex items-center justify-between text-green-600">
                                                                                <span>Discount</span>
                                                                                <span>-{formatCurrencyValue(resolvedOrder?.discount)}</span>
                                                                        </div>
                                                                )}
                                                                <Separator />
                                                                <div className="flex items-center justify-between text-base font-semibold">
                                                                        <span>Total</span>
                                                                        <span>{formatCurrencyValue(resolvedOrder?.totalAmount)}</span>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </div>
                                ) : (
                                        <div className="py-12 text-center text-sm text-gray-500">
                                                Unable to load order details.
                                        </div>
                                )}
                        </DialogContent>
                </Dialog>
        );
}

