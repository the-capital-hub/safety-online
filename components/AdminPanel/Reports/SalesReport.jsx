"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
} from "@/components/ui/table";
import {
        DropdownMenu,
        DropdownMenuCheckboxItem,
        DropdownMenuContent,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import {
        Loader2,
        Filter,
        RefreshCw,
        CalendarRange,
        Search,
        FileSpreadsheet,
        FileText,
} from "lucide-react";
import { useIsAuthenticated } from "@/store/adminAuthStore";
import { getOrderStatusLabel } from "@/constants/orderStatus";
import {
        downloadSalesReportExcel,
        downloadSalesReportPdf,
} from "@/lib/reports/salesReportExports";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
});

const formatCurrency = (value) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
                return currencyFormatter.format(0);
        }
        return currencyFormatter.format(numeric);
};

const formatDateInput = (date) => date.toISOString().split("T")[0];

const formatDisplayDate = (value) => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
        });
};

const getDefaultFilters = () => {
        const today = new Date();
        const end = formatDateInput(today);
        const start = new Date(today);
        start.setDate(start.getDate() - 29);
        return {
                startDate: formatDateInput(start),
                endDate: end,
                statuses: [],
                paymentMethods: [],
                sellers: [],
                search: "",
                page: 1,
                limit: "25",
        };
};

const LIMIT_OPTIONS = ["10", "25", "50", "100"];

const initialReportState = {
        summary: {
                totalOrders: 0,
                totalRevenue: 0,
                totalUnits: 0,
                averageOrderValue: 0,
        },
        sellerSummary: [],
        orders: [],
        pagination: {
                page: 1,
                limit: 25,
                total: 0,
                totalPages: 1,
        },
        availableFilters: {
                statuses: [],
                paymentMethods: [],
                sellers: [],
        },
};

const toggleFilterValue = (values, value) => {
        const set = new Set(values);
        if (set.has(value)) {
                set.delete(value);
        } else {
                set.add(value);
        }
        return Array.from(set);
};

const emptyStateMessage = "No sales records found for the selected filters.";

