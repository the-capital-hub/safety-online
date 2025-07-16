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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

export function UpdateAttributePopup({ open, onOpenChange, attribute }) {
	const [formData, setFormData] = useState({
		name: "",
		displayName: "",
		option: "",
		published: true,
	});

	useEffect(() => {
		if (attribute) {
			setFormData({
				name: attribute.name || "",
				displayName: attribute.displayName || "",
				option: attribute.option || "",
				published: attribute.published || false,
			});
		}
	}, [attribute]);

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Updating attribute:", formData);
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
									Update Attribute
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Update your attribute and necessary information from here
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<Label htmlFor="name">Name</Label>
							<Input
								id="name"
								placeholder="Attribute Name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="display-name">Display Name</Label>
							<Input
								id="display-name"
								placeholder="Display Name"
								value={formData.displayName}
								onChange={(e) =>
									setFormData({ ...formData, displayName: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label>Option</Label>
							<Select
								value={formData.option}
								onValueChange={(value) =>
									setFormData({ ...formData, option: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Select Option Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="dropdown">Dropdown</SelectItem>
									<SelectItem value="checkbox">Checkbox</SelectItem>
									<SelectItem value="radio">Radio Button</SelectItem>
									<SelectItem value="input">Input</SelectItem>
								</SelectContent>
							</Select>
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
								Update Attribute
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
