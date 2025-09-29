"use client";

import { useEffect } from "react";
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
        Users,
        Calendar,
        Search,
        RotateCcw,
} from "lucide-react";

import { useAdminPaymentStore } from "@/store/adminPaymentStore.js";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";

const STATUS_OPTIONS = [
        { label: "All", value: "all" },
        { label: "In Escrow", value: "escrow" },
        { label: "Released", value: "released" },
        { label: "Refunded", value: "refunded" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Disputed", value: "disputed" },
];

const statusStyles = {
        escrow: "bg-amber-100 text-amber-800",
        released: "bg-emerald-100 text-emerald-800",
        refunded: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
        disputed: "bg-purple-100 text-purple-800",
};

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

const formatSubOrderReference = (value) => {
        if (!value) return "--";

        let rawValue = value;

        if (typeof value === "object") {
                if (typeof value._id !== "undefined") {
                        rawValue = value._id;
                }
        }

        if (typeof rawValue !== "string") {
                rawValue = rawValue?.toString?.() || null;
        }

        if (!rawValue) return "--";

        return `#${rawValue.slice(-6)}`;
};

const getSellerDisplay = (payment) => {
        const name = payment.sellerSnapshot?.businessName || payment.sellerSnapshot?.name || "Unknown Seller";
        const email = payment.sellerSnapshot?.email;
        return { name, email };
};

function AdminPaymentsPage() {
        const router = useRouter();
        const isAuthenticated = useIsAuthenticated();

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
        } = useAdminPaymentStore();

        useEffect(() => {
                if (!isAuthenticated) {
                        const timeout = setTimeout(() => router.push("/admin/login"), 100);
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

        if (!isAuthenticated) {
                return (
                        <div className="flex items-center justify-center py-12">
                                <p className="text-gray-600">Redirecting to admin login...</p>
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
                                <h1 className="text-3xl font-bold text-gray-900">Payment Escrow & Settlements</h1>
                                <p className="text-gray-600 mt-2">
                                        Monitor Razorpay collections, escrow balances, and automatic payouts released to sellers.
                                </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <Card>
                                        <CardContent className="p-6">
                                                <div className="flex items-center">
                                                        <IndianRupee className="h-8 w-8 text-indigo-600" />
                                                        <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                                                                <p className="text-2xl font-bold text-gray-900">
                                                                        {formatCurrency(stats.commissionEarned)}
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
                                                                <p className="text-sm font-medium text-gray-600">In Escrow</p>
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
                                                        <Wallet className="h-8 w-8 text-blue-600" />
                                                        <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-600">Released to Sellers</p>
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
                                                        <Users className="h-8 w-8 text-orange-500" />
                                                        <div className="ml-4">
                                                                <p className="text-sm font-medium text-gray-600">Total Settlements</p>
                                                                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>
                        </div>

                        <Card>
                                <CardHeader className="pb-2">
                                        <CardTitle className="text-xl font-semibold">Razorpay Payment History</CardTitle>
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
                                                                        placeholder="Search order number or seller"
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
                                                        <Input
                                                                placeholder="Seller ID"
                                                                defaultValue={filters.sellerId}
                                                                onBlur={(event) =>
                                                                        handleFilterChange("sellerId", event.target.value.trim())
                                                                }
                                                        />
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
                                                <div className="col-span-6 lg:col-span-1">
                                                        <Input
                                                                type="date"
                                                                value={filters.endDate}
                                                                onChange={(event) => handleFilterChange("endDate", event.target.value)}
                                                        />
                                                </div>
                                                <div className="col-span-6 lg:col-span-1 flex justify-end">
                                                        <Button type="button" variant="outline" className="w-full" onClick={() => resetFilters()}>
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
                                                                        <TableHead>Seller</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                        <TableHead>Total</TableHead>
                                                                        <TableHead>Seller Share</TableHead>
                                                                        <TableHead>Commission</TableHead>
                                                                        <TableHead>Escrow Date</TableHead>
                                                                        <TableHead>Released</TableHead>
                                                                        <TableHead>Reference</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {loading && (
                                                                        <TableRow>
                                                                                <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                                                                                        Loading payments...
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                                {!loading && error && (
                                                                        <TableRow>
                                                                                <TableCell colSpan={9} className="text-center py-6 text-red-500">
                                                                                        {error}
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                                {!loading && !error && payments.length === 0 && (
                                                                        <TableRow>
                                                                                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                                                                        No payment activity found for the selected filters.
                                                                                </TableCell>
                                                                        </TableRow>
                                                                )}
                                                                {!loading && !error &&
                                                                        payments.map((payment) => {
                                                                                const seller = getSellerDisplay(payment);
                                                                                return (
                                                                                        <TableRow key={payment._id}>
                                                                                                <TableCell>
                                                                                                        <div className="font-semibold text-gray-900">
                                                                                                                {payment.orderNumber}
                                                                                                        </div>
                                                                                                        <div className="text-xs text-gray-500">
                                                                                                                {formatSubOrderReference(payment.subOrderId)}
                                                                                                        </div>
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        <div className="font-medium text-gray-900">{seller.name}</div>
                                                                                                        {seller.email && (
                                                                                                                <div className="text-xs text-gray-500">{seller.email}</div>
                                                                                                        )}
                                                                                                </TableCell>
                                                                                                <TableCell>
                                                                                                        <Badge className={statusStyles[payment.status] || "bg-gray-100 text-gray-800"}>
                                                                                                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
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
                                                                                );
                                                                        })}
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

export default AdminPaymentsPage;
