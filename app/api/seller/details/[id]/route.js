import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import CompanyDetails from "@/model/companyDetails";
import Product from "@/model/Product";

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Fetch company details
    const companyDetails = await CompanyDetails.findOne({ user: id }).populate('user');
    
    if (!companyDetails) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Get unique categories from seller's products
    const sellerProducts = await Product.find({ seller: id });
    const categories = [...new Set(sellerProducts.map(product => product.category))];

    return NextResponse.json({
      success: true,
      data: {
        companyDetails,
        categories
      }
    });
  } catch (error) {
    console.error("Error fetching seller details:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch seller details" },
      { status: 500 }
    );
  }
}