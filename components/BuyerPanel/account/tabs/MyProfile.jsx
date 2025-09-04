"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import {
	useLoggedInUser,
	useIsAuthenticated,
	useAuthStore,
} from "@/store/authStore.js";
import ImageUploader from "@/components/BuyerPanel/account/tabs/SubComponents/ImageUploader.jsx";
import AddressFormDialog from "@/components/BuyerPanel/account/tabs/SubComponents/AddressFormDialog.jsx";

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * 0.1,
			duration: 0.5,
		},
	}),
};

export function MyProfile() {
	const isAuthed = useIsAuthenticated();
	const user = useLoggedInUser();
	const setUser = useAuthStore((s) => s.setUser);

	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		mobile: "",
		profilePic: "",
	});

	const [passwordForm, setPasswordForm] = useState({
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [addresses, setAddresses] = useState([]);
	const [showPasswords, setShowPasswords] = useState({
		old: false,
		new: false,
		confirm: false,
	});

	const [loading, setLoading] = useState({
		profile: false,
		password: false,
		addresses: false,
	});

	useEffect(() => {
		if (user) {
			setForm({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				email: user.email || "",
				mobile: user.mobile || "",
				profilePic: user.profilePic || "",
			});
			loadAddresses();
		}
	}, [user]);

	function setField(k, v) {
		setForm((s) => ({ ...s, [k]: v }));
	}

	function setPasswordField(k, v) {
		setPasswordForm((s) => ({ ...s, [k]: v }));
	}

	async function loadAddresses() {
		if (!isAuthed || !user?._id) return;
		try {
			const res = await fetch(`/api/profile/addresses?userId=${user._id}`);
			if (res.ok) {
				const data = await res.json();
				setAddresses(data.addresses || []);
			}
		} catch (error) {
			console.error("Failed to load addresses:", error);
		}
	}

	async function saveProfile() {
		if (!isAuthed || !user?._id) return;
		setLoading((prev) => ({ ...prev, profile: true }));

		try {
			const res = await fetch("/api/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: user._id,
					...form,
				}),
			});

			if (res.ok) {
				setUser({ ...user, ...form });
				toast.success("Profile updated successfully!");
			} else {
				const error = await res.json();
				toast.error(error.message || "Failed to update profile");
			}
		} catch (error) {
			console.error("Failed to update profile:", error);
			toast.error("Failed to update profile");
		} finally {
			setLoading((prev) => ({ ...prev, profile: false }));
		}
	}

	async function changePassword() {
		if (!isAuthed || !user?._id) return;

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error("New passwords don't match");
			return;
		}

		if (passwordForm.newPassword.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		setLoading((prev) => ({ ...prev, password: true }));

		try {
			const res = await fetch("/api/profile/password", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					oldPassword: passwordForm.oldPassword,
					newPassword: passwordForm.newPassword,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				toast.success("Password updated successfully!");
				setPasswordForm({
					oldPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
			} else {
				toast.error(data.message || "Failed to update password");
			}
		} catch (error) {
			console.error("Failed to update password:", error);
			toast.error("Failed to update password");
		} finally {
			setLoading((prev) => ({ ...prev, password: false }));
		}
	}

	async function saveAddresses() {
		if (!isAuthed || !user?._id) return;
		setLoading((prev) => ({ ...prev, addresses: true }));

		try {
			const res = await fetch("/api/profile/addresses", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					addresses,
				}),
			});

			if (res.ok) {
				toast.success("Addresses updated successfully!");
			} else {
				const error = await res.json();
				toast.error(error.message || "Failed to update addresses");
			}
		} catch (error) {
			console.error("Failed to update addresses:", error);
			toast.error("Failed to update addresses");
		} finally {
			setLoading((prev) => ({ ...prev, addresses: false }));
		}
	}

	async function deleteAddress(addressId) {
		if (!isAuthed || !user?._id) return;

		try {
			const res = await fetch(
				`/api/profile/addresses?userId=${user._id}&addressId=${addressId}`,
				{
					method: "DELETE",
				}
			);

			if (res.ok) {
				setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
				toast.success("Address deleted successfully!");
			} else {
				const error = await res.json();
				toast.error(error.message || "Failed to delete address");
			}
		} catch (error) {
			console.error("Failed to delete address:", error);
			toast.error("Failed to delete address");
		}
	}

	if (!isAuthed) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>My Profile</CardTitle>
					<CardDescription>
						You must be signed in to manage your profile.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-3 rounded-lg border p-4">
						<LockKeyhole className="h-5 w-5 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							Please sign in to edit your personal information, addresses, and
							password.
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			{/* Personal Information */}
			<motion.div
				custom={0}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
						<CardDescription>
							Update your personal details and information
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<ImageUploader
							value={form.profilePic}
							onChange={(url) => setField("profilePic", url)}
						/>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									value={form.firstName}
									onChange={(e) => setField("firstName", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									value={form.lastName}
									onChange={(e) => setField("lastName", e.target.value)}
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									value={form.email}
									onChange={(e) => setField("email", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="mobile">Mobile</Label>
								<Input
									id="mobile"
									value={form.mobile}
									onChange={(e) => setField("mobile", e.target.value)}
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button onClick={saveProfile} disabled={loading.profile}>
								{loading.profile ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Password Change */}
			<motion.div
				custom={1}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Change Password</CardTitle>
						<CardDescription>
							Update your account password for security
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="oldPassword">Current Password</Label>
							<div className="relative">
								<Input
									id="oldPassword"
									type={showPasswords.old ? "text" : "password"}
									value={passwordForm.oldPassword}
									onChange={(e) =>
										setPasswordField("oldPassword", e.target.value)
									}
									placeholder="Enter your current password"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() =>
										setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
									}
								>
									{showPasswords.old ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="newPassword">New Password</Label>
							<div className="relative">
								<Input
									id="newPassword"
									type={showPasswords.new ? "text" : "password"}
									value={passwordForm.newPassword}
									onChange={(e) =>
										setPasswordField("newPassword", e.target.value)
									}
									placeholder="Enter your new password"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() =>
										setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
									}
								>
									{showPasswords.new ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Confirm New Password</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showPasswords.confirm ? "text" : "password"}
									value={passwordForm.confirmPassword}
									onChange={(e) =>
										setPasswordField("confirmPassword", e.target.value)
									}
									placeholder="Confirm your new password"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3"
									onClick={() =>
										setShowPasswords((prev) => ({
											...prev,
											confirm: !prev.confirm,
										}))
									}
								>
									{showPasswords.confirm ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
						</div>
						<div className="flex justify-end">
							<Button
								onClick={changePassword}
								disabled={
									loading.password ||
									!passwordForm.oldPassword ||
									!passwordForm.newPassword
								}
							>
								{loading.password ? "Updating..." : "Update Password"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Addresses */}
			<motion.div
				custom={2}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>Addresses</CardTitle>
							<CardDescription>
								Manage your shipping and billing addresses
							</CardDescription>
						</div>
						<AddressFormDialog
							trigger={
								<Button size="sm">
									<Plus className="h-4 w-4 mr-2" />
									Add Address
								</Button>
							}
							onSave={(addr) => {
								const newAddress = { ...addr, _id: crypto.randomUUID() };
								setAddresses((a) => [...a, newAddress]);
							}}
						/>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{addresses.length === 0 && (
								<div className="text-sm text-muted-foreground">
									No addresses added yet.
								</div>
							)}
							{addresses.map((addr, idx) => (
								<div key={addr._id || idx} className="border rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<div className="font-medium capitalize">
											{addr.tag} Address
											{addr.isDefault && (
												<span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
													Default
												</span>
											)}
										</div>
										<div className="flex gap-2">
											<AddressFormDialog
												initial={addr}
												trigger={
													<Button variant="ghost" size="sm">
														<Edit className="h-4 w-4" />
													</Button>
												}
												onSave={(updated) =>
													setAddresses((list) =>
														list.map((a) =>
															a._id === addr._id ? { ...a, ...updated } : a
														)
													)
												}
											/>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => deleteAddress(addr._id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
									<div className="text-sm text-muted-foreground">
										{addr.name}
										<br />
										{addr.street}
										<br />
										{addr.city}, {addr.state} {addr.zipCode}
										<br />
										{addr.country || "India"}
									</div>
								</div>
							))}
						</div>
						{addresses.length > 0 && (
							<div className="mt-4 flex justify-end">
								<Button onClick={saveAddresses} disabled={loading.addresses}>
									{loading.addresses ? "Saving..." : "Save Addresses"}
								</Button>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

export default MyProfile;
