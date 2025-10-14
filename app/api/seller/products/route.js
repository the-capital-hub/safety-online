import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import Product from "@/model/Product";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get("sellerId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    
    if (!sellerId) {
      return NextResponse.json(
        { success: false, message: "Seller ID is required" },
        { status: 400 }
      );
    }

    // Build query
    const query = { seller: sellerId };
    
    // Add category filter if provided
    if (category && category !== "all") {
      query.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total: totalProducts,
          page,
          limit,
          totalPages: Math.ceil(totalProducts / limit)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch seller products" },
      { status: 500 }
    );
  }
}