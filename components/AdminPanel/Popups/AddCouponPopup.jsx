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
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";

export function AddCouponPopup({ open, onOpenChange }) {
	const [formData, setFormData] = useState({
		campaignName: "",
		code: "",
		discount: "",
		startDate: "",
		endDate: "",
		published: true,
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Adding coupon:", formData);
		onOpenChange(false);
		setFormData({
			campaignName: "",
			code: "",
			discount: "",
			startDate: "",
			endDate: "",
			published: true,
		});
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
									Add Coupon
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Add your coupon and necessary information from here
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<Label htmlFor="campaign-name">Campaign Name</Label>
							<Input
								id="campaign-name"
								placeholder="Campaign Name"
								value={formData.campaignName}
								onChange={(e) =>
									setFormData({ ...formData, campaignName: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="code">Code</Label>
							<Input
								id="code"
								placeholder="Coupon Code"
								value={formData.code}
								onChange={(e) =>
									setFormData({ ...formData, code: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="discount">Discount</Label>
							<Input
								id="discount"
								placeholder="Discount (%)"
								value={formData.discount}
								onChange={(e) =>
									setFormData({ ...formData, discount: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="start-date">Start Date</Label>
							<Input
								id="start-date"
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
							<Label htmlFor="end-date">End Date</Label>
							<Input
								id="end-date"
								type="date"
								value={formData.endDate}
								onChange={(e) =>
									setFormData({ ...formData, endDate: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div className="flex items-center justify-between">
							<Label>Published</Label>
							<Switch
								checked={formData.published}
								onCheckedChange={(checked) =>
									setFormData({ ...formData, published: checked })
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
								className="flex-1 bg-orange-500 hover:bg-orange-600"
							>
								Add Coupon
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
