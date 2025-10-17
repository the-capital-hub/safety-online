"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
        Select,
        SelectContent,
        SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
        IndianRupee,
        ShieldCheck,
        Wallet,
        History,
        Calendar,
        Search,
        RotateCcw,
        Download,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useSellerPaymentStore } from "@/store/sellerPaymentStore.js";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore.js";

const statusStyles = {
        escrow: "bg-amber-100 text-amber-800",
        admin_approval: "bg-blue-100 text-blue-800",
        released: "bg-emerald-100 text-emerald-800",
        refunded: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
        disputed: "bg-purple-100 text-purple-800",
};

const STATUS_OPTIONS = [
        { label: "All", value: "all" },
        { label: "In Escrow", value: "escrow" },
        { label: "Awaiting Admin Approval", value: "admin_approval" },
        { label: "Released", value: "released" },
        { label: "Refunded", value: "refunded" },
        { label: "Cancelled", value: "cancelled" },
];

const formatCurrency = (value) => {
        const number = Number(value) || 0;
        return `₹${number.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (value) => {
        if (!value) return "--";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "--";
        return date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
        });
};

const formatSubOrderReference = (subOrderValue) => {
        if (!subOrderValue) return "--";

        let rawValue = subOrderValue;

        if (typeof subOrderValue === "object") {
                if (typeof subOrderValue._id !== "undefined") {
                        rawValue = subOrderValue._id;
                }
        }

        if (typeof rawValue !== "string") {
                try {
                        rawValue = rawValue?.toString?.();
                } catch (error) {
                        rawValue = null;
                }
        }

        if (!rawValue) return "--";

        return `#${rawValue.slice(-6)}`;
};

const formatStatus = (status) =>
        (status || "")
                .split("_")
                .filter(Boolean)
                .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
                .join(" ") || "--";

