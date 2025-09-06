"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Download } from "lucide-react";
import { useSellerProductStore } from "@/store/sellerProductStore.js";

export function BulkUploadPopup({ open, onOpenChange }) {
	const { bulkUploadProducts } = useSellerProductStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [jsonData, setJsonData] = useState("");
	const [uploadResults, setUploadResults] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!jsonData.trim()) return;

		setIsSubmitting(true);
		try {
			const products = JSON.parse(jsonData);
			const results = await bulkUploadProducts(products);
			setUploadResults(results);
			if (results) {
				setJsonData("");
			}
		} catch (error) {
			console.error("Invalid JSON format:", error);
		}
		setIsSubmitting(false);
	};

	const downloadTemplate = () => {
		const template = [
			{
				title: "Sample Product 1",
				description: "This is a sample product description",
				longDescription: "This is a detailed description of the sample product",
				category: "personal-safety",
				price: 99.99,
				salePrice: 79.99,
				stocks: 100,
				discount: 20,
				type: "featured",
				published: true,
				features: [
					{
						title: "High Quality",
						description: "Made with premium materials",
					},
					{
						title: "Durable",
						description: "Long-lasting construction",
					},
				],
			},
			{
				title: "Sample Product 2",
				description: "Another sample product",
				longDescription: "Detailed description for the second product",
				category: "road-safety",
				price: 149.99,
				salePrice: 0,
				stocks: 50,
				discount: 0,
				type: "top-selling",
				published: true,
				features: [],
			},
		];

		const jsonContent = JSON.stringify(template, null, 2);
		const blob = new Blob([jsonContent], { type: "application/json" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "bulk-upload-template.json";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
				<motion.div
					initial={{ scale: 0.95, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.2 }}
				>
					<DialogHeader>
						<DialogTitle className="text-xl font-semibold">
							Bulk Upload Products
						</DialogTitle>
						<DialogDescription className="text-gray-600">
							Upload multiple products at once using JSON format
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 mt-6">
						{/* Template Download */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium text-blue-900">
										Need a template?
									</h4>
									<p className="text-sm text-blue-700">
										Download our JSON template to get started
									</p>
								</div>
								<Button
									variant="outline"
									onClick={downloadTemplate}
									className="text-blue-600 border-blue-600 bg-transparent"
								>
									<Download className="w-4 h-4 mr-2" />
									Download Template
								</Button>
							</div>
						</div>

						{/* Upload Results */}
						{uploadResults && (
							<div className="space-y-3">
								<div className="bg-green-50 border border-green-200 rounded-lg p-4">
									<h4 className="font-medium text-green-900 mb-2">
										Upload Results
									</h4>
									<div className="text-sm text-green-700">
										<p>
											✅ Successfully uploaded: {uploadResults.success.length}{" "}
											products
										</p>
										{uploadResults.failed.length > 0 && (
											<p>
												❌ Failed to upload: {uploadResults.failed.length}{" "}
												products
											</p>
										)}
									</div>
								</div>

								{uploadResults.failed.length > 0 && (
									<div className="bg-red-50 border border-red-200 rounded-lg p-4">
										<h4 className="font-medium text-red-900 mb-2">
											Failed Uploads
										</h4>
										<div className="text-sm text-red-700 space-y-1">
											{uploadResults.failed.slice(0, 3).map((failed, index) => (
												<p key={index}>
													• {failed.data.title || "Unknown"}: {failed.error}
												</p>
											))}
											{uploadResults.failed.length > 3 && (
												<p>... and {uploadResults.failed.length - 3} more</p>
											)}
										</div>
									</div>
								)}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-4">
							<div>
								<Label htmlFor="jsonData">Product Data (JSON Format) *</Label>
								<Textarea
									id="jsonData"
									placeholder={`[
  {
    "title": "Product Name",
    "description": "Short description",
    "category": "personal-safety",
    "price": 99.99,
    "stocks": 100,
    "published": true
  }
]`}
									value={jsonData}
									onChange={(e) => setJsonData(e.target.value)}
									className="mt-1 font-mono text-sm"
									rows={12}
									required
								/>
								<p className="text-xs text-gray-500 mt-1">
									Paste your JSON array of products here. Required fields:
									title, description, category, price, stocks
								</p>
							</div>

							<DialogFooter className="flex gap-3">
								<Button
									type="button"
									variant="outline"
									onClick={() => onOpenChange(false)}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting || !jsonData.trim()}
									className="flex-1 bg-blue-600 hover:bg-blue-700"
								>
									<Upload className="w-4 h-4 mr-2" />
									{isSubmitting ? "Uploading..." : "Upload Products"}
								</Button>
							</DialogFooter>
						</form>
					</div>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}
