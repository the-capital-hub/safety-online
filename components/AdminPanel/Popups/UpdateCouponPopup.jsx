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
import { Switch } from "@/components/ui/switch";
import { Percent } from "lucide-react";
import { useAdminCouponStore } from "@/store/adminCouponStore.js";

export function UpdateCouponPopup({ open, onOpenChange, coupon }) {
	const { updateCoupon } = useAdminCouponStore();
	const [isSubmitting, setIsSubmitting] = useState(false);

        const [formData, setFormData] = useState({
                name: "",
                code: "",
                discount: "",
                startDate: "",
                endDate: "",
                published: true,
                recommended: false,
        });

	useEffect(() => {
		if (coupon) {
			setFormData({
				name: coupon.name || "",
				code: coupon.code || "",
				discount: coupon.discount?.toString() || "",
				startDate: coupon.startDate
					? new Date(coupon.startDate).toISOString().split("T")[0]
					: "",
                                endDate: coupon.endDate
                                        ? new Date(coupon.endDate).toISOString().split("T")[0]
                                        : "",
                                published: coupon.published !== undefined ? coupon.published : true,
                                recommended:
                                        coupon.recommended !== undefined ? coupon.recommended : false,
                        });
                }
        }, [coupon]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!coupon) return;

		setIsSubmitting(true);

                const updateData = {
                        ...formData,
                        discount: Number.parseFloat(formData.discount),
                };

		const success = await updateCoupon(coupon._id, updateData);
		if (success) {
			onOpenChange(false);
		}
		setIsSubmitting(false);
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
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white">
								<Percent className="w-5 h-5" />
							</div>
							<div>
								<DialogTitle className="text-lg font-semibold">
									Update Coupon
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Update coupon information and settings
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<Label htmlFor="name">Campaign Name *</Label>
							<Input
								id="name"
								placeholder="e.g., Summer Sale 2024"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="code">Coupon Code *</Label>
							<Input
								id="code"
								placeholder="SUMMER2024"
								value={formData.code}
								onChange={(e) =>
									setFormData({
										...formData,
										code: e.target.value.toUpperCase(),
									})
								}
								className="mt-1"
								required
							/>
							<p className="text-xs text-gray-500 mt-1">
								8-character alphanumeric code
							</p>
						</div>

						<div>
							<Label htmlFor="discount">Discount Percentage *</Label>
							<div className="relative mt-1">
								<Input
									id="discount"
									type="number"
									placeholder="20"
									min="1"
									max="100"
									value={formData.discount}
									onChange={(e) =>
										setFormData({ ...formData, discount: e.target.value })
									}
									className="pr-8"
									required
								/>
								<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
									%
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label htmlFor="startDate">Start Date *</Label>
								<Input
									id="startDate"
									type="date"
									value={formData.startDate}
									onChange={(e) =>
										setFormData({ ...formData, startDate: e.target.value })
									}
									className="mt-1"
									required
								/>
							</div>

							<div>
								<Label htmlFor="endDate">End Date *</Label>
								<Input
									id="endDate"
									type="date"
									value={formData.endDate}
									onChange={(e) =>
										setFormData({ ...formData, endDate: e.target.value })
									}
									className="mt-1"
									required
								/>
							</div>
						</div>

                                                <div className="flex items-center justify-between">
                                                        <div>
                                                                <Label>Publish Coupon</Label>
                                                                <p className="text-sm text-gray-500">
                                                                        Make this coupon available to customers
                                                                </p>
                                                        </div>
                                                        <Switch
                                                                checked={formData.published}
                                                                onCheckedChange={(checked) =>
                                                                        setFormData({ ...formData, published: checked })
                                                                }
                                                        />
                                                </div>

                                                <div className="flex items-center justify-between">
                                                        <div>
                                                                <Label>Recommend Coupon</Label>
                                                                <p className="text-sm text-gray-500">
                                                                        Highlight this coupon for shoppers
                                                                </p>
                                                        </div>
                                                        <Switch
                                                                checked={formData.recommended}
                                                                onCheckedChange={(checked) =>
                                                                        setFormData({ ...formData, recommended: checked })
                                                                }
                                                        />
                                                </div>

						<DialogFooter className="flex gap-3 mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
								className="flex-1 bg-orange-500 hover:bg-orange-600"
							>
								{isSubmitting ? "Updating..." : "Update Coupon"}
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
