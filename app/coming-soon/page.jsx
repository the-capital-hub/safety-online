import Link from "next/link";

const messages = {
        "road-safety": "Our road safety catalogue is currently in the works.",
        "industrial-safety": "Industrial safety solutions are on their way.",
        "q-manager": "Queue management products will be available soon.",
        "fire-safety": "Fire safety equipment will be launching shortly.",
        "road-sign": "Road signage options are coming soon.",
        "contact-us": "A dedicated contact page will be available soon.",
        home: "The home page navigation is being refreshed.",
};

export const metadata = {
        title: "Coming Soon | Safety",
};

export default function ComingSoonPage({ searchParams }) {
        const sectionParam = Array.isArray(searchParams?.section)
                ? searchParams.section[0]
                : searchParams?.section;
        const labelParam = Array.isArray(searchParams?.label)
                ? searchParams.label[0]
                : searchParams?.label;

        const normalizedSection = sectionParam?.toLowerCase();
        const displayLabel = labelParam || "This page";
        const message = normalizedSection ? messages[normalizedSection] : null;

        return (
                <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-white px-4 py-16">
                        <div className="max-w-2xl text-center space-y-6">
                                <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                                        Coming Soon
                                </p>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                        {displayLabel} page is under construction
                                </h1>
                                <p className="text-base sm:text-lg text-gray-600">
                                        {message ||
                                                "We are working hard to bring this experience to you. Please check back soon for updates."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                        <Link
                                                href="/"
                                                className="inline-flex items-center justify-center rounded-md bg-black px-6 py-3 text-sm font-medium text-white shadow hover:bg-black/90"
                                        >
                                                Go to Home
                                        </Link>
                                        <Link
                                                href="/products"
                                                className="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                        >
                                                Browse Products
                                        </Link>
                                </div>
                        </div>
                </div>
        );
}
