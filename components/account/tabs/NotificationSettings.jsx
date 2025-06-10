"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
	Bell,
	Mail,
	MessageSquare,
	Smartphone,
	ShoppingCart,
	CreditCard,
} from "lucide-react";

const cardVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: (i) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * 0.1,
			duration: 0.5,
		},
	}),
};

const notificationCategories = [
	{
		title: "Order Updates",
		description: "Get notified about your order status",
		icon: ShoppingCart,
		settings: [
			{
				id: "order-placed",
				label: "Order Placed",
				email: true,
				push: true,
				sms: false,
			},
			{
				id: "order-shipped",
				label: "Order Shipped",
				email: true,
				push: true,
				sms: true,
			},
			{
				id: "order-delivered",
				label: "Order Delivered",
				email: true,
				push: true,
				sms: false,
			},
		],
	},
	{
		title: "Payment & Billing",
		description: "Payment confirmations and billing updates",
		icon: CreditCard,
		settings: [
			{
				id: "payment-success",
				label: "Payment Successful",
				email: true,
				push: true,
				sms: false,
			},
			{
				id: "payment-failed",
				label: "Payment Failed",
				email: true,
				push: true,
				sms: true,
			},
			{
				id: "refund-processed",
				label: "Refund Processed",
				email: true,
				push: false,
				sms: false,
			},
		],
	},
	{
		title: "Marketing & Promotions",
		description: "Deals, offers, and promotional content",
		icon: Bell,
		settings: [
			{
				id: "weekly-deals",
				label: "Weekly Deals",
				email: false,
				push: false,
				sms: false,
			},
			{
				id: "flash-sales",
				label: "Flash Sales",
				email: true,
				push: true,
				sms: false,
			},
			{
				id: "personalized-offers",
				label: "Personalized Offers",
				email: true,
				push: false,
				sms: false,
			},
		],
	},
];

export function NotificationSettings() {
	return (
		<div className="space-y-6">
			{/* Notification Channels */}
			<motion.div
				custom={0}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Notification Channels</CardTitle>
						<CardDescription>
							Choose how you want to receive notifications
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Mail className="h-5 w-5 text-muted-foreground" />
									<div>
										<Label className="text-base">Email Notifications</Label>
										<div className="text-sm text-muted-foreground">
											john.doe@example.com
										</div>
									</div>
								</div>
								<Switch defaultChecked />
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<Smartphone className="h-5 w-5 text-muted-foreground" />
									<div>
										<Label className="text-base">Push Notifications</Label>
										<div className="text-sm text-muted-foreground">
											Browser and mobile app notifications
										</div>
									</div>
								</div>
								<Switch defaultChecked />
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<MessageSquare className="h-5 w-5 text-muted-foreground" />
									<div>
										<Label className="text-base">SMS Notifications</Label>
										<div className="text-sm text-muted-foreground">
											+1 (555) 123-4567
										</div>
									</div>
								</div>
								<Switch />
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Notification Categories */}
			{notificationCategories.map((category, categoryIndex) => (
				<motion.div
					key={category.title}
					custom={categoryIndex + 1}
					initial="hidden"
					animate="visible"
					variants={cardVariants}
				>
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<category.icon className="h-5 w-5" />
								{category.title}
							</CardTitle>
							<CardDescription>{category.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
									<div>Notification Type</div>
									<div className="text-center">Email</div>
									<div className="text-center">Push</div>
									<div className="text-center">SMS</div>
								</div>

								{category.settings.map((setting) => (
									<div
										key={setting.id}
										className="grid grid-cols-4 gap-4 items-center"
									>
										<div className="font-medium">{setting.label}</div>
										<div className="flex justify-center">
											<Switch defaultChecked={setting.email} />
										</div>
										<div className="flex justify-center">
											<Switch defaultChecked={setting.push} />
										</div>
										<div className="flex justify-center">
											<Switch defaultChecked={setting.sms} />
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}

			{/* Save Button */}
			<motion.div
				custom={notificationCategories.length + 1}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
				className="flex justify-end"
			>
				<Button size="lg">Save Notification Settings</Button>
			</motion.div>
		</div>
	);
}
