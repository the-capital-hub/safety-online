import { NextResponse } from "next/server";
import {
        getFeaturedBlogPosts,
        getPublishedBlogPosts,
} from "@/lib/services/blog.js";

export async function GET(request) {
        try {
                const { searchParams } = new URL(request.url);

                const page = searchParams.get("page") || "1";
                const limit = searchParams.get("limit") || "9";
                const search = searchParams.get("search") || "";
                const category = searchParams.get("category") || "";
                const tag = searchParams.get("tag") || "";
                const featuredOnly = searchParams.get("featured") === "true";

                if (featuredOnly) {
                        const { posts } = await getFeaturedBlogPosts(limit);

                        return NextResponse.json({
                                success: true,
                                posts,
                        });
                }

                const result = await getPublishedBlogPosts({
                        page,
                        limit,
                        search,
                        category,
                        tag,
                });

                return NextResponse.json({
                        success: true,
                        ...result,
                });
        } catch (error) {
                console.error("[api/blog/posts] error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message: error?.message || "Unable to fetch blog posts",
                        },
                        { status: 500 }
                );
        }
}
