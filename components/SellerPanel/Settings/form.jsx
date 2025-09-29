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
import { useSellerCompanyStore } from "@/store/sellerCompanyStore.js";

const EMPTY_FORM = {
        companyName: "",
        companyEmail: "",
        phone: "",
        gstinNumber: "",
        companyLogo: "",
};

export default function ShopForm() {
        const {
                company,
                loading,
                initialized,
                saving,
                uploadingLogo,
                fetchCompany,
                saveCompany,
                uploadLogo,
                setCompany,
        } = useSellerCompanyStore((state) => ({
                company: state.company,
                loading: state.loading,
                initialized: state.initialized,
                saving: state.saving,
                uploadingLogo: state.uploadingLogo,
                fetchCompany: state.fetchCompany,
                saveCompany: state.saveCompany,
                uploadLogo: state.uploadLogo,
                setCompany: state.setCompany,
        }));

        const [form, setForm] = useState(EMPTY_FORM);

        useEffect(() => {
                if (!initialized) {
                        fetchCompany().catch(() => undefined);
                }
        }, [initialized, fetchCompany]);

        useEffect(() => {
                if (company) {
                        setForm({
                                companyName: company.companyName || "",
                                companyEmail: company.companyEmail || "",
                                phone: company.phone || "",
                                gstinNumber: company.gstinNumber || "",
                                companyLogo: company.companyLogo || "",
                        });
                } else {
                        setForm(EMPTY_FORM);
                }
        }, [company]);

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

                const result = await uploadLogo(file);
                if (result?.success && result.url) {
                        setForm((s) => ({ ...s, companyLogo: result.url }));
                        toast.success("Logo uploaded");
                } else if (result?.message) {
                        toast.error(result.message);
                } else {
                        toast.error("Failed to upload logo");
                }
        };

        const handleSubmit = async (e) => {
                e.preventDefault();
                const parsed = companyBaseSchema.safeParse(form);
                if (!parsed.success) {
                        const first = parsed.error.errors[0];
                        toast.error(first.message);
                        return;
                }

                const existed = Boolean(company?._id);
                const result = await saveCompany(parsed.data);
                if (result.success) {
                        toast.success(
                                result.message || (existed ? "Company updated" : "Company created")
                        );
                } else {
                        toast.error(result.message || "Failed to save company");
                }
        };

        const handleLogoError = () => {
                setForm((s) => ({ ...s, companyLogo: "" }));
                setCompany((current) =>
                        current ? { ...current, companyLogo: "" } : current
                );
        };

        const isInitializing = loading && !initialized;
        const disableFields = isInitializing || saving;

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
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,220px]">
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
                                                                        disabled={disableFields}
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
                                                                        disabled={disableFields}
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
                                                                        disabled={disableFields}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2">
                                                                <Label htmlFor="gstinNumber">GSTIN (optional)</Label>
                                                                <Input
                                                                        id="gstinNumber"
                                                                        name="gstinNumber"
                                                                        value={form.gstinNumber}
                                                                        onChange={onChange}
                                                                        placeholder="22AAAAA0000A1Z5"
                                                                        disabled={disableFields}
                                                                />
                                                        </div>
                                                </div>

                                                <div className="space-y-3">
                                                        <Label>Company Logo</Label>
                                                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-3 text-center">
                                                                {form.companyLogo ? (
                                                                        <div className="w-full">
                                                                                <Image
                                                                                        src={form.companyLogo || "/placeholder.svg"}
                                                                                        alt="Company Logo"
                                                                                        width={320}
                                                                                        height={160}
                                                                                        className="mx-auto h-28 w-auto object-contain"
                                                                                        onError={handleLogoError}
                                                                                />
                                                                        </div>
                                                                ) : (
                                                                        <div className="flex flex-col items-center gap-2 text-gray-500">
                                                                                <ImageIcon className="h-10 w-10" />
                                                                                <p className="text-sm">No logo uploaded</p>
                                                                        </div>
                                                                )}
                                                                <div className="mt-3 flex items-center gap-2">
                                                                        <label
                                                                                className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
                                                                                aria-disabled={uploadingLogo || disableFields}
                                                                        >
                                                                                <UploadCloud className="h-4 w-4" />
                                                                                <span>{uploadingLogo ? "Uploading..." : "Upload"}</span>
                                                                                <input
                                                                                        type="file"
                                                                                        accept="image/*"
                                                                                        className="hidden"
                                                                                        onChange={handleLogoChange}
                                                                                        disabled={uploadingLogo || disableFields}
                                                                                />
                                                                        </label>
                                                                        {form.companyLogo && (
                                                                                <Button
                                                                                        type="button"
                                                                                        variant="secondary"
                                                                                        onClick={handleLogoError}
                                                                                        disabled={disableFields || uploadingLogo}
                                                                                >
                                                                                        Remove
                                                                                </Button>
                                                                        )}
                                                                </div>
                                                        </div>
                                                </div>
                                        </div>

                                        <div className="flex justify-end">
                                                <Button type="submit" disabled={disableFields}>
                                                        {saving ? (
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
