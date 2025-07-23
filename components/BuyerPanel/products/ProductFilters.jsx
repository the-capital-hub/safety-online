"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Filter, X } from "lucide-react";
import { useProductStore } from "@/store/productStore.js";

export default function ProductFilters() {
	const [isOpen, setIsOpen] = useState(false);
	const { filters, availableFilters, setFilters, applyFilters, fetchFilters } =
		useProductStore();

	useEffect(() => {
		fetchFilters();
	}, [fetchFilters]);

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

	const handleDiscountChange = (value) => {
		setFilters({ discount: Number.parseInt(value) || 0 });
	};

	const handleTypeChange = (value) => {
		setFilters({ type: value === "all" ? "" : value });
	};

	const handleApplyFilters = () => {
		applyFilters();
		setIsOpen(false);
	};

	const clearFilters = () => {
		setFilters({
			categories: [],
			priceRange: availableFilters
				? [availableFilters.priceRange.min, availableFilters.priceRange.max]
				: [0, 10000],
			inStock: false,
			discount: 0,
			type: "",
		});
		applyFilters();
	};

	if (!availableFilters) {
		return (
			<div className="hidden lg:block bg-white rounded-lg p-6 shadow-sm">
				<div className="animate-pulse space-y-4">
					<div className="h-6 bg-gray-200 rounded w-1/2"></div>
					<div className="space-y-2">
						{[...Array(5)].map((_, i) => (
							<div key={i} className="h-4 bg-gray-200 rounded"></div>
						))}
					</div>
				</div>
			</div>
		);
	}

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
			<div className="hidden lg:block bg-white rounded-lg p-6 shadow-sm sticky top-0">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">Filters</h2>
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear All
					</Button>
				</div>

				<FilterContent
					availableFilters={availableFilters}
					filters={filters}
					onCategoryChange={handleCategoryChange}
					onPriceChange={handlePriceChange}
					onStockChange={handleStockChange}
					onDiscountChange={handleDiscountChange}
					onTypeChange={handleTypeChange}
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
								availableFilters={availableFilters}
								filters={filters}
								onCategoryChange={handleCategoryChange}
								onPriceChange={handlePriceChange}
								onStockChange={handleStockChange}
								onDiscountChange={handleDiscountChange}
								onTypeChange={handleTypeChange}
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
	availableFilters,
	filters,
	onCategoryChange,
	onPriceChange,
	onStockChange,
	onDiscountChange,
	onTypeChange,
	onApply,
}) {
	return (
		<div className="space-y-6">
			{/* Categories */}
			<Accordion type="single" collapsible defaultValue="categories">
				<AccordionItem value="categories">
					<AccordionTrigger>Categories</AccordionTrigger>
					<AccordionContent>
						<div className="space-y-3 pt-2">
							{availableFilters.categories.map((category) => (
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
										className="text-sm font-medium leading-none cursor-pointer flex-1"
									>
										{category.label} ({category.count})
									</label>
								</div>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Price Range */}
			<Accordion type="single" collapsible defaultValue="price">
				<AccordionItem value="price">
					<AccordionTrigger>Price Range</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4 space-y-4">
							<Slider
								value={filters.priceRange}
								onValueChange={onPriceChange}
								max={availableFilters.priceRange.max}
								min={availableFilters.priceRange.min}
								step={100}
								className="mb-4"
							/>
							<div className="flex justify-between text-sm text-gray-600">
								<span>₹{filters.priceRange[0].toLocaleString()}</span>
								<span>₹{filters.priceRange[1].toLocaleString()}</span>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Product Type */}
			<Accordion type="single" collapsible defaultValue="type">
				<AccordionItem value="type">
					<AccordionTrigger>Product Type</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4">
							<Select
								value={filters.type || "all"}
								onValueChange={onTypeChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Types</SelectItem>
									{availableFilters.types.map((type) => (
										<SelectItem key={type.id} value={type.id}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Discount */}
			<Accordion type="single" collapsible defaultValue="discount">
				<AccordionItem value="discount">
					<AccordionTrigger>Minimum Discount</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4">
							<Select
								value={filters.discount.toString()}
								onValueChange={onDiscountChange}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select discount" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="0">No minimum</SelectItem>
									<SelectItem value="10">10% or more</SelectItem>
									<SelectItem value="20">20% or more</SelectItem>
									<SelectItem value="30">30% or more</SelectItem>
									<SelectItem value="50">50% or more</SelectItem>
								</SelectContent>
							</Select>
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
									In Stock Only ({availableFilters.stock.inStock})
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
