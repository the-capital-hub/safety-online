"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useSellerAuthStore } from "@/store/sellerAuthStore";
import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function LogoutPopup({ open, onOpenChange }) {
	const { clearAdminUser } = useAdminAuthStore();
	const { clearSeller } = useSellerAuthStore();
	const { clearUser } = useAuthStore();
        const router = useRouter();
        const pathname = usePathname();
	const [pending, setPending] = useState(false);

	const handleLogout = async () => {
		try {
			setPending(true);
			const res = await fetch("/api/auth/logout", { method: "POST" });
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.message || "Failed to logout");
			}
			// Clear client stores
			clearUser();
			clearAdminUser();
			clearSeller();

                        toast.success("Logged out");
                        onOpenChange(false);

                        const redirectPath = pathname?.startsWith("/admin")
                                ? "/admin/login"
                                : pathname?.startsWith("/seller")
                                  ? "/seller/login"
                                  : "/login";

                        router.replace(redirectPath);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to logout");
		} finally {
			setPending(false);
		}
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
					</DialogHeader>
					<DialogFooter className="flex gap-3 mt-6">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="flex-1"
							disabled={pending}
						>
							Cancel
						</Button>
						<Button
							onClick={handleLogout}
							className="flex-1 bg-orange-500 hover:bg-orange-600"
							disabled={pending}
						>
							{pending ? "Logging out..." : "Yes Logout"}
						</Button>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
