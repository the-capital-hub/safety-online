"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/lib/store";

export default function NavigationBar({ isMenuOpen, onMenuClose }) {
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();
	const { setSearchQuery: setGlobalSearch, currentCategory } =
		useProductStore();

	const categories = [
		{ id: "all", label: "All Products" },
		{ id: "personal-safety", label: "Personal Safety" },
		{ id: "road-safety", label: "Road Safety" },
		{ id: "signage", label: "Retro Reflective Sign" },
		{ id: "industrial-safety", label: "Industrial Safety/PPE" },
		{ id: "queue-management", label: "Q-Please" },
	];

	const handleCategoryClick = (categoryId) => {
		router.push(`/products?category=${categoryId}`);
		if (onMenuClose) onMenuClose();
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setGlobalSearch(searchQuery);
			router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
		}
	};

	return (
		<nav
			className={`${
				isMenuOpen ? "block" : "hidden"
			} lg:block bg-white border-t shadow-sm`}
		>
			<div className="px-4 lg:px-10">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
					<div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-8">
						{categories.map((category) => (
							<Button
								key={category.id}
								variant="ghost"
								className={`${
									currentCategory === category.id
										? "bg-black text-white"
										: "hover:bg-gray-100"
								}`}
								onClick={() => handleCategoryClick(category.id)}
							>
								{category.label}
								<ChevronDown className="ml-1 h-4 w-4" />
							</Button>
						))}
					</div>

					<form
						onSubmit={handleSearch}
						className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4"
					>
						<div className="relative">
							<Input
								placeholder="Search products..."
								className="w-full sm:w-64 pr-10"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						</div>
					</form>
				</div>
			</div>
		</nav>
	);
}
