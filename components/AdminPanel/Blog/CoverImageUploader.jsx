"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, ImageIcon, Trash } from "lucide-react";
import { toast } from "react-hot-toast";

export function CoverImageUploader({ value, onChange }) {
        const [isUploading, setIsUploading] = useState(false);
        const fileInputRef = useRef(null);

        const uploadImage = async (file) => {
                if (!file) return;

                const formData = new FormData();
                formData.append("file", file);
                formData.append("folder", "blog_covers");

                setIsUploading(true);

                try {
                        const response = await fetch("/api/upload", {
                                method: "POST",
                                body: formData,
                        });
                        const data = await response.json();

                        if (!data.success) {
                                throw new Error(data.message || "Upload failed");
                        }

                        onChange?.({
                                url: data.url,
                                alt: value?.alt || "",
                                publicId: data.publicId || "",
                        });

                        toast.success("Cover image uploaded");
                } catch (error) {
                        console.error("Cover image upload error", error);
                        toast.error(error?.message || "Failed to upload image");
                } finally {
                        setIsUploading(false);
                }
        };

        const handleFileChange = (event) => {
                const file = event.target.files?.[0];
                if (file) {
                        uploadImage(file);
                }
                event.target.value = "";
        };

        const openFilePicker = () => {
                fileInputRef.current?.click();
        };

        return (
                <div className="space-y-4">
                        <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700">
                                        Featured Image
                                </Label>
                                <p className="text-xs text-gray-500">
                                        Upload a high-quality image (max 5MB). This image is used on
                                        the listing and detail page.
                                </p>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                                <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                                <button
                                                        type="button"
                                                        onClick={openFilePicker}
                                                        className="inline-flex items-center gap-2 rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600"
                                                >
                                                        <Upload className="h-4 w-4" /> Upload image
                                                </button>
                                                <Input
                                                        id="blog-cover-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        ref={fileInputRef}
                                                        onChange={handleFileChange}
                                                />

                                                <Input
                                                        placeholder="Or paste an image URL"
                                                        value={value?.url || ""}
                                                        onChange={(event) =>
                                                        onChange?.({
                                                                url: event.target.value,
                                                                alt: value?.alt || "",
                                                                publicId: "",
                                                        })
                                                        }
                                                />
                                        </div>
                                        {isUploading && (
                                                <div className="inline-flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 text-sm text-blue-700">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Uploading image...
                                                </div>
                                        )}
                                </div>

                                <div className="relative h-40 w-full overflow-hidden rounded-lg border border-gray-200 sm:w-56">
                                        {value?.url ? (
                                                <Image
                                                        src={value.url}
                                                        alt={value?.alt || "Blog cover image"}
                                                        fill
                                                        sizes="(max-width: 640px) 100vw, 224px"
                                                        className="object-cover"
                                                />
                                        ) : (
                                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                                                        <ImageIcon className="h-8 w-8" />
                                                        <span className="text-xs">No image selected</span>
                                                </div>
                                        )}

                                        {value?.url && (
                                                <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="icon"
                                                        className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white/80 text-gray-700 hover:bg-white"
                                                        onClick={() =>
                                                                onChange?.({
                                                                        url: "",
                                                                        alt: value?.alt || "",
                                                                        publicId: "",
                                                                })
                                                        }
                                                >
                                                        <Trash className="h-4 w-4" />
                                                </Button>
                                        )}
                                </div>
                        </div>

                        <div className="space-y-2">
                                <Label htmlFor="blog-cover-alt" className="text-sm font-medium text-gray-700">
                                        Alt text
                                </Label>
                                <Input
                                        id="blog-cover-alt"
                                        placeholder="Describe the image for accessibility and SEO"
                                        value={value?.alt || ""}
                                        onChange={(event) =>
                                                onChange?.({
                                                        url: value?.url || "",
                                                        alt: event.target.value,
                                                        publicId: value?.publicId || "",
                                                })
                                        }
                                />
                                <p className="text-xs text-gray-500">
                                        Alt text appears in search results and improves accessibility.
                                </p>
                        </div>
                </div>
        );
}
