"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";
import { z } from "zod";

const SignupSchema = z
	.object({
		firstName: z.string().trim().min(1, "First name is required"),
		lastName: z.string().trim().min(1, "Last name is required"),
		email: z.string().trim().email("Valid email is required"),
		mobile: z
			.string()
			.trim()
			.regex(/^\d{10}$/, "Mobile must be 10 digits"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(6),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

const CodeSchema = z.object({
	code: z.string().trim().length(6, "Enter 6-digit code"),
});

const SignupPage = () => {
	const [step, setStep] = useState(1); // 1: form, 2: mobile verification
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		mobile: "",
		password: "",
		confirmPassword: "",
	});
	const [verificationCode, setVerificationCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [resendTimer, setResendTimer] = useState(0);
	const router = useRouter();

	useEffect(() => {
		if (resendTimer > 0) {
			const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
			return () => clearInterval(t);
		}
	}, [resendTimer]);

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSendVerification = async (e) => {
		e.preventDefault();

		const parsed = SignupSchema.safeParse(formData);
		if (!parsed.success) {
			toast.error(
				parsed.error.issues?.[0]?.message || "Please check your details"
			);
			return;
		}

		setIsLoading(true);
		try {
			// Send OTP to mobile
                        const response = await fetch("/api/auth/send-otp", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                        email: parsed.data.email.toLowerCase(),
                                        mobile: parsed.data.mobile,
                                }),
                        });

			const data = await response.json();
			if (response.ok) {
				toast.success("Verification code sent to your mobile!");
				setStep(2);
				setResendTimer(40);
			} else {
				toast.error(data.message || "Failed to send verification code");
			}
		} catch (error) {
			toast.error("An error occurred while sending verification code");
			console.error("Verification error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyAndSignup = async (e) => {
		e.preventDefault();
		const parsed = SignupSchema.safeParse(formData);
		if (!parsed.success) {
			toast.error(
				parsed.error.issues?.[0]?.message || "Please check your details"
			);
			return;
		}
		const parsedCode = CodeSchema.safeParse({ code: verificationCode });
		if (!parsedCode.success) {
			toast.error(parsedCode.error.issues?.[0]?.message || "Invalid code");
			return;
		}

		setIsLoading(true);
		try {
			// Verify mobile OTP
			const verifyResponse = await fetch("/api/auth/verify-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					mobile: parsed.data.mobile,
					code: parsedCode.data.code,
				}),
			});
			const verifyData = await verifyResponse.json();

			if (!verifyResponse.ok) {
				toast.error(verifyData.message || "Invalid verification code");
				setIsLoading(false);
				return;
			}

			// Create account (email + mobile required)
			const signupResponse = await fetch("/api/auth/signup", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					firstName: parsed.data.firstName,
					lastName: parsed.data.lastName,
					email: parsed.data.email.toLowerCase(),
					mobile: parsed.data.mobile,
					password: parsed.data.password,
				}),
			});

			const signupData = await signupResponse.json();
			if (signupResponse.ok) {
				toast.success("Account created successfully!");
				router.push("/login");
			} else {
				toast.error(signupData.message || "Signup failed");
			}
		} catch (error) {
			toast.error("An error occurred during signup");
			console.error("Signup error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = async () => {
		if (resendTimer > 0) return;
		try {
			setIsLoading(true);
                        const response = await fetch("/api/auth/send-otp", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                        email: formData.email.trim().toLowerCase(),
                                        mobile: formData.mobile.trim(),
                                }),
                        });
			const data = await response.json();
			if (response.ok) {
				toast.success("Verification code resent");
				setResendTimer(40);
			} else {
				toast.error(data.message || "Failed to resend code");
			}
		} catch (err) {
			toast.error("Failed to resend code");
		} finally {
			setIsLoading(false);
		}
	};

        const containerVariants = {
                hidden: { opacity: 0 },
                visible: {
                        opacity: 1,
                        transition: { duration: 0.6, staggerChildren: 0.1 },
                },
        };
        const itemVariants = {
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
        };
        const logoVariants = {
                hidden: { scale: 0.85, opacity: 0 },
                visible: {
                        scale: 1,
                        opacity: 1,
                        transition: { duration: 0.5, ease: "easeOut" },
                },
        };

        return (
                <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
                        <div className="max-w-7xl mx-auto grid min-h-screen grid-cols-1 lg:grid-cols-2 lg:px-10">
                                {/* Left side */}
                                <motion.div
                                        className="hidden lg:flex items-center justify-center overflow-hidden p-8"
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                        <div className="w-full max-w-xl rounded-3xl bg-white/70 p-10 shadow-xl backdrop-blur">
                                                <motion.div
                                                        className="w-full text-center"
                                                        variants={containerVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                >
                                                        <motion.h1
                                                                className="text-3xl font-bold tracking-tight text-gray-800"
                                                                variants={itemVariants}
                                                        >
                                                                Join Our Community
                                                        </motion.h1>
                                                        <motion.p
                                                                className="mt-3 text-base font-medium uppercase tracking-[0.35em] text-gray-600"
                                                                variants={itemVariants}
                                                        >
                                                                Start your journey today
                                                        </motion.p>
                                                </motion.div>

                                                <div className="mt-8 flex items-center justify-center">
                                                        <motion.div
                                                                initial={{ scale: 0.9, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                transition={{ duration: 1, delay: 0.3 }}
                                                                className="w-full max-w-[420px] overflow-hidden"
                                                        >
                                                                <Image
                                                                        src={
                                                                                LoginModel.src ||
                                                                                "/placeholder.svg?height=420&width=420&query=signup-model"
                                                                        }
                                                                        alt="Welcome"
                                                                        width={420}
                                                                        height={420}
                                                                        className="h-full w-full object-cover"
                                                                />
                                                        </motion.div>
                                                </div>
                                        </div>
                                </motion.div>

                                {/* Right side */}
                                <motion.div
                                        className="flex flex-1 flex-col justify-center bg-white px-6 py-12 sm:px-10 md:py-16"
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                >
                                        <div className="mx-auto w-full max-w-md">
                                                <motion.div
                                                        className="mb-10 text-center"
                                                        variants={logoVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                >
                                                        <Image
                                                                src={
                                                                        Logo.src ||
                                                                        "/placeholder.svg?height=100&width=100&query=brand-logo"
                                                                }
                                                                alt="Logo"
                                                                width={100}
                                                                height={100}
                                                                className="mx-auto h-auto w-[100px] object-cover"
                                                        />
                                                </motion.div>

                                                <motion.div
                                                        variants={containerVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                >
                                                        <Card className="rounded-3xl border border-gray-100 bg-white/90 p-6 shadow-xl shadow-gray-200/60">
                                                                <CardHeader className="mb-6 space-y-2 p-0 text-center sm:text-left">
                                                                        <motion.div variants={itemVariants}>
                                                                                <CardTitle className="text-3xl font-semibold text-gray-900">
                                                                                        {step === 1 ? "Create Account" : "Verify Mobile"}
                                                                                </CardTitle>
                                                                        </motion.div>
                                                                        <motion.div variants={itemVariants}>
                                                                                <CardDescription className="text-sm text-gray-600">
                                                                                        {step === 1 ? (
                                                                                                <>
                                                                                                        Already have an account?{" "}
                                                                                                        <Link
                                                                                                                href="/login"
                                                                                                                className="font-medium text-gray-900 underline underline-offset-4 transition-colors hover:text-blue-700"
                                                                                                        >
                                                                                                                Sign In
                                                                                                        </Link>
                                                                                                </>
                                                                                        ) : (
                                                                                                "Enter the verification code sent to your mobile"
                                                                                        )}
                                                                                </CardDescription>
                                                                        </motion.div>
                                                                </CardHeader>

                                                                <CardContent className="space-y-6 p-0">
                                                                        {step === 1 ? (
                                                                                <form onSubmit={handleSendVerification} className="space-y-6">
                                                                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                                                                <motion.div variants={itemVariants} className="space-y-2">
                                                                                                        <Label htmlFor="firstName" className="text-gray-700 font-medium">
                                                                                                                First Name
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="firstName"
                                                                                                                name="firstName"
                                                                                                                placeholder="First Name"
                                                                                                                value={formData.firstName}
                                                                                                                onChange={handleInputChange}
                                                                                                                className="h-12 rounded-xl border-gray-300/80 bg-white focus:border-blue-500 focus:ring-blue-500"
                                                                                                                required
                                                                                                        />
                                                                                                </motion.div>
                                                                                                <motion.div variants={itemVariants} className="space-y-2">
                                                                                                        <Label htmlFor="lastName" className="text-gray-700 font-medium">
                                                                                                                Last Name
                                                                                                        </Label>
                                                                                                        <Input
                                                                                                                id="lastName"
                                                                                                                name="lastName"
                                                                                                                placeholder="Last Name"
                                                                                                                value={formData.lastName}
                                                                                                                onChange={handleInputChange}
                                                                                                                className="h-12 rounded-xl border-gray-300/80 bg-white focus:border-blue-500 focus:ring-blue-500"
                                                                                                                required
                                                                                                        />
                                                                                                </motion.div>
                                                                                        </div>

                                                                                        <motion.div variants={itemVariants} className="space-y-2">
                                                                                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                                                                                        Email Address
                                                                                                </Label>
                                                                                                <Input
                                                                                                        id="email"
                                                                                                        name="email"
                                                                                                        type="email"
                                                                                                        placeholder="Enter Email Address"
                                                                                                        value={formData.email}
                                                                                                        onChange={handleInputChange}
                                                                                                        className="h-12 rounded-xl border-gray-300/80 bg-white focus:border-blue-500 focus:ring-blue-500"
                                                                                                        required
                                                                                                />
                                                                                        </motion.div>

                                                                                        <motion.div variants={itemVariants} className="space-y-2">
                                                                                                <Label htmlFor="mobile" className="text-gray-700 font-medium">
                                                                                                        Mobile Number
                                                                                                </Label>
                                                                                                <Input
                                                                                                        id="mobile"
                                                                                                        name="mobile"
                                                                                                        type="tel"
                                                                                                        placeholder="Enter Mobile Number"
                                                                                                        value={formData.mobile}
                                                                                                        onChange={handleInputChange}
                                                                                                        className="h-12 rounded-xl border-gray-300/80 bg-white focus:border-blue-500 focus:ring-blue-500"
                                                                                                        required
                                                                                                />
                                                                                        </motion.div>

                                                                                        <motion.div variants={itemVariants} className="space-y-2">
                                                                                                <Label htmlFor="password" className="text-gray-700 font-medium">
                                                                                                        Password
                                                                                                </Label>
                                                                                                <Input
                                                                                                        id="password"
                                                                                                        name="password"
                                                                                                        type="password"
                                                                                                        placeholder="Enter Password"
                                                                                                        value={formData.password}
                                                                                                        onChange={handleInputChange}
                                                                                                        className="h-12 rounded-xl border-gray-300/80 bg-white focus:border-blue-500 focus:ring-blue-500"
                                                                                                        required
                                                                                                />
                                                                                        </motion.div>

                                                                                        <motion.div variants={itemVariants} className="space-y-2">
                                                                                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                                                                                        Confirm Password
                                                                                                </Label>
                                                                                                <Input
                                                                                                        id="confirmPassword"
                                                                                                        name="confirmPassword"
                                                                                                        type="password"
                                                                                                        placeholder="Confirm Password"
                                                                                                        value={formData.confirmPassword}
                                                                                                        onChange={handleInputChange}
                                                                                                        className="h-12 rounded-xl border-gray-300/80 bg-white focus:border-blue-500 focus:ring-blue-500"
                                                                                                        required
                                                                                                />
                                                                                        </motion.div>

                                                                                        <motion.div variants={itemVariants}>
                                                                                                <Button
                                                                                                        type="submit"
                                                                                                        className="h-12 w-full rounded-xl bg-gray-900 text-base font-medium text-white shadow-lg shadow-gray-300/60 transition-transform hover:scale-[1.01] hover:bg-gray-950"
                                                                                                        disabled={isLoading}
                                                                                                >
                                                                                                        {isLoading ? (
                                                                                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                                                                        ) : (
                                                                                                                "Send Verification Code"
                                                                                                        )}
                                                                                                </Button>
                                                                                        </motion.div>
                                                                                </form>
                                                                        ) : (
                                                                                <form onSubmit={handleVerifyAndSignup} className="space-y-6">
                                                                                        <motion.div variants={itemVariants} className="space-y-2">
                                                                                                <Label htmlFor="verificationCode" className="text-gray-700 font-medium">
                                                                                                        Verification Code
                                                                                                </Label>
                                                                                                <Input
                                                                                                        id="verificationCode"
                                                                                                        placeholder="Enter 6-digit code"
                                                                                                        value={verificationCode}
                                                                                                        onChange={(e) =>
                                                                                                                setVerificationCode(
                                                                                                                        e.target.value.replace(/\D/g, "").slice(0, 6)
                                                                                                                )
                                                                                                        }
                                                                                                        className="h-12 rounded-xl border-gray-300/80 bg-white text-center text-lg tracking-widest focus:border-blue-500 focus:ring-blue-500"
                                                                                                        maxLength={6}
                                                                                                        inputMode="numeric"
                                                                                                        pattern="[0-9]*"
                                                                                                        required
                                                                                                />
                                                                                        </motion.div>

                                                                                        <motion.div variants={itemVariants} className="flex justify-center">
                                                                                                {resendTimer > 0 ? (
                                                                                                        <p className="text-sm text-gray-600">
                                                                                                                Resend code in {resendTimer}s
                                                                                                        </p>
                                                                                                ) : (
                                                                                                        <Button
                                                                                                                type="button"
                                                                                                                variant="link"
                                                                                                                className="p-0 text-sm font-medium text-gray-900 hover:text-blue-700"
                                                                                                                onClick={handleResend}
                                                                                                        >
                                                                                                                Resend Verification Code
                                                                                                        </Button>
                                                                                                )}
                                                                                        </motion.div>

                                                                                        <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                                                                                                <Button
                                                                                                        type="button"
                                                                                                        variant="outline"
                                                                                                        className="h-12 flex-1 rounded-xl border-gray-300/80 bg-white text-gray-700 transition-colors hover:bg-gray-100"
                                                                                                        onClick={() => setStep(1)}
                                                                                                >
                                                                                                        Back
                                                                                                </Button>
                                                                                                <Button
                                                                                                        type="submit"
                                                                                                        className="h-12 flex-1 rounded-xl bg-gray-900 text-base font-medium text-white shadow-lg shadow-gray-300/60 transition-transform hover:scale-[1.01] hover:bg-gray-950"
                                                                                                        disabled={isLoading}
                                                                                                >
                                                                                                        {isLoading ? (
                                                                                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                                                                        ) : (
                                                                                                                "Create Account"
                                                                                                        )}
                                                                                                </Button>
                                                                                        </motion.div>
                                                                                </form>
                                                                        )}
                                                                </CardContent>
						</Card>
					</motion.div>
				</div>
                        </motion.div>
                </div>
        </div>
        );
};

export default SignupPage;
