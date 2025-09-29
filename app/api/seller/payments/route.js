import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/dbConnect.js";
import Payment from "@/model/Payment.js";

export async function GET(request) {
        try {
                await dbConnect();

                const token = request.cookies.get("seller-auth-token")?.value;

                if (!token) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const sellerId = decoded.userId;

                const { searchParams } = new URL(request.url);
                const page = Number.parseInt(searchParams.get("page")) || 1;
                const limit = Number.parseInt(searchParams.get("limit")) || 10;
                const status = searchParams.get("status") || "";
                const search = searchParams.get("search") || "";
                const startDate = searchParams.get("startDate");
                const endDate = searchParams.get("endDate");

                const query = { sellerId: new mongoose.Types.ObjectId(sellerId) };

                if (status && status !== "all") {
                        query.status = status;
                }

                if (search) {
                        query.$or = [
                                { orderNumber: { $regex: search, $options: "i" } },
                                { "sellerSnapshot.name": { $regex: search, $options: "i" } },
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

                const [stats] = await Payment.aggregate([
                        { $match: { sellerId: new mongoose.Types.ObjectId(sellerId) } },
                        {
                                $group: {
                                        _id: null,
                                        totalOrders: { $sum: 1 },
                                        escrowAmount: {
                                                $sum: {
                                                        $cond: [{ $eq: ["$status", "escrow"] }, "$sellerAmount", 0],
                                                },
                                        },
                                        releasedAmount: {
                                                $sum: {
                                                        $cond: [{ $eq: ["$status", "released"] }, "$sellerAmount", 0],
                                                },
                                        },
                                        commissionPaid: { $sum: "$commissionAmount" },
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
                                commissionPaid: stats?.commissionPaid || 0,
                        },
                });
        } catch (error) {
                console.error("Error fetching seller payments:", error);
                return NextResponse.json(
                        { success: false, message: error.message || "Failed to fetch payments" },
                        { status: 500 }
                );
        }
}
