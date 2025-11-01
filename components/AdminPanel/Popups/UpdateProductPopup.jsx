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
import { Plus, X, User } from "lucide-react";
import { useAdminProductStore } from "@/store/adminProductStore.js";
import { ImageUpload } from "@/components/AdminPanel/ImageUpload.jsx";
import { slugify } from "@/lib/slugify.js";
import { clampWords, countWords } from "@/lib/utils/text.js";

const toSlug = (value) => (value ? slugify(value) : "");

const productTypes = [
	{ value: "featured", label: "Featured" },
	{ value: "top-selling", label: "Top Selling" },
	{ value: "best-selling", label: "Best Selling" },
	{ value: "discounted", label: "Discounted" },
];

const NO_SUBCATEGORY_VALUE = "__no_subcategory__";

const WORD_LIMITS = {
        shortDescription: 300,
        longDescription: 500,
};

const calculateDiscountPercentage = (mrp, salePrice) => {
	const isSaleProvided =
		salePrice !== undefined && salePrice !== null && salePrice !== "";
	const mrpValue = Number.parseFloat(mrp);

	if (!Number.isFinite(mrpValue) || mrpValue <= 0 || !isSaleProvided) {
		return "0.00";
	}

	const saleValue = Number.parseFloat(salePrice);

	if (!Number.isFinite(saleValue) || saleValue < 0 || saleValue >= mrpValue) {
		return "0.00";
	}

	const discount = ((mrpValue - saleValue) / mrpValue) * 100;
	return discount.toFixed(2);
};

