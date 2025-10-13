"use client";

import { useCallback } from "react";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils.js";

export function BlogShareButton({ title, className }) {
        const handleShare = useCallback(async () => {
                if (typeof window === "undefined") return;

                const shareData = {
                        title,
                        url: window.location.href,
                };

                if (navigator.share) {
                        try {
                                await navigator.share(shareData);
                        } catch (error) {
                                // Ignore failures such as user cancellation
                        }
                        return;
                }

                if (navigator.clipboard?.writeText) {
                        try {
                                await navigator.clipboard.writeText(shareData.url);
                                window.alert("Link copied to clipboard");
                        } catch (error) {
                                // Ignore clipboard errors to avoid breaking UX
                        }
                }
        }, [title]);

        return (
                <button
                        type="button"
                        onClick={handleShare}
                        className={cn(
                                "inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-gray-600 transition hover:border-blue-300 hover:text-blue-700",
                                className,
                        )}
                >
                        <Share2 className="h-4 w-4" /> Share
                </button>
        );
}
