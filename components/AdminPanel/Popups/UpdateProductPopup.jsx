"use client";

import { useState, useEffect } from "react";
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

const normalizeValue = (value) => (typeof value === "string" ? value.trim().toLowerCase() : "");

const productTypes = [
	{ value: "featured", label: "Featured" },
	{ value: "top-selling", label: "Top Selling" },
	{ value: "best-selling", label: "Best Selling" },
	{ value: "discounted", label: "Discounted" },
];

export function UpdateProductPopup({ open, onOpenChange, product }) {
	const { updateProduct } = useAdminProductStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [features, setFeatures] = useState([{ title: "", description: "" }]);
	const [categories, setCategories] = useState([]);
	const [sellers, setSellers] = useState([]);
	const [loadingSellers, setLoadingSellers] = useState(false);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		longDescription: "",
		category: "",
		subCategory: "",
		price: "",
		salePrice: "",
		stocks: "",
		discount: "",
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
					category: product.category || "",
					subCategory: product.subCategory || "",
					price: product.price?.toString() || "",
					salePrice: product.salePrice?.toString() || "",
					stocks: product.stocks?.toString() || "",
					discount: product.discount?.toString() || "",
					type: product.type || "featured",
					published: product.published !== undefined ? product.published : true,
					images: convertedImages,
					hsnCode: product.hsnCode || "",
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
			};

			convertImages();

			setFeatures(
				product.features?.length > 0
					? product.features
					: [{ title: "", description: "" }]
			);
		}
	}, [product]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!product) return;

		setIsSubmitting(true);

		try {
			// Prepare the update data similar to addProduct
			const updateData = {
				title: formData.title,
				description: formData.description,
				longDescription: formData.longDescription || formData.description,
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
				features: features.filter((f) => f.title && f.description),
				images: formData.images, // Pass the base64 images array
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
		setFeatures([...features, { title: "", description: "" }]);
	};

	const removeFeature = (index) => {
		setFeatures(features.filter((_, i) => i !== index));
	};

        const updateFeature = (index, field, value) => {
                const updatedFeatures = [...features];
                updatedFeatures[index][field] = value;
                setFeatures(updatedFeatures);
        };

        const selectedCategory = categories.find(
                (category) => normalizeValue(category.name) === normalizeValue(formData.category)
        );

        const availableSubCategories = selectedCategory?.subCategories ?? [];

        useEffect(() => {
                if (!categories.length) return;

                const currentCategory = categories.find(
                        (category) => normalizeValue(category.name) === normalizeValue(formData.category)
                );

                if (!currentCategory) {
                        if (formData.subCategory) {
                                setFormData((prev) => ({ ...prev, subCategory: "" }));
                        }
                        return;
                }

                const hasValidSubCategory = (currentCategory.subCategories || []).some(
                        (subCategory) =>
                                normalizeValue(subCategory.name) === normalizeValue(formData.subCategory)
                );

                if (!hasValidSubCategory && formData.subCategory) {
                        setFormData((prev) => ({ ...prev, subCategory: "" }));
                }
        }, [categories, formData.category, formData.subCategory]);

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
										setFormData({ ...formData, description: e.target.value })
									}
									className="mt-1"
									rows={3}
									required
								/>
							</div>

							<div className="md:col-span-2">
								<Label htmlFor="longDescription">Detailed Description</Label>
								<Textarea
									id="longDescription"
									placeholder="Detailed product description"
									value={formData.longDescription}
									onChange={(e) =>
										setFormData({
											...formData,
											longDescription: e.target.value,
										})
									}
									className="mt-1"
									rows={4}
								/>
							</div>

							<div className="md:col-span-2">
								<ImageUpload
									images={formData.images}
									onImagesChange={(images) =>
										setFormData({ ...formData, images })
									}
									maxImages={5}
									label="Product Images"
									required={false}
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
										{categories.map((category) => (
											<SelectItem key={category._id} value={category.name}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

                                                        <div>
                                                                <Label>Sub Category</Label>
                                                                <Select
                                                                        value={formData.subCategory || ""}
                                                                        onValueChange={(value) =>
                                                                                setFormData((prev) => ({
                                                                                        ...prev,
                                                                                        subCategory: value,
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
                                                                                <SelectItem value="">No subcategory</SelectItem>
                                                                                {availableSubCategories.map((subCategory) => (
                                                                                        <SelectItem key={subCategory.name} value={subCategory.name}>
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
								<Label htmlFor="price">Regular Price *</Label>
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
								<Label>HSN Code</Label>
								<Input
									placeholder="HSN Code"
									value={formData.hsnCode}
									onChange={(e) =>
										setFormData({ ...formData, hsnCode: e.target.value })
									}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Brand</Label>
								<Input
									placeholder="Brand"
									value={formData.brand}
									onChange={(e) =>
										setFormData({ ...formData, brand: e.target.value })
									}
									className="mt-1"
								/>
							</div>

							<div>
								<Label>Length</Label>
								<Input
									placeholder="Length"
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
								<Label>Width</Label>
								<Input
									placeholder="Width"
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
								<Label>Height</Label>
								<Input
									placeholder="Height"
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
								<Label>Weight</Label>
								<Input
									placeholder="Weight"
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
										<Input
											placeholder="Feature title"
											value={feature.title}
											onChange={(e) =>
												updateFeature(index, "title", e.target.value)
											}
											className="flex-1"
										/>
										<Input
											placeholder="Feature description"
											value={feature.description}
											onChange={(e) =>
												updateFeature(index, "description", e.target.value)
											}
											className="flex-1"
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
