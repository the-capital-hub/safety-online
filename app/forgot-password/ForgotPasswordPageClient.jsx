"use client";

import { useState } from "react";
import Link from "next/link";
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
import Image from "next/image";

const ForgotPasswordSchema = z.object({
        email: z.string().trim().email("Enter a valid email address"),
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

export default function ForgotPasswordPageClient() {
        const [email, setEmail] = useState("");
        const [isLoading, setIsLoading] = useState(false);
        const [isEmailSent, setIsEmailSent] = useState(false);

        const handleSubmit = async (event) => {
                event.preventDefault();
                const parsed = ForgotPasswordSchema.safeParse({ email });
                if (!parsed.success) {
                        toast.error(parsed.error.issues?.[0]?.message || "Invalid email address");
                        return;
                }

                setIsLoading(true);
                try {
                        const response = await fetch("/api/auth/forgot-password", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email: parsed.data.email.toLowerCase() }),
                        });

                        const data = await response.json();
                        if (response.ok) {
                                toast.success(data.message || "Password reset email sent");
                                setIsEmailSent(true);
                        } else {
                                toast.error(data.message || "Unable to send reset email");
                        }
                } catch (error) {
                        console.error("Forgot password error:", error);
                        toast.error("Unable to send reset email. Please try again.");
                } finally {
                        setIsLoading(false);
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
                                                                Forgot Password
                                                        </CardTitle>
                                                </motion.div>
                                                <motion.div variants={itemVariants}>
                                                        <CardDescription className="text-gray-600">
                                                                Enter the email associated with your account and we&apos;ll send
                                                                you a link to reset your password.
                                                        </CardDescription>
                                                </motion.div>
                                        </CardHeader>
                                        <CardContent>
                                                {isEmailSent ? (
                                                        <motion.div
                                                                variants={itemVariants}
                                                                className="space-y-4 text-center text-gray-700"
                                                        >
                                                                <p>
                                                                        If an account exists for <span className="font-medium">{email}</span>,
                                                                        you&apos;ll receive an email with a secure link to reset your
                                                                        password. Follow the instructions in that email to
                                                                        continue.
                                                                </p>
                                                                <Button variant="link" asChild>
                                                                        <Link href="/login">Return to login</Link>
                                                                </Button>
                                                        </motion.div>
                                                ) : (
                                                        <motion.form
                                                                onSubmit={handleSubmit}
                                                                className="space-y-6"
                                                                variants={containerVariants}
                                                        >
                                                                <motion.div variants={itemVariants} className="space-y-2">
                                                                        <Label htmlFor="email" className="text-gray-700 font-medium">
                                                                                Email address
                                                                        </Label>
                                                                        <Input
                                                                                id="email"
                                                                                type="email"
                                                                                autoComplete="email"
                                                                                placeholder="you@example.com"
                                                                                value={email}
                                                                                onChange={(event) => setEmail(event.target.value)}
                                                                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                                                required
                                                                        />
                                                                </motion.div>
                                                                <motion.div variants={itemVariants}>
                                                                        <Button
                                                                                type="submit"
                                                                                className="w-full h-12 bg-gray-800 hover:bg-gray-900 text-white font-medium"
                                                                                disabled={isLoading}
                                                                        >
                                                                                {isLoading ? (
                                                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                                ) : (
                                                                                        "Send reset link"
                                                                                )}
                                                                        </Button>
                                                                </motion.div>
                                                                <motion.div variants={itemVariants} className="text-center">
                                                                        <Button variant="link" asChild className="text-sm">
                                                                                <Link href="/login">Back to login</Link>
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
