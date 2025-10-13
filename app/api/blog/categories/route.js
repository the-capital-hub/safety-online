import { NextResponse } from "next/server";
import { getBlogCategoriesWithCounts } from "@/lib/services/blog.js";

export async function GET() {
        try {
                const categories = await getBlogCategoriesWithCounts();

                return NextResponse.json({
                        success: true,
                        categories,
                });
        } catch (error) {
                console.error("[api/blog/categories] error", error);
                return NextResponse.json(
                        {
                                success: false,
                                message:
                                        error?.message || "Unable to fetch blog categories",
                        },
                        { status: 500 }
                );
        }
}
