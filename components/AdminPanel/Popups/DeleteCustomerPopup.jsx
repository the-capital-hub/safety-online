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

export function DeleteCustomerPopup({
	open,
	onOpenChange,
	itemName,
	onConfirm,
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<DialogTitle className="text-lg font-semibold">
							Delete Customer
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Are you sure you want to delete "{itemName}"? This action cannot
							be undone.
						</DialogDescription>
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
							variant="destructive"
							onClick={() => {
								onConfirm();
								onOpenChange(false);
							}}
							className="flex-1"
						>
							Delete Customer
						</Button>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
