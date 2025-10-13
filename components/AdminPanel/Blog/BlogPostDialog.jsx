"use client";

import { useEffect, useMemo, useState } from "react";
import {
        Dialog,
        DialogContent,
        DialogDescription,
        DialogFooter,
        DialogHeader,
        DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "./RichTextEditor.jsx";
import { TagInput } from "./TagInput.jsx";
import { CoverImageUploader } from "./CoverImageUploader.jsx";
import { ensureSlug } from "@/lib/slugify.js";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Rocket } from "lucide-react";

const normalizeCoverImage = (coverImage = {}) => ({
        url: typeof coverImage?.url === "string" ? coverImage.url : "",
        alt: typeof coverImage?.alt === "string" ? coverImage.alt : "",
        publicId: typeof coverImage?.publicId === "string" ? coverImage.publicId : "",
});

const createDefaultFormState = () => ({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        coverImage: normalizeCoverImage(),
        author: {
                name: "",
                avatar: "",
        },
        status: "draft",
        isFeatured: false,
        categories: [],
        tags: [],
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
});

const statusBadges = {
        published: {
                label: "Published",
                description: "Visible on the blog immediately",
        },
        draft: {
                label: "Draft",
                description: "Save progress without publishing",
        },
};

export function BlogPostDialog({
        open,
        onOpenChange,
        mode = "create",
        initialData,
        categories = [],
        onSubmit,
        isSaving = false,
}) {
        const [formState, setFormState] = useState(createDefaultFormState);

        const metaKeywordsString = useMemo(() => {
                if (typeof formState.metaKeywords === "string") {
                        return formState.metaKeywords;
                }
                if (Array.isArray(formState.metaKeywords)) {
                        return formState.metaKeywords.join(", ");
                }
                return "";
        }, [formState.metaKeywords]);

        useEffect(() => {
                if (open) {
                        setFormState((prev) => ({
                                ...prev,
                                ...(initialData || createDefaultFormState()),
                                coverImage: normalizeCoverImage(initialData?.coverImage),
                                categories: initialData?.categories?.map((category) => category._id) || [],
                                tags: initialData?.tags || [],
                                metaKeywords: Array.isArray(initialData?.metaKeywords)
                                        ? initialData.metaKeywords
                                        : initialData?.metaKeywords || "",
                        }));
                } else {
                        setFormState(createDefaultFormState());
                }
        }, [open, initialData]);

        const updateField = (field, value) => {
                setFormState((prev) => ({ ...prev, [field]: value }));
        };

        const handleSubmit = async (event) => {
                event.preventDefault();

                const payload = {
                        ...formState,
                        coverImage: {
                                url: formState.coverImage?.url?.trim() || "",
                                alt: formState.coverImage?.alt?.trim() || "",
                                publicId: formState.coverImage?.publicId?.trim() || "",
                        },
                        slug: ensureSlug(formState.slug || formState.title),
                        categories: formState.categories || [],
                        tags: formState.tags || [],
                        metaKeywords: (typeof formState.metaKeywords === "string"
                                ? formState.metaKeywords.split(",")
                                : formState.metaKeywords
                        ).map((keyword) => keyword.trim()).filter(Boolean),
                };

                const success = await onSubmit?.(payload);
                if (success) {
                        onOpenChange(false);
                }
        };

        const dialogTitle = mode === "edit" ? "Update blog post" : "Create new blog post";

        return (
                <Dialog open={open} onOpenChange={onOpenChange}>
                        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
                                <DialogHeader>
                                        <DialogTitle>{dialogTitle}</DialogTitle>
                                        <DialogDescription>
                                                Craft an engaging article with polished formatting, rich
                                                media, and SEO-friendly details.
                                        </DialogDescription>
                                </DialogHeader>

                                <form onSubmit={handleSubmit} className="space-y-8 py-2">
                                        <section className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-4">
                                                        <div className="space-y-2">
                                                                <Label htmlFor="blog-title">Title</Label>
                                                                <Input
                                                                        id="blog-title"
                                                                        value={formState.title}
                                                                        onChange={(event) =>
                                                                                updateField("title", event.target.value)
                                                                        }
                                                                        required
                                                                        placeholder="Write an eye-catching headline"
                                                                />
                                                                <p className="text-xs text-gray-500">
                                                                        Use descriptive titles that include keywords readers might
                                                                        search for.
                                                                </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                        <Label htmlFor="blog-slug">Slug</Label>
                                                                        <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() =>
                                                                                        updateField(
                                                                                                "slug",
                                                                                                ensureSlug(
                                                                                                        formState.slug || formState.title
                                                                                                )
                                                                                        )
                                                                                }
                                                                        >
                                                                                Generate
                                                                        </Button>
                                                                </div>
                                                                <Input
                                                                        id="blog-slug"
                                                                        value={formState.slug}
                                                                        onChange={(event) =>
                                                                                updateField("slug", event.target.value)
                                                                        }
                                                                        placeholder="example-featured-article"
                                                                />
                                                                <p className="text-xs text-gray-500">
                                                                        Slugs should be lowercase, hyphenated, and easy to read.
                                                                </p>
                                                        </div>

                                                        <div className="space-y-2">
                                                                <Label htmlFor="blog-excerpt">Excerpt</Label>
                                                                <Textarea
                                                                        id="blog-excerpt"
                                                                        value={formState.excerpt}
                                                                        onChange={(event) =>
                                                                                updateField("excerpt", event.target.value)
                                                                        }
                                                                        rows={4}
                                                                        placeholder="Write a compelling summary to entice readers"
                                                                />
                                                        </div>

                                                        <div className="grid gap-3 sm:grid-cols-2">
                                                                <div className="space-y-2">
                                                                        <Label htmlFor="blog-author">Author</Label>
                                                                        <Input
                                                                                id="blog-author"
                                                                                value={formState.author?.name || ""}
                                                                                onChange={(event) =>
                                                                                        updateField("author", {
                                                                                                ...formState.author,
                                                                                                name: event.target.value,
                                                                                        })
                                                                                }
                                                                                placeholder="Name displayed on the article"
                                                                        />
                                                                </div>
                                                                <div className="space-y-2">
                                                                        <Label htmlFor="blog-author-avatar">Author avatar URL</Label>
                                                                        <Input
                                                                                id="blog-author-avatar"
                                                                                value={formState.author?.avatar || ""}
                                                                                onChange={(event) =>
                                                                                        updateField("author", {
                                                                                                ...formState.author,
                                                                                                avatar: event.target.value,
                                                                                        })
                                                                                }
                                                                                placeholder="Optional profile image"
                                                                        />
                                                                </div>
                                                        </div>

                                                        <div className="space-y-2 rounded-lg border border-gray-200 p-4">
                                                                <div className="flex items-center justify-between">
                                                                        <div>
                                                                                <p className="text-sm font-medium text-gray-800">
                                                                                        Publishing status
                                                                                </p>
                                                                                <p className="text-xs text-gray-500">
                                                                                        Control whether the article is live or saved as a draft.
                                                                                </p>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                                <span className="text-xs font-medium uppercase text-gray-500">
                                                                                        {statusBadges[formState.status]?.label}
                                                                                </span>
                                                                                <Switch
                                                                                        checked={formState.status === "published"}
                                                                                        onCheckedChange={(checked) =>
                                                                                                updateField(
                                                                                                        "status",
                                                                                                        checked ? "published" : "draft"
                                                                                                )
                                                                                        }
                                                                                        aria-label="Toggle publish status"
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <p className="flex items-center gap-2 text-xs text-gray-500">
                                                                        <CalendarDays className="h-4 w-4" />
                                                                        {statusBadges[formState.status]?.description}
                                                                </p>
                                                        </div>

                                                        <div className="flex items-center justify-between rounded-lg border border-blue-100 bg-blue-50 p-4">
                                                                <div>
                                                                        <p className="text-sm font-medium text-blue-900">
                                                                                Feature this article
                                                                        </p>
                                                                        <p className="text-xs text-blue-700">
                                                                                Highlight on the blog landing page for maximum visibility.
                                                                        </p>
                                                                </div>
                                                                <Switch
                                                                        checked={formState.isFeatured}
                                                                        onCheckedChange={(checked) =>
                                                                                updateField("isFeatured", checked)
                                                                        }
                                                                        aria-label="Mark as featured"
                                                                />
                                                        </div>
                                                </div>

                                                <div className="space-y-6">
                                                        <CoverImageUploader
                                                                value={formState.coverImage}
                                                                onChange={(coverImage) => updateField("coverImage", coverImage)}
                                                        />

                                                        <div className="space-y-3">
                                                                <Label>Categories</Label>
                                                                <ScrollArea className="h-48 rounded-lg border border-gray-200 p-3">
                                                                        <div className="space-y-2">
                                                                                {categories.length === 0 && (
                                                                                        <p className="text-sm text-gray-500">
                                                                                                No categories yet. Create one to help readers explore
                                                                                                related topics.
                                                                                        </p>
                                                                                )}
                                                                                {categories.map((category) => {
                                                                                        const isChecked = formState.categories.includes(
                                                                                                category._id
                                                                                        );
                                                                                        return (
                                                                                                <label
                                                                                                        key={category._id}
                                                                                                        className="flex items-start gap-3 rounded-md border border-transparent p-2 hover:border-blue-100 hover:bg-blue-50"
                                                                                                >
                                                                                                        <Checkbox
                                                                                                                checked={isChecked}
                                                                                                                onCheckedChange={(checked) => {
                                                                                                                        updateField(
                                                                                                                                "categories",
                                                                                                                                checked
                                                                                                                                        ? [...formState.categories, category._id]
                                                                                                                                        : formState.categories.filter((id) => id !== category._id)
                                                                                                                        );
                                                                                                                }}
                                                                                                        />
                                                                                                        <div className="space-y-1">
                                                                                                                <p className="text-sm font-medium text-gray-800">
                                                                                                                        {category.name}
                                                                                                                </p>
                                                                                                                {category.description && (
                                                                                                                        <p className="text-xs text-gray-500">
                                                                                                                                {category.description}
                                                                                                                        </p>
                                                                                                                )}
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                        <Badge
                                                                                                                                variant="outline"
                                                                                                                                className="border-blue-200 text-xs text-blue-700"
                                                                                                                        >
                                                                                                                                {category.postCount || 0} posts
                                                                                                                        </Badge>
                                                                                                                        {category.accentColor && (
                                                                                                                                <span
                                                                                                                                        className="h-3 w-3 rounded-full border"
                                                                                                                                        style={{ backgroundColor: category.accentColor }}
                                                                                                                                />
                                                                                                                        )}
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </label>
                                                                                        );
                                                                                })}
                                                                        </div>
                                                                </ScrollArea>
                                                        </div>

                                                        <TagInput
                                                                value={formState.tags}
                                                                onChange={(tags) => updateField("tags", tags)}
                                                                placeholder="Safety tips, protective gear, compliance..."
                                                        />
                                                </div>
                                        </section>

                                        <section className="space-y-4">
                                                <RichTextEditor
                                                        value={formState.content}
                                                        onChange={(content) => updateField("content", content)}
                                                />
                                        </section>

                                        <section className="space-y-4 rounded-lg border border-gray-200 p-4">
                                                <div className="flex items-center gap-2 text-blue-800">
                                                        <Rocket className="h-5 w-5" />
                                                        <p className="text-sm font-semibold">SEO optimization</p>
                                                </div>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                        <div className="space-y-2">
                                                                <Label htmlFor="blog-meta-title">Meta title</Label>
                                                                <Input
                                                                        id="blog-meta-title"
                                                                        value={formState.metaTitle}
                                                                        onChange={(event) =>
                                                                                updateField("metaTitle", event.target.value)
                                                                        }
                                                                        maxLength={70}
                                                                        placeholder="Title shown in search results"
                                                                />
                                                                <p className="text-xs text-gray-500">
                                                                        Aim for 55-60 characters. Currently {formState.metaTitle.length}.
                                                                </p>
                                                        </div>
                                                        <div className="space-y-2">
                                                                <Label htmlFor="blog-meta-keywords">Meta keywords</Label>
                                                                <Input
                                                                        id="blog-meta-keywords"
                                                                        value={metaKeywordsString}
                                                                        onChange={(event) =>
                                                                                updateField("metaKeywords", event.target.value)
                                                                        }
                                                                        placeholder="Comma separated keywords"
                                                                />
                                                                <p className="text-xs text-gray-500">
                                                                        Keywords help search engines understand the article's focus.
                                                                </p>
                                                        </div>
                                                </div>
                                                <div className="space-y-2">
                                                        <Label htmlFor="blog-meta-description">Meta description</Label>
                                                        <Textarea
                                                                id="blog-meta-description"
                                                                value={formState.metaDescription}
                                                                onChange={(event) =>
                                                                        updateField("metaDescription", event.target.value)
                                                                }
                                                                rows={3}
                                                                maxLength={160}
                                                                placeholder="A concise summary for search engines and sharing"
                                                        />
                                                        <p className="text-xs text-gray-500">
                                                                {formState.metaDescription.length} / 160 characters used.
                                                        </p>
                                                </div>
                                        </section>

                                        <DialogFooter>
                                                <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => onOpenChange(false)}
                                                        disabled={isSaving}
                                                >
                                                        Cancel
                                                </Button>
                                                <Button type="submit" disabled={isSaving}>
                                                        {isSaving
                                                                ? mode === "edit"
                                                                        ? "Saving changes..."
                                                                        : "Publishing..."
                                                                : mode === "edit"
                                                                ? "Save changes"
                                                                : "Publish post"}
                                                </Button>
                                        </DialogFooter>
                                </form>
                        </DialogContent>
                </Dialog>
        );
}
