"use client";

import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/store/adminAuthStore";

export function LogoutPopup({ open, onOpenChange }) {
	const { clearUser } = useAdminAuthStore();
	const handleLogout = () => {
		// Handle logout logic here
		console.log("Logging out...");
		clearUser();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader className="text-center">
						<div className="mx-auto mb-4 w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center">
							<div className="text-4xl">👋</div>
						</div>
						<DialogTitle className="text-xl text-center font-semibold">
							Are you sure you want to log out?
						</DialogTitle>
						{/* <DialogDescription className="text-gray-600">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
							eiusmod tempor incididunt ut labore et dolore
						</DialogDescription> */}
					</DialogHeader>
					<DialogFooter className="flex gap-3 mt-6">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1"
						>
							Cancel
						</Button>
						<Button
							onClick={handleLogout}
							className="flex-1 bg-orange-500 hover:bg-orange-600"
						>
							Yes Logout
						</Button>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
