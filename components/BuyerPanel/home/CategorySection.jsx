"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Grid, List, Search } from "lucide-react";
import ProductGrid from "@/components/BuyerPanel/home/ProductGrid.jsx";
import {
	Product4,
	Product5,
	Product6,
	Product7,
	Product8,
	Product9,
} from "@/public/images/home/index.js";

export default function CategorySection({
	searchQuery,
	selectedCategory,
	setSelectedCategory,
}) {
	const [localSearch, setLocalSearch] = useState("");
	const [viewMode, setViewMode] = useState("grid");

	const categories = [
		"All",
		"Barricade",
		"Baton",
		"Cone",
		"Convex Mirror",
		"Corner Guard",
		"Ear Muffs",
		"Helmets",
	];

	const allProducts = [
		{
			id: 1,
			name: "Road Safety",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product4.src,
			category: "Road Safety",
		},
		{
			id: 2,
			name: "Traffic Cone",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product5.src,
			category: "Cone",
		},
		{
			id: 3,
			name: "Industrial Safety",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product6.src,
			category: "Helmets",
		},
		{
			id: 4,
			name: "Q-Manager",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product7.src,
			category: "Barricade",
		},
		{
			id: 5,
			name: "Road Barricade",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product8.src,
			category: "Barricade",
		},
		{
			id: 6,
			name: "Fire Extinguisher",
			description:
				"Road safety refers to the measures and practices used to prevent road accidents and protect members of all road users.",
			price: "₹ 5,000",
			image: Product9.src,
			category: "Safety Equipment",
		},
	];

	const filteredProducts = useMemo(() => {
		let filtered = allProducts;

		// Filter by category
		if (selectedCategory !== "All") {
			filtered = filtered.filter((product) =>
				product.category.toLowerCase().includes(selectedCategory.toLowerCase())
			);
		}

		// Filter by search query
		const searchTerm = localSearch || searchQuery;
		if (searchTerm) {
			filtered = filtered.filter(
				(product) =>
					product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					product.description
						.toLowerCase()
						.includes(searchTerm.toLowerCase()) ||
					product.category.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return filtered;
	}, [selectedCategory, localSearch, searchQuery, allProducts]);

	return (
		<section className="py-8 md:py-16 bg-white">
			<div className="px-10">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mb-8 md:mb-12"
				>
					<p className="text-yellow-500 text-sm font-medium mb-2">Categories</p>
					<h2 className="text-2xl md:text-3xl font-bold">Browse By Category</h2>
				</motion.div>

				{/* Search Bar */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.1 }}
					className="w-full relative mb-6  max-w-xl mx-auto"
				>
					<Input
						placeholder="Search products..."
						value={localSearch}
						onChange={(e) => setLocalSearch(e.target.value)}
						className="pl-10 max-w-xl mx-auto"
					/>
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
				</motion.div>

				{/* Category Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="flex flex-wrap gap-2 mb-6 md:mb-8 justify-center"
				>
					{categories.map((category) => (
						<Button
							key={category}
							variant={selectedCategory === category ? "default" : "outline"}
							className={
								selectedCategory === category ? "bg-black text-white" : ""
							}
							onClick={() => setSelectedCategory(category)}
							size="sm"
						>
							{category}
						</Button>
					))}
				</motion.div>

				{/* Controls */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.3 }}
					className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 space-y-4 sm:space-y-0"
				>
					<h3 className="text-lg md:text-xl font-bold">
						Top Products ({filteredProducts.length})
					</h3>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2 text-sm text-gray-600">
							<Filter className="h-4 w-4" />
							<span>FILTER</span>
						</div>
						<div className="flex space-x-1">
							<Button
								variant={viewMode === "grid" ? "default" : "outline"}
								size="icon"
								onClick={() => setViewMode("grid")}
							>
								<Grid className="h-4 w-4" />
							</Button>
							<Button
								variant={viewMode === "list" ? "default" : "outline"}
								size="icon"
								onClick={() => setViewMode("list")}
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</motion.div>

				{/* Products Grid */}
				<ProductGrid products={filteredProducts} viewMode={viewMode} />

				{/* Load More Button */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="text-center mt-8 md:mt-12"
				>
					<Button variant="outline" className="px-8">
						Load More
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
