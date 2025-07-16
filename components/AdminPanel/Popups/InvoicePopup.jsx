"use client";

import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";

export function InvoicePopup({ open, onOpenChange, order }) {
	if (!order) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
					className="space-y-6"
				>
					{/* Header */}
					<div className="flex justify-between items-start">
						<div>
							<h2 className="text-2xl font-bold text-orange-500">SAFETY</h2>
							<p className="text-sm text-gray-600">www.website.com</p>
							<p className="text-sm text-gray-600">hello@gmail.com</p>
							<p className="text-sm text-gray-600">+00 00000 00000</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-gray-600">Business address</p>
							<p className="text-sm text-gray-600">
								City, State, Pin - 000 000
							</p>
							<p className="text-sm text-gray-600">TAX ID 000000000000000</p>
						</div>
					</div>

					<Separator />

					{/* Invoice Details */}
					<div className="grid grid-cols-2 gap-8">
						<div>
							<h3 className="font-semibold mb-2">Billed to</h3>
							<p className="text-sm">Company Name</p>
							<p className="text-sm">Company address</p>
							<p className="text-sm">City, Country - 00000</p>
							<p className="text-sm">Phone: 000-000</p>
						</div>
						<div className="text-right">
							<div className="mb-4">
								<p className="text-sm text-gray-600">Invoice number</p>
								<p className="font-semibold">#AE2524-01</p>
							</div>
							<div className="mb-4">
								<p className="text-sm text-gray-600">Reference</p>
								<p className="font-semibold">INV-057</p>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-orange-500">$4,950.00</p>
							</div>
						</div>
					</div>

					{/* Dates */}
					<div className="grid grid-cols-2 gap-8">
						<div>
							<p className="text-sm text-gray-600">Order date</p>
							<p className="font-semibold">01 Aug, 2023</p>
						</div>
						<div className="text-right">
							<p className="text-sm text-gray-600">Due date</p>
							<p className="font-semibold">15 Aug, 2023</p>
						</div>
					</div>

					<Separator />

					{/* Items Table */}
					<div>
						<div className="grid grid-cols-12 gap-4 py-2 border-b font-semibold text-sm">
							<div className="col-span-1">ITEM DETAIL</div>
							<div className="col-span-6"></div>
							<div className="col-span-1 text-center">QTY</div>
							<div className="col-span-2 text-center">RATE</div>
							<div className="col-span-2 text-right">AMOUNT</div>
						</div>

						<div className="grid grid-cols-12 gap-4 py-3 border-b">
							<div className="col-span-7">
								<p className="font-medium">Item Name</p>
								<p className="text-sm text-gray-600">Item description</p>
							</div>
							<div className="col-span-1 text-center">1</div>
							<div className="col-span-2 text-center">$3,000.00</div>
							<div className="col-span-2 text-right">$3,000.00</div>
						</div>

						<div className="grid grid-cols-12 gap-4 py-3 border-b">
							<div className="col-span-7">
								<p className="font-medium">Item Name</p>
								<p className="text-sm text-gray-600">Item description</p>
							</div>
							<div className="col-span-1 text-center">1</div>
							<div className="col-span-2 text-center">$1,500.00</div>
							<div className="col-span-2 text-right">$1,500.00</div>
						</div>
					</div>

					{/* Totals */}
					<div className="space-y-2">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span>$4,500.00</span>
						</div>
						<div className="flex justify-between">
							<span>Tax (10%)</span>
							<span>$450.00</span>
						</div>
						<Separator />
						<div className="flex justify-between font-bold text-lg">
							<span>Total</span>
							<span>$4,950.00</span>
						</div>
					</div>

					<Separator />

					{/* Footer */}
					<div className="space-y-4">
						<p className="font-semibold">Thanks for the business.</p>
						<div>
							<p className="font-semibold">Terms & Conditions</p>
							<p className="text-sm text-gray-600">
								Please pay within 15 days of receiving this invoice.
							</p>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button className="flex-1 bg-orange-500 hover:bg-orange-600">
							<Download className="w-4 h-4 mr-2" />
							Download Invoice
						</Button>
						<Button variant="outline" className="flex-1 bg-transparent">
							<Printer className="w-4 h-4 mr-2" />
							Print Invoice
						</Button>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
