import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/dbConnect.js";
import BrandPromotion from "@/model/BrandPromotion.js";

async function authenticateAdmin(request) {
        const token = request.cookies.get("admin_token")?.value;

        if (!token) {
                return {
                        success: false,
                        response: NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        ),
                };
        }

        try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                return { success: true, adminId: decoded.id };
        } catch (error) {
                return {
                        success: false,
                        response: NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 }),
                };
        }
}

function serializeBanner(banner) {
        return {
                id: banner._id.toString(),
                brandName: banner.brandName,
                discountPercentage: banner.discountPercentage ?? 0,
                tagline: banner.tagline || "",
                bannerImage: banner.bannerImage,
                bannerImagePublicId: banner.bannerImagePublicId || "",
                isActive: banner.isActive,
                displayOrder: banner.displayOrder ?? 0,
                createdAt: banner.createdAt,
                updatedAt: banner.updatedAt,
        };
}

export async function GET(request) {
        await dbConnect();

        const auth = await authenticateAdmin(request);
        if (!auth.success) {
                return auth.response;
        }

        try {
                const banners = await BrandPromotion.find()
                        .sort({ displayOrder: 1, createdAt: -1 })
                        .lean();

                return NextResponse.json({
                        success: true,
                        banners: banners.map(serializeBanner),
                });
        } catch (error) {
                console.error("[brand-promotions][GET]", error);
                return NextResponse.json(
                        { success: false, message: "Failed to fetch brand promotions" },
                        { status: 500 }
                );
        }
}

export async function POST(request) {
        await dbConnect();

        const auth = await authenticateAdmin(request);
        if (!auth.success) {
                return auth.response;
        }

        try {
                const {
                        brandName,
                        discountPercentage,
                        tagline,
                        bannerImage,
                        bannerImagePublicId,
                        isActive = true,
                        displayOrder = 0,
                } =
                        await request.json();

                if (!brandName || !brandName.trim()) {
                        return NextResponse.json(
                                { success: false, message: "Brand name is required" },
                                { status: 400 }
                        );
                }

                if (!bannerImage || !bannerImage.trim()) {
                        return NextResponse.json(
                                { success: false, message: "Banner image is required" },
                                { status: 400 }
                        );
                }

                if (!bannerImagePublicId || !bannerImagePublicId.trim()) {
                        return NextResponse.json(
                                { success: false, message: "Banner image public id is required" },
                                { status: 400 }
                        );
                }

                const discountValue = Number(discountPercentage ?? 0);
                if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
                        return NextResponse.json(
                                { success: false, message: "Discount percentage must be between 0 and 100" },
                                { status: 400 }
                        );
                }

                const banner = await BrandPromotion.create({
                        brandName: brandName.trim(),
                        discountPercentage: discountValue,
                        tagline: tagline?.trim() || "",
                        bannerImage: bannerImage.trim(),
                        bannerImagePublicId: bannerImagePublicId.trim(),
                        isActive: Boolean(isActive),
                        displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
                });

                return NextResponse.json({
                        success: true,
                        message: "Brand promotion created successfully",
                        banner: serializeBanner(banner),
                });
        } catch (error) {
                console.error("[brand-promotions][POST]", error);
                return NextResponse.json(
                        { success: false, message: "Failed to create brand promotion" },
                        { status: 500 }
                );
        }
}
