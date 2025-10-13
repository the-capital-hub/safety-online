import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ArrowUpRight } from "lucide-react";

export function BlogFeaturedSection({ posts = [] }) {
        if (!posts?.length) {
                return null;
        }

        const [primary, ...secondary] = posts;

        const formatDate = (date) =>
                new Intl.DateTimeFormat("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                }).format(new Date(date));

        return (
                <section className="relative overflow-hidden rounded-[2.5rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-10">
                        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                                <div className="space-y-6">
                                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                                                Featured stories
                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                Curated by editors
                                        </div>
                                        <article className="rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-white/60 backdrop-blur">
                                                <div className="relative mb-6 h-72 overflow-hidden rounded-3xl">
                                                        {primary.coverImage?.url && (
                                                                <Image
                                                                        src={primary.coverImage.url}
                                                                        alt={primary.coverImage?.alt || primary.title}
                                                                        fill
                                                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                                                        className="object-cover"
                                                                />
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
                                                        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                                                {primary.categories?.map((category) => (
                                                                        <Badge key={category._id} className="bg-white/90 text-xs font-semibold text-gray-900">
                                                                                {category.name}
                                                                        </Badge>
                                                                ))}
                                                        </div>
                                                </div>
                                                <div className="space-y-4">
                                                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                                                                <span className="inline-flex items-center gap-1">
                                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                                        {primary.publishedAt ? formatDate(primary.publishedAt) : "Draft"}
                                                                </span>
                                                                {primary.author?.name && <span>By {primary.author.name}</span>}
                                                                {primary.readingTime && <span>{primary.readingTime} min read</span>}
                                                        </div>
                                                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                                                <Link href={`/blog/${primary.slug}`} className="hover:text-blue-700">
                                                                        {primary.title}
                                                                </Link>
                                                        </h2>
                                                        <p className="text-base leading-relaxed text-slate-600">
                                                                {primary.excerpt || "Explore the latest in safety innovation and best practices."}
                                                        </p>
                                                        <Link
                                                                href={`/blog/${primary.slug}`}
                                                                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
                                                        >
                                                                Read the full story <ArrowUpRight className="h-4 w-4" />
                                                        </Link>
                                                </div>
                                        </article>
                                </div>

                                <div className="grid gap-4 self-stretch">
                                        {secondary.map((post) => (
                                                <article
                                                        key={post._id}
                                                        className="group flex flex-col gap-3 rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                                >
                                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                                {post.categories?.[0] && (
                                                                        <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                                                                                {post.categories[0].name}
                                                                        </span>
                                                                )}
                                                                {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                                                        </div>
                                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700">
                                                                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                                        </h3>
                                                        <p className="line-clamp-2 text-sm text-gray-600">
                                                                {post.excerpt || "Discover new perspectives on workplace safety."}
                                                        </p>
                                                        <Link
                                                                href={`/blog/${post.slug}`}
                                                                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
                                                        >
                                                                Read more <ArrowUpRight className="h-4 w-4" />
                                                        </Link>
                                                </article>
                                        ))}
                                </div>
                        </div>
                        <div className="pointer-events-none absolute -top-20 right-20 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 left-16 h-32 w-32 rounded-full bg-indigo-100/40 blur-3xl" />
                </section>
        );
}
