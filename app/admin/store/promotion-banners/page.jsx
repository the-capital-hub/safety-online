"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UploadCloud, ImagePlus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const FALLBACK_IMAGE =
        "https://res.cloudinary.com/drjt9guif/image/upload/v1755168534/safetyonline_fks0th.png";

const initialFormState = {
        brandName: "",
        discountPercentage: "",
        tagline: "",
        displayOrder: "",
        isActive: true,
        bannerImagePublicId: "",
};

export default function PromotionBannersPage() {
        const router = useRouter();
        const isAuthenticated = useIsAuthenticated();

        const [banners, setBanners] = useState([]);
        const [loading, setLoading] = useState(true);
        const [submitting, setSubmitting] = useState(false);
        const [formState, setFormState] = useState(initialFormState);
        const [imageFile, setImageFile] = useState(null);
        const [imagePreview, setImagePreview] = useState("");
        const [previewIsLocal, setPreviewIsLocal] = useState(false);
        const [editingBannerId, setEditingBannerId] = useState(null);

        useEffect(() => {
                if (!isAuthenticated) {
                        router.push("/admin/login");
                }
        }, [isAuthenticated, router]);

        useEffect(() => {
                if (isAuthenticated) {
                        fetchBanners();
                }
        }, [isAuthenticated]);

        useEffect(() => () => {
                if (imagePreview && previewIsLocal) {
                        URL.revokeObjectURL(imagePreview);
                }
        }, [imagePreview, previewIsLocal]);

        const nextDisplayOrder = useMemo(() => {
                if (!banners.length) return 1;
                const existingOrders = banners
                        .map((banner) => Number(banner.displayOrder) || 0)
                        .sort((a, b) => b - a);
                return (existingOrders[0] || banners.length) + 1;
        }, [banners]);

        useEffect(() => {
                if (!editingBannerId) {
                        setFormState((prev) => ({ ...prev, displayOrder: String(nextDisplayOrder) }));
                }
        }, [editingBannerId, nextDisplayOrder]);

        const fetchBanners = async () => {
                try {
                        setLoading(true);
                        const response = await fetch("/api/admin/brand-promotions", {
                                cache: "no-store",
                        });
                        const data = await response.json();

                        if (!response.ok || !data.success) {
                                throw new Error(data.message || "Failed to load banners");
                        }

                        setBanners(data.banners || []);
                } catch (error) {
                        console.error("Failed to fetch brand promotions", error);
                        toast.error(error.message || "Failed to fetch promotion banners");
                } finally {
                        setLoading(false);
                }
        };

        const resetForm = () => {
                setFormState({ ...initialFormState, displayOrder: String(nextDisplayOrder) });
                setImageFile(null);
                if (imagePreview && previewIsLocal) {
                        URL.revokeObjectURL(imagePreview);
                }
                setImagePreview("");
                setPreviewIsLocal(false);
                setEditingBannerId(null);
        };

        const handleFileChange = (event) => {
                const file = event.target.files?.[0];
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                        toast.error("Please select a valid image file");
                        return;
                }

                if (file.size > 5 * 1024 * 1024) {
                        toast.error("Image must be smaller than 5MB");
                        return;
                }

                if (imagePreview && previewIsLocal) {
                        URL.revokeObjectURL(imagePreview);
                }

                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                setPreviewIsLocal(true);
                setFormState((prev) => ({
                        ...prev,
                        bannerImagePublicId: "",
                }));
        };

        const uploadImage = async () => {
                if (!imageFile) {
                        return {
                                url: imagePreview,
                                publicId: formState.bannerImagePublicId || undefined,
                        };
                }

                const uploadData = new FormData();
                uploadData.append("file", imageFile);
                uploadData.append("folder", "brand_promotions");

                const response = await fetch("/api/upload", {
                        method: "POST",
                        body: uploadData,
                });

                const data = await response.json();
                if (!response.ok || !data.success) {
                        throw new Error(data.message || "Failed to upload image");
                }

                return {
                        url: data.url,
                        publicId: data.publicId || "",
                };
        };

        const handleSubmit = async (event) => {
                event.preventDefault();

                if (!formState.brandName.trim()) {
                        toast.error("Brand name is required");
                        return;
                }

                if (!editingBannerId && !imageFile && !imagePreview) {
                        toast.error("Banner image is required");
                        return;
                }

                const discountValue = formState.discountPercentage.trim();
                if (discountValue) {
                        const numericValue = Number(discountValue);
                        if (Number.isNaN(numericValue) || numericValue < 0 || numericValue > 100) {
                                toast.error("Discount must be between 0 and 100");
                                return;
                        }
                }

                setSubmitting(true);

                try {
                        const { url: uploadedUrl, publicId: uploadedPublicId } = await uploadImage();
                        const bannerImageUrl = uploadedUrl || imagePreview || FALLBACK_IMAGE;
                        const bannerImagePublicId = uploadedPublicId || formState.bannerImagePublicId || "";
                        const shouldIncludeImage =
                                !editingBannerId || Boolean(imageFile) || Boolean(bannerImagePublicId);

                        if (shouldIncludeImage && !bannerImagePublicId) {
                                throw new Error("Failed to upload banner image. Please try again.");
                        }

                        const payload = {
                                brandName: formState.brandName.trim(),
                                discountPercentage: discountValue ? Number(discountValue) : 0,
                                tagline: formState.tagline.trim(),
                                displayOrder: formState.displayOrder ? Number(formState.displayOrder) : 0,
                                isActive: formState.isActive,
                        };

                        if (shouldIncludeImage) {
                                payload.bannerImage = bannerImageUrl;
                                payload.bannerImagePublicId = bannerImagePublicId;
                        }

                        let response;
                        if (editingBannerId) {
                                response = await fetch(`/api/admin/brand-promotions/${editingBannerId}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload),
                                });
                        } else {
                                response = await fetch("/api/admin/brand-promotions", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(payload),
                                });
                        }

                        const data = await response.json();

                        if (!response.ok || !data.success) {
                                throw new Error(data.message || "Failed to save banner");
                        }

                        toast.success(editingBannerId ? "Banner updated" : "Banner created");
                        await fetchBanners();
                        resetForm();
                } catch (error) {
                        console.error("Failed to save promotion banner", error);
                        toast.error(error.message || "Failed to save banner");
                } finally {
                        setSubmitting(false);
                }
        };

        const startEdit = (banner) => {
                setEditingBannerId(banner.id);
                setFormState({
                        brandName: banner.brandName,
                        discountPercentage: banner.discountPercentage?.toString() || "",
                        tagline: banner.tagline || "",
                        displayOrder: banner.displayOrder?.toString() || "0",
                        isActive: banner.isActive,
                        bannerImagePublicId: banner.bannerImagePublicId || "",
                });
                setImageFile(null);
                if (imagePreview && previewIsLocal) {
                        URL.revokeObjectURL(imagePreview);
                }
                setImagePreview(banner.bannerImage || FALLBACK_IMAGE);
                setPreviewIsLocal(false);
        };

        const handleDelete = async (banner) => {
                const shouldDelete = window.confirm(
                        `Are you sure you want to delete the banner for ${banner.brandName}?`
                );
                if (!shouldDelete) return;

                try {
                        const response = await fetch(`/api/admin/brand-promotions/${banner.id}`, {
                                method: "DELETE",
                        });
                        const data = await response.json();
                        if (!response.ok || !data.success) {
                                throw new Error(data.message || "Failed to delete banner");
                        }
                        toast.success("Banner deleted");
                        await fetchBanners();
                        if (editingBannerId === banner.id) {
                                resetForm();
                        }
                } catch (error) {
                        console.error("Failed to delete banner", error);
                        toast.error(error.message || "Failed to delete banner");
                }
        };

        const toggleActive = async (banner, newValue) => {
                try {
                        const response = await fetch(`/api/admin/brand-promotions/${banner.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isActive: newValue }),
                        });
                        const data = await response.json();
                        if (!response.ok || !data.success) {
                                throw new Error(data.message || "Failed to update banner");
                        }
                        setBanners((prev) =>
                                prev.map((item) =>
                                        item.id === banner.id ? { ...item, isActive: newValue } : item
                                )
                        );
                } catch (error) {
                        console.error("Failed to toggle banner", error);
                        toast.error(error.message || "Failed to update banner");
                }
        };

        if (!isAuthenticated) {
                return (
                        <div className="flex items-center justify-center py-12">
                                <div className="text-gray-500">Redirecting to login...</div>
                        </div>
                );
        }

        return (
                <div className="space-y-6">
                        <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35 }}
                        >
                                <h1 className="text-3xl font-bold text-gray-900">Promotion Banners</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                        Manage spotlight brand banners shown on the storefront home page.
                                </p>
                        </motion.div>

                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                                <Card className="border-gray-200 shadow-sm">
                                        <CardHeader>
                                                <CardTitle>{editingBannerId ? "Edit Banner" : "Create Banner"}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                <form className="space-y-5" onSubmit={handleSubmit}>
                                                        <div className="space-y-2">
                                                                <Label htmlFor="brand-name">Brand name</Label>
                                                                <Input
                                                                        id="brand-name"
                                                                        placeholder="e.g. Longway"
                                                                        value={formState.brandName}
                                                                        onChange={(event) =>
                                                                                setFormState((prev) => ({
                                                                                        ...prev,
                                                                                        brandName: event.target.value,
                                                                                }))
                                                                        }
                                                                        required
                                                                />
                                                        </div>

                                                        <div className="grid gap-4 sm:grid-cols-2">
                                                                <div className="space-y-2">
                                                                        <Label htmlFor="discount-percentage">Discount percentage</Label>
                                                                        <Input
                                                                                id="discount-percentage"
                                                                                type="number"
                                                                                min={0}
                                                                                max={100}
                                                                                placeholder="e.g. 40"
                                                                                value={formState.discountPercentage}
                                                                                onChange={(event) =>
                                                                                        setFormState((prev) => ({
                                                                                                ...prev,
                                                                                                discountPercentage: event.target.value,
                                                                                        }))
                                                                                }
                                                                        />
                                                                </div>
                                                                <div className="space-y-2">
                                                                        <Label htmlFor="display-order">Display order</Label>
                                                                        <Input
                                                                                id="display-order"
                                                                                type="number"
                                                                                min={0}
                                                                                value={formState.displayOrder}
                                                                                onChange={(event) =>
                                                                                        setFormState((prev) => ({
                                                                                                ...prev,
                                                                                                displayOrder: event.target.value,
                                                                                        }))
                                                                                }
                                                                        />
                                                                </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                                <Label htmlFor="tagline">Offer subtitle</Label>
                                                                <Textarea
                                                                        id="tagline"
                                                                        placeholder="e.g. Up to 50% off on premium appliances"
                                                                        value={formState.tagline}
                                                                        onChange={(event) =>
                                                                                setFormState((prev) => ({
                                                                                        ...prev,
                                                                                        tagline: event.target.value,
                                                                                }))
                                                                        }
                                                                        rows={3}
                                                                />
                                                        </div>

                                                        <div className="space-y-2">
                                                                <Label>Banner image</Label>
                                                                <div className="flex flex-col gap-4 sm:flex-row">
                                                                        <label
                                                                                htmlFor="banner-image-input"
                                                                                className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-gray-400 sm:w-1/2"
                                                                        >
                                                                                <input
                                                                                        id="banner-image-input"
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="hidden"
                                                                                        onChange={handleFileChange}
                                                                                />
                                                                                <div className="flex flex-col items-center gap-2 text-gray-500">
                                                                                        <UploadCloud className="h-8 w-8" />
                                                                                        <span className="text-sm font-medium">Upload image</span>
                                                                                        <span className="text-xs text-center">
                                                                                                Recommended ratio 16:6 (max 5MB)
                                                                                        </span>
                                                                                </div>
                                                                        </label>
                                                                        <div className="relative h-40 flex-1 overflow-hidden rounded-2xl border bg-gray-100">
                                                                                {imagePreview ? (
                                                                                        <Image
                                                                                                src={imagePreview}
                                                                                                alt="Banner preview"
                                                                                                fill
                                                                                                className="object-cover"
                                                                                        />
                                                                                ) : (
                                                                                        <div className="flex h-full items-center justify-center text-gray-400">
                                                                                                <ImagePlus className="h-10 w-10" />
                                                                                        </div>
                                                                                )}
                                                                        </div>
                                                                </div>
                                                        </div>

                                                        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                                                                <div>
                                                                        <p className="text-sm font-semibold text-gray-900">Show banner</p>
                                                                        <p className="text-xs text-gray-500">Toggle to hide this banner without deleting</p>
                                                                </div>
                                                                <Switch
                                                                        checked={formState.isActive}
                                                                        onCheckedChange={(value) =>
                                                                                setFormState((prev) => ({
                                                                                        ...prev,
                                                                                        isActive: value,
                                                                                }))
                                                                        }
                                                                />
                                                        </div>

                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                                                {editingBannerId && (
                                                                        <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                onClick={resetForm}
                                                                                disabled={submitting}
                                                                        >
                                                                                Cancel
                                                                        </Button>
                                                                )}
                                                                <Button type="submit" disabled={submitting}>
                                                                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                        {editingBannerId ? "Update Banner" : "Create Banner"}
                                                                </Button>
                                                        </div>
                                                </form>
                                        </CardContent>
                                </Card>

                                <Card className="border-gray-200 shadow-sm">
                                        <CardHeader>
                                                <CardTitle>Existing Banners</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                                {loading ? (
                                                        <div className="flex items-center justify-center py-12 text-gray-500">
                                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                                Loading banners...
                                                        </div>
                                                ) : banners.length === 0 ? (
                                                        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-sm text-gray-500">
                                                                No promotion banners have been created yet.
                                                        </div>
                                                ) : (
                                                        <div className="grid gap-4">
                                                                {banners.map((banner) => (
                                                                        <div
                                                                                key={banner.id}
                                                                                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                                                                        >
                                                                                <div className="relative h-28 w-full overflow-hidden rounded-xl sm:w-48">
                                                                                        <Image
                                                                                                src={banner.bannerImage || FALLBACK_IMAGE}
                                                                                                alt={`${banner.brandName} banner`}
                                                                                                fill
                                                                                                className="object-cover"
                                                                                        />
                                                                                </div>
                                                                                <div className="flex-1 space-y-1">
                                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                                                <p className="text-lg font-semibold text-gray-900">
                                                                                                        {banner.brandName}
                                                                                                </p>
                                                                                                {!banner.isActive && (
                                                                                                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                                                                                                Hidden
                                                                                                        </span>
                                                                                                )}
                                                                                        </div>
                                                                                        <p className="text-sm text-gray-500">
                                                                                                {banner.tagline || `Up to ${banner.discountPercentage}% off`}
                                                                                        </p>
                                                                                        <p className="text-xs text-gray-400">
                                                                                                Display order: {banner.displayOrder ?? 0}
                                                                                        </p>
                                                                                </div>
                                                                                <div className="flex flex-col items-end gap-3">
                                                                                        <div className="flex items-center gap-2">
                                                                                                <Switch
                                                                                                        checked={banner.isActive}
                                                                                                        onCheckedChange={(value) => toggleActive(banner, value)}
                                                                                                />
                                                                                                <span className="text-xs text-gray-500">Visible</span>
                                                                                        </div>
                                                                                        <div className="flex gap-2">
                                                                                                <Button
                                                                                                        type="button"
                                                                                                        variant="outline"
                                                                                                        size="icon"
                                                                                                        onClick={() => startEdit(banner)}
                                                                                                >
                                                                                                        <Pencil className="h-4 w-4" />
                                                                                                </Button>
                                                                                                <Button
                                                                                                        type="button"
                                                                                                        variant="destructive"
                                                                                                        size="icon"
                                                                                                        onClick={() => handleDelete(banner)}
                                                                                                >
                                                                                                        <Trash2 className="h-4 w-4" />
                                                                                                </Button>
                                                                                        </div>
                                                                                </div>
                                                                        </div>
                                                                ))}
                                                        </div>
                                                )}
                                        </CardContent>
                                </Card>
                        </div>
                </div>
        );
}
