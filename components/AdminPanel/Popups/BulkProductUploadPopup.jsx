"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Upload, Download, User } from "lucide-react";
import { useAdminProductStore } from "@/store/adminProductStore.js";

export function BulkUploadPopup({ open, onOpenChange }) {
	const { bulkUploadProducts } = useAdminProductStore();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [jsonData, setJsonData] = useState("");
	const [csvData, setCsvData] = useState("");
	const [mode, setMode] = useState("json");
	const [uploadResults, setUploadResults] = useState(null);
	const [sellers, setSellers] = useState([]);
	const [selectedSellerId, setSelectedSellerId] = useState("");
	const [loadingSellers, setLoadingSellers] = useState(false);

	useEffect(() => {
		if (open) {
			// Fetch sellers
			const fetchSellers = async () => {
				setLoadingSellers(true);
				try {
					const res = await fetch("/api/admin/sellers?limit=1000"); // Get all sellers
					const data = await res.json();
					if (data.success) {
						setSellers(data.data);
					}
				} catch (error) {
					console.error("Failed to fetch sellers:", error);
				} finally {
					setLoadingSellers(false);
				}
			};

			fetchSellers();
		}
	}, [open]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!selectedSellerId) {
			alert("Please select a seller first");
			return;
		}

		setIsSubmitting(true);
		try {
			let products = [];
			if (mode === "json") {
				if (!jsonData.trim()) {
					setIsSubmitting(false);
					return;
				}
				products = JSON.parse(jsonData);
			} else {
				if (!csvData.trim()) {
					setIsSubmitting(false);
					return;
				}
				const rows = parseCSV(csvData);
				products = rows.map(mapRowToProduct);
			}

			// Add sellerId to all products
			products = products.map((product) => ({
				...product,
				sellerId: selectedSellerId,
			}));

			const results = await bulkUploadProducts(products);
			setUploadResults(results);
			if (results) {
				setJsonData("");
				setCsvData("");
			}
		} catch (error) {
			console.error("Invalid data format:", error);
		}
		setIsSubmitting(false);
	};

	const csvHeaders = [
		"Product Category",
		"HSN Code",
		"Product title",
		"Description",
		"Sale Price",
		"MRP",
		"Feature Image URL link 1",
		"Image URL link 2",
		"Image URL link 3",
		"Image URL link 4",
		"Image URL link 5",
		"Bullet Point 1",
		"Bullet Point 2",
		"Bullet Point 3",
		"Bullet Point 4",
		"Bullet Point 5",
		"Generic Keywords",
		"Length (cm)",
		"Width (cm)",
		"height (cm)",
		"Weight (Kg)",
		"Colour",
		"Material used / Made Of",
		"brand",
		"size",
	];

	const downloadTemplate = () => {
		if (mode === "json") {
			const template = [
				{
					title: "Sample Product 1",
					description: "This is a sample product description",
					longDescription:
						"This is a detailed description of the sample product",
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
					],
				},
			];

			const jsonContent = JSON.stringify(template, null, 2);
			const blob = new Blob([jsonContent], {
				type: "application/json",
			});
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "bulk-upload-template.json";
			a.click();
			window.URL.revokeObjectURL(url);
		} else {
			const sample = [
				"personal-safety",
				"HSN001",
				"Sample Product",
				"Sample Description",
				"79.99",
				"99.99",
				"https://drive.google.com/file/d/FILE_ID/view",
				"",
				"",
				"",
				"",
				"Feature one",
				"Feature two",
				"",
				"",
				"",
				"keyword1,keyword2",
				"10",
				"5",
				"2",
				"0.5",
				"Red",
				"Plastic",
				"BrandX",
				"M",
			];
			const csvContent = [csvHeaders.join(","), sample.join(",")].join("\n");
			const blob = new Blob([csvContent], { type: "text/csv" });
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "bulk-upload-template.csv";
			a.click();
			window.URL.revokeObjectURL(url);
		}
	};

	const parseCSV = (text) => {
		const rows = [];
		let current = "";
		let row = [];
		let inQuotes = false;

		for (let i = 0; i < text.length; i++) {
			const char = text[i];

			if (char === '"') {
				if (inQuotes && text[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (char === "," && !inQuotes) {
				row.push(current.trim());
				current = "";
			} else if ((char === "\n" || char === "\r") && !inQuotes) {
				if (char === "\r" && text[i + 1] === "\n") i++;
				row.push(current.trim());
				rows.push(row);
				row = [];
				current = "";
			} else {
				current += char;
			}
		}

		if (current || row.length) {
			row.push(current.trim());
			rows.push(row);
		}

		const headers = rows.shift().map((h) => h.trim());
		return rows
			.filter((r) => r.some((cell) => cell !== ""))
			.map((r) => {
				const obj = {};
				headers.forEach((h, i) => {
					obj[h] = r[i] ? r[i].trim() : "";
				});
				return obj;
			});
	};

	const toGoogleUrl = (url) => {
		if (!url) return "";
		const idMatch = url.match(/\/d\/(.*?)(\/|$)/) || url.match(/id=([^&]+)/);
		return idMatch ? `https://lh3.googleusercontent.com/d/${idMatch[1]}` : url;
	};

	const parseNumber = (value) => {
		const num = Number.parseFloat(value);
		return Number.isNaN(num) ? 0 : num;
	};

	const mapRowToProduct = (row) => {
		const images = [
			row["Feature Image URL link 1"],
			row["Image URL link 2"],
			row["Image URL link 3"],
			row["Image URL link 4"],
			row["Image URL link 5"],
		]
			.filter(Boolean)
			.map((url) => toGoogleUrl(url));

		const bullets = [
			row["Bullet Point 1"],
			row["Bullet Point 2"],
			row["Bullet Point 3"],
			row["Bullet Point 4"],
			row["Bullet Point 5"],
		].filter(Boolean);

		const features = bullets.map((b) => ({ title: b, description: b }));

		const keywords = row["Generic Keywords"]
			? row["Generic Keywords"]
					.split(/[,;]+/)
					.map((k) => k.trim())
					.filter(Boolean)
			: [];

		const salePrice = parseNumber(row["Sale Price"]);
		const price = parseNumber(row["MRP"]);

		const discount =
			price && salePrice ? ((price - salePrice) / price) * 100 : 0;

		return {
			category: row["Product Category"] || "",
			hsnCode: row["HSN Code"] || "",
			title: row["Product title"] || "",
			description: row["Description"] || "",
			longDescription: row["Description"] || "",
			salePrice,
			price,
			discount,
			stocks: 10,
			images,
			mainImage: images[0] || "",
			features,
			keywords,
			length: parseNumber(row["Length (cm)"] || 0),
			width: parseNumber(row["Width (cm)"] || 0),
			height: parseNumber(row["height (cm)"] || 0),
			weight: parseNumber(row["Weight (Kg)"] || 0),
			colour: row["Colour"] || "",
			material: row["Material used / Made Of"] || "",
			brand: row["brand"] || "",
			size: row["size"] || "",
		};
	};

	const handleCSVChange = (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			setCsvData(event.target.result);
		};
		reader.readAsText(file);
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
							Upload multiple products at once using JSON or CSV format
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-6 mt-6">
						{/* Seller Selection */}
						<div>
							<Label>Select Seller for All Products *</Label>
							<Select
								value={selectedSellerId}
								onValueChange={setSelectedSellerId}
								disabled={loadingSellers}
							>
								<SelectTrigger className="mt-1">
									<SelectValue
										placeholder={
											loadingSellers ? "Loading sellers..." : "Select seller"
										}
									>
										{selectedSellerId && (
											<div className="flex items-center gap-2">
												<User className="w-4 h-4" />
												<span>
													{
														sellers.find((s) => s._id === selectedSellerId)
															?.firstName
													}{" "}
													{
														sellers.find((s) => s._id === selectedSellerId)
															?.lastName
													}{" "}
													-{" "}
													{
														sellers.find((s) => s._id === selectedSellerId)
															?.email
													}
												</span>
											</div>
										)}
									</SelectValue>
								</SelectTrigger>
								<SelectContent>
									{sellers.map((seller) => (
										<SelectItem key={seller._id} value={seller._id}>
											<div className="flex items-center gap-2">
												<User className="w-4 h-4" />
												<span>
													{seller.firstName} {seller.lastName} - {seller.email}
												</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-gray-500 mt-1">
								All products in this bulk upload will be assigned to the
								selected seller
							</p>
						</div>

						{/* Template Download */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex items-center justify-between">
								<div>
									<h4 className="font-medium text-blue-900">
										Need a template?
									</h4>
									<p className="text-sm text-blue-700">
										Download our {mode.toUpperCase()} template to get started
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
							<div className="space-y-4">
								<div className="max-w-xs">
									<Label>Upload Mode</Label>
									<Select value={mode} onValueChange={setMode}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="json">JSON</SelectItem>
											<SelectItem value="csv">CSV</SelectItem>
										</SelectContent>
									</Select>
								</div>

								{mode === "json" ? (
									<div>
										<Label htmlFor="jsonData">
											Product Data (JSON Format) *
										</Label>
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
											required={mode === "json"}
										/>
										<p className="text-xs text-gray-500 mt-1">
											Paste your JSON array of products here. Missing fields
											will receive default values during upload. The sellerId
											will be automatically added.
										</p>
									</div>
								) : (
									<div>
										<Label htmlFor="csvData">Product Data (CSV File) *</Label>
										<Input
											id="csvData"
											type="file"
											accept=".csv"
											onChange={handleCSVChange}
											required={mode === "csv"}
										/>
										<p className="text-xs text-gray-500 mt-1">
											Upload a CSV file with headers matching the template. The
											sellerId will be automatically added.
										</p>
									</div>
								)}
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
									disabled={
										isSubmitting ||
										!selectedSellerId ||
										(mode === "json" ? !jsonData.trim() : !csvData.trim())
									}
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
