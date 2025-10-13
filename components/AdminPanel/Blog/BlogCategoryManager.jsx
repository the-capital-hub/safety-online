"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-hot-toast";
import { Palette, Pencil, Trash2 } from "lucide-react";
import { ensureSlug } from "@/lib/slugify.js";

const emptyCategory = {
        name: "",
        slug: "",
        description: "",
        accentColor: "",
};

export function BlogCategoryManager({
        categories = [],
        onCreate,
        onUpdate,
        onDelete,
}) {
        const [formState, setFormState] = useState(emptyCategory);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [editingCategory, setEditingCategory] = useState(null);
        const [editingState, setEditingState] = useState(emptyCategory);

        const sortedCategories = useMemo(() => {
                return [...categories].sort((a, b) => a.name.localeCompare(b.name));
        }, [categories]);

        const resetForm = () => {
                setFormState(emptyCategory);
        };

        const handleCreate = async (event) => {
                event.preventDefault();
                setIsSubmitting(true);

                try {
                        const payload = {
                                ...formState,
                                slug: formState.slug ? ensureSlug(formState.slug) : undefined,
                        };

                        const success = await onCreate?.(payload);
                        if (success) {
                                resetForm();
                        }
                } catch (error) {
                        console.error("Create category failed", error);
                        toast.error("Unable to create category");
                } finally {
                        setIsSubmitting(false);
                }
        };

        const startEditing = (category) => {
                        setEditingCategory(category._id);
                        setEditingState({
                                name: category.name,
                                slug: category.slug,
                                description: category.description || "",
                                accentColor: category.accentColor || "",
                        });
        };

        const cancelEditing = () => {
                setEditingCategory(null);
                setEditingState(emptyCategory);
        };

        const handleUpdate = async (event) => {
                event.preventDefault();

                if (!editingCategory) return;

                setIsSubmitting(true);

                try {
                        const payload = {
                                ...editingState,
                                slug: editingState.slug ? ensureSlug(editingState.slug) : undefined,
                        };

                        const success = await onUpdate?.(editingCategory, payload);
                        if (success) {
                                cancelEditing();
                        }
                } catch (error) {
                        console.error("Update category failed", error);
                        toast.error("Unable to update category");
                } finally {
                        setIsSubmitting(false);
                }
        };

        const handleDelete = async (categoryId) => {
                const confirmed = window.confirm(
                        "Delete this category? It must not be assigned to any posts."
                );
                if (!confirmed) return;

                setIsSubmitting(true);
                try {
                        await onDelete?.(categoryId);
                } finally {
                        setIsSubmitting(false);
                }
        };

        return (
                <Card className="border-none shadow-sm">
                        <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                        Categories & taxonomy
                                </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                                <form onSubmit={handleCreate} className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                        <Label htmlFor="new-category-name">Category name</Label>
                                                        <Input
                                                                id="new-category-name"
                                                                value={formState.name}
                                                                onChange={(event) =>
                                                                        setFormState((prev) => ({
                                                                                ...prev,
                                                                                name: event.target.value,
                                                                        }))
                                                                }
                                                                required
                                                                placeholder="Safety insights"
                                                        />
                                                </div>
                                                <div className="space-y-2">
                                                        <Label htmlFor="new-category-slug">Slug</Label>
                                                        <Input
                                                                id="new-category-slug"
                                                                value={formState.slug}
                                                                onChange={(event) =>
                                                                        setFormState((prev) => ({
                                                                                ...prev,
                                                                                slug: event.target.value,
                                                                        }))
                                                                }
                                                                placeholder="safety-insights"
                                                        />
                                                </div>
                                        </div>
                                        <div className="space-y-2">
                                                <Label htmlFor="new-category-description">Description</Label>
                                                <Textarea
                                                        id="new-category-description"
                                                        value={formState.description}
                                                        onChange={(event) =>
                                                                setFormState((prev) => ({
                                                                        ...prev,
                                                                        description: event.target.value,
                                                                }))
                                                        }
                                                        rows={3}
                                                        placeholder="Explain what this category covers"
                                                />
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                                <Label htmlFor="new-category-color" className="flex items-center gap-2 text-sm">
                                                        <Palette className="h-4 w-4 text-gray-400" /> Accent color
                                                </Label>
                                                <Input
                                                        id="new-category-color"
                                                        type="color"
                                                        value={formState.accentColor || "#1d4ed8"}
                                                        onChange={(event) =>
                                                                setFormState((prev) => ({
                                                                        ...prev,
                                                                        accentColor: event.target.value,
                                                                }))
                                                        }
                                                        className="h-10 w-20 cursor-pointer p-1"
                                                />
                                                <span className="text-xs text-gray-500">
                                                        Use the color to visually group related articles.
                                                </span>
                                        </div>
                                        <Button type="submit" disabled={isSubmitting}>
                                                Create category
                                        </Button>
                                </form>

                                <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-800">
                                                        Existing categories
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                        {sortedCategories.length} total
                                                </span>
                                        </div>
                                        <ScrollArea className="h-72 rounded-lg border border-gray-200 p-3">
                                                <div className="space-y-3">
                                                        {sortedCategories.length === 0 && (
                                                                <p className="text-sm text-gray-500">
                                                                        No categories yet. Create your first category to organize
                                                                        posts.
                                                                </p>
                                                        )}
                                                        {sortedCategories.map((category) => {
                                                                const isEditing = editingCategory === category._id;

                                                                return (
                                                                        <div
                                                                                key={category._id}
                                                                                className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
                                                                        >
                                                                                {isEditing ? (
                                                                                        <form className="space-y-3" onSubmit={handleUpdate}>
                                                                                                <div className="grid gap-3 sm:grid-cols-2">
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor={`edit-name-${category._id}`}>
                                                                                                                        Name
                                                                                                                </Label>
                                                                                                                <Input
                                                                                                                        id={`edit-name-${category._id}`}
                                                                                                                        value={editingState.name}
                                                                                                                        onChange={(event) =>
                                                                                                                                setEditingState((prev) => ({
                                                                                                                                        ...prev,
                                                                                                                                        name: event.target.value,
                                                                                                                                }))
                                                                                                                        }
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor={`edit-slug-${category._id}`}>
                                                                                                                        Slug
                                                                                                                </Label>
                                                                                                                <Input
                                                                                                                        id={`edit-slug-${category._id}`}
                                                                                                                        value={editingState.slug}
                                                                                                                        onChange={(event) =>
                                                                                                                                setEditingState((prev) => ({
                                                                                                                                        ...prev,
                                                                                                                                        slug: event.target.value,
                                                                                                                                }))
                                                                                                                        }
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor={`edit-description-${category._id}`}>
                                                                                                                Description
                                                                                                        </Label>
                                                                                                        <Textarea
                                                                                                                id={`edit-description-${category._id}`}
                                                                                                                rows={3}
                                                                                                                value={editingState.description}
                                                                                                                onChange={(event) =>
                                                                                                                        setEditingState((prev) => ({
                                                                                                                                ...prev,
                                                                                                                                description: event.target.value,
                                                                                                                        }))
                                                                                                                }
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="flex items-center gap-3">
                                                                                                        <Input
                                                                                                                type="color"
                                                                                                                value={editingState.accentColor || "#1d4ed8"}
                                                                                                                onChange={(event) =>
                                                                                                                        setEditingState((prev) => ({
                                                                                                                                ...prev,
                                                                                                                                accentColor: event.target.value,
                                                                                                                        }))
                                                                                                                }
                                                                                                                className="h-10 w-20 cursor-pointer p-1"
                                                                                                        />
                                                                                                        <Badge variant="outline" className="text-xs">
                                                                                                                {category.postCount || 0} posts
                                                                                                        </Badge>
                                                                                                </div>
                                                                                                <div className="flex items-center justify-end gap-2">
                                                                                                        <Button
                                                                                                                type="button"
                                                                                                                variant="ghost"
                                                                                                                onClick={cancelEditing}
                                                                                                                disabled={isSubmitting}
                                                                                                        >
                                                                                                                Cancel
                                                                                                        </Button>
                                                                                                        <Button type="submit" disabled={isSubmitting}>
                                                                                                                Save
                                                                                                        </Button>
                                                                                                </div>
                                                                                        </form>
                                                                                ) : (
                                                                                        <div className="space-y-3">
                                                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                                                        <div>
                                                                                                                <p className="text-sm font-semibold text-gray-900">
                                                                                                                        {category.name}
                                                                                                                </p>
                                                                                                                {category.description && (
                                                                                                                        <p className="text-xs text-gray-500">
                                                                                                                                {category.description}
                                                                                                                        </p>
                                                                                                                )}
                                                                                                        </div>
                                                                                                        <Badge variant="outline" className="text-xs">
                                                                                                                {category.slug}
                                                                                                        </Badge>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                                                                        <span>{category.postCount || 0} posts</span>
                                                                                                        {category.accentColor && (
                                                                                                                <span
                                                                                                                        className="h-3 w-3 rounded-full border"
                                                                                                                        style={{ backgroundColor: category.accentColor }}
                                                                                                                />
                                                                                                        )}
                                                                                                </div>
                                                                                                <div className="flex items-center gap-2">
                                                                                                        <Button
                                                                                                                type="button"
                                                                                                                variant="ghost"
                                                                                                                size="sm"
                                                                                                                onClick={() => startEditing(category)}
                                                                                                        >
                                                                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                                                        </Button>
                                                                                                        <Button
                                                                                                                type="button"
                                                                                                                variant="ghost"
                                                                                                                size="sm"
                                                                                                                onClick={() => handleDelete(category._id)}
                                                                                                                disabled={isSubmitting}
                                                                                                                className="text-red-600 hover:bg-red-50"
                                                                                                        >
                                                                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                                                                        </Button>
                                                                                                </div>
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                );
                                                        })}
                                                </div>
                                        </ScrollArea>
                                </div>
                        </CardContent>
                        <CardFooter>
                                <p className="text-xs text-gray-500">
                                        Use categories to help readers explore related topics and improve
                                        content discovery.
                                </p>
                        </CardFooter>
                </Card>
        );
}
