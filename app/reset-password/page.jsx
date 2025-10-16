"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "react-hot-toast";

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

const ResetPasswordSchema = z
        .object({
                newPassword: z
                        .string()
                        .min(6, "Password must be at least 6 characters")
                        .max(64, "Password should be 64 characters or fewer"),
                confirmPassword: z.string().min(6, "Confirm your password"),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
                message: "Passwords do not match",
                path: ["confirmPassword"],
        });

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

export default function ResetPasswordPage() {
        const router = useRouter();
        const searchParams = useSearchParams();
        const redirectTo = searchParams.get("redirect") ?? "/login";
        const token = searchParams.get("token")?.trim() ?? "";
        const [formData, setFormData] = useState({
                newPassword: "",
                confirmPassword: "",
        });
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [isSuccess, setIsSuccess] = useState(false);

        const handleChange = (field) => (event) => {
                const value = event.target.value;
                setFormData((prev) => ({ ...prev, [field]: value }));
        };

        const handleSubmit = async (event) => {
                event.preventDefault();
                const parsed = ResetPasswordSchema.safeParse(formData);
                if (!parsed.success) {
                        toast.error(parsed.error.issues?.[0]?.message || "Invalid input");
                        return;
                }

                if (!token) {
                        toast.error("Reset link is missing or invalid");
                        return;
                }

                setIsSubmitting(true);
                try {
                        const response = await fetch("/api/auth/reset-password", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                        token,
                                        newPassword: parsed.data.newPassword,
                                }),
                        });
                        const data = await response.json();

                        if (response.ok) {
                                toast.success(data.message || "Password updated successfully");
                                setIsSuccess(true);
                                setFormData({ newPassword: "", confirmPassword: "" });
                        } else {
                                toast.error(data.message || "Failed to reset password");
                        }
                } catch (error) {
                        console.error("Reset password error:", error);
                        toast.error("Unable to reset password. Please try again.");
                } finally {
                        setIsSubmitting(false);
                }
        };

        return (
                <div className="min-h-screen flex items-center justify-center bg-white px-4 py-16">
                        <motion.div
                                className="w-full max-w-lg"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                        >
                                <motion.div className="text-center mb-8" variants={logoVariants}>
                                        <Image
                                                src={Logo.src || "/placeholder.svg?height=100&width=100&query=brand-logo"}
                                                alt="Safety Online Logo"
                                                width={96}
                                                height={96}
                                                className="mx-auto h-24 w-24 object-contain"
                                        />
                                </motion.div>
                                <Card className="border-0 shadow-lg">
                                        <CardHeader className="space-y-2 text-center">
                                                <motion.div variants={itemVariants}>
                                                        <CardTitle className="text-2xl font-semibold text-gray-800">
                                                                Reset Password
                                                        </CardTitle>
                                                </motion.div>
                                                <motion.div variants={itemVariants}>
                                                        <CardDescription className="text-gray-600">
                                                                Choose a new password for your account. Passwords must be
                                                                at least 6 characters.
                                                        </CardDescription>
                                                </motion.div>
                                        </CardHeader>
                                        <CardContent>
                                                {isSuccess ? (
                                                        <motion.div
                                                                variants={itemVariants}
                                                                className="space-y-4 text-center text-gray-700"
                                                        >
                                                                <p>Your password has been updated successfully.</p>
                                                                <Button
                                                                        className="w-full"
                                                                        onClick={() => router.push(redirectTo)}
                                                                >
                                                                        Return to login
                                                                </Button>
                                                        </motion.div>
                                                ) : (
                                                        <motion.form
                                                                onSubmit={handleSubmit}
                                                                className="space-y-6"
                                                                variants={containerVariants}
                                                        >
                                                                {!token && (
                                                                        <motion.div
                                                                                variants={itemVariants}
                                                                                className="rounded-md bg-red-50 p-3 text-sm text-red-700"
                                                                        >
                                                                                The reset link is missing or invalid. Please use the link
                                                                                from your email.
                                                                        </motion.div>
                                                                )}
                                                                <motion.div variants={itemVariants} className="space-y-2">
                                                                        <Label htmlFor="newPassword" className="text-gray-700 font-medium">
                                                                                New password
                                                                        </Label>
                                                                        <Input
                                                                                id="newPassword"
                                                                                type="password"
                                                                                value={formData.newPassword}
                                                                                onChange={handleChange("newPassword")}
                                                                                placeholder="Enter a new password"
                                                                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                                                required
                                                                                minLength={6}
                                                                        />
                                                                </motion.div>
                                                                <motion.div variants={itemVariants} className="space-y-2">
                                                                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                                                                                Confirm new password
                                                                        </Label>
                                                                        <Input
                                                                                id="confirmPassword"
                                                                                type="password"
                                                                                value={formData.confirmPassword}
                                                                                onChange={handleChange("confirmPassword")}
                                                                                placeholder="Re-enter the new password"
                                                                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                                                required
                                                                                minLength={6}
                                                                        />
                                                                </motion.div>
                                                                <motion.div variants={itemVariants}>
                                                                        <Button
                                                                                type="submit"
                                                                                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium"
                                                                                disabled={isSubmitting || !token}
                                                                        >
                                                                                {isSubmitting ? (
                                                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                                ) : (
                                                                                        "Update password"
                                                                                )}
                                                                        </Button>
                                                                </motion.div>
                                                                <motion.div variants={itemVariants} className="text-center">
                                                                        <Button variant="link" asChild className="text-sm">
                                                                        <Link href={redirectTo}>Back to login</Link>
                                                                        </Button>
                                                                </motion.div>
                                                        </motion.form>
                                                )}
                                        </CardContent>
                                </Card>
                        </motion.div>
                </div>
        );
}
