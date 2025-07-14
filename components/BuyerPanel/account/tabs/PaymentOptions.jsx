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
import { Badge } from "@/components/ui/badge";
import {
	CreditCard,
	Wallet,
	Smartphone,
	Plus,
	Edit,
	Trash2,
	Star,
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

const paymentMethods = [
	{
		id: 1,
		type: "card",
		name: "Visa ending in 4242",
		details: "Expires 12/25",
		isDefault: true,
	},
	{
		id: 2,
		type: "card",
		name: "Mastercard ending in 8888",
		details: "Expires 08/26",
		isDefault: false,
	},
];

const wallets = [
	{
		id: 1,
		name: "PayPal",
		email: "john.doe@example.com",
		isConnected: true,
	},
	{
		id: 2,
		name: "Apple Pay",
		email: "Connected",
		isConnected: true,
	},
];

const upiMethods = [
	{
		id: 1,
		upiId: "john.doe@paytm",
		isVerified: true,
	},
	{
		id: 2,
		upiId: "johndoe@gpay",
		isVerified: true,
	},
];

export function PaymentOptions() {
	return (
		<div className="space-y-6">
			{/* Credit/Debit Cards */}
			<motion.div
				custom={0}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<CreditCard className="h-5 w-5" />
								Credit & Debit Cards
							</CardTitle>
							<CardDescription>Manage your saved payment cards</CardDescription>
						</div>
						<Button size="sm">
							<Plus className="h-4 w-4 mr-2" />
							Add Card
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{paymentMethods.map((method) => (
								<div key={method.id} className="border rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<CreditCard className="h-5 w-5 text-muted-foreground" />
											<div>
												<div className="font-medium flex items-center gap-2">
													{method.name}
													{method.isDefault && (
														<Badge variant="secondary" className="text-xs">
															<Star className="h-3 w-3 mr-1" />
															Default
														</Badge>
													)}
												</div>
												<div className="text-sm text-muted-foreground">
													{method.details}
												</div>
											</div>
										</div>
										<div className="flex gap-2">
											<Button variant="ghost" size="sm">
												<Edit className="h-4 w-4" />
											</Button>
											<Button variant="ghost" size="sm">
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Digital Wallets */}
			<motion.div
				custom={1}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Wallet className="h-5 w-5" />
								Digital Wallets
							</CardTitle>
							<CardDescription>
								Connect your digital wallet accounts
							</CardDescription>
						</div>
						<Button size="sm">
							<Plus className="h-4 w-4 mr-2" />
							Connect Wallet
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{wallets.map((wallet) => (
								<div key={wallet.id} className="border rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Wallet className="h-5 w-5 text-muted-foreground" />
											<div>
												<div className="font-medium">{wallet.name}</div>
												<div className="text-sm text-muted-foreground">
													{wallet.email}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-green-600">
												Connected
											</Badge>
											<Button variant="ghost" size="sm">
												Disconnect
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* UPI Methods */}
			<motion.div
				custom={2}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Smartphone className="h-5 w-5" />
								UPI Methods
							</CardTitle>
							<CardDescription>Manage your UPI payment methods</CardDescription>
						</div>
						<Button size="sm">
							<Plus className="h-4 w-4 mr-2" />
							Add UPI
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{upiMethods.map((upi) => (
								<div key={upi.id} className="border rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<Smartphone className="h-5 w-5 text-muted-foreground" />
											<div>
												<div className="font-medium">{upi.upiId}</div>
												<div className="text-sm text-muted-foreground">
													UPI ID
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Badge variant="outline" className="text-green-600">
												Verified
											</Badge>
											<Button variant="ghost" size="sm">
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
