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
import { Upload, X } from "lucide-react";

export function AddProductPopup({ open, onOpenChange }) {
	const [formData, setFormData] = useState({
		titleName: "",
		description: "",
		sku: "",
		barcode: "",
		category: "",
		defaultCategory: "",
		productPrice: "",
		salePrice: "",
		productQuantity: "",
		productSlug: "",
		productTags: "",
		productImages: null,
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Adding product:", formData);
		onOpenChange(false);
		setFormData({
			titleName: "",
			description: "",
			sku: "",
			barcode: "",
			category: "",
			defaultCategory: "",
			productPrice: "",
			salePrice: "",
			productQuantity: "",
			productSlug: "",
			productTags: "",
			productImages: null,
		});
	};

	const handleFileUpload = (e) => {
		const files = e.target.files;
		if (files) {
			setFormData({ ...formData, productImages: files });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-lg font-semibold">
									Add Product
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Add your product and necessary information from here
								</DialogDescription>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onOpenChange(false)}
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<Label htmlFor="title-name">Product Title/Name</Label>
							<Input
								id="title-name"
								placeholder="Title/Name"
								value={formData.titleName}
								onChange={(e) =>
									setFormData({ ...formData, titleName: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="description">Product Description</Label>
							<Textarea
								id="description"
								placeholder="Description"
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className="mt-1"
								rows={3}
							/>
						</div>

						<div>
							<Label>Product Images</Label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-1">
								<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
								<p className="text-sm text-gray-600 mb-2">
									Drag your images here
								</p>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleFileUpload}
									className="hidden"
									id="product-images-upload"
								/>
								<label htmlFor="product-images-upload">
									<Button
										type="button"
										variant="outline"
										className="cursor-pointer bg-transparent"
									>
										Browse Files
									</Button>
								</label>
							</div>
						</div>

						<div>
							<Label htmlFor="sku">Product SKU</Label>
							<Input
								id="sku"
								placeholder="SKU"
								value={formData.sku}
								onChange={(e) =>
									setFormData({ ...formData, sku: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="barcode">Product Barcode</Label>
							<Input
								id="barcode"
								placeholder="Enter Barcode"
								value={formData.barcode}
								onChange={(e) =>
									setFormData({ ...formData, barcode: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label>Category</Label>
							<Select
								value={formData.category}
								onValueChange={(value) =>
									setFormData({ ...formData, category: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Select Category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="hardware">Hardware</SelectItem>
									<SelectItem value="apparel">Apparel</SelectItem>
									<SelectItem value="footwear">Footwear</SelectItem>
									<SelectItem value="accessory">Accessory</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Default Category</Label>
							<Select
								value={formData.defaultCategory}
								onValueChange={(value) =>
									setFormData({ ...formData, defaultCategory: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Default Category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="hardware">Hardware</SelectItem>
									<SelectItem value="apparel">Apparel</SelectItem>
									<SelectItem value="footwear">Footwear</SelectItem>
									<SelectItem value="accessory">Accessory</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="product-price">Product Price</Label>
							<Input
								id="product-price"
								placeholder="$0"
								value={formData.productPrice}
								onChange={(e) =>
									setFormData({ ...formData, productPrice: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="sale-price">Sale Price</Label>
							<Input
								id="sale-price"
								placeholder="$0"
								value={formData.salePrice}
								onChange={(e) =>
									setFormData({ ...formData, salePrice: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="product-quantity">Product Quantity</Label>
							<Input
								id="product-quantity"
								placeholder="0"
								value={formData.productQuantity}
								onChange={(e) =>
									setFormData({ ...formData, productQuantity: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="product-slug">Product Slug</Label>
							<Input
								id="product-slug"
								placeholder="Product Slug"
								value={formData.productSlug}
								onChange={(e) =>
									setFormData({ ...formData, productSlug: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="product-tags">Product Tags</Label>
							<Input
								id="product-tags"
								placeholder="Product Tags"
								value={formData.productTags}
								onChange={(e) =>
									setFormData({ ...formData, productTags: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<DialogFooter className="flex gap-3 mt-6">
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
								className="flex-1 bg-orange-500 hover:bg-orange-600"
							>
								Add Product
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
