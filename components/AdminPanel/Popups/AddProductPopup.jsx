// "use client";

// import { useState } from "react";
// import { motion } from "framer-motion";
// import {
// 	Dialog,
// 	DialogContent,
// 	DialogDescription,
// 	DialogFooter,
// 	DialogHeader,
// 	DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { Upload, X } from "lucide-react";

// export function AddProductPopup({ open, onOpenChange }) {
// 	const [formData, setFormData] = useState({
// 		titleName: "",
// 		description: "",
// 		sku: "",
// 		barcode: "",
// 		category: "",
// 		defaultCategory: "",
// 		productPrice: "",
// 		salePrice: "",
// 		productQuantity: "",
// 		productSlug: "",
// 		productTags: "",
// 		productImages: null,
// 	});

// 	const handleSubmit = (e) => {
// 		e.preventDefault();
// 		console.log("Adding product:", formData);
// 		onOpenChange(false);
// 		setFormData({
// 			titleName: "",
// 			description: "",
// 			sku: "",
// 			barcode: "",
// 			category: "",
// 			defaultCategory: "",
// 			productPrice: "",
// 			salePrice: "",
// 			productQuantity: "",
// 			productSlug: "",
// 			productTags: "",
// 			productImages: null,
// 		});
// 	};

// 	const handleFileUpload = (e) => {
// 		const files = e.target.files;
// 		if (files) {
// 			setFormData({ ...formData, productImages: files });
// 		}
// 	};

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar">
// 				<motion.div
// 					initial={{ scale: 0.95, opacity: 0 }}
// 					animate={{ scale: 1, opacity: 1 }}
// 					transition={{ duration: 0.2 }}
// 				>
// 					<DialogHeader>
// 						<div className="flex items-center justify-between">
// 							<div>
// 								<DialogTitle className="text-lg font-semibold">
// 									Add Product
// 								</DialogTitle>
// 								<DialogDescription className="text-gray-600">
// 									Add your product and necessary information from here
// 								</DialogDescription>
// 							</div>
// 						</div>
// 					</DialogHeader>

// 					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
// 						<div>
// 							<Label htmlFor="title-name">Product Title/Name</Label>
// 							<Input
// 								id="title-name"
// 								placeholder="Title/Name"
// 								value={formData.titleName}
// 								onChange={(e) =>
// 									setFormData({ ...formData, titleName: e.target.value })
// 								}
// 								className="mt-1"
// 								required
// 							/>
// 						</div>

// 						<div>
// 							<Label htmlFor="description">Product Description</Label>
// 							<Textarea
// 								id="description"
// 								placeholder="Description"
// 								value={formData.description}
// 								onChange={(e) =>
// 									setFormData({ ...formData, description: e.target.value })
// 								}
// 								className="mt-1"
// 								rows={3}
// 							/>
// 						</div>

// 						<div>
// 							<Label>Product Images</Label>
// 							<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-1">
// 								<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
// 								<p className="text-sm text-gray-600 mb-2">
// 									Drag your images here
// 								</p>
// 								<input
// 									type="file"
// 									accept="image/*"
// 									multiple
// 									onChange={handleFileUpload}
// 									className="hidden"
// 									id="product-images-upload"
// 								/>
// 								<label htmlFor="product-images-upload">
// 									<Button
// 										type="button"
// 										variant="outline"
// 										className="cursor-pointer bg-transparent"
// 									>
// 										Browse Files
// 									</Button>
// 								</label>
// 							</div>
// 						</div>

// 						<div>
// 							<Label htmlFor="sku">Product SKU</Label>
// 							<Input
// 								id="sku"
// 								placeholder="SKU"
// 								value={formData.sku}
// 								onChange={(e) =>
// 									setFormData({ ...formData, sku: e.target.value })
// 								}
// 								className="mt-1"
// 							/>
// 						</div>

// 						<div>
// 							<Label htmlFor="barcode">Product Barcode</Label>
// 							<Input
// 								id="barcode"
// 								placeholder="Enter Barcode"
// 								value={formData.barcode}
// 								onChange={(e) =>
// 									setFormData({ ...formData, barcode: e.target.value })
// 								}
// 								className="mt-1"
// 							/>
// 						</div>

// 						<div>
// 							<Label>Category</Label>
// 							<Select
// 								value={formData.category}
// 								onValueChange={(value) =>
// 									setFormData({ ...formData, category: value })
// 								}
// 							>
// 								<SelectTrigger className="mt-1">
// 									<SelectValue placeholder="Select Category" />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value="hardware">Hardware</SelectItem>
// 									<SelectItem value="apparel">Apparel</SelectItem>
// 									<SelectItem value="footwear">Footwear</SelectItem>
// 									<SelectItem value="accessory">Accessory</SelectItem>
// 								</SelectContent>
// 							</Select>
// 						</div>

