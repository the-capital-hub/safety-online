import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import {
        createBlogCategory,
        getBlogCategoriesWithCounts,
} from "@/lib/services/blog.js";

const verifyAdmin = (request) => {
        const token = request.cookies.get("admin_token")?.value;

        if (!token) {
                throw new Error("Unauthorized");
        }

        try {
                return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
                throw new Error("Unauthorized");
        }
};

export async function GET(request) {
        try {
                verifyAdmin(request);

                const categories = await getBlogCategoriesWithCounts();

                return NextResponse.json({
                        success: true,
                        categories,
                });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                console.error("[api/admin/blog/categories] error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message:
                                        error?.message || "Unable to load blog categories",
                        },
                        { status: 500 }
                );
        }
}

export async function POST(request) {
        try {
                verifyAdmin(request);

                const payload = await request.json();
                const category = await createBlogCategory(payload);

                return NextResponse.json({
                        success: true,
                        category,
                });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const status = error.message?.includes("exists") ? 409 : 500;

                console.error("[api/admin/blog/categories] create error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message:
                                        error?.message || "Unable to create blog category",
                        },
                        { status }
                );
        }
}
