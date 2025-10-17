"use client";

import { useEffect, useMemo, useState } from "react";
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
        Activity,
        Store,
        Loader2,
        BadgeCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAdminOrderStore } from "@/store/adminOrderStore.js";
import { buildGstLineItems } from "@/lib/utils/gst.js";
import {
        ORDER_STATUS_UPDATE_OPTIONS,
        getOrderDisplayStatus,
        getOrderStatusBadgeColor,
        getOrderStatusLabel,
} from "@/constants/orderStatus.js";

const normalizePaymentStatus = (value) =>
        typeof value === "string" && value.trim().length > 0
                ? value.trim().toLowerCase()
                : "";

export function OrderDetailsPopup({ open, onOpenChange, order, onOrderUpdated }) {
        const updateOrder = useAdminOrderStore((state) => state.updateOrder);
        const [detailedOrder, setDetailedOrder] = useState(order ?? null);
        const [fetchingDetails, setFetchingDetails] = useState(false);
        const resolvedOrder = detailedOrder ?? order ?? null;
        const [statusForm, setStatusForm] = useState({
                status: resolvedOrder?.status || "",
                paymentStatus: normalizePaymentStatus(resolvedOrder?.paymentStatus),
        });
        const [saving, setSaving] = useState(false);

        useEffect(() => {
                setDetailedOrder(order ?? null);
        }, [order]);

        useEffect(() => {
                if (!open || !order?._id) {
                        return undefined;
                }

                const controller = new AbortController();
                let isActive = true;

                const loadOrderDetails = async () => {
                        setFetchingDetails(true);

                        try {
                                const response = await fetch(`/api/admin/orders/${order._id}`, {
                                        signal: controller.signal,
                                });
                                const data = await response.json();

                                if (!isActive) return;

                                if (response.ok && data.success) {
                                        setDetailedOrder(data.order);
                                } else {
                                        toast.error(data.message || "Failed to load order details");
                                }
                        } catch (error) {
                                if (!isActive || error.name === "AbortError") {
                                        return;
                                }

                                console.error("Failed to fetch order details:", error);
                                toast.error("Failed to load order details");
                        } finally {
                                if (isActive) {
                                        setFetchingDetails(false);
                                }
                        }
                };

                loadOrderDetails();

                return () => {
                        isActive = false;
                        controller.abort();
                };
        }, [open, order?._id]);

        useEffect(() => {
                if (resolvedOrder) {
                        setStatusForm({
                                status: resolvedOrder.status || "",
                                paymentStatus: normalizePaymentStatus(resolvedOrder.paymentStatus),
                        });
                }
        }, [resolvedOrder?.status, resolvedOrder?.paymentStatus, resolvedOrder?._id]);

        const normalizedProducts = (() => {
                if (Array.isArray(resolvedOrder?.products)) {
                        return resolvedOrder.products;
                }

                if (Array.isArray(resolvedOrder?.subOrders)) {
                        return resolvedOrder.subOrders.flatMap((subOrder) => {
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

        const subOrders = Array.isArray(resolvedOrder?.subOrders)
                ? resolvedOrder.subOrders
                : [];

        const getSafeAmount = (value) => {
                const numericValue = Number.parseFloat(value);
                return Number.isFinite(numericValue) ? numericValue : 0;
        };

        const currencyFormatter = useMemo(
                () =>
                        new Intl.NumberFormat("en-IN", {
                                style: "currency",
                                currency: "INR",
                                minimumFractionDigits: 2,
                        }),
                []
        );

        const businessInvoiceInfo = useMemo(() => {
                if (!resolvedOrder?.billingInfo) {
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
                } = resolvedOrder.billingInfo;

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
        }, [resolvedOrder?.billingInfo]);

        if (!resolvedOrder) {
                return null;
        }

        const formatCurrency = (value) => currencyFormatter.format(getSafeAmount(value));

        const formatDate = (value) => {
                if (!value) {
                        return null;
                }

                const date = new Date(value);
                return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
        };

        const gstLines = buildGstLineItems(resolvedOrder.gst);
        const gstMode = resolvedOrder?.gst?.mode || "igst";
        const paymentMethodLabel = resolvedOrder?.paymentMethod
                ? resolvedOrder.paymentMethod.replace(/_/g, " ")
                : "N/A";
        const resolvedCustomer =
                typeof resolvedOrder.userId === "object" ? resolvedOrder.userId : null;
        const customerName =
                resolvedOrder.customerName ||
                [resolvedCustomer?.firstName, resolvedCustomer?.lastName].filter(Boolean).join(" ") ||
                "";
        const customerEmail =
                resolvedOrder.customerEmail || resolvedCustomer?.email || "";
        const customerMobile =
                resolvedOrder.customerMobile || resolvedCustomer?.mobile || "";
        const customerIdValue =
                typeof resolvedOrder.userId === "object"
                        ? resolvedOrder.userId?._id || resolvedOrder.userId?.id || ""
                        : resolvedOrder.userId;

        const normalizedPaymentStatus = normalizePaymentStatus(resolvedOrder?.paymentStatus);
        const paymentStatusLabel =
                normalizedPaymentStatus.length > 0
                        ? getOrderStatusLabel(normalizedPaymentStatus)
                        : "Unknown";

        const statusOptions = ORDER_STATUS_UPDATE_OPTIONS;

        const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

        const formatStatusLabel = (value) => getOrderStatusLabel(value);

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

        const hasHexalogUpdate =
                Boolean(resolvedOrder?.hexalogStatus) ||
                Boolean(resolvedOrder?.hexalogStatusUpdatedAt) ||
                Boolean(resolvedOrder?.hexalogNdrStatus);

        const hasStatusChanges =
                (resolvedOrder.status || "") !== statusForm.status ||
                normalizedPaymentStatus !== statusForm.paymentStatus;

        const handleStatusChange = (field, value) => {
                setStatusForm((prev) => ({
                        ...prev,
                        [field]: field === "paymentStatus" ? normalizePaymentStatus(value) : value,
                }));
        };

        const handleSaveStatuses = async () => {
                if (!resolvedOrder || !hasStatusChanges || saving) return;

                setSaving(true);
                const result = await updateOrder(resolvedOrder._id, {
                        status: statusForm.status,
                        paymentStatus: statusForm.paymentStatus,
                });
                setSaving(false);

                if (result.success) {
                        const updatedOrder = result.order || {
                                ...resolvedOrder,
                                status: statusForm.status,
                                paymentStatus: statusForm.paymentStatus,
                        };

                        toast.success(result.message || "Order status updated successfully");
                        setStatusForm({
                                status: updatedOrder.status || "",
                                paymentStatus: normalizePaymentStatus(updatedOrder.paymentStatus),
                        });
                        setDetailedOrder(updatedOrder);
                        onOrderUpdated?.(updatedOrder);
                } else {
                        toast.error(result.message || "Failed to update order status");
                }
        };

        const getStatusColor = (status) => getOrderStatusBadgeColor(status);

        const getPaymentStatusColor = (status) => {
                const colors = {
                        paid: "bg-green-100 text-green-800",
                        pending: "bg-yellow-100 text-yellow-800",
                        failed: "bg-red-100 text-red-800",
                        refunded: "bg-gray-100 text-gray-800",
                };
                const key = normalizePaymentStatus(status);
                return colors[key] || "bg-gray-100 text-gray-800";
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
                                                <div className="flex flex-wrap items-center gap-2">
                                                        <DialogTitle className="text-xl font-bold">
                                                                Order Details - {resolvedOrder.orderNumber}
                                                        </DialogTitle>
                                                        {businessInvoiceInfo && (
                                                                <Badge className="bg-amber-100 text-amber-800 border border-amber-200">
                                                                        Business Invoice
                                                                </Badge>
                                                        )}
                                                </div>
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
                                                                                <Badge className={getStatusColor(resolvedOrder.status)}>
                                                                                        {getOrderDisplayStatus(resolvedOrder)}
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
                                                                                                className={getPaymentStatusColor(
                                                                                                        normalizedPaymentStatus
                                                                                                )}
                                                                                        >
                                                                                                {paymentStatusLabel}
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
                                                                                                {new Date(resolvedOrder.orderDate).toLocaleDateString()}
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
                                                                                <p className="font-medium">{customerName || "N/A"}</p>
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-sm text-gray-600">Email</p>
                                                                                <div className="flex items-center gap-2">
                                                                                        <Mail className="w-4 h-4 text-gray-400" />
                                                                                        <p className="font-medium">{customerEmail || "N/A"}</p>
                                                                                </div>
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-sm text-gray-600">Phone</p>
                                                                                <div className="flex items-center gap-2">
                                                                                        <Phone className="w-4 h-4 text-gray-400" />
                                                                                        <p className="font-medium">{customerMobile || "N/A"}</p>
                                                                                </div>
                                                                        </div>
                                                                        <div>
                                                                                <p className="text-sm text-gray-600">Customer ID</p>
                                                                                <p className="font-medium text-blue-600">{customerIdValue || "N/A"}</p>
                                                                        </div>
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
                                                {resolvedOrder.deliveryAddress && (
                                                        <Card>
                                                                <CardHeader>
									<CardTitle className="flex items-center gap-2">
										<MapPin className="w-5 h-5" />
										Delivery Address
									</CardTitle>
								</CardHeader>
								<CardContent>
                                                                        <div className="space-y-2">
                                                                                <p>{resolvedOrder.deliveryAddress.street}</p>
                                                                                <p>
                                                                                        {resolvedOrder.deliveryAddress.city},{" "}
                                                                                        {resolvedOrder.deliveryAddress.state}
                                                                                </p>
                                                                                <p>
                                                                                        {resolvedOrder.deliveryAddress.zipCode},{" "}
                                                                                        {resolvedOrder.deliveryAddress.country}
                                                                                </p>
									</div>
								</CardContent>
							</Card>
						)}

                                                {/* Seller fulfilment overview */}
                                                {subOrders.length > 0 && (
                                                        <Card>
                                                                <CardHeader>
                                                                        <CardTitle className="flex items-center gap-2">
                                                                                <Store className="w-5 h-5" />
                                                                                Seller fulfilment ({subOrders.length})
                                                                        </CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                        <div className="space-y-4">
                                                                                {subOrders.map((subOrder, index) => {
                                                                                        const seller =
                                                                                                subOrder &&
                                                                                                typeof subOrder.sellerId === "object" &&
                                                                                                subOrder.sellerId !== null
                                                                                                        ? subOrder.sellerId
                                                                                                        : null;
                                                                                        const sellerName =
                                                                                                seller?.businessName ||
                                                                                                [seller?.firstName, seller?.lastName]
                                                                                                        .filter(Boolean)
                                                                                                        .join(" ") ||
                                                                                                "Unknown seller";
                                                                                        const sellerEmail = seller?.email || "";
                                                                                        const sellerPhone = seller?.mobile || "";
                                                                                        const subOrderStatus =
                                                                                                typeof subOrder?.status === "string" && subOrder.status
                                                                                                        ? subOrder.status
                                                                                                        : "pending";
                                                                                        const estimatedDelivery =
                                                                                                formatDate(subOrder?.estimatedDelivery || subOrder?.edd);
                                                                                        const actualDelivery = formatDate(subOrder?.actualDelivery);
                                                                                        const subOrderTotal =
                                                                                                subOrder?.totalAmount ??
                                                                                                subOrder?.taxableAmount ??
                                                                                                subOrder?.subtotal ??
                                                                                                0;
                                                                                        const paymentLabel =
                                                                                                subOrder?.paymentMethod ||
                                                                                                resolvedOrder.paymentMethod ||
                                                                                                "";
                                                                                        const normalizedPaymentLabel =
                                                                                                paymentLabel
                                                                                                        ? formatStatusLabel(String(paymentLabel))
                                                                                                        : null;
                                                                                        const products = Array.isArray(subOrder?.products)
                                                                                                ? subOrder.products
                                                                                                : [];
                                                                                        const shipmentPackage =
                                                                                                subOrder?.shipmentPackage &&
                                                                                                typeof subOrder.shipmentPackage === "object"
                                                                                                        ? subOrder.shipmentPackage
                                                                                                        : null;

                                                                                        return (
                                                                                                <div
                                                                                                        key={subOrder?._id || index}
                                                                                                        className="border rounded-lg p-4 space-y-4"
                                                                                                >
                                                                                                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                        <Badge variant="outline" className="uppercase tracking-wide text-xs">
                                                                                                                                Sub-order {index + 1}
                                                                                                                        </Badge>
                                                                                                                        {subOrder?._id && (
                                                                                                                                <span className="text-xs text-gray-500 break-all">
                                                                                                                                        #{subOrder._id}
                                                                                                                                </span>
                                                                                                                        )}
                                                                                                                </div>
                                                                                                                <Badge className={getStatusColor(subOrderStatus)}>
                                                                                                                        {formatStatusLabel(subOrderStatus)}
                                                                                                                </Badge>
                                                                                                        </div>

                                                                                                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                                                                                                                <div className="space-y-1">
                                                                                                                        <p className="text-xs uppercase text-gray-500">Seller</p>
                                                                                                                        <p className="font-medium text-gray-900">{sellerName}</p>
                                                                                                                </div>
                                                                                                                <div className="space-y-1">
                                                                                                                        <p className="text-xs uppercase text-gray-500">Seller contact</p>
                                                                                                                        <div className="flex items-center gap-2 text-gray-700">
                                                                                                                                <Mail className="w-4 h-4 text-gray-400" />
                                                                                                                                <span>{sellerEmail || "N/A"}</span>
                                                                                                                        </div>
                                                                                                                        <div className="flex items-center gap-2 text-gray-700">
                                                                                                                                <Phone className="w-4 h-4 text-gray-400" />
                                                                                                                                <span>{sellerPhone || "N/A"}</span>
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                                <div className="space-y-1">
                                                                                                                        <p className="text-xs uppercase text-gray-500">Fulfilment</p>
                                                                                                                        {estimatedDelivery && (
                                                                                                                                <p className="text-gray-700">EDD: {estimatedDelivery}</p>
                                                                                                                        )}
                                                                                                                        {actualDelivery && (
                                                                                                                                <p className="text-gray-700">Delivered: {actualDelivery}</p>
                                                                                                                        )}
                                                                                                                        {!estimatedDelivery && !actualDelivery && (
                                                                                                                                <p className="text-gray-500">No delivery timeline yet</p>
                                                                                                                        )}
                                                                                                                </div>
                                                                                                                <div className="space-y-1">
                                                                                                                        <p className="text-xs uppercase text-gray-500">Payment &amp; totals</p>
                                                                                                                        <p className="text-gray-700">
                                                                                                                                {normalizedPaymentLabel || "N/A"}
                                                                                                                        </p>
                                                                                                                        <p className="text-base font-semibold text-gray-900">
                                                                                                                                {formatCurrency(subOrderTotal)}
                                                                                                                        </p>
                                                                                                                </div>
                                                                                                        </div>

                                                                                                        {products.length > 0 && (
                                                                                                                <div className="space-y-2">
                                                                                                                        <p className="text-xs uppercase text-gray-500">Items in this sub-order</p>
                                                                                                                        <div className="space-y-3">
                                                                                                                                {products.map((product, productIndex) => {
                                                                                                                                        const productName =
                                                                                                                                                product?.productName ||
                                                                                                                                                product?.productId?.name ||
                                                                                                                                                product?.productId?.title ||
                                                                                                                                                "Unknown product";
                                                                                                                                        const quantity = product?.quantity || 0;
                                                                                                                                        const productTotal =
                                                                                                                                                product?.totalPrice ??
                                                                                                                                                getSafeAmount(product?.price) * quantity;

                                                                                                                                        return (
                                                                                                                                                <div
                                                                                                                                                        key={product?.productId?._id || productIndex}
                                                                                                                                                        className="flex flex-col gap-1 text-sm md:flex-row md:items-center md:justify-between"
                                                                                                                                                >
                                                                                                                                                        <div>
                                                                                                                                                                <p className="font-medium text-gray-900">{productName}</p>
                                                                                                                                                                <p className="text-xs text-gray-500">Qty: {quantity}</p>
                                                                                                                                                        </div>
                                                                                                                                                        <p className="font-medium text-gray-900">
                                                                                                                                                                {formatCurrency(productTotal)}
                                                                                                                                                        </p>
                                                                                                                                                </div>
                                                                                                                                        );
                                                                                                                                })}
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        )}

                                                                                                        {shipmentPackage && (
                                                                                                                <div className="space-y-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-4">
                                                                                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                                                                                                <p className="text-xs uppercase text-gray-500">Hexalog shipping</p>
                                                                                                                                {shipmentPackage.status && (
                                                                                                                                        <Badge className={getStatusColor(shipmentPackage.status)}>
                                                                                                                                                {formatStatusLabel(shipmentPackage.status)}
                                                                                                                                        </Badge>
                                                                                                                                )}
                                                                                                                        </div>
                                                                                                                        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                                                                                                                                {shipmentPackage.trackingId && (
                                                                                                                                        <div>
                                                                                                                                                <p className="text-xs uppercase text-gray-500">Tracking ID</p>
                                                                                                                                                <p className="font-medium text-gray-900">{shipmentPackage.trackingId}</p>
                                                                                                                                        </div>
                                                                                                                                )}
                                                                                                                                {shipmentPackage.courierPartner && (
                                                                                                                                        <div>
                                                                                                                                                <p className="text-xs uppercase text-gray-500">Courier partner</p>
                                                                                                                                                <p className="font-medium text-gray-900">{shipmentPackage.courierPartner}</p>
                                                                                                                                        </div>
                                                                                                                                )}
                                                                                                                                {shipmentPackage.currentLocation && (
                                                                                                                                        <div className="md:col-span-2">
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
                                                                                                                                        <p className="text-sm text-gray-700">{shipmentPackage.deliveryNotes}</p>
                                                                                                                                </div>
                                                                                                                        )}
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>
                                                                                        );
                                                                                })}
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
                                                                        {fetchingDetails && normalizedProducts.length === 0 && (
                                                                                <div className="flex justify-center py-6">
                                                                                        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                                                                </div>
                                                                        )}
                                                                        {!fetchingDetails && normalizedProducts.length === 0 && (
                                                                                <p className="text-sm text-gray-500 text-center">
                                                                                        No products found for this order.
                                                                                </p>
                                                                        )}
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
                                                                                                        Quantity: {product.quantity} × {formatCurrency(
                                                                                                                product.price
                                                                                                        )}
                                                                                                </p>
											</div>
											<div className="text-right">
                                                                                                <p className="font-medium">
                                                                                                        {formatCurrency(product.totalPrice)}
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
                                                                                <p className="font-medium capitalize">{paymentMethodLabel}</p>
									</div>
									<div>
										<p className="text-sm text-gray-600">Transaction ID</p>
                                                                                <p className="font-medium">
                                                                                        {resolvedOrder.transactionId || "N/A"}
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
                                                                                <span>{formatCurrency(resolvedOrder.subtotal)}</span>
                                                                        </div>
                                                                        {gstLines.map((line) => (
                                                                                <div className="flex justify-between" key={line.key}>
                                                                                        <span>{line.label}</span>
                                                                                        <span>{formatCurrency(line.amount)}</span>
                                                                                </div>
                                                                        ))}
                                                                        {resolvedOrder.shippingCost > 0 && (
                                                                                <div className="flex justify-between">
                                                                                        <span>Shipping</span>
                                                                                        <span>{formatCurrency(resolvedOrder.shippingCost)}</span>
                                                                                </div>
                                                                        )}
                                                                        {resolvedOrder.discount > 0 && (
                                                                                <div className="flex justify-between text-green-600">
                                                                                        <span>Discount</span>
                                                                                        <span>{formatCurrency(-Math.abs(resolvedOrder.discount))}</span>
                                                                                </div>
                                                                        )}
                                                                        {resolvedOrder.couponApplied && (
                                                                                <div className="flex justify-between text-blue-600">
                                                                                        <span>
                                                                                                Coupon (
                                                                                                {
                                                                                                        typeof resolvedOrder.couponApplied === "object"
                                                                                                                ? resolvedOrder.couponApplied?.couponCode ||
                                                                                                                  resolvedOrder.couponApplied?.code ||
                                                                                                                  resolvedOrder.couponApplied?.couponId?.code ||
                                                                                                                  "Applied"
                                                                                                                : resolvedOrder.couponApplied
                                                                                                }
                                                                                                )
                                                                                        </span>
                                                                                        {(() => {
                                                                                                if (typeof resolvedOrder.couponApplied === "object") {
                                                                                                        const amount =
                                                                                                                resolvedOrder.couponApplied?.discountAmount ??
                                                                                                                resolvedOrder.couponApplied?.discountValue ??
                                                                                                                resolvedOrder.couponApplied?.amount ??
                                                                                                                0;

                                                                                                        if (amount) {
                                                                                                                return <span>{formatCurrency(-Math.abs(amount))}</span>;
                                                                                                        }
                                                                                                }

                                                                                                return null;
                                                                                        })()}
                                                                                </div>
                                                                        )}
                                                                        <Separator />
                                                                        <div className="flex justify-between text-lg font-bold">
                                                                                <span>Total Amount</span>
                                                                                <span>{formatCurrency(resolvedOrder.totalAmount)}</span>
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

                                                {hasHexalogUpdate && (
                                                        <Card>
                                                                <CardHeader>
                                                                        <CardTitle className="flex items-center gap-2">
                                                                                <Activity className="w-5 h-5" />
                                                                                Latest Hexalog Update
                                                                        </CardTitle>
                                                                </CardHeader>
                                                                <CardContent>
                                                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                                {resolvedOrder.hexalogStatus && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600">
                                                                                                        Status
                                                                                                </p>
                                                                                                <p className="font-medium">
                                                                                                        {formatHexalogStatus(
                                                                                                                resolvedOrder.hexalogStatus
                                                                                                        )}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                {resolvedOrder.hexalogStatusUpdatedAt && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600">
                                                                                                        Updated At
                                                                                                </p>
                                                                                                <p className="font-medium">
                                                                                                        {formatDateTime(
                                                                                                                resolvedOrder.hexalogStatusUpdatedAt
                                                                                                        )}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                {resolvedOrder.hexalogNdrStatus && (
                                                                                        <div className="md:col-span-2">
                                                                                                <p className="text-sm text-gray-600">
                                                                                                        NDR Status
                                                                                                </p>
                                                                                                <p className="font-medium">
                                                                                                        {resolvedOrder.hexalogNdrStatus}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                </CardContent>
                                                        </Card>
                                                )}

                                                {/* Tracking Information */}
                                                {resolvedOrder.trackingNumber && (
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
                                                                                        <p className="font-medium">{resolvedOrder.trackingNumber}</p>
                                                                                </div>
                                                                                {resolvedOrder.estimatedDelivery && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600">
                                                                                                        Estimated Delivery
                                                                                                </p>
                                                                                                <p className="font-medium">
                                                                                                        {new Date(
                                                                                                                resolvedOrder.estimatedDelivery
                                                                                                        ).toLocaleDateString()}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                </CardContent>
                                                        </Card>
                                                )}

                                                {/* Notes */}
                                                {(resolvedOrder.orderNotes || resolvedOrder.adminNotes) && (
                                                        <Card>
                                                                <CardHeader>
                                                                        <CardTitle>Notes</CardTitle>
								</CardHeader>
								<CardContent>
                                                                        <div className="space-y-4">
                                                                                {resolvedOrder.orderNotes && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600 font-medium">
                                                                                                        Customer Notes
                                                                                                </p>
                                                                                                <p className="text-sm bg-gray-50 p-3 rounded">
                                                                                                        {resolvedOrder.orderNotes}
                                                                                                </p>
                                                                                        </div>
                                                                                )}
                                                                                {resolvedOrder.adminNotes && (
                                                                                        <div>
                                                                                                <p className="text-sm text-gray-600 font-medium">
                                                                                                        Admin Notes
                                                                                                </p>
                                                                                                <p className="text-sm bg-blue-50 p-3 rounded">
                                                                                                        {resolvedOrder.adminNotes}
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
