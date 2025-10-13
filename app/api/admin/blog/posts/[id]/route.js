import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import {
        deleteBlogPost,
        getBlogPostById,
        updateBlogPost,
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

export async function GET(request, { params }) {
        try {
                verifyAdmin(request);

                const { id } = params;

                const post = await getBlogPostById(id);

                if (!post) {
                        return NextResponse.json(
                                { success: false, message: "Post not found" },
                                { status: 404 }
                        );
                }

                return NextResponse.json({ success: true, post });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                console.error("[api/admin/blog/posts/:id] fetch error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error?.message || "Unable to fetch blog post",
                        },
                        { status: 500 }
                );
        }
}

export async function PUT(request, { params }) {
        try {
                verifyAdmin(request);

                const { id } = params;
                const payload = await request.json();

                const post = await updateBlogPost(id, payload);

                return NextResponse.json({ success: true, post });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const status = error.message?.includes("slug")
                        ? 409
                        : error.message?.includes("Invalid")
                        ? 400
                        : 500;

                console.error("[api/admin/blog/posts/:id] update error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error?.message || "Unable to update blog post",
                        },
                        { status }
                );
        }
}

export async function DELETE(request, { params }) {
        try {
                verifyAdmin(request);

                const { id } = params;
                const post = await deleteBlogPost(id);

                return NextResponse.json({ success: true, post });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const status = error.message?.includes("Invalid")
                        ? 400
                        : 500;

                console.error("[api/admin/blog/posts/:id] delete error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error?.message || "Unable to delete blog post",
                        },
                        { status }
                );
        }
}
