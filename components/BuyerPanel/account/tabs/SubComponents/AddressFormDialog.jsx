"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { addressSchema } from "@/zodSchema/addressSchema.js";

const DEFAULT_ADDRESS = {
        tag: "home",
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
        isDefault: false,
};

export default function AddressFormDialog({ trigger, initial, onSave }) {
        const [open, setOpen] = useState(false);
        const [form, setForm] = useState(() => ({ ...DEFAULT_ADDRESS }));
        const [errors, setErrors] = useState({});
        const [submitting, setSubmitting] = useState(false);

        useEffect(() => {
                if (initial) {
                        setForm({ ...DEFAULT_ADDRESS, ...initial });
                } else {
                        setForm({ ...DEFAULT_ADDRESS });
                }
                setErrors({});
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [initial, open]);

	function set(k, v) {
		setForm((s) => ({ ...s, [k]: v }));
		// Clear error when user starts typing
		if (errors[k]) {
			setErrors((prev) => ({ ...prev, [k]: "" }));
		}
	}

        async function submit() {
                const result = addressSchema.safeParse(form);

                if (!result.success) {
                        // Collect errors in { fieldName: message } format
			const fieldErrors = {};
			result.error.errors.forEach((err) => {
				fieldErrors[err.path[0]] = err.message;
			});
			setErrors(fieldErrors);
			return;
		}

                try {
                        setSubmitting(true);
                        const resultData = result.data;
                        const saveResult = await onSave?.(resultData);

                        if (saveResult === false) {
                                return;
                        }

                        setOpen(false);

                        if (!initial) {
                                setForm({ ...DEFAULT_ADDRESS });
                        }
                } catch (error) {
                        console.error("Failed to submit address form:", error);
                } finally {
                        setSubmitting(false);
                }
        }

        function cancel() {
                setOpen(false);
                setErrors({});
                // Reset form to initial state
                if (initial) {
                        setForm({ ...DEFAULT_ADDRESS, ...initial });
                } else {
                        setForm({ ...DEFAULT_ADDRESS });
                }
        }

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{initial ? "Edit Address" : "Add New Address"}
					</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-1 gap-4">
					{/* Tag and Name */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label htmlFor="tag">Address Tag</Label>
							<Select
								value={form.tag}
								onValueChange={(value) => set("tag", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="home">Home</SelectItem>
									<SelectItem value="office">Office</SelectItem>
									<SelectItem value="other">Other</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="name">Contact Name *</Label>
							<Input
								id="name"
								value={form.name}
								onChange={(e) => set("name", e.target.value)}
								className={errors.name ? "border-red-500" : ""}
								placeholder="Full name"
							/>
							{errors.name && (
								<p className="text-xs text-red-500">{errors.name}</p>
							)}
						</div>
					</div>

					{/* Street Address */}
					<div className="space-y-2">
						<Label htmlFor="street">Street Address *</Label>
						<Input
							id="street"
							value={form.street}
							onChange={(e) => set("street", e.target.value)}
							className={errors.street ? "border-red-500" : ""}
							placeholder="House number, street name, area"
						/>
						{errors.street && (
							<p className="text-xs text-red-500">{errors.street}</p>
						)}
					</div>

					{/* City and State */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label htmlFor="city">City *</Label>
							<Input
								id="city"
								value={form.city}
								onChange={(e) => set("city", e.target.value)}
								className={errors.city ? "border-red-500" : ""}
								placeholder="City name"
							/>
							{errors.city && (
								<p className="text-xs text-red-500">{errors.city}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="state">State *</Label>
							<Input
								id="state"
								value={form.state}
								onChange={(e) => set("state", e.target.value)}
								className={errors.state ? "border-red-500" : ""}
								placeholder="State name"
							/>
							{errors.state && (
								<p className="text-xs text-red-500">{errors.state}</p>
							)}
						</div>
					</div>

					{/* ZIP Code and Country */}
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label htmlFor="zipCode">ZIP Code *</Label>
							<Input
								id="zipCode"
								value={form.zipCode}
								onChange={(e) => set("zipCode", e.target.value)}
								className={errors.zipCode ? "border-red-500" : ""}
								placeholder="123456"
								maxLength={6}
							/>
							{errors.zipCode && (
								<p className="text-xs text-red-500">{errors.zipCode}</p>
							)}
						</div>
						<div className="space-y-2">
							<Label htmlFor="country">Country</Label>
							<Input
								id="country"
								value={form.country}
								onChange={(e) => set("country", e.target.value)}
								placeholder="Country name"
							/>
						</div>
					</div>

					{/* Default Address Checkbox */}
					<div className="flex items-center space-x-2">
                                                <Checkbox
                                                        id="isDefault"
                                                        checked={form.isDefault}
                                                        onCheckedChange={(checked) => set("isDefault", Boolean(checked))}
                                                />
						<Label htmlFor="isDefault" className="text-sm font-normal">
							Set as default address
						</Label>
					</div>

					<p className="text-xs text-muted-foreground">* Required fields</p>
				</div>
                                <DialogFooter className="gap-2">
                                        <Button variant="outline" onClick={cancel} disabled={submitting}>
                                                Cancel
                                        </Button>
                                        <Button onClick={submit} disabled={submitting}>
                                                {submitting
                                                        ? "Saving..."
                                                        : initial
                                                        ? "Update Address"
                                                        : "Add Address"}
                                        </Button>
                                </DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