export function UpdateProductPopup({ open, onOpenChange, product }) {
	const { updateProduct } = useAdminProductStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [features, setFeatures] = useState([""]);
	const [categories, setCategories] = useState([]);
        const [sellers, setSellers] = useState([]);
        const [loadingSellers, setLoadingSellers] = useState(false);
        const [priceError, setPriceError] = useState("");
        const [mainImageIndex, setMainImageIndex] = useState(-1);

        const reorderImagesForSubmission = (images, index) => {
                if (!images.length || index <= 0 || index >= images.length) {
                        return images;
                }

                const updatedImages = [...images];
                const [selectedImage] = updatedImages.splice(index, 1);
                return [selectedImage, ...updatedImages];
        };

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		longDescription: "",
		category: "",
		subCategory: "",
		price: "",
		salePrice: "",
		stocks: "",
		discount: "0.00",
		type: "featured",
		published: true,
		images: [],
		hsnCode: "",
		brand: "",
		length: "",
		width: "",
		height: "",
		weight: "",
		colour: "",
		material: "",
		size: "",
		sellerId: "",
	});

	const validatePricing = (mrpValue, saleValue) => {
		const isSaleProvided =
			saleValue !== undefined && saleValue !== null && saleValue !== "";
		const mrpNumber = Number.parseFloat(mrpValue);

		if (!isSaleProvided || !Number.isFinite(mrpNumber) || mrpNumber <= 0) {
			setPriceError("");
			return true;
		}

		const saleNumber = Number.parseFloat(saleValue);

		if (!Number.isFinite(saleNumber)) {
			setPriceError("");
			return true;
		}

		if (saleNumber < 0) {
			setPriceError("Sale price cannot be negative.");
			return false;
		}

		if (saleNumber >= mrpNumber) {
			setPriceError("Sale price should be lower than MRP.");
			return false;
		}

		setPriceError("");
		return true;
	};

	const handlePriceChange = (value) => {
		setFormData((prev) => ({
			...prev,
			price: value,
			discount: calculateDiscountPercentage(value, prev.salePrice),
		}));
		validatePricing(value, formData.salePrice);
	};

	const handleSalePriceChange = (value) => {
		setFormData((prev) => ({
			...prev,
			salePrice: value,
			discount: calculateDiscountPercentage(prev.price, value),
		}));
		validatePricing(formData.price, value);
	};

	const handleHsnChange = (value) => {
		// Remove all non-numeric characters first
		const numericOnly = value.replace(/\D/g, "");
		// Then check if it's within 8 digits limit
		if (numericOnly.length <= 8) {
			setFormData((prev) => ({ ...prev, hsnCode: numericOnly }));
		}
	};

        useEffect(() => {
                if (open) {
                        // Fetch categories
			const fetchCategories = async () => {
				try {
					const res = await fetch("/api/admin/categories");
					const data = await res.json();
					if (data.success) {
						setCategories(data.categories);
					}
				} catch (error) {
					console.error("Failed to fetch categories:", error);
				}
			};

			// Fetch sellers
			const fetchSellers = async () => {
				setLoadingSellers(true);
				try {
					const res = await fetch("/api/admin/sellers?limit=1000"); // Get all sellers
					const data = await res.json();
					if (data.success) {
						setSellers(data.data);
					}
				} catch (error) {
					console.error("Failed to fetch sellers:", error);
				} finally {
					setLoadingSellers(false);
				}
			};

			fetchCategories();
			fetchSellers();
		}
        }, [open]);

        useEffect(() => {
                if (!product) {
                        setMainImageIndex(-1);
                }
        }, [product]);

	// Helper function to convert URL to base64
	const convertUrlToBase64 = async (url) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			return new Promise((resolve, reject) => {
				const reader = new FileReader();
				reader.onload = () => resolve(reader.result);
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			});
		} catch (error) {
			console.error("Error converting URL to base64:", error);
			return url; // Return original URL if conversion fails
		}
	};

	useEffect(() => {
		if (product) {
			const initialPrice = product.price?.toString() || "";
			const initialSalePrice = product.salePrice?.toString() || "";

			// Convert existing image URLs to base64 for the ImageUpload component
			const convertImages = async () => {
				let convertedImages = [];
				if (product.images && product.images.length > 0) {
					convertedImages = await Promise.all(
						product.images.map(async (imageUrl) => {
							if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
								try {
									return await convertUrlToBase64(imageUrl);
								} catch (error) {
									console.error("Failed to convert image:", error);
									return imageUrl;
								}
							}
							return imageUrl;
						})
					);
				}

                                setFormData({
                                        title: product.title || "",
                                        description: product.description || "",
					longDescription: product.longDescription || "",
                                        category: toSlug(product.category) || "",
                                        subCategory: toSlug(product.subCategory) || "",
					price: initialPrice,
					salePrice: initialSalePrice,
					stocks: product.stocks?.toString() || "",
					discount:
						calculateDiscountPercentage(initialPrice, initialSalePrice) ||
						"0.00",
					type: product.type || "featured",
					published: product.published !== undefined ? product.published : true,
					images: convertedImages,
					hsnCode: (product.hsnCode || "").replace(/\D/g, ""),
					brand: product.brand || "",

					length: product.length?.toString() || "",
					width: product.width?.toString() || "",
					height: product.height?.toString() || "",
					weight: product.weight?.toString() || "",
					colour: product.colour || "",
					material: product.material || "",
                                        size: product.size || "",
                                        sellerId: product.sellerId || "",
                                });

                                const originalMainIndex = (product.images || []).findIndex(
                                        (imageUrl) => imageUrl === product.mainImage
                                );
                                setMainImageIndex(
                                        originalMainIndex >= 0
                                                ? originalMainIndex
                                                : convertedImages.length > 0
                                                ? 0
                                                : -1
                                );
                        };

			convertImages();

			const mappedFeatures =
				product.features?.length > 0
					? product.features.map(
							(feature) =>
								feature?.description?.trim() || feature?.title?.trim() || ""
					  )
					: [""];

			const sanitizedFeatures = mappedFeatures.filter(
				(feature) => feature.length > 0
			);

			setFeatures(sanitizedFeatures.length > 0 ? sanitizedFeatures : [""]);
			validatePricing(initialPrice, initialSalePrice);
		}
	}, [product]);

        const handleSubmit = async (e) => {
                e.preventDefault();

                if (!e.currentTarget.checkValidity()) {
                        e.currentTarget.reportValidity();

                        return;
                }
                if (!validatePricing(formData.price, formData.salePrice)) {
                        return;
                }
                if (!product) return;

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

                        // Prepare the update data similar to addProduct
                        const updateData = {
                                title: formData.title,
                                description: limitedDescription,
                                longDescription: limitedLongDescription || limitedDescription,
				category: formData.category,
				subCategory: formData.subCategory,
				price: Number.parseFloat(formData.price),
				salePrice: formData.salePrice
					? Number.parseFloat(formData.salePrice)
					: 0,
				stocks: Number.parseInt(formData.stocks),
				discount: formData.discount ? Number.parseFloat(formData.discount) : 0,
				type: formData.type,
				published: formData.published,
				features: formattedFeatures,
                                images: reorderImagesForSubmission(formData.images, mainImageIndex), // Pass the base64 images array
				hsnCode: formData.hsnCode,
				brand: formData.brand,
				length: formData.length ? Number.parseFloat(formData.length) : null,
				width: formData.width ? Number.parseFloat(formData.width) : null,
				height: formData.height ? Number.parseFloat(formData.height) : null,
				weight: formData.weight ? Number.parseFloat(formData.weight) : null,
				colour: formData.colour,
				material: formData.material,
				size: formData.size,
				sellerId: formData.sellerId,
			};

			console.log("Update Data:", updateData);

			const success = await updateProduct(product._id, updateData);
			if (success) {
				onOpenChange(false);
			}
		} catch (error) {
			console.error("Error updating product:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

        const addFeature = () => {
                setFeatures([...features, ""]);
        };

        const handleImagesChange = (images) => {
                const currentMainImage =
                        mainImageIndex >= 0 && mainImageIndex < formData.images.length
                                ? formData.images[mainImageIndex]
                                : null;

                setFormData((prev) => ({ ...prev, images }));
                setMainImageIndex(() => {
                        if (!images.length) {
                                return -1;
                        }

                        if (currentMainImage) {
                                const newIndex = images.findIndex((image) => image === currentMainImage);
                                if (newIndex !== -1) {
                                        return newIndex;
                                }
                        }

                        return 0;
                });
        };

        const handleMainImageChange = (index) => {
                setMainImageIndex(index);
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

	const removeFeature = (index) => {
		setFeatures(features.filter((_, i) => i !== index));
	};

	const updateFeature = (index, value) => {
		const updatedFeatures = [...features];
		updatedFeatures[index] = value;
		setFeatures(updatedFeatures);
	};

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

                if (!categoriesWithSlugs.length) {
                        return;
                }

                if (!selectedCategory) {
                        if (formData.category || formData.subCategory) {
                                setFormData((prev) => ({
                                        ...prev,
                                        category: "",
                                        subCategory: "",
                                }));
                        }
                        return;
                }

                const hasValidSubCategory = selectedCategory.subCategories.some(
                        (subCategory) => subCategory.slug === formData.subCategory
                );

                if (!hasValidSubCategory && formData.subCategory) {
                        setFormData((prev) => ({ ...prev, subCategory: "" }));
                }
        }, [
                categoriesWithSlugs.length,
                formData.category,
                formData.subCategory,
                selectedCategory,
        ]);

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
							Update Product
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Update product information and details
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-6 mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Seller Selection */}
							<div className="md:col-span-2">
								<Label>Select Seller *</Label>
								<Select
									value={formData.sellerId}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											sellerId: value,
										}))
									}
									disabled={loadingSellers}
								>
									<SelectTrigger className="mt-1">
										<SelectValue
											placeholder={
												loadingSellers ? "Loading sellers..." : "Select seller"
											}
										>
											{formData.sellerId && (
												<div className="flex items-center gap-2">
													<User className="w-4 h-4" />
													<span>
														{
															sellers.find((s) => s._id === formData.sellerId)
																?.firstName
														}{" "}
														{
															sellers.find((s) => s._id === formData.sellerId)
																?.lastName
														}{" "}
														-{" "}
														{
															sellers.find((s) => s._id === formData.sellerId)
																?.email
														}
													</span>
												</div>
											)}
										</SelectValue>
									</SelectTrigger>
									<SelectContent>
										{sellers.map((seller) => (
											<SelectItem key={seller._id} value={seller._id}>
												<div className="flex items-center gap-2">
													<User className="w-4 h-4" />
													<span>
														{seller.firstName} {seller.lastName} -{" "}
														{seller.email}
													</span>
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

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
                                                                        onImagesChange={handleImagesChange}
                                                                        maxImages={5}
                                                                        label="Product Images"
                                                                        required={false}
                                                                        mainImageIndex={mainImageIndex}
                                                                        onMainImageChange={handleMainImageChange}
                                                                />
                                                        </div>

							<div>
								<Label>Category *</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											category: value,
											subCategory: "",
										}))
									}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
                                                                        <SelectContent>
                                                                                {categoriesWithSlugs.map((category) => (
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
									value={formData.subCategory || NO_SUBCATEGORY_VALUE}
									onValueChange={(value) =>
										setFormData((prev) => ({
											...prev,
											subCategory: value === NO_SUBCATEGORY_VALUE ? "" : value,
										}))
									}
									disabled={!availableSubCategories.length}
								>
									<SelectTrigger className="mt-1">
										<SelectValue
											placeholder={
												availableSubCategories.length
													? "Select sub category"
													: "No subcategories available"
											}
										/>
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={NO_SUBCATEGORY_VALUE}>
											No subcategory
										</SelectItem>
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
								<Label htmlFor="price">MRP *</Label>
								<Input
									id="price"
									placeholder="0.00"
									value={formData.price}
									onChange={(e) => handlePriceChange(e.target.value)}
									className="mt-1"
									type="number"
									step="0.01"
									min="0"
									required
								/>
							</div>

							<div>
								<Label htmlFor="salePrice">Sale Price</Label>
								<Input
									id="salePrice"
									placeholder="0.00"
									value={formData.salePrice}
									onChange={(e) => handleSalePriceChange(e.target.value)}
									className="mt-1"
									type="number"
									step="0.01"
									min="0"
								/>
								{priceError && (
									<p className="text-sm text-red-500 mt-1">{priceError}</p>
								)}
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
									className="mt-1"
									type="number"
									max="100"
									readOnly
								/>
							</div>

							<div>
								<Label htmlFor="hsnCode">HSN Code</Label>
								<Input
									id="hsnCode"
									name="hsnCode"
									placeholder="Enter 8-digit HSN Code"
									value={formData.hsnCode}
									onChange={(e) => handleHsnChange(e.target.value)}
									className="mt-1"
									inputMode="numeric"
									maxLength={8}
								/>
								{formData.hsnCode &&
									formData.hsnCode.length > 0 &&
									formData.hsnCode.length < 8 && (
										<p className="text-sm text-amber-600 mt-1">
											HSN code should be 8 digits (currently{" "}
											{formData.hsnCode.length})
										</p>
									)}
							</div>

							<div>
								<Label>Brand</Label>
								<Input
									id="admin-update-brand"
									name="brand"
									placeholder="Brand"
									value={formData.brand}
									onChange={(e) =>
										setFormData({ ...formData, brand: e.target.value })
									}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Length (cm)</Label>
								<Input
									name="length"
									placeholder="Length in cm"
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
								<Label>Width (cm)</Label>
								<Input
									name="width"
									placeholder="Width in cm"
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
								<Label>Height (cm)</Label>
								<Input
									name="height"
									placeholder="Height in cm"
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
								<Label>Weight (kg)</Label>
								<Input
									name="weight"
									placeholder="Weight in kg"
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
								<Label>Colour</Label>
								<Input
									name="colour"
									placeholder="Colour"
									value={formData.colour}
									onChange={(e) =>
										setFormData({ ...formData, colour: e.target.value })
									}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Material</Label>
								<Input
									name="material"
									placeholder="Material"
									value={formData.material}
									onChange={(e) =>
										setFormData({ ...formData, material: e.target.value })
									}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Size</Label>
								<Input
									name="size"
									placeholder="Size"
									value={formData.size}
									onChange={(e) =>
										setFormData({ ...formData, size: e.target.value })
									}
									className="mt-1"
								/>
							</div>
						</div>

						{/* Features Section */}
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
											name={`feature-${index}`}
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

						{/* Published Toggle */}
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
								disabled={isSubmitting || !formData.sellerId}
								className="flex-1 bg-orange-500 hover:bg-orange-600"
							>
								{isSubmitting ? "Updating..." : "Update Product"}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
