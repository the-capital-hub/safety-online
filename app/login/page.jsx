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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore, useIsAuthenticated } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Mail, Phone, ArrowLeft } from "lucide-react";
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";
import { z } from "zod";

const PasswordLoginSchema = z.object({
	emailOrMobile: z.string().trim().min(3, "Enter email or mobile"),
	password: z.string().min(1, "Password is required"),
});

const LoginIdentifierSchema = z.object({
	emailOrMobile: z.string().trim().min(3, "Enter email or mobile"),
});

const CodeSchema = z.object({
	code: z.string().trim().length(6, "Enter 6-digit code"),
});

const LoginPage = () => {
        const [activeTab, setActiveTab] = useState("password");
        const [hasHydrated, setHasHydrated] = useState(false);

	// Password login
	const [emailOrMobile, setEmailOrMobile] = useState("");
	const [password, setPassword] = useState("");

	// OTP login
	const [identifier, setIdentifier] = useState("");
	const [otpStep, setOtpStep] = useState(1);
	const [code, setCode] = useState("");
	const [resendTimer, setResendTimer] = useState(0);
	const [isResending, setIsResending] = useState(false);

	const [isLoading, setIsLoading] = useState(false);
        const { setUser } = useAuthStore();
        const isAuthenticated = useIsAuthenticated();
        const router = useRouter();

        useEffect(() => {
                if (resendTimer > 0) {
                        const t = setInterval(() => setResendTimer((s) => s - 1), 1000);
                        return () => clearInterval(t);
                }
        }, [resendTimer]);

        useEffect(() => {
                const persist = useAuthStore.persist;

                if (!persist?.hasHydrated) {
                        setHasHydrated(true);
                        return;
                }

                if (persist.hasHydrated()) {
                        setHasHydrated(true);
                }

                const unsub = persist.onFinishHydration?.(() => {
                        setHasHydrated(true);
                });

                return () => {
                        if (typeof unsub === "function") {
                                unsub();
                        }
                };
        }, []);

        useEffect(() => {
                if (hasHydrated && isAuthenticated) {
                        router.replace("/account/profile");
                }
        }, [hasHydrated, isAuthenticated, router]);

        useEffect(() => {
                if (activeTab === "otp") {
                        setOtpStep(1);
                        setCode("");
                        setResendTimer(0);
		}
	}, [activeTab]);

	const handlePasswordLogin = async (e) => {
		e.preventDefault();
		const parsed = PasswordLoginSchema.safeParse({ emailOrMobile, password });
		if (!parsed.success) {
			toast.error(parsed.error.issues?.[0]?.message || "Invalid input");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsed.data),
			});
			const data = await response.json();
			if (response.ok) {
				const me = await fetch("/api/auth/me");
				if (me.ok) {
					const { user } = await me.json();
					setUser(user);
				}
				toast.success("Login successful!");
				router.push("/");
			} else {
				toast.error(data.message || "Login failed");
			}
		} catch (err) {
			console.error(err);
			toast.error("An error occurred during login");
		} finally {
			setIsLoading(false);
		}
	};

	const sendOtpForLogin = async (e) => {
		e.preventDefault();
		const parsed = LoginIdentifierSchema.safeParse({
			emailOrMobile: identifier,
		});
		if (!parsed.success) {
			toast.error(parsed.error.issues?.[0]?.message || "Invalid input");
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/login/send-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsed.data),
			});
			const data = await res.json();
			if (res.ok) {
				toast.success("Verification code sent to your mobile");
				setOtpStep(2);
				setResendTimer(40);
			} else {
				// Shows "Please add mobile number first" when applicable
				toast.error(data.message || "Failed to send verification code");
			}
		} catch (err) {
			console.error("send-otp error", err);
			toast.error("Failed to send verification code");
		} finally {
			setIsLoading(false);
		}
	};

	const handleOtpLogin = async (e) => {
		e.preventDefault();
		const parsedCode = CodeSchema.safeParse({ code });
		if (!parsedCode.success) {
			toast.error(parsedCode.error.issues?.[0]?.message || "Invalid code");
			return;
		}
		const parsedId = LoginIdentifierSchema.safeParse({
			emailOrMobile: identifier,
		});
		if (!parsedId.success) {
			toast.error(parsedId.error.issues?.[0]?.message || "Invalid input");
			return;
		}

		setIsLoading(true);
		try {
			const res = await fetch("/api/auth/login-otp", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...parsedId.data, ...parsedCode.data }),
			});
			const data = await res.json();
			if (res.ok) {
				// Get user data from token
				const userResponse = await fetch("/api/auth/me");
				if (userResponse.ok) {
					const userData = await userResponse.json();
					setUser(userData.user);
				}
				toast.success("Login successful!");
				router.push("/");
			} else {
				toast.error(data.message || "Invalid verification code");
			}
		} catch (err) {
			console.error("login-otp error", err);
			toast.error("Failed to sign in");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResend = async () => {
		if (resendTimer > 0) return;
		try {
			setIsResending(true);
			await sendOtpForLogin(new Event("submit"));
			setResendTimer(40);
		} catch {
			// no-op
		} finally {
			setIsResending(false);
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
		hidden: { scale: 0.8, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: { duration: 0.5, ease: "easeOut" },
		},
	};

        if (!hasHydrated) {
                return (
                        <div className="flex h-screen items-center justify-center bg-white">
                                <p className="text-gray-600">Loading...</p>
                        </div>
                );
        }

        if (isAuthenticated) {
                return (
                        <div className="flex h-screen items-center justify-center bg-white">
                                <p className="text-gray-600">Redirecting to your account...</p>
                        </div>
                );
        }

        return (
                <div className="max-w-7xl mx-auto h-screen grid grid-cols-2 lg:px-10">
			{/* Left side */}
			<motion.div
				className="hidden lg:flex justify-center items-center overflow-hidden p-8"
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
							SAFETY AND EFFICIENCY
						</motion.h1>
						<motion.p
							className="text-gray-600 lg:text-xl font-medium tracking-wider text-center"
							variants={itemVariants}
						>
							HAND-IN-HAND.
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
								src={
									LoginModel.src ||
									"/placeholder.svg?height=400&width=400&query=login-model"
								}
								alt="Worker"
								width={400}
								height={400}
								className="w-full h-full object-cover"
							/>
						</motion.div>
					</div>
				</div>
			</motion.div>

			{/* Right side */}
			<motion.div
				className="col-span-2 md:col-span-1 flex-1 flex md:items-center justify-center p-8 bg-white"
				initial={{ x: 100, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
			>
				<div className="w-full max-w-md">
					<motion.div
						className="text-center mb-8"
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
										Sign In
									</CardTitle>
								</motion.div>
								<motion.div variants={itemVariants}>
									<CardDescription className="text-gray-600">
										I don't have an account?{" "}
										<Link
											href="/signup"
											className="text-black hover:text-blue-700 font-medium underline"
										>
											Create Account
										</Link>
									</CardDescription>
								</motion.div>
							</CardHeader>

							<CardContent className="p-0">
								<Tabs value={activeTab} onValueChange={setActiveTab}>
									<motion.div variants={itemVariants}>
										<TabsList className="grid w-full grid-cols-2 mb-6">
											<TabsTrigger
												value="password"
												className="flex items-center gap-2"
											>
												<Mail className="w-4 h-4" /> Password
											</TabsTrigger>
											<TabsTrigger
												value="otp"
												className="flex items-center gap-2"
											>
												<Phone className="w-4 h-4" /> Mobile OTP
											</TabsTrigger>
										</TabsList>
									</motion.div>

									<TabsContent value="password">
										<form onSubmit={handlePasswordLogin} className="space-y-6">
											<motion.div variants={itemVariants} className="space-y-2">
												<Label
													htmlFor="emailOrMobile"
													className="text-gray-700 font-medium"
												>
													Email or Mobile
												</Label>
												<Input
													id="emailOrMobile"
													placeholder="Enter Email or 10-digit Mobile"
													type="text"
													value={emailOrMobile}
													onChange={(e) => setEmailOrMobile(e.target.value)}
													className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
													required
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
													placeholder="Enter Password"
													type="password"
													value={password}
                                                                                onChange={(e) => setPassword(e.target.value)}
                                                                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                                                required
                                                                        />
                                                                </motion.div>

                                                                <motion.div variants={itemVariants} className="flex justify-end">
                                                                        <Link
                                                                                href="/forgot-password"
                                                                                className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                                                                        >
                                                                                Forgot password?
                                                                        </Link>
                                                                </motion.div>

                                                                <motion.div variants={itemVariants}>
                                                                        <Button
                                                                                type="submit"
                                                                                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium text-base relative"
													disabled={isLoading}
												>
													{isLoading ? (
														<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
													) : (
														"Sign In"
													)}
												</Button>
											</motion.div>
										</form>
									</TabsContent>

									<TabsContent value="otp">
										{otpStep === 1 ? (
											<form onSubmit={sendOtpForLogin} className="space-y-6">
												<motion.div
													variants={itemVariants}
													className="space-y-2"
												>
													<Label
														htmlFor="identifier"
														className="text-gray-700 font-medium"
													>
														Email or Mobile
													</Label>
													<Input
														id="identifier"
														placeholder="Enter Email or 10-digit Mobile"
														type="text"
														value={identifier}
														onChange={(e) => setIdentifier(e.target.value)}
														className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
														required
													/>
													<p className="text-xs text-gray-500">
														We will send an OTP to your registered mobile
														number.
													</p>
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
											<form onSubmit={handleOtpLogin} className="space-y-6">
												<motion.div
													variants={itemVariants}
													className="space-y-2"
												>
													<div className="flex items-center gap-2 mb-4">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => {
																setOtpStep(1);
																setCode("");
																setResendTimer(0);
															}}
															className="p-1"
														>
															<ArrowLeft className="w-4 h-4" />
														</Button>
														<span className="text-sm text-gray-600">
															Code sent to your registered mobile
														</span>
													</div>
													<Label
														htmlFor="code"
														className="text-gray-700 font-medium"
													>
														Verification Code
													</Label>
													<Input
														id="code"
														placeholder="Enter 6-digit code"
														value={code}
														onChange={(e) =>
															setCode(
																e.target.value.replace(/\D/g, "").slice(0, 6)
															)
														}
														className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-center text-lg tracking-widest"
														maxLength={6}
														inputMode="numeric"
														pattern="[0-9]*"
														required
													/>
												</motion.div>

												<motion.div
													variants={itemVariants}
													className="flex justify-center"
												>
													{resendTimer > 0 ? (
														<p className="text-sm text-gray-600">
															Resend code in {resendTimer}s
														</p>
													) : (
														<Button
															type="button"
															variant="link"
															className="p-0 h-auto"
															disabled={isResending}
															onClick={handleResend}
														>
															{isResending ? (
																<div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
															) : (
																"Resend Verification Code"
															)}
														</Button>
													)}
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
															"Verify & Sign In"
														)}
													</Button>
												</motion.div>
											</form>
										)}
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
};

export default LoginPage;
