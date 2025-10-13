import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { deleteBlogCategory, updateBlogCategory } from "@/lib/services/blog.js";

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

export async function PUT(request, { params }) {
        try {
                verifyAdmin(request);

                const { id } = params;
                const payload = await request.json();

                const category = await updateBlogCategory(id, payload);

                return NextResponse.json({ success: true, category });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const status = error.message?.includes("slug")
                        ? 409
                        : error.message?.includes("name")
                        ? 409
                        : error.message?.includes("Invalid")
                        ? 400
                        : 500;

                console.error("[api/admin/blog/categories/:id] update error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message:
                                        error?.message || "Unable to update blog category",
                        },
                        { status }
                );
        }
}

export async function DELETE(request, { params }) {
        try {
                verifyAdmin(request);

                const { id } = params;

                const category = await deleteBlogCategory(id);

                return NextResponse.json({ success: true, category });
        } catch (error) {
                if (error.message === "Unauthorized") {
                        return NextResponse.json(
                                { success: false, message: "Unauthorized" },
                                { status: 401 }
                        );
                }

                const status = error.message?.includes("associated")
                        ? 409
                        : error.message?.includes("Invalid")
                        ? 400
                        : 500;

                console.error("[api/admin/blog/categories/:id] delete error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message:
                                        error?.message || "Unable to delete blog category",
                        },
                        { status }
                );
        }
}
