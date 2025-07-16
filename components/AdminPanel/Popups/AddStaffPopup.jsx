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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";

export function AddStaffPopup({ open, onOpenChange }) {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		contactNumber: "",
		joiningDate: "",
		staffRole: "",
		routes: "",
		staffImage: null,
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Adding staff:", formData);
		onOpenChange(false);
		setFormData({
			name: "",
			email: "",
			password: "",
			contactNumber: "",
			joiningDate: "",
			staffRole: "",
			routes: "",
			staffImage: null,
		});
	};

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData({ ...formData, staffImage: file });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto hide-scrollbar">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-lg font-semibold">
									Add Staff
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Add your staff necessary information from here
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-4">
						<div>
							<Label>Staff Image</Label>
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
									id="staff-image-upload"
								/>
								<label htmlFor="staff-image-upload">
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
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								className="mt-1"
								required
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
								required
							/>
						</div>

						<div>
							<Label htmlFor="joining-date">Joining Date</Label>
							<Input
								id="joining-date"
								type="date"
								placeholder="dd-mm-yyyy"
								value={formData.joiningDate}
								onChange={(e) =>
									setFormData({ ...formData, joiningDate: e.target.value })
								}
								className="mt-1"
								required
							/>
						</div>

						<div>
							<Label>Staff Role</Label>
							<Select
								value={formData.staffRole}
								onValueChange={(value) =>
									setFormData({ ...formData, staffRole: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">Admin</SelectItem>
									<SelectItem value="manager">Manager</SelectItem>
									<SelectItem value="moderator">Moderator</SelectItem>
									<SelectItem value="user">User</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Select Routes to given Access</Label>
							<Select
								value={formData.routes}
								onValueChange={(value) =>
									setFormData({ ...formData, routes: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Routes</SelectItem>
									<SelectItem value="dashboard">Dashboard Only</SelectItem>
									<SelectItem value="orders">Orders Only</SelectItem>
									<SelectItem value="customers">Customers Only</SelectItem>
									<SelectItem value="products">Products Only</SelectItem>
								</SelectContent>
							</Select>
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
								Add Staff
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
