"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProductStore } from "@/store/productStore.js";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavigationBar({ isMenuOpen, onMenuClose }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [navCategories, setNavCategories] = useState([]);
	const router = useRouter();
	const {
		setSearchQuery: setGlobalSearch,
		currentCategory,
		setCurrentCategory,
	} = useProductStore();

	useEffect(() => {
		let active = true;
		(async () => {
			try {
				const res = await fetch("/api/categories");
				const data = await res.json();
				if (!active) return;
				if (data.success) {
					setNavCategories(data.categories || []);
				} else {
					setNavCategories([]);
				}
			} catch (e) {
				setNavCategories([]);
			}
		})();
		return () => {
			active = false;
		};
	}, []);

	const handleCategoryClick = (categoryName) => {
		const formattedCategory = categoryName.replace(/\s+/g, "-"); // replace spaces with -
		setCurrentCategory(formattedCategory);
		router.push(`/products?category=${encodeURIComponent(formattedCategory)}`);
		if (onMenuClose) onMenuClose();
	};

	const handleSubcategoryClick = (categoryName, subName) => {
		const formattedCategory = categoryName.replace(/\s+/g, "-");
		const formattedSubName = subName.replace(/\s+/g, "-");
		router.push(
			`/products?category=${encodeURIComponent(
				formattedCategory
			)}&subCategory=${encodeURIComponent(formattedSubName)}`
		);
		if (onMenuClose) onMenuClose();
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setGlobalSearch(searchQuery);
			router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
		}
	};

	function toSentenceCase(str) {
		if (!str) return "";

		return str
			.toLowerCase()
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(" ");
	}

	return (
		<nav
			className={`${
				isMenuOpen ? "block" : "hidden"
			} lg:block bg-white border-t shadow-sm`}
		>
			<div className="px-4 lg:px-10 relative z-10">
				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0 overflow-x-auto hide-scrollbar">
					<div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-4">
						<Button
							variant="ghost"
							className={`${
								currentCategory === "all"
									? "bg-black text-white"
									: "hover:bg-gray-100"
							} justify-start lg:justify-center`}
							onClick={() => handleCategoryClick("all")}
						>
							All PRODUCTS
						</Button>

						{navCategories.map((cat) => {
							const hasSubs = cat.subCategories || [];
							if (hasSubs) {
								return (
									<DropdownMenu key={cat._id || cat.name}>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												className={`${
													currentCategory === cat.name
														? "bg-black text-white"
														: "hover:bg-gray-100"
												} justify-start lg:justify-center`}
											>
												{cat.name.toUpperCase()}
												<ChevronDown className="ml-1 h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											{(cat.subCategories || []).map((sub, i) => (
												<DropdownMenuItem
													key={i}
													onClick={() =>
														handleSubcategoryClick(cat.name, sub.name)
													}
												>
													{toSentenceCase(sub.name)}
												</DropdownMenuItem>
											))}
										</DropdownMenuContent>
									</DropdownMenu>
								);
							}
							return (
								<Button
									key={cat._id || cat.name}
									variant="ghost"
									className={`${
										currentCategory === cat.name
											? "bg-black text-white"
											: "hover:bg-gray-100"
									} justify-start lg:justify-center`}
									onClick={() => handleCategoryClick(cat.name)}
								>
									{cat.name}
								</Button>
							);
						})}
					</div>

					{/* Optional search (kept commented out as in original) */}
					{/* <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Input
                placeholder="Search products..."
                className="w-full sm:w-64 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form> */}
				</div>
			</div>
		</nav>
	);
}
