import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/dbConnect.js";
import Payment from "@/model/Payment.js";

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
                const page = Number.parseInt(searchParams.get("page")) || 1;
                const limit = Number.parseInt(searchParams.get("limit")) || 10;
                const status = searchParams.get("status") || "";
                const sellerId = searchParams.get("sellerId") || "";
                const search = searchParams.get("search") || "";
                const startDate = searchParams.get("startDate");
                const endDate = searchParams.get("endDate");

                const query = {};

                if (status && status !== "all") {
                        query.status = status;
                }

                if (sellerId) {
                        query.sellerId = new mongoose.Types.ObjectId(sellerId);
                }

                if (search) {
                        query.$or = [
                                { orderNumber: { $regex: search, $options: "i" } },
                                { "sellerSnapshot.name": { $regex: search, $options: "i" } },
                                { "sellerSnapshot.email": { $regex: search, $options: "i" } },
                        ];
                }

                if (startDate && endDate) {
                        query.createdAt = {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate),
                        };
                }

                const skip = (page - 1) * limit;

                const [payments, total] = await Promise.all([
                        Payment.find(query)
                                .sort({ createdAt: -1 })
                                .skip(skip)
                                .limit(limit)
                                .lean(),
                        Payment.countDocuments(query),
                ]);

                payments.sort((a, b) => {
                        const priority = (status) => (status === "admin_approval" ? 0 : 1);
                        const priorityDifference = priority(a.status) - priority(b.status);

                        if (priorityDifference !== 0) {
                                return priorityDifference;
                        }

                        const dateA = new Date(a.escrowActivatedAt || a.createdAt || 0).getTime();
                        const dateB = new Date(b.escrowActivatedAt || b.createdAt || 0).getTime();

                        return dateB - dateA;
                });

                const statsMatch = { ...query };

                if (statsMatch.status) {
                        delete statsMatch.status;
                }

                const [stats] = await Payment.aggregate([
                        { $match: statsMatch },
                        {
                                $group: {
                                        _id: null,
                                        totalOrders: { $sum: 1 },
                                        escrowAmount: {
                                                $sum: {
                                                        $cond: [
                                                                {
                                                                        $in: ["$status", ["escrow", "admin_approval"]],
                                                                },
                                                                "$sellerAmount",
                                                                0,
                                                        ],
                                                },
                                        },
                                        releasedAmount: {
                                                $sum: {
                                                        $cond: [{ $eq: ["$status", "released"] }, "$sellerAmount", 0],
                                                },
                                        },
                                        commissionEarned: { $sum: "$commissionAmount" },
                                },
                        },
                ]);

                return NextResponse.json({
                        success: true,
                        payments,
                        pagination: {
                                currentPage: page,
                                totalPages: Math.ceil(total / limit) || 1,
                                totalRecords: total,
                                hasNext: page < Math.ceil(total / limit),
                                hasPrev: page > 1,
                        },
                        stats: {
                                totalOrders: stats?.totalOrders || 0,
                                escrowAmount: stats?.escrowAmount || 0,
                                releasedAmount: stats?.releasedAmount || 0,
                                commissionEarned: stats?.commissionEarned || 0,
                        },
                });
        } catch (error) {
                console.error("Error fetching admin payments:", error);
                return NextResponse.json(
                        { success: false, message: error.message || "Failed to fetch payments" },
                        { status: 500 }
                );
        }
}
