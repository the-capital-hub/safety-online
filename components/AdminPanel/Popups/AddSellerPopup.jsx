"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAdminSellerStore } from "@/store/adminSellerStore.js";
import { cn } from "@/lib/utils";

export function AddSellerPopup({ open, onOpenChange }) {
	const { addSeller, loading } = useAdminSellerStore();

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		mobile: "",
		password: "",
		companyName: "",
		brandName: "",
		companyEmail: "",
		companyPhone: "",
		gstinNumber: "",
		brandDescription: "",
	});

	const [errors, setErrors] = useState({});
	const [currentStep, setCurrentStep] = useState(0);
	const [furthestStep, setFurthestStep] = useState(0);

	useEffect(() => {
		if (!open) {
			setCurrentStep(0);
			setFurthestStep(0);
			setErrors({});
		}
	}, [open]);

	const steps = useMemo(
		() => [
			{
				title: "Personal Details",
				description: "Basic information for the seller contact.",
			},
			{
				title: "Contact & Access",
				description: "How the seller will log in and be reached.",
			},
			{
				title: "Business Information",
				description: "Company profile and compliance details.",
			},
			{
				title: "Review & Confirm",
				description: "Double-check the information before inviting.",
			},
		],
		[]
	);

	const stepFieldMap = useMemo(
		() => ({
			0: ["firstName", "lastName", "email"],
			1: ["mobile", "password"],
			2: ["companyName", "companyEmail", "companyPhone", "gstinNumber"],
		}),
		[]
	);

	const fieldToStepMap = useMemo(
		() => ({
			firstName: 0,
			lastName: 0,
			email: 0,
			mobile: 1,
			password: 1,
			companyName: 2,
			brandName: 2,
			companyEmail: 2,
			companyPhone: 2,
			gstinNumber: 2,
			brandDescription: 3,
		}),
		[]
	);

	const validators = useMemo(
		() => ({
			firstName: (value) => (!value.trim() ? "First name is required." : ""),
			lastName: (value) => (!value.trim() ? "Last name is required." : ""),
			email: (value) => {
				if (!value.trim()) return "Email is required.";
				const emailRegex = /^[\w.!#$%&'*+/=?`{|}~-]+@[\w-]+(\.[\w-]+)+$/;
				if (!emailRegex.test(value.trim())) {
					return "Enter a valid email address.";
				}
				return "";
			},
			mobile: (value) => (!value.trim() ? "Mobile number is required." : ""),
			password: (value) => {
				if (!value.trim()) return "Password is required.";
				if (value.trim().length < 6) {
					return "Password must be at least 6 characters.";
				}
				return "";
			},
			companyName: (value) =>
				!value.trim() ? "Company name is required." : "",
			companyEmail: (value) => {
				if (!value.trim()) return "Company email is required.";
				const emailRegex = /^[\w.!#$%&'*+/=?`{|}~-]+@[\w-]+(\.[\w-]+)+$/;
				if (!emailRegex.test(value.trim())) {
					return "Enter a valid company email.";
				}
				return "";
			},
			companyPhone: (value) =>
				!value.trim() ? "Company phone is required." : "",
			gstinNumber: (value) => (!value.trim() ? "GSTIN is required." : ""),
		}),
		[]
	);

	const validateFields = (fields) => {
		const validationErrors = {};

		fields.forEach((field) => {
			const value = formData[field] ?? "";
			const validator = validators[field];
			const errorMessage = validator
				? validator(typeof value === "string" ? value : String(value))
				: !String(value).trim()
				? "This field is required."
				: "";

			if (errorMessage) {
				validationErrors[field] = errorMessage;
			}
		});

		return validationErrors;
	};

	const updateErrorsForFields = (fields, validationErrors) => {
		setErrors((prev) => {
			const nextErrors = { ...prev };
			fields.forEach((field) => {
				if (validationErrors[field]) {
					nextErrors[field] = validationErrors[field];
				} else {
					delete nextErrors[field];
				}
			});
			return nextErrors;
		});
	};

	const handleChange = (field) => (event) => {
		setFormData((prev) => ({ ...prev, [field]: event.target.value }));
		setErrors((prev) => {
			if (!prev[field]) return prev;
			const next = { ...prev };
			delete next[field];
			return next;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!e.currentTarget.checkValidity()) {
			e.currentTarget.reportValidity();
			return;
		}

		const allRequiredFields = Object.values(stepFieldMap).flat();
		const validationErrors = validateFields(allRequiredFields);

		if (Object.keys(validationErrors).length > 0) {
			updateErrorsForFields(allRequiredFields, validationErrors);

			const firstErrorField = allRequiredFields.find(
				(field) => validationErrors[field]
			);

			if (firstErrorField) {
				const targetStep = fieldToStepMap[firstErrorField] ?? 0;
				setCurrentStep(targetStep);
			}

			return;
		}
		const payload = {
			firstName: formData.firstName,
			lastName: formData.lastName,
			email: formData.email,
			mobile: formData.mobile,
			password: formData.password,
			company: {
				companyName: formData.companyName,
				brandName: formData.brandName || formData.companyName || undefined,
				companyEmail: formData.companyEmail,
				phone: formData.companyPhone,
				gstinNumber: formData.gstinNumber,
				brandDescription: formData.brandDescription,
			},
		};

		const success = await addSeller(payload);
		if (success) {
			onOpenChange(false);
			setFormData({
				firstName: "",
				lastName: "",
				email: "",
				mobile: "",
				password: "",
				companyName: "",
				brandName: "",
				companyEmail: "",
				companyPhone: "",
				gstinNumber: "",
				brandDescription: "",
			});
			setErrors({});
			setCurrentStep(0);
			setFurthestStep(0);
		}
	};

	const handleNext = () => {
		const fields = stepFieldMap[currentStep] ?? [];
		const validationErrors = validateFields(fields);

		if (Object.keys(validationErrors).length > 0) {
			updateErrorsForFields(fields, validationErrors);
			return;
		}

		updateErrorsForFields(fields, validationErrors);
		setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
		setFurthestStep((prev) => Math.max(prev, currentStep + 1));
	};

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 0));
	};

	const progressValue = ((currentStep + 1) / steps.length) * 100;

	const renderStepContent = () => {
		switch (currentStep) {
			case 0:
				return (
					<div className="space-y-6">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label htmlFor="firstName">First Name</Label>
								<Input
									id="firstName"
									placeholder="First Name"
									value={formData.firstName}
									onChange={handleChange("firstName")}
									className={cn(
										"mt-1",
										errors.firstName &&
											"border-red-500 focus-visible:ring-red-500"
									)}
									required
								/>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-500">
										{errors.firstName}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="lastName">Last Name</Label>
								<Input
									id="lastName"
									placeholder="Last Name"
									value={formData.lastName}
									onChange={handleChange("lastName")}
									className={cn(
										"mt-1",
										errors.lastName &&
											"border-red-500 focus-visible:ring-red-500"
									)}
									required
								/>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="seller@example.com"
								value={formData.email}
								onChange={handleChange("email")}
								className={cn(
									"mt-1",
									errors.email && "border-red-500 focus-visible:ring-red-500"
								)}
								required
							/>
							{errors.email && (
								<p className="mt-1 text-sm text-red-500">{errors.email}</p>
							)}
						</div>
					</div>
				);
			case 1:
				return (
					<div className="space-y-6">
						<div>
							<Label htmlFor="mobile">Mobile</Label>
							<Input
								id="mobile"
								placeholder="Phone Number"
								value={formData.mobile}
								onChange={handleChange("mobile")}
								className={cn(
									"mt-1",
									errors.mobile && "border-red-500 focus-visible:ring-red-500"
								)}
								required
							/>
							{errors.mobile && (
								<p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
							)}
						</div>

						<div>
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange("password")}
								className={cn(
									"mt-1",
									errors.password && "border-red-500 focus-visible:ring-red-500"
								)}
								required
							/>
							{errors.password && (
								<p className="mt-1 text-sm text-red-500">{errors.password}</p>
							)}
						</div>
					</div>
				);
			case 2:
				return (
					<div className="space-y-6">
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label htmlFor="companyName">Company Name</Label>
								<Input
									id="companyName"
									placeholder="Registered company name"
									value={formData.companyName}
									onChange={handleChange("companyName")}
									className={cn(
										"mt-1",
										errors.companyName &&
											"border-red-500 focus-visible:ring-red-500"
									)}
									required
								/>
								{errors.companyName && (
									<p className="mt-1 text-sm text-red-500">
										{errors.companyName}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="brandName">Brand / Store Name</Label>
								<Input
									id="brandName"
									placeholder="Public facing brand"
									value={formData.brandName}
									onChange={handleChange("brandName")}
									className="mt-1"
								/>
							</div>
						</div>

						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<Label htmlFor="companyEmail">Company Email</Label>
								<Input
									id="companyEmail"
									type="email"
									placeholder="brand@company.com"
									value={formData.companyEmail}
									onChange={handleChange("companyEmail")}
									className={cn(
										"mt-1",
										errors.companyEmail &&
											"border-red-500 focus-visible:ring-red-500"
									)}
									required
								/>
								{errors.companyEmail && (
									<p className="mt-1 text-sm text-red-500">
										{errors.companyEmail}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="companyPhone">Company Phone</Label>
								<Input
									id="companyPhone"
									placeholder="Company contact number"
									value={formData.companyPhone}
									onChange={handleChange("companyPhone")}
									className={cn(
										"mt-1",
										errors.companyPhone &&
											"border-red-500 focus-visible:ring-red-500"
									)}
									required
								/>
								{errors.companyPhone && (
									<p className="mt-1 text-sm text-red-500">
										{errors.companyPhone}
									</p>
								)}
							</div>
						</div>

						<div>
							<Label htmlFor="gstinNumber">GSTIN</Label>
							<Input
								id="gstinNumber"
								placeholder="22AAAAA0000A1Z5"
								value={formData.gstinNumber}
								onChange={handleChange("gstinNumber")}
								className={cn(
									"mt-1",
									errors.gstinNumber &&
										"border-red-500 focus-visible:ring-red-500"
								)}
								required
							/>
							{errors.gstinNumber && (
								<p className="mt-1 text-sm text-red-500">
									{errors.gstinNumber}
								</p>
							)}
						</div>

						<div>
							<Label htmlFor="brandDescription">Brand Description</Label>
							<Textarea
								id="brandDescription"
								placeholder="Short description about the brand"
								value={formData.brandDescription}
								onChange={handleChange("brandDescription")}
								className="mt-1"
								rows={3}
							/>
						</div>
					</div>
				);
			default:
				return (
					<div className="space-y-6">
						<p className="text-sm text-gray-600">
							Review the seller information below. Tap a section card above to
							make edits before inviting the seller.
						</p>
						<div className="grid gap-4 md:grid-cols-2">
							<div className="rounded-lg border bg-white p-4 shadow-sm">
								<h3 className="text-sm font-semibold text-gray-900">
									Personal Details
								</h3>
								<dl className="mt-3 space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<dt className="text-gray-500">First name</dt>
										<dd className="font-medium text-gray-900">
											{formData.firstName || "-"}
										</dd>
									</div>
									<div className="flex items-center justify-between">
										<dt className="text-gray-500">Last name</dt>
										<dd className="font-medium text-gray-900">
											{formData.lastName || "-"}
										</dd>
									</div>
									<div className="flex items-center justify-between">
										<dt className="text-gray-500">Email</dt>
										<dd className="font-medium text-gray-900">
											{formData.email || "-"}
										</dd>
									</div>
								</dl>
							</div>
							<div className="rounded-lg border bg-white p-4 shadow-sm">
								<h3 className="text-sm font-semibold text-gray-900">
									Contact & Access
								</h3>
								<dl className="mt-3 space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<dt className="text-gray-500">Mobile</dt>
										<dd className="font-medium text-gray-900">
											{formData.mobile || "-"}
										</dd>
									</div>
									<div className="flex items-center justify-between">
										<dt className="text-gray-500">Password</dt>
										<dd className="font-medium text-gray-900">
											{formData.password ? "••••••" : "-"}
										</dd>
									</div>
								</dl>
							</div>
							<div className="rounded-lg border bg-white p-4 shadow-sm md:col-span-2">
								<h3 className="text-sm font-semibold text-gray-900">
									Business Information
								</h3>
								<dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
									<div>
										<dt className="text-gray-500">Company name</dt>
										<dd className="font-medium text-gray-900">
											{formData.companyName || "-"}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500">Brand name</dt>
										<dd className="font-medium text-gray-900">
											{formData.brandName || "-"}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500">Company email</dt>
										<dd className="font-medium text-gray-900">
											{formData.companyEmail || "-"}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500">Company phone</dt>
										<dd className="font-medium text-gray-900">
											{formData.companyPhone || "-"}
										</dd>
									</div>
									<div>
										<dt className="text-gray-500">GSTIN</dt>
										<dd className="font-medium text-gray-900">
											{formData.gstinNumber || "-"}
										</dd>
									</div>
								</dl>
								{formData.brandDescription && (
									<div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
										<p className="font-medium text-gray-900">Brand story</p>
										<p className="mt-1 whitespace-pre-wrap">
											{formData.brandDescription}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl h-[90vh] overflow-y-auto feature-scrollbar">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="text-lg font-semibold">
									Add Seller
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Step {currentStep + 1} of {steps.length} ·{" "}
									{steps[currentStep].description}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="mt-4 space-y-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between text-sm text-gray-500">
								<span className="font-medium text-gray-900">
									{steps[currentStep].title}
								</span>
								<span>
									Step {currentStep + 1} of {steps.length}
								</span>
							</div>
							<Progress
								value={progressValue}
								className="h-2"
								indicatorClassName="bg-orange-500"
							/>
							<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
								{steps.map((step, index) => {
									const status =
										index === currentStep
											? "current"
											: index < currentStep
											? "complete"
											: "upcoming";
									const isDisabled = index > furthestStep;

									return (
										<button
											key={step.title}
											type="button"
											onClick={() => {
												if (!isDisabled) {
													setCurrentStep(index);
												}
											}}
											className={cn(
												"flex items-start gap-3 rounded-lg border bg-white p-3 text-left text-sm transition-all",
												status === "current" && "border-orange-500 shadow-md",
												status === "complete" && "border-green-500",
												status === "upcoming" && "border-gray-200",
												isDisabled
													? "cursor-not-allowed opacity-60"
													: "hover:border-orange-400 hover:shadow-sm"
											)}
											disabled={isDisabled}
										>
											<span
												className={cn(
													"flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-semibold",
													status === "current" && "bg-orange-500 text-white",
													status === "complete" && "bg-green-500 text-white",
													status === "upcoming" && "bg-gray-100 text-gray-500"
												)}
											>
												{index + 1}
											</span>
											<div className="space-y-1">
												<p className="font-semibold text-gray-900">
													{step.title}
												</p>
												<p className="text-xs text-gray-500">
													{step.description}
												</p>
											</div>
										</button>
									);
								})}
							</div>
						</div>

						{renderStepContent()}

						<DialogFooter className="mt-8 gap-2 sm:justify-between">
							<div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									disabled={loading}
								>
									Cancel
								</Button>
								{currentStep > 0 && (
									<Button
										type="button"
										variant="ghost"
										onClick={handleBack}
										disabled={loading}
									>
										Back
									</Button>
								)}
							</div>
							{currentStep === steps.length - 1 ? (
								<Button
									type="submit"
									className="flex-1 bg-orange-500 hover:bg-orange-600 sm:flex-initial"
									disabled={loading}
								>
									{loading ? "Adding..." : "Add Seller"}
								</Button>
							) : (
								<Button
									type="button"
									className="flex-1 bg-orange-500 hover:bg-orange-600 sm:flex-initial"
									onClick={handleNext}
									disabled={loading}
								>
									Continue
								</Button>
							)}
						</DialogFooter>
					</form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
