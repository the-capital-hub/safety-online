import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import CompanyDetails from "@/model/companyDetails";
import Product from "@/model/Product";

const COMPANY_FIELDS =
        "companyName companyEmail phone gstinNumber brandName brandDescription companyLogo companyAddress user";

export async function GET(request, { params }) {
        try {
                await connectDB();
                const { id } = params;

                const companyDetailsDoc = await CompanyDetails.findOne({ user: id })
                        .select(COMPANY_FIELDS)
                        .lean();

                if (!companyDetailsDoc) {
                        return NextResponse.json(
                                { success: false, message: "Seller not found" },
                                { status: 404 }
                        );
                }

                const sellerProducts = await Product.find({ sellerId: id })
                        .select("category")
                        .lean();

                const categories = Array.from(
                        new Set(
                                (sellerProducts || [])
                                        .map((product) => product.category)
                                        .filter((category) => typeof category === "string" && category.trim() !== "")
                        )
                );

                const seller = {
                        id: companyDetailsDoc._id.toString(),
                        userId: companyDetailsDoc.user?.toString?.() || id,
                        companyName: companyDetailsDoc.companyName,
                        companyEmail: companyDetailsDoc.companyEmail || "",
                        phone: companyDetailsDoc.phone || "",
                        gstinNumber: companyDetailsDoc.gstinNumber || "",
                        brandName: companyDetailsDoc.brandName || "",
                        brandDescription: companyDetailsDoc.brandDescription || "",
                        companyLogo: companyDetailsDoc.companyLogo || "",
                        companyAddress: companyDetailsDoc.companyAddress || [],
                };

                return NextResponse.json({
                        success: true,
                        seller,
                        categories,
                });
        } catch (error) {
                console.error("Error fetching seller details:", error);
                return NextResponse.json(
                        { success: false, message: "Failed to fetch seller details" },
                        { status: 500 }
                );
        }
}