"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Loader2, RefreshCw, Search, FileText } from "lucide-react";

export function ShipmentLogs() {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState({
		action: "",
		status: "",
		dateFrom: "",
		dateTo: "",
	});

	useEffect(() => {
		fetchLogs();
	}, []);

	const fetchLogs = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (filters.action) params.append("action", filters.action);
			if (filters.status) params.append("status", filters.status);
			if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
			if (filters.dateTo) params.append("dateTo", filters.dateTo);

			const response = await fetch(`/api/reports/shipment-logs?${params}`);
			const result = await response.json();

			if (result.success) {
				setLogs(result.logs);
			}
		} catch (error) {
			console.error("Failed to fetch logs:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (key, value) => {
		setFilters((prev) => ({ ...prev, [key]: value }));
	};

	const applyFilters = () => {
		fetchLogs();
	};

	const clearFilters = () => {
		setFilters({
			action: "",
			status: "",
			dateFrom: "",
			dateTo: "",
		});
		setTimeout(fetchLogs, 100);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString("en-IN", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getActionColor = (action) => {
		const colors = {
			created: "bg-green-100 text-green-800",
			status_update: "bg-blue-100 text-blue-800",
			tracking_request: "bg-purple-100 text-purple-800",
			error: "bg-red-100 text-red-800",
		};
		return colors[action] || "bg-gray-100 text-gray-800";
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						Shipment Logs
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Filters */}
					<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
						<div>
							<Label htmlFor="action">Action</Label>
							<Select
								value={filters.action}
								onValueChange={(value) => handleFilterChange("action", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="All actions" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All actions</SelectItem>
									<SelectItem value="created">Created</SelectItem>
									<SelectItem value="status_update">Status Update</SelectItem>
									<SelectItem value="tracking_request">
										Tracking Request
									</SelectItem>
									<SelectItem value="error">Error</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="status">Status</Label>
							<Select
								value={filters.status}
								onValueChange={(value) => handleFilterChange("status", value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="All statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All statuses</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="label_generated">
										Label Generated
									</SelectItem>
									<SelectItem value="picked_up">Picked Up</SelectItem>
									<SelectItem value="in_transit">In Transit</SelectItem>
									<SelectItem value="out_for_delivery">
										Out for Delivery
									</SelectItem>
									<SelectItem value="delivered">Delivered</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="dateFrom">From Date</Label>
							<Input
								id="dateFrom"
								type="date"
								value={filters.dateFrom}
								onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="dateTo">To Date</Label>
							<Input
								id="dateTo"
								type="date"
								value={filters.dateTo}
								onChange={(e) => handleFilterChange("dateTo", e.target.value)}
							/>
						</div>

						<div className="flex items-end gap-2">
							<Button onClick={applyFilters} disabled={loading}>
								<Search className="h-4 w-4 mr-2" />
								Filter
							</Button>
							<Button variant="outline" onClick={clearFilters}>
								Clear
							</Button>
						</div>
					</div>

					{/* Logs Table */}
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="h-8 w-8 animate-spin" />
							<span className="ml-2">Loading logs...</span>
						</div>
					) : (
						<div className="border rounded-lg">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Timestamp</TableHead>
										<TableHead>SubOrder ID</TableHead>
										<TableHead>Action</TableHead>
										<TableHead>Tracking ID</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Courier</TableHead>
										<TableHead>Details</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{logs.length === 0 ? (
										<TableRow>
											<TableCell colSpan={7} className="text-center py-8">
												No logs found
											</TableCell>
										</TableRow>
									) : (
										logs.map((log, index) => (
											<TableRow key={index}>
												<TableCell className="font-mono text-sm">
													{formatDate(log.timestamp)}
												</TableCell>
												<TableCell className="font-mono text-sm">
													{log.subOrderId?.slice(-8) || "N/A"}
												</TableCell>
												<TableCell>
													<Badge className={getActionColor(log.action)}>
														{log.action?.toUpperCase() || "UNKNOWN"}
													</Badge>
												</TableCell>
												<TableCell className="font-mono text-sm">
													{log.trackingId || "N/A"}
												</TableCell>
												<TableCell>
													<Badge variant="outline">
														{log.status?.toUpperCase() || "N/A"}
													</Badge>
												</TableCell>
												<TableCell>{log.courierPartner || "N/A"}</TableCell>
												<TableCell className="max-w-xs">
													<div className="text-sm space-y-1">
														{log.packageDetails?.weight && (
															<div>Weight: {log.packageDetails.weight}g</div>
														)}
														{log.packageDetails?.dimensions && (
															<div>Size: {log.packageDetails.dimensions}</div>
														)}
														{log.errorMessage && (
															<div className="text-red-600">
																Error: {log.errorMessage}
															</div>
														)}
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</div>
					)}

					{/* Refresh Button */}
					<div className="flex justify-end mt-4">
						<Button variant="outline" onClick={fetchLogs} disabled={loading}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

