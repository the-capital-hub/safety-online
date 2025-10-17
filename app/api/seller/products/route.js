import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Product from "@/model/Product";

const FALLBACK_IMAGE =
        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";

export async function GET(request) {
        try {
                await connectDB();

                const { searchParams } = new URL(request.url);
                const sellerId = searchParams.get("sellerId");
                const category = searchParams.get("category");
                const search = searchParams.get("search");
                const page = Number.parseInt(searchParams.get("page") || "1", 10);
                const limit = Number.parseInt(searchParams.get("limit") || "12", 10);

                if (!sellerId) {
                        return NextResponse.json(
                                { success: false, message: "Seller ID is required" },
                                { status: 400 }
                        );
                }

                const query = { sellerId };

                if (category && category !== "All Products" && category !== "all") {
                        query.category = category;
                }

                if (search) {
                        query.$or = [
                                { title: { $regex: search, $options: "i" } },
                                { description: { $regex: search, $options: "i" } },
                        ];
                }

                const skip = (page - 1) * limit;

                const products = await Product.find(query)
                        .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(limit)
                        .lean();

                const totalProducts = await Product.countDocuments(query);

                const transformedProducts = products.map((product) => {
                        const safePrice = Number(product.price) || 0;
                        const safeSalePrice = Number(product.salePrice) || 0;
                        const discountPercentage =
                                safeSalePrice > 0 && safePrice > 0
                                        ? Math.round(((safePrice - safeSalePrice) / safePrice) * 100)
                                        : Number(product.discount) || 0;

                        return {
                                id: product._id.toString(),
                                title: product.title,
                                description: product.description,
                                price: safePrice,
                                salePrice: safeSalePrice,
                                discountPercentage,
                                images: product.images || [],
                                image: product.images?.[0] || product.mainImage || FALLBACK_IMAGE,
                                inStock: product.stocks > 0,
                                status: product.stocks > 0 ? "In Stock" : "Out of Stock",
                                type: product.type || "featured",
                                rating: product.rating || 0,
                        };
                });

                return NextResponse.json({
                        success: true,
                        products: transformedProducts,
                        pagination: {
                                total: totalProducts,
                                page,
                                limit,
                                totalPages: Math.ceil(totalProducts / limit),
                        },
                });
        } catch (error) {
                console.error("Error fetching seller products:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to fetch seller products" },
                        { status: 500 }
                );
        }
}