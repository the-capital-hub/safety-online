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
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import {
// 	Select,
// 	SelectContent,
// 	SelectItem,
// 	SelectTrigger,
// 	SelectValue,
// } from "@/components/ui/select";
// import { X } from "lucide-react";

// export function BulkUpdateProductsPopup({ open, onOpenChange, selectedCount }) {
// 	const [formData, setFormData] = useState({
// 		category: "",
// 		published: true,
// 		productTags: "",
// 	});

// 	const handleSubmit = (e) => {
// 		e.preventDefault();
// 		console.log("Bulk updating products:", { ...formData, selectedCount });
// 		onOpenChange(false);
// 	};

// 	return (
// 		<Dialog open={open} onOpenChange={onOpenChange}>
// 			<DialogContent className="sm:max-w-md">
// 				<motion.div
// 					initial={{ scale: 0.95, opacity: 0 }}
// 					animate={{ scale: 1, opacity: 1 }}
// 					transition={{ duration: 0.2 }}
// 				>
// 					<DialogHeader>
// 						<div className="flex items-center justify-between">
// 							<div>
// 								<DialogTitle className="text-lg font-semibold">
// 									Update Selected Products
// 								</DialogTitle>
// 								<DialogDescription className="text-gray-600">
// 									Apply changes to the selected Products from the list
// 								</DialogDescription>
// 							</div>
// 						</div>
// 					</DialogHeader>

// 					<form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
// 									<SelectItem value="default">Default Category</SelectItem>
// 									<SelectItem value="hardware">Hardware</SelectItem>
// 									<SelectItem value="apparel">Apparel</SelectItem>
// 									<SelectItem value="footwear">Footwear</SelectItem>
// 									<SelectItem value="accessory">Accessory</SelectItem>
// 								</SelectContent>
// 							</Select>
// 						</div>

// 						<div>
// 							<Label>Default Category</Label>
// 							<Select>
// 								<SelectTrigger className="mt-1">
// 									<SelectValue placeholder="Default Category" />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value="default">Default Category</SelectItem>
// 									<SelectItem value="hardware">Hardware</SelectItem>
// 									<SelectItem value="apparel">Apparel</SelectItem>
// 									<SelectItem value="footwear">Footwear</SelectItem>
// 									<SelectItem value="accessory">Accessory</SelectItem>
// 								</SelectContent>
// 							</Select>
// 						</div>

// 						<div className="flex items-center justify-between">
// 							<Label>Published</Label>
// 							<Switch
// 								checked={formData.published}
// 								onCheckedChange={(checked) =>
// 									setFormData({ ...formData, published: checked })
// 								}
// 							/>
// 						</div>

// 						<div>
// 							<Label>Product Tags</Label>
// 							<Select
// 								value={formData.productTags}
// 								onValueChange={(value) =>
// 									setFormData({ ...formData, productTags: value })
// 								}
// 							>
// 								<SelectTrigger className="mt-1">
// 									<SelectValue placeholder="Select Tags" />
// 								</SelectTrigger>
// 								<SelectContent>
// 									<SelectItem value="safety">Safety</SelectItem>
// 									<SelectItem value="protection">Protection</SelectItem>
// 									<SelectItem value="equipment">Equipment</SelectItem>
// 									<SelectItem value="gear">Gear</SelectItem>
// 								</SelectContent>
// 							</Select>
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
// 								Bulk Update Products
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/AdminPanel/ImageUpload.jsx";
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

export function BulkUpdateProductsPopup({
	open,
	onOpenChange,
	selectedProducts = [],
}) {
	const { bulkUpdateProducts } = useAdminProductStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		category: "",
		type: "",
		published: true,
		discount: "",
		salePrice: "",
		images: [],
		updateImages: false, // Whether to update images
	});

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);

		const updateData = {};

		// Only include fields that have values
		if (formData.category) updateData.category = formData.category;
		if (formData.type) updateData.type = formData.type;
		if (formData.discount)
			updateData.discount = Number.parseFloat(formData.discount);
		if (formData.salePrice)
			updateData.salePrice = Number.parseFloat(formData.salePrice);
		if (formData.updateImages && formData.images.length > 0) {
			updateData.images = formData.images;
		}

		updateData.published = formData.published;

		const productIds = selectedProducts.map((product) => product._id);
		const success = await bulkUpdateProducts(productIds, updateData);

		if (success) {
			onOpenChange(false);
			resetForm();
		}
		setIsSubmitting(false);
	};

	const resetForm = () => {
		setFormData({
			category: "",
			type: "",
			published: true,
			discount: "",
			salePrice: "",
			images: [],
			updateImages: false,
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
							Bulk Update Products
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Apply changes to {selectedProducts.length} selected product
							{selectedProducts.length !== 1 ? "s" : ""}
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-6 mt-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label>Category</Label>
								<Select
									value={formData.category}
									onValueChange={(value) =>
										setFormData({ ...formData, category: value })
									}
								>
									<SelectTrigger className="mt-1">
										<SelectValue placeholder="Select category (optional)" />
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
										<SelectValue placeholder="Select type (optional)" />
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
								<Label htmlFor="salePrice">Sale Price</Label>
								<Input
									id="salePrice"
									placeholder="0.00 (leave empty to skip)"
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
								<Label htmlFor="discount">Discount (%)</Label>
								<Input
									id="discount"
									placeholder="0 (leave empty to skip)"
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

						{/* Published Toggle */}
						<div className="flex items-center justify-between">
							<div>
								<Label>Published Status</Label>
								<p className="text-sm text-gray-500">
									Set publish status for all selected products
								</p>
							</div>
							<Switch
								checked={formData.published}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, published: checked })
								}
							/>
						</div>

						{/* Image Update Section */}
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<Label>Update Images</Label>
									<p className="text-sm text-gray-500">
										Replace images for all selected products
									</p>
								</div>
								<Switch
									checked={formData.updateImages}
									onCheckedChange={(checked) =>
										setFormData({ ...formData, updateImages: checked })
									}
								/>
							</div>

							{formData.updateImages && (
								<ImageUpload
									images={formData.images}
									onImagesChange={(images) =>
										setFormData({ ...formData, images })
									}
									maxImages={5}
									label="New Product Images"
									required={false}
								/>
							)}
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
								{isSubmitting
									? "Updating..."
									: `Update ${selectedProducts.length} Product${
											selectedProducts.length !== 1 ? "s" : ""
									  }`}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
