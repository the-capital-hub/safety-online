import Link from "next/link";
import ProductsPageClient from "./ProductsPageClient.jsx";

export const metadata = {
        title: "Buy Certified Safety Products Online | Safety Online",
        description:
                "Compare BIS-approved PPE, fire safety equipment, and industrial protection gear with expert filters, guides, and enterprise-ready sourcing at Safety Online.",
};

export default function ProductsPage({ searchParams }) {
        return (
                <main className="min-h-screen bg-gray-50">
                        <section className="bg-white">
                                <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-gray-800">
                                        <div className="space-y-4 text-center md:text-left">
                                                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-500">
                                                        Shop trusted protection
                                                </p>
                                                <h1 className="text-3xl font-bold md:text-4xl">
                                                        Safety equipment curated for Indian workplaces
                                                </h1>
                                                <p className="text-base leading-relaxed text-gray-600">
                                                        Our catalogue brings together BIS, CE, and ISO-certified safety solutions across industrial, fire, and road protection categories.
                                                        Use the advanced filters to surface the right gloves, helmets, signage, and spill control kits for your facility size, risk profile, and compliance needs.
                                                        Every listing is vetted by specialists who understand procurement challenges, from multi-site deployments to urgent replacements.
                                                </p>
                                                <p className="text-base leading-relaxed text-gray-600">
                                                        Need support while evaluating? Explore the{" "}
                                                        <Link href="/blog" className="font-semibold text-black underline underline-offset-4">
                                                                Safety Online blog
                                                        </Link>
                                                        {" "}for buying guides, or connect directly with our team on the{" "}
                                                        <Link href="/contact" className="font-semibold text-black underline underline-offset-4">
                                                                contact page
                                                        </Link>
                                                        . Enterprise buyers can review lead times, GST invoicing, and delivery commitments outlined in our{" "}
                                                        <Link href="/shipping-policy" className="font-semibold text-black underline underline-offset-4">
                                                                shipping policy
                                                        </Link>
                                                        , ensuring every order is planned with full transparency.
                                                </p>
                                        </div>
                                </div>
                        </section>
                        <ProductsPageClient searchParams={searchParams} />
                </main>
        );
}
