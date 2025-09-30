import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/dbConnect.js";
import Payment from "@/model/Payment.js";

const ALLOWED_MANUAL_STATUSES = new Set(["pending", "scheduled", "paid"]);

const toObjectId = (value) => {
        if (!value) return null;
        try {
                return new mongoose.Types.ObjectId(value);
        } catch (error) {
                return null;
        }
};

const escapeCsv = (value) => {
        if (value === null || typeof value === "undefined") return "";
        const stringValue = String(value ?? "");
        if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
};

const buildAggregation = async ({ status, search, startDate, endDate }) => {
        const matchStage = { payoutMode: "manual" };

        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && !Number.isNaN(start.getTime()) && end && !Number.isNaN(end.getTime())) {
                matchStage.createdAt = {
                        $gte: start,
                        $lte: end,
                };
        } else if (start && !Number.isNaN(start.getTime())) {
                matchStage.createdAt = {
                        $gte: start,
                };
        } else if (end && !Number.isNaN(end.getTime())) {
                matchStage.createdAt = {
                        $lte: end,
                };
        }

        if (status && status !== "all" && ALLOWED_MANUAL_STATUSES.has(status)) {
                matchStage.manualStatus = status;
        }

        if (search) {
                matchStage.$or = [
                        { "sellerSnapshot.name": { $regex: search, $options: "i" } },
                        { "sellerSnapshot.email": { $regex: search, $options: "i" } },
                        { "sellerSnapshot.businessName": { $regex: search, $options: "i" } },
                ];
        }

        const aggregation = await Payment.aggregate([
                { $match: matchStage },
                {
                        $group: {
                                _id: "$sellerId",
                                sellerSnapshot: { $first: "$sellerSnapshot" },
                                totalOrders: { $sum: 1 },
                                totalAmount: { $sum: "$sellerAmount" },
                                pendingAmount: {
                                        $sum: {
                                                $cond: [{ $eq: ["$manualStatus", "pending"] }, "$sellerAmount", 0],
                                        },
                                },
                                scheduledAmount: {
                                        $sum: {
                                                $cond: [{ $eq: ["$manualStatus", "scheduled"] }, "$sellerAmount", 0],
                                        },
                                },
                                paidAmount: {
                                        $sum: {
                                                $cond: [{ $eq: ["$manualStatus", "paid"] }, "$sellerAmount", 0],
                                        },
                                },
                                paymentIds: { $push: "$_id" },
                                lastOrderDate: { $max: "$createdAt" },
                                manualNotes: { $addToSet: "$manualNotes" },
                                manualStatusSet: { $addToSet: "$manualStatus" },
                        },
                },
                {
                        $lookup: {
                                from: "companies",
                                let: { sellerId: "$_id" },
                                pipeline: [
                                        { $match: { $expr: { $eq: ["$user", "$$sellerId"] } } },
                                        { $project: { bankDetails: 1 } },
                                ],
                                as: "company",
                        },
                },
                {
                        $addFields: {
                                company: { $first: "$company" },
                        },
                },
                {
                        $addFields: {
                                bankDetails: "$company.bankDetails",
                                manualNotes: {
                                        $first: {
                                                $filter: {
                                                        input: "$manualNotes",
                                                        as: "note",
                                                        cond: {
                                                                $and: [
                                                                        { $ne: ["$$note", null] },
                                                                        { $ne: ["$$note", ""] },
                                                                ],
                                                        },
                                                },
                                        },
                                },
                                status: {
                                        $cond: [
                                                {
                                                        $gt: [
                                                                {
                                                                        $size: {
                                                                                $setIntersection: [
                                                                                        "$manualStatusSet",
                                                                                        ["pending"],
                                                                                ],
                                                                        },
                                                                },
                                                                0,
                                                        ],
                                                },
                                                "pending",
                                                {
                                                        $cond: [
                                                                {
                                                                        $gt: [
                                                                                {
                                                                                        $size: {
                                                                                                $setIntersection: [
                                                                                                        "$manualStatusSet",
                                                                                                        ["scheduled"],
                                                                                                ],
                                                                                        },
                                                                                },
                                                                                0,
                                                                        ],
                                                                },
                                                                "scheduled",
                                                                "paid",
                                                        ],
                                                },
                                        ],
                                },
                        },
                },
                {
                        $addFields: {
                                sellerId: "$_id",
                        },
                },
                {
                        $project: {
                                _id: 0,
                                company: 0,
                                manualStatusSet: 0,
                        },
                },
                {
                        $sort: {
                                pendingAmount: -1,
                                scheduledAmount: -1,
                                totalAmount: -1,
                        },
                },
        ]);

        return aggregation.map((item) => ({
                ...item,
                bankDetails: item.bankDetails || null,
                manualNotes: item.manualNotes || "",
                status: item.status || "pending",
        }));
};

