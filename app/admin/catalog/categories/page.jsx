"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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
	Edit,
	Trash2,
	Upload,
	Download,
	MoreHorizontal,
} from "lucide-react";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddCategoryPopup } from "@/components/AdminPanel/Popups/AddCategoryPopup.jsx";
import { UpdateCategoryPopup } from "@/components/AdminPanel/Popups/UpdateCategoryPopup.jsx";

const categories = [
	{
		id: "OC3473",
		name: "Helmet",
		description: "Helmet",
		icon: "🛡️",
		published: true,
	},
	{
		id: "OC3474",
		name: "Gloves",
		description: "Protective Gloves",
		icon: "🧤",
		published: true,
	},
	{
		id: "OC3475",
		name: "Goggles",
		description: "Safety Goggles",
		icon: "🥽",
		published: true,
	},
	{
		id: "OC3476",
		name: "Boots",
		description: "Steel-Toed Boots",
		icon: "🥾",
		published: true,
	},
	{
		id: "OC3477",
		name: "Vest",
		description: "Reflective Vest",
		icon: "🦺",
		published: true,
	},
	{
		id: "OC3478",
		name: "Mask",
		description: "Dust Mask",
		icon: "😷",
		published: true,
	},
	{
		id: "OC3479",
		name: "Knee Pads",
		description: "Protective Knee Pads",
		icon: "🦵",
		published: true,
	},
	{
		id: "OC3480",
		name: "Ear Protection",
		description: "Ear Muffs",
		icon: "🎧",
		published: true,
	},
	{
		id: "OC3481",
		name: "Apron",
		description: "Work Apron",
		icon: "👘",
		published: true,
	},
	{
		id: "OC3482",
		name: "Harness",
		description: "Safety Harness",
		icon: "🪢",
		published: true,
	},
];

export default function CategoriesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		category: null,
	});
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		category: null,
	});

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedCategories(categories.map((category) => category.id));
		} else {
			setSelectedCategories([]);
		}
	};

	const handleSelectCategory = (categoryId, checked) => {
		if (checked) {
			setSelectedCategories([...selectedCategories, categoryId]);
		} else {
			setSelectedCategories(
				selectedCategories.filter((id) => id !== categoryId)
			);
		}
	};

	const handleDelete = (category) => {
		setDeletePopup({ open: true, category });
	};

	const handleUpdate = (category) => {
		setUpdatePopup({ open: true, category });
	};

	const confirmDelete = () => {
		console.log("Deleting category:", deletePopups.category?.name);
	};

	const handleBulkDelete = () => {
		console.log("Bulk deleting categories:", selectedCategories);
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Categories</h1>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col gap-4">
							{/* Export/Import Row */}
							<div className="flex flex-wrap gap-4 items-center justify-between">
								<div className="flex gap-4 items-center">
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

									<Button
										variant="outline"
										className="text-blue-600 border-blue-600 bg-transparent"
									>
										<MoreHorizontal className="w-4 h-4 mr-2" />
										Bulk Action
									</Button>

									{selectedCategories.length > 0 && (
										<Button
											variant="destructive"
											onClick={handleBulkDelete}
											className="bg-red-600 hover:bg-red-700"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete
										</Button>
									)}
								</div>

								<Button
									onClick={() => setAddPopup(true)}
									className="bg-green-600 hover:bg-green-700"
								>
									<Plus className="w-4 h-4 mr-2" />
									Add Product
								</Button>
							</div>

							{/* Search and Filter Row */}
							<div className="flex gap-4 items-center">
								<div className="relative flex-1 max-w-md">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search by category name"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10"
									/>
								</div>

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
											checked={selectedCategories.length === categories.length}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Icon</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Description</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categories.map((category, index) => (
									<motion.tr
										key={category.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<Checkbox
												checked={selectedCategories.includes(category.id)}
												onCheckedChange={(checked) =>
													handleSelectCategory(category.id, checked)
												}
											/>
										</TableCell>
										<TableCell className="font-medium">{category.id}</TableCell>
										<TableCell>
											<div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
												S
											</div>
										</TableCell>
										<TableCell className="font-medium">
											{category.name}
										</TableCell>
										<TableCell className="text-gray-600">
											{category.description}
										</TableCell>
										<TableCell>
											<Switch checked={category.published} />
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(category)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(category)}
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
				open={deletePopup.open}
				onOpenChange={(open) => setDeletePopup({ open, category: null })}
				itemName={deletePopup.category?.name}
				onConfirm={confirmDelete}
			/>

			<AddCategoryPopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateCategoryPopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, category: null })}
				category={updatePopup.category}
			/>
		</>
	);
}
