import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import {
        createBlogPost,
        getAdminBlogPosts,
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

                const { searchParams } = new URL(request.url);

                const page = searchParams.get("page") || "1";
                const limit = searchParams.get("limit") || "10";
                const search = searchParams.get("search") || "";
                const status = searchParams.get("status") || "all";
                const category = searchParams.get("category") || "";
                const tag = searchParams.get("tag") || "";

                const result = await getAdminBlogPosts({
                        page,
                        limit,
                        search,
                        status,
                        category,
                        tag,
                });

                return NextResponse.json({
                        success: true,
                        ...result,
                });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                console.error("[api/admin/blog/posts] error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message:
                                        error?.message || "Unable to load blog posts for admin",
                        },
                        { status: 500 }
                );
        }
}

export async function POST(request) {
        try {
                verifyAdmin(request);

                const payload = await request.json();
                const post = await createBlogPost(payload);

                return NextResponse.json({
                        success: true,
                        post,
                });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const status = error.message?.includes("slug")
                        ? 409
                        : error.message?.includes("Title")
                        ? 400
                        : 500;

                console.error("[api/admin/blog/posts] create error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error?.message || "Unable to create blog post",
                        },
                        { status }
                );
        }
}
