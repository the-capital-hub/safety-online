"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
        Card,
        CardContent,
        CardHeader,
        CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
        IndianRupee,
        ShieldCheck,
        Wallet,
        Users,
        Calendar,
        Search,
        RotateCcw,
        Download,
        ListChecks,
        ClipboardCheck,
} from "lucide-react";

import { useAdminPaymentStore } from "@/store/adminPaymentStore.js";
import { useAdminManualPayoutStore } from "@/store/adminManualPayoutStore.js";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";

const STATUS_OPTIONS = [
        { label: "All", value: "all" },
        { label: "In Escrow", value: "escrow" },
        { label: "Released", value: "released" },
        { label: "Refunded", value: "refunded" },
        { label: "Cancelled", value: "cancelled" },
        { label: "Disputed", value: "disputed" },
];

const MANUAL_STATUS_OPTIONS = [
        { label: "All", value: "all" },
        { label: "Pending", value: "pending" },
        { label: "Scheduled", value: "scheduled" },
        { label: "Paid", value: "paid" },
];

const statusStyles = {
        escrow: "bg-amber-100 text-amber-800",
        released: "bg-emerald-100 text-emerald-800",
        refunded: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800",
        disputed: "bg-purple-100 text-purple-800",
};

const manualStatusStyles = {
        pending: "bg-orange-100 text-orange-700",
        scheduled: "bg-blue-100 text-blue-700",
        paid: "bg-emerald-100 text-emerald-700",
};

