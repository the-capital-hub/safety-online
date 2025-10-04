"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
        useSellerAuthStore,
        useIsSellerAuthenticated,
} from "@/store/sellerAuthStore";
import { toast } from "react-hot-toast";
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";
import {
        emptyCompanyAddress,
        mapFormToRegistrationPayload,
        normalizeCompanyAddressInput,
        sellerBankDetailsFormSchema,
        sellerCompanyDetailsSchema,
        sellerPersonalDetailsFormSchema,
        sellerRegistrationSchema,
} from "@/zodSchema/sellerRegistrationSchema.js";

const steps = [
        {
                title: "Personal Details",
                description: "Tell us about yourself to create your seller account.",
        },
        {
                title: "Company Details",
                description: "Share your business information for verification.",
        },
        {
                title: "Bank Details",
                description: "Provide payout information to receive settlements.",
        },
];

export default function SellerRegister() {
        const [step, setStep] = useState(0);
        const [personalDetails, setPersonalDetails] = useState({
                firstName: "",
                lastName: "",
                email: "",
                mobile: "",
                password: "",
                confirmPassword: "",
        });
        const [companyDetails, setCompanyDetails] = useState({
                companyName: "",
                companyEmail: "",
                phone: "",
                brandName: "",
                brandDescription: "",
                gstinNumber: "",
                companyLogo: "",
        });
        const [companyAddress, setCompanyAddress] = useState(emptyCompanyAddress());
        const [includeCompanyAddress, setIncludeCompanyAddress] = useState(false);
        const [bankDetails, setBankDetails] = useState({
                accountHolderName: "",
                accountNumber: "",
                confirmAccountNumber: "",
                ifscCode: "",
                bankName: "",
                branchName: "",
        });
        const [showPassword, setShowPassword] = useState(false);
        const [showConfirmPassword, setShowConfirmPassword] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const router = useRouter();
        const { register } = useSellerAuthStore();
        const isAuthenticated = useIsSellerAuthenticated();

        useEffect(() => {
                if (isAuthenticated) {
                        router.push("/seller/dashboard");
                }
        }, [isAuthenticated, router]);

        const progress = useMemo(
                () => Math.round(((step + 1) / steps.length) * 100),
                [step]
        );

        const handlePersonalChange = (event) => {
                const { name, value } = event.target;
                let nextValue = value;
                if (name === "mobile") {
                        nextValue = value.replace(/\D/g, "").slice(0, 15);
                }
                setPersonalDetails((prev) => ({
                        ...prev,
                        [name]: nextValue,
                }));
        };

        const handleCompanyChange = (event) => {
                const { name, value } = event.target;
                let nextValue = value;
                if (name === "phone") {
                        nextValue = value.replace(/\D/g, "").slice(0, 15);
                }
                if (name === "gstinNumber") {
                        nextValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 20);
                }
                setCompanyDetails((prev) => ({
                        ...prev,
                        [name]: nextValue,
                }));
        };

        const handleCompanyAddressChange = (event) => {
                const { name, value } = event.target;
                let nextValue = value;
                if (name === "pincode") {
                        nextValue = value.replace(/\D/g, "").slice(0, 10);
                }
                setCompanyAddress((prev) => ({
                        ...prev,
                        [name]: nextValue,
                }));
        };

        const handleBankChange = (event) => {
                const { name, value } = event.target;
                let nextValue = value;
                if (name === "accountNumber" || name === "confirmAccountNumber") {
                        nextValue = value.replace(/\D/g, "").slice(0, 18);
                }
                if (name === "ifscCode") {
                        nextValue = value
                                .toUpperCase()
                                .replace(/[^A-Z0-9]/g, "")
                                .slice(0, 11);
                }
                setBankDetails((prev) => ({
                        ...prev,
                        [name]: nextValue,
                }));
        };

        const handleBack = () => {
                setStep((prev) => Math.max(prev - 1, 0));
        };

        const handleStepSubmit = async (event) => {
                event.preventDefault();

                if (step === 0) {
                        const parsed = sellerPersonalDetailsFormSchema.safeParse(
                                personalDetails
                        );
                        if (!parsed.success) {
                                toast.error(parsed.error.issues[0]?.message || "Invalid details");
                                return;
                        }
                        setStep(1);
                        return;
                }

                if (step === 1) {
                        const normalizedAddress = includeCompanyAddress
                                ? normalizeCompanyAddressInput(companyAddress)
                                : [];
                        const parsed = sellerCompanyDetailsSchema.safeParse({
                                ...companyDetails,
                                companyAddress: normalizedAddress,
                        });
                        if (!parsed.success) {
                                toast.error(
                                        parsed.error.issues[0]?.message || "Check your company details"
                                );
                                return;
                        }
                        setStep(2);
                        return;
                }

                const parsedBank = sellerBankDetailsFormSchema.safeParse(bankDetails);
                if (!parsedBank.success) {
                        toast.error(parsedBank.error.issues[0]?.message || "Invalid bank details");
                        return;
                }

                const { confirmAccountNumber, ...bankPayload } = parsedBank.data;
                const normalizedAddress = includeCompanyAddress
                        ? normalizeCompanyAddressInput(companyAddress)
                        : [];

                const payload = mapFormToRegistrationPayload({
                        personalDetails,
                        companyDetails: {
                                ...companyDetails,
                                companyAddress: normalizedAddress,
                        },
                        bankDetails: bankPayload,
                });

                const registrationCheck = sellerRegistrationSchema.safeParse(payload);
                if (!registrationCheck.success) {
                        toast.error(
                                registrationCheck.error.issues[0]?.message ||
                                        "Unable to submit registration"
                        );
                        return;
                }

                setIsLoading(true);
                try {
                        const result = await register(registrationCheck.data);
                        if (result.success) {
                                router.push("/seller/login");
                        }
                } catch (error) {
                        console.error("Seller registration failed", error);
                        toast.error("Registration failed. Please try again.");
                } finally {
                        setIsLoading(false);
                }
        };

        if (isAuthenticated) {
                return (
                        <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                );
        }

        const containerVariants = {
                hidden: { opacity: 0 },
                visible: {
                        opacity: 1,
                        transition: {
                                duration: 0.6,
                                staggerChildren: 0.1,
                        },
                },
        };

        const itemVariants = {
                hidden: { y: 20, opacity: 0 },
                visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                                duration: 0.5,
                        },
                },
        };

        return (
                <div className="max-w-7xl mx-auto min-h-screen grid grid-cols-2 lg:px-10">
                        {/* Left side - Image and branding */}
                        <motion.div
                                className="hidden lg:flex justify-center items-center overflow-hidden my-12 px-8"
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                                <div className="w-4/5 py-8 bg-[#F3F3F3] rounded-2xl">
                                        <motion.div
                                                className="w-full"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                        >
                                                <motion.h1
                                                        className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2 text-center"
                                                        variants={itemVariants}
                                                >
                                                        JOIN OUR COMMUNITY
                                                </motion.h1>
                                                <motion.p
                                                        className="text-gray-600 lg:text-xl font-medium tracking-wider text-center"
                                                        variants={itemVariants}
                                                >
                                                        START YOUR JOURNEY TODAY
                                                </motion.p>
                                        </motion.div>

                                        <div className="flex items-center justify-center">
                                                <motion.div
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ duration: 1, delay: 0.3 }}
                                                        className="w-full max-w-[400px] h-1/2 overflow-hidden"
                                                >
                                                        <Image
                                                                src={LoginModel.src}
                                                                alt="Welcome"
                                                                width={400}
                                                                height={400}
                                                                className="w-full h-full object-cover"
                                                        />
                                                </motion.div>
                                        </div>
                                </div>
                        </motion.div>

                        {/* Right side - Signup form */}
                        <motion.div
                                className="my-12 col-span-2 md:col-span-1 flex-1 flex justify-center px-8 bg-white h-[calc(100vh-96px)] overflow-auto hide-scrollbar"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        >
                                <div className="w-full max-w-md">
                                        <motion.div
                                                className="text-center mb-6"
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                        >
                                                <Image
                                                        src={Logo.src}
                                                        alt="Logo"
                                                        width={100}
                                                        height={100}
                                                        className="w-[100] h-auto object-cover"
                                                />
                                        </motion.div>

                                        <motion.div
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                        >
                                                <Card className="border-0 shadow-none">
                                                        <CardHeader className="space-y-3 p-0 mb-4">
                                                                <motion.div variants={itemVariants} className="space-y-1">
                                                                        <p className="text-sm font-medium text-gray-500">
                                                                                Step {step + 1} of {steps.length} · {progress}% complete
                                                                        </p>
                                                                        <CardTitle className="text-2xl font-bold text-gray-800">
                                                                                {steps[step].title}
                                                                        </CardTitle>
                                                                </motion.div>
                                                                <motion.div variants={itemVariants} className="space-y-2">
                                                                        <CardDescription className="text-gray-600">
                                                                                {steps[step].description}
                                                                        </CardDescription>
                                                                        <p className="text-sm text-gray-600">
                                                                                Already have an account?{" "}
                                                                                <Link
                                                                                        href="/seller/login"
                                                                                        className="text-black hover:text-blue-700 font-medium underline"
                                                                                >
                                                                                        Sign In
                                                                                </Link>
                                                                        </p>
                                                                </motion.div>
                                                        </CardHeader>
                                                        <CardContent className="p-0">
                                                                <form onSubmit={handleStepSubmit} className="space-y-6">
                                                                        {step === 0 && (
                                                                                <div className="space-y-4">
                                                                                        <div className="grid grid-cols-2 gap-4">
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="firstName">First Name</Label>
                                                                                                        <Input
                                                                                                                id="firstName"
                                                                                                                name="firstName"
                                                                                                                type="text"
                                                                                                                placeholder="First name"
                                                                                                                value={personalDetails.firstName}
                                                                                                                onChange={handlePersonalChange}
                                                                                                                required
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="lastName">Last Name</Label>
                                                                                                        <Input
                                                                                                                id="lastName"
                                                                                                                name="lastName"
                                                                                                                type="text"
                                                                                                                placeholder="Last name"
                                                                                                                value={personalDetails.lastName}
                                                                                                                onChange={handlePersonalChange}
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
                                                                                                        placeholder="Enter your email"
                                                                                                        value={personalDetails.email}
                                                                                                        onChange={handlePersonalChange}
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="mobile">Mobile Number</Label>
                                                                                                <Input
                                                                                                        id="mobile"
                                                                                                        name="mobile"
                                                                                                        inputMode="tel"
                                                                                                        placeholder="Enter your mobile number"
                                                                                                        value={personalDetails.mobile}
                                                                                                        onChange={handlePersonalChange}
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="password">Password</Label>
                                                                                                <div className="relative">
                                                                                                        <Input
                                                                                                                id="password"
                                                                                                                name="password"
                                                                                                                type={showPassword ? "text" : "password"}
                                                                                                                placeholder="Enter your password"
                                                                                                                value={personalDetails.password}
                                                                                                                onChange={handlePersonalChange}
                                                                                                                required
                                                                                                        />
                                                                                                        <Button
                                                                                                                type="button"
                                                                                                                variant="ghost"
                                                                                                                size="sm"
                                                                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                                                                onClick={() => setShowPassword((prev) => !prev)}
                                                                                                        >
                                                                                                                {showPassword ? (
                                                                                                                        <EyeOff className="h-4 w-4" />
                                                                                                                ) : (
                                                                                                                        <Eye className="h-4 w-4" />
                                                                                                                )}
                                                                                                        </Button>
                                                                                                </div>
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                                                                                <div className="relative">
                                                                                                        <Input
                                                                                                                id="confirmPassword"
                                                                                                                name="confirmPassword"
                                                                                                                type={showConfirmPassword ? "text" : "password"}
                                                                                                                placeholder="Confirm your password"
                                                                                                                value={personalDetails.confirmPassword}
                                                                                                                onChange={handlePersonalChange}
                                                                                                                required
                                                                                                        />
                                                                                                        <Button
                                                                                                                type="button"
                                                                                                                variant="ghost"
                                                                                                                size="sm"
                                                                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                                                                onClick={() =>
                                                                                                                        setShowConfirmPassword((prev) => !prev)
                                                                                                                }
                                                                                                        >
                                                                                                                {showConfirmPassword ? (
                                                                                                                        <EyeOff className="h-4 w-4" />
                                                                                                                ) : (
                                                                                                                        <Eye className="h-4 w-4" />
                                                                                                                )}
                                                                                                        </Button>
                                                                                                </div>
                                                                                        </div>
                                                                                </div>
                                                                        )}

                                                                        {step === 1 && (
                                                                                <div className="space-y-4">
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="companyName">Company Name</Label>
                                                                                                <Input
                                                                                                        id="companyName"
                                                                                                        name="companyName"
                                                                                                        value={companyDetails.companyName}
                                                                                                        onChange={handleCompanyChange}
                                                                                                        placeholder="Registered company name"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="companyEmail">Company Email</Label>
                                                                                                <Input
                                                                                                        id="companyEmail"
                                                                                                        name="companyEmail"
                                                                                                        type="email"
                                                                                                        value={companyDetails.companyEmail}
                                                                                                        onChange={handleCompanyChange}
                                                                                                        placeholder="support@company.com"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="phone">Company Phone</Label>
                                                                                                <Input
                                                                                                        id="phone"
                                                                                                        name="phone"
                                                                                                        inputMode="tel"
                                                                                                        value={companyDetails.phone}
                                                                                                        onChange={handleCompanyChange}
                                                                                                        placeholder="Company contact number"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="brandName">Brand Name (optional)</Label>
                                                                                                <Input
                                                                                                        id="brandName"
                                                                                                        name="brandName"
                                                                                                        value={companyDetails.brandName}
                                                                                                        onChange={handleCompanyChange}
                                                                                                        placeholder="Trading / brand name"
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="brandDescription">Brand Description (optional)</Label>
                                                                                                <Textarea
                                                                                                        id="brandDescription"
                                                                                                        name="brandDescription"
                                                                                                        value={companyDetails.brandDescription}
                                                                                                        onChange={handleCompanyChange}
                                                                                                        placeholder="Describe your products or services"
                                                                                                        rows={3}
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="gstinNumber">GSTIN (optional)</Label>
                                                                                                <Input
                                                                                                        id="gstinNumber"
                                                                                                        name="gstinNumber"
                                                                                                        value={companyDetails.gstinNumber}
                                                                                                        onChange={handleCompanyChange}
                                                                                                        placeholder="22AAAAA0000A1Z5"
                                                                                                />
                                                                                        </div>
                                                                                        <div className="flex items-center gap-3 rounded-md border border-gray-200 p-3">
                                                                                                <Checkbox
                                                                                                        id="include-address"
                                                                                                        checked={includeCompanyAddress}
                                                                                                        onCheckedChange={(checked) =>
                                                                                                                setIncludeCompanyAddress(Boolean(checked))
                                                                                                        }
                                                                                                />
                                                                                                <Label
                                                                                                        htmlFor="include-address"
                                                                                                        className="text-sm font-medium text-gray-700"
                                                                                                >
                                                                                                        Add primary pickup address now
                                                                                                </Label>
                                                                                        </div>
                                                                                        {includeCompanyAddress && (
                                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="tagName">Address Label</Label>
                                                                                                                <Input
                                                                                                                        id="tagName"
                                                                                                                        name="tagName"
                                                                                                                        value={companyAddress.tagName}
                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                        placeholder="Head Office"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="building">Building</Label>
                                                                                                                <Input
                                                                                                                        id="building"
                                                                                                                        name="building"
                                                                                                                        value={companyAddress.building}
                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                        placeholder="Building / Flat"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="street">Street</Label>
                                                                                                                <Input
                                                                                                                        id="street"
                                                                                                                        name="street"
                                                                                                                        value={companyAddress.street}
                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                        placeholder="Street / Area"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="city">City</Label>
                                                                                                                <Input
                                                                                                                        id="city"
                                                                                                                        name="city"
                                                                                                                        value={companyAddress.city}
                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                        placeholder="City"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="state">State</Label>
                                                                                                                <Input
                                                                                                                        id="state"
                                                                                                                        name="state"
                                                                                                                        value={companyAddress.state}
                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                        placeholder="State"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="pincode">Pincode</Label>
                                                                                                                <Input
                                                                                                                        id="pincode"
                                                                                                                        name="pincode"
                                                                                                                        inputMode="numeric"
                                                                                                                        value={companyAddress.pincode}
                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                        placeholder="Postal code"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2 md:col-span-2">
                                                                                                                <Label htmlFor="country">Country</Label>
                                                                                                                <Input
                                                                                                                        id="country"
                                                                                                                        name="country"
                                                                                                                        value={companyAddress.country}
                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                        placeholder="Country"
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                        )}
                                                                                </div>
                                                                        )}

                                                                        {step === 2 && (
                                                                                <div className="space-y-4">
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                                                                                                <Input
                                                                                                        id="accountHolderName"
                                                                                                        name="accountHolderName"
                                                                                                        value={bankDetails.accountHolderName}
                                                                                                        onChange={handleBankChange}
                                                                                                        placeholder="As per bank records"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="accountNumber">Account Number</Label>
                                                                                                <Input
                                                                                                        id="accountNumber"
                                                                                                        name="accountNumber"
                                                                                                        inputMode="numeric"
                                                                                                        value={bankDetails.accountNumber}
                                                                                                        onChange={handleBankChange}
                                                                                                        placeholder="Enter account number"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                                                                                                <Input
                                                                                                        id="confirmAccountNumber"
                                                                                                        name="confirmAccountNumber"
                                                                                                        inputMode="numeric"
                                                                                                        value={bankDetails.confirmAccountNumber}
                                                                                                        onChange={handleBankChange}
                                                                                                        placeholder="Re-enter account number"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="ifscCode">IFSC Code</Label>
                                                                                                <Input
                                                                                                        id="ifscCode"
                                                                                                        name="ifscCode"
                                                                                                        value={bankDetails.ifscCode}
                                                                                                        onChange={handleBankChange}
                                                                                                        placeholder="SBIN0001234"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="bankName">Bank Name</Label>
                                                                                                <Input
                                                                                                        id="bankName"
                                                                                                        name="bankName"
                                                                                                        value={bankDetails.bankName}
                                                                                                        onChange={handleBankChange}
                                                                                                        placeholder="Bank name"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                        <div className="space-y-2">
                                                                                                <Label htmlFor="branchName">Branch Name</Label>
                                                                                                <Input
                                                                                                        id="branchName"
                                                                                                        name="branchName"
                                                                                                        value={bankDetails.branchName}
                                                                                                        onChange={handleBankChange}
                                                                                                        placeholder="Branch name"
                                                                                                        required
                                                                                                />
                                                                                        </div>
                                                                                </div>
                                                                        )}

                                                                        <div className="flex items-center justify-between gap-4">
                                                                                {step > 0 ? (
                                                                                        <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                onClick={handleBack}
                                                                                                className="flex-1"
                                                                                                disabled={isLoading}
                                                                                        >
                                                                                                Back
                                                                                        </Button>
                                                                                ) : (
                                                                                        <div />
                                                                                )}
                                                                                <Button
                                                                                        type="submit"
                                                                                        className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                                                                                        disabled={isLoading}
                                                                                >
                                                                                        {isLoading ? (
                                                                                                <>
                                                                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                                        Processing...
                                                                                                </>
                                                                                        ) : step === steps.length - 1 ? (
                                                                                                "Create Account"
                                                                                        ) : step === 0 ? (
                                                                                                "Continue to Company Details"
                                                                                        ) : (
                                                                                                "Continue to Bank Details"
                                                                                        )}
                                                                                </Button>
                                                                        </div>
                                                                </form>
                                                        </CardContent>
                                                </Card>
                                        </motion.div>
                                </div>
                        </motion.div>
                </div>
        );
}
