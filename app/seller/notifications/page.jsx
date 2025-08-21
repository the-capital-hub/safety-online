"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, MoreHorizontal, Filter } from "lucide-react";

const notificationsData = [
	{
		id: 1,
		user: "Leslie Alexander",
		avatar: "/placeholder.svg?height=40&width=40",
		action: "Comment on",
		product: "Yellow Helmet",
		message: "Great work, I just purchased this product!",
		time: "Aug 15",
		type: "comment",
		hasReply: true,
	},
	{
		id: 2,
		user: "Annette Black",
		avatar: "/placeholder.svg?height=40&width=40",
		action: "Comment on",
		product: "Yellow Helmet",
		message: "Great work, I just purchased this product!",
		time: "Apr 17",
		type: "comment",
		hasReply: true,
		replyMessage: "Thanks, I'm glad you liked it! 😊",
	},
	{
		id: 3,
		user: "Jordan Smith",
		avatar: "/placeholder.svg?height=40&width=40",
		action: "I found this links Thanks for your help! 😊",
		product: "Red Backpack",
		time: "Aug 16",
		type: "message",
	},
	{
		id: 4,
		user: "Alex Johnson",
		avatar: "/placeholder.svg?height=40&width=40",
		action: "Can you send me the link again? I missed it!",
		product: "Blue Sneakers",
		time: "Aug 17",
		type: "message",
	},
	{
		id: 5,
		user: "Taylor Brown",
		avatar: "/placeholder.svg?height=40&width=40",
		action: "I encountered an error while downloading, can you assist?",
		product: "Green Jacket",
		time: "Aug 18",
		type: "message",
	},
	{
		id: 6,
		user: "Morgan Lee",
		avatar: "/placeholder.svg?height=40&width=40",
		action: "Thanks for the update! The link works perfectly now 😊",
		product: "Purple Scarf",
		time: "Aug 19",
		type: "message",
	},
];

const filterOptions = [
	{ label: "Comments", checked: true },
	{ label: "Review", checked: true },
	{ label: "Likes", checked: true },
	{ label: "Mentions", checked: false },
	{ label: "Purchases", checked: false },
	{ label: "Message", checked: false },
];

export default function SellerNotificationsPage() {
	const [filters, setFilters] = useState(filterOptions);
	const [replyingTo, setReplyingTo] = useState(null);

	const handleFilterChange = (index) => {
		setFilters((prev) =>
			prev.map((filter, i) =>
				i === index ? { ...filter, checked: !filter.checked } : filter
			)
		);
	};

	const handleSelectAll = () => {
		const allSelected = filters.every((f) => f.checked);
		setFilters((prev) =>
			prev.map((filter) => ({ ...filter, checked: !allSelected }))
		);
	};

	return (
		<div className="p-6">
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				{/* Main Notifications */}
				<div className="lg:col-span-3">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<Card className="bg-white border-0 shadow-sm">
							<div className="p-6 border-b">
								<div className="flex items-center justify-between">
									<h2 className="text-xl font-semibold text-gray-900">
										Notification
									</h2>
									<div className="flex items-center space-x-2">
										<Button variant="outline" size="sm">
											New
										</Button>
										<Button variant="outline" size="sm">
											All time
										</Button>
										<Button variant="ghost" size="sm">
											<MoreHorizontal className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</div>
							<div className="p-6">
								<div className="space-y-4">
									{notificationsData.map((notification, index) => (
										<motion.div
											key={notification.id}
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: index * 0.1 }}
											className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg"
										>
											<div className="flex-shrink-0">
												<img
													src={notification.avatar || "/placeholder.svg"}
													alt={notification.user}
													className="w-10 h-10 rounded-full"
												/>
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-center space-x-2 mb-1">
													<span className="font-medium text-gray-900">
														{notification.user}
													</span>
													<span className="text-sm text-gray-500">
														{notification.time}
													</span>
													<Badge className="bg-yellow-100 text-yellow-800">
														⭐
													</Badge>
												</div>

												<p className="text-sm text-gray-600 mb-2">
													{notification.action}{" "}
													<span className="font-medium text-blue-600">
														{notification.product}
													</span>
												</p>

												{notification.message && (
													<p className="text-sm text-gray-800 mb-2">
														"{notification.message}"
													</p>
												)}

												<div className="flex items-center space-x-4 text-sm text-gray-500">
													<button className="flex items-center space-x-1 hover:text-blue-600">
														<MessageSquare className="w-4 h-4" />
														<span>Reply</span>
													</button>
													<button className="flex items-center space-x-1 hover:text-red-600">
														<Heart className="w-4 h-4" />
														<span>Like</span>
													</button>
												</div>

												{notification.hasReply && notification.replyMessage && (
													<div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg">
														<div className="flex items-center space-x-2 mb-1">
															<div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
																<span className="text-white text-xs">A</span>
															</div>
															<span className="text-sm font-medium">
																Annette Black
															</span>
															<span className="text-xs text-gray-500">
																{notification.replyMessage}
															</span>
														</div>
														<div className="flex items-center space-x-2 mt-2">
															<Button size="sm" className="bg-black text-white">
																Reply
															</Button>
															<Button size="sm" variant="outline">
																Cancel
															</Button>
														</div>
													</div>
												)}
											</div>

											<div className="flex-shrink-0">
												{notification.product && (
													<div className="flex items-center space-x-2">
														<img
															src="/placeholder.svg?height=32&width=32"
															alt={notification.product}
															className="w-8 h-8 rounded"
														/>
														<div>
															<p className="text-sm font-medium text-gray-900">
																{notification.product}
															</p>
															<p className="text-xs text-gray-500">
																3D Product
															</p>
														</div>
													</div>
												)}
											</div>
										</motion.div>
									))}
								</div>

								<div className="mt-6 text-center">
									<Button variant="outline" size="sm">
										Load more
									</Button>
								</div>
							</div>
						</Card>
					</motion.div>
				</div>

				{/* Filter Sidebar */}
				<div className="lg:col-span-1">
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Card className="bg-white border-0 shadow-sm">
							<div className="p-6">
								<div className="flex items-center space-x-2 mb-6">
									<Filter className="w-5 h-5 text-gray-600" />
									<h3 className="font-semibold text-gray-900">Filter</h3>
								</div>

								<div className="space-y-4">
									{filters.map((filter, index) => (
										<div
											key={filter.label}
											className="flex items-center justify-between"
										>
											<span className="text-sm text-gray-700">
												{filter.label}
											</span>
											<Checkbox
												checked={filter.checked}
												onCheckedChange={() => handleFilterChange(index)}
											/>
										</div>
									))}
								</div>

								<div className="mt-6 pt-4 border-t">
									<div className="flex items-center justify-between mb-4">
										<Button
											variant="outline"
											size="sm"
											onClick={handleSelectAll}
										>
											Select all
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() =>
												setFilters(
													filters.map((filter) => ({
														...filter,
														checked: false,
													}))
												)
											}
										>
											Unselect all
										</Button>
									</div>
								</div>

								<div className="mt-6 pt-4 border-t">
									<h4 className="font-medium text-gray-900 mb-3">Customers</h4>
									<div className="space-y-2">
										<div className="flex items-center space-x-2">
											<input
												type="radio"
												name="customer"
												className="text-orange-500"
												defaultChecked
											/>
											<span className="text-sm text-gray-700">Everyone</span>
										</div>
									</div>
								</div>
							</div>
						</Card>
					</motion.div>
				</div>
			</div>
		</div>
	);
}
