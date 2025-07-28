"use client";

import { useState, useEffect } from "react";

export function useProduct(productId) {
	const [product, setProduct] = useState(null);
	const [relatedProducts, setRelatedProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!productId) return;

		const fetchProduct = async () => {
			try {
				setLoading(true);
				setError(null);

				const response = await fetch(`/api/products/${productId}`);
				const data = await response.json();

				if (data.success) {
					setProduct(data.product);
					setRelatedProducts(data.relatedProducts || []);
				} else {
					setError(data.message || "Failed to fetch product");
				}
			} catch (err) {
				setError("Network error occurred");
				console.error("Product fetch error:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchProduct();
	}, [productId]);

	return { product, relatedProducts, loading, error };
}
