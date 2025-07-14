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
import { Upload, X } from "lucide-react";

export function AddLanguagePopup({ open, onOpenChange }) {
	const [formData, setFormData] = useState({
		languageName: "",
		isoCode: "",
		flag: null,
		published: true,
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Adding language:", formData);
		onOpenChange(false);
		setFormData({
			languageName: "",
			isoCode: "",
			flag: null,
			published: true,
		});
	};

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData({ ...formData, flag: file });
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
									Add Language
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Add your Language necessary information from here
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
							<Label htmlFor="language-name">Language Name</Label>
							<Input
								id="language-name"
								placeholder="Language"
								value={formData.languageName}
								onChange={(e) =>
									setFormData({ ...formData, languageName: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label htmlFor="iso-code">Iso Code</Label>
							<Input
								id="iso-code"
								placeholder="Iso Code"
								value={formData.isoCode}
								onChange={(e) =>
									setFormData({ ...formData, isoCode: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label>Flag</Label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-1">
								<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
								<p className="text-sm text-gray-600 mb-2">
									Drag your images here
								</p>
								<input
									type="file"
									accept="image/*"
									onChange={handleFileUpload}
									className="hidden"
									id="flag-upload"
								/>
								<label htmlFor="flag-upload">
									<Button
										type="button"
										variant="outline"
										className="cursor-pointer bg-transparent"
									>
										Browse Files
									</Button>
								</label>
							</div>
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
								Add Language
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
