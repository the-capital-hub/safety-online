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
import { Plus, X } from "lucide-react";
import { useSellerProductStore } from "@/store/sellerProductStore.js";
import { ImageUpload } from "@/components/AdminPanel/ImageUpload.jsx";

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

export function UpdateProductPopup({ open, onOpenChange, product }) {
	const { updateProduct, categories, fetchCategories } =
		useSellerProductStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [features, setFeatures] = useState([{ title: "", description: "" }]);
	const [selectedCategory, setSelectedCategory] = useState(null);

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
		if (open) {
			fetchCategories();
		}
	}, [open, fetchCategories]);

	useEffect(() => {
		if (formData.category) {
			const category = categories.find((cat) => cat.name === formData.category);
			setSelectedCategory(category);
		}
	}, [formData.category, categories]);

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
					price: product.price?.toString() || "",
					salePrice: product.salePrice?.toString() || "",
					stocks: product.stocks?.toString() || "",
					discount: product.discount?.toString() || "",
					type: product.type || "featured",
					published: product.published !== undefined ? product.published : true,
					images: convertedImages,
					subCategory: product.subCategory || "",
					hsnCode: product.hsnCode || "",
					brand: product.brand || "",
					length: product.length?.toString() || "",
					width: product.width?.toString() || "",
					height: product.height?.toString() || "",
					weight: product.weight?.toString() || "",
					colour: product.colour || "",
					material: product.material || "",
					size: product.size || "",
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
									label="Product Images (First image will be used as product thumbnail)"
									required={false}
								/>
							</div>

							<div>
								<Label>Category *</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										setFormData({ ...formData, category: value })
									}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{categories
											.filter((cat) => cat.published)
											.map((category) => (
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
									value={formData.subCategory}
									onValueChange={(value) =>
										setFormData({ ...formData, subCategory: value })
									}
									disabled={
										!selectedCategory || !selectedCategory.subCategories?.length
									}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select sub category" />
									</SelectTrigger>
									<SelectContent>
										{selectedCategory?.subCategories?.map(
											(subCategory, index) => (
												<SelectItem key={index} value={subCategory.name}>
													{subCategory.name}
												</SelectItem>
											)
										)}
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

							{/* <div>
								<Label htmlFor="mainImage">Main Image URL</Label>
								<Input
									id="mainImage"
									placeholder="Enter main image URL"
									value={formData.mainImage}
									onChange={(e) =>
										setFormData({ ...formData, mainImage: e.target.value })
									}
									className="mt-1"
								/>
							</div> */}
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
