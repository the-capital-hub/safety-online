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

const slugify = (value = "") =>
        value
                .toString()
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");

export function UpdateCategoryPopup({ open, onOpenChange, category }) {
	const { updateCategory } = useAdminCategoryStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

        const [formData, setFormData] = useState({
                name: "",
                navigationOrder: "",
                published: true,
                subCategories: [],
        });

	useEffect(() => {
		if (category) {
                        setFormData({
                                name: category.name || "",
                                navigationOrder:
                                        category.navigationOrder !== undefined &&
                                        category.navigationOrder !== null
                                                ? String(category.navigationOrder)
                                                : "",
                                published:
                                        category.published !== undefined ? category.published : true,
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

		if (!e.currentTarget.checkValidity()) {

		  e.currentTarget.reportValidity();

		  return;

		}
		if (!category) return;

		setIsSubmitting(true);

                const navOrderNumber = Number(formData.navigationOrder);

                const normalizedNavigationOrder = Number.isFinite(navOrderNumber)
                        ? Math.max(0, Math.floor(navOrderNumber))
                        : 0;

                const payload = {
                        name: formData.name.trim(),
                        navigationOrder: normalizedNavigationOrder,

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
                                                        <div className="mt-2 space-y-1">
                                                                <Label
                                                                        htmlFor="category-slug-preview"
                                                                        className="text-xs font-medium text-gray-500"
                                                                >
                                                                        Category Slug
                                                                </Label>
                                                                <Input
                                                                        id="category-slug-preview"
                                                                        value={slugify(formData.name) || ""}
                                                                        readOnly
                                                                        className="bg-gray-100 text-gray-600 font-mono text-sm"
                                                                />
                                                                <p className="text-xs text-gray-500">
                                                                        Use this slug to match category filters and navigation
                                                                        links.
                                                                </p>
                                                        </div>
                                                </div>

                                                <div>
                                                        <Label htmlFor="update-navigationOrder">
                                                                Navigation Order
                                                        </Label>
                                                        <Input
                                                                id="update-navigationOrder"
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
                                                                Determines the category position in navigation menus.
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
                                                                {formData.subCategories.map((sub, idx) => {
                                                                        const subSlug = slugify(sub.name);

                                                                        return (
                                                                                <div
                                                                                        key={idx}
                                                                                        className="rounded-md border p-3 space-y-3"
                                                                                >
                                                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                                                                                                <Input
                                                                                                        id={`update-sub-category-${idx}`}
                                                                                                        name="subCategory"
                                                                                                        placeholder="Subcategory name"
                                                                                                        value={sub.name}
                                                                                                        onChange={(e) =>
                                                                                                                updateSub(idx, {
                                                                                                                        name: e.target.value,
                                                                                                                })
                                                                                                        }
                                                                                                />
                                                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                                        <span>Published</span>
                                                                                                        <Switch
                                                                                                                checked={!!sub.published}
                                                                                                                onCheckedChange={(checked) =>
                                                                                                                        updateSub(idx, {
                                                                                                                                published: checked,
                                                                                                                        })
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
                                                                                        <div className="grid gap-1">
                                                                                                <Label
                                                                                                        htmlFor={`update-sub-category-slug-${idx}`}
                                                                                                        className="text-xs font-medium text-gray-500"
                                                                                                >
                                                                                                        Subcategory Slug
                                                                                                </Label>
                                                                                                <Input
                                                                                                        id={`update-sub-category-slug-${idx}`}
                                                                                                        value={subSlug}
                                                                                                        readOnly
                                                                                                        className="bg-gray-100 text-gray-600 font-mono text-sm"
                                                                                                />
                                                                                                <p className="text-xs text-gray-500">
                                                                                                        Reference this slug when associating products with
                                                                                                        this subcategory.
                                                                                                </p>
                                                                                        </div>
                                                                                </div>
                                                                        );
                                                                })}
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
