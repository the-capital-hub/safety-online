"use client";

import { useState, useMemo } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
        Select,
        SelectTrigger,
        SelectValue,
        SelectContent,
        SelectItem,
} from "@/components/ui/select";
import {
        Table,
        TableHeader,
        TableRow,
        TableHead,
        TableBody,
        TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2, Filter, CalendarRange, RefreshCw, FileArchive } from "lucide-react";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useAdminOrderStore } from "@/store/adminOrderStore.js";
import { createZipBlob } from "@/lib/createZip.js";
import { generateInvoicePDF } from "@/lib/invoicePDF.js";
import {
        ORDER_STATUS_OPTIONS,
        getOrderStatusLabel,
        getOrderStatusBadgeColor,
} from "@/constants/orderStatus.js";
import { cn } from "@/lib/utils";

const DEFAULT_FILTERS = {
        startDate: "",
        endDate: "",
        status: "all",
        limit: "50",
};

const LIMIT_OPTIONS = ["10", "25", "50", "100"];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
});

const formatDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
                return "—";
        }
        return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
        });
};

const formatCurrency = (value) => {
        const amount = Number(value);
        if (!Number.isFinite(amount)) {
                return currencyFormatter.format(0);
        }
        return currencyFormatter.format(amount);
};

const getZipFileName = (filters) => {
        if (filters.startDate && filters.endDate) {
                return `invoices-${filters.startDate}-to-${filters.endDate}.zip`;
        }
        if (filters.startDate) {
                return `invoices-from-${filters.startDate}.zip`;
        }
        if (filters.endDate) {
                return `invoices-until-${filters.endDate}.zip`;
        }
        return "invoices-selection.zip";
};

