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
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";

const LoginPage = () => {
	const [emailOrMobile, setEmailOrMobile] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { setUser } = useAuthStore();
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ emailOrMobile, password }),
			});

			const data = await response.json();

			if (response.ok) {
				// Get user data from token (you might want to create a separate API to get user profile)
				const userResponse = await fetch("/api/auth/me");
				if (userResponse.ok) {
					const userData = await userResponse.json();
					setUser(userData.user);
				}

				toast.success("Login successful!");
				router.push("/"); // Redirect to dashboard or home page
			} else {
				toast.error(data.message || "Login failed");
			}
		} catch (error) {
			toast.error("An error occurred during login");
			console.error("Login error:", error);
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

	const logoVariants = {
		hidden: { scale: 0.8, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.5,
				ease: "easeOut",
			},
		},
	};

	return (
		<div className="max-w-7xl mx-auto h-screen grid grid-cols-2 lg:px-10">
			{/* Left side - Image and branding */}
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
								src={LoginModel.src}
								alt="Worker"
								width={400}
								height={400}
								className="w-full h-full object-cover"
							/>
						</motion.div>
					</div>
				</div>
			</motion.div>

			{/* Right side - Login form */}
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
								<form onSubmit={handleSubmit} className="space-y-6">
									<motion.div variants={itemVariants} className="space-y-2">
										<Label
											htmlFor="emailOrMobile"
											className="text-gray-700 font-medium"
										>
											Enter Email or Phone Number
										</Label>
										<Input
											id="emailOrMobile"
											placeholder="Enter Email or Phone Number"
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

									<motion.div variants={itemVariants}>
										<Button
											type="submit"
											className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium text-base"
											disabled={isLoading}
										>
											<motion.span
												animate={isLoading ? { opacity: 0 } : { opacity: 1 }}
												transition={{ duration: 0.2 }}
											>
												Sign In
											</motion.span>
											{isLoading && (
												<motion.div
													className="absolute inset-0 flex items-center justify-center"
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ duration: 0.2 }}
												>
													<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												</motion.div>
											)}
										</Button>
									</motion.div>
								</form>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
};

export default LoginPage;
