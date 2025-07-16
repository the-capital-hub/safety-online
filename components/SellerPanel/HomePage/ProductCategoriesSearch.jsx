"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import {
	Icon1,
	Icon2,
	Icon3,
	Icon4,
	Icon5,
	Icon6,
	Image1,
	Image2,
	Image3,
	Image4,
	Image5,
	Image6,
	Image7,
} from "@/public/images/seller-panel/home/product-categories";

const categories = [
	{
		id: 1,
		name: "Traffic Safety Equipment",
		icon: "🚧",
		image: Image1,
		description: "Cones, barriers, and traffic control devices",
	},
	{
		id: 2,
		name: "Fire Safety Essentials",
		icon: "🧯",
		image: Image2,
		description: "Fire extinguishers, alarms, and safety equipment",
	},
	{
		id: 3,
		name: "Reflective Gear & Jackets",
		icon: "🦺",
		image: Image3,
		description: "High-visibility clothing and reflective gear",
	},
	{
		id: 4,
		name: "Industrial PPE & Gear",
		icon: "👷",
		image: Image4,
		description: "Personal protective equipment for workers",
	},
	{
		id: 5,
		name: "Emergency Response Tools",
		icon: "🚨",
		image: Image5,
		description: "Emergency kits and response equipment",
	},
	{
		id: 6,
		name: "Road Infrastructure Accessories",
		icon: "🛣️",
		image: Image6,
		description: "Road construction and maintenance tools",
	},
];

const filterOptions = [
	{ id: 1, label: "Category", icon: Icon1 },
	{ id: 2, label: "Price", icon: Icon1 },
	{ id: 3, label: "MOQ", icon: Icon2 },
	{ id: 4, label: "Stock Availability", icon: Icon3 },
	{ id: 5, label: "Verified Seller", icon: Icon4 },
	{ id: 6, label: "Delivery Timeline", icon: Icon5 },
	{ id: 7, label: "Ratings", icon: Icon6 },
];

export default function ProductCategoriesSearch() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeFilters, setActiveFilters] = useState([]);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.5,
			},
		},
	};

	const filterVariants = {
		hidden: { scale: 0.8, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.3,
			},
		},
	};

	return (
		<section className="py-10 bg-white">
			<div className="px-10">
				{/* Categories Section */}
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={containerVariants}
					className="text-center mb-16"
				>
					<motion.h2
						variants={itemVariants}
						className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
					>
						Explore Product Categories
					</motion.h2>
					<motion.p
						variants={itemVariants}
						className="text-xl text-gray-600 mb-12"
					>
						Dynamic chips/cards with icons and hover descriptions
					</motion.p>

					<motion.div
						variants={containerVariants}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
					>
						{categories.map((category) => (
							<motion.div
								key={category.id}
								variants={itemVariants}
								whileHover={{
									scale: 1.05,
									boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
								}}
								className="flex flex-col items-center justify-center bg-white rounded-2xl p-8 shadow-lg border border-gray-100 cursor-pointer group"
							>
								<Image
									src={category.image.src}
									width={100}
									height={100}
									className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300"
								/>
								<h3 className="text-lg font-bold text-gray-900 mb-2">
									{category.name}
								</h3>
								<p className="text-gray-600 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
									{category.description}
								</p>
							</motion.div>
						))}
					</motion.div>
				</motion.div>

				{/* Smart Search Section */}
				<motion.div
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					variants={containerVariants}
					className="text-center"
				>
					<motion.div variants={itemVariants} className="mb-8">
						<Image
							src={Image7.src}
							alt="Smart Search Illustration"
							width={200}
							height={200}
							className="mx-auto mb-6"
						/>
					</motion.div>

					<motion.h3
						variants={itemVariants}
						className="text-3xl font-bold text-gray-900 mb-4"
					>
						Smart Search + Filters
					</motion.h3>
					<motion.p
						variants={itemVariants}
						className="text-xl text-gray-600 mb-8"
					>
						Auto-complete, image preview, and product tags in search
					</motion.p>

					{/* Search Bar */}
					<motion.div
						variants={itemVariants}
						className="max-w-2xl mx-auto mb-8"
					>
						<div className="relative">
							<input
								type="text"
								placeholder="Ex: Price"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-6 py-4 pr-20 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
							/>
							<button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-amber-400 text-black px-6 py-2 rounded-full hover:bg-amber-400 transition-colors duration-300">
								Search
							</button>
						</div>
					</motion.div>

					{/* Buyer-side Filters */}
					<motion.div variants={itemVariants}>
						<h4 className="text-xl font-semibold text-gray-900 mb-6">
							Buyer-side Filters
						</h4>
						<motion.div
							variants={containerVariants}
							className="flex flex-wrap justify-center gap-4"
						>
							{filterOptions.map((filter) => (
								<motion.button
									key={filter.id}
									variants={filterVariants}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => {
										setActiveFilters((prev) =>
											prev.includes(filter.id)
												? prev.filter((id) => id !== filter.id)
												: [...prev, filter.id]
										);
									}}
									className={`flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
										activeFilters.includes(filter.id)
											? "bg-amber-400 text-white border-amber-400"
											: "bg-white text-gray-700 border-gray-300 hover:border-amber-400"
									}`}
								>
									{/* <span className="text-lg">{filter.icon}</span> */}
									<Image
										src={filter.icon.src}
										alt={filter.label}
										width={30}
										height={30}
										className="w-10 h-10 object-cover rounded-full"
									/>
									<span className="font-medium">{filter.label}</span>
								</motion.button>
							))}
						</motion.div>
					</motion.div>
				</motion.div>
			</div>
		</section>
	);
}
