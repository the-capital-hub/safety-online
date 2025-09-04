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
import { Switch } from "@/components/ui/switch";
import { useAdminCategoryStore } from "@/store/adminCategoryStore.js";

export function UpdateCategoryPopup({ open, onOpenChange, category }) {
	const { updateCategory } = useAdminCategoryStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		published: true,
		subCategories: [],
	});

	useEffect(() => {
		if (category) {
			setFormData({
				name: category.name || "",
				published: category.published !== undefined ? category.published : true,
				subCategories: Array.isArray(category.subCategories)
					? category.subCategories.map((s) => ({
							name: s.name || "",
							published: s.published !== undefined ? !!s.published : true,
					  }))
					: [],
			});
		}
	}, [category]);

	const addSub = () => {
		setFormData((prev) => ({
			...prev,
			subCategories: [...prev.subCategories, { name: "", published: true }],
		}));
	};

	const removeSub = (idx) => {
		setFormData((prev) => ({
			...prev,
			subCategories: prev.subCategories.filter((_, i) => i !== idx),
		}));
	};

	const updateSub = (idx, patch) => {
		setFormData((prev) => ({
			...prev,
			subCategories: prev.subCategories.map((s, i) =>
				i === idx ? { ...s, ...patch } : s
			),
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!category) return;

		setIsSubmitting(true);

		const payload = {
			name: formData.name.trim(),
			published: formData.published,
			subCategories: (formData.subCategories || []).filter(
				(s) => (s.name || "").trim() !== ""
			),
		};

		const success = await updateCategory(category._id, payload);
		if (success) {
			onOpenChange(false);
		}
		setIsSubmitting(false);
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
						<DialogTitle className="text-lg font-semibold">
							Update Category
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Update your category and manage its subcategories.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<Label htmlFor="name">Category Name *</Label>
							<Input
								id="name"
								placeholder="Enter category name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label>Publish Category</Label>
								<p className="text-sm text-gray-500">
									Make this category visible to customers
								</p>
							</div>
							<Switch
								checked={formData.published}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, published: checked })
								}
							/>
						</div>

						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<Label>Subcategories</Label>
								<Button type="button" variant="outline" onClick={addSub}>
									Add Subcategory
								</Button>
							</div>

							{formData.subCategories.length === 0 && (
								<p className="text-sm text-gray-500">
									No subcategories added yet.
								</p>
							)}

							<div className="space-y-3">
								{formData.subCategories.map((sub, idx) => (
									<div key={idx} className="flex items-center gap-2">
										<Input
											placeholder="Subcategory name"
											value={sub.name}
											onChange={(e) => updateSub(idx, { name: e.target.value })}
										/>
										<div className="flex items-center gap-2">
											<span className="text-sm text-gray-600">Published</span>
											<Switch
												checked={!!sub.published}
												onCheckedChange={(checked) =>
													updateSub(idx, { published: checked })
												}
											/>
										</div>
										<Button
											type="button"
											variant="destructive"
											onClick={() => removeSub(idx)}
										>
											Remove
										</Button>
									</div>
								))}
							</div>
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
								disabled={isSubmitting}
								className="flex-1 bg-orange-500 hover:bg-orange-600"
							>
								{isSubmitting ? "Updating..." : "Update Category"}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
