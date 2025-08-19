"use client";

import { useState,useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Search, Plus, Filter, RotateCcw, Edit, Trash2 } from "lucide-react";
import { DeletePopup } from "@/components/AdminPanel/Popups/DeletePopup.jsx";
import { AddStaffPopup } from "@/components/AdminPanel/Popups/AddStaffPopup.jsx";
import { UpdateStaffPopup } from "@/components/AdminPanel/Popups/UpdateStaffPopup.jsx";
import { useIsAuthenticated } from "@/store/adminAuthStore.js";
import { useRouter } from "next/navigation";

const staff = [
	{
		id: "S001",
		name: "Karthik Kumar",
		email: "karthikkumar@gmail.com",
		contact: "+91 9876765234",
		joiningDate: "24/05/2025",
		role: "Admin",
		published: true,
		status: "Active",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S002",
		name: "Priya Sharma",
		email: "priyasharma@example.com",
		contact: "+91 9876543210",
		joiningDate: "12/08/2024",
		role: "User",
		published: true,
		status: "Active",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S003",
		name: "Rajesh Gupta",
		email: "rajeshgupta@example.com",
		contact: "+91 8765432109",
		joiningDate: "30/09/2023",
		role: "Moderator",
		published: true,
		status: "Inactive",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S004",
		name: "Sneha Mehta",
		email: "snehamehta@example.com",
		contact: "+91 7654321098",
		joiningDate: "17/06/2023",
		role: "User",
		published: true,
		status: "Active",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S005",
		name: "Vikram Singh",
		email: "vikramsingh@example.com",
		contact: "+91 6543210987",
		joiningDate: "01/01/2025",
		role: "Admin",
		published: true,
		status: "Active",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S006",
		name: "Anjali Verma",
		email: "anjaliverma@example.com",
		contact: "+91 5432109876",
		joiningDate: "15/07/2024",
		role: "User",
		published: true,
		status: "Inactive",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S007",
		name: "Rohan Joshi",
		email: "rohanjoshi@example.com",
		contact: "+91 4321098765",
		joiningDate: "20/11/2023",
		role: "Moderator",
		published: true,
		status: "Active",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S008",
		name: "Neha Bansal",
		email: "nehabansal@example.com",
		contact: "+91 3210987654",
		joiningDate: "05/03/2025",
		role: "User",
		published: true,
		status: "Active",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S009",
		name: "Suresh Rao",
		email: "sureshrao@example.com",
		contact: "+91 2109876543",
		joiningDate: "22/04/2024",
		role: "Admin",
		published: true,
		status: "Active",
		avatar: "/placeholder.svg?height=40&width=40",
	},
	{
		id: "S010",
		name: "Tanya Kapoor",
		email: "tanyakapoor@example.com",
		contact: "+91 1098765432",
		joiningDate: "28/02/2023",
		role: "User",
		published: true,
		status: "Inactive",
		avatar: "/placeholder.svg?height=40&width=40",
	},
];

export default function StaffPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState("all");
	const [deletePopup, setDeletePopup] = useState({ open: false, staff: null });
	const [addPopup, setAddPopup] = useState(false);
	const [updatePopup, setUpdatePopup] = useState({ open: false, staff: null });
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

	const handleDelete = (staffMember) => {
		setDeletePopup({ open: true, staff: staffMember });
	};

	const handleUpdate = (staffMember) => {
		setUpdatePopup({ open: true, staff: staffMember });
	};

	const confirmDelete = () => {
		console.log("Deleting staff:", deletePopup.staff?.name);
		setDeletePopup({ open: false, staff: null });
	};

	const getRoleColor = (role) => {
		switch (role.toLowerCase()) {
			case "admin":
				return "bg-red-100 text-red-800";
			case "manager":
				return "bg-blue-100 text-blue-800";
			case "moderator":
				return "bg-purple-100 text-purple-800";
			case "user":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getStatusColor = (status) => {
		return status === "Active" ? "text-green-600" : "text-gray-500";
	};

	// Filter staff based on search query and role filter
	const filteredStaff = staff.filter((member) => {
		const matchesSearch =
			member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			member.email.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesRole =
			roleFilter === "all" || member.role.toLowerCase() === roleFilter;
		return matchesSearch && matchesRole;
	});

	const handleReset = () => {
		setSearchQuery("");
		setRoleFilter("all");
	};

	return (
		<>
			<div className="space-y-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3 }}
				>
					<h1 className="text-3xl font-bold text-gray-900">Our Staff</h1>
				</motion.div>

				<Card>
					<CardHeader>
						<div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
							<div className="flex gap-4 items-center">
								<div className="relative">
									<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
									<Input
										placeholder="Search by names"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-10 w-64"
									/>
								</div>

								<Select value={roleFilter} onValueChange={setRoleFilter}>
									<SelectTrigger className="w-32">
										<SelectValue placeholder="Staff role" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Roles</SelectItem>
										<SelectItem value="admin">Admin</SelectItem>
										<SelectItem value="manager">Manager</SelectItem>
										<SelectItem value="moderator">Moderator</SelectItem>
										<SelectItem value="user">User</SelectItem>
									</SelectContent>
								</Select>

								<Button className="bg-green-600 hover:bg-green-700">
									<Filter className="w-4 h-4 mr-2" />
									Filter
								</Button>

								<Button variant="outline" onClick={handleReset}>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</Button>
							</div>

							<Button
								onClick={() => setAddPopup(true)}
								className="bg-green-600 hover:bg-green-700"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Staff
							</Button>
						</div>
					</CardHeader>

					<CardContent>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Email</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Joining Date</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Published</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredStaff.map((member, index) => (
									<motion.tr
										key={member.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.2, delay: index * 0.05 }}
									>
										<TableCell>
											<div className="flex items-center gap-3">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={member.avatar || "/placeholder.svg"}
													/>
													<AvatarFallback>
														{member.name
															.split(" ")
															.map((n) => n[0])
															.join("")}
													</AvatarFallback>
												</Avatar>
												<span className="font-medium">{member.name}</span>
											</div>
										</TableCell>
										<TableCell className="text-sm text-gray-600">
											{member.email}
										</TableCell>
										<TableCell className="text-sm">{member.contact}</TableCell>
										<TableCell className="text-sm">
											{member.joiningDate}
										</TableCell>
										<TableCell>
											<Badge className={getRoleColor(member.role)}>
												{member.role}
											</Badge>
										</TableCell>
										<TableCell>
											<Switch checked={member.published} />
										</TableCell>
										<TableCell>
											<span className={getStatusColor(member.status)}>
												{member.status}
											</span>
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="outline"
													onClick={() => handleUpdate(member)}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="outline"
													className="text-red-600 hover:text-red-700 bg-transparent"
													onClick={() => handleDelete(member)}
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
							<p className="text-sm text-gray-600">
								Showing {filteredStaff.length} of {staff.length} staff members
							</p>
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
				onOpenChange={(open) => setDeletePopup({ open, staff: null })}
				itemName={deletePopup.staff?.name}
				onConfirm={confirmDelete}
			/>

			<AddStaffPopup open={addPopup} onOpenChange={setAddPopup} />

			<UpdateStaffPopup
				open={updatePopup.open}
				onOpenChange={(open) => setUpdatePopup({ open, staff: null })}
				staffData={updatePopup.staff}
			/>
		</>
	);
}
