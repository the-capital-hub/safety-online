import ProductsPageClient from "./ProductsPageClient.jsx";

export const metadata = {
        title: "Buy Certified Safety Products Online | Safety Online",
        description:
                "Compare BIS-approved PPE, fire safety equipment, and industrial protection gear with expert filters, guides, and enterprise-ready sourcing at Safety Online.",
};

export default function ProductsPage({ searchParams }) {
        return (
                <main className="min-h-screen bg-gray-50">
                        <ProductsPageClient searchParams={searchParams} />
                </main>
        );
}
