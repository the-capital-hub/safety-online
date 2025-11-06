"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { X, Plus } from "lucide-react";
import { useSellerProductStore } from "@/store/sellerProductStore.js";
import { ImageUpload } from "@/components/AdminPanel/ImageUpload.jsx";
import { slugify } from "@/lib/slugify.js";
import { clampWords, countWords } from "@/lib/utils/text.js";

// const categories = [
// 	{ value: "personal-safety", label: "Personal Safety" },
// 	{ value: "road-safety", label: "Road Safety" },
// 	{ value: "signage", label: "Signage" },
// 	{ value: "industrial-safety", label: "Industrial Safety" },
// 	{ value: "queue-management", label: "Queue Management" },
// 	{ value: "fire-safety", label: "Fire Safety" },
// 	{ value: "first-aid", label: "First Aid" },
// 	{ value: "water-safety", label: "Water Safety" },
// 	{ value: "emergency-kit", label: "Emergency Kit" },
// ];

const productTypes = [
	{ value: "featured", label: "Featured" },
	{ value: "top-selling", label: "Top Selling" },
	{ value: "best-selling", label: "Best Selling" },
	{ value: "discounted", label: "Discounted" },
];

const toSlug = (value) => (value ? slugify(value) : "");

const WORD_LIMITS = {
        shortDescription: 300,
        longDescription: 500,
};

