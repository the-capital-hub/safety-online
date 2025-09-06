"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Dynamically import Recharts components (disable SSR)
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
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
    { name: "1-30 days", amount: 60 },
    { name: "31-60 days", amount: 60 },
    { name: "61-90 days", amount: 40 },
  ];

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
      <Card className="shadow rounded-2xl col-span-1 lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">Payment Summary</h3>
            <button className="text-sm font-medium">Upcoming</button>
          </div>
          <div className="w-full h-52">
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

      {/* Review Orders */}
      <Card className="shadow rounded-2xl col-span-1 lg:col-span-2">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Review Orders</h3>
          <ul className="space-y-4">
            <li className="flex justify-between text-sm">
              <span>01/04/2024 - ZithroMax Antibiotic</span>
              <span className="text-blue-600">In Transit</span>
            </li>
            <li className="flex justify-between text-sm">
              <span>02/04/2024 - Panadol Extra</span>
              <span className="text-yellow-600">Pending</span>
            </li>
            <li className="flex justify-between text-sm">
              <span>24/05/2024 - CiproCure 500mg</span>
              <span className="text-green-600">Delivered</span>
            </li>
            <li className="flex justify-between text-sm">
              <span>11/04/2024 - AmoxiHeal 250mg</span>
              <span className="text-green-600">Delivered</span>
            </li>
            <li className="flex justify-between text-sm">
              <span>23/05/2024 - ZithroMax Antibiotic</span>
              <span className="text-yellow-600">Pending</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card className="shadow rounded-2xl col-span-1 lg:col-span-3">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
          <div className="space-y-6">
            <div>
              <p className="text-sm mb-2">Pending Orders 40% (160/400)</p>
              <Progress value={40} className="h-2 bg-gray-200" />
            </div>
            <div>
              <p className="text-sm mb-2">Shipped Orders 30% (120/400)</p>
              <Progress value={30} className="h-2 bg-purple-500" />
            </div>
            <div>
              <p className="text-sm mb-2">Delivered Orders 30% (120/400)</p>
              <Progress value={30} className="h-2 bg-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
