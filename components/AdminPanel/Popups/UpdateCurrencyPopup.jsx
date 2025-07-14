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
import { X } from "lucide-react";

export function UpdateCurrencyPopup({ open, onOpenChange, currency }) {
	const [formData, setFormData] = useState({
		name: "",
		symbol: "",
		published: true,
	});

	useEffect(() => {
		if (currency) {
			setFormData({
				name: currency.name || "",
				symbol: currency.symbol || "",
				published: currency.published || false,
			});
		}
	}, [currency]);

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Updating currency:", formData);
		onOpenChange(false);
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
									Update Currency
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Update your Currency and necessary information from here
								</DialogDescription>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onOpenChange(false)}
							>
								<X className="w-4 h-4" />
							</Button>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								placeholder="Name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="symbol">Symbol</Label>
							<Input
								id="symbol"
								placeholder="Symbol"
								value={formData.symbol}
								onChange={(e) =>
									setFormData({ ...formData, symbol: e.target.value })
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
								Update Currency
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
