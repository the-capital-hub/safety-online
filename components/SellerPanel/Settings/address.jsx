"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { addressSchema } from "@/zodSchema/companyScema.js";

export default function CompanyAddresses() {
	const [addresses, setAddresses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editingIndex, setEditingIndex] = useState(-1);
	const [draft, setDraft] = useState({
		tagName: "",
		building: "",
		street: "",
		city: "",
		state: "",
		pincode: "",
		country: "",
	});

	const resetDraft = () =>
		setDraft({
			tagName: "",
			building: "",
			street: "",
			city: "",
			state: "",
			pincode: "",
			country: "",
		});

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch("/api/seller/company/getCompany", {
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					if (mounted) setAddresses(data?.company?.companyAddress || []);
				}
			} catch (e) {
				// noop
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const startAdd = () => {
		resetDraft();
		setEditingIndex(addresses.length);
	};

	const startEdit = (i) => {
		setDraft(addresses[i]);
		setEditingIndex(i);
	};

	const cancelEdit = () => {
		resetDraft();
		setEditingIndex(-1);
	};

	const removeAddress = async (i) => {
		const next = addresses.filter((_, idx) => idx !== i);
		try {
			const res = await fetch("/api/seller/company/updateCompany", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ companyAddress: next }),
			});
			if (!res.ok) throw new Error("Failed to remove address");
			setAddresses(next);
			toast.success("Address removed");
		} catch (err) {
			toast.error(err.message);
		}
	};

	const saveDraft = async () => {
		const parsed = addressSchema.safeParse(draft);
		if (!parsed.success) {
			toast.error(parsed.error.errors[0].message);
			return;
		}
		const next = [...addresses];
		next[editingIndex] = parsed.data;
		try {
			const res = await fetch("/api/seller/company/updateCompany", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ companyAddress: next }),
			});
			if (!res.ok) throw new Error("Failed to save address");
			setAddresses(next);
			toast.success(
				editingIndex >= addresses.length ? "Address added" : "Address updated"
			);
			cancelEdit();
		} catch (err) {
			toast.error(err.message);
		}
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Company Addresses</CardTitle>
					<CardDescription>Loading addresses…</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="border border-gray-200">
			<CardHeader className="flex-row items-center justify-between">
				<div>
					<CardTitle>Company Addresses</CardTitle>
					<CardDescription>
						Add or update your company addresses
					</CardDescription>
				</div>
				<Button onClick={startAdd} variant="secondary" size="sm">
					<Plus className="h-4 w-4 mr-1" /> Add address
				</Button>
			</CardHeader>
			<CardContent className="space-y-5">
				{editingIndex !== -1 && (
					<div className="rounded-lg border p-4 grid gap-3">
						{[
							{ label: "Tag", name: "tagName", placeholder: "Head Office" },
							{
								label: "Building",
								name: "building",
								placeholder: "Building / Suite",
							},
							{ label: "Street", name: "street", placeholder: "Street" },
							{ label: "City", name: "city", placeholder: "City" },
							{ label: "State", name: "state", placeholder: "State" },
							{ label: "Pincode", name: "pincode", placeholder: "Pincode" },
							{ label: "Country", name: "country", placeholder: "Country" },
						].map((f) => (
							<div key={f.name} className="grid gap-1">
								<Label htmlFor={f.name}>{f.label}</Label>
								<Input
									id={f.name}
									value={draft[f.name] || ""}
									onChange={(e) =>
										setDraft((d) => ({ ...d, [f.name]: e.target.value }))
									}
									placeholder={f.placeholder}
								/>
							</div>
						))}
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={cancelEdit}>
								<X className="mr-1 h-4 w-4" /> Cancel
							</Button>
							<Button onClick={saveDraft}>
								<Save className="mr-1 h-4 w-4" /> Save
							</Button>
						</div>
					</div>
				)}

				{addresses.length === 0 ? (
					<p className="text-sm text-gray-500">No addresses added yet.</p>
				) : (
					<div className="grid gap-3">
						{addresses.map((addr, idx) => (
							<div
								key={idx}
								className="rounded-lg border p-4 flex items-start justify-between"
							>
								<div className="text-sm">
									<p className="font-medium text-gray-900">{addr.tagName}</p>
									<p className="text-gray-700">
										{addr.building}, {addr.street}
									</p>
									<p className="text-gray-700">
										{addr.city}, {addr.state} {addr.pincode}
									</p>
									<p className="text-gray-700">{addr.country}</p>
								</div>
								<div className="flex gap-2">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => startEdit(idx)}
										aria-label="Edit"
									>
										<Pencil className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => removeAddress(idx)}
										aria-label="Delete"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
