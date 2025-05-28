"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Filter, X } from "lucide-react";
import { useProductStore } from "@/lib/store";
import { categories } from "@/constants/products";

export default function ProductFilters() {
	const [isOpen, setIsOpen] = useState(false);
	const { filters, setFilters, applyFilters } = useProductStore();

	const handleCategoryChange = (categoryId, checked) => {
		const newCategories = checked
			? [...filters.categories, categoryId]
			: filters.categories.filter((id) => id !== categoryId);

		setFilters({ categories: newCategories });
	};

	const handlePriceChange = (value) => {
		setFilters({ priceRange: value });
	};

	const handleStockChange = (checked) => {
		setFilters({ inStock: checked });
	};

	const handleApplyFilters = () => {
		applyFilters();
		setIsOpen(false);
	};

	const clearFilters = () => {
		setFilters({
			categories: [],
			priceRange: [0, 10000],
			inStock: true,
		});
		applyFilters();
	};

	return (
		<>
			{/* Mobile Filter Button */}
			<div className="lg:hidden mb-4">
				<Button
					variant="outline"
					onClick={() => setIsOpen(true)}
					className="w-full justify-center"
				>
					<Filter className="h-4 w-4 mr-2" />
					Filters
				</Button>
			</div>

			{/* Desktop Filters */}
			<div className="hidden lg:block bg-white rounded-lg p-6 shadow-sm">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">Filters</h2>
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear All
					</Button>
				</div>

				<FilterContent
					categories={categories}
					filters={filters}
					onCategoryChange={handleCategoryChange}
					onPriceChange={handlePriceChange}
					onStockChange={handleStockChange}
					onApply={handleApplyFilters}
				/>
			</div>

			{/* Mobile Filter Modal */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
						onClick={() => setIsOpen(false)}
					>
						<motion.div
							initial={{ x: "-100%" }}
							animate={{ x: 0 }}
							exit={{ x: "-100%" }}
							className="bg-white h-full w-80 p-6 overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold">Filters</h2>
								<Button
									variant="ghost"
									size="icon"
									onClick={() => setIsOpen(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>

							<FilterContent
								categories={categories}
								filters={filters}
								onCategoryChange={handleCategoryChange}
								onPriceChange={handlePriceChange}
								onStockChange={handleStockChange}
								onApply={handleApplyFilters}
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}

function FilterContent({
	categories,
	filters,
	onCategoryChange,
	onPriceChange,
	onStockChange,
	onApply,
}) {
	return (
		<div className="space-y-6">
			{/* Categories */}
			<div>
				<h3 className="font-medium mb-4">Categories</h3>
				<div className="space-y-3">
					{categories.map((category) => (
						<div key={category.id} className="flex items-center space-x-2">
							<Checkbox
								id={category.id}
								checked={filters.categories.includes(category.id)}
								onCheckedChange={(checked) =>
									onCategoryChange(category.id, checked)
								}
							/>
							<label
								htmlFor={category.id}
								className="text-sm font-medium leading-none cursor-pointer"
							>
								{category.label} ({category.count})
							</label>
						</div>
					))}
				</div>
			</div>

			{/* Price Range */}
			<Accordion type="single" collapsible defaultValue="price">
				<AccordionItem value="price">
					<AccordionTrigger>Price Range</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4">
							<Slider
								value={filters.priceRange}
								onValueChange={onPriceChange}
								max={10000}
								min={0}
								step={100}
								className="mb-4"
							/>
							<div className="flex justify-between text-sm text-gray-600">
								<span>₹{filters.priceRange[0]}</span>
								<span>₹{filters.priceRange[1]}</span>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Availability */}
			<Accordion type="single" collapsible defaultValue="availability">
				<AccordionItem value="availability">
					<AccordionTrigger>Availability</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4 space-y-3">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="in-stock"
									checked={filters.inStock}
									onCheckedChange={onStockChange}
								/>
								<label
									htmlFor="in-stock"
									className="text-sm font-medium leading-none cursor-pointer"
								>
									In Stock Only
								</label>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Apply Button */}
			<Button
				onClick={onApply}
				className="w-full bg-black text-white hover:bg-gray-800"
			>
				Apply Filters
			</Button>
		</div>
	);
}
