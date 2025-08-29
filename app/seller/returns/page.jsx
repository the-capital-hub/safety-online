"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsSellerAuthenticated } from "@/store/sellerAuthStore";

const returnsData = [
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		refundTime: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 2,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		refundTime: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 2,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		refundTime: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		refundTime: "7 Days",
		status: "pending",
	},
	{
		id: "SB002",
		product: "Gloves Black",
		quantity: 2,
		price: "$15",
		location: "Chennai, Tamil Nadu, 6000",
		refundTime: "5 Days",
		status: "pending",
	},
	{
		id: "SB003",
		product: "Jacket Blue",
		quantity: 1,
		price: "$42",
		location: "Mumbai, Maharashtra, 4000",
		refundTime: "10 Days",
		status: "pending",
	},
	{
		id: "SB004",
		product: "Boots Black",
		quantity: 3,
		price: "$96",
		location: "Pune, Maharashtra, 4111",
		refundTime: "8 Days",
		status: "pending",
	},
	{
		id: "SB005",
		product: "Knee Pads Red",
		quantity: 4,
		price: "$29",
		location: "Hyderabad, Telangana, 5001",
		refundTime: "6 Days",
		status: "pending",
	},
	{
		id: "SB006",
		product: "Elbow Guards Green",
		quantity: 2,
		price: "$22",
		location: "Ahmedabad, Gujarat, 3800",
		refundTime: "4 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		refundTime: "7 Days",
		status: "pending",
	},
	{
		id: "SB001",
		product: "Helmet Yellow",
		quantity: 1,
		price: "$60",
		location: "Bengaluru, Karnataka, 5601",
		refundTime: "7 Days",
		status: "pending",
	},
];

export default function SellerReturnsPage() {
	const router = useRouter();
	const isAuthenticated = useIsSellerAuthenticated();

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/seller/login");
			return;
		}
	}, [isAuthenticated, router]);

	return (
		<div className="p-6">
			{/* Orders Return */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.1 }}
			>
				<Card className="bg-white border-0 shadow-sm">
					<div className="p-6 border-b">
						<div className="flex items-center space-x-2">
							<div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
								<RotateCcw className="w-3 h-3 text-orange-600" />
							</div>
							<h2 className="text-lg font-semibold text-gray-900">
								Orders return
							</h2>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Request ID
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Product Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Quantity
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Price
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Delivery Location
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Refund Time
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Action
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{returnsData.map((returnItem, index) => (
									<motion.tr
										key={`${returnItem.id}-${index}`}
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: index * 0.05 }}
										className="hover:bg-gray-50"
									>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											{returnItem.id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{returnItem.product}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{returnItem.quantity}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
											{returnItem.price}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{returnItem.location}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{returnItem.refundTime}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
											<Button
												size="sm"
												variant="outline"
												className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
											>
												Decline
											</Button>
											<Button
												size="sm"
												className="bg-blue-600 hover:bg-blue-700 text-white"
											>
												Refund
											</Button>
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
