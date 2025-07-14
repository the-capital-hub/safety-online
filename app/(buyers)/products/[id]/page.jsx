import { notFound } from "next/navigation";
import ProductDetail from "@/components/BuyerPanel/products/ProductDetail.jsx";
import productsData from "@/constants/products.js";

// This would normally be a server component fetching from API
async function getProduct(id) {
	// Simulate API call
	// await new Promise((resolve) => setTimeout(resolve, 1000));

	return productsData.find((product) => product.id === id);
}

export async function generateMetadata({ params }) {
	const product = await getProduct(params.id);

	if (!product) {
		return {
			title: "Product Not Found",
			description: "The requested product could not be found",
		};
	}

	return {
		title: `${product.name} | Safety Equipment Store`,
		description: product.description,
	};
}

export default async function ProductPage({ params }) {
	const product = await getProduct(params.id);

	if (!product) {
		notFound();
	}

	return <ProductDetail product={product} />;
}
