import Link from "next/link";
import { Button } from "@/components/ui/button";

const buildQuery = (params, page) => {
        const searchParams = new URLSearchParams(params);
        if (page <= 1) {
                searchParams.delete("page");
        } else {
                searchParams.set("page", page.toString());
        }
        const query = searchParams.toString();
        return query ? `/blog?${query}` : "/blog";
};

export function BlogPagination({ pagination, params = {} }) {
        if (!pagination || pagination.totalPages <= 1) {
                        return null;
        }

        const currentPage = pagination.page;
        const totalPages = pagination.totalPages;

        return (
                <nav className="flex items-center justify-between rounded-3xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                        <div className="text-sm text-gray-500">
                                Showing {pagination.page} of {totalPages} pages
                        </div>
                        <div className="flex items-center gap-2">
                                <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage <= 1}
                                >
                                        <Link href={buildQuery(params, Math.max(currentPage - 1, 1))}>Previous</Link>
                                </Button>
                                <span className="text-xs font-medium text-gray-400">
                                        Page {currentPage} / {totalPages}
                                </span>
                                <Button
                                        asChild
                                        variant="outline"
                                        size="sm"
                                        disabled={currentPage >= totalPages}
                                >
                                        <Link href={buildQuery(params, Math.min(currentPage + 1, totalPages))}>Next</Link>
                                </Button>
                        </div>
                </nav>
        );
}
