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
                <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
                        <div className="pointer-events-none absolute inset-0">
                                <div className="absolute -top-32 -left-40 h-72 w-72 rounded-full bg-orange-500/40 blur-3xl" />
                                <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
                                <div className="absolute bottom-0 left-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-slate-500/30 blur-3xl" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
                        </div>

                        <div className="relative z-10 flex min-h-screen flex-col-reverse gap-12 px-6 py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,460px)] lg:px-12 lg:py-12">
                                {/* Left - inspiration */}
                                <motion.section
                                        className="flex flex-1 flex-col justify-between gap-12"
                                        initial={{ x: -80, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                        <motion.div
                                                className="max-w-xl space-y-8"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                        >
                                                <motion.div
                                                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-orange-200 backdrop-blur"
                                                        variants={itemVariants}
                                                >
                                                        <span className="h-2 w-2 rounded-full bg-orange-400" />
                                                        Seller onboarding
                                                </motion.div>
                                                <motion.h1
                                                        className="text-4xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl"
                                                        variants={itemVariants}
                                                >
                                                        Launch your Safety Online storefront with confidence and heart.
                                                </motion.h1>
                                                <motion.p
                                                        className="text-base text-slate-200 md:text-lg"
                                                        variants={itemVariants}
                                                >
                                                        From compliance-ready catalogues to effortless settlements, our seller portal is designed to mirror the trust and warmth of the Safety Online brand. Complete the guided steps to activate a space where your products feel right at home.
                                                </motion.p>
                                        </motion.div>

                                        <motion.div
                                                className="grid gap-5 md:grid-cols-2"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                        >
                                                {[
                                                        {
                                                                title: "Human-centred support",
                                                                description:
                                                                        "Get real partnership from our specialists the moment you sign up.",
                                                        },
                                                        {
                                                                title: "Brand-safe experiences",
                                                                description:
                                                                        "Showcase your catalogue inside a secure, compliance-first environment.",
                                                        },
                                                        {
                                                                title: "Frictionless payouts",
                                                                description:
                                                                        "Automated reconciliation keeps your cashflow clear and predictable.",
                                                        },
                                                        {
                                                                title: "Insights that inspire",
                                                                description:
                                                                        "Track performance with dashboards tuned to Safety Online priorities.",
                                                        },
                                                ].map((feature) => (
                                                        <motion.div
                                                                key={feature.title}
                                                                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                                                                variants={itemVariants}
                                                        >
                                                                <p className="text-sm font-semibold text-orange-200/80">{feature.title}</p>
                                                                <p className="mt-2 text-sm text-slate-200/90">{feature.description}</p>
                                                        </motion.div>
                                                ))}
                                        </motion.div>
                                </motion.section>

                                {/* Right - form */}
                                <motion.section
                                        className="flex min-h-screen  flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 px-5 py-5 lg:py-5 backdrop-blur-xl"
                                        initial={{ x: 80, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                >
                                        <motion.div
                                                className="flex flex-col items-center gap-3 text-center"
                                                initial={{ scale: 0.85, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                        >
                                                <Image src={Logo.src} alt="Safety Online" width={150} height={172} />
                                                <div>
                                                        <p className="text-xs uppercase tracking-[0.4em] text-orange-200/80">Create seller account</p>
                                                        <h2 className="mt-1 lg:text-xl font-semibold text-white">Let's craft your trusted marketplace profile</h2>
                                                </div>
                                        </motion.div>

                                        <div className="mt-2 ">
                                                <motion.div
                                                        className="space-y-4"
                                                        variants={containerVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                >
                                                        <div className="flex flex-col gap-2">
                                                                <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-slate-200/60">
                                                                        <span>Step {step + 1}</span>
                                                                        <span>{progress}% complete</span>
                                                                </div>
                                                                <div className="h-2 w-full rounded-full bg-white/10">
                                                                        <motion.div
                                                                                className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-300 to-sky-400"
                                                                                style={{ width: `${progress}%` }}
                                                                                initial={{ width: 0 }}
                                                                                animate={{ width: `${progress}%` }}
                                                                                transition={{ duration: 0.6, ease: "easeOut" }}
                                                                        />
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                        {steps.map((item, index) => (
                                                                                <div
                                                                                        key={item.title}
                                                                                        className={`flex flex-1 min-w-xl items-center gap-2 rounded-full border px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.3em] ${
                                                                                                index === step
                                                                                                        ? "border-orange-300 bg-orange-300/20 text-orange-100"
                                                                                                        : index < step
                                                                                                        ? "border-emerald-300/60 bg-emerald-300/10 text-emerald-100"
                                                                                                        : "border-white/15 bg-white/5 text-white/50"
                                                                                        }`}
                                                                                >
                                                                                        <p className="grid lg:h-5 lg:w-9 pl-1 w-5 text-center items-center justify-center rounded-full border border-current text-[0.7rem]">
                                                                                                {index + 1}
                                                                                        </p>
                                                                                        <span className="truncate">{item.title}</span>
                                                                                </div>
                                                                        ))}
                                                                </div>
                                                        </div>

                                                        <Card className="border  border-white/10 bg-white/5 p-0 backdrop-blur">
                                                                <CardHeader className="space-y-2 border-b border-white/5 px-6 pb-2 pt-3 text-left">
                                                                        <motion.div variants={itemVariants} className="space-y-1">
                                                                                <CardTitle className="text-xl font-semibold text-white">{steps[step].title}</CardTitle>
                                                                                <CardDescription className="text-xs text-slate-200/80">
                                                                                        {steps[step].description}
                                                                                </CardDescription>
                                                                        </motion.div>
                                                                        <motion.p variants={itemVariants} className="text-xs text-slate-300">
                                                                                Already onboarded?{' '}
                                                                                <Link href="/seller/login" className="font-semibold text-orange-200 hover:text-orange-100">
                                                                                        Sign in
                                                                                </Link>
                                                                        </motion.p>
                                                                </CardHeader>
                                                                <CardContent className="lg:max-h-[calc(100vh-22rem)]  custom-scrollbar overflow-y-auto px-6 lg:py-8 py-">
                                                                        <form onSubmit={handleStepSubmit} className="space-y-6">
                                                                                {step === 0 && (
                                                                                        <div className="space-y-5">
                                                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="firstName" className="text-md text-slate-100">
                                                                                                                        First Name
                                                                                                                </Label>
                                                                                                                <Input
                                                                                                                        id="firstName"
                                                                                                                        name="firstName"
                                                                                                                        type="text"
                                                                                                                        placeholder="First name"
                                                                                                                        value={personalDetails.firstName}
                                                                                                                        onChange={handlePersonalChange}
                                                                                                                        required
                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="lastName" className="text-sm text-slate-100">
                                                                                                                        Last Name
                                                                                                                </Label>
                                                                                                                <Input
                                                                                                                        id="lastName"
                                                                                                                        name="lastName"
                                                                                                                        type="text"
                                                                                                                        placeholder="Last name"
                                                                                                                        value={personalDetails.lastName}
                                                                                                                        onChange={handlePersonalChange}
                                                                                                                        required
                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="email" className="text-sm text-slate-100">
                                                                                                                Email
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="email"
                                                                                                                name="email"
                                                                                                                type="email"
                                                                                                                placeholder="Enter your email"
                                                                                                                value={personalDetails.email}
                                                                                                                onChange={handlePersonalChange}
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="mobile" className="text-sm text-slate-100">
                                                                                                                Mobile Number
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="mobile"
                                                                                                                name="mobile"
                                                                                                                inputMode="tel"
                                                                                                                placeholder="Enter your mobile number"
                                                                                                                value={personalDetails.mobile}
                                                                                                                onChange={handlePersonalChange}
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="password" className="text-sm text-slate-100">
                                                                                                                        Password
                                                                                                                </Label>
                                                                                                                <div className="relative">
                                                                                                                        <Input
                                                                                                                                id="password"
                                                                                                                                name="password"
                                                                                                                                type={showPassword ? "text" : "password"}
                                                                                                                                placeholder="Enter your password"
                                                                                                                                value={personalDetails.password}
                                                                                                                                onChange={handlePersonalChange}
                                                                                                                                required
                                                                                                                                className="border-white/15 bg-white/5 pr-12 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                        />
                                                                                                                        <Button
                                                                                                                                type="button"
                                                                                                                                variant="ghost"
                                                                                                                                size="icon"
                                                                                                                                className="absolute right-1 top-1 h-7 w-7 text-slate-200 hover:bg-transparent"
                                                                                                                                onClick={() => setShowPassword((prev) => !prev)}
                                                                                                                        >
                                                                                                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                                                                        </Button>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="confirmPassword" className="text-sm text-slate-100">
                                                                                                                        Confirm Password
                                                                                                                </Label>
                                                                                                                <div className="relative">
                                                                                                                        <Input
                                                                                                                                id="confirmPassword"
                                                                                                                                name="confirmPassword"
                                                                                                                                type={showConfirmPassword ? "text" : "password"}
                                                                                                                                placeholder="Confirm your password"
                                                                                                                                value={personalDetails.confirmPassword}
                                                                                                                                onChange={handlePersonalChange}
                                                                                                                                required
                                                                                                                                className="border-white/15 bg-white/5 pr-12 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                        />
                                                                                                                        <Button
                                                                                                                                type="button"
                                                                                                                                variant="ghost"
                                                                                                                                size="icon"
                                                                                                                                className="absolute right-1 top-1 h-7 w-7 text-slate-200 hover:bg-transparent"
                                                                                                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                                                                                        >
                                                                                                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                                                                                        </Button>
                                                                                                                </div>
                                                                                                        </div>
                                                                                                </div>
                                                                                        </div>
                                                                                )}

                                                                                {step === 1 && (
                                                                                        <div className="space-y-5">
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="companyName" className="text-sm text-slate-100">
                                                                                                                Company Name
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="companyName"
                                                                                                                name="companyName"
                                                                                                                value={companyDetails.companyName}
                                                                                                                onChange={handleCompanyChange}
                                                                                                                placeholder="Enter your company name"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="companyEmail" className="text-sm text-slate-100">
                                                                                                                Company Email
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="companyEmail"
                                                                                                                name="companyEmail"
                                                                                                                type="email"
                                                                                                                value={companyDetails.companyEmail}
                                                                                                                onChange={handleCompanyChange}
                                                                                                                placeholder="Enter company email"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="phone" className="text-sm text-slate-100">
                                                                                                                Company Phone
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="phone"
                                                                                                                name="phone"
                                                                                                                inputMode="tel"
                                                                                                                value={companyDetails.phone}
                                                                                                                onChange={handleCompanyChange}
                                                                                                                placeholder="Enter company phone"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="brandName" className="text-sm text-slate-100">
                                                                                                                Brand Name
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="brandName"
                                                                                                                name="brandName"
                                                                                                                value={companyDetails.brandName}
                                                                                                                onChange={handleCompanyChange}
                                                                                                                placeholder="Enter your brand name"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="brandDescription" className="text-sm text-slate-100">
                                                                                                                Brand Description
                                                                                                        </Label>
                                                                                                        <Textarea
                                                                                                                id="brandDescription"
                                                                                                                name="brandDescription"
                                                                                                                value={companyDetails.brandDescription}
                                                                                                                onChange={handleCompanyChange}
                                                                                                                placeholder="Describe your brand"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="gstinNumber" className="text-sm text-slate-100">
                                                                                                                GSTIN Number
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="gstinNumber"
                                                                                                                name="gstinNumber"
                                                                                                                value={companyDetails.gstinNumber}
                                                                                                                onChange={handleCompanyChange}
                                                                                                                placeholder="22AAAAA0000A1Z5"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                                                                                                        <div className="flex items-start gap-3">
                                                                                                                <Checkbox
                                                                                                                        id="include-address"
                                                                                                                        checked={includeCompanyAddress}
                                                                                                                        onCheckedChange={(checked) =>
                                                                                                                                setIncludeCompanyAddress(Boolean(checked))
                                                                                                                        }
                                                                                                                        className="border-white/30 data-[state=checked]:bg-orange-400 data-[state=checked]:text-slate-950"
                                                                                                                />
                                                                                                                <Label htmlFor="include-address" className="text-sm text-slate-100">
                                                                                                                        Add primary pickup address now
                                                                                                                </Label>
                                                                                                        </div>

                                                                                                        {includeCompanyAddress && (
                                                                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                                                                        <div className="space-y-2 md:col-span-2">
                                                                                                                                <Label htmlFor="tagName" className="text-sm text-slate-100">
                                                                                                                                        Address Label
                                                                                                                                </Label>
                                                                                                                                <Input
                                                                                                                                        id="tagName"
                                                                                                                                        name="tagName"
                                                                                                                                        value={companyAddress.tagName}
                                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                                        placeholder="Head Office"
                                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                                />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                <Label htmlFor="building" className="text-sm text-slate-100">
                                                                                                                                        Building
                                                                                                                                </Label>
                                                                                                                                <Input
                                                                                                                                        id="building"
                                                                                                                                        name="building"
                                                                                                                                        value={companyAddress.building}
                                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                                        placeholder="Building / Flat"
                                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                                />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                <Label htmlFor="street" className="text-sm text-slate-100">
                                                                                                                                        Street
                                                                                                                                </Label>
                                                                                                                                <Input
                                                                                                                                        id="street"
                                                                                                                                        name="street"
                                                                                                                                        value={companyAddress.street}
                                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                                        placeholder="Street / Area"
                                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                                />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                <Label htmlFor="city" className="text-sm text-slate-100">
                                                                                                                                        City
                                                                                                                                </Label>
                                                                                                                                <Input
                                                                                                                                        id="city"
                                                                                                                                        name="city"
                                                                                                                                        value={companyAddress.city}
                                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                                        placeholder="City"
                                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                                />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                <Label htmlFor="state" className="text-sm text-slate-100">
                                                                                                                                        State
                                                                                                                                </Label>
                                                                                                                                <Input
                                                                                                                                        id="state"
                                                                                                                                        name="state"
                                                                                                                                        value={companyAddress.state}
                                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                                        placeholder="State"
                                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                                />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                <Label htmlFor="pincode" className="text-sm text-slate-100">
                                                                                                                                        Pincode
                                                                                                                                </Label>
                                                                                                                                <Input
                                                                                                                                        id="pincode"
                                                                                                                                        name="pincode"
                                                                                                                                        value={companyAddress.pincode}
                                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                                        placeholder="Postal code"
                                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                                />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                <Label htmlFor="country" className="text-sm text-slate-100">
                                                                                                                                        Country
                                                                                                                                </Label>
                                                                                                                                <Input
                                                                                                                                        id="country"
                                                                                                                                        name="country"
                                                                                                                                        value={companyAddress.country}
                                                                                                                                        onChange={handleCompanyAddressChange}
                                                                                                                                        placeholder="Country"
                                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                                />
                                                                                                                        </div>
                                                                                                                </div>
                                                                                                        )}
                                                                                                </div>
                                                                                        </div>
                                                                                )}

                                                                                {step === 2 && (
                                                                                        <div className="space-y-5">
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="accountHolderName" className="text-sm text-slate-100">
                                                                                                                Account Holder Name
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="accountHolderName"
                                                                                                                name="accountHolderName"
                                                                                                                value={bankDetails.accountHolderName}
                                                                                                                onChange={handleBankChange}
                                                                                                                placeholder="Enter account holder name"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="accountNumber" className="text-sm text-slate-100">
                                                                                                                Account Number
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="accountNumber"
                                                                                                                name="accountNumber"
                                                                                                                inputMode="numeric"
                                                                                                                value={bankDetails.accountNumber}
                                                                                                                onChange={handleBankChange}
                                                                                                                placeholder="Enter account number"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="confirmAccountNumber" className="text-sm text-slate-100">
                                                                                                                Confirm Account Number
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="confirmAccountNumber"
                                                                                                                name="confirmAccountNumber"
                                                                                                                inputMode="numeric"
                                                                                                                value={bankDetails.confirmAccountNumber}
                                                                                                                onChange={handleBankChange}
                                                                                                                placeholder="Re-enter account number"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                                <div className="grid gap-4 md:grid-cols-2">
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="ifscCode" className="text-sm text-slate-100">
                                                                                                                        IFSC Code
                                                                                                                </Label>
                                                                                                                <Input
                                                                                                                        id="ifscCode"
                                                                                                                        name="ifscCode"
                                                                                                                        value={bankDetails.ifscCode}
                                                                                                                        onChange={handleBankChange}
                                                                                                                        placeholder="SBIN0001234"
                                                                                                                        required
                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                />
                                                                                                        </div>
                                                                                                        <div className="space-y-2">
                                                                                                                <Label htmlFor="bankName" className="text-sm text-slate-100">
                                                                                                                        Bank Name
                                                                                                                </Label>
                                                                                                                <Input
                                                                                                                        id="bankName"
                                                                                                                        name="bankName"
                                                                                                                        value={bankDetails.bankName}
                                                                                                                        onChange={handleBankChange}
                                                                                                                        placeholder="Bank name"
                                                                                                                        required
                                                                                                                        className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                                />
                                                                                                        </div>
                                                                                                </div>
                                                                                                <div className="space-y-2">
                                                                                                        <Label htmlFor="branchName" className="text-sm text-slate-100">
                                                                                                                Branch Name
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="branchName"
                                                                                                                name="branchName"
                                                                                                                value={bankDetails.branchName}
                                                                                                                onChange={handleBankChange}
                                                                                                                placeholder="Branch name"
                                                                                                                required
                                                                                                                className="border-white/15 bg-white/5 text-white placeholder:text-slate-300 focus-visible:border-orange-400/60 focus-visible:ring-orange-400"
                                                                                                        />
                                                                                                </div>
                                                                                        </div>
                                                                                )}

                                                                                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                                                                                        {step > 0 ? (
                                                                                                <Button
                                                                                                        type="button"
                                                                                                        variant="outline"
                                                                                                        onClick={handleBack}
                                                                                                        className="flex-1 border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10"
                                                                                                        disabled={isLoading}
                                                                                                >
                                                                                                        Back
                                                                                                </Button>
                                                                                        ) : (
                                                                                                <div className="flex-1" />
                                                                                        )}
                                                                                        <Button
                                                                                                type="submit"
                                                                                                className="flex-1 bg-gradient-to-r from-orange-400 via-orange-300 to-sky-400 text-slate-950 transition hover:brightness-110"
                                                                                                disabled={isLoading}
                                                                                        >
                                                                                                {isLoading ? (
                                                                                                        <>
                                                                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                                                Processing...
                                                                                                        </>
                                                                                                ) : step === steps.length - 1 ? (
                                                                                                        "Create account"
                                                                                                ) : step === 0 ? (
                                                                                                        "Continue to company details"
                                                                                                ) : (
                                                                                                        "Continue to bank details"
                                                                                                )}
                                                                                        </Button>
                                                                                </div>
                                                                        </form>
                                                                </CardContent>
                                                        </Card>
                                                </motion.div>
                                        </div>

                                        <p className="mt-6 text-center text-xs text-slate-300/80">
                                                By continuing you agree to the Safety Online Seller Terms and privacy promise.
                                        </p>
                                </motion.section>
                        </div>
                </div>
        );
}
