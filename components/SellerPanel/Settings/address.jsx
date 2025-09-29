"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Save, X, Loader2 } from "lucide-react";
import {
        Card,
        CardHeader,
        CardTitle,
        CardDescription,
        CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addressSchema } from "@/zodSchema/companyScema.js";
import { useSellerCompanyStore } from "@/store/sellerCompanyStore.js";

const EMPTY_DRAFT = {
        tagName: "",
        building: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        country: "",
};

export default function CompanyAddresses() {
        const { company, loading, initialized, addressesSaving } = useSellerCompanyStore(
                (state) => ({
                        company: state.company,
                        loading: state.loading,
                        initialized: state.initialized,
                        addressesSaving: state.addressesSaving,
                })
        );
        const fetchCompany = useSellerCompanyStore((state) => state.fetchCompany);
        const updateAddresses = useSellerCompanyStore((state) => state.updateAddresses);

        const [addresses, setAddresses] = useState([]);
        const [editingIndex, setEditingIndex] = useState(-1);
        const [draft, setDraft] = useState(EMPTY_DRAFT);

        useEffect(() => {
                if (!initialized && !loading) {
                        fetchCompany().catch(() => undefined);
                }
        }, [initialized, loading, fetchCompany]);

        useEffect(() => {
                setAddresses(company?.companyAddress || []);
        }, [company]);

        const resetDraft = () => {
                setDraft(EMPTY_DRAFT);
        };

        const startAdd = () => {
                if (!company?._id) {
                        toast.error("Create your company profile before adding addresses.");
                        return;
                }
                resetDraft();
                setEditingIndex(addresses.length);
        };

        const startEdit = (index) => {
                if (!company?._id) {
                        toast.error("Create your company profile before editing addresses.");
                        return;
                }
                setDraft({ ...addresses[index] });
                setEditingIndex(index);
        };

        const cancelEdit = () => {
                resetDraft();
                setEditingIndex(-1);
        };

        const removeAddress = async (index) => {
                if (!company?._id) {
                        toast.error("Create your company profile before managing addresses.");
                        return;
                }
                const next = addresses.filter((_, idx) => idx !== index);
                const result = await updateAddresses(next);
                if (result.success) {
                        setAddresses(next);
                        toast.success("Address removed");
                } else {
                        toast.error(result.message || "Failed to remove address");
                }
        };

        const saveDraft = async () => {
                if (!company?._id) {
                        toast.error("Create your company profile before adding addresses.");
                        return;
                }
                const parsed = addressSchema.safeParse(draft);
                if (!parsed.success) {
                        toast.error(parsed.error.errors[0].message);
                        return;
                }
                const next = [...addresses];
                next[editingIndex] = parsed.data;
                const result = await updateAddresses(next);
                if (result.success) {
                        setAddresses(next);
                        toast.success(
                                editingIndex >= addresses.length ? "Address added" : "Address updated"
                        );
                        cancelEdit();
                } else {
                        toast.error(result.message || "Failed to save address");
                }
        };

        const isInitializing = loading && !initialized;

        if (isInitializing) {
                return (
                        <Card className="border border-gray-200">
                                <CardHeader>
                                        <CardTitle>Company Addresses</CardTitle>
                                        <CardDescription>Loading addresses…</CardDescription>
                                </CardHeader>
                        </Card>
                );
        }

        return (
                <Card className="border border-gray-200">
                        <CardHeader className="flex-row items-center justify-between">
                                <div>
                                        <CardTitle>Company Addresses</CardTitle>
                                        <CardDescription>
                                                Add or update your company addresses
                                        </CardDescription>
                                </div>
                                <Button onClick={startAdd} variant="secondary" size="sm" disabled={addressesSaving}>
                                        <Plus className="mr-1 h-4 w-4" /> Add address
                                </Button>
                        </CardHeader>
                        <CardContent className="space-y-5">
                                {editingIndex !== -1 && (
                                        <div className="grid gap-3 rounded-lg border p-4">
                                                {[
                                                        { label: "Tag", name: "tagName", placeholder: "Head Office" },
                                                        {
                                                                label: "Building",
                                                                name: "building",
                                                                placeholder: "Building / Suite",
                                                        },
                                                        { label: "Street", name: "street", placeholder: "Street" },
                                                        { label: "City", name: "city", placeholder: "City" },
                                                        { label: "State", name: "state", placeholder: "State" },
                                                        { label: "Pincode", name: "pincode", placeholder: "Pincode" },
                                                        { label: "Country", name: "country", placeholder: "Country" },
                                                ].map((field) => (
                                                        <div key={field.name} className="grid gap-1">
                                                                <Label htmlFor={field.name}>{field.label}</Label>
                                                                <Input
                                                                        id={field.name}
                                                                        value={draft[field.name] || ""}
                                                                        onChange={(e) =>
                                                                                setDraft((d) => ({ ...d, [field.name]: e.target.value }))
                                                                        }
                                                                        placeholder={field.placeholder}
                                                                        disabled={addressesSaving}
                                                                />
                                                        </div>
                                                ))}
                                                <div className="flex justify-end gap-2">
                                                        <Button variant="outline" onClick={cancelEdit} disabled={addressesSaving}>
                                                                <X className="mr-1 h-4 w-4" /> Cancel
                                                        </Button>
                                                        <Button onClick={saveDraft} disabled={addressesSaving}>
                                                                {addressesSaving ? (
                                                                        <>
                                                                                <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Save
                                                                        </>
                                                                ) : (
                                                                        <>
                                                                                <Save className="mr-1 h-4 w-4" /> Save
                                                                        </>
                                                                )}
                                                        </Button>
                                                </div>
                                        </div>
                                )}

                                {addresses.length === 0 ? (
                                        <p className="text-sm text-gray-500">No addresses added yet.</p>
                                ) : (
                                        <div className="grid gap-3">
                                                {addresses.map((addr, idx) => (
                                                        <div
                                                                key={`${addr.tagName}-${idx}`}
                                                                className="flex items-start justify-between rounded-lg border p-4"
                                                        >
                                                                <div className="text-sm">
                                                                        <p className="font-medium text-gray-900">{addr.tagName}</p>
                                                                        <p className="text-gray-700">
                                                                                {addr.building}, {addr.street}
                                                                        </p>
                                                                        <p className="text-gray-700">
                                                                                {addr.city}, {addr.state} {addr.pincode}
                                                                        </p>
                                                                        <p className="text-gray-700">{addr.country}</p>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                        <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => startEdit(idx)}
                                                                                aria-label="Edit"
                                                                                disabled={addressesSaving}
                                                                        >
                                                                                <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                onClick={() => removeAddress(idx)}
                                                                                aria-label="Delete"
                                                                                disabled={addressesSaving}
                                                                        >
                                                                                <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                </div>
                                                        </div>
                                                ))}
                                        </div>
                                )}
                        </CardContent>
                </Card>
        );
}
