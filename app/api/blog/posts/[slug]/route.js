import { NextResponse } from "next/server";
import { getBlogPostBySlug } from "@/lib/services/blog.js";

export async function GET(_request, { params }) {
        try {
                const { slug } = params;

                const post = await getBlogPostBySlug(slug);

                if (!post) {
                        return NextResponse.json(
                                {
                                        success: false,
                                        message: "Post not found",
                                },
                                { status: 404 }
                        );
                }

                return NextResponse.json({
                        success: true,
                        post,
                });
        } catch (error) {
                console.error("[api/blog/posts/:slug] error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error?.message || "Unable to load blog post",
                        },
                        { status: 500 }
                );
        }
}
