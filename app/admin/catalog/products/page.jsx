"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Search,
	Plus,
	Filter,
	RotateCcw,
	Eye,
	Edit,
	Trash2,
	Upload,
	Download,
	FileText,
} from "lucide-react";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddProductPopup } from "@/components/AdminPanel/Popups/AddProductPopup.jsx";
import { UpdateProductPopup } from "@/components/AdminPanel/Popups/UpdateProductPopup.jsx";
import { BulkUpdateProductsPopup } from "@/components/AdminPanel/Popups/BulkUpdateProductsPopuup.jsx";

const products = [
	{
		id: "P001",
		name: "Helmet yellow",
		category: "Hardware",
		price: "$450.00",
		salePrice: "$450.00",
		stocks: 5555,
		status: "Selling",
		published: true,
	},
	{
		id: "P002",
		name: "Gloves red",
		category: "Apparel",
		price: "$120.00",
		salePrice: "$120.00",
		stocks: 6666,
		status: "Selling",
		published: true,
	},
	{
		id: "P003",
		name: "Boots black",
		category: "Footwear",
		price: "$300.50",
		salePrice: "$300.50",
		stocks: 7777,
		status: "Selling",
		published: true,
	},
	{
		id: "P004",
		name: "Goggles blue",
		category: "Accessory",
		price: "$80.75",
		salePrice: "$80.75",
		stocks: 8888,
		status: "Selling",
		published: true,
	},
	{
		id: "P005",
		name: "Jacket green",
		category: "Outerwear",
		price: "$200.00",
		salePrice: "$200.00",
		stocks: 9999,
		status: "Selling",
		published: true,
	},
	{
		id: "P006",
		name: "Knee pads",
		category: "Protection",
		price: "$65.50",
		salePrice: "$65.50",
		stocks: 1010,
		status: "Selling",
		published: true,
	},
	{
		id: "P007",
		name: "Backpack orange",
		category: "Gear",
		price: "$150.00",
		salePrice: "$150.00",
		stocks: 1111,
		status: "Selling",
		published: true,
	},
	{
		id: "P008",
		name: "Socks white",
		category: "Apparel",
		price: "$15.00",
		salePrice: "$15.00",
		stocks: 1212,
		status: "Selling",
		published: true,
	},
];

