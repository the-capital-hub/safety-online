"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SectionCard({ title, children, onUpdate, isUpdating = false }) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between">
				<CardTitle>{title}</CardTitle>
				<Button
					onClick={onUpdate}
					disabled={isUpdating}
					className="bg-green-600 hover:bg-green-700"
					size="sm"
				>
					{isUpdating ? "Updating..." : "Update"}
				</Button>
			</CardHeader>
			<CardContent className="space-y-4">{children}</CardContent>
		</Card>
	);
}
