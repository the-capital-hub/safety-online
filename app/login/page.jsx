"use client";

import React, { useState } from "react";
import Image from "next/image";
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
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setIsLoading(false);
		console.log("Login attempted with:", { email, password });
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
					{/* Branding text */}
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

					{/* Worker Image */}
					<div className="flex items-center justify-center">
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 1, delay: 0.3 }}
							className="w-full max-w-[400px] h-1/2 overflow-hidden"
						>
							{/* Simulated worker image - replace with actual image */}
							<Image
								src={LoginModel}
								alt="Worker"
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
					{/* Logo */}
					<motion.div
						className="text-center mb-8"
						variants={logoVariants}
						initial="hidden"
						animate="visible"
					>
						<Image
							src={Logo.src}
							alt="Logo"
							width={50}
							height={50}
							className="w-[100] h-auto object-cover"
						/>
					</motion.div>

					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
					>
						<Card className="border-0 shadow-none">
							<CardHeader className="space-y-1 p-0 mb-6 ">
								<motion.div variants={itemVariants}>
									<CardTitle className="text-2xl font-bold text-gray-800">
										Sign In
									</CardTitle>
								</motion.div>
								<motion.div variants={itemVariants}>
									<CardDescription className="text-gray-600">
										I don't have an account?{" "}
										<motion.a
											href="#"
											className="text-black hover:text-blue-700 font-medium underline"
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											Create Account
										</motion.a>
									</CardDescription>
								</motion.div>
							</CardHeader>

							<CardContent className="p-0">
								<div className="space-y-6">
									<motion.div variants={itemVariants} className="space-y-2">
										<Label
											htmlFor="email"
											className="text-gray-700 font-medium"
										>
											Enter Email or Phone Number
										</Label>
										<Input
											id="email"
											placeholder="Enter Email or Phone Number"
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													handleSubmit(e);
												}
											}}
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
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													handleSubmit(e);
												}
											}}
										/>
									</motion.div>

									<motion.div variants={itemVariants}>
										<Button
											onClick={handleSubmit}
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
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
};

export default LoginPage;
