"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

// Dynamically import Recharts components (disable SSR)
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
	ssr: false,
});
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
	ssr: false,
});
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
	ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
	ssr: false,
});
const Tooltip = dynamic(() => import("recharts").then((mod) => mod.Tooltip), {
	ssr: false,
});
const ResponsiveContainer = dynamic(
	() => import("recharts").then((mod) => mod.ResponsiveContainer),
	{ ssr: false }
);

const Dashboard = () => {
	const paymentData = [
		{ name: "Jan", amount: 60 },
		{ name: "Feb", amount: 75 },
		{ name: "Mar", amount: 50 },
		{ name: "Apr", amount: 90 },
		{ name: "May", amount: 40 },
		{ name: "Jun", amount: 85 },
		{ name: "Jul", amount: 70 },
		{ name: "Aug", amount: 55 },
		{ name: "Sep", amount: 95 },
		{ name: "Oct", amount: 65 },
		{ name: "Nov", amount: 80 },
		{ name: "Dec", amount: 100 },
	];

	const orders = [
		{
			date: "01/04/2024",
			product: "ZithroMax Antibiotic",
			status: "In Transit",
			color: "text-blue-600",
		},
		{
			date: "02/04/2024",
			product: "Panadol Extra",
			status: "Pending",
			color: "text-yellow-600",
		},
		{
			date: "24/05/2024",
			product: "CiproCure 500mg",
			status: "Delivered",
			color: "text-green-600",
		},
		{
			date: "11/04/2024",
			product: "AmoxiHeal 250mg",
			status: "Delivered",
			color: "text-green-600",
		},
		{
			date: "23/05/2024",
			product: "ZithroMax Antibiotic",
			status: "Pending",
			color: "text-yellow-600",
		},
	];

	const getStatusColor = (status) => {
		switch (status) {
			case "Delivered":
				return "text-green-600";
			case "In Transit":
				return "text-blue-600";
			case "Pending":
				return "text-yellow-600";
			default:
				return "text-gray-600";
		}
	};

	return (
		<div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Top Stats */}
			<Card className="shadow rounded-2xl">
				<CardContent className="p-4">
					<p className="text-sm text-gray-500">Total Orders</p>
					<h2 className="text-3xl font-bold">400</h2>
					<p className="text-green-600 text-sm">▲ 10% vs last month</p>
				</CardContent>
			</Card>

			<Card className="shadow rounded-2xl">
				<CardContent className="p-4">
					<p className="text-sm text-gray-500">Total Sell</p>
					<h2 className="text-3xl font-bold">₹42.5L</h2>
					<p className="text-red-600 text-sm">▼ 5% vs last month</p>
				</CardContent>
			</Card>

			<Card className="shadow rounded-2xl">
				<CardContent className="p-4">
					<p className="text-sm text-gray-500">Total Products</p>
					<h2 className="text-3xl font-bold">452</h2>
					<p className="text-green-600 text-sm">▲ 23 vs last month</p>
				</CardContent>
			</Card>

			{/* Payment Summary */}
			<Card className="shadow rounded-2xl col-span-full">
				<CardContent className="p-4">
					<div className="flex justify-between mb-4">
						<h3 className="text-lg font-semibold">Payment Summary</h3>
						<button className="text-sm font-medium">Paid</button>
					</div>
					<div className="w-full h-80">
						{" "}
						{/* bigger height */}
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={paymentData}>
								<XAxis dataKey="name" />
								<YAxis />
								<Tooltip />
								<Bar dataKey="amount" fill="#fbbf24" radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</CardContent>
			</Card>

			{/* Order Summary */}
			<Card className="shadow rounded-2xl col-span-1 lg:col-span-3">
				<CardContent className="p-6">
					<h3 className="text-lg font-semibold mb-6">Order Summary</h3>
					<div className="space-y-6">
						{/* Pending Orders */}
						<div>
							<div className="flex justify-between items-end mb-2">
								<div>
									<p className="text-sm font-medium">Pending Orders</p>
									<p className="text-xl text-black-500">40%</p>
								</div>
								<p className="text-sm font-medium">160/400 Orders</p>
							</div>
							<Progress
								value={40}
								className="h-2"
								indicatorClassName="bg-yellow-500"
							/>
						</div>

						{/* Shipped Orders */}
						<div>
							<div className="flex justify-between items-end mb-2">
								<div>
									<p className="text-sm font-medium">Shipped Orders</p>
									<p className="text-xl text-black-500">30%</p>
								</div>
								<p className="text-sm font-medium">120/400 Orders</p>
							</div>
							<Progress
								value={30}
								className="h-2"
								indicatorClassName="bg-purple-500"
							/>
						</div>

						{/* Delivered Orders */}
						<div>
							<div className="flex justify-between items-end mb-2">
								<div>
									<p className="text-sm font-medium">Delivered Orders</p>
									<p className="text-xl text-black-500">40%</p>
								</div>
								<p className="text-sm font-medium">160/400 Orders</p>
							</div>
							<Progress
								value={70}
								className="h-2"
								indicatorClassName="bg-green-500"
							/>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Review Orders */}
			<Card className="shadow rounded-2xl w-full col-span-full">
				<CardContent className="p-6">
					<h3 className="text-lg font-semibold mb-6">Review Orders</h3>
					<ul className="space-y-4">
						{orders.map((order, index) => (
							<li
								key={index}
								className="flex justify-between items-center text-sm"
							>
								<span>
									{order.date} - {order.product}
								</span>

								{order.status === "Pending" ? (
									<div className="flex space-x-2">
										<Button
											size="sm"
											className="bg-green-500 hover:bg-green-600 text-white"
										>
											Accept
										</Button>
										<Button
											size="sm"
											className="bg-red-500 hover:bg-red-600 text-white"
										>
											Reject
										</Button>
									</div>
								) : (
									<span className={getStatusColor(order.status)}>
										{order.status}
									</span>
								)}
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
};

export default Dashboard;
