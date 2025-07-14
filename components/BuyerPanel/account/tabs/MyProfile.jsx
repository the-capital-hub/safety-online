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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2 } from "lucide-react";

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

export function MyProfile() {
	return (
		<div className="space-y-6">
			{/* Personal Information */}
			<motion.div
				custom={0}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Personal Information</CardTitle>
						<CardDescription>
							Update your personal details and information
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="firstName">First Name</Label>
								<Input id="firstName" defaultValue="John" />
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last Name</Label>
								<Input id="lastName" defaultValue="Doe" />
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								defaultValue="john.doe@example.com"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="phone">Phone Number</Label>
							<Input id="phone" defaultValue="+1 (555) 123-4567" />
						</div>
						<div className="space-y-2">
							<Label htmlFor="bio">Bio</Label>
							<Textarea
								id="bio"
								placeholder="Tell us about yourself..."
								className="min-h-[100px]"
							/>
						</div>
						<Button>Save Changes</Button>
					</CardContent>
				</Card>
			</motion.div>

			{/* Addresses */}
			<motion.div
				custom={1}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div>
							<CardTitle>Addresses</CardTitle>
							<CardDescription>
								Manage your shipping and billing addresses
							</CardDescription>
						</div>
						<Button size="sm">
							<Plus className="h-4 w-4 mr-2" />
							Add Address
						</Button>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="border rounded-lg p-4">
								<div className="flex items-center justify-between mb-2">
									<div className="font-medium">Home Address</div>
									<div className="flex gap-2">
										<Button variant="ghost" size="sm">
											<Edit className="h-4 w-4" />
										</Button>
										<Button variant="ghost" size="sm">
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
								<div className="text-sm text-muted-foreground">
									123 Main Street, Apt 4B
									<br />
									New York, NY 10001
									<br />
									United States
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Language & Region */}
			<motion.div
				custom={2}
				initial="hidden"
				animate="visible"
				variants={cardVariants}
			>
				<Card>
					<CardHeader>
						<CardTitle>Language & Region</CardTitle>
						<CardDescription>
							Set your preferred language and region settings
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="language">Language</Label>
								<Select defaultValue="en">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="en">English</SelectItem>
										<SelectItem value="es">Spanish</SelectItem>
										<SelectItem value="fr">French</SelectItem>
										<SelectItem value="de">German</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="timezone">Timezone</Label>
								<Select defaultValue="est">
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="est">Eastern Time</SelectItem>
										<SelectItem value="pst">Pacific Time</SelectItem>
										<SelectItem value="cst">Central Time</SelectItem>
										<SelectItem value="mst">Mountain Time</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
						<Button>Save Preferences</Button>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
