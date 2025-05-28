"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Menu,
	Search,
	ShoppingCart,
	Heart,
	User,
	ChevronDown,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, useProductStore } from "@/lib/store";
import Logo from "@/public/images/home/Logo.png";

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const router = useRouter();
	const { getTotalItems } = useCartStore();
	const { setSearchQuery: setGlobalSearch } = useProductStore();
	const { currentCategory } = useProductStore();

	const totalItems = getTotalItems();

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
		setIsMenuOpen(false);
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			setGlobalSearch(searchQuery);
			router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
		}
	};

	return (
		<header className="bg-white shadow-sm sticky top-0 z-50">
			<div className="px-4 lg:px-10">
				{/* Top Bar */}
				<div className="flex items-center justify-between py-4">
					<div className="flex items-center space-x-2 md:space-x-4">
						<Button
							variant="ghost"
							size="icon"
							className="lg:hidden"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</Button>

						<Link href="/" className="flex items-center space-x-2">
							<Image
								src={Logo}
								alt="Logo"
								className="h-auto w-20 lg:w-40 object-cover"
							/>
						</Link>
					</div>

					<div className="flex items-center space-x-2 md:space-x-4">
						<Link href="/cart">
							<Button variant="ghost" size="icon" className="relative">
								<ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
								{totalItems > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
										{totalItems}
									</span>
								)}
							</Button>
						</Link>
						<Button variant="ghost" size="icon">
							<Heart className="h-5 w-5 md:h-6 md:w-6" />
						</Button>
						<Button variant="ghost" size="icon">
							<User className="h-5 w-5 md:h-6 md:w-6" />
						</Button>
					</div>
				</div>

				{/* Navigation */}
				<nav className={`${isMenuOpen ? "block" : "hidden"} lg:block border-t`}>
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 space-y-4 lg:space-y-0">
						<div className="flex flex-col lg:flex-row lg:items-center space-y-2 lg:space-y-0 lg:space-x-8">
							{/* <Link href="/">
								<Button className="bg-black text-white rounded-full px-6 w-fit">
									Home
								</Button>
							</Link> */}
							{categories.map((category) => (
								<Button
									key={category.id}
									variant="ghost"
									// className="text-gray-600 hover:text-black justify-start lg:justify-center"
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
				</nav>
			</div>
		</header>
	);
}
