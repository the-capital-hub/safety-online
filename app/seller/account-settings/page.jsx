"use client";

import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import ShopForm from "@/components/SellerPanel/Settings/form";
import CompanyAddresses from "@/components/SellerPanel/Settings/address";

export default function AccountSettings() {
	return (
		<div className="min-h-screen bg-gray-50 p-6 md:p-10">
			<div className="w-full space-y-8">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.25 }}
				>
					<Card className="border-none shadow-md p-6">
						<CardHeader className="p-0 pb-2">
							<CardTitle className="text-2xl font-bold text-gray-900">
								Seller Account Settings
							</CardTitle>
							<CardDescription className="text-gray-600">
								Manage your company profile and addresses.
							</CardDescription>
						</CardHeader>
					</Card>
				</motion.div>

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
			</div>
		</div>
	);
}
