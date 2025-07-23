"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";

const SignupPage = () => {
	const [step, setStep] = useState(1); // 1: signup form, 2: email verification
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
	const router = useRouter();

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSendVerification = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			toast.error("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/send-code", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: formData.email }),
			});

			const data = await response.json();

			if (response.ok) {
				toast.success("Verification code sent to your email!");
				setStep(2);
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
		setIsLoading(true);

		try {
			// First verify the email
			const verifyResponse = await fetch("/api/auth/verify-code", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: formData.email,
					code: verificationCode,
				}),
			});

			const verifyData = await verifyResponse.json();

			if (verifyResponse.ok) {
				// If verification successful, proceed with signup
				const signupResponse = await fetch("/api/auth/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						firstName: formData.firstName,
						lastName: formData.lastName,
						email: formData.email,
						mobile: formData.mobile,
						password: formData.password,
					}),
				});

				const signupData = await signupResponse.json();

				if (signupResponse.ok) {
					toast.success("Account created successfully!");
					router.push("/login");
				} else {
					toast.error(signupData.message || "Signup failed");
				}
			} else {
				toast.error(verifyData.message || "Invalid verification code");
			}
		} catch (error) {
			toast.error("An error occurred during signup");
			console.error("Signup error:", error);
		} finally {
			setIsLoading(false);
		}
	};

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
						className="text-center mb-8"
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
							<CardHeader className="space-y-1 p-0 mb-6">
								<motion.div variants={itemVariants}>
									<CardTitle className="text-2xl font-bold text-gray-800">
										{step === 1 ? "Create Account" : "Verify Email"}
									</CardTitle>
								</motion.div>
								<motion.div variants={itemVariants}>
									<CardDescription className="text-gray-600">
										{step === 1 ? (
											<>
												Already have an account?{" "}
												<Link
													href="/login"
													className="text-black hover:text-blue-700 font-medium underline"
												>
													Sign In
												</Link>
											</>
										) : (
											"Enter the verification code sent to your email"
										)}
									</CardDescription>
								</motion.div>
							</CardHeader>

							<CardContent className="p-0">
								{step === 1 ? (
									<form onSubmit={handleSendVerification} className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<motion.div variants={itemVariants} className="space-y-2">
												<Label
													htmlFor="firstName"
													className="text-gray-700 font-medium"
												>
													First Name
												</Label>
												<Input
													id="firstName"
													name="firstName"
													placeholder="First Name"
													value={formData.firstName}
													onChange={handleInputChange}
													className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
													required
												/>
											</motion.div>
											<motion.div variants={itemVariants} className="space-y-2">
												<Label
													htmlFor="lastName"
													className="text-gray-700 font-medium"
												>
													Last Name
												</Label>
												<Input
													id="lastName"
													name="lastName"
													placeholder="Last Name"
													value={formData.lastName}
													onChange={handleInputChange}
													className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
													required
												/>
											</motion.div>
										</div>

										<motion.div variants={itemVariants} className="space-y-2">
											<Label
												htmlFor="email"
												className="text-gray-700 font-medium"
											>
												Email Address
											</Label>
											<Input
												id="email"
												name="email"
												type="email"
												placeholder="Enter Email Address"
												value={formData.email}
												onChange={handleInputChange}
												className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
												required
											/>
										</motion.div>

										<motion.div variants={itemVariants} className="space-y-2">
											<Label
												htmlFor="mobile"
												className="text-gray-700 font-medium"
											>
												Mobile Number (Optional)
											</Label>
											<Input
												id="mobile"
												name="mobile"
												type="tel"
												placeholder="Enter Mobile Number"
												value={formData.mobile}
												onChange={handleInputChange}
												className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
											/>
										</motion.div>

										<motion.div variants={itemVariants} className="space-y-2">
											<Label
												htmlFor="password"
												className="text-gray-700 font-medium"
											>
												Password
											</Label>
											<Input
												id="password"
												name="password"
												type="password"
												placeholder="Enter Password"
												value={formData.password}
												onChange={handleInputChange}
												className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
												required
											/>
										</motion.div>

										<motion.div variants={itemVariants} className="space-y-2">
											<Label
												htmlFor="confirmPassword"
												className="text-gray-700 font-medium"
											>
												Confirm Password
											</Label>
											<Input
												id="confirmPassword"
												name="confirmPassword"
												type="password"
												placeholder="Confirm Password"
												value={formData.confirmPassword}
												onChange={handleInputChange}
												className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
												required
											/>
										</motion.div>

										<motion.div variants={itemVariants}>
											<Button
												type="submit"
												className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium text-base"
												disabled={isLoading}
											>
												{isLoading ? (
													<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												) : (
													"Send Verification Code"
												)}
											</Button>
										</motion.div>
									</form>
								) : (
									<form onSubmit={handleVerifyAndSignup} className="space-y-6">
										<motion.div variants={itemVariants} className="space-y-2">
											<Label
												htmlFor="verificationCode"
												className="text-gray-700 font-medium"
											>
												Verification Code
											</Label>
											<Input
												id="verificationCode"
												placeholder="Enter 6-digit code"
												value={verificationCode}
												onChange={(e) => setVerificationCode(e.target.value)}
												className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest"
												maxLength={6}
												required
											/>
										</motion.div>

										<motion.div variants={itemVariants} className="flex gap-4">
											<Button
												type="button"
												variant="outline"
												className="flex-1 h-12 bg-transparent"
												onClick={() => setStep(1)}
											>
												Back
											</Button>
											<Button
												type="submit"
												className="flex-1 h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium text-base"
												disabled={isLoading}
											>
												{isLoading ? (
													<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
	);
};

export default SignupPage;
