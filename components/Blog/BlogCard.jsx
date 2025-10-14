import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, BookOpen } from "lucide-react";

export function BlogCard({ post }) {
        const publishedLabel = post.publishedAt
                ? new Intl.DateTimeFormat("en", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                  }).format(new Date(post.publishedAt))
                : "Draft";

        return (
                <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                        <Link href={`/blog/${post.slug}`} className="relative block h-56 overflow-hidden">
                                {post.coverImage?.url ? (
                                        <Image
                                                src={post.coverImage.url}
                                                alt={post.coverImage?.alt || post.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                priority={false}
                                        />
                                ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-slate-700 text-white">
                                                <BookOpen className="h-10 w-10 text-white/80" />
                                        </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                                <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
                                        {post.categories?.map((category) => (
                                                <Badge
                                                        key={category._id}
                                                        className="bg-white/90 text-xs font-semibold text-gray-900"
                                                >
                                                        {category.name}
                                                </Badge>
                                        ))}
                                        {post.isFeatured && (
                                                <Badge className="bg-amber-500/90 text-xs font-semibold text-white">
                                                        Featured
                                                </Badge>
                                        )}
                                </div>
                        </Link>

                        <div className="flex flex-1 flex-col space-y-4 px-6 pb-6 pt-5">
                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                                        <span className="inline-flex items-center gap-1">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {publishedLabel}
                                        </span>
                                        {post.readingTime && (
                                                <span className="inline-flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" /> {post.readingTime} min read
                                                </span>
                                        )}
                                        {post.author?.name && (
                                                <span className="truncate text-gray-600">By {post.author.name}</span>
                                        )}
                                </div>

                                <h3 className="text-xl font-semibold tracking-tight text-gray-900 group-hover:text-blue-700">
                                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                </h3>

                                <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
                                        {post.excerpt || "Discover the latest insights from our safety experts."}
                                </p>

                                {post.tags?.length > 0 && (
                                        <div className="mt-auto flex flex-wrap gap-2 text-xs text-blue-700">
                                                {post.tags.slice(0, 4).map((tag) => (
                                                        <span
                                                                key={`${post._id}-${tag}`}
                                                                className="rounded-full bg-blue-50 px-3 py-1 font-medium"
                                                        >
                                                                #{tag}
                                                        </span>
                                                ))}
                                        </div>
                                )}
                        </div>
                </article>
        );
}
