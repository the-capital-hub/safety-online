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
import { AlertTriangle } from "lucide-react";

export function DeleteOrderPopup({ open, onOpenChange, itemName, onConfirm }) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<div className="flex items-center gap-3 mb-2">
							<div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
								<AlertTriangle className="w-6 h-6 text-red-600" />
							</div>
							<div>
								<DialogTitle className="text-lg font-semibold">
									Delete Order
								</DialogTitle>
								<DialogDescription className="text-gray-600">
									Are you sure you want to delete order "{itemName}"?
								</DialogDescription>
							</div>
						</div>
						<div className="bg-red-50 border border-red-200 rounded-lg p-3">
							<p className="text-sm text-red-800">
								This action cannot be undone. The order will be permanently
								removed from your system.
							</p>
						</div>
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
							Delete Order
						</Button>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
