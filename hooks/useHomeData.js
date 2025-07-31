"use client";

import { useState, useEffect } from "react";

export function useHomeData(category = "all", search = "", page = 1) {
	const [data, setData] = useState({
		discountedProducts: [],
		topSellingProducts: [],
		bestSellingProduct: null,
		featuredProducts: [],
		categoryProducts: [],
		categories: [],
		pagination: null,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const fetchHomeData = async () => {
		setIsLoading(true);
		setError(null);

		try {
			const params = new URLSearchParams({
				category,
				search,
				page: page.toString(),
				limit: "12",
			});

			const response = await fetch(`/api/home?${params}`);
			const result = await response.json();

			if (result.success) {
				setData(result.data);
			} else {
				setError(result.message);
			}
		} catch (err) {
			setError("Failed to fetch home data");
			console.error("Home data fetch error:", err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchHomeData();
	}, [category, search, page]);

	return {
		...data,
		isLoading,
		error,
		refetch: fetchHomeData,
	};
}