export default function ProductsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [priceFilter, setPriceFilter] = useState("all");
	const [selectedProducts, setSelectedProducts] = useState([]);
	const [deletePopups, setDeletePopups] = useState({
		open: false,
		product: null,
	});
	const [addPopups, setAddPopups] = useState(false);
	const [updatePopups, setUpdatePopups] = useState({
		open: false,
		product: null,
	});
	const [bulkUpdatePopups, setBulkUpdatePopups] = useState(false);

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedProducts(products.map((product) => product.id));
		} else {
			setSelectedProducts([]);
		}
	};

	const handleSelectProduct = (productId, checked) => {
		if (checked) {
			setSelectedProducts([...selectedProducts, productId]);
		} else {
			setSelectedProducts(selectedProducts.filter((id) => id !== productId));
		}
	};

	const handleDelete = (product) => {
		setDeletePopups({ open: true, product });
	};

	const handleUpdate = (product) => {
		setUpdatePopups({ open: true, product });
	};

	const confirmDelete = () => {
		console.log("Deleting product:", deletePopups.product?.name);
	};

	const handleBulkDelete = () => {
		console.log("Bulk deleting products:", selectedProducts);
	};

	const handlePublishToggle = (productId, published) => {
		console.log("Toggling publish status for product:", productId, published);
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Products</h1>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col gap-4">
							{/* Export/Import Row */}
							<div className="flex flex-wrap gap-4 items-center">
								<Button
									variant="outline"
									className="text-orange-600 border-orange-600 bg-transparent"
								>
									<Upload className="w-4 h-4 mr-2" />
									Export
								</Button>

								<Button variant="outline">
									<Download className="w-4 h-4 mr-2" />
									Import
								</Button>

								<div className="border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2">
									<FileText className="w-4 h-4 text-gray-400" />
									<span className="text-sm text-gray-600">
										Select your JSON Product file
									</span>
								</div>

								<Button className="bg-green-600 hover:bg-green-700">
									<Plus className="w-4 h-4 mr-2" />
									Import Now
								</Button>

								<Button
									variant="outline"
									className="text-blue-600 border-blue-600 bg-transparent"
								>
									Bulk Action
								</Button>

								{selectedProducts.length > 0 && (
									<Button
										variant="destructive"
										onClick={handleBulkDelete}
										className="bg-red-600 hover:bg-red-700"
									>
										<Trash2 className="w-4 h-4 mr-2" />
										Delete
									</Button>
								)}

								<Button
									onClick={() => setAddPopups(true)}
									className="bg-green-600 hover:bg-green-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Product
								</Button>
							</div>

							{/* Export Options Row */}
							<div className="flex gap-4 items-center">
								<Button
									variant="outline"
									className="text-blue-600 bg-transparent"
								>
									<Download className="w-4 h-4 mr-2" />
									Export to CSV
								</Button>
								<Button
									variant="outline"
									className="text-green-600 bg-transparent"
								>
									<Download className="w-4 h-4 mr-2" />
									Export to JSON
								</Button>
							</div>

							{/* Search and Filter Row */}
							<div className="flex gap-4 items-center">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10"
									/>
								</div>

								<Select
									value={categoryFilter}
									onValueChange={setCategoryFilter}
								>
									<SelectTrigger className="w-40">
										<SelectValue placeholder="Category" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Categories</SelectItem>
										<SelectItem value="hardware">Hardware</SelectItem>
										<SelectItem value="apparel">Apparel</SelectItem>
										<SelectItem value="footwear">Footwear</SelectItem>
										<SelectItem value="accessory">Accessory</SelectItem>
									</SelectContent>
								</Select>

								<Select value={priceFilter} onValueChange={setPriceFilter}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Price" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Prices</SelectItem>
										<SelectItem value="low">Under $50</SelectItem>
										<SelectItem value="medium">$50 - $200</SelectItem>
										<SelectItem value="high">Over $200</SelectItem>
									</SelectContent>
								</Select>

								<Button className="bg-green-600 hover:bg-green-700">
									<Filter className="w-4 h-4 mr-2" />
									Filter
								</Button>

								<Button variant="outline">
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={selectedProducts.length === products.length}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead>Product Name</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Price</TableHead>
									<TableHead>Sale Price</TableHead>
									<TableHead>Stocks</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{products.map((product, index) => (
									<motion.tr
										key={product.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<Checkbox
												checked={selectedProducts.includes(product.id)}
												onCheckedChange={(checked) =>
													handleSelectProduct(product.id, checked)
												}
											/>
										</TableCell>
										<TableCell className="font-medium">
											{product.name}
										</TableCell>
										<TableCell>{product.category}</TableCell>
										<TableCell className="font-medium">
											{product.price}
										</TableCell>
										<TableCell className="font-medium">
											{product.salePrice}
										</TableCell>
										<TableCell>{product.stocks}</TableCell>
										<TableCell>
											<Badge className="bg-green-100 text-green-800">
												{product.status}
											</Badge>
										</TableCell>
										<TableCell>
											<Switch
												checked={product.published}
												onCheckedChange={(checked) =>
													handlePublishToggle(product.id, checked)
												}
											/>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button size="icon" variant="outline">
													<Eye className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(product)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(product)}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</TableCell>
									</motion.tr>
								))}
							</TableBody>
						</Table>

						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-gray-600">Showing 1-2 of 2</p>
							<div className="flex gap-2">
								<Button variant="outline" size="sm">
									Previous
								</Button>
								<Button size="sm" className="bg-black text-white">
									1
								</Button>
								<Button variant="outline" size="sm">
									2
								</Button>
								<Button variant="outline" size="sm">
									3
								</Button>
								<Button variant="outline" size="sm">
									4
								</Button>
								<Button variant="outline" size="sm">
									Next
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			<DeletePopup
				open={deletePopups.open}
				onOpenChange={(open) => setDeletePopups({ open, product: null })}
				itemName={deletePopups.product?.name}
				onConfirm={confirmDelete}
			/>

			<AddProductPopup open={addPopups} onOpenChange={setAddPopups} />

			<UpdateProductPopup
				open={updatePopups.open}
				onOpenChange={(open) => setUpdatePopups({ open, product: null })}
				product={updatePopups.product}
			/>

			<BulkUpdateProductsPopup
				open={bulkUpdatePopups}
				onOpenChange={setBulkUpdatePopups}
				selectedCount={selectedProducts.length}
			/>
		</>
	);
}
