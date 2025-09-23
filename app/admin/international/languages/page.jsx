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
import { Search, Plus, Trash2, Edit, Eye, MoreHorizontal } from "lucide-react";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddLanguagePopup } from "@/components/AdminPanel/Popups/AddLanguagePopup.jsx";
import { UpdateLanguagePopup } from "@/components/AdminPanel/Popups/UpdateLanguagePopup.jsx";
import { BulkUpdateLanguagesPopup } from "@/components/AdminPanel/Popups/BulkUpdateLanguagesPopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

const languages = [
	{
		id: 1,
		name: "Hindi",
		isoCode: "HI",
		flag: "🇮🇳",
		published: true,
	},
	{
		id: 2,
		name: "Bangla",
		isoCode: "Bn",
		flag: "🇧🇩",
		published: true,
	},
	{
		id: 3,
		name: "English",
		isoCode: "En",
		flag: "🇬🇧",
		published: true,
	},
	{
		id: 4,
		name: "Spanish",
		isoCode: "Es",
		flag: "🇪🇸",
		published: true,
	},
	{
		id: 5,
		name: "French",
		isoCode: "Fr",
		flag: "🇫🇷",
		published: true,
	},
	{
		id: 6,
		name: "German",
		isoCode: "De",
		flag: "🇩🇪",
		published: true,
	},
	{
		id: 7,
		name: "Chinese",
		isoCode: "Zh",
		flag: "🇨🇳",
		published: true,
	},
];

export default function LanguagesPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedLanguages, setSelectedLanguages] = useState([]);
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		language: null,
	});
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		language: null,
	});
	const [bulkUpdatePopup, setBulkUpdatePopup] = useState(false);
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

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedLanguages(languages.map((lang) => lang.id));
		} else {
			setSelectedLanguages([]);
		}
	};

	const handleSelectLanguage = (languageId, checked) => {
		if (checked) {
			setSelectedLanguages([...selectedLanguages, languageId]);
		} else {
			setSelectedLanguages(selectedLanguages.filter((id) => id !== languageId));
		}
	};

	const handleDelete = (language) => {
		setDeletePopup({ open: true, language });
	};

	const handleUpdate = (language) => {
		setUpdatePopup({ open: true, language });
	};

	const confirmDelete = () => {
		console.log("Deleting language:", deletePopup.language?.name);
	};

	const handleBulkDelete = () => {
		console.log("Bulk deleting languages:", selectedLanguages);
	};

	const handlePublishToggle = (languageId, published) => {
		console.log("Toggling publish status for language:", languageId, published);
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Languages</h1>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
							<div className="flex gap-4 items-center">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input name="searchQuery"
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

								{selectedLanguages.length > 0 && (
									<>
										<Button
											variant="destructive"
											onClick={handleBulkDelete}
											className="bg-red-600 hover:bg-red-700"
										>
											<Trash2 className="w-4 h-4 mr-2" />
											Delete
										</Button>
										<Button
											onClick={() => setBulkUpdatePopup(true)}
											className="bg-orange-500 hover:bg-orange-600"
										>
											Update
										</Button>
									</>
								)}
							</div>

							<Button
								onClick={() => setAddPopup(true)}
								className="bg-green-600 hover:bg-green-700"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Language
							</Button>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">
										<Checkbox
											checked={selectedLanguages.length === languages.length}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead>SR</TableHead>
									<TableHead>Name</TableHead>
									<TableHead>ISO Code</TableHead>
									<TableHead>Flag</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{languages.map((language, index) => (
									<motion.tr
										key={language.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<Checkbox
												checked={selectedLanguages.includes(language.id)}
												onCheckedChange={(checked) =>
													handleSelectLanguage(language.id, checked)
												}
											/>
										</TableCell>
										<TableCell className="font-medium">{index + 1}</TableCell>
										<TableCell className="font-medium">
											{language.name}
										</TableCell>
										<TableCell>{language.isoCode}</TableCell>
										<TableCell>
											<div className="w-8 h-6 rounded border flex items-center justify-center text-lg">
												{language.flag}
											</div>
										</TableCell>
										<TableCell>
											<Switch
												checked={language.published}
												onCheckedChange={(checked) =>
													handlePublishToggle(language.id, checked)
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
													onClick={() => handleUpdate(language)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(language)}
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
				onOpenChange={(open) => setDeletePopup({ open, language: null })}
				itemName={deletePopup.language?.name}
				onConfirm={confirmDelete}
			/>

			<AddLanguagePopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateLanguagePopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, language: null })}
				language={updatePopup.language}
			/>

			<BulkUpdateLanguagesPopup
				open={bulkUpdatePopup}
				onOpenChange={setBulkUpdatePopup}
				selectedCount={selectedLanguages.length}
			/>
		</>
	);
}
