import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import { verifyToken } from "@/lib/auth";
import SubOrder from "@/model/SubOrder";
import Product from "@/model/Product";
import User from "@/model/User";

const DEFAULT_INTERVAL = "day";
const intervalOptions = new Set(["day", "week", "month"]);

const toStartOfDay = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
};

const toEndOfDay = (date) => {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
};

const parseListParam = (value) => {
        if (!value) return [];
        return value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
};

const calculateDuration = (start, end) => Math.max(end.getTime() - start.getTime(), 0);

const reduceProductsQuantityExpression = {
        $reduce: {
                input: { $ifNull: ["$products", []] },
                initialValue: 0,
                in: {
                        $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }],
                },
        },
};

const buildBucketExpressions = (interval) => {
        if (interval === "week") {
                return {
                        label: {
                                $concat: [
                                        { $toString: { $isoWeekYear: "$order.orderDate" } },
                                        "-W",
                                        {
                                                $cond: [
                                                        {
                                                                $lt: [{ $isoWeek: "$order.orderDate" }, 10],
                                                        },
                                                        {
                                                                $concat: [
                                                                        "0",
                                                                        { $toString: { $isoWeek: "$order.orderDate" } },
                                                                ],
                                                        },
                                                        { $toString: { $isoWeek: "$order.orderDate" } },
                                                ],
                                        },
                                ],
                        },
                        sortKey: {
                                $dateFromParts: {
                                        isoWeekYear: { $isoWeekYear: "$order.orderDate" },
                                        isoWeek: { $isoWeek: "$order.orderDate" },
                                        isoDayOfWeek: 1,
                                },
                        },
                };
        }

        if (interval === "month") {
                return {
                        label: {
                                $dateToString: {
                                        format: "%Y-%m",
                                        date: "$order.orderDate",
                                },
                        },
                        sortKey: {
                                $dateFromParts: {
                                        year: { $year: "$order.orderDate" },
                                        month: { $month: "$order.orderDate" },
                                        day: 1,
                                },
                        },
                };
        }

        return {
                label: {
                        $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$order.orderDate",
                        },
                },
                sortKey: "$order.orderDate",
        };
};

const buildSummaryPipeline = ({
        startDate,
        endDate,
        statuses,
        paymentMethods,
        productIdFilter,
        sellerIdFilter,
}) => {
        const matchStage = {
                createdAt: { $gte: startDate, $lte: endDate },
        };

        if (sellerIdFilter?.length) {
                matchStage.sellerId = { $in: sellerIdFilter };
        }

        if (statuses.length) {
                matchStage.status = { $in: statuses };
        }

        if (productIdFilter) {
                matchStage["products.productId"] = { $in: productIdFilter };
        }

        const pipeline = [
                { $match: matchStage },
                {
                        $lookup: {
                                from: "orders",
                                localField: "orderId",
                                foreignField: "_id",
                                as: "order",
                        },
                },
                { $unwind: "$order" },
                {
                        $match: {
                                "order.orderDate": { $gte: startDate, $lte: endDate },
                        },
                },
        ];

        if (paymentMethods.length) {
                pipeline.push({
                        $match: { "order.paymentMethod": { $in: paymentMethods } },
                });
        }

        pipeline.push({
                $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalRevenue: {
                                $sum: { $ifNull: ["$totalAmount", 0] },
                        },
                        totalUnits: { $sum: reduceProductsQuantityExpression },
                },
        });

        pipeline.push({
                $project: {
                        _id: 0,
                        totalOrders: 1,
                        totalRevenue: 1,
                        totalUnits: 1,
                },
        });

        return pipeline;
};

