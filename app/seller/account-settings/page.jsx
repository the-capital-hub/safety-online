"use client";

import { motion } from "framer-motion";
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
					<div className="mb-6">
						<h1 className="text-2xl font-bold text-gray-900">
							Seller Company details
						</h1>
						<p className="text-gray-600">
							Manage your company profile and addresses.
						</p>
					</div>
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
