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
import {
        BarChart3,
        Eye,
        EyeOff,
        Loader2,
        PackageCheck,
        ShieldCheck,
} from "lucide-react";
import {
	useSellerAuthStore,
	useIsSellerAuthenticated,
} from "@/store/sellerAuthStore";
import { toast } from "react-hot-toast";
import Logo from "@/public/SafetyLogo.png";
import LoginModel from "@/public/images/login/LoginModel.png";

export default function SellerLogin() {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();
	const { login } = useSellerAuthStore();
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

		if (!formData.email || !formData.password) {
			toast.error("Please fill in all fields");
			setIsLoading(false);
			return;
		}

		const result = await login(formData);

		if (result.success) {
			router.push("/seller/dashboard");
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

        const featureHighlights = [
                {
                        icon: ShieldCheck,
                        title: "Trusted seller network",
                        description: "Built for compliance-first businesses that move fast and stay secure.",
                },
                {
                        icon: PackageCheck,
                        title: "Smarter fulfilment",
                        description: "Synchronise your catalog, orders, and returns in one intuitive workspace.",
                },
                {
                        icon: BarChart3,
                        title: "Actionable analytics",
                        description: "Get real-time performance insights to grow your marketplace presence.",
                },
        ];

        return (
                <div className="relative min-h-screen overflow-hidden bg-slate-950">
                        <div className="absolute inset-0">
                                <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
                                <div className="absolute top-48 -right-16 h-64 w-64 rounded-full bg-sky-500/25 blur-3xl" />
                                <div className="absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-slate-500/30 blur-3xl" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
                        </div>

                        <div className="relative z-10 flex min-h-screen flex-col-reverse lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(380px,420px)]">
                                {/* Left side - Inspiration and highlights */}
                                <motion.section
                                        className="flex flex-1 flex-col justify-between gap-10 px-8 py-12 text-white md:px-16 lg:py-16"
                                        initial={{ x: -80, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                >
                                        <motion.div
                                                className="max-w-xl space-y-6"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                        >
                                                <motion.div
                                                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-wider text-orange-200 backdrop-blur"
                                                        variants={itemVariants}
                                                >
                                                        <span className="h-2 w-2 rounded-full bg-orange-400" />
                                                        Seller portal 1.2
                                                </motion.div>
                                                <motion.h1
                                                        className="text-3xl font-semibold leading-tight text-white md:text-4xl lg:text-5xl"
                                                        variants={itemVariants}
                                                >
                                                        Build trust, streamline fulfilment, and keep every buyer delighted.
                                                </motion.h1>
                                                <motion.p
                                                        className="text-base text-slate-200 md:text-lg"
                                                        variants={itemVariants}
                                                >
                                                        Log in to orchestrate your marketplace operations with clarity. Safety Online brings every
                                                        document, product update, and customer conversation into a single, secure control centre.
                                                </motion.p>
                                        </motion.div>

                                        <motion.div
                                                className="grid gap-4 md:grid-cols-3"
                                                variants={containerVariants}
                                                initial="hidden"
                                                animate="visible"
                                        >
                                                {featureHighlights.map((feature) => (
                                                        <motion.div
                                                                key={feature.title}
                                                                className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-orange-300/60 hover:bg-white/10"
                                                                variants={itemVariants}
                                                        >
                                                                <feature.icon className="mb-4 h-6 w-6 text-orange-300 transition group-hover:scale-110" />
                                                                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                                                                <p className="mt-1 text-sm text-slate-200/80">{feature.description}</p>
                                                        </motion.div>
                                                ))}
                                        </motion.div>

                                        <motion.div
                                                className="hidden justify-end lg:flex"
                                                initial={{ scale: 0.92, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 1, delay: 0.35 }}
                                        >
                                                {/* <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                                                        <div className="absolute inset-x-6 top-6 h-40 rounded-3xl bg-gradient-to-b from-white/40 to-transparent blur-2xl" />
                                                        <Image
                                                                src={LoginModel.src}
                                                                alt="Seller dashboard preview"
                                                                width={420}
                                                                height={360}
                                                                className="relative z-10 h-full w-full rounded-2xl object-cover shadow-2xl"
                                                        />
                                                </div> */}
                                        </motion.div>
                                </motion.section>

                                {/* Right side - Login form */}
                                <motion.section
                                        className="relative flex flex-col justify-center bg-white/5 px-8 py-12 backdrop-blur md:px-12"
                                        initial={{ x: 80, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                >
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.4),_transparent_65%)]" />
                                        <div className="relative z-10 mx-auto w-full max-w-md space-y-8">
                                                <motion.div
                                                        className="text-center"
                                                        variants={logoVariants}
                                                        initial="hidden"
                                                        animate="visible"
                                                >
                                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg shadow-orange-500/20">
                                                                <Image
                                                                        src={Logo.src}
                                                                        alt="Safety Online"
                                                                        width={72}
                                                                        height={72}
                                                                        className="h-12 w-12 object-contain"
                                                                />
                                                        </div>
                                                        <p className="mt-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                                                                Seller access
                                                        </p>
                                                </motion.div>

                                                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                                                        <div className="relative rounded-[26px] bg-gradient-to-br from-white/60 via-white/30 to-white/10 p-[1px] shadow-xl shadow-slate-900/30">
                                                                <Card className="rounded-[26px] border border-white/20 bg-white/90 p-8 text-slate-900 backdrop-blur-xl">
                                                                        <CardHeader className="space-y-2 p-0">
                                                                                <motion.div variants={itemVariants}>
                                                                                        <CardTitle className="text-3xl font-semibold text-slate-900">
                                                                                                Welcome back
                                                                                        </CardTitle>
                                                                                </motion.div>
                                                                                <motion.div variants={itemVariants}>
                                                                                        <CardDescription className="text-base text-slate-500">
                                                                                                New to Safety Online?{" "}
                                                                                                <Link
                                                                                                        href="/seller/register"
                                                                                                        className="font-semibold text-orange-500 transition hover:text-orange-600"
                                                                                                >
                                                                                                        Create an account
                                                                                                </Link>
                                                                                        </CardDescription>
                                                                                </motion.div>
                                                                        </CardHeader>
                                                                        <CardContent className="mt-6 space-y-6 p-0">
                                                                                <form onSubmit={handleSubmit} className="space-y-5">
                                                                                        <div className="space-y-2">
                                                                                                <Label className="text-sm font-medium text-slate-700" htmlFor="email">
                                                                                                        Email address
                                                                                                </Label>
                                                                                                <Input
                                                                                                        id="email"
                                                                                                        name="email"
                                                                                                        type="email"
                                                                                                        placeholder="you@safetyonline.com"
                                                                                                        value={formData.email}
                                                                                                        onChange={handleInputChange}
                                                                                                        required
                                                                                                        className="h-12 rounded-xl border-slate-200 bg-white/70 text-base text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400"
                                                                                                />
                                                                                        </div>

                                                                <div className="space-y-2">
                                                                                                <Label className="text-sm font-medium text-slate-700" htmlFor="password">
                                                                                                        Password
                                                                                                </Label>
                                                                                                <div className="relative">
                                                                                                        <Input
                                                                                                                id="password"
                                                                                                                name="password"
                                                                                                                type={showPassword ? "text" : "password"}
                                                                                                                placeholder="Enter your password"
                                                                                                                value={formData.password}
                                                                                                                onChange={handleInputChange}
                                                                                                                required
                                                                                                                className="h-12 rounded-xl border-slate-200 bg-white/70 pr-12 text-base text-slate-900 placeholder:text-slate-400 focus:border-orange-400 focus:ring-orange-400"
                                                                                                        />
                                                                                                        <Button
                                                                                                                type="button"
                                                                                                                variant="ghost"
                                                                                                                size="icon"
                                                                                                                className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-orange-500/10 text-slate-600 hover:bg-orange-500/20"
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

                                                                                        <div className="flex justify-end">
                                                                                                <Link
                                                                                                        href="/seller/forgot-password"
                                                                                                        className="text-sm font-medium text-orange-500 transition hover:text-orange-600"
                                                                                                >
                                                                                                        Forgot password?
                                                                                                </Link>
                                                                                        </div>

                                                                                        <Button
                                                                                                type="submit"
                                                                                                className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:via-orange-600 hover:to-amber-600 focus-visible:ring-orange-400"
                                                                                                disabled={isLoading}
                                                                                        >
                                                                                                {isLoading ? (
                                                                                                        <>
                                                                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                                                                Signing in...
                                                                                                        </>
                                                                                                ) : (
                                                                                                        "Sign in"
                                                                                                )}
                                                                                        </Button>
                                                                                        <Button
                                                                                                type="button"
                                                                                                variant="outline"
                                                                                                className="h-12 w-full rounded-xl border-orange-500/60 bg-transparent text-base font-semibold text-orange-500 transition hover:bg-orange-50 hover:text-orange-600"
                                                                                                asChild
                                                                                        >
                                                                                                <Link href="/seller/register">
                                                                                                        Create new seller account
                                                                                                </Link>
                                                                                        </Button>
                                                                                </form>
                                                                        </CardContent>
                                                                </Card>
                                                        </div>
                                                </motion.div>
                                        </div>
                                </motion.section>
                        </div>
                </div>
        );
}
