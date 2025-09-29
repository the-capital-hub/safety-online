"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
        Card,
        CardContent,
        CardDescription,
        CardHeader,
        CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ShopForm from "@/components/SellerPanel/Settings/form";
import CompanyAddresses from "@/components/SellerPanel/Settings/address";
import LoadingSpinner from "@/components/SellerPanel/Layout/LoadingSpinner.jsx";
import { useSellerCompanyStore } from "@/store/sellerCompanyStore.js";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore";

export default function AccountSettings() {
        const router = useRouter();
        const isAuthenticated = useIsSellerAuthenticated();
        const { loading, initialized, error, fetchCompany } = useSellerCompanyStore((state) => ({
                loading: state.loading,
                initialized: state.initialized,
                error: state.error,
                fetchCompany: state.fetchCompany,
        }));

        useEffect(() => {
                if (!isAuthenticated) {
                        const timer = setTimeout(() => {
                                router.push("/seller/login");
                        }, 100);
                        return () => clearTimeout(timer);
                }
        }, [isAuthenticated, router]);

        useEffect(() => {
                if (isAuthenticated && !initialized) {
                        fetchCompany().catch(() => undefined);
                }
        }, [isAuthenticated, initialized, fetchCompany]);

        if (!isAuthenticated) {
                return (
                        <div className="flex items-center justify-center bg-white py-10 text-gray-600">
                                Redirecting to login...
                        </div>
                );
        }

        const isInitialLoading = loading && !initialized;

        return (
                <div className="min-h-screen bg-gray-50 p-6 md:p-10">
                        <div className="w-full space-y-8">
                                <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.25 }}
                                >
                                        <Card className="p-6 border-none shadow-md">
                                                <CardHeader className="p-0 pb-2">
                                                        <CardTitle className="text-2xl font-bold text-gray-900">
                                                                Seller Account Settings
                                                        </CardTitle>
                                                        <CardDescription className="text-gray-600">
                                                                Manage your company profile and addresses.
                                                        </CardDescription>
                                                </CardHeader>
                                                {error && (
                                                        <CardContent className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                        <span>{error}</span>
                                                                        <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => fetchCompany(true)}
                                                                        >
                                                                                Retry
                                                                        </Button>
                                                                </div>
                                                        </CardContent>
                                                )}
                                        </Card>
                                </motion.div>

                                {isInitialLoading ? (
                                        <div className="rounded-lg border border-dashed border-gray-200 bg-white py-10">
                                                <LoadingSpinner />
                                        </div>
                                ) : (
                                        <>
                                                <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.25, delay: 0.05 }}
                                                >
                                                        <ShopForm />
                                                </motion.div>

                                                <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ duration: 0.25, delay: 0.1 }}
                                                >
                                                        <CompanyAddresses />
                                                </motion.div>
                                        </>
                                )}
                        </div>
                </div>
        );
}
