import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Share2, ArrowLeft } from "lucide-react";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/services/blog.js";
import { BlogCard } from "@/components/Blog/BlogCard.jsx";

const formatDate = (value) =>
        value
                ? new Intl.DateTimeFormat("en", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                  }).format(new Date(value))
                : "Draft";

export async function generateMetadata({ params }) {
        const post = await getBlogPostBySlug(params.slug);

        if (!post) {
                return {
                        title: "Article not found",
                        description: "The requested blog post could not be located.",
                };
        }

        const keywords = post.metaKeywords?.length ? post.metaKeywords : post.tags || [];
        const description = post.metaDescription || post.excerpt || "Discover safety insights and guidance.";
        const image = post.coverImage?.url;

        return {
                title: post.metaTitle || post.title,
                description,
                keywords,
                alternates: {
                        canonical: `/blog/${post.slug}`,
                },
                openGraph: {
                        title: post.metaTitle || post.title,
                        description,
                        type: "article",
                        url: `/blog/${post.slug}`,
                        publishedTime: post.publishedAt || undefined,
                        modifiedTime: post.updatedAt || undefined,
                        tags: post.tags,
                        images: image ? [{ url: image, alt: post.coverImage?.alt || post.title }] : undefined,
                },
                twitter: {
                        card: "summary_large_image",
                        title: post.metaTitle || post.title,
                        description,
                        images: image ? [image] : undefined,
                },
        };
}

export default async function BlogPostPage({ params }) {
        const post = await getBlogPostBySlug(params.slug);

        if (!post) {
                notFound();
        }

        const relatedPosts = await getRelatedBlogPosts(post, { limit: 3 });

        return (
                <main className="mx-auto flex max-w-4xl flex-col gap-12 px-4 pb-16 pt-10 sm:px-6 lg:px-8">
                        <nav className="flex items-center gap-2 text-sm text-blue-700">
                                <Link href="/blog" className="inline-flex items-center gap-2 font-medium hover:text-blue-800">
                                        <ArrowLeft className="h-4 w-4" /> Back to all articles
                                </Link>
                        </nav>

                        <article className="space-y-10">
                                <header className="space-y-6 text-center">
                                        <div className="flex flex-wrap justify-center gap-2">
                                                {post.categories?.map((category) => (
                                                        <span
                                                                key={category._id}
                                                                className="rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700"
                                                        >
                                                                {category.name}
                                                        </span>
                                                ))}
                                        </div>
                                        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                                                {post.title}
                                        </h1>
                                        <p className="mx-auto max-w-2xl text-base text-slate-600">{post.excerpt}</p>
                                        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-500">
                                                <span className="inline-flex items-center gap-2">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {formatDate(post.publishedAt || post.updatedAt)}
                                                </span>
                                                {post.readingTime && (
                                                        <span className="inline-flex items-center gap-2">
                                                                <Clock className="h-4 w-4" /> {post.readingTime} min read
                                                        </span>
                                                )}
                                                {post.author?.name && (
                                                        <span className="inline-flex items-center gap-2">
                                                                <span className="font-semibold text-slate-700">
                                                                        {post.author.name}
                                                                </span>
                                                        </span>
                                                )}
                                                <button
                                                        type="button"
                                                        onClick={() => {
                                                                if (typeof window === "undefined") return;
                                                                const shareData = {
                                                                        title: post.title,
                                                                        url: window.location.href,
                                                                };
                                                                if (navigator.share) {
                                                                        navigator.share(shareData).catch(() => {});
                                                                } else if (navigator.clipboard?.writeText) {
                                                                        navigator.clipboard.writeText(shareData.url);
                                                                        window.alert("Link copied to clipboard");
                                                                }
                                                        }}
                                                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:border-blue-300 hover:text-blue-700"
                                                >
                                                        <Share2 className="h-4 w-4" /> Share
                                                </button>
                                        </div>
                                </header>

                                {post.coverImage?.url && (
                                        <div className="relative h-96 overflow-hidden rounded-[2.5rem]">
                                                <Image
                                                        src={post.coverImage.url}
                                                        alt={post.coverImage?.alt || post.title}
                                                        fill
                                                        sizes="100vw"
                                                        className="object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                                        </div>
                                )}

                                <section className="prose prose-lg mx-auto max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-700 prose-a:no-underline hover:prose-a:text-blue-800">
                                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                                </section>

                                {post.tags?.length > 0 && (
                                        <footer className="flex flex-wrap gap-2 pt-6">
                                                {post.tags.map((tagItem) => (
                                                        <span
                                                                key={tagItem}
                                                                className="rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700"
                                                        >
                                                                #{tagItem}
                                                        </span>
                                                ))}
                                        </footer>
                                )}
                        </article>

                        {relatedPosts.length > 0 && (
                                <section className="space-y-6">
                                        <h2 className="text-2xl font-semibold text-slate-900">Related reading</h2>
                                        <div className="grid gap-6 md:grid-cols-2">
                                                {relatedPosts.map((related) => (
                                                        <BlogCard key={related._id} post={related} />
                                                ))}
                                        </div>
                                </section>
                        )}
                </main>
        );
}
