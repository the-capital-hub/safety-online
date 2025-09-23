"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";

export function ProfileEditPopup({ open, onOpenChange }) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		contactNumber: "",
		role: "",
		profilePicture: null,
	});

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!e.currentTarget.checkValidity()) {

		  e.currentTarget.reportValidity();

		  return;

		}
		console.log("Updating profile:", formData);
		onOpenChange(false);
	};

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData({ ...formData, profilePicture: file });
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
									Edit Profile
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Profile Picture
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						{/* Profile Picture Upload */}
						<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
							<Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
							<p className="text-sm text-gray-600 mb-2">
								Drag your images here
							</p>
							<input
								type="file"
								accept="image/*"
								onChange={handleFileUpload}
								className="hidden"
								id="profile-upload"
							/>
							<label htmlFor="profile-upload">
								<Button
									type="button"
									variant="outline"
									className="cursor-pointer bg-transparent"
								>
									Browse Files
								</Button>
							</label>
						</div>

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
							/>
						</div>

						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="contact">Contact Number</Label>
							<Input
								id="contact"
								placeholder="Contact Number"
								value={formData.contactNumber}
								onChange={(e) =>
									setFormData({ ...formData, contactNumber: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label>Your Role</Label>
							<Select
								value={formData.role}
								onValueChange={(value) =>
									setFormData({ ...formData, role: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Your Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="manager">Manager</SelectItem>
									<SelectItem value="staff">Staff</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="email2">Email</Label>
							<Input
								id="email2"
								type="email"
								placeholder="Email"
								className="mt-1"
							/>
						</div>

						<Button
							type="submit"
							className="w-full bg-green-600 hover:bg-green-700"
						>
							Update
						</Button>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
