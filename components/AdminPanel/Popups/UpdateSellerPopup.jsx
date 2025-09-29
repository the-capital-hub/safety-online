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
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
        SelectTrigger,
        SelectValue,
} from "@/components/ui/select";
import { useAdminSellerStore } from "@/store/adminSellerStore.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function UpdateSellerPopup({ open, onOpenChange, seller }) {
        const { updateSeller, loading } = useAdminSellerStore();

        const [formData, setFormData] = useState({
                firstName: "",
                lastName: "",
                email: "",
                mobile: "",
                status: "active",
                companyName: "",
                brandName: "",
                companyEmail: "",
                companyPhone: "",
                gstinNumber: "",
                brandDescription: "",
        });

        const [activeTab, setActiveTab] = useState("personal");
        const tabOrder = ["personal", "company", "status"];

        const handleChange = (field) => (event) => {
                setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        };

        useEffect(() => {
                if (seller) {
                        setFormData({
                                firstName: seller.firstName || "",
                                lastName: seller.lastName || "",
                                email: seller.email || "",
                                mobile: seller.mobile || "",
                                status: seller.status || "active",
                                companyName: seller.company?.companyName || "",
                                brandName:
                                        seller.company?.brandName || seller.company?.companyName || "",
                                companyEmail: seller.company?.companyEmail || "",
                                companyPhone: seller.company?.phone || "",
                                gstinNumber: seller.company?.gstinNumber || "",
                                brandDescription: seller.company?.brandDescription || "",
                        });
                }
        }, [seller]);

        useEffect(() => {
                if (open) {
                        setActiveTab("personal");
                }
        }, [open]);

        const handleSubmit = async (e) => {
                e.preventDefault();

                if (!e.currentTarget.checkValidity()) {
                        e.currentTarget.reportValidity();
                        return;
                }
                if (seller) {
                        const payload = {
                                firstName: formData.firstName,
                                lastName: formData.lastName,
                                email: formData.email,
                                mobile: formData.mobile,
                                status: formData.status,
                                company: {
                                        companyName: formData.companyName,
                                        brandName:
                                                formData.brandName || formData.companyName || undefined,
                                        companyEmail: formData.companyEmail,
                                        phone: formData.companyPhone,
                                        gstinNumber: formData.gstinNumber,
                                        brandDescription: formData.brandDescription,
                                },
                        };

                        const success = await updateSeller(seller._id, payload);
                        if (success) {
                                onOpenChange(false);
                        }
                }
        };

        const goToNextTab = () => {
                const currentIndex = tabOrder.indexOf(activeTab);
                if (currentIndex < tabOrder.length - 1) {
                        setActiveTab(tabOrder[currentIndex + 1]);
                }
        };

        const goToPreviousTab = () => {
                const currentIndex = tabOrder.indexOf(activeTab);
                if (currentIndex > 0) {
                        setActiveTab(tabOrder[currentIndex - 1]);
                }
        };

        return (
                <Dialog open={open} onOpenChange={onOpenChange}>
                        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                                <motion.div
                                        initial={{ scale: 0.95, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                >
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-lg font-semibold">
									Update Seller
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Update seller information
								</DialogDescription>
							</div>
                                                </div>
                                        </DialogHeader>

                                        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
                                                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                                                        <TabsList className="grid w-full grid-cols-3">
                                                                <TabsTrigger value="personal">Personal</TabsTrigger>
                                                                <TabsTrigger value="company">Company</TabsTrigger>
                                                                <TabsTrigger value="status">Status</TabsTrigger>
                                                        </TabsList>

                                                        <TabsContent value="personal" className="space-y-4">
                                                                <p className="text-sm text-muted-foreground">
                                                                        Verify and update the seller's personal contact details.
                                                                </p>
                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                        <div>
                                                                                <Label htmlFor="firstName">First Name</Label>
                                                                                <Input
                                                                                        id="firstName"
                                                                                        placeholder="First Name"
                                                                                        value={formData.firstName}
                                                                                        onChange={handleChange("firstName")}
                                                                                        className="mt-1"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <Label htmlFor="lastName">Last Name</Label>
                                                                                <Input
                                                                                        id="lastName"
                                                                                        placeholder="Last Name"
                                                                                        value={formData.lastName}
                                                                                        onChange={handleChange("lastName")}
                                                                                        className="mt-1"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                        <div>
                                                                                <Label htmlFor="email">Email</Label>
                                                                                <Input
                                                                                        id="email"
                                                                                        type="email"
                                                                                        placeholder="seller@example.com"
                                                                                        value={formData.email}
                                                                                        onChange={handleChange("email")}
                                                                                        className="mt-1"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <Label htmlFor="mobile">Mobile</Label>
                                                                                <Input
                                                                                        id="mobile"
                                                                                        placeholder="Phone Number"
                                                                                        value={formData.mobile}
                                                                                        onChange={handleChange("mobile")}
                                                                                        className="mt-1"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="flex justify-end">
                                                                        <Button type="button" onClick={goToNextTab}>
                                                                                Continue to Company Details
                                                                        </Button>
                                                                </div>
                                                        </TabsContent>

                                                        <TabsContent value="company" className="space-y-4">
                                                                <p className="text-sm text-muted-foreground">
                                                                        Update the brand and registered business information associated with this seller.
                                                                </p>
                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                        <div className="md:col-span-2">
                                                                                <Label htmlFor="companyName">Company Name</Label>
                                                                                <Input
                                                                                        id="companyName"
                                                                                        placeholder="Registered company name"
                                                                                        value={formData.companyName}
                                                                                        onChange={handleChange("companyName")}
                                                                                        className="mt-1"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <Label htmlFor="brandName">Brand / Store Name</Label>
                                                                                <Input
                                                                                        id="brandName"
                                                                                        placeholder="Public facing brand"
                                                                                        value={formData.brandName}
                                                                                        onChange={handleChange("brandName")}
                                                                                        className="mt-1"
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <Label htmlFor="companyEmail">Company Email</Label>
                                                                                <Input
                                                                                        id="companyEmail"
                                                                                        type="email"
                                                                                        placeholder="brand@company.com"
                                                                                        value={formData.companyEmail}
                                                                                        onChange={handleChange("companyEmail")}
                                                                                        className="mt-1"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <Label htmlFor="companyPhone">Company Phone</Label>
                                                                                <Input
                                                                                        id="companyPhone"
                                                                                        placeholder="Company contact number"
                                                                                        value={formData.companyPhone}
                                                                                        onChange={handleChange("companyPhone")}
                                                                                        className="mt-1"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div>
                                                                                <Label htmlFor="gstinNumber">GSTIN</Label>
                                                                                <Input
                                                                                        id="gstinNumber"
                                                                                        placeholder="22AAAAA0000A1Z5"
                                                                                        value={formData.gstinNumber}
                                                                                        onChange={handleChange("gstinNumber")}
                                                                                        className="mt-1"
                                                                                />
                                                                        </div>
                                                                        <div className="md:col-span-2">
                                                                                <Label htmlFor="brandDescription">Brand Description</Label>
                                                                                <Textarea
                                                                                        id="brandDescription"
                                                                                        placeholder="Short description about the brand"
                                                                                        value={formData.brandDescription}
                                                                                        onChange={handleChange("brandDescription")}
                                                                                        className="mt-1"
                                                                                        rows={3}
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="flex flex-col gap-2 justify-between sm:flex-row">
                                                                        <Button type="button" variant="outline" onClick={goToPreviousTab}>
                                                                                Back to Personal Details
                                                                        </Button>
                                                                        <Button type="button" onClick={goToNextTab}>
                                                                                Continue to Status
                                                                        </Button>
                                                                </div>
                                                        </TabsContent>

                                                        <TabsContent value="status" className="space-y-4">
                                                                <p className="text-sm text-muted-foreground">
                                                                        Review the seller's account status before saving your changes.
                                                                </p>
                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                        <div>
                                                                                <Label htmlFor="status">Status</Label>
                                                                                <Select
                                                                                        value={formData.status}
                                                                                        onValueChange={(value) =>
                                                                                                setFormData({ ...formData, status: value })
                                                                                        }
                                                                                >
                                                                                        <SelectTrigger className="mt-1">
                                                                                                <SelectValue placeholder="Select status" />
                                                                                        </SelectTrigger>
                                                                                        <SelectContent>
                                                                                                <SelectItem value="active">Active</SelectItem>
                                                                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                                                                <SelectItem value="suspended">Suspended</SelectItem>
                                                                                        </SelectContent>
                                                                                </Select>
                                                                        </div>
                                                                        <div className="rounded-lg border bg-muted/30 p-4">
                                                                                <p className="text-sm font-medium text-muted-foreground">
                                                                                        Quick summary
                                                                                </p>
                                                                                <ul className="mt-2 space-y-1 text-sm">
                                                                                        <li>
                                                                                                <span className="font-semibold">Seller:</span> {formData.firstName} {formData.lastName}
                                                                                        </li>
                                                                                        <li>
                                                                                                <span className="font-semibold">Email:</span> {formData.email}
                                                                                        </li>
                                                                                        <li>
                                                                                                <span className="font-semibold">Company:</span> {formData.companyName || "—"}
                                                                                        </li>
                                                                                        <li>
                                                                                                <span className="font-semibold">Brand:</span> {formData.brandName || "—"}
                                                                                        </li>
                                                                                </ul>
                                                                        </div>
                                                                </div>
                                                                <div className="flex justify-start">
                                                                        <Button type="button" variant="outline" onClick={goToPreviousTab}>
                                                                                Back to Company Details
                                                                        </Button>
                                                                </div>
                                                        </TabsContent>
                                                </Tabs>

                                                <DialogFooter className="flex flex-col gap-3 sm:flex-row">
                                                        <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() => onOpenChange(false)}
                                                                className="flex-1"
                                                                disabled={loading}
                                                        >
                                                                Cancel
                                                        </Button>
                                                        <Button
                                                                type="submit"
                                                                className="flex-1 bg-orange-500 hover:bg-orange-600"
                                                                disabled={loading}
                                                        >
                                                                {loading ? "Updating..." : "Update Seller"}
                                                        </Button>
                                                </DialogFooter>
                                        </form>
                                </motion.div>
                        </DialogContent>
                </Dialog>
        );
}