// 						<div>
// 							<Label>Default Category</Label>
// 							<Select
// 								value={formData.defaultCategory}
// 								onValueChange={(value) =>
// 									setFormData({ ...formData, defaultCategory: value })
// 								}
// 							>
// 								<SelectTrigger className="mt-1">
// 									<SelectValue placeholder="Default Category" />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value="hardware">Hardware</SelectItem>
// 									<SelectItem value="apparel">Apparel</SelectItem>
// 									<SelectItem value="footwear">Footwear</SelectItem>
// 									<SelectItem value="accessory">Accessory</SelectItem>
// 								</SelectContent>
// 							</Select>
// 						</div>

// 						<div>
// 							<Label htmlFor="product-price">Product Price</Label>
// 							<Input
// 								id="product-price"
// 								placeholder="$0"
// 								value={formData.productPrice}
// 								onChange={(e) =>
// 									setFormData({ ...formData, productPrice: e.target.value })
// 								}
// 								className="mt-1"
// 							/>
// 						</div>

// 						<div>
// 							<Label htmlFor="sale-price">Sale Price</Label>
// 							<Input
// 								id="sale-price"
// 								placeholder="$0"
// 								value={formData.salePrice}
// 								onChange={(e) =>
// 									setFormData({ ...formData, salePrice: e.target.value })
// 								}
// 								className="mt-1"
// 							/>
// 						</div>

// 						<div>
// 							<Label htmlFor="product-quantity">Product Quantity</Label>
// 							<Input
// 								id="product-quantity"
// 								placeholder="0"
// 								value={formData.productQuantity}
// 								onChange={(e) =>
// 									setFormData({ ...formData, productQuantity: e.target.value })
// 								}
// 								className="mt-1"
// 							/>
// 						</div>

// 						<div>
// 							<Label htmlFor="product-slug">Product Slug</Label>
// 							<Input
// 								id="product-slug"
// 								placeholder="Product Slug"
// 								value={formData.productSlug}
// 								onChange={(e) =>
// 									setFormData({ ...formData, productSlug: e.target.value })
// 								}
// 								className="mt-1"
// 							/>
// 						</div>

// 						<div>
// 							<Label htmlFor="product-tags">Product Tags</Label>
// 							<Input
// 								id="product-tags"
// 								placeholder="Product Tags"
// 								value={formData.productTags}
// 								onChange={(e) =>
// 									setFormData({ ...formData, productTags: e.target.value })
// 								}
// 								className="mt-1"
// 							/>
// 						</div>

// 						<DialogFooter className="flex gap-3 mt-6">
// 							<Button
// 								type="button"
// 								variant="outline"
// 								onClick={() => onOpenChange(false)}
// 								className="flex-1"
// 							>
// 								Cancel
// 							</Button>
// 							<Button
// 								type="submit"
// 								className="flex-1 bg-orange-500 hover:bg-orange-600"
// 							>
// 								Add Product
// 							</Button>
// 						</DialogFooter>
// 					</form>
// 				</motion.div>
// 			</DialogContent>
// 		</Dialog>
// 	);
// }

"use client";

import { useState } from "react";
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
import { useAdminProductStore } from "@/store/adminProductStore.js";

const categories = [
	{ value: "personal-safety", label: "Personal Safety" },
	{ value: "road-safety", label: "Road Safety" },
	{ value: "signage", label: "Signage" },
	{ value: "industrial-safety", label: "Industrial Safety" },
	{ value: "queue-management", label: "Queue Management" },
	{ value: "fire-safety", label: "Fire Safety" },
	{ value: "first-aid", label: "First Aid" },
	{ value: "water-safety", label: "Water Safety" },
	{ value: "emergency-kit", label: "Emergency Kit" },
];

const productTypes = [
	{ value: "featured", label: "Featured" },
	{ value: "top-selling", label: "Top Selling" },
	{ value: "best-selling", label: "Best Selling" },
	{ value: "discounted", label: "Discounted" },
];

export function AddProductPopup({ open, onOpenChange }) {
	const { addProduct } = useAdminProductStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [features, setFeatures] = useState([{ title: "", description: "" }]);

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
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		const productData = {
			...formData,
			price: Number.parseFloat(formData.price),
			salePrice: formData.salePrice ? Number.parseFloat(formData.salePrice) : 0,
			stocks: Number.parseInt(formData.stocks),
			discount: formData.discount ? Number.parseFloat(formData.discount) : 0,
			features: features.filter((f) => f.title && f.description),
		};

		const success = await addProduct(productData);
		if (success) {
			onOpenChange(false);
			resetForm();
		}
		setIsSubmitting(false);
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
		});
		setFeatures([{ title: "", description: "" }]);
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
										{categories.map((category) => (
											<SelectItem key={category.value} value={category.value}>
												{category.label}
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