export function SalesReport() {
        const router = useRouter();
        const isAuthenticated = useIsAuthenticated();

        const [filters, setFilters] = useState(() => getDefaultFilters());
        const [appliedFilters, setAppliedFilters] = useState(() => getDefaultFilters());
        const [report, setReport] = useState(initialReportState);
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState(null);
        const [exporting, setExporting] = useState(null);
        const [hasFetched, setHasFetched] = useState(false);

        const totalPages = useMemo(
                () => Math.max(report.pagination.totalPages || 1, 1),
                [report.pagination.totalPages]
        );
        const currentPage = report.pagination.page || appliedFilters.page || 1;

        useEffect(() => {
                if (!isAuthenticated) {
                        router.push("/admin/login");
                }
        }, [isAuthenticated, router]);

        const fetchReport = useCallback(
                async (activeFilters) => {
                        if (!isAuthenticated) {
                                return;
                        }

                        const params = new URLSearchParams();
                        if (activeFilters.startDate) {
                                params.set("startDate", activeFilters.startDate);
                        }
                        if (activeFilters.endDate) {
                                params.set("endDate", activeFilters.endDate);
                        }
                        if (activeFilters.statuses?.length) {
                                params.set("status", activeFilters.statuses.join(","));
                        }
                        if (activeFilters.paymentMethods?.length) {
                                params.set(
                                        "paymentMethods",
                                        activeFilters.paymentMethods.join(",")
                                );
                        }
                        if (activeFilters.sellers?.length) {
                                params.set("sellers", activeFilters.sellers.join(","));
                        }
                        const search = activeFilters.search?.trim();
                        if (search) {
                                params.set("search", search);
                        }
                        params.set("page", String(activeFilters.page || 1));
                        params.set("limit", String(activeFilters.limit || "25"));

                        setLoading(true);
                        setError(null);

                        try {
                                const response = await fetch(
                                        `/api/admin/reports/sales?${params.toString()}`,
                                        {
                                                method: "GET",
                                                credentials: "include",
                                        }
                                );

                                if (response.status === 401) {
                                        router.push("/admin/login");
                                        return;
                                }

                                const payload = await response.json();

                                if (!response.ok || !payload.success) {
                                        throw new Error(
                                                payload.message ||
                                                        "Failed to load sales report"
                                        );
                                }

                                setReport(payload.data);
                        } catch (fetchError) {
                                console.error("Sales report fetch error", fetchError);
                                const message =
                                        fetchError.message ||
                                        "Unable to load sales report";
                                setError(message);
                                toast.error(message);
                        } finally {
                                setLoading(false);
                                setHasFetched(true);
                        }
                },
                [isAuthenticated, router]
        );

        useEffect(() => {
                fetchReport(appliedFilters);
        }, [appliedFilters, fetchReport]);

        const handleExport = useCallback(
                async (type) => {
                        if (!hasFetched) {
                                toast.error(
                                        "The sales report is still loading. Please try again in a moment."
                                );
                                return;
                        }

                        try {
                                setExporting(type);
                                if (type === "excel") {
                                        await Promise.resolve(
                                                downloadSalesReportExcel(report, appliedFilters)
                                        );
                                } else {
                                        await Promise.resolve(
                                                downloadSalesReportPdf(report, appliedFilters)
                                        );
                                }
                        } catch (exportError) {
                                console.error("Sales report export error", exportError);
                                toast.error(
                                        "Unable to download the sales report. Please try again."
                                );
                        } finally {
                                setExporting(null);
                        }
                },
                [appliedFilters, hasFetched, report]
        );

        const summaryCards = useMemo(
                () => [
                        {
                                title: "Total revenue",
                                value: report.summary.totalRevenue,
                                formatter: formatCurrency,
                                icon: "₹",
                        },
                        {
                                title: "Total orders",
                                value: report.summary.totalOrders,
                                formatter: (value) => value,
                                icon: "🧾",
                        },
                        {
                                title: "Units sold",
                                value: report.summary.totalUnits,
                                formatter: (value) => value,
                                icon: "📦",
                        },
                        {
                                title: "Average order value",
                                value: report.summary.averageOrderValue,
                                formatter: formatCurrency,
                                icon: "📈",
                        },
                ],
                [report.summary.averageOrderValue, report.summary.totalOrders, report.summary.totalRevenue, report.summary.totalUnits]
        );

        const handleFilterChange = (key, value) => {
                setFilters((prev) => ({
                        ...prev,
                        [key]: value,
                }));
        };

        const handleToggleFilter = (key, value) => {
                setFilters((prev) => ({
                        ...prev,
                        [key]: toggleFilterValue(prev[key], value),
                }));
        };

        const applyFilters = () => {
                setAppliedFilters((prev) => ({
                        ...filters,
                        page: 1,
                        limit: filters.limit,
                }));
                setFilters((prev) => ({
                        ...prev,
                        page: 1,
                }));
        };

        const resetFilters = () => {
                const defaults = getDefaultFilters();
                setFilters(defaults);
                setAppliedFilters(defaults);
        };

        const handleLimitChange = (value) => {
                setFilters((prev) => ({
                        ...prev,
                        limit: value,
                        page: 1,
                }));
                setAppliedFilters((prev) => ({
                        ...prev,
                        limit: value,
                        page: 1,
                }));
        };

        const goToPage = (page) => {
                setFilters((prev) => ({
                        ...prev,
                        page,
                }));
                setAppliedFilters((prev) => ({
                        ...prev,
                        page,
                }));
        };

        const sellerRows = useMemo(
                () =>
                        report.sellerSummary.map((seller) => ({
                                ...seller,
                                displayName:
                                        seller.sellerName?.trim() ||
                                        seller.sellerEmail ||
                                        seller.sellerPhone ||
                                        seller.sellerId,
                        })),
                [report.sellerSummary]
        );

        const selectedStatusLabel = filters.statuses.length
                ? `Status (${filters.statuses.length})`
                : "Order status";
        const selectedPaymentLabel = filters.paymentMethods.length
                ? `Payment (${filters.paymentMethods.length})`
                : "Payment methods";
        const selectedSellerLabel = filters.sellers.length
                ? `Sellers (${filters.sellers.length})`
                : "Sellers";

        return (
                <div className="space-y-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex flex-col gap-1">
                                        <h1 className="text-2xl font-semibold tracking-tight">
                                                Sales report
                                        </h1>
                                        <p className="text-sm text-muted-foreground">
                                                Review order performance with detailed product, customer,
                                                and seller insights.
                                        </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                        <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => handleExport("excel")}
                                                disabled={loading || exporting !== null || !hasFetched}
                                        >
                                                {exporting === "excel" ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                        <FileSpreadsheet className="h-4 w-4" />
                                                )}
                                                <span>Download Excel</span>
                                        </Button>
                                        <Button
                                                variant="outline"
                                                className="gap-2"
                                                onClick={() => handleExport("pdf")}
                                                disabled={loading || exporting !== null || !hasFetched}
                                        >
                                                {exporting === "pdf" ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                        <FileText className="h-4 w-4" />
                                                )}
                                                <span>Download PDF</span>
                                        </Button>
                                </div>
                        </div>

                        <Card>
                                <CardHeader className="pb-4">
                                        <CardTitle>Filters</CardTitle>
                                        <CardDescription>
                                                Refine the report by date range, status, seller, and other
                                                attributes.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                                <div className="space-y-1">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                Start date
                                                        </label>
                                                        <div className="relative">
                                                                <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                        type="date"
                                                                        value={filters.startDate}
                                                                        onChange={(event) =>
                                                                                handleFilterChange(
                                                                                        "startDate",
                                                                                        event.target.value
                                                                                )
                                                                        }
                                                                        className="pl-10"
                                                                />
                                                        </div>
                                                </div>
                                                <div className="space-y-1">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                End date
                                                        </label>
                                                        <div className="relative">
                                                                <CalendarRange className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                <Input
                                                                        type="date"
                                                                        value={filters.endDate}
                                                                        onChange={(event) =>
                                                                                handleFilterChange(
                                                                                        "endDate",
                                                                                        event.target.value
                                                                                )
                                                                        }
                                                                        className="pl-10"
                                                                />
                                                        </div>
                                                </div>
                                                <div className="space-y-1">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                Search
                                                        </label>
                                                        <div className="flex gap-2">
                                                                <div className="relative flex-1">
                                                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                                        <Input
                                                                                placeholder="Order, customer, product..."
                                                                                value={filters.search}
                                                                                onChange={(event) =>
                                                                                        handleFilterChange(
                                                                                                "search",
                                                                                                event.target.value
                                                                                        )
                                                                                }
                                                                                className="pl-10"
                                                                        />
                                                                </div>
                                                                <Button
                                                                        variant="outline"
                                                                        onClick={applyFilters}
                                                                        disabled={loading}
                                                                >
                                                                        Apply
                                                                </Button>
                                                        </div>
                                                </div>
                                                <div className="space-y-1">
                                                        <label className="text-sm font-medium text-muted-foreground">
                                                                Results per page
                                                        </label>
                                                        <Select
                                                                value={filters.limit}
                                                                onValueChange={handleLimitChange}
                                                                disabled={loading}
                                                        >
                                                                <SelectTrigger>
                                                                        <SelectValue />
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

                                        <div className="flex flex-wrap items-center gap-2">
                                                <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                                <Button
                                                                        variant="outline"
                                                                        className="min-w-[180px] justify-between"
                                                                        disabled={loading}
                                                                >
                                                                        <span>{selectedStatusLabel}</span>
                                                                        <Filter className="ml-2 h-4 w-4 opacity-50" />
                                                                </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-[220px]" align="start">
                                                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {(report.availableFilters.statuses || []).map(
                                                                        (status) => (
                                                                                <DropdownMenuCheckboxItem
                                                                                        key={status}
                                                                                        checked={filters.statuses.includes(status)}
                                                                                        onCheckedChange={() =>
                                                                                                handleToggleFilter(
                                                                                                        "statuses",
                                                                                                        status
                                                                                                )
                                                                                        }
                                                                                >
                                                                                        {getOrderStatusLabel(status)}
                                                                                </DropdownMenuCheckboxItem>
                                                                        )
                                                                )}
                                                        </DropdownMenuContent>
                                                </DropdownMenu>

                                                <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                                <Button
                                                                        variant="outline"
                                                                        className="min-w-[200px] justify-between"
                                                                        disabled={loading}
                                                                >
                                                                        <span>{selectedPaymentLabel}</span>
                                                                        <Filter className="ml-2 h-4 w-4 opacity-50" />
                                                                </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-[220px]" align="start">
                                                                <DropdownMenuLabel>Payment methods</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {(report.availableFilters.paymentMethods || []).map(
                                                                        (method) => (
                                                                                <DropdownMenuCheckboxItem
                                                                                        key={method}
                                                                                        checked={filters.paymentMethods.includes(method)}
                                                                                        onCheckedChange={() =>
                                                                                                handleToggleFilter(
                                                                                                        "paymentMethods",
                                                                                                        method
                                                                                                )
                                                                                        }
                                                                                >
                                                                                        {method === "unknown"
                                                                                                ? "Unknown"
                                                                                                : method}
                                                                                </DropdownMenuCheckboxItem>
                                                                        )
                                                                )}
                                                        </DropdownMenuContent>
                                                </DropdownMenu>

                                                <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                                <Button
                                                                        variant="outline"
                                                                        className="min-w-[200px] justify-between"
                                                                        disabled={loading}
                                                                >
                                                                        <span>{selectedSellerLabel}</span>
                                                                        <Filter className="ml-2 h-4 w-4 opacity-50" />
                                                                </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="w-[260px]" align="start">
                                                                <DropdownMenuLabel>Sellers</DropdownMenuLabel>
                                                                <DropdownMenuSeparator />
                                                                {(report.availableFilters.sellers || []).map((seller) => (
                                                                        <DropdownMenuCheckboxItem
                                                                                key={seller.value}
                                                                                checked={filters.sellers.includes(seller.value)}
                                                                                onCheckedChange={() =>
                                                                                        handleToggleFilter(
                                                                                                "sellers",
                                                                                                seller.value
                                                                                        )
                                                                                }
                                                                        >
                                                                                {seller.label}
                                                                        </DropdownMenuCheckboxItem>
                                                                ))}
                                                        </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button
                                                        variant="ghost"
                                                        onClick={resetFilters}
                                                        disabled={loading}
                                                        className="text-muted-foreground"
                                                >
                                                        Reset
                                                </Button>
                                                <Button
                                                        onClick={applyFilters}
                                                        disabled={loading}
                                                        className="gap-2"
                                                >
                                                        <RefreshCw className="h-4 w-4" />
                                                        Update report
                                                </Button>
                                        </div>
                                </CardContent>
                        </Card>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                {summaryCards.map((card) => (
                                        <Card key={card.title}>
                                                <CardHeader className="pb-2">
                                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                                                {card.title}
                                                        </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                        <div className="text-2xl font-semibold">
                                                                {card.formatter(card.value)}
                                                        </div>
                                                </CardContent>
                                        </Card>
                                ))}
                        </div>

                        <Card>
                                <CardHeader className="pb-4">
                                        <CardTitle>Sales detail</CardTitle>
                                        <CardDescription>
                                                Detailed order level information including products, units, and
                                                invoice totals.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                        {error && (
                                                <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                                                        {error}
                                                </div>
                                        )}
                                        <div className="overflow-x-auto">
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead className="min-w-[160px]">Order</TableHead>
                                                                        <TableHead className="min-w-[160px]">Customer</TableHead>
                                                                        <TableHead className="min-w-[160px]">Seller</TableHead>
                                                                        <TableHead className="min-w-[240px]">Products</TableHead>
                                                                        <TableHead className="whitespace-nowrap">Units</TableHead>
                                                                        <TableHead className="whitespace-nowrap">Invoice value</TableHead>
                                                                        <TableHead className="whitespace-nowrap">Payment</TableHead>
                                                                        <TableHead className="whitespace-nowrap">Status</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {loading ? (
                                                                        <TableRow>
                                                                                <TableCell colSpan={8}>
                                                                                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                                Loading sales report…
                                                                                        </div>
                                                                                </TableCell>
                                                                        </TableRow>
                                                                ) : report.orders.length ? (
                                                                        report.orders.map((order) => (
                                                                                <TableRow key={order.id}>
                                                                                        <TableCell>
                                                                                                <div className="font-medium">
                                                                                                        {order.orderNumber || "—"}
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                        {formatDisplayDate(order.orderDate)}
                                                                                                </div>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                                <div className="font-medium">
                                                                                                        {order.customer?.name || "—"}
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                        {order.customer?.email || order.customer?.phone || ""}
                                                                                                </div>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                                <div className="font-medium">
                                                                                                        {order.seller?.name || order.seller?.email || "—"}
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                        {order.seller?.email || order.seller?.phone || ""}
                                                                                                </div>
                                                                                                {order.seller?.status && (
                                                                                                        <Badge variant="outline" className="mt-1 w-fit">
                                                                                                                {order.seller.status}
                                                                                                        </Badge>
                                                                                                )}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                                <div className="space-y-2">
                                        {(order.products || []).map((product, index) => (
                                                                                                                <div
                                                                                                                        key={`${order.id}-${index}`}
                                                                                                                        className="rounded-md border p-2 text-xs"
                                                                                                                >
                                                                                                                        <div className="font-medium">
                                                                                                                                {product.name}
                                                                                                                        </div>
                                                                                                                        <div className="flex flex-wrap items-center gap-x-3 text-muted-foreground">
                                                                                                                                <span>
                                                                                                                                        Qty: {product.quantity}
                                                                                                                                </span>
                                                                                                                                <span>
                                                                                                                                        Price: {formatCurrency(product.price)}
                                                                                                                                </span>
                                                                                                                                <span>
                                                                                                                                        Total: {formatCurrency(product.total)}
                                                                                                                                </span>
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        ))}
                                                                                                </div>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                                {order.unitCount ?? 0}
                                                                                        </TableCell>
                                                                                        <TableCell>{formatCurrency(order.invoiceValue)}</TableCell>
                                                                                        <TableCell>
                                                                                                {order.paymentMethod === "unknown"
                                                                                                        ? "Unknown"
                                                                                                        : order.paymentMethod || "—"}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                                <Badge variant="secondary">
                                                                                                        {getOrderStatusLabel(order.status)}
                                                                                                </Badge>
                                                                                        </TableCell>
                                                                                </TableRow>
                                                                        ))
                                                                ) : (
                                                                        <TableRow>
                                                                                <TableCell colSpan={8}>
                                                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                                                                {emptyStateMessage}
                                                                                        </div>
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                        </TableBody>
                                                </Table>
                                        </div>

                                        <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                                <div>
                                                        Showing page {currentPage} of {totalPages}. Total records: {report.pagination.total}.
                                                </div>
                                                <div className="flex items-center gap-2">
                                                        <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => goToPage(Math.max(1, currentPage - 1))}
                                                                disabled={loading || currentPage <= 1}
                                                        >
                                                                Previous
                                                        </Button>
                                                        <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                        goToPage(Math.min(totalPages, currentPage + 1))
                                                                }
                                                                disabled={
                                                                        loading ||
                                                                        currentPage >= totalPages ||
                                                                        report.pagination.total === 0
                                                                }
                                                        >
                                                                Next
                                                        </Button>
                                                </div>
                                        </div>
                                </CardContent>
                        </Card>

                        <Card>
                                <CardHeader className="pb-4">
                                        <CardTitle>Seller performance</CardTitle>
                                        <CardDescription>
                                                Aggregated revenue and unit performance broken down by seller.
                                        </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                        <div className="overflow-x-auto">
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead className="min-w-[200px]">Seller</TableHead>
                                                                        <TableHead>Total orders</TableHead>
                                                                        <TableHead>Units</TableHead>
                                                                        <TableHead>Revenue</TableHead>
                                                                        <TableHead>Avg. order value</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {sellerRows.length ? (
                                                                        sellerRows.map((seller) => (
                                                                                <TableRow key={seller.sellerId}>
                                                                                        <TableCell>
                                                                                                <div className="font-medium">
                                                                                                        {seller.displayName}
                                                                                                </div>
                                                                                                <div className="text-xs text-muted-foreground">
                                                                                                        {seller.sellerEmail || seller.sellerPhone || ""}
                                                                                                </div>
                                                                                                {seller.sellerStatus && (
                                                                                                        <Badge variant="outline" className="mt-1 w-fit">
                                                                                                                {seller.sellerStatus}
                                                                                                        </Badge>
                                                                                                )}
                                                                                        </TableCell>
                                                                                        <TableCell>{seller.orderCount ?? 0}</TableCell>
                                                                                        <TableCell>{seller.totalUnits ?? 0}</TableCell>
                                                                                        <TableCell>{formatCurrency(seller.totalRevenue)}</TableCell>
                                                                                        <TableCell>{formatCurrency(seller.averageOrderValue)}</TableCell>
                                                                                </TableRow>
                                                                        ))
                                                                ) : (
                                                                        <TableRow>
                                                                                <TableCell colSpan={5}>
                                                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                                                                {emptyStateMessage}
                                                                                        </div>
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                        </TableBody>
                                                </Table>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        );
}

export default SalesReport;
