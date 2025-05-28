"use client";

import { useState } from "react";
import HeroSection from "@/components/home/HeroSection.jsx";
import ProductShowcase from "@/components/home/ProductShowcase.jsx";
import TrustedCompanies from "@/components/home/TrustedCompanies.jsx";
import CategorySection from "@/components/home/CategorySection.jsx";
import SupportSection from "@/components/home/SupportSection.jsx";
import FeaturedSection from "@/components/home/FeaturedSection.jsx";
import SearchSection from "@/components/home/SearchSection.jsx";

export default function HomePage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("All");

	return (
		<div className="min-h-screen bg-white hide-scrollbar">
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
