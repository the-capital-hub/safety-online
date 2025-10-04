import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import { dbConnect } from "@/lib/dbConnect.js";
import BrandPromotion from "@/model/BrandPromotion.js";
import cloudinary, { isCloudinaryConfigured, missingCloudinaryConfig } from "@/lib/cloudinary.js";

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

export async function PUT(request, { params }) {
        await dbConnect();

        const auth = await authenticateAdmin(request);
        if (!auth.success) {
                return auth.response;
        }

        try {
                const { id } = params;
                const payload = await request.json();

                if (
                        (payload.bannerImage !== undefined && payload.bannerImagePublicId === undefined) ||
                        (payload.bannerImagePublicId !== undefined && payload.bannerImage === undefined)
                ) {
                        return NextResponse.json(
                                { success: false, message: "Banner image and public id must be provided together" },
                                { status: 400 }
                        );
                }

                const existingBanner = await BrandPromotion.findById(id);

                if (!existingBanner) {
                        return NextResponse.json(
                                { success: false, message: "Brand promotion not found" },
                                { status: 404 }
                        );
                }

                const update = {};

                if (payload.brandName !== undefined) {
                        if (!payload.brandName || !payload.brandName.trim()) {
                                return NextResponse.json(
                                        { success: false, message: "Brand name cannot be empty" },
                                        { status: 400 }
                                );
                        }
                        update.brandName = payload.brandName.trim();
                }

                if (payload.discountPercentage !== undefined) {
                        const discountValue = Number(payload.discountPercentage);
                        if (Number.isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
                                return NextResponse.json(
                                        { success: false, message: "Discount percentage must be between 0 and 100" },
                                        { status: 400 }
                                );
                        }
                        update.discountPercentage = discountValue;
                }

                if (payload.tagline !== undefined) {
                        update.tagline = payload.tagline?.trim() || "";
                }

                if (payload.bannerImage !== undefined) {
                        if (!payload.bannerImage || !payload.bannerImage.trim()) {
                                return NextResponse.json(
                                        { success: false, message: "Banner image cannot be empty" },
                                        { status: 400 }
                                );
                        }
                        update.bannerImage = payload.bannerImage.trim();
                }

                if (payload.bannerImagePublicId !== undefined) {
                        if (!payload.bannerImagePublicId || !payload.bannerImagePublicId.trim()) {
                                return NextResponse.json(
                                        { success: false, message: "Banner image public id cannot be empty" },
                                        { status: 400 }
                                );
                        }
                        update.bannerImagePublicId = payload.bannerImagePublicId.trim();
                }

                if (payload.isActive !== undefined) {
                        update.isActive = Boolean(payload.isActive);
                }

                if (payload.displayOrder !== undefined) {
                        const orderValue = Number(payload.displayOrder);
                        update.displayOrder = Number.isNaN(orderValue) ? 0 : orderValue;
                }

                if (Object.keys(update).length === 0) {
                        return NextResponse.json(
                                { success: false, message: "No valid fields to update" },
                                { status: 400 }
                        );
                }

                const updatedBanner = await BrandPromotion.findByIdAndUpdate(id, update, {
                        new: true,
                        runValidators: true,
                });

                if (update.bannerImagePublicId && existingBanner.bannerImagePublicId && update.bannerImagePublicId !== existingBanner.bannerImagePublicId) {
                        if (isCloudinaryConfigured) {
                                try {
                                        await cloudinary.uploader.destroy(existingBanner.bannerImagePublicId);
                                } catch (destroyError) {
                                        console.error("[brand-promotions][PUT] failed to remove old banner", destroyError);
                                }
                        } else {
                                console.warn(
                                        "[brand-promotions][PUT] Skipping Cloudinary cleanup because configuration is incomplete:",
                                        missingCloudinaryConfig.join(", ") || "Unknown"
                                );
                        }
                }

                return NextResponse.json({
                        success: true,
                        message: "Brand promotion updated successfully",
                        banner: serializeBanner(updatedBanner),
                });
        } catch (error) {
                console.error("[brand-promotions][PUT]", error);
                return NextResponse.json(
                        { success: false, message: "Failed to update brand promotion" },
                        { status: 500 }
                );
        }
}

export async function DELETE(request, { params }) {
        await dbConnect();

        const auth = await authenticateAdmin(request);
        if (!auth.success) {
                return auth.response;
        }

        try {
                const { id } = params;
                const deletedBanner = await BrandPromotion.findByIdAndDelete(id);

                if (!deletedBanner) {
                        return NextResponse.json(
                                { success: false, message: "Brand promotion not found" },
                                { status: 404 }
                        );
                }

                if (deletedBanner.bannerImagePublicId) {
                        if (isCloudinaryConfigured) {
                                try {
                                        await cloudinary.uploader.destroy(deletedBanner.bannerImagePublicId);
                                } catch (destroyError) {
                                        console.error("[brand-promotions][DELETE] failed to remove banner image", destroyError);
                                }
                        } else {
                                console.warn(
                                        "[brand-promotions][DELETE] Skipping Cloudinary cleanup because configuration is incomplete:",
                                        missingCloudinaryConfig.join(", ") || "Unknown"
                                );
                        }
                }

                return NextResponse.json({
                        success: true,
                        message: "Brand promotion deleted successfully",
                        banner: serializeBanner(deletedBanner),
                });
        } catch (error) {
                console.error("[brand-promotions][DELETE]", error);
                return NextResponse.json(
                        { success: false, message: "Failed to delete brand promotion" },
                        { status: 500 }
                );
        }
}
