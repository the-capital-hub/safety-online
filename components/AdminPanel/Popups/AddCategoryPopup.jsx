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
import { Switch } from "@/components/ui/switch";
import { useAdminCategoryStore } from "@/store/adminCategoryStore.js";

export function AddCategoryPopup({ open, onOpenChange }) {
	const { addCategory } = useAdminCategoryStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

        const [formData, setFormData] = useState({
                name: "",
                navigationOrder: "",
                published: true,
                subCategories: [],
        });

        const addSub = () => {
                setFormData((prev) => ({
                        ...prev,
                        subCategories: [
                                ...prev.subCategories,
                                { name: "", published: true },
                        ],
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
                if (!e.currentTarget.checkValidity()) {
                        e.currentTarget.reportValidity();
                        return;
                }
                setIsSubmitting(true);

		// sanitize
                const navOrderNumber = Number(formData.navigationOrder);

                const payload = {
                        name: formData.name.trim(),
                        navigationOrder:
                                Number.isFinite(navOrderNumber) && navOrderNumber >= 0
                                        ? navOrderNumber
                                        : 0,
                        published: formData.published,
                        subCategories: (formData.subCategories || [])
                                .filter((s) => (s.name || "").trim() !== "")
                                .map((s) => ({
                                        name: s.name.trim(),
                                        published:
                                                s.published !== undefined
                                                        ? !!s.published
                                                        : true,
                                })),
                };

		const success = await addCategory(payload);
		if (success) {
			onOpenChange(false);
			resetForm();
		}
		setIsSubmitting(false);
	};

        const resetForm = () => {
                setFormData({
                        name: "",
                        navigationOrder: "",
                        published: true,
                        subCategories: [],
                });
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
							Add Category
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Add your category. You can also add subcategories below.
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

                                                <div>
                                                        <Label htmlFor="navigationOrder">
                                                                Navigation Order
                                                        </Label>
                                                        <Input
                                                                id="navigationOrder"
                                                                type="number"
                                                                min={0}
                                                                placeholder="e.g. 1"
                                                                value={formData.navigationOrder}
                                                                onChange={(e) =>
                                                                        setFormData({
                                                                                ...formData,
                                                                                navigationOrder:
                                                                                        e.target.value,
                                                                        })
                                                                }
                                                                className="mt-1"
                                                        />
                                                        <p className="text-sm text-gray-500 mt-1">
                                                                Controls the left-to-right order in the navigation bar.
                                                        </p>
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
                                                                                        id={`sub-category-${idx}`}
                                                                                        name="subCategory"
                                                                                        placeholder="Subcategory name"
                                                                                        value={sub.name}
                                                                                        onChange={(e) => updateSub(idx, { name: e.target.value })}
                                                                                />

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
								className="flex-1 bg-green-600 hover:bg-green-700"
							>
								{isSubmitting ? "Adding..." : "Add Category"}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
