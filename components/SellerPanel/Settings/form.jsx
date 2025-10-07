"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Loader2, UploadCloud, ImageIcon } from "lucide-react";
import { companyBaseSchema } from "@/zodSchema/companyScema.js";

export default function ShopForm() {
	const [form, setForm] = useState({
		companyName: "",
		companyEmail: "",
		phone: "",
		gstinNumber: "",
		companyLogo: "",
	});
	const [loading, setLoading] = useState(false);
	const [logoUploading, setLogoUploading] = useState(false);
	const [hasCompany, setHasCompany] = useState(false);

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
						setForm({
							companyName: c.companyName || "",
							companyEmail: c.companyEmail || "",
							phone: c.phone || "",
							gstinNumber: c.gstinNumber || "",
							companyLogo: c.companyLogo || "",
						});
						setHasCompany(true);
					}
				} else {
					setHasCompany(false);
				}
			} catch {
				setHasCompany(false);
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
		// Client-side Zod validation
		const parsed = companyBaseSchema.safeParse(form);
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
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || "Failed to save company");
			setHasCompany(true);
			toast.success(hasCompany ? "Company updated" : "Company created");
		} catch (err) {
			toast.error(err.message || "Failed to save");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="border border-gray-200">
			<CardHeader>
				<CardTitle>Company Profile</CardTitle>
				<CardDescription>
					Basic company details. Manage addresses below.
				</CardDescription>
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