export function AddProductPopup({ open, onOpenChange }) {
        const { addProduct, categories, fetchCategories } = useSellerProductStore();
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [features, setFeatures] = useState([""]); 
        const [productIds, setProductIds] = useState([""]);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		longDescription: "",
		category: "",
		price: "",
		salePrice: "",
		stocks: "",
		discount: "",
		type: "featured",
		published: true,
		images: [],

		// Additional fields - also handle these fields
		subCategory: "",
		hsnCode: "",
		brand: "",
		length: "",
		width: "",
		height: "",
		weight: "",
		colour: "",
		material: "",
		size: "",
	});

	useEffect(() => {
		if (open) {
			fetchCategories();
		}
	}, [open, fetchCategories]);

        const categoriesWithSlugs = useMemo(
                () =>
                        categories.map((category) => {
                                const categorySlug = toSlug(category.slug || category.name);

                                return {
                                        ...category,
                                        slug: categorySlug,
                                        subCategories: (category.subCategories || []).map(
                                                (subCategory) => ({
                                                        ...subCategory,
                                                        slug: toSlug(subCategory.slug || subCategory.name),
                                                })
                                        ),
                                };
                        }),
                [categories]
        );

        const selectedCategory = useMemo(
                () =>
                        categoriesWithSlugs.find(
                                (category) => category.slug === formData.category
                        ),
                [categoriesWithSlugs, formData.category]
        );

        const availableSubCategories = selectedCategory?.subCategories ?? [];

        useEffect(() => {
                if (!formData.category) {
                        if (formData.subCategory) {
                                setFormData((prev) => ({ ...prev, subCategory: "" }));
                        }
                        return;
                }

                if (!selectedCategory) {
                        if (formData.category || formData.subCategory) {
                                setFormData((prev) => ({ ...prev, category: "", subCategory: "" }));
                        }
                        return;
                }

                const hasValidSubCategory = availableSubCategories.some(
                        (subCategory) => subCategory.slug === formData.subCategory
                );

                if (!hasValidSubCategory && formData.subCategory) {
                        setFormData((prev) => ({ ...prev, subCategory: "" }));
                }
        }, [availableSubCategories, formData.category, formData.subCategory, selectedCategory]);

        const handleSubmit = async (e) => {
                e.preventDefault();
                if (!e.currentTarget.checkValidity()) {
                        e.currentTarget.reportValidity();
                        return;
                }

                const priceValue = Number.parseFloat(formData.price);
                const salePriceValue = formData.salePrice
                        ? Number.parseFloat(formData.salePrice)
                        : null;

                if (salePriceValue !== null && !Number.isNaN(salePriceValue)) {
                        if (Number.isNaN(priceValue) || salePriceValue >= priceValue) {
                                alert("Sale price must be lower than MRP.");
                                return;
                        }
                }
                setIsSubmitting(true);

                try {
                        const limitedDescription = clampWords(
                                formData.description,
                                WORD_LIMITS.shortDescription
                        );
                        const limitedLongDescription = clampWords(
                                formData.longDescription,
                                WORD_LIMITS.longDescription
                        );

                        const formattedFeatures = features
                                .map((feature) => feature.trim())
                                .filter((feature) => feature.length > 0)
                                .map((feature) => ({ title: feature, description: feature }));

                        const formattedProductIds = productIds
                                .map((id) => id.trim())
                                .filter((id, index, arr) => id.length > 0 && arr.indexOf(id) === index);

                        // Prepare product data with proper types
                        const productData = {
                                title: formData.title,
                                description: limitedDescription,
                                longDescription: limitedLongDescription || limitedDescription,
                                category: formData.category,
                                price: Number.parseFloat(formData.price),
				salePrice: formData.salePrice
					? Number.parseFloat(formData.salePrice)
					: 0,
				stocks: Number.parseInt(formData.stocks),
                                discount: formData.discount ? Number.parseFloat(formData.discount) : 0,
                                type: formData.type,
                                published: formData.published,
                                features: formattedFeatures,
				images: formData.images,
				subCategory: formData.subCategory,
				hsnCode: formData.hsnCode,
				brand: formData.brand,
				length: formData.length ? Number.parseFloat(formData.length) : null,
				width: formData.width ? Number.parseFloat(formData.width) : null,
				height: formData.height ? Number.parseFloat(formData.height) : null,
				weight: formData.weight ? Number.parseFloat(formData.weight) : null,
                                colour: formData.colour,
                                material: formData.material,
                                size: formData.size,
                                productIds: formattedProductIds,
                        };

			console.log("Product Data:", productData);

			// Use the store method which handles FormData internally
			const success = await addProduct(productData);

			if (success) {
				onOpenChange(false);
				resetForm();
			}
		} catch (error) {
			console.error("Error submitting product:", error);
			alert("Error submitting product. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

        const resetForm = () => {
                setFormData({
                        title: "",
                        description: "",
                        longDescription: "",
			category: "",
			price: "",
			salePrice: "",
			stocks: "",
			discount: "",
			type: "featured",
			published: true,
			images: [],
			subCategory: "",
			hsnCode: "",
			brand: "",
			length: "",
			width: "",
			height: "",
			weight: "",
			colour: "",
			material: "",
                        size: "",
                });
                setFeatures([""]);
                setProductIds([""]);
        };

        const handleDescriptionChange = (value) => {
                setFormData((prev) => {
                        const isDeleting = value.length <= prev.description.length;

                        if (countWords(value) <= WORD_LIMITS.shortDescription || isDeleting) {
                                return { ...prev, description: value };
                        }

                        const truncated = clampWords(value, WORD_LIMITS.shortDescription);

                        if (truncated === prev.description) {
                                return prev;
                        }

                        return { ...prev, description: truncated };
                });
        };

        const handleLongDescriptionChange = (value) => {
                setFormData((prev) => {
                        const currentLongDescription = prev.longDescription || "";
                        const isDeleting = value.length <= currentLongDescription.length;

                        if (countWords(value) <= WORD_LIMITS.longDescription || isDeleting) {
                                return { ...prev, longDescription: value };
                        }

                        const truncated = clampWords(value, WORD_LIMITS.longDescription);

                        if (truncated === currentLongDescription) {
                                return prev;
                        }

                        return { ...prev, longDescription: truncated };
                });
        };

        const addFeature = () => {
                setFeatures([...features, ""]);
        };

        const removeFeature = (index) => {
                setFeatures(features.filter((_, i) => i !== index));
        };

        const updateFeature = (index, value) => {
                const updatedFeatures = [...features];
                updatedFeatures[index] = value;
                setFeatures(updatedFeatures);
        };

        const addProductIdField = () => {
                setProductIds((prev) => [...prev, ""]);
        };

        const removeProductIdField = (index) => {
                setProductIds((prev) => prev.filter((_, i) => i !== index));
        };

        const updateProductIdValue = (index, value) => {
                setProductIds((prev) => {
                        const next = [...prev];
                        next[index] = value;
                        return next;
                });
        };

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">
							Add New Product
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Add your product and necessary information from here
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-6 mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="md:col-span-2">
								<Label htmlFor="title">Product Title *</Label>
								<Input
									id="title"
									placeholder="Enter product title"
									value={formData.title}
									onChange={(e) =>
										setFormData({ ...formData, title: e.target.value })
									}
									className="mt-1"
									required
								/>
							</div>

                                                        <div className="md:col-span-2">
                                                                <Label htmlFor="description">Short Description *</Label>
                                                                <Textarea
                                                                        id="description"
                                                                        placeholder="Brief product description"
                                                                        value={formData.description}
                                                                        onChange={(e) =>
                                                                                handleDescriptionChange(e.target.value)
                                                                        }
                                                                        className="mt-1"
                                                                        rows={3}
                                                                        required
                                                                />
                                                                <p className="mt-1 text-xs text-gray-500 text-right">
                                                                        {countWords(formData.description)} / {WORD_LIMITS.shortDescription} words
                                                                </p>
                                                        </div>

                                                        <div className="md:col-span-2">
                                                                <Label htmlFor="longDescription">Detailed Description</Label>
                                                                <Textarea
                                                                        id="longDescription"
                                                                        placeholder="Detailed product description"
                                                                        value={formData.longDescription}
                                                                        onChange={(e) =>
                                                                                handleLongDescriptionChange(e.target.value)
                                                                        }
                                                                        className="mt-1"
                                                                        rows={4}
                                                                />
                                                                <p className="mt-1 text-xs text-gray-500 text-right">
                                                                        {countWords(formData.longDescription)} / {WORD_LIMITS.longDescription} words
                                                                </p>
                                                        </div>

							<div className="md:col-span-2">
								<ImageUpload
									images={formData.images}
									onImagesChange={(images) =>
										setFormData({ ...formData, images })
									}
									maxImages={5}
									label="Product Images (First image will be used as main image)"
									required={true}
								/>
							</div>

                                                        <div>
                                                                <Label>Category *</Label>
                                                                <Select
                                                                        value={formData.category}
                                                                        onValueChange={(value) =>
                                                                                setFormData({
                                                                                        ...formData,
                                                                                        category: value,
                                                                                        subCategory: "",
                                                                                })
                                                                        }
                                                                >
                                                                        <SelectTrigger className="mt-1">
                                                                                <SelectValue placeholder="Select category" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                                {categoriesWithSlugs
                                                                                        .filter((cat) => cat.published !== false)
                                                                                        .map((category) => (
                                                                                                <SelectItem key={category._id} value={category.slug}>
                                                                                                        {category.name}
                                                                                                </SelectItem>
                                                                                        ))}
                                                                        </SelectContent>
                                                                </Select>
                                                        </div>

                                                        <div>
                                                                <Label>Sub Category</Label>
                                                                <Select
                                                                        value={formData.subCategory}
                                                                        onValueChange={(value) =>
                                                                                setFormData({ ...formData, subCategory: value })
                                                                        }
                                                                        disabled={!availableSubCategories.length}
                                                                >
                                                                        <SelectTrigger className="mt-1">
                                                                                <SelectValue placeholder="Select sub category" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                                {availableSubCategories.map((subCategory) => (
                                                                                        <SelectItem
                                                                                                key={`${selectedCategory?.slug || ""}-${subCategory.slug}`}
                                                                                                value={subCategory.slug}
                                                                                        >
                                                                                                {subCategory.name}
                                                                                        </SelectItem>
                                                                                ))}
                                                                        </SelectContent>
                                                                </Select>
                                                        </div>

							<div>
								<Label>Product Type</Label>
								<Select
									value={formData.type}
									onValueChange={(value) =>
										setFormData({ ...formData, type: value })
									}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{productTypes.map((type) => (
											<SelectItem key={type.value} value={type.value}>
												{type.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<Label htmlFor="brand">Brand</Label>
								<Input
									id="brand"
									placeholder="Enter brand name"
									value={formData.brand}
									onChange={(e) =>
										setFormData({ ...formData, brand: e.target.value })
									}
									className="mt-1"
								/>
							</div>

                                                        <div>
                                                                <Label htmlFor="price">MRP *</Label>
                                                                <Input
                                                                        id="price"
                                                                        placeholder="0.00"
                                                                        value={formData.price}
									onChange={(e) =>
										setFormData({ ...formData, price: e.target.value })
									}
									className="mt-1"
									type="number"
									step="0.01"
									required
								/>
							</div>

							<div>
								<Label htmlFor="salePrice">Sale Price</Label>
								<Input
									id="salePrice"
									placeholder="0.00"
									value={formData.salePrice}
									onChange={(e) =>
										setFormData({ ...formData, salePrice: e.target.value })
									}
									className="mt-1"
									type="number"
									step="0.01"
								/>
							</div>

							<div>
								<Label htmlFor="stocks">Stock Quantity *</Label>
								<Input
									id="stocks"
									placeholder="0"
									value={formData.stocks}
									onChange={(e) =>
										setFormData({ ...formData, stocks: e.target.value })
									}
									className="mt-1"
									type="number"
									required
								/>
							</div>

							<div>
								<Label htmlFor="discount">Discount (%)</Label>
								<Input
									id="discount"
									placeholder="0"
									value={formData.discount}
									onChange={(e) =>
										setFormData({ ...formData, discount: e.target.value })
									}
									className="mt-1"
									type="number"
									max="100"
								/>
							</div>

							<div>
								<Label htmlFor="hsnCode">HSN Code</Label>
								<Input
									id="hsnCode"
									placeholder="Enter HSN code"
									value={formData.hsnCode}
									onChange={(e) =>
										setFormData({ ...formData, hsnCode: e.target.value })
									}
									className="mt-1"
								/>
							</div>
						</div>

						<div>
							<Label className="text-lg font-medium">
								Product Specifications
							</Label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
								<div>
									<Label htmlFor="length">Length (cm)</Label>
									<Input
										id="length"
										placeholder="0"
										value={formData.length}
										onChange={(e) =>
											setFormData({ ...formData, length: e.target.value })
										}
										className="mt-1"
										type="number"
										step="0.01"
									/>
								</div>

								<div>
									<Label htmlFor="width">Width (cm)</Label>
									<Input
										id="width"
										placeholder="0"
										value={formData.width}
										onChange={(e) =>
											setFormData({ ...formData, width: e.target.value })
										}
										className="mt-1"
										type="number"
										step="0.01"
									/>
								</div>

								<div>
									<Label htmlFor="height">Height (cm)</Label>
									<Input
										id="height"
										placeholder="0"
										value={formData.height}
										onChange={(e) =>
											setFormData({ ...formData, height: e.target.value })
										}
										className="mt-1"
										type="number"
										step="0.01"
									/>
								</div>

								<div>
									<Label htmlFor="weight">Weight (kg)</Label>
									<Input
										id="weight"
										placeholder="0"
										value={formData.weight}
										onChange={(e) =>
											setFormData({ ...formData, weight: e.target.value })
										}
										className="mt-1"
										type="number"
										step="0.01"
									/>
								</div>

								<div>
									<Label htmlFor="colour">Colour</Label>
									<Input
										id="colour"
										placeholder="Enter colour"
										value={formData.colour}
										onChange={(e) =>
											setFormData({ ...formData, colour: e.target.value })
										}
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="material">Material</Label>
									<Input
										id="material"
										placeholder="Enter material"
										value={formData.material}
										onChange={(e) =>
											setFormData({ ...formData, material: e.target.value })
										}
										className="mt-1"
									/>
								</div>

								<div>
									<Label htmlFor="size">Size</Label>
									<Input
										id="size"
										placeholder="Enter size"
										value={formData.size}
										onChange={(e) =>
											setFormData({ ...formData, size: e.target.value })
										}
										className="mt-1"
									/>
								</div>
							</div>
						</div>

                                                <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                                <Label>Product IDs</Label>
                                                                <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={addProductIdField}
                                                                >
                                                                        <Plus className="w-4 h-4 mr-1" />
                                                                        Add Product ID
                                                                </Button>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                                Add one or more identifiers that should appear on invoices and
                                                                order details.
                                                        </p>
                                                        <div className="space-y-3">
                                                                {productIds.map((value, index) => (
                                                                        <div key={index} className="flex gap-3 items-start">
                                                                                <Input
                                                                                        id={`product-id-${index}`}
                                                                                        placeholder="Enter product identifier"
                                                                                        value={value}
                                                                                        onChange={(e) =>
                                                                                                updateProductIdValue(index, e.target.value)
                                                                                        }
                                                                                        className="flex-1"
                                                                                />
                                                                                {productIds.length > 1 && (
                                                                                        <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                size="icon"
                                                                                                onClick={() => removeProductIdField(index)}
                                                                                                aria-label="Remove product id"
                                                                                        >
                                                                                                <X className="w-4 h-4" />
                                                                                        </Button>
                                                                                )}
                                                                        </div>
                                                                ))}
                                                        </div>
                                                </div>

                                                <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                                <Label>Product Features</Label>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addFeature}
								>
									<Plus className="w-4 h-4 mr-1" />
									Add Feature
								</Button>
							</div>
                                                        <div className="space-y-3">
                                                                {features.map((feature, index) => (
                                                                        <div key={index} className="flex gap-3 items-start">
                                                                                <Textarea
                                                                                        id={`feature-${index}`}
                                                                                        name="featureDescription"
                                                                                        placeholder="Feature description"
                                                                                        value={feature}
                                                                                        onChange={(e) => updateFeature(index, e.target.value)}
                                                                                        className="flex-1"
                                                                                        rows={2}
                                                                                />
                                                                                {features.length > 1 && (
                                                                                        <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                size="icon"
                                                                                                onClick={() => removeFeature(index)}
                                                                                        >
                                                                                                <X className="w-4 h-4" />
                                                                                        </Button>
                                                                                )}
                                                                        </div>
                                                                ))}
                                                        </div>
                                                </div>

						<div className="flex items-center justify-between">
							<div>
								<Label>Publish Product</Label>
								<p className="text-sm text-gray-500">
									Make this product visible to customers
								</p>
							</div>
							<Switch
								checked={formData.published}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, published: checked })
								}
							/>
						</div>

						<DialogFooter className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 bg-green-600 hover:bg-green-700"
							>
								{isSubmitting ? "Adding..." : "Add Product"}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
