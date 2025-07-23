"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ToggleField({ label, checked, onToggle }) {
	return (
		<div className="flex items-center justify-between">
			<Label>{label}</Label>
			<Switch checked={checked} onCheckedChange={onToggle} />
		</div>
	);
}
