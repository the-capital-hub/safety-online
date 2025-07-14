"use client";

import { useState } from "react";
import NavigationBar from "@/components/BuyerPanel/NavigationBar.jsx";
import HeroSection from "@/components/BuyerPanel/home/HeroSection.jsx";
import ProductShowcase from "@/components/BuyerPanel/home/ProductShowcase.jsx";
import TrustedCompanies from "@/components/BuyerPanel/home/TrustedCompanies.jsx";
import CategorySection from "@/components/BuyerPanel/home/CategorySection.jsx";
import SupportSection from "@/components/BuyerPanel/home/SupportSection.jsx";
import FeaturedSection from "@/components/BuyerPanel/home/FeaturedSection.jsx";
import SearchSection from "@/components/BuyerPanel/home/SearchSection.jsx";

export default function HomePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	return (
		<div className="min-h-[calc(100vh-68px)] bg-white hide-scrollbar">
			<NavigationBar />
			<HeroSection />
			<ProductShowcase />
			<TrustedCompanies />
			<CategorySection
				searchQuery={searchQuery}
				selectedCategory={selectedCategory}
				setSelectedCategory={setSelectedCategory}
			/>
			<SupportSection />
			<FeaturedSection />
			<SearchSection
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
			/>
		</div>
	);
}
