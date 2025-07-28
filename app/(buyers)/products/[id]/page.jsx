import { notFound } from "next/navigation";
import ProductDetail from "@/components/BuyerPanel/products/ProductDetail.jsx";

// Server-side function to fetch product data
async function getProduct(id) {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
		const response = await fetch(`${baseUrl}/api/products/${id}`, {
			cache: "no-store",
		});

		if (!response.ok) {
			return null;
		}

		const data = await response.json();
		return data.success ? data : null;
	} catch (error) {
		console.error("Error fetching product:", error);
		return null;
	}
}

// Generate metadata for the product page
export async function generateMetadata({ params }) {
	const { id } = await params; // Await params to ensure it's resolved
	const data = await getProduct(id);
	const product = data?.product;

	if (!product) {
		return {
			title: "Product Not Found",
			description: "The requested product could not be found",
		};
	}

	return {
		title: `${product.name} | Safety Equipment Store`,
		description: product.description,
		openGraph: {
			title: product.name,
			description: product.description,
			images: product.images?.length > 0 ? [product.images[0]] : [],
		},
	};
}

// ProductPage component
export default async function ProductPage({ params }) {
	const { id } = await params; // Await params to ensure it's resolved
	const data = await getProduct(id);

	if (!data || !data.product) {
		notFound();
	}

	return (
		<ProductDetail
			product={data.product}
			relatedProducts={data.relatedProducts}
		/>
	);
}
