"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, UploadCloud, ImageIcon, Plus, Trash2 } from "lucide-react";
import { companyBaseSchema } from "@/zodSchema/companyScema.js";
import { toast } from "react-hot-toast";

export default function ShopForm() {
        const [form, setForm] = useState({
                companyName: "",
                companyEmail: "",
                phone: "",
                gstinNumber: "",
                companyLogo: "",
                promotionalBanners: [],
        });
        const [loading, setLoading] = useState(false);
        const [logoUploading, setLogoUploading] = useState(false);
        const [hasCompany, setHasCompany] = useState(false);
        const [bannerUploads, setBannerUploads] = useState([]);

        useEffect(() => {
                let isMounted = true;
                (async () => {
                        try {
				const res = await fetch("/api/seller/company/getCompany", {
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					const c = data.company;
					if (isMounted && c) {
                                                const banners = Array.isArray(c.promotionalBanners)
                                                        ? c.promotionalBanners.map((banner) => ({
                                                                  imageUrl: banner.imageUrl || "",
                                                                  title: banner.title || "",
                                                                  description: banner.description || "",
                                                          }))
                                                        : [];

                                                setForm({
                                                        companyName: c.companyName || "",
                                                        companyEmail: c.companyEmail || "",
                                                        phone: c.phone || "",
                                                        gstinNumber: c.gstinNumber || "",
                                                        companyLogo: c.companyLogo || "",
                                                        promotionalBanners: banners,
                                                });
                                                setBannerUploads(Array(banners.length).fill(false));
                                                setHasCompany(true);
                                        }
                                } else {
                                        setHasCompany(false);
                                        setBannerUploads([]);
                                }
                        } catch {
                                setHasCompany(false);
                                setBannerUploads([]);
                        }
                })();
                return () => {
                        isMounted = false;
                };
	}, []);

	const onChange = (e) => {
		const { name, value } = e.target;
		setForm((s) => ({ ...s, [name]: value }));
	};

	const handleLogoChange = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}
		if (file.size > 3 * 1024 * 1024) {
			toast.error("Max file size is 3MB");
			return;
		}
		setLogoUploading(true);
		try {
			const fd = new FormData();
			fd.append("file", file);
			const res = await fetch("/api/seller/company/upload-logo", {
				method: "POST",
				body: fd,
				credentials: "include",
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data?.error || "Upload failed");
			}
			setForm((s) => ({ ...s, companyLogo: data.url }));
			toast.success("Logo uploaded");
		} catch (err) {
			toast.error(err.message || "Failed to upload logo");
		} finally {
			setLogoUploading(false);
		}
	};

        const handleSubmit = async (e) => {
                e.preventDefault();
                const sanitizedBanners = Array.isArray(form.promotionalBanners)
                        ? form.promotionalBanners
                                  .filter(
                                          (banner) =>
                                                  banner &&
                                                  typeof banner.imageUrl === "string" &&
                                                  banner.imageUrl.trim()
                                  )
                                  .map((banner) => ({
                                          imageUrl: banner.imageUrl.trim(),
                                          title: banner.title?.trim() || "",
                                          description: banner.description?.trim() || "",
                                  }))
                        : [];

                const payload = {
                        ...form,
                        promotionalBanners: sanitizedBanners,
                };

                // Client-side Zod validation
                const parsed = companyBaseSchema.safeParse(payload);
                if (!parsed.success) {
                        const first = parsed.error.errors[0];
                        toast.error(first.message);
                        return;
                }
		setLoading(true);
		try {
			const endpoint = hasCompany
				? "/api/seller/company/updateCompany"
				: "/api/seller/company/createCompany";
			const method = hasCompany ? "PUT" : "POST";
                        const res = await fetch(endpoint, {
                                method,
                                headers: { "Content-Type": "application/json" },
                                credentials: "include",
                                body: JSON.stringify(payload),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.error || "Failed to save company");
                        setHasCompany(true);
                        setForm((prev) => ({
                                ...prev,
                                promotionalBanners: sanitizedBanners,
                        }));
                        setBannerUploads(Array(sanitizedBanners.length).fill(false));
                        toast.success(hasCompany ? "Company updated" : "Company created");
                } catch (err) {
                        toast.error(err.message || "Failed to save");
                } finally {
                        setLoading(false);
                }
        };

        const handleAddBanner = () => {
                setForm((s) => {
                        const banners = Array.isArray(s.promotionalBanners)
                                ? [...s.promotionalBanners]
                                : [];
                        if (banners.length >= 5) {
                                toast.error("You can upload up to 5 promotional banners");
                                return s;
                        }
                        const updated = [
                                ...banners,
                                { imageUrl: "", title: "", description: "" },
                        ];
                        setBannerUploads((prev) => [...prev, false]);
                        return { ...s, promotionalBanners: updated };
                });
        };

        const handleBannerFieldChange = (index, field, value) => {
                setForm((s) => {
                        const banners = Array.isArray(s.promotionalBanners)
                                ? [...s.promotionalBanners]
                                : [];
                        if (!banners[index]) {
                                banners[index] = { imageUrl: "", title: "", description: "" };
                        }
                        banners[index] = { ...banners[index], [field]: value };
                        return { ...s, promotionalBanners: banners };
                });
        };

        const handleRemoveBanner = (index) => {
                setForm((s) => {
                        const banners = Array.isArray(s.promotionalBanners)
                                ? s.promotionalBanners.filter((_, i) => i !== index)
                                : [];
                        return { ...s, promotionalBanners: banners };
                });
                setBannerUploads((prev) => prev.filter((_, i) => i !== index));
        };

        const handleBannerFileChange = (index) => async (event) => {
                const input = event.target;
                const file = input.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/")) {
                        toast.error("Please select an image file");
                        input.value = "";
                        return;
                }
                if (file.size > 5 * 1024 * 1024) {
                        toast.error("Max file size is 5MB");
                        input.value = "";
                        return;
                }

                setBannerUploads((prev) => {
                        const next = [...prev];
                        next[index] = true;
                        return next;
                });

                try {
                        const fd = new FormData();
                        fd.append("file", file);
                        fd.append("folder", "brand_promotions");
                        const res = await fetch("/api/upload", {
                                method: "POST",
                                body: fd,
                                credentials: "include",
                        });
                        const data = await res.json();
                        if (!res.ok || !data.success) {
                                throw new Error(data?.message || "Upload failed");
                        }
                        setForm((s) => {
                                const banners = Array.isArray(s.promotionalBanners)
                                        ? [...s.promotionalBanners]
                                        : [];
                                if (!banners[index]) {
                                        banners[index] = {
                                                imageUrl: "",
                                                title: "",
                                                description: "",
                                        };
                                }
                                banners[index] = {
                                        ...banners[index],
                                        imageUrl: data.url,
                                };
                                return { ...s, promotionalBanners: banners };
                        });
                        toast.success("Banner uploaded");
                } catch (err) {
                        toast.error(err.message || "Failed to upload banner");
                } finally {
                        setBannerUploads((prev) => {
                                const next = [...prev];
                                next[index] = false;
                                return next;
                        });
                        input.value = "";
                }
        };

        return (
                <Card className="border border-gray-200">
                        <CardHeader>
                                <CardTitle>Company Profile</CardTitle>
				<CardDescription>Basic company details.</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="grid gap-6">
					<div className="grid grid-cols-1 md:grid-cols-[1fr,220px] gap-6">
						<div className="grid gap-4">
							<div className="grid gap-2">
								<Label htmlFor="companyName">Company Name</Label>
								<Input
									id="companyName"
									name="companyName"
									value={form.companyName}
									onChange={onChange}
									placeholder="Acme Industries Pvt. Ltd."
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="companyEmail">Company Email</Label>
								<Input
									id="companyEmail"
									name="companyEmail"
									type="email"
									value={form.companyEmail}
									onChange={onChange}
									placeholder="support@company.com"
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="phone">Company Phone</Label>
								<Input
									id="phone"
									name="phone"
									inputMode="numeric"
									pattern="[0-9]*"
									value={form.phone}
									onChange={onChange}
									placeholder="10-15 digit number"
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="gstinNumber">GSTIN</Label>
								<Input
									id="gstinNumber"
									name="gstinNumber"
									value={form.gstinNumber}
									onChange={onChange}
									placeholder="22AAAAA0000A1Z5"
									required
								/>
							</div>
						</div>

						<div className="space-y-3">
							<Label>Company Logo</Label>
							<div className="rounded-lg border border-dashed p-3 flex flex-col items-center justify-center text-center">
								{form.companyLogo ? (
									<div className="w-full">
										<Image
											src={form.companyLogo || "/placeholder.svg"}
											alt="Company Logo"
											width={320}
											height={160}
											className="mx-auto h-28 w-auto object-contain"
											onError={() =>
												setForm((s) => ({ ...s, companyLogo: "" }))
											}
										/>
									</div>
								) : (
									<div className="flex flex-col items-center gap-2 text-gray-500">
										<ImageIcon className="h-10 w-10" />
										<p className="text-sm">No logo uploaded</p>
									</div>
								)}
								<div className="mt-3 flex items-center gap-2">
									<label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
										<UploadCloud className="h-4 w-4" />
										<span>{logoUploading ? "Uploading..." : "Upload"}</span>
										<input
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleLogoChange}
											disabled={logoUploading}
										/>
									</label>
									{form.companyLogo && (
										<Button
											type="button"
											variant="secondary"
											onClick={() =>
												setForm((s) => ({ ...s, companyLogo: "" }))
											}
										>
											Remove
										</Button>
									)}
								</div>
                                                        </div>
                                                </div>
                                        </div>

                                        <div className="border-t border-gray-200 pt-6">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                        <div>
                                                                <h3 className="text-lg font-semibold text-gray-900">
                                                                        Promotional banners
                                                                </h3>
                                                                <p className="text-sm text-gray-500">
                                                                        Upload up to 5 promotional banners to highlight offers on your
                                                                        portfolio page.
                                                                </p>
                                                        </div>
                                                        <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleAddBanner}
                                                                disabled={
                                                                        Array.isArray(form.promotionalBanners)
                                                                                ? form.promotionalBanners.length >= 5
                                                                                : false
                                                                }
                                                        >
                                                                <Plus className="mr-2 h-4 w-4" /> Add banner
                                                        </Button>
                                                </div>

                                                <div className="mt-4 space-y-4">
                                                        {Array.isArray(form.promotionalBanners) &&
                                                        form.promotionalBanners.length > 0 ? (
                                                                form.promotionalBanners.map((banner, index) => {
                                                                        const isUploading = bannerUploads[index];
                                                                        return (
                                                                                <div
                                                                                        key={`banner-${index}`}
                                                                                        className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                                                                                >
                                                                                        <div className="grid gap-4 md:grid-cols-[minmax(0,260px),1fr]">
                                                                                                <div className="relative">
                                                                                                        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-white">
                                                                                                                {banner.imageUrl ? (
                                                                                                                        <Image
                                                                                                                                src={banner.imageUrl}
                                                                                                                                alt={
                                                                                                                                        banner.title ||
                                                                                                                                        `Promotional banner ${index + 1}`
                                                                                                                                }
                                                                                                                                fill
                                                                                                                                className="object-cover"
                                                                                                                                sizes="(max-width: 768px) 100vw, 260px"
                                                                                                                        />
                                                                                                                ) : (
                                                                                                                        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-500">
                                                                                                                                <ImageIcon className="h-8 w-8" />
                                                                                                                                <span className="text-xs">
                                                                                                                                        No image uploaded
                                                                                                                                </span>
                                                                                                                        </div>
                                                                                                                )}
                                                                                                                <div className="absolute inset-x-3 bottom-3 flex justify-center">
                                                                                                                        <label className="inline-flex items-center gap-2 rounded-md border border-white/60 bg-white/80 px-3 py-2 text-xs font-medium text-gray-700 shadow-sm backdrop-blur hover:bg-white">
                                                                                                                                <UploadCloud className="h-4 w-4" />
                                                                                                                                <span>
                                                                                                                                        {isUploading
                                                                                                                                                ? "Uploading..."
                                                                                                                                                : banner.imageUrl
                                                                                                                                                ? "Change image"
                                                                                                                                                : "Upload image"}
                                                                                                                                </span>
                                                                                                                                <input
                                                                                                                                        type="file"
                                                                                                                                        accept="image/*"
                                                                                                                                        className="hidden"
                                                                                                                                        onChange={handleBannerFileChange(index)}
                                                                                                                                        disabled={isUploading}
                                                                                                                                />
                                                                                                                        </label>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                                <div className="space-y-4">
                                                                                                        <div className="grid gap-2">
                                                                                                                <Label htmlFor={`banner-title-${index}`}>
                                                                                                                        Banner title (optional)
                                                                                                                </Label>
                                                                                                                <Input
                                                                                                                        id={`banner-title-${index}`}
                                                                                                                        value={banner.title || ""}
                                                                                                                        maxLength={80}
                                                                                                                        onChange={(event) =>
                                                                                                                                handleBannerFieldChange(
                                                                                                                                        index,
                                                                                                                                        "title",
                                                                                                                                        event.target.value
                                                                                                                                )
                                                                                                                        }
                                                                                                                        placeholder="Summer safety sale"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="grid gap-2">
                                                                                                                <Label htmlFor={`banner-description-${index}`}>
                                                                                                                        Banner description (optional)
                                                                                                                </Label>
                                                                                                                <Textarea
                                                                                                                        id={`banner-description-${index}`}
                                                                                                                        value={banner.description || ""}
                                                                                                                        maxLength={160}
                                                                                                                        onChange={(event) =>
                                                                                                                                handleBannerFieldChange(
                                                                                                                                        index,
                                                                                                                                        "description",
                                                                                                                                        event.target.value
                                                                                                                                )
                                                                                                                        }
                                                                                                                        placeholder="Highlight your latest offers or seasonal collections."
                                                                                                                        rows={3}
                                                                                                                />
                                                                                                                <p className="text-xs text-gray-500">
                                                                                                                        {160 - (banner.description?.length || 0)} characters remaining
                                                                                                                </p>
                                                                                                        </div>
                                                                                                        <div className="flex flex-wrap items-center gap-3">
                                                                                                                <Button
                                                                                                                        type="button"
                                                                                                                        variant="ghost"
                                                                                                                        className="text-red-600 hover:text-red-700"
                                                                                                                        onClick={() => handleRemoveBanner(index)}
                                                                                                                >
                                                                                                                        <Trash2 className="mr-2 h-4 w-4" /> Remove banner
                                                                                                                </Button>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        );
                                                                })
                                                        ) : (
                                                                <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
                                                                        No promotional banners added yet.
                                                                </div>
                                                        )}
                                                </div>
                                        </div>

                                        <div className="flex justify-end">
                                                <Button type="submit" disabled={loading}>
                                                        {loading ? (
                                                                <>
                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
								</>
							) : (
								"Save"
							)}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
