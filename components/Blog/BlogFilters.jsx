import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const buildQuery = (baseParams, updates) => {
        const params = new URLSearchParams(baseParams);

        Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === null || value === "") {
                        params.delete(key);
                } else {
                        params.set(key, value);
                }
        });

        const queryString = params.toString();
        return queryString ? `/blog?${queryString}` : "/blog";
};

export function BlogFilters({ categories = [], tags = [], current = {} }) {
        const { search = "", category = "", tag = "" } = current;
        const baseParams = {
                ...(search ? { search } : {}),
                ...(category ? { category } : {}),
                ...(tag ? { tag } : {}),
        };

        return (
                <section className="space-y-6 rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm">
                        <form className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                                <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                                type="search"
                                                name="search"
                                                defaultValue={search}
                                                placeholder="Search by keyword or topic"
                                                className="pl-9"
                                        />
                                        {category && <input type="hidden" name="category" value={category} />}
                                        {tag && <input type="hidden" name="tag" value={tag} />}
                                </div>
                                <Button type="submit" className="md:self-start">
                                        Apply search
                                </Button>
                                {(search || category || tag) && (
                                        <Link
                                                href="/blog"
                                                className="inline-flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                                        >
                                                Reset filters
                                        </Link>
                                )}
                        </form>

                        <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                                                Categories
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                                <Link
                                                        href={buildQuery(baseParams, { category: "" })}
                                                        className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium transition ${
                                                                !category
                                                                        ? "border-blue-500 bg-blue-600 text-white"
                                                                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
                                                        }`}
                                                >
                                                        All
                                                </Link>
                                                {categories.map((item) => (
                                                        <Link
                                                                key={item._id}
                                                                href={buildQuery(baseParams, { category: item.slug })}
                                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition ${
                                                                        category === item.slug
                                                                                ? "border-blue-500 bg-blue-600 text-white"
                                                                                : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
                                                                }`}
                                                        >
                                                                {item.name}
                                                                <span className="text-xs font-semibold">{item.postCount}</span>
                                                        </Link>
                                                ))}
                                        </div>
                                </div>

                                <div className="space-y-3">
                                        <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">
                                                Tags
                                        </p>
                                        {tags.length === 0 ? (
                                                <p className="text-sm text-gray-500">
                                                        Tags will appear after posts are published with tag metadata.
                                                </p>
                                        ) : (
                                                <div className="flex flex-wrap gap-2">
                                                        <Link
                                                                href={buildQuery(baseParams, { tag: "" })}
                                                                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                                                                        !tag
                                                                                ? "border-blue-500 bg-blue-600 text-white"
                                                                                : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
                                                                }`}
                                                        >
                                                                All tags
                                                        </Link>
                                                        {tags.map((item) => (
                                                                <Link
                                                                        key={item.label}
                                                                        href={buildQuery(baseParams, { tag: item.label })}
                                                                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                                                                                tag === item.label
                                                                                        ? "border-blue-500 bg-blue-600 text-white"
                                                                                        : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
                                                                        }`}
                                                                >
                                                                        #{item.label}
                                                                        <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700">
                                                                                {item.count}
                                                                        </Badge>
                                                                </Link>
                                                        ))}
                                                </div>
                                        )}
                                </div>
                        </div>
                </section>
        );
}
