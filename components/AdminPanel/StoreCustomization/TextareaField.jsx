"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function TextareaField({
	label,
	value,
	onChange,
	placeholder,
	rows = 3,
	id,
}) {
	return (
		<div>
			<Label htmlFor={id}>{label}</Label>
			<Textarea
				id={id}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="mt-1"
				rows={rows}
			/>
		</div>
	);
}
