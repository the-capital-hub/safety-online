export default function PromotionBannersLoading() {
        return (
                <div className="space-y-6">
                        <div className="space-y-2">
                                <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
                                <div className="h-4 w-72 animate-pulse rounded bg-gray-100" />
                        </div>
                        <div className="grid gap-6 lg:grid-cols-2">
                                {[...Array(2)].map((_, index) => (
                                        <div
                                                key={index}
                                                className="space-y-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                                        >
                                                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                                                <div className="h-40 w-full animate-pulse rounded-2xl bg-gray-100" />
                                                <div className="space-y-2">
                                                        <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                                                        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                                                </div>
                                        </div>
                                ))}
                        </div>
                </div>
        );
}
