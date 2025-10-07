"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Camera, Loader2, Save, Plus, Trash2 } from "lucide-react";
import {
	useSellerAuthStore,
	useIsSellerAuthenticated,
	useLoggedInSeller,
} from "@/store/sellerAuthStore";
import { toast } from "react-hot-toast";

export default function SellerSettings() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		mobile: "",
	});
	const [addresses, setAddresses] = useState([]);
	const [profilePic, setProfilePic] = useState(null);
	const [profilePicPreview, setProfilePicPreview] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const { updateProfile } = useSellerAuthStore();
	const isAuthenticated = useIsSellerAuthenticated();
	const seller = useLoggedInSeller();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/seller/login");
			return;
		}

		if (seller) {
			setFormData({
				firstName: seller.firstName || "",
				lastName: seller.lastName || "",
				email: seller.email || "",
				mobile: seller.mobile || "",
			});
			setAddresses(seller.addresses || []);
			setProfilePicPreview(seller.profilePic || "");
		}
	}, [isAuthenticated, seller, router]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const addAddress = () => {
		const newAddress = {
			tag: "home",
			name: "",
			street: "",
			city: "",
			state: "",
			zipCode: "",
			country: "India",
			isDefault: addresses.length === 0,
		};
		setAddresses([...addresses, newAddress]);
	};

	const updateAddress = (index, field, value) => {
		const updatedAddresses = addresses.map((addr, i) => {
			if (i === index) {
				// If setting as default, unset all others
				if (field === "isDefault" && value) {
					setAddresses((prev) =>
						prev.map((a, idx) => ({ ...a, isDefault: idx === index }))
					);
					return { ...addr, [field]: value };
				}
				return { ...addr, [field]: value };
			}
			return addr;
		});
		setAddresses(updatedAddresses);
	};

	const removeAddress = (index) => {
		const updatedAddresses = addresses.filter((_, i) => i !== index);
		// If we removed the default address, make the first one default
		if (addresses[index]?.isDefault && updatedAddresses.length > 0) {
			updatedAddresses[0].isDefault = true;
		}
		setAddresses(updatedAddresses);
	};

	const handleProfilePicChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setProfilePic(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setProfilePicPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!e.currentTarget.checkValidity()) {
			e.currentTarget.reportValidity();

			return;
		}
		setIsLoading(true);

		try {
			const formDataToSend = new FormData();

			// Append form fields
			Object.keys(formData).forEach((key) => {
				formDataToSend.append(key, formData[key]);
			});

			formDataToSend.append("addresses", JSON.stringify(addresses));

			// Append profile picture if selected
			if (profilePic) {
				formDataToSend.append("profilePic", profilePic);
			}

			const response = await fetch("/api/seller/profile/update", {
				method: "PUT",
				body: formDataToSend,
			});

			const data = await response.json();

			if (data.success) {
				// Update the store with new user data
				updateProfile(data.user);
				toast.success("Profile updated successfully");
			} else {
				toast.error(data.message || "Failed to update profile");
			}
		} catch (error) {
			console.error("Profile update error:", error);
			toast.error("Failed to update profile");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<div className="mb-6">
					<h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
					<p className="text-gray-600">
						Manage your seller profile and account preferences
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
						<CardDescription>
							Update your personal details and profile picture
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Profile Picture */}
							<div className="flex items-center space-x-6">
								<div className="relative">
									<Avatar className="w-24 h-24">
										<AvatarImage
											src={profilePicPreview || "/placeholder.svg"}
											alt="Profile"
										/>
										<AvatarFallback className="text-lg">
											{formData.firstName?.charAt(0)}
											{formData.lastName?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<label
										htmlFor="profilePic"
										className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 cursor-pointer transition-colors"
									>
										<Camera className="w-4 h-4" />
										<input
											id="profilePic"
											type="file"
											accept="image/*"
											onChange={handleProfilePicChange}
											className="hidden"
										/>
									</label>
								</div>
								<div>
									<h3 className="text-lg font-medium">Profile Picture</h3>
									<p className="text-sm text-gray-600">
										Click the camera icon to upload a new profile picture
									</p>
								</div>
							</div>

							{/* Personal Details */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										name="firstName"
										type="text"
										value={formData.firstName}
										onChange={handleInputChange}
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										name="lastName"
										type="text"
										value={formData.lastName}
										onChange={handleInputChange}
										required
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="mobile">Mobile Number</Label>
								<Input
									id="mobile"
									name="mobile"
									type="tel"
									value={formData.mobile}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<Label className="text-base font-medium">Addresses</Label>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={addAddress}
										className="flex items-center gap-2 bg-transparent"
									>
										<Plus className="w-4 h-4" />
										Add Address
									</Button>
								</div>

								{addresses.map((address, index) => (
									<Card key={index} className="p-4">
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-4">
													<Select
														value={address.tag}
														onValueChange={(value) =>
															updateAddress(index, "tag", value)
														}
													>
														<SelectTrigger className="w-32">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="home">Home</SelectItem>
															<SelectItem value="office">Office</SelectItem>
															<SelectItem value="other">Other</SelectItem>
														</SelectContent>
													</Select>
													<label className="flex items-center gap-2">
														<input
															type="checkbox"
															checked={address.isDefault}
															onChange={(e) =>
																updateAddress(
																	index,
																	"isDefault",
																	e.target.checked
																)
															}
														/>
														<span className="text-sm">Default</span>
													</label>
												</div>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => removeAddress(index)}
													className="text-red-600 hover:text-red-700"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<Input
													name="name"
													placeholder="Full Name"
													value={address.name}
													onChange={(e) =>
														updateAddress(index, "name", e.target.value)
													}
													required
												/>
												<Input
													name="street"
													placeholder="Street Address"
													value={address.street}
													onChange={(e) =>
														updateAddress(index, "street", e.target.value)
													}
													required
												/>
												<Input
													name="city"
													placeholder="City"
													value={address.city}
													onChange={(e) =>
														updateAddress(index, "city", e.target.value)
													}
													required
												/>
												<Input
													name="state"
													placeholder="State"
													value={address.state}
													onChange={(e) =>
														updateAddress(index, "state", e.target.value)
													}
													required
												/>
												<Input
													name="zipCode"
													placeholder="ZIP Code"
													value={address.zipCode}
													onChange={(e) =>
														updateAddress(index, "zipCode", e.target.value)
													}
													required
												/>
												<Input
													name="country"
													placeholder="Country"
													value={address.country}
													onChange={(e) =>
														updateAddress(index, "country", e.target.value)
													}
													required
												/>
											</div>
										</div>
									</Card>
								))}
							</div>

							<div className="flex justify-end">
								<Button
									type="submit"
									className="bg-orange-500 hover:bg-orange-600"
									disabled={isLoading}
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<Save className="mr-2 h-4 w-4" />
											Save Changes
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