export function BulkInvoiceDownload() {
        const router = useRouter();
        const isAuthenticated = useIsAuthenticated();
        const { fetchOrderForInvoice } = useAdminOrderStore();

        const [filters, setFilters] = useState(DEFAULT_FILTERS);
        const [orders, setOrders] = useState([]);
        const [loading, setLoading] = useState(false);
        const [downloading, setDownloading] = useState(false);
        const [selectedOrderIds, setSelectedOrderIds] = useState([]);
        const [hasFetched, setHasFetched] = useState(false);
        const [lastUpdated, setLastUpdated] = useState(null);

        useEffect(() => {
                if (!isAuthenticated) {
                        const timeout = setTimeout(() => {
                                router.push("/admin/login");
                        }, 0);

                        return () => clearTimeout(timeout);
                }
                return undefined;
        }, [isAuthenticated, router]);

        const allSelected = useMemo(
                () => orders.length > 0 && selectedOrderIds.length === orders.length,
                [orders.length, selectedOrderIds.length]
        );

        const selectionSummary = useMemo(() => {
                if (selectedOrderIds.length === 0) {
                        return "No invoices selected";
                }
                if (selectedOrderIds.length === 1) {
                        return "1 invoice selected";
                }
                return `${selectedOrderIds.length} invoices selected`;
        }, [selectedOrderIds.length]);

        const handleFilterChange = (key, value) => {
                setFilters((prev) => ({ ...prev, [key]: value }));
        };

        const resetFilters = () => {
                setFilters(DEFAULT_FILTERS);
                setOrders([]);
                setSelectedOrderIds([]);
                setHasFetched(false);
                setLastUpdated(null);
        };

        const fetchOrders = async () => {
                if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
                        toast.error("End date must be after start date");
                        return;
                }

                setLoading(true);
                setSelectedOrderIds([]);

                try {
                        const params = new URLSearchParams();
                        params.set("page", "1");
                        const limitValue = Number.parseInt(filters.limit, 10);
                        if (Number.isFinite(limitValue) && limitValue > 0) {
                                params.set("limit", limitValue.toString());
                        }
                        if (filters.startDate) {
                                params.set("startDate", filters.startDate);
                        }
                        if (filters.endDate) {
                                params.set("endDate", filters.endDate);
                        }
                        if (filters.status && filters.status !== "all") {
                                params.set("status", filters.status);
                        }

                        const response = await fetch(`/api/admin/orders?${params.toString()}`);
                        const data = await response.json();

                        if (!response.ok || !data.success) {
                                throw new Error(data.message || "Failed to fetch orders");
                        }

                        setOrders(Array.isArray(data.orders) ? data.orders : []);
                        setHasFetched(true);
                        setLastUpdated(new Date());
                } catch (error) {
                        console.error("Bulk invoice fetch failed", error);
                        toast.error(error.message || "Failed to fetch orders");
                        setOrders([]);
                        setHasFetched(true);
                } finally {
                        setLoading(false);
                }
        };

        const toggleSelectAll = (checked) => {
                if (checked) {
                        setSelectedOrderIds(orders.map((order) => order._id));
                } else {
                        setSelectedOrderIds([]);
                }
        };

        const toggleOrderSelection = (orderId, checked) => {
                setSelectedOrderIds((prev) => {
                        if (checked) {
                                return prev.includes(orderId) ? prev : [...prev, orderId];
                        }
                        return prev.filter((id) => id !== orderId);
                });
        };

        const downloadSelectedInvoices = async () => {
                if (selectedOrderIds.length === 0) {
                        toast.error("Select at least one invoice to download");
                        return;
                }

                setDownloading(true);

                try {
                        const selectedOrders = orders.filter((order) =>
                                selectedOrderIds.includes(order._id)
                        );

                        const files = [];
                        const failures = [];

                        for (const order of selectedOrders) {
                                try {
                                        const detailedOrder = await fetchOrderForInvoice(order._id);
                                        const pdfBlob = await generateInvoicePDF(detailedOrder);
                                        const buffer = await pdfBlob.arrayBuffer();
                                        const fileName = `invoice-${order.orderNumber || order._id}.pdf`;
                                        files.push({
                                                name: fileName,
                                                data: new Uint8Array(buffer),
                                                lastModified: order.orderDate ? new Date(order.orderDate) : undefined,
                                        });
                                } catch (error) {
                                        console.error(
                                                `Failed to generate invoice for ${order.orderNumber || order._id}`,
                                                error
                                        );
                                        failures.push(order.orderNumber || order._id);
                                }
                        }

                        if (files.length === 0) {
                                throw new Error("No invoices could be generated for download");
                        }

                        const zipBlob = await createZipBlob(files);
                        const downloadUrl = URL.createObjectURL(zipBlob);
                        const link = document.createElement("a");
                        link.href = downloadUrl;
                        link.download = getZipFileName(filters);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(downloadUrl);

                        const successMessage =
                                files.length === 1
                                        ? "Invoice downloaded"
                                        : `${files.length} invoices downloaded`;
                        toast.success(successMessage);

                        if (failures.length > 0) {
                                toast.error(
                                        `Failed to prepare ${failures.length} invoice${
                                                failures.length > 1 ? "s" : ""
                                        }`
                                );
                        }
                } catch (error) {
                        console.error("Bulk invoice download failed", error);
                        toast.error(error.message || "Failed to download invoices");
                } finally {
                        setDownloading(false);
                }
        };

        if (!isAuthenticated) {
                return (
                        <div className="flex items-center justify-center py-12">
                                <div className="text-muted-foreground">Redirecting to login...</div>
                        </div>
                );
        }

        return (
                <div className="space-y-6">
                        <Card>
                                <CardHeader>
                                        <CardTitle>Bulk Invoice Download</CardTitle>
                                        <CardDescription>
                                                Filter orders by date range and download the invoices as a single
                                                ZIP archive.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                Start date
                                                        </label>
                                                        <div className="relative">
                                                                <Input
                                                                        type="date"
                                                                        value={filters.startDate}
                                                                        max={filters.endDate || undefined}
                                                                        onChange={(event) =>
                                                                                handleFilterChange(
                                                                                        "startDate",
                                                                                        event.target.value
                                                                                )
                                                                        }
                                                                />
                                                                <CalendarRange className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        </div>
                                                </div>
                                                <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                End date
                                                        </label>
                                                        <div className="relative">
                                                                <Input
                                                                        type="date"
                                                                        value={filters.endDate}
                                                                        min={filters.startDate || undefined}
                                                                        onChange={(event) =>
                                                                                handleFilterChange(
                                                                                        "endDate",
                                                                                        event.target.value
                                                                                )
                                                                        }
                                                                />
                                                                <CalendarRange className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                        </div>
                                                </div>
                                                <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                Status
                                                        </label>
                                                        <Select
                                                                value={filters.status}
                                                                onValueChange={(value) =>
                                                                        handleFilterChange("status", value)
                                                                }
                                                        >
                                                                <SelectTrigger>
                                                                        <SelectValue placeholder="All statuses" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                        <SelectItem value="all">All statuses</SelectItem>
                                                                        {ORDER_STATUS_OPTIONS.map((option) => (
                                                                                <SelectItem
                                                                                        key={option.value}
                                                                                        value={option.value}
                                                                                >
                                                                                        {option.label}
                                                                                </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                        </Select>
                                                </div>
                                                <div className="space-y-2">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                Results per page
                                                        </label>
                                                        <Select
                                                                value={filters.limit}
                                                                onValueChange={(value) =>
                                                                        handleFilterChange("limit", value)
                                                                }
                                                        >
                                                                <SelectTrigger>
                                                                        <SelectValue placeholder="50" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                        {LIMIT_OPTIONS.map((option) => (
                                                                                <SelectItem key={option} value={option}>
                                                                                        {option}
                                                                                </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                        </Select>
                                                </div>
                                        </div>
                                        <div className="mt-6 flex flex-wrap items-center gap-3">
                                                <Button onClick={fetchOrders} disabled={loading}>
                                                        {loading ? (
                                                                <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Applying filters
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <Filter className="mr-2 h-4 w-4" />
                                                                        Apply filters
                                                                </>
                                                        )}
                                                </Button>
                                                <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={resetFilters}
                                                        disabled={loading || downloading}
                                                >
                                                        <RefreshCw className="mr-2 h-4 w-4" /> Reset
                                                </Button>
                                                <Button
                                                        type="button"
                                                        onClick={downloadSelectedInvoices}
                                                        disabled={downloading || selectedOrderIds.length === 0}
                                                >
                                                        {downloading ? (
                                                                <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                        Preparing ZIP
                                                                </>
                                                        ) : (
                                                                <>
                                                                        <FileArchive className="mr-2 h-4 w-4" />
                                                                        Download selected
                                                                </>
                                                        )}
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                        {selectionSummary}
                                                </span>
                                                {lastUpdated && (
                                                        <span className="text-sm text-muted-foreground">
                                                                Last updated {formatDate(lastUpdated)} at
                                                                {" "}
                                                                {lastUpdated.toLocaleTimeString("en-IN", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                })}
                                                        </span>
                                                )}
                                        </div>
                                </CardContent>
                        </Card>

                        <Card>
                                <CardHeader>
                                        <CardTitle>Filtered orders</CardTitle>
                                        <CardDescription>
                                                Select the orders that should be included in the bulk invoice
                                                download.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent>
                                        <div className="overflow-x-auto">
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead className="w-12">
                                                                                <Checkbox
                                                                                        checked={allSelected}
                                                                                        onCheckedChange={(value) =>
                                                                                                toggleSelectAll(!!value)
                                                                                        }
                                                                                        aria-label="Select all"
                                                                                />
                                                                        </TableHead>
                                                                        <TableHead>Order</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                        <TableHead>Order date</TableHead>
                                                                        <TableHead className="text-right">
                                                                                Total amount
                                                                        </TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {loading ? (
                                                                        <TableRow>
                                                                                <TableCell colSpan={5} className="py-10 text-center">
                                                                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                                Fetching orders
                                                                                        </div>
                                                                                </TableCell>
                                                                        </TableRow>
                                                                ) : orders.length === 0 ? (
                                                                        <TableRow>
                                                                                <TableCell colSpan={5} className="py-10 text-center">
                                                                                        <div className="text-muted-foreground">
                                                                                                {hasFetched
                                                                                                        ? "No orders found for the selected filters"
                                                                                                        : "Apply filters to load orders"}
                                                                                        </div>
                                                                                </TableCell>
                                                                        </TableRow>
                                                                ) : (
                                                                        orders.map((order) => {
                                                                                const isSelected = selectedOrderIds.includes(order._id);
                                                                                return (
                                                                                        <TableRow key={order._id}>
                                                                                                <TableCell>
                                                                                                        <Checkbox
                                                                                                                checked={isSelected}
                                                                                                                onCheckedChange={(value) =>
                                                                                                                        toggleOrderSelection(
                                                                                                                                order._id,
                                                                                                                                !!value
                                                                                                                        )
                                                                                                                }
                                                                                                                aria-label={`Select order ${
                                                                                                                        order.orderNumber || order._id
                                                                                                                }`}
                                                                                                        />
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        <div className="font-medium">
                                                                                                                {order.orderNumber || "Unknown order"}
                                                                                                        </div>
                                                                                                        <div className="text-xs text-muted-foreground">
                                                                                                                {order.customerName || order.customerEmail || "Customer details unavailable"}
                                                                                                        </div>
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        <Badge
                                                                                                                variant="outline"
                                                                                                                className={cn(
                                                                                                                        "border-none",
                                                                                                                        getOrderStatusBadgeColor(
                                                                                                                                order.status
                                                                                                                        )
                                                                                                                )}
                                                                                                        >
                                                                                                                {getOrderStatusLabel(order.status)}
                                                                                                        </Badge>
                                                                                                </TableCell>
                                                                                                <TableCell>{formatDate(order.orderDate)}</TableCell>
                                                                                                <TableCell className="text-right">
                                                                                                        {formatCurrency(order.totalAmount)}
                                                                                                </TableCell>
                                                                                        </TableRow>
                                                                                );
                                                                        })
                                                                )}
                                                        </TableBody>
                                                </Table>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        );
}

export default BulkInvoiceDownload;
