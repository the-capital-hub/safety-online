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
        const getFirstValue = (value) => (Array.isArray(value) ? value[0] : value);

        const sectionParam = getFirstValue(searchParams?.section);
        const labelParam = getFirstValue(searchParams?.label);
        const typeParam = getFirstValue(searchParams?.type);
        const parentLabelParam = getFirstValue(searchParams?.parentLabel);

        const normalizedSection = sectionParam?.toLowerCase();
        const normalizedType = typeParam?.toLowerCase();
        const displayLabel = labelParam || "This page";
        const parentDisplayLabel = parentLabelParam || "";
        const messageFromPreset = normalizedSection ? messages[normalizedSection] : null;

        const fallbackMessage = (() => {
                if (normalizedType === "sub") {
                        const parentSuffix = parentDisplayLabel ? ` in ${parentDisplayLabel}` : "";
                        return `We're curating products for ${displayLabel}${parentSuffix}. Please check back soon.`;
                }

                if (displayLabel === "This page") {
                        return "We are working hard to bring this experience to you. Please check back soon for updates.";
                }

                return `We're working hard to bring ${displayLabel} to you. Please check back soon.`;
        })();

        const message = messageFromPreset || fallbackMessage;

        const headingLabel =
                normalizedType === "sub" && parentDisplayLabel
                        ? `${displayLabel} in ${parentDisplayLabel}`
                        : displayLabel;

        return (
                <div className="min-h-[calc(100vh-120px)] flex items-center justify-center bg-white px-4 py-16">
                        <div className="max-w-2xl text-center space-y-6">
                                <p className="text-sm font-semibold tracking-wide text-gray-500 uppercase">
                                        Coming Soon
                                </p>
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                        {headingLabel} page is under construction
                                </h1>
                                <p className="text-base sm:text-lg text-gray-600">
                                        {message}
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