function SellerPaymentsPage() {
        const router = useRouter();
        const isAuthenticated = useIsSellerAuthenticated();

        const {
                payments,
                loading,
                error,
                stats,
                pagination,
                filters,
                setFilters,
                resetFilters,
                fetchPayments,
        } = useSellerPaymentStore();
        const [exporting, setExporting] = useState(false);

        useEffect(() => {
                if (!isAuthenticated) {
                        const timeout = setTimeout(() => router.push("/seller/login"), 100);
                        return () => clearTimeout(timeout);
                }
        }, [isAuthenticated, router]);

        useEffect(() => {
                if (isAuthenticated) {
                        fetchPayments();
                }
        }, [filters, fetchPayments, isAuthenticated]);

        const handleFilterChange = (key, value) => {
                setFilters({ [key]: value, page: 1 });
        };

        const handleSearchSubmit = (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const searchValue = formData.get("search")?.toString() || "";
                setFilters({ search: searchValue.trim(), page: 1 });
        };

        const handlePageChange = (page) => {
                if (page < 1 || page > pagination.totalPages) return;
                setFilters({ page });
        };

        const handleExportPayments = async () => {
                if (!payments.length) {
                        toast.error("No payments available to export");
                        return;
                }

                setExporting(true);

                try {
                        const { exportToExcel } = await import("@/lib/exportToExcel.js");

                        const formatExportDate = (value) => {
                                if (!value) return "";
                                const date = new Date(value);
                                if (Number.isNaN(date.getTime())) return "";
                                return date.toLocaleDateString("en-IN", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                });
                        };

                        const columns = [
                                { key: "index", header: "S. No" },
                                { key: "orderNumber", header: "Order Number" },
                                { key: "subOrder", header: "Sub Order" },
                                { key: "status", header: "Status" },
                                { key: "totalAmount", header: "Order Total (₹)" },
                                { key: "sellerShare", header: "Your Share (₹)" },
                                { key: "commission", header: "Commission (₹)" },
                                { key: "escrowDate", header: "Escrow Date" },
                                { key: "releasedDate", header: "Released On" },
                                { key: "paymentReference", header: "Payment Reference" },
                        ];

                        const rows = payments.map((payment, index) => {
                                const subOrder = formatSubOrderReference(payment.subOrderId);
                                const paymentReference =
                                        payment.razorpayPaymentId ||
                                        payment.razorpayOrderId ||
                                        payment.payoutReference ||
                                        "";

                                return {
                                        index: index + 1,
                                        orderNumber: payment.orderNumber || "",
                                        subOrder: subOrder === "--" ? "" : subOrder,
                                        status: formatStatus(payment.status),
                                        totalAmount: Number(payment.totalAmount || 0),
                                        sellerShare: Number(payment.sellerAmount || 0),
                                        commission: Number(payment.commissionAmount || 0),
                                        escrowDate: formatExportDate(payment.escrowActivatedAt || payment.createdAt),
                                        releasedDate: formatExportDate(payment.releasedAt),
                                        paymentReference,
                                };
                        });

                        const currentDate = new Date().toISOString().slice(0, 10);
                        const filename = `seller-payments-${currentDate}.xls`;

                        const exported = await exportToExcel({
                                columns,
                                rows,
                                filename,
                                sheetName: "SellerPayments",
                        });

                        if (exported) {
                                toast.success("Payments exported successfully");
                        } else {
                                toast.error("Failed to export payments");
                        }
                } catch (error) {
                        console.error("Export seller payments error:", error);
                        toast.error("An error occurred while exporting payments");
                } finally {
                        setExporting(false);
                }
        };

        if (!isAuthenticated) {
                return (
                        <div className="flex items-center justify-center py-12">
                                <p className="text-gray-600">Redirecting to login...</p>
                        </div>
                );
        }

        return (
                <div className="space-y-6 p-6">
                        <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                        >
                                <h1 className="text-3xl font-bold text-gray-900">Payment Settlements</h1>
                                <p className="text-gray-600 mt-2">
                                        Track escrow balances, commissions, and released payouts from your orders.
                                </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <Card>
                                        <CardContent className="p-6">
                                                <div className="flex items-center">
                                                        <Wallet className="h-8 w-8 text-blue-600" />
                                                        <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-600">Total Settlements</p>
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                        {formatCurrency(stats.releasedAmount)}
                                                                </p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardContent className="p-6">
                                                <div className="flex items-center">
                                                        <ShieldCheck className="h-8 w-8 text-emerald-600" />
                                                        <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-600">Earnings in Escrow</p>
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                        {formatCurrency(stats.escrowAmount)}
                                                                </p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardContent className="p-6">
                                                <div className="flex items-center">
                                                        <IndianRupee className="h-8 w-8 text-orange-500" />
                                                        <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-600">Commission Paid</p>
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                        {formatCurrency(stats.commissionPaid)}
                                                                </p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardContent className="p-6">
                                                <div className="flex items-center">
                                                        <History className="h-8 w-8 text-indigo-600" />
                                                        <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                        </div>

                        <Card>
                                <CardHeader className="pb-2">
                                        <CardTitle className="text-xl font-semibold">Payment History</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <form
                                                        onSubmit={handleSearchSubmit}
                                                        className="col-span-12 lg:col-span-4 flex items-center space-x-2"
                                                >
                                                        <div className="relative flex-1">
                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                <Input
                                                                        name="search"
                                                                        defaultValue={filters.search}
                                                                        placeholder="Search order or reference"
                                                                        className="pl-9"
                                                                />
                                                        </div>
                                                        <Button type="submit" variant="outline">
                                                                Search
                                                        </Button>
                                                </form>
                                                <div className="col-span-6 lg:col-span-3">
                                                        <Select
                                                                value={filters.status}
                                                                onValueChange={(value) => handleFilterChange("status", value)}
                                                        >
                                                                <SelectTrigger>
                                                                        <SelectValue placeholder="Status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                        {STATUS_OPTIONS.map((option) => (
                                                                                <SelectItem key={option.value} value={option.value}>
                                                                                        {option.label}
                                                                                </SelectItem>
                                                                        ))}
                                                                </SelectContent>
                                                        </Select>
                                                </div>
                                                <div className="col-span-6 lg:col-span-2">
                                                        <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                                <Input
                                                                        type="date"
                                                                        value={filters.startDate}
                                                                        onChange={(event) => handleFilterChange("startDate", event.target.value)}
                                                                />
                                                        </div>
                                                </div>
                                                <div className="col-span-6 lg:col-span-2">
                                                        <div className="flex items-center gap-2">
                                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                                <Input
                                                                        type="date"
                                                                        value={filters.endDate}
                                                                        onChange={(event) => handleFilterChange("endDate", event.target.value)}
                                                                />
                                                        </div>
                                                </div>
                                                <div className="col-span-12 lg:col-span-2 flex flex-col sm:flex-row lg:flex-col gap-2">
                                                        <Button
                                                                type="button"
                                                                className="w-full"
                                                                onClick={handleExportPayments}
                                                                disabled={exporting || loading || payments.length === 0}
                                                        >
                                                                <Download className="h-4 w-4 mr-2" />
                                                                {exporting ? "Exporting..." : "Export Excel"}
                                                        </Button>
                                                        <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => resetFilters()}
                                                                className="w-full"
                                                        >
                                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                                Reset
                                                        </Button>
                                                </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead>Order</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                        <TableHead>Total</TableHead>
                                                                        <TableHead>Your Share</TableHead>
                                                                        <TableHead>Commission</TableHead>
                                                                        <TableHead>Escrow Date</TableHead>
                                                                        <TableHead>Released On</TableHead>
                                                                        <TableHead>Reference</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {loading && (
                                                                        <TableRow>
                                                                                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                                                                                        Loading payments...
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                                {!loading && error && (
                                                                        <TableRow>
                                                                                <TableCell colSpan={8} className="text-center py-6 text-red-500">
                                                                                        {error}
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                                {!loading && !error && payments.length === 0 && (
                                                                        <TableRow>
                                                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                                                                        No payment records found for the selected filters.
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                                {!loading && !error &&
                                                                        payments.map((payment) => (
                                                                                <TableRow key={payment._id}>
                                                                                        <TableCell>
                                                                <div className="font-semibold text-gray-900">
                                                                        {payment.orderNumber}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                        Sub Order: {formatSubOrderReference(payment.subOrderId)}
                                                                </div>
                                                        </TableCell>
                                                                                        <TableCell>
                                                                                                <Badge className={statusStyles[payment.status] || "bg-gray-100 text-gray-800"}>
                                                                                                        {formatStatus(payment.status)}
                                                                                                </Badge>
                                                                                        </TableCell>
                                                                                        <TableCell>{formatCurrency(payment.totalAmount)}</TableCell>
                                                                                        <TableCell>{formatCurrency(payment.sellerAmount)}</TableCell>
                                                                                        <TableCell>{formatCurrency(payment.commissionAmount)}</TableCell>
                                                                                        <TableCell>{formatDate(payment.escrowActivatedAt || payment.createdAt)}</TableCell>
                                                                                        <TableCell>{formatDate(payment.releasedAt)}</TableCell>
                                                                                        <TableCell className="text-xs text-gray-500">
                                                                                                {payment.razorpayPaymentId || payment.razorpayOrderId || "--"}
                                                                                        </TableCell>
                                                                                </TableRow>
                                                                        ))}
                                                        </TableBody>
                                                </Table>
                                        </div>

                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <p className="text-sm text-gray-600">
                                                        Showing page {pagination.currentPage} of {pagination.totalPages} — {" "}
                                                        {pagination.totalRecords} records
                                                </p>
                                                <div className="flex gap-2">
                                                        <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={!pagination.hasPrev}
                                                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                        >
                                                                Previous
                                                        </Button>
                                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => {
                                                                const pageNumber = index + 1;
                                                                return (
                                                                        <Button
                                                                                key={pageNumber}
                                                                                size="sm"
                                                                                variant={
                                                                                        pagination.currentPage === pageNumber
                                                                                                ? "default"
                                                                                                : "outline"
                                                                                }
                                                                                onClick={() => handlePageChange(pageNumber)}
                                                                        >
                                                                                {pageNumber}
                                                                        </Button>
                                                                );
                                                        })}
                                                        <Button
                                                                variant="outline"
                                                                size="sm"
                                                                disabled={!pagination.hasNext}
                                                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                        >
                                                                Next
                                                        </Button>
                                                </div>
                                        </div>
                                </CardContent>
                        </Card>
                </div>
        );
}

export default SellerPaymentsPage;