const buildSellerOptions = (sellers) =>
        sellers.map((seller) => ({
                value: String(seller._id),
                label:
                        [seller.firstName, seller.lastName]
                                .filter(Boolean)
                                .join(" ") ||
                        seller.company?.brandName ||
                        seller.company?.companyName ||
                        seller.email ||
                        seller.mobile ||
                        String(seller._id),
                status: seller.status,
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
                const defaultEnd = toEndOfDay(now);
                const defaultStart = toStartOfDay(
                        new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000)
                );

                const startDateParam = params.get("startDate");
                const endDateParam = params.get("endDate");
                const intervalParam = params.get("interval")?.toLowerCase();

                let startDate = startDateParam ? new Date(startDateParam) : defaultStart;
                let endDate = endDateParam ? new Date(endDateParam) : defaultEnd;

                if (Number.isNaN(startDate.getTime())) {
                        startDate = defaultStart;
                }

                if (Number.isNaN(endDate.getTime())) {
                        endDate = defaultEnd;
                }

                if (startDate > endDate) {
                        const temp = startDate;
                        startDate = endDate;
                        endDate = temp;
                }

                startDate = toStartOfDay(startDate);
                endDate = toEndOfDay(endDate);

                const interval = intervalOptions.has(intervalParam)
                        ? intervalParam
                        : DEFAULT_INTERVAL;

                const statuses = parseListParam(params.get("status"));
                const paymentMethods = parseListParam(params.get("paymentMethods"));
                const categories = parseListParam(params.get("categories"));
                const sellerParams = parseListParam(params.get("sellers"));

                const sellerIdFilter = sellerParams
                        .map((id) => {
                                if (!mongoose.Types.ObjectId.isValid(id)) return null;
                                return new mongoose.Types.ObjectId(id);
                        })
                        .filter(Boolean);

                let productIdFilter = null;
                if (categories.length) {
                        const productDocs = await Product.find({
                                category: { $in: categories },
                        }).select("_id");

                        if (productDocs.length) {
                                productIdFilter = productDocs.map((doc) => doc._id);
                        } else {
                                productIdFilter = [];
                        }
                }

                const matchStage = {
                        createdAt: { $gte: startDate, $lte: endDate },
                };

                if (sellerIdFilter.length) {
                        matchStage.sellerId = { $in: sellerIdFilter };
                }

                if (statuses.length) {
                        matchStage.status = { $in: statuses };
                }

                if (Array.isArray(productIdFilter)) {
                        matchStage["products.productId"] = { $in: productIdFilter };
                }

                const bucketExpressions = buildBucketExpressions(interval);

                const basePipeline = [
                        { $match: matchStage },
                        {
                                $lookup: {
                                        from: "orders",
                                        localField: "orderId",
                                        foreignField: "_id",
                                        as: "order",
                                },
                        },
                        { $unwind: "$order" },
                        {
                                $match: {
                                        "order.orderDate": { $gte: startDate, $lte: endDate },
                                },
                        },
                ];

                if (paymentMethods.length) {
                        basePipeline.push({
                                $match: { "order.paymentMethod": { $in: paymentMethods } },
                        });
                }

                basePipeline.push({
                        $addFields: {
                                paymentMethod: {
                                        $ifNull: ["$order.paymentMethod", "unknown"],
                                },
                                orderDate: "$order.orderDate",
                                customerId: "$order.userId",
                                unitCount: reduceProductsQuantityExpression,
                        },
                });

                basePipeline.push({
                        $lookup: {
                                from: "products",
                                let: { productIds: "$products.productId" },
                                pipeline: [
                                        {
                                                $match: {
                                                        $expr: {
                                                                $in: ["$_id", "$$productIds"],
                                                        },
                                                },
                                        },
                                        {
                                                $project: {
                                                        category: 1,
                                                        title: "$title",
                                                },
                                        },
                                ],
                                as: "productInfo",
                        },
                });

                basePipeline.push({
                        $addFields: {
                                categories: {
                                        $map: {
                                                input: { $ifNull: ["$productInfo", []] },
                                                as: "info",
                                                in: {
                                                        $ifNull: ["$$info.category", "Uncategorized"],
                                                },
                                        },
                                },
                        },
                });

                const analyticsPipeline = [
                        ...basePipeline,
                        {
                                $facet: {
                                        summary: [
                                                {
                                                        $group: {
                                                                _id: null,
                                                                totalOrders: { $sum: 1 },
                                                                totalRevenue: {
                                                                        $sum: {
                                                                                $ifNull: ["$totalAmount", 0],
                                                                        },
                                                                },
                                                                totalUnits: { $sum: "$unitCount" },
                                                                uniqueCustomers: {
                                                                        $addToSet: {
                                                                                $ifNull: [
                                                                                        "$customerId",
                                                                                        "unknown",
                                                                                ],
                                                                        },
                                                                },
                                                        },
                                                },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                totalOrders: 1,
                                                                totalRevenue: 1,
                                                                totalUnits: 1,
                                                                uniqueCustomers: {
                                                                        $cond: [
                                                                                {
                                                                                        $isArray:
                                                                                                "$uniqueCustomers",
                                                                                },
                                                                                { $size: "$uniqueCustomers" },
                                                                                0,
                                                                        ],
                                                                },
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
                                        ordersOverTime: [
                                                {
                                                        $addFields: {
                                                                bucketLabel: bucketExpressions.label,
                                                                bucketSortKey: bucketExpressions.sortKey,
                                                        },
                                                },
                                                {
                                                        $group: {
                                                                _id: "$bucketLabel",
                                                                sortKey: {
                                                                        $first: "$bucketSortKey",
                                                                },
                                                                orders: { $sum: 1 },
                                                                revenue: {
                                                                        $sum: {
                                                                                $ifNull: ["$totalAmount", 0],
                                                                        },
                                                                },
                                                                units: { $sum: "$unitCount" },
                                                        },
                                                },
                                                { $sort: { sortKey: 1 } },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                label: "$_id",
                                                                orders: 1,
                                                                revenue: 1,
                                                                units: 1,
                                                                averageOrderValue: {
                                                                        $cond: [
                                                                                { $gt: ["$orders", 0] },
                                                                                {
                                                                                        $divide: [
                                                                                                "$revenue",
                                                                                                "$orders",
                                                                                        ],
                                                                                },
                                                                                0,
                                                                        ],
                                                                },
                                                        },
                                                },
                                        ],
                                        statusDistribution: [
                                                {
                                                        $group: {
                                                                _id: {
                                                                        $ifNull: ["$status", "unknown"],
                                                                },
                                                                count: { $sum: 1 },
                                                                revenue: {
                                                                        $sum: {
                                                                                $ifNull: ["$totalAmount", 0],
                                                                        },
                                                                },
                                                        },
                                                },
                                                { $sort: { count: -1 } },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                status: "$_id",
                                                                count: 1,
                                                                revenue: 1,
                                                        },
                                                },
                                        ],
                                        paymentMethods: [
                                                {
                                                        $group: {
                                                                _id: "$paymentMethod",
                                                                count: { $sum: 1 },
                                                                revenue: {
                                                                        $sum: {
                                                                                $ifNull: ["$totalAmount", 0],
                                                                        },
                                                                },
                                                        },
                                                },
                                                { $sort: { revenue: -1 } },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                method: "$_id",
                                                                count: 1,
                                                                revenue: 1,
                                                        },
                                                },
                                        ],
                                        topProducts: [
                                                { $unwind: "$products" },
                                                {
                                                        $group: {
                                                                _id: "$products.productId",
                                                                productName: {
                                                                        $first: {
                                                                                $ifNull: [
                                                                                        "$products.productName",
                                                                                        "Unknown product",
                                                                                ],
                                                                        },
                                                                },
                                                                totalUnits: {
                                                                        $sum: {
                                                                                $ifNull: [
                                                                                        "$products.quantity",
                                                                                        0,
                                                                                ],
                                                                        },
                                                                },
                                                                totalRevenue: {
                                                                        $sum: {
                                                                                $ifNull: [
                                                                                        "$products.totalPrice",
                                                                                        0,
                                                                                ],
                                                                        },
                                                                },
                                                        },
                                                },
                                                { $sort: { totalRevenue: -1 } },
                                                { $limit: 10 },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                productId: {
                                                                        $convert: {
                                                                                input: "$_id",
                                                                                to: "string",
                                                                                onError: null,
                                                                                onNull: null,
                                                                        },
                                                                },
                                                                productName: 1,
                                                                totalUnits: 1,
                                                                totalRevenue: 1,
                                                        },
                                                },
                                        ],
                                        categoryPerformance: [
                                                { $unwind: "$products" },
                                                {
                                                        $lookup: {
                                                                from: "products",
                                                                localField: "products.productId",
                                                                foreignField: "_id",
                                                                as: "productDetails",
                                                        },
                                                },
                                                {
                                                        $unwind: {
                                                                path: "$productDetails",
                                                                preserveNullAndEmptyArrays: true,
                                                        },
                                                },
                                                {
                                                        $group: {
                                                                _id: {
                                                                        $ifNull: [
                                                                                "$productDetails.category",
                                                                                "Uncategorized",
                                                                        ],
                                                                },
                                                                totalRevenue: {
                                                                        $sum: {
                                                                                $ifNull: [
                                                                                        "$products.totalPrice",
                                                                                        0,
                                                                                ],
                                                                        },
                                                                },
                                                                totalUnits: {
                                                                        $sum: {
                                                                                $ifNull: [
                                                                                        "$products.quantity",
                                                                                        0,
                                                                                ],
                                                                        },
                                                                },
                                                                orders: {
                                                                        $addToSet: "$_id",
                                                                },
                                                        },
                                                },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                category: "$_id",
                                                                totalRevenue: 1,
                                                                totalUnits: 1,
                                                                orderCount: {
                                                                        $cond: [
                                                                                {
                                                                                        $isArray: "$orders",
                                                                                },
                                                                                { $size: "$orders" },
                                                                                0,
                                                                        ],
                                                                },
                                                        },
                                                },
                                                { $sort: { totalRevenue: -1 } },
                                        ],
                                        sellerPerformance: [
                                                {
                                                        $group: {
                                                                _id: {
                                                                        sellerId: "$sellerId",
                                                                        status: "$status",
                                                                },
                                                                revenue: {
                                                                        $sum: {
                                                                                $ifNull: ["$totalAmount", 0],
                                                                        },
                                                                },
                                                                orders: { $sum: 1 },
                                                                units: { $sum: "$unitCount" },
                                                        },
                                                },
                                                {
                                                        $group: {
                                                                _id: "$_id.sellerId",
                                                                totalRevenue: { $sum: "$revenue" },
                                                                totalOrders: { $sum: "$orders" },
                                                                totalUnits: { $sum: "$units" },
                                                                statusBreakdown: {
                                                                        $push: {
                                                                                status: {
                                                                                        $ifNull: [
                                                                                                "$_id.status",
                                                                                                "unknown",
                                                                                        ],
                                                                                },
                                                                                orders: "$orders",
                                                                                revenue: "$revenue",
                                                                        },
                                                                },
                                                        },
                                                },
                                                {
                                                        $lookup: {
                                                                from: "users",
                                                                localField: "_id",
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
                                                        $lookup: {
                                                                from: "companies",
                                                                localField: "seller.company",
                                                                foreignField: "_id",
                                                                as: "company",
                                                        },
                                                },
                                                {
                                                        $unwind: {
                                                                path: "$company",
                                                                preserveNullAndEmptyArrays: true,
                                                        },
                                                },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                sellerId: {
                                                                        $convert: {
                                                                                input: "$_id",
                                                                                to: "string",
                                                                                onError: null,
                                                                                onNull: null,
                                                                        },
                                                                },
                                                                name: {
                                                                        $concat: [
                                                                                { $ifNull: ["$seller.firstName", ""] },
                                                                                " ",
                                                                                { $ifNull: ["$seller.lastName", ""] },
                                                                        ],
                                                                },
                                                                email: "$seller.email",
                                                                phone: "$seller.mobile",
                                                                companyName: "$company.companyName",
                                                                brandName: "$company.brandName",
                                                                status: "$seller.status",
                                                                totalRevenue: 1,
                                                                totalOrders: 1,
                                                                totalUnits: 1,
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
                                                                statusBreakdown: 1,
                                                        },
                                                },
                                                { $sort: { totalRevenue: -1 } },
                                        ],
                                        customerSegments: [
                                                {
                                                        $group: {
                                                                _id: "$customerId",
                                                                orders: { $sum: 1 },
                                                                firstOrder: { $min: "$orderDate" },
                                                                lastOrder: { $max: "$orderDate" },
                                                                totalSpent: {
                                                                        $sum: {
                                                                                $ifNull: ["$totalAmount", 0],
                                                                        },
                                                                },
                                                        },
                                                },
                                                {
                                                        $group: {
                                                                _id: null,
                                                                totalCustomers: { $sum: 1 },
                                                                repeatCustomers: {
                                                                        $sum: {
                                                                                $cond: [
                                                                                        { $gt: ["$orders", 1] },
                                                                                        1,
                                                                                        0,
                                                                                ],
                                                                        },
                                                                },
                                                                newCustomers: {
                                                                        $sum: {
                                                                                $cond: [
                                                                                        {
                                                                                                $and: [
                                                                                                        {
                                                                                                                $gte: [
                                                                                                                        "$firstOrder",
                                                                                                                        startDate,
                                                                                                                ],
                                                                                                        },
                                                                                                        {
                                                                                                                $lte: [
                                                                                                                        "$firstOrder",
                                                                                                                        endDate,
                                                                                                                ],
                                                                                                        },
                                                                                                        {
                                                                                                                $eq: [
                                                                                                                        "$orders",
                                                                                                                        1,
                                                                                                                ],
                                                                                                        },
                                                                                                ],
                                                                                        },
                                                                                        1,
                                                                                        0,
                                                                                ],
                                                                        },
                                                                },
                                                                returningCustomers: {
                                                                        $sum: {
                                                                                $cond: [
                                                                                        { $gt: ["$orders", 1] },
                                                                                        1,
                                                                                        0,
                                                                                ],
                                                                        },
                                                                },
                                                                avgOrderFrequency: { $avg: "$orders" },
                                                                customerLifetimeValue: {
                                                                        $avg: "$totalSpent",
                                                                },
                                                        },
                                                },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                totalCustomers: 1,
                                                                repeatCustomers: 1,
                                                                newCustomers: 1,
                                                                returningCustomers: 1,
                                                                avgOrderFrequency: {
                                                                        $ifNull: ["$avgOrderFrequency", 0],
                                                                },
                                                                customerLifetimeValue: {
                                                                        $ifNull: [
                                                                                "$customerLifetimeValue",
                                                                                0,
                                                                        ],
                                                                },
                                                        },
                                                },
                                        ],
                                        ordersReport: [
                                                {
                                                        $project: {
                                                                _id: 1,
                                                                orderNumber: "$order.orderNumber",
                                                                orderDate: "$order.orderDate",
                                                                status: "$status",
                                                                paymentMethod: "$paymentMethod",
                                                                totalAmount: {
                                                                        $ifNull: ["$totalAmount", 0],
                                                                },
                                                                units: "$unitCount",
                                                                categories: {
                                                                        $ifNull: ["$categories", []],
                                                                },
                                                        },
                                                },
                                                { $sort: { orderDate: -1 } },
                                                { $limit: 200 },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                id: {
                                                                        $convert: {
                                                                                input: "$_id",
                                                                                to: "string",
                                                                                onError: null,
                                                                                onNull: null,
                                                                        },
                                                                },
                                                                orderNumber: 1,
                                                                orderDate: 1,
                                                                status: 1,
                                                                paymentMethod: 1,
                                                                totalAmount: 1,
                                                                units: 1,
                                                                categories: 1,
                                                        },
                                                },
                                        ],
                                        topCustomers: [
                                                {
                                                        $match: {
                                                                customerId: { $ne: null },
                                                        },
                                                },
                                                {
                                                        $group: {
                                                                _id: "$customerId",
                                                                totalRevenue: {
                                                                        $sum: {
                                                                                $ifNull: ["$totalAmount", 0],
                                                                        },
                                                                },
                                                                orders: { $sum: 1 },
                                                                units: { $sum: "$unitCount" },
                                                                lastOrder: { $max: "$orderDate" },
                                                        },
                                                },
                                                { $sort: { totalRevenue: -1 } },
                                                { $limit: 15 },
                                                {
                                                        $lookup: {
                                                                from: "users",
                                                                localField: "_id",
                                                                foreignField: "_id",
                                                                as: "customer",
                                                        },
                                                },
                                                {
                                                        $unwind: {
                                                                path: "$customer",
                                                                preserveNullAndEmptyArrays: true,
                                                        },
                                                },
                                                {
                                                        $project: {
                                                                _id: 0,
                                                                customerId: {
                                                                        $convert: {
                                                                                input: "$_id",
                                                                                to: "string",
                                                                                onError: null,
                                                                                onNull: null,
                                                                        },
                                                                },
                                                                totalRevenue: 1,
                                                                orders: 1,
                                                                units: 1,
                                                                lastOrder: 1,
                                                                firstName: "$customer.firstName",
                                                                lastName: "$customer.lastName",
                                                                email: "$customer.email",
                                                                phone: "$customer.mobile",
                                                        },
                                                },
                                        ],
                                },
                        },
                ];

                const [analytics] = await SubOrder.aggregate(analyticsPipeline);

                const summary = analytics?.summary?.[0] || {
                        totalOrders: 0,
                        totalRevenue: 0,
                        totalUnits: 0,
                        uniqueCustomers: 0,
                        averageOrderValue: 0,
                };

                const customerSegments = analytics?.customerSegments?.[0] || {
                        totalCustomers: 0,
                        repeatCustomers: 0,
                        newCustomers: 0,
                        returningCustomers: 0,
                        avgOrderFrequency: 0,
                        customerLifetimeValue: 0,
                };

                const sellerPerformance = (analytics?.sellerPerformance || []).map(
                        (seller) => {
                                const trimmedName = seller.name?.trim() || "";
                                const displayName =
                                        trimmedName ||
                                        seller.brandName ||
                                        seller.companyName ||
                                        seller.email ||
                                        seller.phone ||
                                        seller.sellerId;

                                return {
                                        ...seller,
                                        name: trimmedName,
                                        displayName,
                                };
                        }
                );

                const previousRangeDuration = calculateDuration(startDate, endDate) || 1;
                const prevEnd = new Date(startDate.getTime() - 1);
                const prevStart = new Date(prevEnd.getTime() - previousRangeDuration);

                const previousSummaryPipeline = buildSummaryPipeline({
                        startDate: prevStart,
                        endDate: prevEnd,
                        statuses,
                        paymentMethods,
                        productIdFilter,
                        sellerIdFilter,
                });

                const [previousSummary] = await SubOrder.aggregate(previousSummaryPipeline);

                const previous =
                        previousSummary || {
                                totalOrders: 0,
                                totalRevenue: 0,
                                totalUnits: 0,
                        };

                const growth = {
                        revenue:
                                previous.totalRevenue > 0
                                        ? ((summary.totalRevenue - previous.totalRevenue) /
                                                  previous.totalRevenue) *
                                          100
                                        : summary.totalRevenue > 0
                                          ? 100
                                          : 0,
                        orders:
                                previous.totalOrders > 0
                                        ? ((summary.totalOrders - previous.totalOrders) /
                                                  previous.totalOrders) *
                                          100
                                        : summary.totalOrders > 0
                                          ? 100
                                          : 0,
                        units:
                                previous.totalUnits > 0
                                        ? ((summary.totalUnits - previous.totalUnits) /
                                                  previous.totalUnits) *
                                          100
                                        : summary.totalUnits > 0
                                          ? 100
                                          : 0,
                };

                const [statusOptions, paymentOptionsRaw, categoryOptions, sellersRaw] =
                        await Promise.all([
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
                                        {
                                                $group: { _id: "$order.paymentMethod" },
                                        },
                                        {
                                                $project: {
                                                        _id: 0,
                                                        value: { $ifNull: ["$_id", "unknown"] },
                                                },
                                        },
                                ]).then((items) => items.map((item) => item.value)),
                                Product.distinct("category"),
                                User.find({ userType: "seller" })
                                        .populate({
                                                path: "company",
                                                select: "companyName brandName",
                                        })
                                        .select(
                                                "firstName lastName email mobile status company"
                                        )
                                        .lean(),
                        ]);

                const sellerOptions = buildSellerOptions(sellersRaw || []);

                return NextResponse.json({
                        success: true,
                        data: {
                                summary,
                                ordersOverTime: analytics?.ordersOverTime || [],
                                statusDistribution: analytics?.statusDistribution || [],
                                paymentMethods: analytics?.paymentMethods || [],
                                topProducts: analytics?.topProducts || [],
                                categoryPerformance: analytics?.categoryPerformance || [],
                                sellerPerformance,
                                customerSegments,
                                reports: {
                                        orders: analytics?.ordersReport || [],
                                        sellers: sellerPerformance,
                                        customers: analytics?.topCustomers || [],
                                },
                                availableFilters: {
                                        statuses: statusOptions,
                                        paymentMethods: paymentOptionsRaw,
                                        categories: categoryOptions,
                                        sellers: sellerOptions,
                                },
                                meta: {
                                        startDate,
                                        endDate,
                                        interval,
                                },
                                growth,
                        },
                });
        } catch (error) {
                console.error("Admin analytics error:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to load analytics" },
                        { status: 500 }
                );
        }
}
