import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import CompanyDetails from "@/model/companyDetails";
import Product from "@/model/Product";

const formatSeller = (companyDoc = {}, fallbackUserId = null) => ({
  id: companyDoc._id?.toString?.() || "",
  userId:
    companyDoc.user?.toString?.() ||
    companyDoc.user ||
    fallbackUserId?.toString?.() ||
    fallbackUserId ||
    "",
  companyName: companyDoc.companyName || "",
  companyLogo: companyDoc.companyLogo || "",
  brandName: companyDoc.brandName || "",
  brandDescription: companyDoc.brandDescription || "",
  companyEmail: companyDoc.companyEmail || "",
  phone: companyDoc.phone || "",
  gstinNumber: companyDoc.gstinNumber || "",
  companyAddress: Array.isArray(companyDoc.companyAddress)
    ? companyDoc.companyAddress.map((address) => ({
        tagName: address.tagName || "",
        building: address.building || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "",
      }))
    : [],
  promotionalBanners: Array.isArray(companyDoc.promotionalBanners)
    ? companyDoc.promotionalBanners
        .filter((banner) => banner && banner.imageUrl)
        .map((banner, index) => ({
          id: banner._id?.toString?.() || `banner-${index}`,
          imageUrl: banner.imageUrl || "",
          title: banner.title || "",
          description: banner.description || "",
        }))
    : [],
});

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;

    // Fetch company details
    const companyDetails = await CompanyDetails.findOne(
      { user: id },
      "companyName companyAddress companyLogo brandName brandDescription companyEmail phone gstinNumber promotionalBanners user"
    ).lean();

    if (!companyDetails) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    // Get unique categories from seller's products
    const sellerProducts = await Product.find(
      { sellerId: id },
      "category brand"
    ).lean();

    const categories = [
      ...new Set(
        sellerProducts
          .map((product) => product.category)
          .filter((category) => typeof category === "string" && category.trim().length > 0)
      ),
    ];

    const brands = [
      ...new Set(
        sellerProducts
          .map((product) => product.brand)
          .filter((brand) => typeof brand === "string" && brand.trim().length > 0)
      ),
    ];

    return NextResponse.json({
      success: true,
      data: {
        seller: formatSeller(companyDetails, id),
        categories,
        brands,
        totalProducts: sellerProducts.length,
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