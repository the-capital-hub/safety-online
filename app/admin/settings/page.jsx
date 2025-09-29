"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";
import { useAdminReturnStore } from "@/store/adminReturnStore";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
        const [settings, setSettings] = useState({
                imagesPerProduct: "5",
                autoTranslation: true,
                translationKey: "",
		defaultLanguage: "english",
		defaultCurrency: "dollar",
		defaultTimezone: "default",
		dateFormat: "DD-MM-YYYY",
		receiptWidth: "57MM",
		emailInvoice: true,
		shopName: "",
		companyName: "",
		vatNumber: "",
		address: "",
		postCode: "",
		contact: "",
		email: "",
                website: "",
        });

        const {
                returnSettings,
                fetchReturnSettings,
                updateReturnSettings: saveReturnSettings,
                updatingSettings,
                settingsLoading,
        } = useAdminReturnStore();

        const [returnWindow, setReturnWindow] = useState("7");

	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

        const handleSubmit = (e) => {
                e.preventDefault();

                if (!e.currentTarget.checkValidity()) {

                  e.currentTarget.reportValidity();

                  return;

                }
                console.log("Saving settings:", settings);
        };

        const handleToggleReturns = async (enabled) => {
                const result = await saveReturnSettings({ enabled });

                if (result.success) {
                        toast.success(enabled ? "Buyer returns enabled" : "Buyer returns disabled");
                } else {
                        toast.error(result.message || "Failed to update return settings");
                }
        };

        const handleSaveReturnWindow = async () => {
                const parsedWindow = Number(returnWindow);
                const windowDays = Number.isFinite(parsedWindow) && parsedWindow >= 0 ? parsedWindow : 0;
                const result = await saveReturnSettings({ windowDays });

                if (result.success) {
                        toast.success("Return window updated");
                } else {
                        toast.error(result.message || "Failed to update return window");
                }
        };

        const windowChanged = String(returnSettings?.windowDays ?? "") !== String(returnWindow);
        useEffect(() => {
                if (!isAuthenticated) {
                        setIsRedirecting(true);
                        const timer = setTimeout(() => {
                                router.push("/admin/login");
                        }, 3);

                        return () => clearTimeout(timer);
                }
        }, [isAuthenticated, router]);

        useEffect(() => {
                fetchReturnSettings();
        }, [fetchReturnSettings]);

        useEffect(() => {
                if (typeof returnSettings?.windowDays !== "undefined") {
                        setReturnWindow(String(returnSettings.windowDays ?? 7));
                }
        }, [returnSettings]);

	// Show redirecting message if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}


	return (
		<div className="space-y-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
			>
				<h1 className="text-3xl font-bold text-gray-900">Settings</h1>
			</motion.div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<Card>
					<CardHeader>
						<CardTitle>General Settings</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<Label htmlFor="images">Number of images per product</Label>
							<Input
								id="images"
								value={settings.imagesPerProduct}
								onChange={(e) =>
									setSettings({ ...settings, imagesPerProduct: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div className="flex items-center justify-between">
							<div>
								<Label>Allow Auto Translation</Label>
							</div>
							<Switch
								checked={settings.autoTranslation}
								onCheckedChange={(checked) =>
									setSettings({ ...settings, autoTranslation: checked })
								}
							/>
						</div>

						<div>
							<Label htmlFor="translation-key">Translation Secret Key</Label>
							<Input
								id="translation-key"
								placeholder="Translation Secret Key"
								value={settings.translationKey}
								onChange={(e) =>
									setSettings({ ...settings, translationKey: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label>Default language</Label>
							<Select
								value={settings.defaultLanguage}
								onValueChange={(value) =>
									setSettings({ ...settings, defaultLanguage: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="english">English</SelectItem>
									<SelectItem value="spanish">Spanish</SelectItem>
									<SelectItem value="french">French</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Default currency</Label>
							<Select
								value={settings.defaultCurrency}
								onValueChange={(value) =>
									setSettings({ ...settings, defaultCurrency: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="dollar">Dollar</SelectItem>
									<SelectItem value="euro">Euro</SelectItem>
									<SelectItem value="pound">Pound</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Default time zone</Label>
							<Select
								value={settings.defaultTimezone}
								onValueChange={(value) =>
									setSettings({ ...settings, defaultTimezone: value })
								}
							>
								<SelectTrigger className="mt-1">
									<SelectValue placeholder="Default time zone" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="default">Default time zone</SelectItem>
									<SelectItem value="utc">UTC</SelectItem>
									<SelectItem value="est">EST</SelectItem>
									<SelectItem value="pst">PST</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label>Default Date Format</Label>
                                                        <Input
                                                                id="dateFormat"
                                                                name="dateFormat"
                                                                value={settings.dateFormat}
								onChange={(e) =>
									setSettings({ ...settings, dateFormat: e.target.value })
								}
								className="mt-1"
								placeholder="DD-MM-YYYY"
							/>
						</div>

						<div>
							<Label>Receipt size (width)</Label>
                                                        <Input
                                                                id="receiptWidth"
                                                                name="receiptWidth"
                                                                value={settings.receiptWidth}
								onChange={(e) =>
									setSettings({ ...settings, receiptWidth: e.target.value })
								}
								className="mt-1"
								placeholder="57MM"
							/>
						</div>

                                                <div className="flex items-center justify-between">
                                                        <div>
                                                                <Label>Enable invoice Send to Customer by email</Label>
                                                        </div>
                                                        <Switch
                                                                checked={settings.emailInvoice}
                                                                onCheckedChange={(checked) =>
                                                                        setSettings({ ...settings, emailInvoice: checked })
                                                                }
                                                        />
                                                </div>

                                                <div className="space-y-3 rounded-lg border border-dashed p-4">
                                                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                                                <div>
                                                                        <Label>Enable buyer returns</Label>
                                                                        <p className="text-sm text-muted-foreground">
                                                                                Allow buyers to submit return requests from their account dashboard.
                                                                        </p>
                                                                </div>
                                                                <Switch
                                                                        checked={Boolean(returnSettings?.enabled)}
                                                                        onCheckedChange={handleToggleReturns}
                                                                        disabled={settingsLoading || updatingSettings}
                                                                />
                                                        </div>
                                                        <div className="grid gap-2 md:max-w-xs">
                                                                <Label htmlFor="return-window">Return window (days)</Label>
                                                                <div className="flex items-center gap-2">
                                                                        <Input
                                                                                id="return-window"
                                                                                type="number"
                                                                                min="0"
                                                                                value={returnWindow}
                                                                                onChange={(event) => setReturnWindow(event.target.value)}
                                                                                disabled={settingsLoading}
                                                                        />
                                                                        <Button
                                                                                type="button"
                                                                                variant="outline"
                                                                                onClick={handleSaveReturnWindow}
                                                                                disabled={!windowChanged || updatingSettings}
                                                                        >
                                                                                {updatingSettings ? "Saving..." : "Save"}
                                                                        </Button>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">
                                                                        Buyers can request returns within the configured time frame after delivery.
                                                                </p>
                                                        </div>
                                                </div>
                                        </CardContent>
                                </Card>

				<Card>
					<CardHeader>
						<CardTitle>Store Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<div>
							<Label htmlFor="shop-name">Shop name</Label>
							<Input
								id="shop-name"
								placeholder="Shop name"
								value={settings.shopName}
								onChange={(e) =>
									setSettings({ ...settings, shopName: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="company-name">Company Name</Label>
							<Input
								id="company-name"
								placeholder="Company Name"
								value={settings.companyName}
								onChange={(e) =>
									setSettings({ ...settings, companyName: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="vat-number">Vat Number</Label>
							<Input
								id="vat-number"
								placeholder="Vat Number"
								value={settings.vatNumber}
								onChange={(e) =>
									setSettings({ ...settings, vatNumber: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="address">Address</Label>
							<Input
								id="address"
								placeholder="Address"
								value={settings.address}
								onChange={(e) =>
									setSettings({ ...settings, address: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="post-code">Post Code</Label>
							<Input
								id="post-code"
								placeholder="Post Code"
								value={settings.postCode}
								onChange={(e) =>
									setSettings({ ...settings, postCode: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="contact">Contact</Label>
							<Input
								id="contact"
								placeholder="Contact"
								value={settings.contact}
								onChange={(e) =>
									setSettings({ ...settings, contact: e.target.value })
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
								value={settings.email}
								onChange={(e) =>
									setSettings({ ...settings, email: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<div>
							<Label htmlFor="website">Web site</Label>
							<Input
								id="website"
								placeholder="Web site"
								value={settings.website}
								onChange={(e) =>
									setSettings({ ...settings, website: e.target.value })
								}
								className="mt-1"
							/>
						</div>

						<Button type="submit" className="bg-green-600 hover:bg-green-700">
							Update
						</Button>
					</CardContent>
				</Card>
			</form>
		</div>
	);
}
