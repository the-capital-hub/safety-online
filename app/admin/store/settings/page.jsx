"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

export default function StoreSettingsPage() {
	const [showPasswords, setShowPasswords] = useState({
		stripeKey: false,
		stripeSecret: false,
		googleClientId: false,
		googleSecretKey: false,
		facebookId: false,
		facebookSecretKey: false,
	});

	const [settings, setSettings] = useState({
		cashOnDelivery: true,
		stripePayment: true,
		stripeKey: "",
		stripeSecret: "",
		razorPay: true,
		googleLogin: true,
		googleClientId: "",
		googleSecretKey: "",
		facebookId: "",
		facebookSecretKey: "",
	});

	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/admin/login");
			}, 3);
			
			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	// Show redirecting message if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	const handleToggle = (field, value) => {
		setSettings((prev) => ({ ...prev, [field]: value }));
	};

	const handleInputChange = (field, value) => {
		setSettings((prev) => ({ ...prev, [field]: value }));
	};

	const togglePasswordVisibility = (field) => {
		setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Updating store settings:", settings);
	};

	const PasswordField = ({ label, field, value, onChange }) => (
		<div>
			<Label htmlFor={field}>{label}</Label>
			<div className="relative mt-1">
				<Input
					id={field}
					type={showPasswords[field] ? "text" : "password"}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="pr-10"
				/>
				<button
					type="button"
					onClick={() => togglePasswordVisibility(field)}
					className="absolute inset-y-0 right-0 pr-3 flex items-center"
				>
					{showPasswords[field] ? (
						<EyeOff className="h-4 w-4 text-gray-400" />
					) : (
						<Eye className="h-4 w-4 text-gray-400" />
					)}
				</button>
			</div>
		</div>
	);

	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
			</motion.div>

			<form onSubmit={handleSubmit}>
				<Card>
					<CardHeader>
						<CardTitle>Payment & Integration Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Payment Settings */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="flex items-center justify-between">
								<Label>Enable cash on delivery</Label>
								<Switch
									checked={settings.cashOnDelivery}
									onCheckedChange={(checked) =>
										handleToggle("cashOnDelivery", checked)
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label>Enable Stripe Payment</Label>
								<Switch
									checked={settings.stripePayment}
									onCheckedChange={(checked) =>
										handleToggle("stripePayment", checked)
									}
								/>
							</div>
						</div>

						{/* Stripe Configuration */}
						<div className="space-y-4">
							<PasswordField
								label="Stripe Key"
								field="stripeKey"
								value={settings.stripeKey}
								onChange={(value) => handleInputChange("stripeKey", value)}
							/>

							<PasswordField
								label="Stripe Secret"
								field="stripeSecret"
								value={settings.stripeSecret}
								onChange={(value) => handleInputChange("stripeSecret", value)}
							/>
						</div>

						{/* Additional Payment Methods */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="flex items-center justify-between">
								<Label>Enable Razor pay</Label>
								<Switch
									checked={settings.razorPay}
									onCheckedChange={(checked) =>
										handleToggle("razorPay", checked)
									}
								/>
							</div>

							<div className="flex items-center justify-between">
								<Label>Enable google login</Label>
								<Switch
									checked={settings.googleLogin}
									onCheckedChange={(checked) =>
										handleToggle("googleLogin", checked)
									}
								/>
							</div>
						</div>

						{/* Google Configuration */}
						<div className="space-y-4">
							<PasswordField
								label="Google Client ID"
								field="googleClientId"
								value={settings.googleClientId}
								onChange={(value) => handleInputChange("googleClientId", value)}
							/>

							<PasswordField
								label="Google Secret key"
								field="googleSecretKey"
								value={settings.googleSecretKey}
								onChange={(value) =>
									handleInputChange("googleSecretKey", value)
								}
							/>
						</div>

						{/* Facebook Configuration */}
						<div className="space-y-4">
							<PasswordField
								label="Facebook ID"
								field="facebookId"
								value={settings.facebookId}
								onChange={(value) => handleInputChange("facebookId", value)}
							/>

							<PasswordField
								label="Facebook Secret key"
								field="facebookSecretKey"
								value={settings.facebookSecretKey}
								onChange={(value) =>
									handleInputChange("facebookSecretKey", value)
								}
							/>
						</div>

						<div className="flex justify-end pt-6">
							<Button type="submit" className="bg-green-600 hover:bg-green-700">
								Update
							</Button>
						</div>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}
