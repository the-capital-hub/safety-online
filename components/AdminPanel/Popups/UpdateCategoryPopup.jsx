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
                        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden p-0">
                                <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex max-h-[85vh] flex-col overflow-hidden"
                                >
                                        <DialogHeader className="border-b border-gray-200 px-6 pb-4 pt-6">
                                                <DialogTitle className="text-lg font-semibold">
                                                        Update Category
                                                </DialogTitle>
                                                <DialogDescription className="text-gray-600">
                                                        Update your category and manage its subcategories.
                                                </DialogDescription>
                                        </DialogHeader>

                                        <form
                                                onSubmit={handleSubmit}
                                                className="flex-1 space-y-6 overflow-y-auto px-6 py-6 min-h-0"
                                        >
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

                                                <div className="grid gap-2">
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

                                                <div className="flex flex-col gap-3 rounded-md border border-dashed border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                                <Label>Publish Category</Label>
                                                                <p className="text-sm text-gray-500">
                                                                        Make this category visible to customers.
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
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                        <Label>Subcategories</Label>
                                                                        <p className="text-sm text-gray-500">
                                                                                Organise related subcategories and control their
                                                                                visibility.
                                                                        </p>
                                                                </div>
                                                                <Button type="button" variant="outline" onClick={addSub}>
                                                                        Add Subcategory
                                                                </Button>
                                                        </div>

                                                        {formData.subCategories.length === 0 && (
                                                                <div className="rounded-md border border-dashed border-gray-200 bg-white p-4 text-sm text-gray-500">
                                                                        No subcategories added yet.
                                                                </div>
                                                        )}

                                                        <div className="space-y-4">
                                                                {formData.subCategories.map((sub, idx) => {
                                                                        const subSlug = slugify(sub.name);

                                                                        return (
                                                                                <div
                                                                                        key={idx}
                                                                                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                                                                >
                                                                                        <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-4">
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
                                                                                                <div className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 md:justify-center">
                                                                                                        <span className="font-medium">Published</span>
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
                                                                                                        variant="outline"
                                                                                                        className="justify-center border-red-200 text-red-600 hover:bg-red-50"
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

                                                <DialogFooter className="flex flex-col gap-3 pt-4 sm:flex-row">
                                                        <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => onOpenChange(false)}
                                                                className="w-full sm:flex-1"
                                                        >
                                                                Cancel
                                                        </Button>
                                                        <Button
                                                                type="submit"
                                                                disabled={isSubmitting}
                                                                className="w-full bg-orange-500 hover:bg-orange-600 sm:flex-1"
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
