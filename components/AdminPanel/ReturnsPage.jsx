"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, RotateCcw, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

import { useAdminReturnStore } from "@/store/adminReturnStore";
import { ReturnDetailsDialog } from "@/components/AdminPanel/Popups/ReturnDetailsDialog";

const STATUS_BADGES = {
        pending: "bg-amber-100 text-amber-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        processing: "bg-blue-100 text-blue-800",
        completed: "bg-gray-100 text-gray-800",
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

const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
        });
};

export function ReturnsPage() {
        const {
                requests,
                loading,
                error,
                fetchReturnRequests,
                updateReturnStatus,
                updatingRequestId,
                returnSettings,
                fetchReturnSettings,
        } = useAdminReturnStore();

        const [detailsOpen, setDetailsOpen] = useState(false);
        const [selectedRequest, setSelectedRequest] = useState(null);

        useEffect(() => {
                fetchReturnRequests();
                fetchReturnSettings();
        }, [fetchReturnRequests, fetchReturnSettings]);

        const summary = useMemo(() => {
                const initial = {
                        total: requests.length,
                        pending: 0,
                        approved: 0,
                        rejected: 0,
                        refundVolume: 0,
                };

                return requests.reduce((acc, request) => {
                        acc.refundVolume += Number(request.refundAmount) || 0;
                        const status = request.status?.toLowerCase();
                        if (status && acc[status] !== undefined) {
                                acc[status] += 1;
                        }
                        return acc;
                }, initial);
        }, [requests]);

        const openDetails = (request) => {
                setSelectedRequest(request);
                setDetailsOpen(true);
        };

        const handleStatusUpdate = async (requestId, status, successMessage) => {
                const result = await updateReturnStatus(requestId, { status });

                if (result.success) {
                        toast.success(successMessage);
                } else {
                        toast.error(result.message || "Failed to update return request");
                }
        };

        return (
                <div className="space-y-6">
                        <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                        >
                                <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Return requests</h1>
                                        <p className="text-sm text-muted-foreground">
                                                Manage buyer-initiated returns and keep customers informed.
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                                Use the enable/disable button in the{" "}
                                                <Link href="/admin/settings" className="font-medium text-primary">
                                                        settings panel
                                                </Link>
                                                to control buyer return submissions.
                                        </p>
                                </div>
                                <div className="flex items-center gap-3">
                                        <Badge variant={returnSettings?.enabled ? "default" : "secondary"}>
                                                Returns {returnSettings?.enabled ? "enabled" : "disabled"}
                                        </Badge>
                                        <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={fetchReturnRequests}
                                                disabled={loading}
                                                className="flex items-center gap-2"
                                        >
                                                <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
                                                Refresh
                                        </Button>
                                </div>
                        </motion.div>

                        <div className="grid gap-4 md:grid-cols-3">
                                <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Pending returns</CardTitle>
                                                <RotateCcw className="h-5 w-5 text-amber-500" />
                                        </CardHeader>
                                        <CardContent>
                                                <div className="text-3xl font-bold">{summary.pending}</div>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                        </CardHeader>
                                        <CardContent>
                                                <div className="text-3xl font-bold">{summary.approved}</div>
                                        </CardContent>
                                </Card>
                                <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">Refund volume</CardTitle>
                                                <ShieldAlert className="h-5 w-5 text-blue-500" />
                                        </CardHeader>
                                        <CardContent>
                                                <div className="text-3xl font-bold">{formatCurrency(summary.refundVolume)}</div>
                                        </CardContent>
                                </Card>
                        </div>

                        <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>All return requests</CardTitle>
                                        <div className="text-sm text-muted-foreground">
                                                Showing {requests.length} requests
                                        </div>
                                </CardHeader>
                                <CardContent>
                                        {loading ? (
                                                <div className="flex min-h-[200px] items-center justify-center">
                                                        <Loader2 className="h-6 w-6 animate-spin" />
                                                </div>
                                        ) : error ? (
                                                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                                        {error}
                                                </div>
                                        ) : requests.length === 0 ? (
                                                <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                                                        No return requests recorded yet.
                                                </div>
                                        ) : (
                                                <Table>
                                                        <TableHeader>
                                                                <TableRow>
                                                                        <TableHead>Return ID</TableHead>
                                                                        <TableHead>Order</TableHead>
                                                                        <TableHead>Customer</TableHead>
                                                                        <TableHead>Seller</TableHead>
                                                                        <TableHead>Status</TableHead>
                                                                        <TableHead>Requested</TableHead>
                                                                        <TableHead>Refund</TableHead>
                                                                        <TableHead className="text-right">Actions</TableHead>
                                                                </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                                {requests.map((request) => (
                                                                        <TableRow key={request._id}>
                                                                                <TableCell className="font-medium">
                                                                                        <div className="flex flex-col">
                                                                                                <span>{request._id}</span>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                        Sub-order {request.subOrderId?._id}
                                                                                                </span>
                                                                                        </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                        <div className="flex flex-col">
                                                                                                <span className="font-medium">
                                                                                                        {request.orderId?.orderNumber || "—"}
                                                                                                </span>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                        {request.reason}
                                                                                                </span>
                                                                                        </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                        <div className="flex flex-col">
                                                                                                <span>{request.orderId?.customerName || "—"}</span>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                        {request.orderId?.customerEmail}
                                                                                                </span>
                                                                                        </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                        <div className="flex flex-col">
                                                                                                <span>{request.sellerId?.businessName || request.sellerId?.name || "—"}</span>
                                                                                                <span className="text-xs text-muted-foreground">
                                                                                                        {request.sellerId?.email}
                                                                                                </span>
                                                                                        </div>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                        <Badge className={STATUS_BADGES[request.status] || "bg-gray-100 text-gray-800"}>
                                                                                                {request.status?.toUpperCase()}
                                                                                        </Badge>
                                                                                </TableCell>
                                                                                <TableCell>{formatDate(request.requestedAt || request.createdAt)}</TableCell>
                                                                                <TableCell>{formatCurrency(request.refundAmount)}</TableCell>
                                                                                <TableCell className="flex justify-end gap-2">
                                                                                        <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={() => openDetails(request)}
                                                                                        >
                                                                                                View
                                                                                        </Button>
                                                                                        <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={() =>
                                                                                                        handleStatusUpdate(
                                                                                                                request._id,
                                                                                                                "approved",
                                                                                                                "Return marked as approved"
                                                                                                        )
                                                                                                }
                                                                                                disabled={updatingRequestId === request._id}
                                                                                        >
                                                                                                Approve
                                                                                        </Button>
                                                                                        <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                onClick={() =>
                                                                                                        handleStatusUpdate(
                                                                                                                request._id,
                                                                                                                "completed",
                                                                                                                "Return marked as completed"
                                                                                                        )
                                                                                                }
                                                                                                disabled={updatingRequestId === request._id}
                                                                                        >
                                                                                                Complete
                                                                                        </Button>
                                                                                        <Button
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                className="text-red-600 hover:text-red-700"
                                                                                                onClick={() =>
                                                                                                        handleStatusUpdate(
                                                                                                                request._id,
                                                                                                                "rejected",
                                                                                                                "Return request rejected"
                                                                                                        )
                                                                                                }
                                                                                                disabled={updatingRequestId === request._id}
                                                                                        >
                                                                                                <XCircle className="mr-1 h-4 w-4" />
                                                                                                Reject
                                                                                        </Button>
                                                                                </TableCell>
                                                                        </TableRow>
                                                                ))}
                                                        </TableBody>
                                                </Table>
                                        )}
                                </CardContent>
                        </Card>

                        <ReturnDetailsDialog
                                open={detailsOpen}
                                onOpenChange={setDetailsOpen}
                                request={selectedRequest}
                        />
                </div>
        );
}