export async function GET(request) {
        try {
                await dbConnect();

                const token = request.cookies.get("admin_token")?.value;

                if (!token) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                jwt.verify(token, process.env.JWT_SECRET);

                const { searchParams } = new URL(request.url);
                const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);
                const limit = Math.min(
                        100,
                        Math.max(1, Number.parseInt(searchParams.get("limit"), 10) || 10)
                );
                const status = (searchParams.get("status") || "all").toLowerCase();
                const search = searchParams.get("search")?.trim() || "";
                const startDate = searchParams.get("startDate")?.trim() || "";
                const endDate = searchParams.get("endDate")?.trim() || "";
                const shouldExport = searchParams.get("export") === "csv";

                const aggregation = await buildAggregation({ status, search, startDate, endDate });

                const totalRecords = aggregation.length;
                const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
                const startIndex = (page - 1) * limit;
                const paginated = shouldExport
                        ? aggregation
                        : aggregation.slice(startIndex, startIndex + limit);

                const stats = aggregation.reduce(
                        (acc, seller) => {
                                acc.totalSellers += 1;
                                acc.pendingAmount += seller.pendingAmount || 0;
                                acc.scheduledAmount += seller.scheduledAmount || 0;
                                acc.paidAmount += seller.paidAmount || 0;
                                return acc;
                        },
                        {
                                totalSellers: 0,
                                pendingAmount: 0,
                                scheduledAmount: 0,
                                paidAmount: 0,
                        }
                );

                if (shouldExport) {
                        const header = [
                                "Seller Name",
                                "Business Name",
                                "Email",
                                "Status",
                                "Total Orders",
                                "Pending Amount",
                                "Scheduled Amount",
                                "Paid Amount",
                                "Bank Account Name",
                                "Bank Account Number",
                                "Bank Name",
                                "IFSC",
                                "UPI ID",
                                "Last Order Date",
                        ];

                        const rows = aggregation.map((seller) => {
                                const bank = seller.bankDetails || {};
                                const lastOrderDate = seller.lastOrderDate
                                        ? new Date(seller.lastOrderDate).toISOString()
                                        : "";

                                return [
                                        escapeCsv(seller.sellerSnapshot?.name || ""),
                                        escapeCsv(seller.sellerSnapshot?.businessName || ""),
                                        escapeCsv(seller.sellerSnapshot?.email || ""),
                                        escapeCsv(seller.status),
                                        escapeCsv(seller.totalOrders),
                                        escapeCsv(seller.pendingAmount.toFixed(2)),
                                        escapeCsv(seller.scheduledAmount.toFixed(2)),
                                        escapeCsv(seller.paidAmount.toFixed(2)),
                                        escapeCsv(bank.accountHolderName || ""),
                                        escapeCsv(bank.accountNumber || ""),
                                        escapeCsv(bank.bankName || ""),
                                        escapeCsv(bank.ifscCode || ""),
                                        escapeCsv(bank.upiId || ""),
                                        escapeCsv(lastOrderDate),
                                ].join(",");
                        });

                        const csvContent = [header.join(","), ...rows].join("\n");

                        return new NextResponse(csvContent, {
                                status: 200,
                                headers: {
                                        "Content-Type": "text/csv",
                                        "Content-Disposition": `attachment; filename="manual-payouts-${Date.now()}.csv"`,
                                },
                        });
                }

                return NextResponse.json({
                        success: true,
                        sellers: paginated,
                        pagination: {
                                currentPage: page,
                                totalPages,
                                totalRecords,
                                hasNext: page < totalPages,
                                hasPrev: page > 1,
                        },
                        stats,
                });
        } catch (error) {
                console.error("Error fetching manual payouts:", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error.message || "Failed to fetch manual payouts",
                        },
                        { status: 500 }
                );
        }
}

