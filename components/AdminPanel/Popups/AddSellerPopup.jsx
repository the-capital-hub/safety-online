"use client";

import { useState } from "react";
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
import { useAdminSellerStore } from "@/store/adminSellerStore.js";

export function AddSellerPopup({ open, onOpenChange }) {
	const { addSeller, loading } = useAdminSellerStore();

        const [formData, setFormData] = useState({
                firstName: "",
                lastName: "",
                email: "",
                mobile: "",
                password: "",
                companyName: "",
                brandName: "",
                companyEmail: "",
                companyPhone: "",
                gstinNumber: "",
                brandDescription: "",
        });

        const handleChange = (field) => (event) => {
                setFormData((prev) => ({ ...prev, [field]: event.target.value }));
        };

        const handleSubmit = async (e) => {
                e.preventDefault();

                if (!e.currentTarget.checkValidity()) {

                  e.currentTarget.reportValidity();

                  return;

                }
                const payload = {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        mobile: formData.mobile,
                        password: formData.password,
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

                const success = await addSeller(payload);
                if (success) {
                        onOpenChange(false);
                        setFormData({
                                firstName: "",
                                lastName: "",
                                email: "",
                                mobile: "",
                                password: "",
                                companyName: "",
                                brandName: "",
                                companyEmail: "",
                                companyPhone: "",
                                gstinNumber: "",
                                brandDescription: "",
                        });
                }
        };

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-lg font-semibold">
									Add Seller
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Add new seller to your system
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div className="grid grid-cols-2 gap-4">
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

                                                <div>
                                                        <Label htmlFor="password">Password</Label>
                                                        <Input
                                                                id="password"
                                                                type="password"
                                                                placeholder="Password"
                                                                value={formData.password}
                                                                onChange={handleChange("password")}
                                                                className="mt-1"
                                                                required
                                                        />
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 pt-2 border-t">
                                                        <div className="grid grid-cols-1 gap-4">
                                                                <div>
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
                                                                                required
                                                                        />
                                                                </div>
                                                                <div>
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
                                                </div>

                                                <DialogFooter className="flex gap-3 mt-6">
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
								{loading ? "Adding..." : "Add Seller"}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