const initialManualUpdateForm = {
        status: "scheduled",
        paymentDate: "",
        reference: "",
        amount: "",
        notes: "",
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

const getBankDisplay = (bankDetails) => {
        if (!bankDetails) {
                return "No bank details";
        }

        const parts = [
                bankDetails.accountHolderName,
                bankDetails.bankName,
                bankDetails.accountNumber ? `A/C ${bankDetails.accountNumber}` : null,
                bankDetails.ifscCode ? `IFSC ${bankDetails.ifscCode}` : null,
                bankDetails.upiId ? `UPI ${bankDetails.upiId}` : null,
        ].filter(Boolean);

        return parts.join(" • ");
};

function AdminPaymentsPage() {
        const router = useRouter();
        const isAuthenticated = useIsAuthenticated();
        const [activeTab, setActiveTab] = useState("escrow");
        const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
        const [manualUpdateForm, setManualUpdateForm] = useState(initialManualUpdateForm);

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
        } = useAdminPaymentStore((state) => ({
                payments: state.payments,
                loading: state.loading,
                error: state.error,
                stats: state.stats,
                pagination: state.pagination,
                filters: state.filters,
                setFilters: state.setFilters,
                resetFilters: state.resetFilters,
                fetchPayments: state.fetchPayments,
        }));

        const {
                sellers: manualSellers,
                loading: manualLoading,
                error: manualError,
                stats: manualStats,
                pagination: manualPagination,
                filters: manualFilters,
                selectedSellerIds,
                setFilters: setManualFilters,
                resetFilters: resetManualFilters,
                fetchSellers: fetchManualSellers,
                toggleSellerSelection,
                selectAllOnPage,
                clearSelection,
                downloadCsv,
                bulkUpdateStatus,
                updating: manualUpdating,
        } = useAdminManualPayoutStore((state) => ({
                sellers: state.sellers,
                loading: state.loading,
                error: state.error,
                stats: state.stats,
                pagination: state.pagination,
                filters: state.filters,
                selectedSellerIds: state.selectedSellerIds,
                setFilters: state.setFilters,
                resetFilters: state.resetFilters,
                fetchSellers: state.fetchSellers,
                toggleSellerSelection: state.toggleSellerSelection,
                selectAllOnPage: state.selectAllOnPage,
                clearSelection: state.clearSelection,
                downloadCsv: state.downloadCsv,
                bulkUpdateStatus: state.bulkUpdateStatus,
                updating: state.updating,
        }));

        useEffect(() => {
                if (!isAuthenticated) {
                        const timeout = setTimeout(() => router.push("/admin/login"), 100);
                        return () => clearTimeout(timeout);
                }
        }, [isAuthenticated, router]);

        const escrowFiltersKey = useMemo(() => JSON.stringify(filters), [filters]);
        const manualFiltersKey = useMemo(() => JSON.stringify(manualFilters), [manualFilters]);

        const lastEscrowFiltersRef = useRef(null);
        const lastManualFiltersRef = useRef(null);

        useEffect(() => {
                if (activeTab !== "escrow") {
                        lastEscrowFiltersRef.current = null;
                }
                if (activeTab !== "manual") {
                        lastManualFiltersRef.current = null;
                }
        }, [activeTab]);

        useEffect(() => {
                if (!isAuthenticated || activeTab !== "escrow") {
                        return;
                }

                if (lastEscrowFiltersRef.current === escrowFiltersKey) {
                        return;
                }

                lastEscrowFiltersRef.current = escrowFiltersKey;
                fetchPayments();
        }, [isAuthenticated, activeTab, escrowFiltersKey, fetchPayments]);

        useEffect(() => {
                if (!isAuthenticated || activeTab !== "manual") {
                        return;
                }

                if (lastManualFiltersRef.current === manualFiltersKey) {
                        return;
                }

                lastManualFiltersRef.current = manualFiltersKey;
                fetchManualSellers();
        }, [isAuthenticated, activeTab, manualFiltersKey, fetchManualSellers]);

        const handleFilterChange = (key, value) => {
                setFilters({ [key]: value, page: 1 });
        };

        const handleManualFilterChange = (key, value) => {
                setManualFilters({ [key]: value, page: 1 });
        };

        const handleSearchSubmit = (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const searchValue = formData.get("search")?.toString() || "";
                setFilters({ search: searchValue.trim(), page: 1 });
        };

        const handleManualSearchSubmit = (event) => {
                event.preventDefault();
                const formData = new FormData(event.currentTarget);
                const searchValue = formData.get("search")?.toString() || "";
                setManualFilters({ search: searchValue.trim(), page: 1 });
        };

        const handlePageChange = (page) => {
                if (page < 1 || page > pagination.totalPages) return;
                setFilters({ page });
        };

        const handleManualPageChange = (page) => {
                if (page < 1 || page > manualPagination.totalPages) return;
                setManualFilters({ page });
        };

        const handleDownloadManualCsv = async () => {
                try {
                        await downloadCsv();
                        toast.success("Manual payout report downloaded");
                } catch (downloadError) {
                        toast.error(downloadError.message || "Failed to download report");
                }
        };

        const handleOpenManualUpdate = () => {
                if (selectedSellerIds.length === 0) {
                        toast.error("Select at least one seller");
                        return;
                }
                setIsUpdateDialogOpen(true);
        };

        const handleManualUpdateSubmit = async (event) => {
                event.preventDefault();

                const payload = {
                        sellerIds: selectedSellerIds,
                        status: manualUpdateForm.status,
                        paymentDate: manualUpdateForm.paymentDate || null,
                        reference: manualUpdateForm.reference.trim() || null,
                        amount:
                                manualUpdateForm.amount && !Number.isNaN(Number.parseFloat(manualUpdateForm.amount))
                                        ? Number.parseFloat(manualUpdateForm.amount)
                                        : null,
                        notes: manualUpdateForm.notes.trim() || "",
                };

                try {
                        await bulkUpdateStatus(payload);
                        toast.success(`Updated manual payouts for ${selectedSellerIds.length} seller${
                                selectedSellerIds.length > 1 ? "s" : ""
                        }`);
                        setManualUpdateForm(initialManualUpdateForm);
                        setIsUpdateDialogOpen(false);
                } catch (updateError) {
                        toast.error(updateError.message || "Failed to update manual payouts");
                }
        };

        const manualSelectionState = useMemo(() => {
                const allSelected =
                        manualSellers.length > 0 &&
                        manualSellers.every((seller) => selectedSellerIds.includes(seller.sellerId));
                const partiallySelected =
                        selectedSellerIds.length > 0 && !allSelected && manualSellers.some((seller) => selectedSellerIds.includes(seller.sellerId));

                if (allSelected) return true;
                if (partiallySelected) return "indeterminate";
                return false;
        }, [manualSellers, selectedSellerIds]);

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
                                className="space-y-2"
                        >
                                <h1 className="text-3xl font-bold text-gray-900">Payment Operations Center</h1>
                                <p className="text-gray-600">
                                        Switch between Razorpay escrow settlements and manual seller payouts to keep every
                                        disbursement on track.
                                </p>
                        </motion.div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                                <TabsList>
                                        <TabsTrigger value="escrow">Escrow Settlements</TabsTrigger>
                                        <TabsTrigger value="manual">Manual Payouts</TabsTrigger>
                                </TabsList>

                                <TabsContent value="escrow" className="space-y-6">
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
                                                                                onBlur={(event) => handleFilterChange("sellerId", event.target.value.trim())}
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
                                </TabsContent>

                                <TabsContent value="manual" className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                                <Card>
                                                        <CardContent className="p-6">
                                                                <div className="flex items-center">
                                                                        <Users className="h-8 w-8 text-indigo-600" />
                                                                        <div className="ml-4">
                                                                                <p className="text-sm font-medium text-gray-600">Sellers in Manual Cycle</p>
                                                                                <p className="text-2xl font-bold text-gray-900">
                                                                                        {manualStats.totalSellers}
                                                                                </p>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                                <Card>
                                                        <CardContent className="p-6">
                                                                <div className="flex items-center">
                                                                        <Wallet className="h-8 w-8 text-orange-500" />
                                                                        <div className="ml-4">
                                                                                <p className="text-sm font-medium text-gray-600">Pending Payout</p>
                                                                                <p className="text-2xl font-bold text-gray-900">
                                                                                        {formatCurrency(manualStats.pendingAmount)}
                                                                                </p>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                                <Card>
                                                        <CardContent className="p-6">
                                                                <div className="flex items-center">
                                                                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                                                                        <div className="ml-4">
                                                                                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                                                                                <p className="text-2xl font-bold text-gray-900">
                                                                                        {formatCurrency(manualStats.scheduledAmount)}
                                                                                </p>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                                <Card>
                                                        <CardContent className="p-6">
                                                                <div className="flex items-center">
                                                                        <IndianRupee className="h-8 w-8 text-emerald-600" />
                                                                        <div className="ml-4">
                                                                                <p className="text-sm font-medium text-gray-600">Paid Out</p>
                                                                                <p className="text-2xl font-bold text-gray-900">
                                                                                        {formatCurrency(manualStats.paidAmount)}
                                                                                </p>
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </div>

                                        <Card>
                                                <CardHeader className="pb-2">
                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                                <CardTitle className="text-xl font-semibold">
                                                                        Manual Seller Payouts
                                                                </CardTitle>
                                                                <div className="flex flex-wrap gap-2">
                                                                        <Button variant="outline" onClick={handleDownloadManualCsv}>
                                                                                <Download className="mr-2 h-4 w-4" /> Download CSV
                                                                        </Button>
                                                                        <Button onClick={handleOpenManualUpdate} disabled={selectedSellerIds.length === 0}>
                                                                                <ListChecks className="mr-2 h-4 w-4" /> Update Status
                                                                        </Button>
                                                                </div>
                                                        </div>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                                <form
                                                                        onSubmit={handleManualSearchSubmit}
                                                                        className="col-span-12 lg:col-span-4 flex items-center space-x-2"
                                                                >
                                                                        <div className="relative flex-1">
                                                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                                                                <Input
                                                                                        name="search"
                                                                                        defaultValue={manualFilters.search}
                                                                                        placeholder="Search seller name or email"
                                                                                        className="pl-9"
                                                                                />
                                                                        </div>
                                                                        <Button type="submit" variant="outline">
                                                                                Search
                                                                        </Button>
                                                                </form>
                                                                <div className="col-span-6 lg:col-span-3">
                                                                        <Select
                                                                                value={manualFilters.status}
                                                                                onValueChange={(value) => handleManualFilterChange("status", value)}
                                                                        >
                                                                                <SelectTrigger>
                                                                                        <SelectValue placeholder="Status" />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                        {MANUAL_STATUS_OPTIONS.map((option) => (
                                                                                                <SelectItem key={option.value} value={option.value}>
                                                                                                        {option.label}
                                                                                                </SelectItem>
                                                                                        ))}
                                                                                </SelectContent>
                                                                        </Select>
                                                                </div>
                                                                <div className="col-span-6 lg:col-span-2">
                                                                        <Input
                                                                                type="date"
                                                                                value={manualFilters.startDate || ""}
                                                                                onChange={(event) => handleManualFilterChange("startDate", event.target.value)}
                                                                        />
                                                                </div>
                                                                <div className="col-span-6 lg:col-span-2">
                                                                        <Input
                                                                                type="date"
                                                                                value={manualFilters.endDate || ""}
                                                                                onChange={(event) => handleManualFilterChange("endDate", event.target.value)}
                                                                        />
                                                                </div>
                                                                <div className="col-span-6 lg:col-span-1 flex justify-end">
                                                                        <Button type="button" variant="outline" className="w-full" onClick={() => resetManualFilters()}>
                                                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                                                Reset
                                                                        </Button>
                                                                </div>
                                                        </div>

                                                        <div className="overflow-x-auto">
                                                                <Table>
                                                                        <TableHeader>
                                                                                <TableRow>
                                                                                        <TableHead className="w-12">
                                                                                                <Checkbox
                                                                                                        checked={manualSelectionState}
                                                                                                        onCheckedChange={(checked) => {
                                                                                                                if (checked) {
                                                                                                                        selectAllOnPage();
                                                                                                                } else {
                                                                                                                        clearSelection();
                                                                                                                }
                                                                                                        }}
                                                                                                        aria-label="Select all sellers"
                                                                                                />
                                                                                        </TableHead>
                                                                                        <TableHead>Seller</TableHead>
                                                                                        <TableHead>Status</TableHead>
                                                                                        <TableHead>Pending</TableHead>
                                                                                        <TableHead>Scheduled</TableHead>
                                                                                        <TableHead>Paid</TableHead>
                                                                                        <TableHead>Total Orders</TableHead>
                                                                                        <TableHead>Last Order</TableHead>
                                                                                        <TableHead>Bank Details</TableHead>
                                                                                        <TableHead>Notes</TableHead>
                                                                                </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                                {manualLoading && (
                                                                                        <TableRow>
                                                                                                <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                                                                                                        Loading manual payouts...
                                                                                                </TableCell>
                                                                                        </TableRow>
                                                                                )}
                                                                                {!manualLoading && manualError && (
                                                                                        <TableRow>
                                                                                                <TableCell colSpan={10} className="text-center py-6 text-red-500">
                                                                                                        {manualError}
                                                                                                </TableCell>
                                                                                        </TableRow>
                                                                                )}
                                                                                {!manualLoading && !manualError && manualSellers.length === 0 && (
                                                                                        <TableRow>
                                                                                                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                                                                                        No manual payouts found for the selected filters.
                                                                                                </TableCell>
                                                                                        </TableRow>
                                                                                )}
                                                                                {!manualLoading && !manualError &&
                                                                                        manualSellers.map((seller) => (
                                                                                                <TableRow key={seller.sellerId}>
                                                                                                        <TableCell>
                                                                                                                <Checkbox
                                                                                                                        checked={selectedSellerIds.includes(seller.sellerId)}
                                                                                                                        onCheckedChange={(checked) =>
                                                                                                                                toggleSellerSelection(seller.sellerId, checked === true)
                                                                                                                        }
                                                                                                                        aria-label={`Select seller ${
                                                                                                                                seller.sellerSnapshot?.businessName || seller.sellerSnapshot?.name
                                                                                                                        }`}
                                                                                                                />
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                                <div className="font-medium text-gray-900">
                                                                                                                        {seller.sellerSnapshot?.businessName || seller.sellerSnapshot?.name || "Unknown Seller"}
                                                                                                                </div>
                                                                                                                {seller.sellerSnapshot?.email && (
                                                                                                                        <div className="text-xs text-gray-500">
                                                                                                                                {seller.sellerSnapshot.email}
                                                                                                                        </div>
                                                                                                                )}
                                                                                                        </TableCell>
                                                                                                        <TableCell>
                                                                                                                <Badge className={manualStatusStyles[seller.status] || "bg-gray-100 text-gray-800"}>
                                                                                                                        {seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}
                                                                                                                </Badge>
                                                                                                        </TableCell>
                                                                                                        <TableCell>{formatCurrency(seller.pendingAmount)}</TableCell>
                                                                                                        <TableCell>{formatCurrency(seller.scheduledAmount)}</TableCell>
                                                                                                        <TableCell>{formatCurrency(seller.paidAmount)}</TableCell>
                                                                                                        <TableCell>{seller.totalOrders}</TableCell>
                                                                                                        <TableCell>{formatDate(seller.lastOrderDate)}</TableCell>
                                                                                                        <TableCell className="text-xs text-gray-600 max-w-xs">
                                                                                                                {getBankDisplay(seller.bankDetails)}
                                                                                                        </TableCell>
                                                                                                        <TableCell className="text-xs text-gray-600 max-w-xs">
                                                                                                                {seller.manualNotes || "—"}
                                                                                                        </TableCell>
                                                                                                </TableRow>
                                                                                        ))}
                                                                        </TableBody>
                                                                </Table>
                                                        </div>

                                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                                <p className="text-sm text-gray-600">
                                                                        Showing page {manualPagination.currentPage} of {manualPagination.totalPages} — {" "}
                                                                        {manualPagination.totalRecords} sellers
                                                                </p>
                                                                <div className="flex gap-2">
                                                                        <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={!manualPagination.hasPrev}
                                                                                onClick={() => handleManualPageChange(manualPagination.currentPage - 1)}
                                                                        >
                                                                                Previous
                                                                        </Button>
                                                                        {Array.from({ length: Math.min(5, manualPagination.totalPages) }, (_, index) => {
                                                                                const pageNumber = index + 1;
                                                                                return (
                                                                                        <Button
                                                                                                key={pageNumber}
                                                                                                size="sm"
                                                                                                variant={
                                                                                                        manualPagination.currentPage === pageNumber
                                                                                                                ? "default"
                                                                                                                : "outline"
                                                                                                }
                                                                                                onClick={() => handleManualPageChange(pageNumber)}
                                                                                        >
                                                                                                {pageNumber}
                                                                                        </Button>
                                                                                );
                                                                        })}
                                                                        <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                disabled={!manualPagination.hasNext}
                                                                                onClick={() => handleManualPageChange(manualPagination.currentPage + 1)}
                                                                        >
                                                                                Next
                                                                        </Button>
                                                                </div>
                                                        </div>
                                                </CardContent>
                                        </Card>
                                </TabsContent>
                        </Tabs>

                        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                                <DialogContent>
                                        <form onSubmit={handleManualUpdateSubmit} className="space-y-4">
                                                <DialogHeader>
                                                        <DialogTitle>Update manual payouts</DialogTitle>
                                                        <DialogDescription>
                                                                Apply a payout status update to {selectedSellerIds.length} selected seller
                                                                {selectedSellerIds.length > 1 ? "s" : ""}.
                                                        </DialogDescription>
                                                </DialogHeader>

                                                <div className="grid grid-cols-1 gap-4">
                                                        <div>
                                                                <label className="text-sm font-medium text-gray-700">Status</label>
                                                                <Select
                                                                        value={manualUpdateForm.status}
                                                                        onValueChange={(value) =>
                                                                                setManualUpdateForm((prev) => ({ ...prev, status: value }))
                                                                        }
                                                                >
                                                                        <SelectTrigger className="mt-1">
                                                                                <SelectValue placeholder="Select status" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                                {MANUAL_STATUS_OPTIONS.filter((option) => option.value !== "all").map(
                                                                                        (option) => (
                                                                                                <SelectItem key={option.value} value={option.value}>
                                                                                                        {option.label}
                                                                                                </SelectItem>
                                                                                        )
                                                                                )}
                                                                        </SelectContent>
                                                                </Select>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                        <label className="text-sm font-medium text-gray-700">Payment date</label>
                                                                        <Input
                                                                                type="date"
                                                                                value={manualUpdateForm.paymentDate}
                                                                                onChange={(event) =>
                                                                                        setManualUpdateForm((prev) => ({
                                                                                                ...prev,
                                                                                                paymentDate: event.target.value,
                                                                                        }))
                                                                                }
                                                                                className="mt-1"
                                                                        />
                                                                </div>
                                                                <div>
                                                                        <label className="text-sm font-medium text-gray-700">Reference / UTR</label>
                                                                        <Input
                                                                                value={manualUpdateForm.reference}
                                                                                onChange={(event) =>
                                                                                        setManualUpdateForm((prev) => ({
                                                                                                ...prev,
                                                                                                reference: event.target.value,
                                                                                        }))
                                                                                }
                                                                                placeholder="Bank reference number"
                                                                                className="mt-1"
                                                                        />
                                                                </div>
                                                        </div>
                                                        <div>
                                                                <label className="text-sm font-medium text-gray-700">Amount (optional)</label>
                                                                <Input
                                                                        value={manualUpdateForm.amount}
                                                                        onChange={(event) =>
                                                                                setManualUpdateForm((prev) => ({
                                                                                        ...prev,
                                                                                        amount: event.target.value,
                                                                                }))
                                                                        }
                                                                        placeholder="Enter amount paid"
                                                                        className="mt-1"
                                                                />
                                                        </div>
                                                        <div>
                                                                <label className="text-sm font-medium text-gray-700">Notes</label>
                                                                <Textarea
                                                                        value={manualUpdateForm.notes}
                                                                        onChange={(event) =>
                                                                                setManualUpdateForm((prev) => ({
                                                                                        ...prev,
                                                                                        notes: event.target.value,
                                                                                }))
                                                                        }
                                                                        placeholder="Add internal notes for this payout update"
                                                                        className="mt-1"
                                                                        rows={4}
                                                                />
                                                        </div>
                                                </div>

                                                <DialogFooter>
                                                        <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => {
                                                                        setManualUpdateForm(initialManualUpdateForm);
                                                                        setIsUpdateDialogOpen(false);
                                                                }}
                                                        >
                                                                Cancel
                                                        </Button>
                                                        <Button type="submit" disabled={manualUpdating}>
                                                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                                                {manualUpdating ? "Updating..." : "Apply update"}
                                                        </Button>
                                                </DialogFooter>
                                        </form>
                                </DialogContent>
                        </Dialog>
                </div>
        );
}

export default AdminPaymentsPage;
