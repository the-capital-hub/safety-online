"use client";

import {
        Dialog,
        DialogContent,
        DialogHeader,
        DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const STATUS_VARIANTS = {
        pending: "bg-amber-100 text-amber-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        processing: "bg-blue-100 text-blue-800",
        completed: "bg-gray-100 text-gray-800",
};

const formatDateTime = (date) => {
        if (!date) return "—";
        try {
                return new Date(date).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                });
        } catch (error) {
                return "—";
        }
};

const formatCurrency = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
                return "₹0.00";
        }
        return new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
        }).format(numeric);
};

export function ReturnDetailsDialog({ open, onOpenChange, request }) {
        if (!request) {
                return (
                        <Dialog open={open} onOpenChange={onOpenChange}>
                                <DialogContent>
                                        <DialogHeader>
                                                <DialogTitle>Return details</DialogTitle>
                                        </DialogHeader>
                                        <p className="text-sm text-muted-foreground">
                                                Select a return request to view full details.
                                        </p>
                                </DialogContent>
                        </Dialog>
                );
        }

        const products = Array.isArray(request.items)
                ? request.items
                : request.subOrderId?.products || [];

        const customer = request.orderId || {};

        return (
                <Dialog open={open} onOpenChange={onOpenChange}>
                        <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                        <DialogTitle className="flex items-center justify-between">
                                                <span>Return request #{request._id}</span>
                                                <Badge className={STATUS_VARIANTS[request.status] || "bg-gray-100 text-gray-800"}>
                                                        {request.status?.toUpperCase()}
                                                </Badge>
                                        </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4">
                                        <div className="grid gap-3 md:grid-cols-3">
                                                <div>
                                                        <p className="text-xs text-muted-foreground">Order number</p>
                                                        <p className="font-medium">{request.orderId?.orderNumber || "—"}</p>
                                                </div>
                                                <div>
                                                        <p className="text-xs text-muted-foreground">Requested on</p>
                                                        <p className="font-medium">{formatDateTime(request.requestedAt || request.createdAt)}</p>
                                                </div>
                                                <div>
                                                        <p className="text-xs text-muted-foreground">Refund amount</p>
                                                        <p className="font-medium">{formatCurrency(request.refundAmount)}</p>
                                                </div>
                                        </div>

                                        <Separator />

                                        <div className="grid gap-3 md:grid-cols-2">
                                                <div>
                                                        <p className="text-xs text-muted-foreground">Customer</p>
                                                        <p className="font-medium">{customer.customerName || customer.customerEmail || "—"}</p>
                                                        <p className="text-sm text-muted-foreground">{customer.customerEmail || ""}</p>
                                                        <p className="text-sm text-muted-foreground">{customer.customerMobile || ""}</p>
                                                </div>
                                                <div>
                                                        <p className="text-xs text-muted-foreground">Seller</p>
                                                        <p className="font-medium">
                                                                {request.sellerId?.businessName || request.sellerId?.name || "—"}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                                {request.sellerId?.email || ""}
                                                        </p>
                                                </div>
                                        </div>

                                        <Separator />

                                        <div>
                                                <p className="text-xs text-muted-foreground">Reason</p>
                                                <p className="font-medium">{request.reason}</p>
                                                {request.description && (
                                                        <p className="mt-1 text-sm text-muted-foreground">{request.description}</p>
                                                )}
                                        </div>

                                        <Separator />

                                        <div>
                                                <p className="text-xs text-muted-foreground mb-2">Items</p>
                                                <ScrollArea className="max-h-60 rounded border">
                                                        <div className="divide-y">
                                                                {products.length === 0 ? (
                                                                        <div className="p-4 text-sm text-muted-foreground">
                                                                                No items recorded for this return.
                                                                        </div>
                                                                ) : (
                                                                        products.map((item, index) => (
                                                                                <div key={item._id || item.productId || index} className="flex items-center justify-between gap-3 p-4">
                                                                                        <div>
                                                                                                <p className="font-medium">
                                                                                                        {item.productName || item.productId?.title || "Product"}
                                                                                                </p>
                                                                                                <p className="text-xs text-muted-foreground">
                                                                                                        Qty: {item.quantity}
                                                                                                </p>
                                                                                        </div>
                                                                                        <div className="text-right text-sm">
                                                                                                <div>{formatCurrency(item.price)}</div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                        Total: {formatCurrency(item.totalPrice)}
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        ))
                                                                )}
                                                        </div>
                                                </ScrollArea>
                                        </div>

                                        <Separator />

                                        <div>
                                                <p className="text-xs text-muted-foreground mb-1">Timeline</p>
                                                <div className="space-y-2">
                                                        {(request.history || []).length === 0 ? (
                                                                <p className="text-sm text-muted-foreground">
                                                                        No status updates recorded yet.
                                                                </p>
                                                        ) : (
                                                                request.history.map((entry, index) => (
                                                                        <div key={`${entry.status}-${index}`} className="rounded-md border p-3">
                                                                                <div className="flex items-center justify-between">
                                                                                        <Badge className={STATUS_VARIANTS[entry.status] || "bg-gray-100 text-gray-800"}>
                                                                                                {entry.status?.toUpperCase()}
                                                                                        </Badge>
                                                                                        <span className="text-xs text-muted-foreground">
                                                                                                {formatDateTime(entry.changedAt)}
                                                                                        </span>
                                                                                </div>
                                                                                {entry.notes && (
                                                                                        <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                                                                                )}
                                                                        </div>
                                                                ))
                                                        )}
                                                </div>
                                        </div>

                                        {request.resolutionNotes && (
                                                <div>
                                                        <Separator className="my-3" />
                                                        <p className="text-xs text-muted-foreground">Resolution notes</p>
                                                        <p className="text-sm">{request.resolutionNotes}</p>
                                                </div>
                                        )}
                                </div>
                        </DialogContent>
                </Dialog>
        );
}
