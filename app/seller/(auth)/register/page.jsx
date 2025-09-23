"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
	useSellerAuthStore,
	useIsSellerAuthenticated,
} from "@/store/sellerAuthStore";
import { toast } from "react-hot-toast";
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";

export default function SellerRegister() {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		mobile: "",
		password: "",
		confirmPassword: "",
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

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!e.currentTarget.checkValidity()) {

		  e.currentTarget.reportValidity();

		  return;

		}
		setIsLoading(true);

		// Validation
		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.mobile ||
			!formData.password
		) {
			toast.error("Please fill in all fields");
			setIsLoading(false);
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			setIsLoading(false);
			return;
		}

		if (formData.password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			setIsLoading(false);
			return;
		}

		const { confirmPassword, ...registrationData } = formData;
		const result = await register(registrationData);

		if (result.success) {
			router.push("/seller/login");
		}

		setIsLoading(false);
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
							<CardHeader className="space-y-1 p-0 mb-4">
								<motion.div variants={itemVariants}>
									<CardTitle className="text-2xl font-bold text-gray-800">
										Seller Registration
									</CardTitle>
								</motion.div>
								<motion.div variants={itemVariants}>
									<CardDescription className="text-gray-600">
										Already have an account?{" "}
										<Link
											href="/seller/login"
											className="text-black hover:text-blue-700 font-medium underline"
										>
											Sign In
										</Link>
									</CardDescription>
								</motion.div>
							</CardHeader>
							<CardContent className="p-0">
								<form onSubmit={handleSubmit} className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">First Name</Label>
											<Input
												id="firstName"
												name="firstName"
												type="text"
												placeholder="First name"
												value={formData.firstName}
												onChange={handleInputChange}
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
												value={formData.lastName}
												onChange={handleInputChange}
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
											value={formData.email}
											onChange={handleInputChange}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="mobile">Mobile Number</Label>
										<Input
											id="mobile"
											name="mobile"
											type="tel"
											placeholder="Enter your mobile number"
											value={formData.mobile}
											onChange={handleInputChange}
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
												value={formData.password}
												onChange={handleInputChange}
												required
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowPassword(!showPassword)}
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
												value={formData.confirmPassword}
												onChange={handleInputChange}
												required
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
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

									<Button
										type="submit"
										className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium text-base"
										disabled={isLoading}
									>
										{isLoading ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Creating account...
											</>
										) : (
											"Create Account"
										)}
									</Button>
								</form>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}
