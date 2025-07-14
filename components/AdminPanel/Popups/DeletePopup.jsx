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

export function DeletePopup({ open, onOpenChange, itemName, onConfirm }) {
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
							Are You Want to Delete {itemName}?
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Do you really want to delete these records? You can't view this in
							your list anymore if you delete!
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
							Yes Delete
						</Button>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
