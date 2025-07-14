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
	Eye,
	Edit,
	Trash2,
	Upload,
	Download,
	MoreHorizontal,
} from "lucide-react";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddCouponPopup } from "@/components/AdminPanel/Popups/AddCouponPopup.jsx";
import { UpdateCouponPopup } from "@/components/AdminPanel/Popups/UpdateCouponPopup.jsx";

const coupons = [
	{
		id: "C001",
		campaignName: "May Coupons",
		code: "MAY25",
		discount: "50%",
		startDate: "24/05/2025",
		endDate: "24/05/2026",
		published: true,
		status: "Active",
	},
	{
		id: "C002",
		campaignName: "June Coupons",
		code: "JUN30",
		discount: "30%",
		startDate: "15/06/2025",
		endDate: "15/06/2026",
		published: true,
		status: "Active",
	},
	{
		id: "C003",
		campaignName: "July Coupons",
		code: "JUL15",
		discount: "15%",
		startDate: "10/07/2025",
		endDate: "10/07/2026",
		published: true,
		status: "Inactive",
	},
	{
		id: "C004",
		campaignName: "August Coupons",
		code: "AUG40",
		discount: "40%",
		startDate: "05/08/2025",
		endDate: "05/08/2026",
		published: true,
		status: "Active",
	},
	{
		id: "C005",
		campaignName: "September Coupons",
		code: "SEP20",
		discount: "20%",
		startDate: "01/09/2025",
		endDate: "01/09/2026",
		published: true,
		status: "Active",
	},
];

export default function CouponsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCoupons, setSelectedCoupons] = useState([]);
	const [deletePopup, setDeletePopup] = useState({
		open: false,
		coupon: null,
	});
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({
		open: false,
		coupon: null,
	});

	const handleSelectAll = (checked) => {
		if (checked) {
			setSelectedCoupons(coupons.map((coupon) => coupon.id));
		} else {
			setSelectedCoupons([]);
		}
	};

	const handleSelectCoupon = (couponId, checked) => {
		if (checked) {
			setSelectedCoupons([...selectedCoupons, couponId]);
		} else {
			setSelectedCoupons(selectedCoupons.filter((id) => id !== couponId));
		}
	};

	const handleDelete = (coupon) => {
		setDeletePopup({ open: true, coupon });
	};

	const handleUpdate = (coupon) => {
		setUpdatePopup({ open: true, coupon });
	};

	const confirmDelete = () => {
		console.log("Deleting coupon:", deletePopups.coupon?.campaignName);
	};

	const handleBulkDelete = () => {
		console.log("Bulk deleting coupons:", selectedCoupons);
	};

	const getStatusColor = (status) => {
		return status === "Active" ? "text-green-600" : "text-gray-500";
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
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

									{selectedCoupons.length > 0 && (
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
										placeholder="Search by Coupon"
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
											checked={selectedCoupons.length === coupons.length}
											onCheckedChange={handleSelectAll}
										/>
									</TableHead>
									<TableHead>Campaign Name</TableHead>
									<TableHead>Code</TableHead>
									<TableHead>Discount</TableHead>
									<TableHead>Start Date</TableHead>
									<TableHead>End Date</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{coupons.map((coupon, index) => (
									<motion.tr
										key={coupon.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<Checkbox
												checked={selectedCoupons.includes(coupon.id)}
												onCheckedChange={(checked) =>
													handleSelectCoupon(coupon.id, checked)
												}
											/>
										</TableCell>
										<TableCell className="font-medium">
											{coupon.campaignName}
										</TableCell>
										<TableCell className="font-medium">{coupon.code}</TableCell>
										<TableCell>{coupon.discount}</TableCell>
										<TableCell>{coupon.startDate}</TableCell>
										<TableCell>{coupon.endDate}</TableCell>
										<TableCell>
											<Switch checked={coupon.published} />
										</TableCell>
										<TableCell>
											<span className={getStatusColor(coupon.status)}>
												{coupon.status}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button size="icon" variant="outline">
													<Eye className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(coupon)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(coupon)}
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
				onOpenChange={(open) => setDeletePopup({ open, coupon: null })}
				itemName={deletePopup.coupon?.campaignName}
				onConfirm={confirmDelete}
			/>

			<AddCouponPopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateCouponPopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, coupon: null })}
				coupon={updatePopup.coupon}
			/>
		</>
	);
}
