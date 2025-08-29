"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Search,
	MoreHorizontal,
	Edit3,
	Share2,
	Trash2,
	ChevronLeft,
	ChevronRight,
	Eye,
	Heart,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore";

const productsData = [
	{
		id: 1,
		name: "Yellow Helmet",
		category: "3D Product",
		status: "Active",
		price: "$60",
		sales: "1,368",
		growth: "37.8%",
		views: 6,
		likes: 21,
		image: "/placeholder.svg?height=40&width=40",
	},
	{
		id: 2,
		name: "Yellow Helmet",
		category: "3D Product",
		status: "Active",
		price: "$60",
		sales: "1,368",
		growth: "37.8%",
		views: 12,
		likes: 1368,
		image: "/placeholder.svg?height=40&width=40",
	},
	{
		id: 3,
		name: "Yellow Helm",
		category: "3D Product",
		status: "Active",
		price: "$60",
		sales: "1,368",
		growth: "37.8%",
		views: 1368,
		likes: 62,
		image: "/placeholder.svg?height=40&width=40",
	},
	{
		id: 4,
		name: "Yellow Helmet",
		category: "3D Product",
		status: "Active",
		price: "$60",
		sales: "1,368",
		growth: "37.8%",
		views: 21,
		likes: 1368,
		image: "/placeholder.svg?height=40&width=40",
	},
	{
		id: 5,
		name: "Yellow Helmet",
		category: "3D Product",
		status: "Active",
		price: "$60",
		sales: "1,368",
		growth: "37.8%",
		views: 21,
		likes: 1368,
		image: "/placeholder.svg?height=40&width=40",
	},
	{
		id: 6,
		name: "Yellow Helmet",
		category: "3D Product",
		status: "Active",
		price: "$60",
		sales: "1,368",
		growth: "37.8%",
		views: 21,
		likes: 1368,
		image: "/placeholder.svg?height=40&width=40",
	},
	{
		id: 7,
		name: "Yellow Helmet",
		category: "Home Automation",
		status: "Active",
		price: "$78",
		sales: "1,045",
		growth: "32.1%",
		views: 18,
		likes: 1045,
		image: "/placeholder.svg?height=40&width=40",
	},
];

export default function SellerProductsPage() {
	const router = useRouter();
	const isAuthenticated = useIsSellerAuthenticated();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/seller/login");
			return;
		}
	}, [isAuthenticated, router]);

	const [selectedProducts, setSelectedProducts] = useState([]);

	const handleSelectProduct = (productId) => {
		setSelectedProducts((prev) =>
			prev.includes(productId)
				? prev.filter((id) => id !== productId)
				: [...prev, productId]
		);
	};

	const handleSelectAll = () => {
		if (selectedProducts.length === productsData.length) {
			setSelectedProducts([]);
		} else {
			setSelectedProducts(productsData.map((p) => p.id));
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Products List */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
			>
				<Card className="bg-white border-0 shadow-sm">
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900">Products</h2>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search product"
									className="pl-10 w-64 bg-gray-50 border-gray-200"
								/>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left">
										<Checkbox
											checked={selectedProducts.length === productsData.length}
											onCheckedChange={handleSelectAll}
										/>
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Price
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Sales
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Views
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Likes
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{productsData.map((product, index) => (
									<motion.tr
										key={product.id}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.05 }}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4">
											<Checkbox
												checked={selectedProducts.includes(product.id)}
												onCheckedChange={() => handleSelectProduct(product.id)}
											/>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-3">
												<img
													src={product.image || "/placeholder.svg"}
													alt={product.name}
													className="w-10 h-10 rounded-lg object-cover"
												/>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{product.name}
													</p>
													<p className="text-xs text-gray-500">
														{product.category}
													</p>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
												{product.status}
											</Badge>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{product.price}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<span className="text-sm font-medium text-gray-900">
													{product.sales}
												</span>
												<span className="text-xs text-green-600 font-medium">
													↗ {product.growth}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-1">
												<Eye className="w-4 h-4 text-gray-400" />
												<span className="text-sm text-gray-900">
													{product.views}
												</span>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="flex items-center space-x-2">
												<Heart className="w-4 h-4 text-red-400" />
												<span className="text-sm text-gray-900">
													{product.likes}
												</span>
												<div className="w-16 h-2 bg-blue-200 rounded-full">
													<div className="w-3/4 h-2 bg-blue-500 rounded-full"></div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button variant="ghost" size="sm">
														<MoreHorizontal className="w-4 h-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem>
														<Edit3 className="w-4 h-4 mr-2" />
														Edit title & description
													</DropdownMenuItem>
													<DropdownMenuItem>
														<Share2 className="w-4 h-4 mr-2" />
														Get shareable link
													</DropdownMenuItem>
													<DropdownMenuItem className="text-red-600">
														<Trash2 className="w-4 h-4 mr-2" />
														Delete forever
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</td>
									</motion.tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Pagination */}
					<div className="px-6 py-4 border-t flex items-center justify-center space-x-2">
						<Button variant="ghost" size="sm">
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<Button variant="ghost" size="sm">
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</Card>
			</motion.div>
		</div>
	);
}
