import { BlogCard } from "@/components/Blog/BlogCard.jsx";
import { BlogFilters } from "@/components/Blog/BlogFilters.jsx";
import { BlogFeaturedSection } from "@/components/Blog/BlogFeaturedSection.jsx";
import { BlogPagination } from "@/components/Blog/BlogPagination.jsx";
import {
        getFeaturedBlogPosts,
        getPublishedBlogPosts,
} from "@/lib/services/blog.js";

export const metadata = {
        title: "Safety Online Blog | Insights, Stories, and Best Practices",
        description:
                "Explore safety strategies, compliance tips, and inspiring stories from the Safety Online community.",
};

const serializeParams = (searchParams) => {
        const result = {};
        for (const [key, value] of Object.entries(searchParams || {})) {
                if (value) {
                        result[key] = value;
                }
        }
        return result;
};

export default async function BlogPage({ searchParams }) {
        const params = serializeParams(searchParams);
        const page = Number.parseInt(params.page || "1", 10);
        const search = params.search || "";
        const category = params.category || "";
        const tag = params.tag || "";

        const [listData, featuredData] = await Promise.all([
                getPublishedBlogPosts({ page, search, category, tag }),
                getFeaturedBlogPosts(3),
        ]);

        const { posts, categories, tags, pagination } = listData;
        const featuredPosts = featuredData.posts || [];

        return (
                <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                        <header className="space-y-4 text-center">
                                <p className="inline-flex rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                        Safety insights & stories
                                </p>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                                        Stay informed. Stay protected.
                                </h1>
                                <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600">
                                        Practical guides, expert commentary, and real-world success stories to keep your teams safe
                                        and compliant.
                                </p>
                        </header>

                        {featuredPosts.length > 0 && <BlogFeaturedSection posts={featuredPosts} />}

                        <BlogFilters categories={categories} tags={tags} current={{ search, category, tag }} />

                        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                {posts.map((post) => (
                                        <BlogCard key={post._id} post={post} />
                                ))}
                                {posts.length === 0 && (
                                        <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
                                                <h2 className="text-xl font-semibold text-gray-800">No posts found</h2>
                                                <p className="mt-2 text-sm text-gray-500">
                                                        Try adjusting your search or explore other categories to discover new
                                                        stories.
                                                </p>
                                        </div>
                                )}
                        </section>

                        <BlogPagination pagination={pagination} params={params} />
                </main>
        );
}
