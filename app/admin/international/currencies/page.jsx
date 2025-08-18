"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, Edit, MoreHorizontal } from "lucide-react";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddCurrencyPopup } from "@/components/AdminPanel/Popups/AddCurrencyPopup.jsx";
import { UpdateCurrencyPopup } from "@/components/AdminPanel/Popups/UpdateCurrencyPopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

const currencies = [
	{
		id: 1,
		name: "Dollar",
		symbol: "$",
		published: true,
	},
	{
		id: 2,
		name: "Euro",
		symbol: "€",
		published: true,
	},
	{
		id: 3,
		name: "Pound",
		symbol: "£",
		published: true,
	},
	{
		id: 4,
		name: "Yen",
		symbol: "¥",
		published: true,
	},
];

export default function CurrenciesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		currency: null,
	});
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		currency: null,
	});
	const isAuthenticated = useIsAuthenticated();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const router = useRouter();


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

	const handleDelete = (currency) => {
		setDeletePopup({ open: true, currency });
	};

	const handleUpdate = (currency) => {
		setUpdatePopup({ open: true, currency });
	};

	const confirmDelete = () => {
		console.log("Deleting currency:", deletePopup.currency?.name);
	};

	const handlePublishToggle = (currencyId, published) => {
		console.log("Toggling publish status for currency:", currencyId, published);
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Currencies</h1>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
							<div className="flex gap-4 items-center">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search by country/language"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 w-64"
									/>
								</div>

								<Button
									variant="outline"
									className="text-blue-600 border-blue-600 bg-transparent"
								>
									<MoreHorizontal className="w-4 h-4 mr-2" />
									Bulk Action
								</Button>

								<Button
									variant="destructive"
									className="bg-red-600 hover:bg-red-700"
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete
								</Button>
							</div>

							<Button
								onClick={() => setAddPopup(true)}
								className="bg-green-600 hover:bg-green-700"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Currencies
							</Button>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Symbol</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{currencies.map((currency, index) => (
									<motion.tr
										key={currency.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell className="font-medium">
											{currency.name}
										</TableCell>
										<TableCell className="font-medium text-lg">
											{currency.symbol}
										</TableCell>
										<TableCell>
											<Switch
												checked={currency.published}
												onCheckedChange={(checked) =>
													handlePublishToggle(currency.id, checked)
												}
											/>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(currency)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(currency)}
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
				onOpenChange={(open) => setDeletePopup({ open, currency: null })}
				itemName={deletePopup.currency?.name}
				onConfirm={confirmDelete}
			/>

			<AddCurrencyPopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateCurrencyPopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, currency: null })}
				currency={updatePopup.currency}
			/>
		</>
	);
}
