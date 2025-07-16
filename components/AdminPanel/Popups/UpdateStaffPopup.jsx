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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Upload, X } from "lucide-react";

export function UpdateStaffPopup({ open, onOpenChange, staffData }) {
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

	// Populate form when staffData changes
	useEffect(() => {
		if (staffData) {
			setFormData({
				name: staffData.name || "",
				email: staffData.email || "",
				password: "", // Keep password empty for security
				contactNumber: staffData.contact || "",
				joiningDate: staffData.joiningDate
					? formatDateForInput(staffData.joiningDate)
					: "",
				staffRole: staffData.role?.toLowerCase() || "",
				routes: getRoutesFromRole(staffData.role) || "",
				staffImage: null,
			});
		}
	}, [staffData]);

	// Helper function to format date from DD/MM/YYYY to YYYY-MM-DD
	const formatDateForInput = (dateString) => {
		if (!dateString) return "";
		const [day, month, year] = dateString.split("/");
		return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
	};

	// Helper function to get routes based on role (this is a placeholder logic)
	const getRoutesFromRole = (role) => {
		switch (role?.toLowerCase()) {
			case "admin":
				return "all";
			case "manager":
				return "dashboard";
			case "moderator":
				return "orders";
			case "user":
				return "customers";
			default:
				return "";
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Updating staff:", formData);
		onOpenChange(false);
	};

	const handleFileUpload = (e) => {
		const file = e.target.files[0];
		if (file) {
			setFormData({ ...formData, staffImage: file });
		}
	};

	const handleClose = () => {
		onOpenChange(false);
		// Reset form when closing
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
									Update Staff
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Update staff member information
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
									id="update-staff-image-upload"
								/>
								<label htmlFor="update-staff-image-upload">
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
							<Label htmlFor="update-name">Name</Label>
							<Input
								id="update-name"
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
							<Label htmlFor="update-email">Email</Label>
							<Input
								id="update-email"
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
							<Label htmlFor="update-password">Password</Label>
							<Input
								id="update-password"
								type="password"
								placeholder="Leave blank to keep current password"
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="update-contact">Contact Number</Label>
							<Input
								id="update-contact"
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
							<Label htmlFor="update-joining-date">Joining Date</Label>
							<Input
								id="update-joining-date"
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
								onClick={handleClose}
								className="flex-1"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="flex-1 bg-orange-500 hover:bg-orange-600"
							>
								Update Staff
							</Button>
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
