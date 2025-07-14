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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export function BulkUpdateProductsPopup({ open, onOpenChange, selectedCount }) {
	const [formData, setFormData] = useState({
		category: "",
		published: true,
		productTags: "",
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Bulk updating products:", { ...formData, selectedCount });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-lg font-semibold">
									Update Selected Products
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Apply changes to the selected Products from the list
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

					<form onSubmit={handleSubmit} className="space-y-6 mt-4">
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
									<SelectItem value="default">Default Category</SelectItem>
									<SelectItem value="hardware">Hardware</SelectItem>
									<SelectItem value="apparel">Apparel</SelectItem>
									<SelectItem value="footwear">Footwear</SelectItem>
									<SelectItem value="accessory">Accessory</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Default Category</Label>
							<Select>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Default Category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">Default Category</SelectItem>
									<SelectItem value="hardware">Hardware</SelectItem>
									<SelectItem value="apparel">Apparel</SelectItem>
									<SelectItem value="footwear">Footwear</SelectItem>
									<SelectItem value="accessory">Accessory</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center justify-between">
							<Label>Published</Label>
							<Switch
								checked={formData.published}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, published: checked })
								}
							/>
						</div>

						<div>
							<Label>Product Tags</Label>
							<Select
								value={formData.productTags}
								onValueChange={(value) =>
									setFormData({ ...formData, productTags: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Select Tags" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="safety">Safety</SelectItem>
									<SelectItem value="protection">Protection</SelectItem>
									<SelectItem value="equipment">Equipment</SelectItem>
									<SelectItem value="gear">Gear</SelectItem>
								</SelectContent>
							</Select>
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
								Bulk Update Products
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
