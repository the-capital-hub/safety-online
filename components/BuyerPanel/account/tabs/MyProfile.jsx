"use client";

import { useRouter } from "next/navigation";
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
	const router = useRouter();
	const user = useLoggedInUser();
	const setUser = useAuthStore((s) => s.setUser);

	useEffect(() => {
		if (!isAuthed) {
			const timer = setTimeout(() => {
				router.push("/login");
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [isAuthed, router]);

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
				const sanitizedAddresses = (data.addresses || []).map((addr) => ({
					...addr,
					_id: addr?._id?.toString ? addr._id.toString() : addr._id,
				}));
				setAddresses(sanitizedAddresses);
			}
		} catch (error) {
			console.error("Failed to load addresses:", error);
		}
	}

	// ✅ ADD: Client-side validation before saving profile
	function validateProfileForm() {
		if (!form.firstName?.trim()) {
			toast.error("First name is required");
			return false;
		}
		if (!form.lastName?.trim()) {
			toast.error("Last name is required");
			return false;
		}
		if (!form.email?.trim()) {
			toast.error("Email is required");
			return false;
		}
		// Email pattern validation
		const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
		if (!emailPattern.test(form.email)) {
			toast.error("Please enter a valid email address");
			return false;
		}
		if (!form.mobile?.trim()) {
			toast.error("Mobile number is required");
			return false;
		}
		// Indian phone validation
		const phonePattern = /^(\+91)?[6-9][0-9]{9}$/;
		const cleanMobile = form.mobile.replace(/\s+/g, "");
		if (!phonePattern.test(cleanMobile)) {
			toast.error("Please enter a valid 10-digit Indian mobile number");
			return false;
		}
		return true;
	}

	async function saveProfile() {
		if (!isAuthed || !user?._id) return;

		// ✅ ADD: Validate before submission
		if (!validateProfileForm()) {
			return;
		}

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

	// ✅ IMPROVED: Better password validation
	function validatePasswordForm() {
		if (!passwordForm.oldPassword?.trim()) {
			toast.error("Current password is required");
			return false;
		}
		if (!passwordForm.newPassword?.trim()) {
			toast.error("New password is required");
			return false;
		}
		if (!passwordForm.confirmPassword?.trim()) {
			toast.error("Please confirm your new password");
			return false;
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error("New passwords don't match");
			return false;
		}
		// Enhanced password validation
		if (passwordForm.newPassword.length < 8) {
			toast.error("Password must be at least 8 characters long");
			return false;
		}
		// Check for at least one letter and one number
		const hasLetter = /[A-Za-z]/.test(passwordForm.newPassword);
		const hasNumber = /[0-9]/.test(passwordForm.newPassword);
		if (!hasLetter || !hasNumber) {
			toast.error("Password must contain at least one letter and one number");
			return false;
		}
		return true;
	}

	async function changePassword() {
		if (!isAuthed || !user?._id) return;

		// ✅ IMPROVED: Use comprehensive validation
		if (!validatePasswordForm()) {
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
				toast.error(data.message || data.error || "Failed to update password");
			}
		} catch (error) {
			console.error("Failed to update password:", error);
			toast.error("Failed to update password");
		} finally {
			setLoading((prev) => ({ ...prev, password: false }));
		}
	}

	async function addAddress(address) {
		if (!isAuthed || !user?._id) return false;

		setLoading((prev) => ({ ...prev, addresses: true }));

		try {
			const res = await fetch("/api/profile/addresses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					address,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				toast.success("Address added successfully!");
				await loadAddresses();
				return true;
			}

			toast.error(data.message || data.error || "Failed to add address");
			return false;
		} catch (error) {
			console.error("Failed to add address:", error);
			toast.error("Failed to add address");
			return false;
		} finally {
			setLoading((prev) => ({ ...prev, addresses: false }));
		}
	}

	async function updateAddress(addressId, updatedAddress) {
		if (!isAuthed || !user?._id) return false;

		setLoading((prev) => ({ ...prev, addresses: true }));

		try {
			const updatedList = addresses.map((addr) => {
				if ((addr._id || "").toString() === addressId.toString()) {
					return { ...addr, ...updatedAddress };
				}

				if (updatedAddress.isDefault) {
					return { ...addr, isDefault: false };
				}

				return addr;
			});

			const res = await fetch("/api/profile/addresses", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: user._id,
					addresses: updatedList,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				const sanitizedAddresses = (data.addresses || updatedList).map(
					(addr) => ({
						...addr,
						_id: addr?._id?.toString ? addr._id.toString() : addr._id,
					})
				);
				setAddresses(sanitizedAddresses);
				toast.success("Address updated successfully!");
				return true;
			}

			toast.error(data.message || data.error || "Failed to update address");
			return false;
		} catch (error) {
			console.error("Failed to update address:", error);
			toast.error("Failed to update address");
			return false;
		} finally {
			setLoading((prev) => ({ ...prev, addresses: false }));
		}
	}

	async function deleteAddress(addressId) {
		if (!isAuthed || !user?._id) return;

		setLoading((prev) => ({ ...prev, addresses: true }));

		try {
			const res = await fetch(
				`/api/profile/addresses?userId=${user._id}&addressId=${addressId}`,
				{
					method: "DELETE",
				}
			);

			const data = res.ok ? null : await res.json();

			if (res.ok) {
				toast.success("Address deleted successfully!");
				await loadAddresses();
			} else {
				toast.error(data?.message || data?.error || "Failed to delete address");
			}
		} catch (error) {
			console.error("Failed to delete address:", error);
			toast.error("Failed to delete address");
		} finally {
			setLoading((prev) => ({ ...prev, addresses: false }));
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
								<Label htmlFor="firstName">
									First Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="firstName"
									name="firstName"
									validationKey="firstName"
									type="text"
									required
									value={form.firstName}
									onChange={(e) => setField("firstName", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">
									Last Name <span className="text-red-500">*</span>
								</Label>
								<Input
									id="lastName"
									name="lastName"
									validationKey="lastName"
									type="text"
									required
									value={form.lastName}
									onChange={(e) => setField("lastName", e.target.value)}
								/>
							</div>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="email">
									Email <span className="text-red-500">*</span>
								</Label>
								<Input
									id="email"
									name="email"
									validationKey="email"
									type="email"
									required
									value={form.email}
									onChange={(e) => setField("email", e.target.value)}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="mobile">
									Mobile <span className="text-red-500">*</span>
								</Label>
								<Input
									id="mobile"
									name="mobile"
									validationKey="phone"
									type="tel"
									required
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
							<Label htmlFor="oldPassword">
								Current Password <span className="text-red-500">*</span>
							</Label>
							<div className="relative">
								<Input
									id="oldPassword"
									name="oldPassword"
									validationKey="password"
									type={showPasswords.old ? "text" : "password"}
									required
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
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
									onClick={() =>
										setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
									}
									tabIndex={-1}
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
							<Label htmlFor="newPassword">
								New Password <span className="text-red-500">*</span>
							</Label>
							<div className="relative">
								<Input
									id="newPassword"
									name="newPassword"
									validationKey="password"
									type={showPasswords.new ? "text" : "password"}
									required
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
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
									onClick={() =>
										setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
									}
									tabIndex={-1}
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
							<Label htmlFor="confirmPassword">
								Confirm New Password <span className="text-red-500">*</span>
							</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									name="confirmPassword"
									validationKey="password"
									type={showPasswords.confirm ? "text" : "password"}
									required
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
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
									onClick={() =>
										setShowPasswords((prev) => ({
											...prev,
											confirm: !prev.confirm,
										}))
									}
									tabIndex={-1}
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
									!passwordForm.newPassword ||
									!passwordForm.confirmPassword
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
								Manage your saved shipping addresses
							</CardDescription>
						</div>
						<AddressFormDialog
							trigger={
								<Button size="sm" disabled={loading.addresses}>
									<Plus className="h-4 w-4 mr-2" />
									{loading.addresses ? "Processing..." : "Add Address"}
								</Button>
							}
							onSave={addAddress}
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
											{addr.tag} Address{" "}
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
													<Button
														variant="ghost"
														size="sm"
														disabled={loading.addresses}
													>
														<Edit className="h-4 w-4" />
													</Button>
												}
												onSave={(updated) =>
													updateAddress(
														addr._id?.toString ? addr._id.toString() : addr._id,
														updated
													)
												}
											/>
											<Button
												variant="ghost"
												size="sm"
												disabled={loading.addresses}
												onClick={() =>
													deleteAddress(
														addr._id?.toString ? addr._id.toString() : addr._id
													)
												}
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
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}

export default MyProfile;
