import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import { verifyToken } from "@/lib/auth";
import SubOrder from "@/model/SubOrder";
import User from "@/model/User";

const toStartOfDay = (date) => {
        const copy = new Date(date);
        copy.setHours(0, 0, 0, 0);
        return copy;
};

const toEndOfDay = (date) => {
        const copy = new Date(date);
        copy.setHours(23, 59, 59, 999);
        return copy;
};

const parseListParam = (value) => {
        if (!value) return [];
        return value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
};

const reduceProductsQuantityExpression = {
        $reduce: {
                input: { $ifNull: ["$products", []] },
                initialValue: 0,
                in: {
                        $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }],
                },
        },
};

const buildSellerOptions = (sellers) =>
        sellers.map((seller) => ({
                value: String(seller._id),
                label:
                        [seller.firstName, seller.lastName].filter(Boolean).join(" ") ||
                        seller.company?.brandName ||
                        seller.company?.companyName ||
                        seller.email ||
                        seller.mobile ||
                        String(seller._id),
        }));

export async function GET(request) {
        try {
                await dbConnect();

                const cookieStore = await cookies();
                const token = cookieStore.get("admin_token")?.value;

                if (!token) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                let decoded;
                try {
                        decoded = verifyToken(token);
                } catch (error) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                if (!decoded?.id) {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const url = new URL(request.url);
                const params = url.searchParams;

                const now = new Date();
                let startDate = params.get("startDate") ? new Date(params.get("startDate")) : null;
                let endDate = params.get("endDate") ? new Date(params.get("endDate")) : null;

                if (startDate && Number.isNaN(startDate.getTime())) {
                        startDate = null;
                }

                if (endDate && Number.isNaN(endDate.getTime())) {
                        endDate = null;
                }

                if (startDate && !endDate) {
                        endDate = new Date(startDate);
                }

                if (!startDate && endDate) {
                        startDate = new Date(endDate);
                }

                if (!startDate && !endDate) {
                        endDate = toEndOfDay(now);
                        const defaultStart = new Date(now);
                        defaultStart.setDate(defaultStart.getDate() - 29);
                        startDate = toStartOfDay(defaultStart);
                } else {
                        startDate = toStartOfDay(startDate);
                        endDate = toEndOfDay(endDate);
                }

                if (startDate > endDate) {
                        const temp = startDate;
                        startDate = endDate;
                        endDate = temp;
                }

                const page = Math.max(Number.parseInt(params.get("page") || "1", 10), 1);
                const limitRaw = Number.parseInt(params.get("limit") || "25", 10);
                const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 200) : 25;
                const skip = (page - 1) * limit;

                const statuses = parseListParam(params.get("status"));
                const paymentMethods = parseListParam(params.get("paymentMethods"));
                const sellersParam = parseListParam(params.get("sellers"));
                const searchTerm = params.get("search")?.trim();

                const sellerIds = sellersParam
                        .map((id) => {
                                if (!mongoose.Types.ObjectId.isValid(id)) {
                                        return null;
                                }
                                return new mongoose.Types.ObjectId(id);
                        })
                        .filter(Boolean);

                const baseMatch = {};

                if (statuses.length) {
                        baseMatch.status = { $in: statuses };
                }

                if (sellerIds.length) {
                        baseMatch.sellerId = { $in: sellerIds };
                }

                const pipeline = [{ $match: baseMatch }];

                pipeline.push(
                        {
                                $lookup: {
                                        from: "orders",
                                        localField: "orderId",
                                        foreignField: "_id",
                                        as: "order",
                                },
                        },
                        { $unwind: "$order" }
                );

                pipeline.push({
                        $match: {
                                "order.orderDate": { $gte: startDate, $lte: endDate },
                        },
                });

                if (paymentMethods.length) {
                        pipeline.push({
                                $match: { "order.paymentMethod": { $in: paymentMethods } },
                        });
                }

                pipeline.push(
                        {
                                $lookup: {
                                        from: "users",
                                        localField: "sellerId",
                                        foreignField: "_id",
                                        as: "seller",
                                },
                        },
                        {
                                $unwind: {
                                        path: "$seller",
                                        preserveNullAndEmptyArrays: true,
                                },
                        },
                        {
                                $addFields: {
                                        orderDate: "$order.orderDate",
                                        paymentMethod: { $ifNull: ["$order.paymentMethod", "unknown"] },
                                        orderNumber: "$order.orderNumber",
                                        customerName: { $ifNull: ["$order.customerName", ""] },
                                        customerEmail: { $ifNull: ["$order.customerEmail", ""] },
                                        customerMobile: { $ifNull: ["$order.customerMobile", ""] },
                                        sellerName: {
                                                $trim: {
                                                        input: {
                                                                $concat: [
                                                                        { $ifNull: ["$seller.firstName", ""] },
                                                                        " ",
                                                                        { $ifNull: ["$seller.lastName", ""] },
                                                                ],
                                                        },
                                                },
                                        },
                                        sellerEmail: { $ifNull: ["$seller.email", ""] },
                                        sellerPhone: { $ifNull: ["$seller.mobile", ""] },
                                        sellerStatus: { $ifNull: ["$seller.status", ""] },
                                        unitCount: reduceProductsQuantityExpression,
                                },
                        }
                );

                if (searchTerm) {
                        const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
                        pipeline.push({
                                $match: {
                                        $or: [
                                                { orderNumber: { $regex: regex } },
                                                { customerName: { $regex: regex } },
                                                { customerEmail: { $regex: regex } },
                                                { customerMobile: { $regex: regex } },
                                                { sellerName: { $regex: regex } },
                                                { sellerEmail: { $regex: regex } },
                                                { sellerPhone: { $regex: regex } },
                                                { "products.productName": { $regex: regex } },
                                        ],
                                },
                        });
                }

                pipeline.push({
                        $facet: {
                                summary: [
                                        {
                                                $group: {
                                                        _id: "$order._id",
                                                        totalRevenue: {
                                                                $sum: { $ifNull: ["$totalAmount", 0] },
                                                        },
                                                        totalUnits: { $sum: "$unitCount" },
                                                },
                                        },
                                        {
                                                $group: {
                                                        _id: null,
                                                        totalRevenue: { $sum: "$totalRevenue" },
                                                        totalUnits: { $sum: "$totalUnits" },
                                                        totalOrders: { $sum: 1 },
                                                },
                                        },
                                        {
                                                $project: {
                                                        _id: 0,
                                                        totalRevenue: 1,
                                                        totalUnits: 1,
                                                        totalOrders: 1,
                                                        averageOrderValue: {
                                                                $cond: [
                                                                        { $gt: ["$totalOrders", 0] },
                                                                        {
                                                                                $divide: [
                                                                                        "$totalRevenue",
                                                                                        "$totalOrders",
                                                                                ],
                                                                        },
                                                                        0,
                                                                ],
                                                        },
                                                },
                                        },
                                ],
                                sellerSummary: [
                                        {
                                                $group: {
                                                        _id: "$sellerId",
                                                        sellerName: { $first: "$sellerName" },
                                                        sellerEmail: { $first: "$sellerEmail" },
                                                        sellerPhone: { $first: "$sellerPhone" },
                                                        sellerStatus: { $first: "$sellerStatus" },
                                                        totalRevenue: {
                                                                $sum: { $ifNull: ["$totalAmount", 0] },
                                                        },
                                                        totalUnits: { $sum: "$unitCount" },
                                                        orderIds: { $addToSet: "$order._id" },
                                                },
                                        },
                                        {
                                                $project: {
                                                        _id: 0,
                                                        sellerId: { $toString: "$_id" },
                                                        sellerName: 1,
                                                        sellerEmail: 1,
                                                        sellerPhone: 1,
                                                        sellerStatus: 1,
                                                        totalRevenue: 1,
                                                        totalUnits: 1,
                                                        orderCount: {
                                                                $size: {
                                                                        $ifNull: ["$orderIds", []],
                                                                },
                                                        },
                                                },
                                        },
                                        {
                                                $addFields: {
                                                        averageOrderValue: {
                                                                $cond: [
                                                                        { $gt: ["$orderCount", 0] },
                                                                        {
                                                                                $divide: [
                                                                                        "$totalRevenue",
                                                                                        "$orderCount",
                                                                                ],
                                                                        },
                                                                        0,
                                                                ],
                                                        },
                                                },
                                        },
                                        { $sort: { totalRevenue: -1 } },
                                ],
                                paginated: [
                                        { $sort: { orderDate: -1, _id: -1 } },
                                        { $skip: skip },
                                        { $limit: limit },
                                        {
                                                $project: {
                                                        _id: 0,
                                                        id: { $toString: "$_id" },
                                                        orderId: { $toString: "$order._id" },
                                                        orderNumber: 1,
                                                        orderDate: 1,
                                                        status: "$status",
                                                        paymentMethod: 1,
                                                        invoiceValue: { $ifNull: ["$totalAmount", 0] },
                                                        unitCount: 1,
                                                        customer: {
                                                                name: "$customerName",
                                                                email: "$customerEmail",
                                                                phone: "$customerMobile",
                                                        },
                                                        seller: {
                                                                id: {
                                                                        $cond: [
                                                                                {
                                                                                        $ne: [
                                                                                                "$sellerId",
                                                                                                null,
                                                                                        ],
                                                                                },
                                                                                {
                                                                                        $toString: "$sellerId",
                                                                                },
                                                                                null,
                                                                        ],
                                                                },
                                                                name: "$sellerName",
                                                                email: "$sellerEmail",
                                                                phone: "$sellerPhone",
                                                                status: "$sellerStatus",
                                                        },
                                                        products: {
                                                                $map: {
                                                                        input: { $ifNull: ["$products", []] },
                                                                        as: "product",
                                                                        in: {
                                                                                name: {
                                                                                        $ifNull: [
                                                                                                "$$product.productName",
                                                                                                "Unknown product",
                                                                                        ],
                                                                                },
                                                                                quantity: {
                                                                                        $ifNull: [
                                                                                                "$$product.quantity",
                                                                                                0,
                                                                                        ],
                                                                                },
                                                                                price: {
                                                                                        $ifNull: [
                                                                                                "$$product.price",
                                                                                                0,
                                                                                        ],
                                                                                },
                                                                                total: {
                                                                                        $ifNull: [
                                                                                                "$$product.totalPrice",
                                                                                                0,
                                                                                        ],
                                                                                },
                                                                        },
                                                                },
                                                        },
                                                },
                                        },
                                ],
                                totalCount: [{ $count: "count" }],
                        },
                });

                const [aggregation] = await SubOrder.aggregate(pipeline);

                const summary = aggregation?.summary?.[0] || {
                        totalOrders: 0,
                        totalRevenue: 0,
                        totalUnits: 0,
                        averageOrderValue: 0,
                };

                const sellerSummary = aggregation?.sellerSummary || [];
                const orders = aggregation?.paginated || [];
                const totalDocuments = aggregation?.totalCount?.[0]?.count || 0;

                const [statusOptions, paymentOptionsRaw, sellersRaw] = await Promise.all([
                        SubOrder.distinct("status"),
                        SubOrder.aggregate([
                                {
                                        $lookup: {
                                                from: "orders",
                                                localField: "orderId",
                                                foreignField: "_id",
                                                as: "order",
                                        },
                                },
                                { $unwind: "$order" },
                                { $group: { _id: "$order.paymentMethod" } },
                                {
                                        $project: {
                                                _id: 0,
                                                value: { $ifNull: ["$_id", "unknown"] },
                                        },
                                },
                        ]).then((items) => items.map((item) => item.value)),
                        User.find({ userType: "seller" })
                                .populate({ path: "company", select: "companyName brandName" })
                                .select("firstName lastName email mobile status company")
                                .lean(),
                ]);

                const sellerOptions = buildSellerOptions(sellersRaw || []);

                return NextResponse.json({
                        success: true,
                        data: {
                                summary,
                                sellerSummary,
                                orders,
                                pagination: {
                                        page,
                                        limit,
                                        total: totalDocuments,
                                        totalPages: Math.ceil(totalDocuments / limit) || 1,
                                },
                                availableFilters: {
                                        statuses: statusOptions,
                                        paymentMethods: paymentOptionsRaw,
                                        sellers: sellerOptions,
                                },
                        },
                });
        } catch (error) {
                console.error("Admin sales report error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to load sales report" },
                        { status: 500 }
                );
        }
}
