"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const REASONS = [
        "Damaged or defective item",
        "Wrong item delivered",
        "Missing accessories or parts",
        "Item not as described",
        "Better price available",
        "Other",
];

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

export function ReturnRequestDialog({
        open,
        order,
        settings,
        loading,
        onOpenChange,
        onSubmit,
}) {
        const [selectedSubOrder, setSelectedSubOrder] = useState(null);
        const [reason, setReason] = useState(REASONS[0]);
        const [description, setDescription] = useState("");

        const subOrders = useMemo(() => order?.subOrders || [], [order]);

        useEffect(() => {
                if (!open) {
                        setSelectedSubOrder(null);
                        setReason(REASONS[0]);
                        setDescription("");
                        return;
                }

                if (subOrders.length > 0) {
                        const delivered = subOrders.find((sub) => sub.status === "delivered");
                        setSelectedSubOrder(delivered?._id?.toString() || subOrders[0]._id?.toString());
                }
        }, [open, subOrders]);

        const activeSubOrder = useMemo(() => {
                if (!selectedSubOrder) return null;
                return subOrders.find((sub) => sub._id?.toString() === selectedSubOrder) || null;
        }, [selectedSubOrder, subOrders]);

        const items = useMemo(() => {
                if (!activeSubOrder) return [];
                return (activeSubOrder.products || []).map((product) => ({
                        id: product.productId?._id?.toString() || product.productId?.toString(),
                        name:
                                product.productName ||
                                product.productId?.title ||
                                product.productId?.name ||
                                "Product",
                        image: product.productImage || product.productId?.images?.[0] || null,
                        quantity: product.quantity,
                        price: product.price,
                        totalPrice: product.totalPrice ?? product.price * product.quantity,
                }));
        }, [activeSubOrder]);

        const handleSubmit = (event) => {
                event.preventDefault();
                if (!selectedSubOrder) {
                        return;
                }
                onSubmit?.({
                        subOrderId: selectedSubOrder,
                        reason,
                        description,
                });
        };

        const windowDays = Number.isFinite(Number(settings?.windowDays))
                ? Number(settings.windowDays)
                : 7;

        return (
                <Dialog open={open} onOpenChange={onOpenChange}>
                        <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                        <DialogTitle>Request a return</DialogTitle>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                                <Label>Select items to return</Label>
                                                <Select
                                                        value={selectedSubOrder || ""}
                                                        onValueChange={setSelectedSubOrder}
                                                        disabled={subOrders.length === 0}
                                                >
                                                        <SelectTrigger>
                                                                <SelectValue placeholder="Select a shipment" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                                {subOrders.map((subOrder) => (
                                                                        <SelectItem
                                                                                key={subOrder._id}
                                                                                value={subOrder._id?.toString()}
                                                                        >
                                                                                {subOrder.sellerId?.businessName ||
                                                                                        subOrder.sellerId?.name ||
                                                                                        "Seller"}
                                                                                {" "}
                                                                                <span className="text-xs text-muted-foreground">
                                                                                        · {formatCurrency(subOrder.totalAmount)}
                                                                                </span>
                                                                        </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                </Select>
                                        </div>

                                        {items.length > 0 ? (
                                                <ScrollArea className="max-h-64 rounded-md border p-4">
                                                        <div className="space-y-4">
                                                                {items.map((item) => (
                                                                        <div
                                                                                key={item.id}
                                                                                className="flex items-center gap-4"
                                                                        >
                                                                                <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                                                                                        {item.image ? (
                                                                                                <Image
                                                                                                        src={item.image}
                                                                                                        alt={item.name}
                                                                                                        width={64}
                                                                                                        height={64}
                                                                                                        className="h-full w-full object-cover"
                                                                                                />
                                                                                        ) : (
                                                                                                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                                                                                                        No image
                                                                                                </div>
                                                                                        )}
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                        <div className="font-medium">{item.name}</div>
                                                                                        <div className="text-sm text-muted-foreground">
                                                                                                Qty: {item.quantity} · {formatCurrency(item.price)}
                                                                                        </div>
                                                                                </div>
                                                                                <Badge variant="secondary">{formatCurrency(item.totalPrice)}</Badge>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                </ScrollArea>
                                        ) : (
                                                <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                                                        No items available for return in this shipment.
                                                </div>
                                        )}

                                        <div className="space-y-2">
                                                <Label htmlFor="return-reason">Return reason</Label>
                                                <Select value={reason} onValueChange={setReason}>
                                                        <SelectTrigger id="return-reason">
                                                                <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                                {REASONS.map((value) => (
                                                                        <SelectItem key={value} value={value}>
                                                                                {value}
                                                                        </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                </Select>
                                        </div>

                                        <div className="space-y-2">
                                                <Label htmlFor="return-description">Additional details (optional)</Label>
                                                <Textarea
                                                        id="return-description"
                                                        placeholder="Share any information that can help us process your return"
                                                        value={description}
                                                        onChange={(event) => setDescription(event.target.value)}
                                                        rows={4}
                                                />
                                        </div>

                                        <div className="rounded-md bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                                                Returns are accepted within {windowDays} day{windowDays === 1 ? "" : "s"} of
                                                delivery. Our team will review your request and keep you updated via email.
                                        </div>

                                        <div className="flex justify-end gap-3">
                                                <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => onOpenChange?.(false)}
                                                >
                                                        Cancel
                                                </Button>
                                                <Button
                                                        type="submit"
                                                        disabled={loading || !selectedSubOrder || items.length === 0}
                                                >
                                                        {loading ? "Submitting..." : "Submit return request"}
                                                </Button>
                                        </div>
                                </form>
                        </DialogContent>
                </Dialog>
        );
}
