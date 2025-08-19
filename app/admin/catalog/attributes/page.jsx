"use client";

import { useState, useEffect } from "react";
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
import { AddAttributePopup } from "@/components/AdminPanel/Popups/AddAttributePopup.jsx";
import { UpdateAttributePopup } from "@/components/AdminPanel/Popups/UpdateAttributePopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

const attributes = [
	{
		id: "OC3473",
		name: "Helmet",
		displayName: "Yellow",
		option: "Dropdown",
		published: true,
	},
	{
		id: "OC3474",
		name: "Gloves",
		displayName: "Red",
		option: "Checkbox",
		published: true,
	},
	{
		id: "OC3475",
		name: "Jacket",
		displayName: "Blue",
		option: "Radio Button",
		published: true,
	},
	{
		id: "OC3476",
		name: "Pants",
		displayName: "Black",
		option: "Input",
		published: true,
	},
	{
		id: "OC3477",
		name: "Boots",
		displayName: "Brown",
		option: "Dropdown",
		published: true,
	},
	{
		id: "OC3478",
		name: "Mask",
		displayName: "Green",
		option: "Checkbox",
		published: true,
	},
	{
		id: "OC3479",
		name: "Goggles",
		displayName: "Transparent",
		option: "Radio Button",
		published: true,
	},
	{
		id: "OC3480",
		name: "Knee Pads",
		displayName: "Gray",
		option: "Input",
		published: true,
	},
	{
		id: "OC3481",
		name: "Elbow Pads",
		displayName: "Orange",
		option: "Dropdown",
		published: true,
	},
	{
		id: "OC3482",
		name: "Backpack",
		displayName: "Purple",
		option: "Checkbox",
		published: true,
	},
	{
		id: "OC3483",
		name: "Water Bottle",
		displayName: "Cyan",
		option: "Radio Button",
		published: true,
	},
];

export default function AttributesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedAttributes, setSelectedAttributes] = useState([]);
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		attribute: null,
	});
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		attribute: null,
	});
	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedAttributes(attributes.map((attribute) => attribute.id));
		} else {
			setSelectedAttributes([]);
		}
	};

	const handleSelectAttribute = (attributeId, checked) => {
		if (checked) {
			setSelectedAttributes([...selectedAttributes, attributeId]);
		} else {
			setSelectedAttributes(
				selectedAttributes.filter((id) => id !== attributeId)
			);
		}
	};

	const handleDelete = (attribute) => {
		setDeletePopup({ open: true, attribute });
	};

	const handleUpdate = (attribute) => {
		setUpdatePopup({ open: true, attribute });
	};

	const confirmDelete = () => {
		console.log("Deleting attribute:", deletePopup.attribute?.name);
	};

	const handleBulkDelete = () => {
		console.log("Bulk deleting attributes:", selectedAttributes);
	};

	useEffect(() => {
		if (!isAuthenticated) {
			setIsRedirecting(true);
			const timer = setTimeout(() => {
				router.push("/admin/login");
			}, 3);
			
			return () => clearTimeout(timer);
		}
	}, [isAuthenticated, router]);

	// Show redirecting message if not authenticated
	if (!isAuthenticated) {
		return (
			<div className="flex items-center justify-center py-4 px-6 bg-white">
				<div className="text-gray-600">Redirecting to login...</div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Attributes</h1>
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

									{selectedAttributes.length > 0 && (
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
										placeholder="Search by Attributes"
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
											checked={selectedAttributes.length === attributes.length}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead>ID</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>Display Name</TableHead>
									<TableHead>Option</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{attributes.map((attribute, index) => (
									<motion.tr
										key={attribute.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<Checkbox
												checked={selectedAttributes.includes(attribute.id)}
												onCheckedChange={(checked) =>
													handleSelectAttribute(attribute.id, checked)
												}
											/>
										</TableCell>
										<TableCell className="font-medium">
											{attribute.id}
										</TableCell>
										<TableCell className="font-medium">
											{attribute.name}
										</TableCell>
										<TableCell>{attribute.displayName}</TableCell>
										<TableCell>{attribute.option}</TableCell>
										<TableCell>
											<Switch checked={attribute.published} />
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(attribute)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(attribute)}
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
				onOpenChange={(open) => setDeletePopup({ open, attribute: null })}
				itemName={deletePopup.attribute?.name}
				onConfirm={confirmDelete}
			/>

			<AddAttributePopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateAttributePopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, attribute: null })}
				attribute={updatePopup.attribute}
			/>
		</>
	);
}