export async function PATCH(request) {
        try {
                await dbConnect();

                const token = request.cookies.get("admin_token")?.value;

                if (!token) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const admin = jwt.verify(token, process.env.JWT_SECRET);

                const { updates } = await request.json();

                if (!Array.isArray(updates) || updates.length === 0) {
                        return NextResponse.json(
                                { success: false, message: "No updates provided" },
                                { status: 400 }
                        );
                }

                let modifiedCount = 0;
                const processedSellers = new Set();

                for (const update of updates) {
                        if (!update?.sellerId) continue;

                        const sellerId = toObjectId(update.sellerId);

                        if (!sellerId) continue;

                        const query = {
                                sellerId,
                                payoutMode: "manual",
                        };

                        if (Array.isArray(update.paymentIds) && update.paymentIds.length > 0) {
                                const paymentIds = update.paymentIds
                                        .map((id) => toObjectId(id))
                                        .filter(Boolean);

                                if (paymentIds.length === 0) {
                                        continue;
                                }

                                query._id = { $in: paymentIds };
                        }

                        const setDoc = {};
                        const updateDoc = {};

                        const status =
                                typeof update.status === "string"
                                        ? update.status.trim().toLowerCase()
                                        : "";

                        if (status) {
                                if (!ALLOWED_MANUAL_STATUSES.has(status)) {
                                        continue;
                                }
                                setDoc.manualStatus = status;

                                if (status === "paid") {
                                        const paidAt = update.paymentDate
                                                ? new Date(update.paymentDate)
                                                : new Date();

                                        if (!Number.isNaN(paidAt.getTime())) {
                                                setDoc.manualPaidAt = paidAt;
                                        }
                                } else {
                                        setDoc.manualPaidAt = null;
                                }
                        }

                        if (!status && update.paymentDate) {
                                const manualDate = new Date(update.paymentDate);
                                if (!Number.isNaN(manualDate.getTime())) {
                                        setDoc.manualPaidAt = manualDate;
                                }
                        }

                        if (typeof update.reference === "string") {
                                const reference = update.reference.trim();
                                setDoc.manualPayoutReference = reference || null;
                        }

                        if (typeof update.notes === "string") {
                                setDoc.manualNotes = update.notes;
                        }

                        if (Object.keys(setDoc).length > 0) {
                                updateDoc.$set = setDoc;
                        }

                        const amountNumber =
                                typeof update.amount === "number"
                                        ? update.amount
                                        : typeof update.amount === "string" && update.amount.trim() !== ""
                                        ? Number.parseFloat(update.amount)
                                        : null;

                        const shouldRecordHistory =
                                Boolean(status) ||
                                amountNumber !== null ||
                                (typeof update.reference === "string" && update.reference.trim() !== "") ||
                                (typeof update.notes === "string" && update.notes.trim() !== "") ||
                                Boolean(update.paymentDate);

                        if (shouldRecordHistory) {
                                const processedAtDate = update.paymentDate
                                        ? new Date(update.paymentDate)
                                        : new Date();

                                const historyEntry = {
                                        status: status || undefined,
                                        amount:
                                                Number.isFinite(amountNumber) && !Number.isNaN(amountNumber)
                                                        ? amountNumber
                                                        : undefined,
                                        reference:
                                                typeof update.reference === "string"
                                                        ? update.reference.trim() || undefined
                                                        : undefined,
                                        processedAt: Number.isNaN(processedAtDate.getTime())
                                                ? new Date()
                                                : processedAtDate,
                                        processedBy: admin?.id ? toObjectId(admin.id) : null,
                                        processedByName: [admin?.firstName, admin?.lastName]
                                                .filter(Boolean)
                                                .join(" "),
                                        remarks:
                                                typeof update.notes === "string"
                                                        ? update.notes.trim() || undefined
                                                        : undefined,
                                };

                                const cleanedHistory = Object.fromEntries(
                                        Object.entries(historyEntry).filter(
                                                ([, value]) =>
                                                        value !== undefined && value !== null && value !== ""
                                        )
                                );

                                if (Object.keys(cleanedHistory).length > 0) {
                                        updateDoc.$push = {
                                                manualHistory: cleanedHistory,
                                        };
                                }
                        }

                        if (Object.keys(updateDoc).length === 0) {
                                continue;
                        }

                        const result = await Payment.updateMany(query, updateDoc);
                        modifiedCount += result?.modifiedCount || 0;
                        processedSellers.add(update.sellerId);
                }

                return NextResponse.json({
                        success: true,
                        modifiedCount,
                        processed: processedSellers.size,
                });
        } catch (error) {
                console.error("Error updating manual payouts:", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error.message || "Failed to update manual payouts",
                        },
                        { status: 500 }
                );
        }
}
