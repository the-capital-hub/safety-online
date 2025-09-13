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
import { Filter, X, ChevronDown, ChevronRight } from "lucide-react";
import { useProductStore } from "@/store/productStore.js";

export default function ProductFilters() {
	const [isOpen, setIsOpen] = useState(false);
	const [expandedCategories, setExpandedCategories] = useState(new Set());

	const {
		filters,
		availableFilters,
		setFilters,
		applyFilters,
		fetchFilters,
		currentCategory,
		setCurrentCategory,
		currentSubCategory,
		setCurrentSubCategory,
	} = useProductStore();

	useEffect(() => {
		fetchFilters();
	}, [fetchFilters]);

	// Auto-expand category if it has a selected subcategory
	useEffect(() => {
		if (currentSubCategory && availableFilters) {
			const parentCategory = availableFilters.categories.find((cat) =>
				cat.subCategories?.some((subCat) => subCat.id === currentSubCategory)
			);

			if (parentCategory) {
				setExpandedCategories((prev) => new Set(prev).add(parentCategory.id));
			}
		}
	}, [currentSubCategory, availableFilters]);

	const handleCategoryChange = (category, checked) => {
		console.log("handleCategoryChange", category, checked);

		if (checked) {
			setCurrentCategory(category.id);
			// Clear subcategory when switching main category
			setCurrentSubCategory("");
		} else {
			if (currentCategory === category.id) {
				setCurrentCategory("all");
				setCurrentSubCategory("");
			}
		}
	};

	const handleSubCategoryChange = (subCategory, checked) => {
		console.log("handleSubCategoryChange", subCategory, checked);

		if (checked) {
			setCurrentSubCategory(subCategory.id);
		} else {
			if (currentSubCategory === subCategory.id) {
				setCurrentSubCategory("");
			}
		}
	};

	const toggleCategoryExpansion = (categoryId) => {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId);
		} else {
			newExpanded.add(categoryId);
		}
		setExpandedCategories(newExpanded);
	};

	const handlePriceChange = (value) => {
		setFilters({ priceRange: value });
	};

	const handleStockChange = (checked) => {
		setFilters({ inStock: checked });
	};

	const handleDiscountChange = (value) => {
		setFilters({ discount: parseInt(value) || 0 });
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
		setCurrentCategory("all");
		setCurrentSubCategory("");
		setExpandedCategories(new Set()); // Clear expanded categories
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
			<div className="hidden lg:block bg-white rounded-lg p-6 shadow-sm sticky top-0 max-h-screen overflow-y-auto">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">Filters</h2>
					<Button variant="ghost" size="sm" onClick={clearFilters}>
						Clear All
					</Button>
				</div>

				<FilterContent
					availableFilters={availableFilters}
					filters={filters}
					currentCategory={currentCategory}
					currentSubCategory={currentSubCategory}
					expandedCategories={expandedCategories}
					onCategoryChange={handleCategoryChange}
					onSubCategoryChange={handleSubCategoryChange}
					onToggleCategoryExpansion={toggleCategoryExpansion}
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
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
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
								currentCategory={currentCategory}
								currentSubCategory={currentSubCategory}
								expandedCategories={expandedCategories}
								onCategoryChange={handleCategoryChange}
								onSubCategoryChange={handleSubCategoryChange}
								onToggleCategoryExpansion={toggleCategoryExpansion}
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
	currentCategory,
	currentSubCategory,
	expandedCategories,
	onCategoryChange,
	onSubCategoryChange,
	onToggleCategoryExpansion,
	onPriceChange,
	onStockChange,
	onDiscountChange,
	onTypeChange,
	onApply,
}) {
	return (
		<div className="space-y-6">
			{/* Categories with Subcategories */}
			<Accordion type="single" collapsible defaultValue="categories">
				<AccordionItem value="categories" className="border-none">
					<AccordionTrigger className="hover:no-underline py-3">
						<span className="font-medium">Categories</span>
					</AccordionTrigger>
					<AccordionContent className="pb-2">
						<div className="space-y-3 pt-2">
							{availableFilters.categories?.map((category) => (
								<div key={category.id} className="space-y-2">
									{/* Main Category Row */}
									<div className="flex items-center justify-between group">
										<div className="flex items-center space-x-3 flex-1">
											<Checkbox
												id={category.id}
												checked={currentCategory === category.id}
												onCheckedChange={(checked) =>
													onCategoryChange(category, checked)
												}
												className="data-[state=checked]:bg-black data-[state=checked]:border-black"
											/>
											<label
												htmlFor={category.id}
												className="text-sm font-medium leading-none cursor-pointer flex-1 select-none"
											>
												{category.label}{" "}
												{category.count > 0 && (
													<span className="ml-1 text-xs text-gray-500">
														({category.count})
													</span>
												)}
											</label>
										</div>

										{/* Collapsible Toggle - only show if has subcategories */}
										{category.subCategories &&
											category.subCategories.length > 0 && (
												<Button
													variant="ghost"
													size="sm"
													className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
													onClick={() => onToggleCategoryExpansion(category.id)}
												>
													{expandedCategories.has(category.id) ? (
														<ChevronDown className="h-3 w-3" />
													) : (
														<ChevronRight className="h-3 w-3" />
													)}
												</Button>
											)}
									</div>

									{/* Subcategories - with smooth animation */}
									{category.subCategories &&
										category.subCategories.length > 0 && (
											<AnimatePresence initial={false}>
												{expandedCategories.has(category.id) && (
													<motion.div
														initial={{ height: 0, opacity: 0 }}
														animate={{ height: "auto", opacity: 1 }}
														exit={{ height: 0, opacity: 0 }}
														transition={{
															duration: 0.3,
															ease: "easeInOut",
															opacity: { duration: 0.2 },
														}}
														className="overflow-hidden"
													>
														<div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-100 pl-4">
															{category.subCategories.map((subCategory) => (
																<div
																	key={`${category.id}-${subCategory.id}`}
																	className="flex items-center space-x-3"
																>
																	<Checkbox
																		id={`${category.id}-${subCategory.id}`}
																		checked={
																			currentSubCategory === subCategory.id
																		}
																		onCheckedChange={(checked) =>
																			onSubCategoryChange(subCategory, checked)
																		}
																		className="data-[state=checked]:bg-black data-[state=checked]:border-black"
																	/>
																	<label
																		htmlFor={`${category.id}-${subCategory.id}`}
																		className="text-xs text-gray-600 leading-none cursor-pointer flex-1 select-none hover:text-gray-800 transition-colors"
																	>
																		{subCategory.label}
																		{/* {subCategory.count && (
																			<span className="ml-1 text-gray-400">
																				({subCategory.count})
																			</span>
																		)} */}
																	</label>
																</div>
															))}
														</div>
													</motion.div>
												)}
											</AnimatePresence>
										)}
								</div>
							))}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Price Range */}
			<Accordion type="single" collapsible>
				<AccordionItem value="price" className="border-none">
					<AccordionTrigger className="hover:no-underline py-3">
						<span className="font-medium">Price Range</span>
					</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4 space-y-4">
							<Slider
								value={filters.priceRange}
								onValueChange={onPriceChange}
								max={availableFilters.priceRange?.max || 10000}
								min={availableFilters.priceRange?.min || 0}
								step={100}
								className="mb-4"
							/>
							<div className="flex justify-between text-sm text-gray-600">
								<span className="font-medium">
									₹{filters.priceRange[0]?.toLocaleString() || 0}
								</span>
								<span className="font-medium">
									₹{filters.priceRange[1]?.toLocaleString() || 10000}
								</span>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Product Type */}
			{availableFilters.types && availableFilters.types.length > 0 && (
				<Accordion type="single" collapsible>
					<AccordionItem value="type" className="border-none">
						<AccordionTrigger className="hover:no-underline py-3">
							<span className="font-medium">Product Type</span>
						</AccordionTrigger>
						<AccordionContent>
							<div className="pt-4">
								<Select
									value={filters.type || "all"}
									onValueChange={onTypeChange}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Types</SelectItem>
										{availableFilters.types.map((type) => (
											<SelectItem key={type.id} value={type.id}>
												{type.label}
												{type.count && ` (${type.count})`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			)}

			{/* Discount */}
			<Accordion type="single" collapsible>
				<AccordionItem value="discount" className="border-none">
					<AccordionTrigger className="hover:no-underline py-3">
						<span className="font-medium">Minimum Discount</span>
					</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4">
							<Select
								value={filters.discount?.toString() || "0"}
								onValueChange={onDiscountChange}
							>
								<SelectTrigger className="w-full">
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
			<Accordion type="single" collapsible>
				<AccordionItem value="availability" className="border-none">
					<AccordionTrigger className="hover:no-underline py-3">
						<span className="font-medium">Availability</span>
					</AccordionTrigger>
					<AccordionContent>
						<div className="pt-4 space-y-3">
							<div className="flex items-center space-x-3">
								<Checkbox
									id="in-stock"
									checked={filters.inStock || false}
									onCheckedChange={onStockChange}
									className="data-[state=checked]:bg-black data-[state=checked]:border-black"
								/>
								<label
									htmlFor="in-stock"
									className="text-sm font-medium leading-none cursor-pointer select-none"
								>
									In Stock Only
									{availableFilters.stock?.inStock && (
										<span className="ml-1 text-xs text-gray-500">
											({availableFilters.stock.inStock})
										</span>
									)}
								</label>
							</div>
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>

			{/* Apply Button - with better styling */}
			<div className="pt-4 border-t">
				<Button
					onClick={onApply}
					className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200 font-medium"
					size="lg"
				>
					Apply Filters
				</Button>
			</div>
		</div>
	);
}
